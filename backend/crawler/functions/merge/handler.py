#!/usr/bin/env python3
"""
ICS 병합 Lambda 함수
S3 raw/ 폴더의 ICS 파일들을 읽어서 카테고리별 조합으로 병합하여 merged/ 폴더에 업로드합니다.
"""

import sys
import os
import time
from typing import Dict, Set

# Lambda Layer에서 common 모듈 import
# Layer 구조: /opt/python/common/
sys.path.insert(0, '/opt/python')

from ics import Calendar

from common.logger import setup_logger, log_execution_metrics
from common.ics_builder import filter_events_by_categories
from common.s3_utils import download_ics, upload_ics, list_ics_files
from common.config import MERGE_COMBINATIONS, S3_BUCKET, S3_RAW_PREFIX, S3_MERGED_PREFIX

logger = setup_logger(__name__)


def merge_all_ics_files(bucket: str, raw_prefix: str) -> Calendar:
    """
    S3 raw/ 폴더의 모든 ICS 파일을 병합하여 하나의 Calendar 반환

    Args:
        bucket: S3 버킷 이름
        raw_prefix: raw 파일 접두사 (예: 'raw/')

    Returns:
        병합된 Calendar 객체
    """
    logger.info("=" * 70)
    logger.info("S3 raw/ 폴더에서 ICS 파일 병합 시작")
    logger.info("=" * 70)

    # raw/ 폴더의 모든 ICS 파일 조회
    ics_files = list_ics_files(bucket, raw_prefix)

    if not ics_files:
        logger.warning(f"S3 {raw_prefix}에 ICS 파일이 없습니다.")
        return Calendar()

    merged_calendar = Calendar()
    total_events = 0

    for s3_key in ics_files:
        logger.info(f"파일 다운로드 중: {s3_key}")

        ics_content = download_ics(bucket, s3_key)
        if not ics_content:
            logger.warning(f"  ⚠️  파일 다운로드 실패: {s3_key}")
            continue

        try:
            cal = Calendar(ics_content)
            event_count = len(cal.events)

            # 이벤트 추가
            for event in cal.events:
                merged_calendar.events.add(event)

            total_events += event_count
            logger.info(f"  ✓ {s3_key}: {event_count}개 이벤트 로드")

        except Exception as e:
            logger.error(f"  ✗ {s3_key} 파싱 실패: {e}")
            continue

    logger.info(f"\n총 {total_events}개 이벤트 병합 완료")
    logger.info("=" * 70)

    return merged_calendar


def merge_with_existing(bucket: str, merged_prefix: str, new_calendar: Calendar) -> Calendar:
    """
    기존 merged_all.ics와 새 Calendar를 UID 기반으로 병합

    Args:
        bucket: S3 버킷 이름
        merged_prefix: merged 파일 접두사 (예: 'merged/')
        new_calendar: 새로 병합된 Calendar 객체

    Returns:
        기존 이벤트와 병합된 Calendar 객체
    """
    events_by_uid = {}

    # 1. 기존 merged_all.ics 로드
    existing_key = f"{merged_prefix}merged_all.ics"
    existing_content = download_ics(bucket, existing_key)

    if existing_content:
        try:
            existing_cal = Calendar(existing_content)
            for event in existing_cal.events:
                events_by_uid[event.uid] = event
            logger.info(f"기존 이벤트 {len(existing_cal.events)}개 로드: {existing_key}")
        except Exception as e:
            logger.warning(f"기존 파일 파싱 실패, 새 이벤트만 사용: {e}")
    else:
        logger.info(f"기존 파일 없음, 새 이벤트만 사용: {existing_key}")

    # 2. 새 이벤트로 덮어쓰기
    for event in new_calendar.events:
        events_by_uid[event.uid] = event

    # 3. 최종 Calendar 생성
    merged_calendar = Calendar()
    for event in events_by_uid.values():
        merged_calendar.events.add(event)

    logger.info(f"병합 결과: 기존 + 신규 = {len(merged_calendar.events)}개 이벤트")
    return merged_calendar


def generate_category_combinations(
    merged_calendar: Calendar,
    combinations: Dict[str, Set[str]]
) -> Dict[str, str]:
    """
    카테고리 조합별로 필터링된 ICS 파일 생성

    Args:
        merged_calendar: 병합된 Calendar 객체
        combinations: 파일명 -> 카테고리 집합 매핑

    Returns:
        파일명 -> ICS 내용 딕셔너리
    """
    logger.info("카테고리 조합별 파일 생성 중...")
    logger.info("-" * 70)

    results = {}

    for filename, categories in combinations.items():
        # 카테고리 필터링
        filtered_cal = filter_events_by_categories(merged_calendar, categories)
        event_count = len(filtered_cal.events)

        # ICS 문자열 생성
        ics_content = str(filtered_cal)

        category_str = ', '.join(sorted(categories)) if categories else '없음'
        results[filename] = ics_content

        logger.info(f"  ✓ {filename:35s} {event_count:2d}개 이벤트 - [{category_str}]")

    logger.info("-" * 70)
    return results


