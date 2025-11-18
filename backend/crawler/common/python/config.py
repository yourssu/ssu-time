"""
통합 설정 모듈
Lambda 환경 변수와 크롤러별 설정을 관리합니다.
"""

from dataclasses import dataclass
from pathlib import Path
import os

# S3 설정
S3_BUCKET = os.environ.get('S3_BUCKET', 'ssu-time-crawler-output')
S3_RAW_PREFIX = 'raw/'
S3_MERGED_PREFIX = 'merged/'


@dataclass
class CrawlerConfig:
    """크롤러 설정 데이터 클래스"""
    name: str
    category: str
    url: str
    output_key: str  # S3 키
    timeout: int = 300
    date_filter_months: int = 3
    duration_threshold_days: int = 7


# 총학생회 크롤러 설정
CHONGHAK_CONFIG = CrawlerConfig(
    name="chonghak",
    category="EVENT",  # or SCHOLARSHIP (동적 결정)
    url="https://stu.ssu.ac.kr/notice?category=중앙&sub=총학생회",
    output_key="raw/my.ics",
    timeout=300
)

# 학사일정 크롤러 설정
ACADEMIC_CONFIG = CrawlerConfig(
    name="academic_calendar",
    category="STANDARD",
    url="https://ssu.ac.kr/학사/학사일정/",
    output_key="raw/academy_calendar.ics",
    timeout=180
)

# 장학금 크롤러 설정
SCHOLARSHIP_CONFIG = CrawlerConfig(
    name="scholarship",
    category="SCHOLARSHIP",
    url="https://scatch.ssu.ac.kr/",
    output_key="raw/scholarships.ics",
    timeout=300
)

# 총학 키워드 필터
CHONGHAK_KEYWORDS = ["예비군", "장학", "특식", "개강", "주차"]

# 병합 파일 조합 정의
MERGE_COMBINATIONS = {
    'merged_empty.ics': set(),
    'merged_standard.ics': {'STANDARD'},
    'merged_scholarship.ics': {'SCHOLARSHIP'},
    'merged_event.ics': {'EVENT'},
    'merged_standard_scholarship.ics': {'STANDARD', 'SCHOLARSHIP'},
    'merged_standard_event.ics': {'STANDARD', 'EVENT'},
    'merged_scholarship_event.ics': {'SCHOLARSHIP', 'EVENT'},
    'merged_all.ics': {'STANDARD', 'SCHOLARSHIP', 'EVENT'},
}
