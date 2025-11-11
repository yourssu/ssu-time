from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from typing import List, Dict
import time
import re
from ics import Calendar, Event
from datetime import datetime

# 검색 키워드
keywords = ["예비군", "장학", "특식", "개강", "주차"]

# 날짜 매핑 패턴 (메타데이터 포함)
date_patterns = [
    # 범위 패턴 (시간 있음)
    {
        "pattern": r'\d{4}년\s*(\d{1,2})월\s*(\d{1,2})일\s*\([월화수목금토일]\)\s*(\d{1,2}):(\d{2})\s*~\s*(\d{1,2})월\s*(\d{1,2})일\s*\([월화수목금토일]\)\s*(\d{1,2}):(\d{2})',
        "type": "range_with_time",
        "desc": "2025년 11월 3일(월) 09:00 ~ 11월 16일(일) 17:00"
    },
    {
        "pattern": r'\d{4}\.(\d{1,2})\.(\d{1,2})\.\([월화수목금토일]\)\s*(\d{1,2}):(\d{2})\s*~\s*\d{4}\.(\d{1,2})\.(\d{1,2})\.\([월화수목금토일]\)\s*(\d{1,2}):(\d{2})',
        "type": "range_with_time",
        "desc": "2025.08.13.(수) 09:00 ~ 2025.09.10.(수) 18:00"
    },

    # 단일 패턴 (시간 있음)
    {
        "pattern": r'\d{4}년\s*(\d{1,2})월\s*(\d{1,2})일\s*\[월화수목금토일]\\s*(\d{1,2}):(\d{2})',
        "type": "single_with_time",
        "desc": "2025년 11월 3일(월) 09:00"
    },
    {
        "pattern": r'\d{4}\.(\d{1,2})\.(\d{1,2})\.\([월화수목금토일]\)\s*(\d{1,2}):(\d{2})',
        "type": "single_with_time",
        "desc": "2025.08.13.(수) 09:00"
    },
    {
        "pattern": r'\d{4}-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})',
        "type": "single_with_time",
        "desc": "2025-08-04 10:00"
    },
    {
        "pattern": r'(\d{1,2})월\s*(\d{1,2})일\s*\([월화수목금토일]\)\s*(\d{1,2}):(\d{2})',
        "type": "single_with_time",
        "desc": "11월 3일(월) 09:00"
    },

    # 단일 패턴 (시간 없음)
    {
        "pattern": r'\d{4}년\s*(\d{1,2})월\s*(\d{1,2})일\s*\([월화수목금토일]\)',
        "type": "single_no_time",
        "desc": "2025년 11월 3일(월)"
    },
    {
        "pattern": r'\d{4}\.(\d{1,2})\.(\d{1,2})',
        "type": "single_no_time",
        "desc": "2025.11.03"
    },
    {
        "pattern": r'\d{1,2}\.\s*(\d{1,2})\.\s*(\d{1,2})',
        "type": "single_no_time",
        "desc": "25.03.02"
    },
]

def setup_driver() -> webdriver.Chrome:
    """
    Selenium WebDriver를 설정합니다.

    Returns:
        설정된 Chrome WebDriver
    """
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # 브라우저 창 숨기기
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')

    driver = webdriver.Chrome(options=chrome_options)
    return driver

def fetch_page(driver: webdriver.Chrome, url: str, wait_time: int = 3) -> str:
    """
    동적 웹페이지를 가져옵니다.

    Args:
        driver: Selenium WebDriver
        url: 크롤링할 URL
        wait_time: 페이지 로딩 대기 시간 (초)

    Returns:
        렌더링된 HTML 문자열
    """
    try:
        driver.get(url)

        # JavaScript 렌더링이 완료될 때까지 대기
        # TODO: 실제 페이지의 특정 요소가 로드될 때까지 대기하도록 수정
        # 예: WebDriverWait(driver, wait_time).until(
        #     EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr"))
        # )
        time.sleep(wait_time)  # 임시 대기 (나중에 명시적 대기로 교체 권장)

        return driver
    
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def extract_data(driver: webdriver.Chrome) -> List[Dict]:
    """
    파싱된 HTML에서 데이터를 추출합니다.

    Args:
        driver: Selenium WebDriver

    Returns:
        추출된 데이터 리스트
    """
    data = []

    # 1단계: 유효한 게시물의 URL과 제목을 수집
    items = driver.find_elements(By.CSS_SELECTOR, "a[href^='/notice/']")

    articles_to_crawl = []
    for item in items:
        title_element = item.find_element(By.TAG_NAME, "h1")
        title = title_element.text

        if title != "" and is_in_keyword(title, keywords):
            url = item.get_attribute('href')
            articles_to_crawl.append({"title": title, "url": url})

    print(f"게시물 {len(articles_to_crawl)}개를 찾았습니다.")

    # 2단계: 수집한 URL을 직접 방문하여 크롤링
    for article_info in articles_to_crawl:
        title = article_info["title"]
        url = article_info["url"]

        print(f"처리 중: {title}")

        driver.get(url)
        time.sleep(3)

        # 게시물 내용 추출
        article = driver.find_element(By.TAG_NAME, "article")
        day_info = get_day(article)

        if day_info != None:
            parsed_title = parse_title(title)
            print({"title": parsed_title, "day_info": day_info})
            data.append({"title": parsed_title, "day_info": day_info, "url": article_info["url"]})

    return data

