"""
S3 유틸리티 모듈
ICS 파일을 S3에 업로드/다운로드하는 기능을 제공합니다.
"""

import boto3
from typing import Optional
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)
s3_client = boto3.client('s3')


def upload_ics(ics_content: str, bucket: str, key: str) -> dict:
    """
    ICS 파일을 S3에 업로드

    Args:
        ics_content: ICS 파일 내용
        bucket: S3 버킷 이름
        key: S3 객체 키

    Returns:
        업로드 결과 딕셔너리
    """
    try:
        response = s3_client.put_object(
            Bucket=bucket,
            Key=key,
            Body=ics_content.encode('utf-8'),
            ContentType='text/calendar',
            CacheControl='max-age=3600'
        )
        logger.info(f"S3 업로드 성공: s3://{bucket}/{key} ({len(ics_content)} bytes)")
        return {
            'success': True,
            'bucket': bucket,
            'key': key,
            'size': len(ics_content),
            'etag': response.get('ETag')
        }
    except ClientError as e:
        logger.error(f"S3 업로드 실패: {e}")
        return {
            'success': False,
            'error': str(e)
        }


def download_ics(bucket: str, key: str) -> Optional[str]:
    """
    S3에서 ICS 파일 다운로드

    Args:
        bucket: S3 버킷 이름
        key: S3 객체 키

    Returns:
        ICS 파일 내용 (실패시 None)
    """
    try:
        response = s3_client.get_object(Bucket=bucket, Key=key)
        content = response['Body'].read().decode('utf-8')
        logger.info(f"S3 다운로드 성공: s3://{bucket}/{key} ({len(content)} bytes)")
        return content
    except ClientError as e:
        if e.response['Error']['Code'] == 'NoSuchKey':
            logger.warning(f"S3 파일 없음: s3://{bucket}/{key}")
            return None
        else:
            logger.error(f"S3 다운로드 실패: {e}")
            raise


def list_ics_files(bucket: str, prefix: str) -> list:
    """
    S3 버킷에서 ICS 파일 목록 조회

    Args:
        bucket: S3 버킷 이름
        prefix: 검색할 접두사

    Returns:
        파일 키 리스트
    """
    try:
        response = s3_client.list_objects_v2(
            Bucket=bucket,
            Prefix=prefix
        )

        if 'Contents' not in response:
            return []

        files = [obj['Key'] for obj in response['Contents'] if obj['Key'].endswith('.ics')]
        logger.info(f"S3 파일 목록 조회: {len(files)}개 파일")
        return files

    except ClientError as e:
        logger.error(f"S3 목록 조회 실패: {e}")
        return []


def delete_ics(bucket: str, key: str) -> bool:
    """
    S3에서 ICS 파일 삭제

    Args:
        bucket: S3 버킷 이름
        key: S3 객체 키

    Returns:
        성공 여부
    """
    try:
        s3_client.delete_object(Bucket=bucket, Key=key)
        logger.info(f"S3 삭제 성공: s3://{bucket}/{key}")
        return True
    except ClientError as e:
        logger.error(f"S3 삭제 실패: {e}")
        return False