def upload_merged_files(
    bucket: str,
    merged_prefix: str,
    files: Dict[str, str]
) -> Dict[str, dict]:
    """
    병합된 파일들을 S3 merged/ 폴더에 업로드

    Args:
        bucket: S3 버킷 이름
        merged_prefix: merged 파일 접두사 (예: 'merged/')
        files: 파일명 -> ICS 내용 딕셔너리

    Returns:
        파일명 -> 업로드 결과 딕셔너리
    """
    logger.info("S3 merged/ 폴더에 업로드 중...")
    logger.info("-" * 70)

    upload_results = {}

    for filename, ics_content in files.items():
        s3_key = f"{merged_prefix}{filename}"

        result = upload_ics(ics_content, bucket, s3_key)

        if result.get('success'):
            upload_results[filename] = result
            logger.info(f"  ✓ {filename}: {result.get('size'):,} bytes")
        else:
            logger.error(f"  ✗ {filename}: 업로드 실패 - {result.get('error')}")
            upload_results[filename] = result

    logger.info("-" * 70)
    return upload_results


def lambda_handler(event, context):
    """
    AWS Lambda 핸들러 함수

    Args:
        event: Lambda 이벤트 객체
        context: Lambda 컨텍스트 객체

    Returns:
        실행 결과 딕셔너리
    """
    start_time = time.time()

    logger.info("=" * 70)
    logger.info("ICS 파일 병합 Lambda 시작")
    logger.info("=" * 70)

    try:
        bucket = os.environ.get('S3_BUCKET', S3_BUCKET)
        raw_prefix = os.environ.get('S3_RAW_PREFIX', S3_RAW_PREFIX)
        merged_prefix = os.environ.get('S3_MERGED_PREFIX', S3_MERGED_PREFIX)

        # 1. S3 raw/ 폴더의 모든 ICS 파일 병합
        merged_calendar = merge_all_ics_files(bucket, raw_prefix)

        # 2. 기존 merged_all.ics와 병합 (이벤트 유실 방지)
        merged_calendar = merge_with_existing(bucket, merged_prefix, merged_calendar)

        if len(merged_calendar.events) == 0:
            logger.warning("병합할 이벤트가 없습니다.")
            return {
                'statusCode': 200,
                'body': {
                    'message': '병합할 이벤트가 없습니다.',
                    'total_events': 0,
                    'files_generated': 0
                }
            }

        # 3. 카테고리 조합별 파일 생성
        merged_files = generate_category_combinations(merged_calendar, MERGE_COMBINATIONS)

        # 4. S3 merged/ 폴더에 업로드
        upload_results = upload_merged_files(bucket, merged_prefix, merged_files)

        # 결과 통계
        success_count = sum(1 for r in upload_results.values() if r.get('success'))
        total_count = len(upload_results)

        duration = time.time() - start_time

        logger.info("=" * 70)
        logger.info("ICS 파일 병합 완료!")
        logger.info(f"  총 이벤트 수: {len(merged_calendar.events)}개")
        logger.info(f"  생성된 파일: {total_count}개")
        logger.info(f"  업로드 성공: {success_count}/{total_count}")
        logger.info(f"  소요 시간: {duration:.2f}초")
        logger.info("=" * 70)

        # 메트릭 로깅
        log_execution_metrics(
            logger,
            "merge",
            duration,
            len(merged_calendar.events),
            f"{merged_prefix}*"
        )

        return {
            'statusCode': 200,
            'body': {
                'total_events': len(merged_calendar.events),
                'files_generated': total_count,
                'upload_success': success_count,
                'upload_failed': total_count - success_count,
                'duration_seconds': round(duration, 2),
                's3_bucket': bucket,
                's3_merged_prefix': merged_prefix,
                'files': list(upload_results.keys())
            }
        }

    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"병합 실패: {e}", exc_info=True)

        return {
            'statusCode': 500,
            'body': {
                'error': str(e),
                'duration_seconds': round(duration, 2)
            }
        }


# 로컬 테스트용
if __name__ == "__main__":
    result = lambda_handler({}, None)
    print(result)
