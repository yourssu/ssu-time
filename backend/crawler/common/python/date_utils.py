"""
날짜 유틸리티 모듈
모든 크롤러에서 사용하는 날짜 필터링 로직을 통합합니다.
"""

from datetime import datetime
from dateutil.relativedelta import relativedelta
import calendar as cal_module
from .config import DATE_PATTERNS
from .logger import setup_logger
import re
from re import Pattern
from zoneinfo import ZoneInfo

logger = setup_logger(__name__)

def get_datetime_from_text(text: str) -> datetime | tuple[datetime, datetime] | None:
    text = __remove_day_of_week(text)
    result = None
    if '~' in text:
        result = __find_range_datetime(text)
    
    if result is None:
        result = __find_single_datetime(text)
    
    return result

def __find_single_datetime(text: str) -> datetime:
    for pattern in DATE_PATTERNS:
        regex = __make_regex(pattern)
        match_string = regex.search(text)
        if match_string:
            result = datetime.strptime(match_string.group(), pattern)
            result = __restore_year(pattern, result)
            if (__is_to_old(result)):
                return
            result = __change_timezone(result)
            return result
    

def __find_range_datetime(text: str) -> tuple[datetime, datetime] | None:
    pattern_combination = []
    for pattern_a in DATE_PATTERNS:
        for pattern_b in DATE_PATTERNS:
            pattern_combination.append((pattern_a + " ~ " + pattern_b, (pattern_a, pattern_b)))
        pattern_combination.append((pattern_a + " ~ %H:%M", (pattern_a, "%H:%M")))
    
    for combination in pattern_combination:
        regex = __make_regex(combination[0])
        left_pattern, right_pattern = combination[1]
        match_string = regex.search(text)
        if match_string is None:
            continue
        left_string, right_string = [text.strip() for text in match_string.group().split("~")]
        left_time = datetime.strptime(left_string, left_pattern)
        left_time = __restore_year(left_pattern, left_time)
        right_time = datetime.strptime(right_string, right_pattern)
        right_time = __restore_year(right_pattern, right_time)

        if left_time >= right_time and left_time.year > right_time.year:
            right_time = right_time.replace(year = left_time.year)
        if right_pattern == "%H:%M":
            right_time = right_time.replace(year=left_time.year, month=left_time.month, day = left_time.day)

        if __is_to_old(right_time):
            return
        left_time = __change_timezone(left_time)
        right_time = __change_timezone(right_time)
        return (left_time, right_time)
    
    # No Match
    return None

def __change_timezone(time: datetime) -> datetime:
    return time.replace(tzinfo=ZoneInfo("Asia/Seoul"))

def __restore_year(pattern: str, date: datetime) -> datetime:
    if "%Y" in pattern:
        return date
    if "%y" in pattern:
        return date
    date = date.replace(year=datetime.now().year)
    return date

def __is_to_old(time: datetime) -> bool:
    return time.date() < datetime.now().date()

def __make_regex(pattern: str) -> Pattern:
    regex_string = pattern \
    .replace("%Y", "\\d{4}") \
    .replace("%m", "\\d{1,2}") \
    .replace("%d", "\\d{1,2}") \
    .replace("%a", "[월화수목금토일]") \
    .replace("%H", "\\d{1,2}") \
    .replace("%M", "\\d{1,2}") \
    .replace(".", "\\.") \
    .replace("(", "\\(").replace(")", "\\)") \
    .replace(" ", "\\s*")
    return re.compile(regex_string)

def __remove_day_of_week(string: str) -> str:
    string = re.sub("\\(\\s*[월화수목금토일]\\s*\\)", "" , string)
    string = re.sub("[월화수목금토일]요일", "", string)
    return string

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
