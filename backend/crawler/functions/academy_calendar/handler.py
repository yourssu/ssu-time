#!/usr/bin/env python3
"""
학사일정 크롤러 Lambda 함수
숭실대학교 학사일정을 크롤링하여 ICS 파일을 생성하고 S3에 업로드합니다.
"""

import sys
import os
import time
from datetime import datetime
from typing import List
import re

# Lambda Layer에서 common 모듈 import
# Layer 구조: /opt/python/common/
sys.path.insert(0, '/opt/python')

import requests
from bs4 import BeautifulSoup

from common.logger import setup_logger, log_crawler_start, log_crawler_complete, log_execution_metrics
from common.date_utils import get_date_filter_range
from common.ics_builder import create_event, split_long_duration_event, create_calendar_from_events, serialize_calendar
from common.s3_utils import upload_ics
from common.config import ACADEMIC_CONFIG, S3_BUCKET

logger = setup_logger(__name__)


def clean_date_text(date_text: str) -> str:
    """
    날짜 텍스트 정리 (공백 및 틸드 정규화)

    Args:
        date_text: 원본 날짜 텍스트

    Returns:
        정리된 날짜 텍스트
    """
    text = ' '.join(date_text.split())
    text = text.replace(' ~ ', '~').replace('~ ', '~').replace(' ~', '~')
    return text.strip()


def crawl_academic_calendar(year: int, month_filter: int, events: List) -> int:
    """
    특정 연도의 학사일정을 크롤링하여 이벤트 리스트에 추가

    Args:
        year: 크롤링할 연도
        month_filter: 필터링 기준 월 (해당 월 이상/이하만 포함)
        events: 이벤트를 추가할 리스트

    Returns:
        추가된 이벤트 수
    """
    url = f'https://ssu.ac.kr/%ED%95%99%EC%82%AC/%ED%95%99%EC%82%AC%EC%9D%BC%EC%A0%95/?years={year}'

    logger.info(f"{year}년 학사일정 크롤링 시작 (필터: {month_filter}월)")

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        logger.error(f"{year}년 학사일정 크롤링 실패: {e}")
        return 0

    rows = soup.find_all('div', class_='row')
    seen = set()
    initial_count = len(events)

    # 날짜 필터링 범위
    filter_start, filter_end = get_date_filter_range()

    for row in rows:
        date_div = row.find('div', class_='col-12 col-lg-4 col-xl-3 font-weight-normal text-primary')
        title_div = row.find('div', class_='col-12 col-lg-8 col-xl-9')

        if not (date_div and title_div):
            continue

        date_cleaned = clean_date_text(date_div.get_text())
        title_text = ' '.join(title_div.get_text(strip=True).split())
        
        match_text = re.search(r'\d{4}학년도\s*\d{1}\s*학기', title_text)
        if not match_text:
            match_text = re.search(r'\d{4}학년도\s*(?:겨울|여름)\s*학기', title_text)
        if not match_text:
            match_text = re.search(r'\d{4}학년도', title_text)
        
        if match_text:
            match_text = match_text.group()

        title_text = re.sub(r'\d{4}학년도\s*\d{1}\s*학기', '', title_text)
        title_text = re.sub(r'\d{4}학년도\s*(?:겨울|여름)\s*학기', '', title_text)
        title_text = re.sub(r'\d{4}학년도', '', title_text)

        # 중복 제거
        key = (date_cleaned, title_text)
        if key in seen:
            continue
        seen.add(key)

        # 날짜 파싱
        if '~' in date_cleaned:
            first_date, second_date = date_cleaned.split('~')
        else:
            first_date = second_date = date_cleaned

        first_date = first_date.strip().split('(')[0]
        second_date = second_date.strip().split('(')[0]

        # 연도 추가
        if not first_date.startswith(str(year)):
            first_date = f"{year}.{first_date}"
        if not second_date.startswith(str(year)):
            second_date = f"{year}.{second_date}"

        try:
            start_date_obj = datetime.strptime(first_date.strip(), "%Y.%m.%d")
            end_date_obj = datetime.strptime(second_date.strip(), "%Y.%m.%d")
        except ValueError as e:
            logger.warning(f"날짜 파싱 실패: {first_date} ~ {second_date}, {e}")
            continue

        # 월 필터링 (2025년은 month_filter 이상, 2026년은 month_filter 이하)
        if year == 2025 and start_date_obj.month < month_filter:
            continue
        elif year == 2026 and start_date_obj.month > month_filter:
            continue

        # 날짜 범위 필터링 (종료일 기준)
        if not (filter_start <= end_date_obj <= filter_end):
            continue

        # 이벤트 생성
        duration_days = (end_date_obj - start_date_obj).days

        if duration_days < ACADEMIC_CONFIG.duration_threshold_days:
            # 7일 미만: 단일 이벤트
            event = create_event(
                title=title_text,
                start_date=start_date_obj,
                end_date=end_date_obj if duration_days > 0 else None,
                categories=[ACADEMIC_CONFIG.category],
                description = match_text,
            )
            events.append(event)
        else:
            # 7일 이상: 시작/마감으로 분리
            split_events = split_long_duration_event(
                title=title_text,
                start_date=start_date_obj,
                end_date=end_date_obj,
                categories=[ACADEMIC_CONFIG.category],
                threshold_days=ACADEMIC_CONFIG.duration_threshold_days,
                description = match_text,
            )
            events.extend(split_events)

    added_count = len(events) - initial_count
    logger.info(f"{year}년 학사일정 크롤링 완료: {added_count}개 이벤트 추가")

    return added_count


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

    log_crawler_start(logger, ACADEMIC_CONFIG.name, ACADEMIC_CONFIG.url)

    try:
        # 이벤트 리스트
        events = []

        # 현재 연도와 다음 연도 크롤링
        current_year = datetime.now().year
        next_year = current_year + 1
        current_month = datetime.now().month

        # 현재 연도 (현재 월 이상)
        crawl_academic_calendar(current_year, current_month, events)

        # 다음 연도 (2월 이하)
        crawl_academic_calendar(next_year, 2, events)

        # Calendar 생성
        calendar = create_calendar_from_events(events)
        ics_content = serialize_calendar(calendar)

        # S3 업로드
        bucket = os.environ.get('S3_BUCKET', S3_BUCKET)
        s3_key = ACADEMIC_CONFIG.output_key

        upload_result = upload_ics(ics_content, bucket, s3_key)

        if not upload_result.get('success'):
            raise Exception(f"S3 업로드 실패: {upload_result.get('error')}")

        duration = time.time() - start_time

        log_crawler_complete(logger, ACADEMIC_CONFIG.name, len(events), duration)
        log_execution_metrics(logger, ACADEMIC_CONFIG.name, duration, len(events), s3_key)

        return {
            'statusCode': 200,
            'body': {
                'crawler': ACADEMIC_CONFIG.name,
                'events_count': len(events),
                'duration_seconds': round(duration, 2),
                's3_bucket': bucket,
                's3_key': s3_key,
                'file_size': upload_result.get('size')
            }
        }

    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"크롤링 실패: {e}", exc_info=True)

        return {
            'statusCode': 500,
            'body': {
                'crawler': ACADEMIC_CONFIG.name,
                'error': str(e),
                'duration_seconds': round(duration, 2)
            }
        }


# 로컬 테스트용
if __name__ == "__main__":
    result = lambda_handler({}, None)
    print(result)
