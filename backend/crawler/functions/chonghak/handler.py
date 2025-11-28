#!/usr/bin/env python3
"""
총학생회 공지사항 크롤러 Lambda 함수
총학생회 공지사항을 크롤링하여 ICS 파일을 생성하고 S3에 업로드합니다.
"""

import os
import time
import re
from datetime import datetime
from typing import List, Dict
import tempfile

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service

from common.logger import setup_logger, log_crawler_start, log_crawler_complete, log_execution_metrics
from common.date_utils import get_date_filter_range, get_datetime_from_text
from common.ics_builder import create_event, split_long_duration_event, create_calendar_from_events, serialize_calendar
from common.s3_utils import upload_ics
from common.config import CHONGHAK_CONFIG, S3_BUCKET

logger = setup_logger(__name__)


def setup_driver(unique_tmp_dir) -> webdriver.Chrome:
    """
    Selenium WebDriver를 설정합니다 (Lambda 환경용).

    Returns:
        설정된 Chrome WebDriver
    """
    chrome_options = Options()
    
    # 1. 바이너리 위치 (Dockerfile에서 /usr/bin/google-chrome으로 심볼릭 링크를 걸어둠)
    chrome_options.binary_location = "/usr/bin/google-chrome"
    
    # 2. 필수 옵션 (Crash 방지)
    chrome_options.add_argument('--headless=new') 
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-gpu-sandbox')
    chrome_options.add_argument('--single-process') # Chrome for Testing에서는 다시 켜보는 것도 방법 (메모리 절약)

    
    # 3. 화면 설정 (렌더링 에러 방지)
    chrome_options.add_argument('--window-size=1280,1280')
    chrome_options.add_argument('--hide-scrollbars')
    chrome_options.add_argument('--enable-logging')
    chrome_options.add_argument('--v=1')
    
    # 4. 데이터 경로 격리 (tempfile 사용)
    chrome_options.add_argument(f'--user-data-dir={unique_tmp_dir}/user-data')
    chrome_options.add_argument(f'--data-path={unique_tmp_dir}/data-path')
    chrome_options.add_argument(f'--disk-cache-dir={unique_tmp_dir}/cache-dir')
    chrome_options.add_argument(f'--homedir={unique_tmp_dir}') # 홈 디렉토리도 임시로 지정
    
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    # 5. 드라이버 서비스 (로그 남기기 기능 추가)
    # 크롬이 죽으면 /tmp/chromedriver.log에 이유가 적힙니다.
    service = Service(
        executable_path="/usr/bin/chromedriver",
        log_path='/tmp/chromedriver.log' 
    )
    
    try:
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    except Exception as e:
        # 크롬 실행 실패 시, 로그 파일을 읽어서 출력 (디버깅용)
        print(f"!!! Chrome Init Failed: {e}")
        try:
            with open('/tmp/chromedriver.log', 'r') as f:
                print(f"--- ChromeDriver Log ---\n{f.read()}\n------------------------")
        except:
            print("No chromedriver log found.")
        raise e


def parse_title(title: str) -> str:
    """
    제목에서 불필요한 문자를 제거하고 핵심만 추출합니다.

    Args:
        title: 원본 제목 문자열

    Returns:
        정제된 제목
    """
    keywords_to_remove = ["안내", "공개", "접수", "신청", "모집", "선발", "관련", "알림", "참가자"]

    cleaned_title = title
    for keyword in keywords_to_remove:
        cleaned_title = cleaned_title.replace(keyword, "")

    # 학년도/학기 패턴 제거
    cleaned_title = re.sub(r'\d{4}-\d{1}학기', '', cleaned_title)
    cleaned_title = re.sub(r'\d{4}학년도\s*', '', cleaned_title)
    cleaned_title = re.sub(r'제?\d+학기\s*', '', cleaned_title)
    cleaned_title = re.sub(r'\d{4}년도?\s*', '', cleaned_title)
    cleaned_title = re.sub(r'\d{4}\s+', '', cleaned_title)

    # 특수문자 제거
    cleaned_title = re.sub(r'[\[\]\(\)\{\}【】]', '', cleaned_title)

    # 여러 공백을 하나로 통합
    cleaned_title = re.sub(r'\s+', ' ', cleaned_title)

    return cleaned_title.strip()


def get_category_from_title(title: str) -> str:
    """
    제목에서 카테고리를 추출합니다.

    Args:
        title: 제목 문자열

    Returns:
        "SCHOLARSHIP" 또는 "EVENT"
    """
    return "SCHOLARSHIP" if "장학" in title else "EVENT"


def is_keyword_matched(title: str, keywords: List[str]) -> bool:
    """
    제목에 키워드가 포함되어 있는지 확인합니다.

    Args:
        title: 제목 문자열
        keywords: 필터링 키워드 리스트

    Returns:
        키워드 포함 여부
    """
    return any(keyword in title for keyword in keywords)


def extract_date_info(article: WebElement) -> datetime | tuple[datetime, datetime] | None:
    """
    게시물에서 날짜 정보를 추출합니다.

    Args:
        article: WebElement 객체

    Returns:
        datetime 객체
    """
    tag_selectors = ["p"]
    all_contents = []

    for tag in tag_selectors:
        elements = article.find_elements(By.TAG_NAME, tag)
        all_contents.extend(elements)

    # 태그가 없을 경우 article 전체 텍스트 확인
    if len(all_contents) == 0:
        article_text = article.text
        return get_datetime_from_text(article_text)

    # 각 요소에서 패턴 매칭
    for content in all_contents:
        content_text = content.text.strip()
        if not content_text or len(content_text) < 5:
            continue

        result = get_datetime_from_text(content_text)
        if result:
            return result

    return None


