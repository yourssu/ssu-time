"""
통합 로깅 모듈
Lambda CloudWatch에 최적화된 로거를 제공합니다.
"""

import logging
import json
from datetime import datetime
from typing import Optional


def setup_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """
    Lambda에 최적화된 로거 설정

    Args:
        name: 로거 이름 (보통 모듈명)
        level: 로깅 레벨 (기본 INFO)

    Returns:
        설정된 Logger 객체
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Lambda는 기본적으로 CloudWatch로 출력되므로 StreamHandler 사용
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '[%(asctime)s] %(levelname)s [%(name)s] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


def log_execution_metrics(
    logger: logging.Logger,
    crawler_name: str,
    duration: float,
    events_count: int,
    s3_key: str
):
    """
    실행 메트릭을 JSON 형식으로 로깅
    CloudWatch Insights에서 쉽게 쿼리할 수 있도록 구조화

    Args:
        logger: Logger 객체
        crawler_name: 크롤러 이름
        duration: 실행 시간 (초)
        events_count: 생성된 이벤트 수
        s3_key: S3 저장 위치
    """
    metrics = {
        'crawler': crawler_name,
        'duration_seconds': round(duration, 2),
        'events_count': events_count,
        's3_key': s3_key,
        'timestamp': datetime.now().isoformat()
    }
    logger.info(f"Execution metrics: {json.dumps(metrics)}")


def log_crawler_start(logger: logging.Logger, crawler_name: str, url: str):
    """크롤링 시작 로그"""
    logger.info(f"{'='*50}")
    logger.info(f"{crawler_name} 크롤링 시작")
    logger.info(f"URL: {url}")
    logger.info(f"{'='*50}")


def log_crawler_complete(
    logger: logging.Logger,
    crawler_name: str,
    events_count: int,
    duration: float
):
    """크롤링 완료 로그"""
    logger.info(f"{'='*50}")
    logger.info(f"{crawler_name} 완료!")
    logger.info(f"이벤트 수: {events_count}개")
    logger.info(f"소요 시간: {duration:.2f}초")
    logger.info(f"{'='*50}")
