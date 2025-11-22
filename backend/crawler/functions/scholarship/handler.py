#!/usr/bin/env python3
"""
장학금 크롤러 Lambda 함수
Scatch 장학금 공지사항을 크롤링하여 ICS 파일을 생성하고 S3에 업로드합니다.
"""

import sys
import os
import time
import re
import asyncio
import calendar as calmod
from datetime import datetime, timezone
from typing import List, Tuple, Dict, Optional
from urllib.parse import urljoin, urlparse

# Lambda Layer에서 common 모듈 import
# Layer 구조: /opt/python/common/
sys.path.insert(0, '/opt/python')
import httpx
from bs4 import BeautifulSoup
from ics import Calendar, Event

from common.logger import setup_logger, log_crawler_start, log_crawler_complete, log_execution_metrics
from common.date_utils import get_date_filter_range, get_datetime_from_text
from common.s3_utils import upload_ics
from common.config import SCHOLARSHIP_CONFIG, S3_BUCKET, DATE_PATTERNS
from common.ics_builder import split_long_duration_event, create_event

logger = setup_logger(__name__)

# 설정
DATE_PATTERN = r"(\d{4})\.(\d{1,2})\.(\d{1,2})"
MONTH_PATTERN = r"(\d{4})\.(\d{1,2})\s*월"
DURATION_THRESHOLD_DAYS = 7
SCHEDULE_LABEL_KEYWORDS = ["접수기한", "접수기간", "제출기간", "제출기한", "서류심사"]

CRAWLER_CONFIG = {
    "list_url": "https://scatch.ssu.ac.kr/%EA%B3%B5%EC%A7%80%EC%82%AC%ED%95%AD/?category=%EC%9E%A5%ED%95%99&f=all&keyword=%E2%98%85",
    "link_selectors": ["a.text-decoration-none.d-block.text-truncate"],
    "content_selectors": ["#contents", "div.bg-white.p-4.mb-5 > div", "div.bg-white"],
    "max_concurrency": 10,
    "timeout": 30,
    "date_patterns": [DATE_PATTERN],
    "month_patterns": [MONTH_PATTERN],
}


def extract_foundation_name(raw_title: str) -> str:
    """제목에서 장학재단/재단명 추출"""
    title = raw_title.strip()
    title = re.sub(r'^★+\s*', '', title)
    title = re.sub(r'^\(재공지\)\s*', '', title)
    title = re.sub(r'\(기한\s*연장\)', '', title)
    title = re.sub(r'\s+', ' ', title)

    m = re.search(r'㈜?\s*([가-힣A-Za-z0-9·]+)\s*(?:장학생|장학금)', title)
    if m:
        return m.group(1)
    m = re.search(r'([가-힣A-Za-z0-9·]+(?:장학재단|장학회|재단))', title)
    if m:
        return m.group(1)

    m = re.search(r'([가-힣A-Za-z0-9·()]*근로[가-힣A-Za-z0-9·()]*)', title)
    if m:
        return m.group()
    
    t2 = re.sub(r'\d{4}학년도?\s*\d?학기?', '', title)
    t2 = re.sub(r'(선발\s*공고|추천\s*공고|모집\s*공고|공고)', '', t2)
    t2 = t2.strip()
    m = re.search(r'㈜?\s*([가-힣A-Za-z0-9·]{2,})', t2)
    if m:
        return m.group(1)
    return title.split()[0] if title.split() else title


def is_application_label(label: str) -> bool:
    """신청성 일정 분류 키워드 확인"""
    return bool(re.search(r'(신청|접수|모집|추천|제출)', label))



def build_ics_from_events(events: List[dict]) -> str:
    """이벤트 딕셔너리 리스트를 ICS 문자열로 변환"""
    cal = Calendar()
    filter_start, filter_end = get_date_filter_range()

    for ev in events:
        date = ev.get("date", [])
        if not date:
            continue
        if isinstance(date, tuple):
            event = split_long_duration_event(title= ev.get('title'), start_date=date[0], end_date=date[1], categories=ev.get('tags'), url=ev.get('url'))
            cal.events = cal.events.union(event)
            continue
        event = create_event(title= ev.get('title'), start_date=date, categories=ev.get('tags'), url=ev.get('url'))
        cal.events.add(event)

    return str(cal)


async def fetch_text(client: httpx.AsyncClient, url: str) -> str:
    """URL에서 HTML 텍스트 가져오기"""
    resp = await client.get(url)
    resp.raise_for_status()
    return resp.text


def resolve_base_url(url: str) -> str:
    """URL에서 base URL 추출"""
    p = urlparse(url)
    return f"{p.scheme}://{p.netloc}"


async def collect_detail_links(
    client: httpx.AsyncClient,
    list_url: str,
    link_selectors: List[str],
) -> List[str]:
    """목록 페이지에서 세부 페이지 링크 수집"""
    logger.info("세부 페이지 링크 수집 중...")

    base = resolve_base_url(list_url)
    html = await fetch_text(client, list_url)
    soup = BeautifulSoup(html, 'html.parser')

    collected: List[str] = []
    for sel in link_selectors:
        links = soup.select(sel)
        logger.info(f"  선택자 '{sel}': {len(links)}개 링크 발견")
        for a in links:
            tag = a.parent.parent.select(".tag")
            if tag and "완료" in tag[0].text:
                continue
            href = a.get('href')
            if not href:
                continue
            url = urljoin(base + '/', href)
            if url not in collected:
                collected.append(url)
                logger.debug(f"    → {url}")
        if collected:
            break

    logger.info(f"총 {len(collected)}개 링크 수집 완료")
    return collected


