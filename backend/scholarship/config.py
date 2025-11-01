"""
전역 설정과 기본값.
"""

# 크롤링 주기(일) - 외부 스케줄러가 이 주기로 호출
CRAWL_INTERVAL_DAYS: int = 3

# 기간 분기 임계(일): 이 값보다 크면 시작/마감 두 이벤트로 분리
DURATION_THRESHOLD_DAYS: int = 7

# 기본 정규식 패턴 (확장 가능)
DATE_PATTERN_DEFAULT: str = r"(\d{4})\.(\d{1,2})\.(\d{1,2})"
MONTH_PATTERN_DEFAULT: str = r"(\d{4})\.(\d{1,2})\s*월"

# 기본 크롤러 설정 예시 (필요 시 여러 개를 배열로 전달)
DEFAULT_CRAWLER_CONFIG = {
    "list_url": "https://scatch.ssu.ac.kr/%EA%B3%B5%EC%A7%80%EC%82%AC%ED%95%AD/?category=%EC%9E%A5%ED%95%99&f=all&keyword=%E2%98%85",
    "link_selectors": [
        "a.text-decoration-none.d-block.text-truncate",
    ],
    "content_selectors": [
        "#contents",
        "div.bg-white.p-4.mb-5 > div",
        "div.bg-white",
    ],
    "max_concurrency": 10,
    "timeout": 30,
    # 개별 크롤러마다 자유롭게 교체/추가 가능
    "date_patterns": [DATE_PATTERN_DEFAULT],
    "month_patterns": [MONTH_PATTERN_DEFAULT],
}

# 날짜 추출 허용 키워드(첫 날짜 표기 이전 텍스트에 포함되어야 함)
SCHEDULE_LABEL_KEYWORDS = [
    "접수기한",
    "접수기간",
    "제출기간",
    "제출기한",
    "서류심사",
]
