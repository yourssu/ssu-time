"""
날짜 유틸리티 모듈
모든 크롤러에서 사용하는 날짜 필터링 로직을 통합합니다.
"""

from datetime import datetime, date
from dateutil.relativedelta import relativedelta
import calendar as cal_module


def get_date_filter_range() -> tuple[datetime, datetime]:
    """
    현재월 1일 ~ 3달 뒤 마지막 날까지의 범위를 반환

    Returns:
        (start_date, end_date) 튜플
    """
    now = datetime.now()

    # 현재월 1일
    start_date = datetime(now.year, now.month, 1)

    # 3달 뒤의 년/월
    end_dt = now + relativedelta(months=3)

    # 3달 뒤의 마지막 날
    last_day = cal_module.monthrange(end_dt.year, end_dt.month)[1]
    end_date = datetime(end_dt.year, end_dt.month, last_day, 23, 59, 59)

    return start_date, end_date


def is_within_range(
    event_date: datetime,
    start: datetime,
    end: datetime
) -> bool:
    """
    날짜가 범위 내에 있는지 확인

    Args:
        event_date: 확인할 날짜
        start: 시작 날짜
        end: 종료 날짜

    Returns:
        범위 내에 있으면 True
    """
    return start <= event_date <= end


def parse_date_string(date_str: str, format: str = "%Y.%m.%d") -> datetime:
    """
    문자열을 datetime 객체로 변환

    Args:
        date_str: 날짜 문자열
        format: 날짜 형식

    Returns:
        datetime 객체
    """
    return datetime.strptime(date_str.strip(), format)