def extract_schedule_items_from_soup(
    soup: BeautifulSoup,
    content_selectors: List[str],
) -> Tuple[datetime, datetime] | datetime:
    """BeautifulSoup 객체에서 일정 항목 추출"""
    # content 루트 선택
    root = None
    for sel in content_selectors:
        root = soup.select_one(sel)
        if root:
            break
    if not root:
        root = soup.find('body') or soup



    text_nodes = root.find_all(string=lambda s: isinstance(s, str))
    parents = []
    seen = set()
    BLOCK_TAGS = {"p", "li", "div", "section", "article"}

    for t in text_nodes:
        node = t.parent if hasattr(t, 'parent') else None
        if not node:
            continue
        cur = node
        chosen = node
        while cur and hasattr(cur, 'name'):
            if cur.name in BLOCK_TAGS:
                chosen = cur
                break
            cur = getattr(cur, 'parent', None)
            if cur is None or cur == root:
                break
        key = id(chosen)
        if key in seen:
            continue
        seen.add(key)
        parents.append(chosen)


    for el in parents:
        text = el.get_text(' ', strip=True)
        if not text:
            continue

        return get_datetime_from_text(text)


async def extract_detail(
    client: httpx.AsyncClient,
    url: str,
    content_selectors: List[str],
):
    """세부 페이지에서 제목과 일정 항목 추출"""
    html = await fetch_text(client, url)
    soup = BeautifulSoup(html, 'html.parser')
    title_el = soup.select_one("h1, h2, .title, .post-title")
    title = title_el.get_text(strip=True) if title_el else "제목 없음"
    item = extract_schedule_items_from_soup(soup, content_selectors)
    return title, item


async def run_crawler(config: dict) -> dict:
    """크롤러 실행"""
    timeout = int(config.get('timeout', 30))
    max_concurrency = int(config.get('max_concurrency', 10))
    list_url = config['list_url']
    link_selectors = config.get('link_selectors', [])
    content_selectors = config.get('content_selectors', [])

    async with httpx.AsyncClient(
        timeout=timeout,
        follow_redirects=True,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    ) as client:
        detail_urls = await collect_detail_links(client, list_url, link_selectors)
        if not detail_urls:
            return {'events': [], 'misses': []}

        sem = asyncio.Semaphore(max_concurrency)

        async def task(u: str):
            async with sem:
                return await extract_detail(client, u, content_selectors)

        results = await asyncio.gather(*[task(u) for u in detail_urls])

        events: List[dict] = []
        misses: List[dict] = []

        for url_, (title, date) in zip(detail_urls, results):
            if "지급" in title:
                continue
            foundation = extract_foundation_name(title)
            if not date:
                misses.append({'title': title, 'message': '날짜를 확인할 수 없습니다', 'url': url_})
                continue

            ev = {'title': f"{foundation} 장학금", 'date': date, 'url': url_}
            if "교내장학금" in ev.get("title") or "국가장학금" in ev.get("title"):
                ev['tags'] = ['SCHOLARSHIP', 'STANDARD']
            ev['tags'] = ['SCHOLARSHIP']
            events.append(ev)

        return {'events': events, 'misses': misses}


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

    log_crawler_start(logger, SCHOLARSHIP_CONFIG.name, SCHOLARSHIP_CONFIG.url)

    try:
        # 비동기 크롤링 실행
        result = asyncio.run(run_crawler(CRAWLER_CONFIG))

        events = result.get('events', [])
        misses = result.get('misses', [])

        logger.info(f"수집된 이벤트: {len(events)}개, 날짜 미탐지: {len(misses)}개")

        # ICS 파일 생성
        ics_content = build_ics_from_events(events)

        with open("temp.txt", 'w+') as file:
            file.write(ics_content)

        # S3 업로드
        bucket = os.environ.get('S3_BUCKET', S3_BUCKET)
        s3_key = SCHOLARSHIP_CONFIG.output_key

        upload_result = upload_ics(ics_content, bucket, s3_key)

        if not upload_result.get('success'):
            raise Exception(f"S3 업로드 실패: {upload_result.get('error')}")

        duration = time.time() - start_time

        log_crawler_complete(logger, SCHOLARSHIP_CONFIG.name, len(events), duration)
        log_execution_metrics(logger, SCHOLARSHIP_CONFIG.name, duration, len(events), s3_key)

        return {
            'statusCode': 200,
            'body': {
                'crawler': SCHOLARSHIP_CONFIG.name,
                'events_count': len(events),
                'misses_count': len(misses),
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
                'crawler': SCHOLARSHIP_CONFIG.name,
                'error': str(e),
                'duration_seconds': round(duration, 2)
            }
        }


# 로컬 테스트용
if __name__ == "__main__":
    result = lambda_handler({}, None)
    print(result)