def crawl_page(driver: webdriver.Chrome, page_url: str) -> List[Dict]:
    """
    단일 페이지를 크롤링하여 데이터를 추출합니다.

    Args:
        driver: Selenium WebDriver
        page_url: 크롤링할 페이지 URL
        keywords: 필터링 키워드

    Returns:
        추출된 데이터 리스트
    """
    try:
        driver.get(page_url)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "a[href^='/notice/']"))
        )
    except Exception as e:
        logger.error(f"페이지 로드 실패 ({page_url}): {e}")
        return []

    # 1단계: 키워드가 포함된 게시물 수집
    items = driver.find_elements(By.CSS_SELECTOR, "a[href^='/notice/']")
    articles_to_crawl = []

    for item in items:
        try:
            title_element = item.find_element(By.TAG_NAME, "h1")
            title = title_element.text

            if title:
                url = item.get_attribute('href')
                articles_to_crawl.append({"title": title, "url": url})
        except Exception as e:
            logger.debug(f"게시물 제목 추출 실패: {e}")
            continue

    logger.info(f"  키워드 매칭 게시물: {len(articles_to_crawl)}개")

    # 2단계: 각 게시물에서 날짜 추출
    data = []
    for article_info in articles_to_crawl:
        title = article_info["title"]
        url = article_info["url"]

        try:
            driver.get(url)
            wait = WebDriverWait(driver, 10)
            wait.until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, "article > section > div > section"))
            )

            article = driver.find_element(By.CSS_SELECTOR, "article > section")

            date = extract_date_info(article)

            if date:
                parsed_title = parse_title(title)
                data.append({"title": parsed_title, "date": date, "url": url})
                logger.info(f"  ✓ {parsed_title}")
            else:
                logger.info(f"  ✗ 날짜 미발견: {title}")

        except Exception as e:
            logger.info(f"  ✗ 게시물 처리 실패 ({title}): {e}")
            continue

    return data

def create_events_from_data(data_list: List[Dict]) -> List:
    """
    크롤링 데이터를 ICS 이벤트로 변환합니다.

    Args:
        data_list: 크롤링 데이터 리스트

    Returns:
        Event 객체 리스트
    """
    events = []

    for data in data_list:
        title = data.get('title')
        date = data.get('date')
        url = data.get('url')

        if not date:
            continue

        category = get_category_from_title(title)

        if isinstance(date, tuple):
            event = split_long_duration_event(
            title=title,
            start_date=date[0],
            end_date=date[1],
            categories=[category],
            url=url,
            )
            events.extend(event)
        if isinstance(date, datetime):
            event = create_event(
                title=title,
                start_date=date,
                categories=[category],
                url=url,
            )
            events.append(event)


    return events


def lambda_handler(event, context):
    """
    AWS Lambda 핸들러 함수

    Args:
        event: Lambda 이벤트 객체
        context: Lambda 컨텍스트 객체

    Returns:
        실행 결과 딕셔너리
    """
    start_time = time.time()

    log_crawler_start(logger, CHONGHAK_CONFIG.name, CHONGHAK_CONFIG.url)



    # 페이지 크롤링 (1페이지)
    all_data = []
    base_url = CHONGHAK_CONFIG.url
    page_num = 1

    current_tmp_dir = tempfile.mkdtemp(prefix=f'chrome-page{page_num}-')
    driver = None
    try:
        # Selenium 드라이버 설정
        driver = setup_driver(current_tmp_dir)
        page_url = f"{base_url}&page={page_num}"
        logger.info(f"페이지 {page_num} 크롤링 중...")

        page_data = crawl_page(driver, page_url)
        all_data.extend(page_data)

        logger.info(f"페이지 {page_num} 완료: {len(page_data)}개 항목")
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"크롤링 실패: {e}", exc_info=True)

        return {
            'statusCode': 500,
            'body': {
                'crawler': CHONGHAK_CONFIG.name,
                'error': str(e),
                'duration_seconds': round(duration, 2)
            }
        }

    finally:
        if driver:
            driver.quit()

    # 이벤트 생성
    events = create_events_from_data(all_data)

    # Calendar 생성
    calendar = create_calendar_from_events(events)
    ics_content = serialize_calendar(calendar)

    # S3 업로드
    bucket = os.environ.get('S3_BUCKET', S3_BUCKET)
    s3_key = CHONGHAK_CONFIG.output_key

    upload_result = upload_ics(ics_content, bucket, s3_key)

    if not upload_result.get('success'):
        raise Exception(f"S3 업로드 실패: {upload_result.get('error')}")

    duration = time.time() - start_time

    log_crawler_complete(logger, CHONGHAK_CONFIG.name, len(events), duration)
    log_execution_metrics(logger, CHONGHAK_CONFIG.name, duration, len(events), s3_key)

    return {
        'statusCode': 200,
        'body': {
            'crawler': CHONGHAK_CONFIG.name,
            'events_count': len(events),
            'articles_found': len(all_data),
            'duration_seconds': round(duration, 2),
            's3_bucket': bucket,
            's3_key': s3_key,
            'file_size': upload_result.get('size')
        }
    }



# 로컬 테스트용
if __name__ == "__main__":
    result = lambda_handler({}, None)
    print(result)
