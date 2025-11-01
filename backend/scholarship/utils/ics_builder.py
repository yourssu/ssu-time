from datetime import datetime, timezone
from typing import List, Tuple

from ics import Calendar, Event


def build_ics_from_events(events: List[dict]) -> str:
    """
    이벤트(dict) 리스트를 하나의 ICS 문자열로 변환합니다.
    이벤트 형식: { 'title': str, 'dates': [(y,m,d), ...], 'url': str?, 'tags': [str]? }
    """
    cal = Calendar()

    for ev in events:
        dates: List[Tuple[int, int, int]] = sorted(ev.get("dates", []))
        if not dates:
            continue

        # 표준 시간: 09:00Z 시작, 10:00Z 종료
        start = datetime(dates[0][0], dates[0][1], dates[0][2], 9, 0, 0, tzinfo=timezone.utc)
        end = datetime(dates[-1][0], dates[-1][1], dates[-1][2], 10, 0, 0, tzinfo=timezone.utc)

        e = Event()
        e.name = ev['title']
        e.begin = start
        e.end = end
        # DTSTAMP/UID/CATEGORIES
        try:
            e.uid = f"{__import__('uuid').uuid4()}@yourssu.com"
        except Exception:
            pass
        try:
            e.created = datetime.now(timezone.utc)
        except Exception:
            pass
        if 'url' in ev and ev['url']:
            try:
                e.url = ev['url']
            except Exception:
                pass
        # 카테고리: 우선 이벤트 태그 사용, 없으면 '장학형'
        try:
            tags = ev.get('tags') or ['장학형']
            e.categories = set(tags)
        except Exception:
            pass

        # DESCRIPTION 미사용 (요청사항)

        cal.events.add(e)

    return str(cal)


def _event_key(ev: Event) -> tuple:
    """이벤트 중복 판별용 키(name, begin_date, end_date)."""
    name = (ev.name or '').strip()
    begin = ev.begin.date() if ev.begin else None
    end = ev.end.date() if ev.end else begin
    return (name, str(begin), str(end))


def merge_ics_texts(existing_ics_text: str, new_ics_text: str) -> str:
    """두 개의 ICS 텍스트를 이벤트 중복 없이 병합하여 반환."""
    base = Calendar(existing_ics_text) if existing_ics_text else Calendar()
    addl = Calendar(new_ics_text) if new_ics_text else Calendar()

    merged = Calendar()
    existing_keys = {_event_key(e) for e in base.events}
    for e in base.events:
        merged.events.add(e)
    for e in addl.events:
        if _event_key(e) not in existing_keys:
            merged.events.add(e)
    return str(merged)
