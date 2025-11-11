import asyncio
import re
import logging
import calendar as calmod
from datetime import datetime
from typing import List, Tuple
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from utils.event_rules import extract_foundation_name, build_events_from_schedule_item
from config import SCHEDULE_LABEL_KEYWORDS

logger = logging.getLogger(__name__)


def _build_async_client(timeout: int) -> httpx.AsyncClient:
    return httpx.AsyncClient(
        timeout=timeout,
        follow_redirects=True,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    )


async def _fetch_text(client: httpx.AsyncClient, url: str) -> str:
    resp = await client.get(url)
    resp.raise_for_status()
    return resp.text


def _resolve_base_url(url: str) -> str:
    p = urlparse(url)
    return f"{p.scheme}://{p.netloc}"


async def collect_detail_links_fn(
    client: httpx.AsyncClient,
    list_url: str,
    link_selectors: List[str],
) -> List[str]:
    logger.info("=" * 60)
    logger.info("[1단계] 목록 페이지에서 링크 수집 시작 (함수)")
    logger.info(f"대상 URL: {list_url}")

    base = _resolve_base_url(list_url)
    html = await _fetch_text(client, list_url)
    soup = BeautifulSoup(html, 'lxml')

    collected: List[str] = []
    for sel in link_selectors:
        links = soup.select(sel)
        logger.info(f"선택자 '{sel}': {len(links)}개 링크 발견")
        for a in links:
            href = a.get('href')
            if not href:
                continue
            url = urljoin(base + '/', href)
            if url not in collected:
                collected.append(url)
                logger.debug(f"  → 링크: {url}")
        if collected:
            break

    logger.info(f"✓ 총 {len(collected)}개의 세부 페이지 링크 수집 완료")
    logger.info("=" * 60)
    return collected


def extract_schedule_items_from_soup(
    soup: BeautifulSoup,
    content_selectors: List[str],
    date_patterns: List[str],
    month_patterns: List[str],
) -> List[Tuple[str, List[Tuple[int, int, int]]]]:
    # content 루트 선택
    root = None
    for sel in content_selectors:
        root = soup.select_one(sel)
        if root:
            break
    if not root:
        root = soup.find('body') or soup

    logger.debug(f"content_elem 찾음: tag={getattr(root, 'name', None)}, id={root.get('id') if hasattr(root, 'get') else None}")

    d_patterns = [re.compile(p) for p in date_patterns]
    m_patterns = [re.compile(p) for p in month_patterns]

    # 텍스트 노드 기반 스캔: 어떤 태그든 상관없이 날짜 패턴이 들어있는 노드 수집
    def has_any_pattern(s: str) -> bool:
        return any(p.search(s) for p in d_patterns) or any(p.search(s) for p in m_patterns)

    text_nodes = root.find_all(string=lambda s: isinstance(s, str) and has_any_pattern(s))
    parents = []
    seen = set()
    BLOCK_TAGS = {"p", "li", "div", "section", "article"}
    for t in text_nodes:
        node = t.parent if hasattr(t, 'parent') else None
        if not node:
            continue
        # 인라인 태그(b, span 등)에서 블록 조상으로 상승
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

    logger.debug(f"    🔍 날짜 텍스트 포함 부모 요소 {len(parents)}개")

    def _earliest_date_index(text: str) -> int:
        idx = None
        # day patterns
        for pat in d_patterns:
            for m in pat.finditer(text):
                s = m.start()
                if idx is None or s < idx:
                    idx = s
        # month-only patterns
        for pat in m_patterns:
            m = pat.search(text)
            if m:
                s = m.start()
                if idx is None or s < idx:
                    idx = s
        return idx if idx is not None else -1

    results: List[Tuple[str, List[Tuple[int, int, int]]]] = []
    for el in parents:
        text = el.get_text(' ', strip=True)
        if not text:
            continue

        # 첫 날짜 이전 구간에 허용 키워드가 포함돼야 함
        first_idx = _earliest_date_index(text)
        if first_idx == -1:
            continue
        prefix = text[:first_idx]
        if not any(k in prefix for k in SCHEDULE_LABEL_KEYWORDS):
            # 허용 키워드가 없으면 스킵 (예: 공고일 기준(2025.10.1))
            continue

        # yyyy.mm.dd 다중 추출
        dates: List[Tuple[int, int, int]] = []
        for pat in d_patterns:
            for y, m, d in pat.findall(text):
                try:
                    y_, m_, d_ = int(y), int(m), int(d)
                    datetime(y_, m_, d_)
                    dates.append((y_, m_, d_))
                except ValueError:
                    continue

        # yyyy.mm월 처리
        if not dates:
            for pat in m_patterns:
                mo = pat.search(text)
                if mo:
                    y_, m_ = int(mo.group(1)), int(mo.group(2))
                    try:
                        last = calmod.monthrange(y_, m_)[1]
                        dates = [(y_, m_, 1), (y_, m_, last)]
                    except Exception:
                        pass
                    break

        if not dates:
            continue

        # 라벨(부제목)
        if ':' in text:
            label = text.split(':')[0].strip()
        else:
            y0, m0, d0 = dates[0]
            token = f"{y0}.{m0}.{d0}"
            parts = text.split(token)
            label = parts[0].strip() if parts and parts[0] else '일정'

        label = re.sub(r'^[가-힣A-Za-z]\.\s*', '', label)
        label = re.sub(r'^\d+\.\s*', '', label).strip() or '일정'

        if (label, tuple(dates)) not in [(l, tuple(ds)) for l, ds in results]:
            results.append((label, dates))

    return results


async def extract_detail_fn(
    client: httpx.AsyncClient,
    url: str,
    content_selectors: List[str],
    date_patterns: List[str],
    month_patterns: List[str],
):
    html = await _fetch_text(client, url)
    soup = BeautifulSoup(html, 'lxml')
    title_el = soup.select_one("h1, h2, .title, .post-title")
    title = title_el.get_text(strip=True) if title_el else "제목 없음"
    items = extract_schedule_items_from_soup(soup, content_selectors, date_patterns, month_patterns)
    return title, items


async def run_single_crawler(config: dict) -> dict:
    timeout = int(config.get('timeout', 30))
    max_concurrency = int(config.get('max_concurrency', 10))
    list_url = config['list_url']
    link_selectors = config.get('link_selectors', [])
    content_selectors = config.get('content_selectors', [])
    date_patterns = config.get('date_patterns', [])
    month_patterns = config.get('month_patterns', [])

    async with _build_async_client(timeout) as client:
        detail_urls = await collect_detail_links_fn(client, list_url, link_selectors)
        if not detail_urls:
            return []

        sem = asyncio.Semaphore(max_concurrency)
        async def _task(u: str):
            async with sem:
                return await extract_detail_fn(client, u, content_selectors, date_patterns, month_patterns)

        results = await asyncio.gather(*[_task(u) for u in detail_urls])

        events: List[dict] = []
        misses: List[dict] = []
        for url_, (title, items) in zip(detail_urls, results):
            foundation = extract_foundation_name(title)
            if not items:
                misses.append({
                    'title': title,
                    'message': '날짜를 확인할 수 없습니다',
                    'url': url_,
                })
                continue
            for label, dates in items:
                final_list = build_events_from_schedule_item(foundation, label, dates, url_)
                # 태그 주입: 장학형
                for ev in final_list:
                    ev['tags'] = ['장학형']
                events.extend(final_list)

        return {'events': events, 'misses': misses}
