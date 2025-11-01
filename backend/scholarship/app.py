import asyncio
import logging
from datetime import datetime
from typing import List
import json

from config import DEFAULT_CRAWLER_CONFIG
from crawler.scraper import run_single_crawler
from utils.ics_builder import build_ics_from_events, merge_ics_texts

logger = logging.getLogger(__name__)


def _event_key_from_dict(ev: dict) -> tuple:
    dates = sorted(ev.get('dates', []))
    if not dates:
        return (ev.get('title', ''), '', '')
    start = dates[0]
    end = dates[-1]
    return (ev.get('title', ''), f"{start[0]:04d}-{start[1]:02d}-{start[2]:02d}", f"{end[0]:04d}-{end[1]:02d}-{end[2]:02d}")


async def run_many_crawlers_and_generate_ics(crawler_configs: List[dict]) -> tuple[str, list[dict]]:
    # 서로 독립된 네트워크 작업이므로 병렬 실행
    results = await asyncio.gather(*[run_single_crawler(cfg) for cfg in crawler_configs])
    all_events = []
    all_misses = []
    for r in results:
        all_events.extend(r.get('events', []))
        all_misses.extend(r.get('misses', []))
    # 중복 제거: (title, startDate, endDate) 키 기준
    deduped = []
    seen = set()
    for ev in all_events:
        k = _event_key_from_dict(ev)
        if k in seen:
            continue
        seen.add(k)
        deduped.append(ev)
    logger.info(f"총 이벤트 수: {len(all_events)} → 중복 제거 후 {len(deduped)} / 날짜 미탐지: {len(all_misses)}")
    return build_ics_from_events(deduped), all_misses


async def main():
    logger.info("🚀 함수 기반 파이프라인 시작")
    start = datetime.now()
    ics_text_new, misses = await run_many_crawlers_and_generate_ics([DEFAULT_CRAWLER_CONFIG])

    # 기존 파일이 있으면 병합(중복 제거)
    try:
        with open('scholarships.ics', 'r', encoding='utf-8') as f:
            existing = f.read()
    except FileNotFoundError:
        existing = ''

    merged = merge_ics_texts(existing, ics_text_new)
    with open('scholarships.ics', 'w', encoding='utf-8') as f:
        f.write(merged)

    # 날짜 미탐지 목록 저장 (JSON 배열)
    if misses:
        with open('missing_dates.json', 'w', encoding='utf-8') as f:
            json.dump([
                {
                    'title': m.get('title'),
                    'url': m.get('url'),
                    'reason': m.get('message') or '날짜를 확인할 수 없습니다',
                } for m in misses
            ], f, ensure_ascii=False, indent=2)
    elapsed = (datetime.now() - start).total_seconds()
    logger.info("🎉 모든 작업 완료!")
    logger.info(f"⏱ 총 소요 시간: {elapsed:.2f}초")


if __name__ == '__main__':
    asyncio.run(main())
