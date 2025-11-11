from datetime import datetime
from typing import List, Tuple

from ics import Calendar, Event


def build_ics_from_events(events: List[dict]) -> str:
    """
    이벤트(dict) 리스트를 하나의 ICS 문자열로 변환합니다.
    이벤트 형식: { 'title': str, 'dates': [(y,m,d), ...], 'url': str? }
    """
    cal = Calendar()

    for ev in events:
        dates: List[Tuple[int, int, int]] = sorted(ev.get("dates", []))
        if not dates:
            continue

        start = datetime(dates[0][0], dates[0][1], dates[0][2])
        end = datetime(dates[-1][0], dates[-1][1], dates[-1][2])

        e = Event()
        e.name = ev['title']
        e.begin = start
        e.end = end
        e.make_all_day()
        if 'url' in ev and ev['url']:
            try:
                e.url = ev['url']
            except Exception:
                pass

        # 설명용 날짜는 통일된 형식(YYYY-MM-DD)로 표기
        date_info = " ~ ".join([f"{y:04d}-{m:02d}-{d:02d}" for y, m, d in dates])
        parts = [
            f"제목: {ev['title']}",
            f"기한: {date_info}",
        ]
        if 'url' in ev and ev['url']:
            parts.append(f"링크: {ev['url']}")
        e.description = "\n".join(parts)

        cal.events.add(e)

    return str(cal)

# TODO: 피키-추후 중복관련 비즈니스 규칙정해지면 그에 맞춰 수정필요
def _event_key(ev: Event) -> tuple:
    """이벤트 중복 판별용 키(name, begin_date, end_date)."""
    name = (ev.name or '').strip()
    begin = ev.begin.date() if ev.begin else None
    end = ev.end.date() if ev.end else begin
    return (name, str(begin), str(end))


def merge_events_with_existing_ics(existing_ics_text: str, new_events: List[dict]) -> str:
    """
    기존 ICS에 새 이벤트를 병합하여 중복 없이 반환.
    중복 기준: (name, begin_date, end_date)
    """
    existing_cal = Calendar(existing_ics_text) if existing_ics_text else Calendar()
    existing_keys = {_event_key(e) for e in existing_cal.events}

    merged = Calendar()
    for e in existing_cal.events:
        merged.events.add(e)

    # 새 이벤트를 기존 키와 비교해서 추가
    tmp_cal_text = build_ics_from_events(new_events)
    tmp_cal = Calendar(tmp_cal_text)
    for e in tmp_cal.events:
        if _event_key(e) not in existing_keys:
            merged.events.add(e)

    return str(merged)


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
