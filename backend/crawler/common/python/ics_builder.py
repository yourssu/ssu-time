"""
ICS 파일 생성 모듈
ics 라이브러리를 사용하여 통일된 ICS 파일을 생성합니다.
"""

from ics import Calendar, Event
from datetime import datetime, date
from typing import List, Optional
import uuid


def create_event(
    title: str,
    start_date: datetime,
    end_date: Optional[datetime] = None,
    category: str = "EVENT",
    url: Optional[str] = None,
    all_day: bool = True
) -> Event:
    """
    ICS 이벤트 생성

    Args:
        title: 이벤트 제목
        start_date: 시작 날짜/시간
        end_date: 종료 날짜/시간 (옵션)
        category: 카테고리 (STANDARD, EVENT, SCHOLARSHIP)
        url: 이벤트 URL (옵션)
        all_day: 하루종일 이벤트 여부

    Returns:
        Event 객체
    """
    event = Event()
    event.name = title
    event.created = datetime.now()

    if all_day:
        # 하루종일 이벤트
        event.begin = start_date.date() if isinstance(start_date, datetime) else start_date
        if end_date:
            event.end = end_date.date() if isinstance(end_date, datetime) else end_date
        event.make_all_day()
    else:
        # 시간 지정 이벤트
        event.begin = start_date
        if end_date:
            event.end = end_date

    event.categories = [category]
    if url:
        event.url = url

    event.uid = f"{uuid.uuid4()}@yourssu.com"

    return event


def split_long_duration_event(
    title: str,
    start_date: datetime,
    end_date: datetime,
    category: str,
    url: Optional[str] = None,
    threshold_days: int = 7,
    has_time: bool = False
) -> List[Event]:
    """
    7일 이상 이벤트를 시작/마감으로 분리

    Args:
        title: 이벤트 제목
        start_date: 시작 날짜/시간
        end_date: 종료 날짜/시간
        category: 카테고리
        url: URL (옵션)
        threshold_days: 분리 기준 (기본 7일)
        has_time: 시간 정보 포함 여부

    Returns:
        Event 객체 리스트 (1개 또는 2개)
    """
    duration = (end_date - start_date).days

    if duration < threshold_days:
        # 짧은 기간: 단일 이벤트
        if has_time:
            return [create_event(f"{title} 기간", start_date, end_date, category, url, all_day=False)]
        else:
            return [create_event(title, start_date, end_date, category, url, all_day=True)]

    # 긴 기간: 시작/마감으로 분리
    events = []

    # 시작 이벤트 (하루종일)
    start_event = create_event(
        f"{title} 시작",
        start_date,
        category=category,
        url=url,
        all_day=True
    )
    events.append(start_event)

    # 마감 이벤트
    if has_time and hasattr(end_date, 'hour'):
        # 시간 정보가 있으면 마감 1시간 전부터 시작하는 1시간 이벤트
        end_hour = end_date.hour
        end_min = end_date.minute
        end_hour_start = end_hour - 1 if end_hour > 0 else 23

        if end_hour > 0:
            end_begin = end_date.replace(hour=end_hour_start)
        else:
            # 자정인 경우 전날 23시
            from datetime import timedelta
            end_begin = (end_date - timedelta(days=1)).replace(hour=23, minute=end_min)

        end_event = create_event(
            f"{title} 마감",
            end_begin,
            end_date,
            category=category,
            url=url,
            all_day=False
        )
    else:
        # 시간 정보 없으면 하루종일 이벤트
        end_event = create_event(
            f"{title} 마감",
            end_date,
            category=category,
            url=url,
            all_day=True
        )

    events.append(end_event)
    return events


def create_calendar_from_events(events: List[Event]) -> Calendar:
    """
    이벤트 리스트로 Calendar 객체 생성

    Args:
        events: Event 객체 리스트

    Returns:
        Calendar 객체
    """
    calendar = Calendar()
    for event in events:
        calendar.events.add(event)
    return calendar


def serialize_calendar(calendar: Calendar) -> str:
    """
    Calendar 객체를 ICS 문자열로 직렬화

    Args:
        calendar: Calendar 객체

    Returns:
        ICS 형식 문자열
    """
    return str(calendar)


def filter_events_by_categories(calendar: Calendar, categories: set) -> Calendar:
    """
    카테고리로 이벤트 필터링

    Args:
        calendar: Calendar 객체
        categories: 필터링할 카테고리 집합

    Returns:
        필터링된 Calendar 객체
    """
    if not categories:
        # 빈 집합이면 빈 캘린더 반환
        return Calendar()

    filtered_calendar = Calendar()

    for event in calendar.events:
        # 이벤트의 카테고리가 필터 카테고리와 교집합이 있으면 포함
        event_categories = set(event.categories) if event.categories else set()
        if event_categories & categories:
            filtered_calendar.events.add(event)

    return filtered_calendar