def get_day(article: WebElement) -> Dict | None:
    """
    게시물에서 날짜 정보를 추출합니다.

    Args:
        article: WebElement 객체

    Returns:
        {"day": tuple, "type": str} 또는 None
    """
    contents = article.find_elements(By.TAG_NAME, "p")

    for content in contents:
        for pattern_info in date_patterns:
            pattern = pattern_info["pattern"]
            pattern_type = pattern_info["type"]

            match_day = re.findall(pattern, content.text)
            if len(match_day) > 0:
                print(f"매치 텍스트: {content.text}")
                print(f"매치 패턴: {pattern_info['desc']}")
                print(f"패턴 타입: {pattern_type}")
                return {"day": match_day[0], "type": pattern_type}

    return None


def parse_title(title: str) -> str:
    """
    제목에서 불필요한 문자를 제거하고 "기한"을 추가합니다.

    Args:
        title: 원본 제목 문자열

    Returns:
        정제된 제목 + " 기한"
    """
    # 제거할 특정 키워드들
    keywords_to_remove = ["안내", "공개"]

    # 특정 키워드 제거
    cleaned_title = title
    for keyword in keywords_to_remove:
        cleaned_title = cleaned_title.replace(keyword, "")

    # 특수문자 제거 (대괄호, 소괄호, 중괄호 등)
    cleaned_title = re.sub(r'[\[\]\(\)\{\}【】]', '', cleaned_title)

    # 여러 공백을 하나로 통합
    cleaned_title = re.sub(r'\s+', ' ', cleaned_title)

    # 앞뒤 공백 제거
    cleaned_title = cleaned_title.strip()

    # "기한" 추가
    return f"{cleaned_title} 기한"


def get_category_from_title(title: str) -> str:
    """
    제목에서 카테고리를 추출합니다.

    Args:
        title: 제목 문자열

    Returns:
        "장학" 또는 "행사"
    """
    # "장학" 키워드가 포함되어 있으면 "장학" 카테고리
    if "장학" in title:
        return "장학"

    # 나머지는 모두 "행사" 카테고리
    return "행사"


def is_in_keyword(title: str, keywords: List[str]) -> bool:
    """
    키워드로 데이터를 필터링합니다.

    Args:
        data: 데이터 리스트
        keywords: 필터링 키워드 리스트

    Returns:
        필터링된 데이터 리스트
    """

    # 제목에 키워드가 포함되어 있는지 확인
    if any(keyword in title for keyword in keywords):
        return True

    return False

def page_crawl(driver: webdriver.Chrome, url: str) -> List[Dict]:
        # 시작 페이지 가져오기
        driver = fetch_page(driver, url)

        # 데이터 추출
        data = extract_data(driver)
        print(f"Extracted {len(data)} items")

        # 결과 출력
        for item in data:
            print(f"\n{item}")

        return data

def add_event_to_calendar(events: List[Dict], calendar: Calendar) -> Calendar:
    cur_year = datetime.now().year

    for event in events:
        title = event.get('title')
        day_info = event.get('day_info')
        url = event.get('url')

        if not day_info:
            continue

        day = day_info["day"]
        pattern_type = day_info["type"]

        calendar_event = Event()
        calendar_event.name = title
        calendar_event.url = url
        calendar_event.created = datetime.now()

        # 패턴 타입으로 분기 처리
        if pattern_type == "range_with_time":
            # 범위 패턴 (시간 있음): (월, 일, 시, 분, 월, 일, 시, 분)
            start_month, start_day, start_hour, start_min = int(day[0]), int(day[1]), int(day[2]), int(day[3])
            end_month, end_day, end_hour, end_min = int(day[4]), int(day[5]), int(day[6]), int(day[7])

            calendar_event.begin = f"{cur_year}-{start_month:02d}-{start_day:02d} {start_hour:02d}:{start_min:02d}:00"
            calendar_event.end = f"{cur_year}-{end_month:02d}-{end_day:02d} {end_hour:02d}:{end_min:02d}:00"

        elif pattern_type == "single_with_time":
            # 단일 패턴 (시간 있음): (월, 일, 시, 분)
            month, day_num, hour, minute = int(day[0]), int(day[1]), int(day[2]), int(day[3])
            calendar_event.begin = f"{cur_year}-{month:02d}-{day_num:02d} {hour:02d}:{minute:02d}:00"

        elif pattern_type == "single_no_time":
            # 단일 패턴 (시간 없음): (월, 일) - 종일 이벤트
            month, day_num = int(day[0]), int(day[1])
            calendar_event.begin = f"{cur_year}-{month:02d}-{day_num:02d}"
            calendar_event.make_all_day()

        else:
            # 예외 처리: 알 수 없는 패턴 타입
            print(f"알 수 없는 패턴 타입: {pattern_type}, 데이터: {day}")
            continue

        # 제목에서 카테고리 추출
        category = get_category_from_title(title)
        calendar_event.categories = [category]

        calendar.events.add(calendar_event)

    return calendar
    

def main():
    """
    메인 실행 함수
    """
    url = "https://stu.ssu.ac.kr/notice?category=중앙&sub=총학생회"

    driver = None
    try:
        # WebDriver 설정
        driver = setup_driver()

        data = []
        calendar = Calendar()
        for i in range(1, 5):
            page_info = f"&page={i}"
            data = page_crawl(driver, url + page_info)
            calendar = add_event_to_calendar(data, calendar)

        with open("../my.ics", "w") as f:
            f.writelines(calendar.serialize_iter())

    finally:
        # WebDriver 종료
        if driver is not None:
            driver.quit()
            print("\nWebDriver closed")

if __name__ == "__main__":
    main()
