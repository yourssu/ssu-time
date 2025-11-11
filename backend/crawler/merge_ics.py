#!/usr/bin/env python3
"""
ICS 파일 병합 스크립트

crawler 폴더 내 3개의 ICS 파일을 하나로 병합합니다:
- academy_calender.ics (학사일정)
- my.ics (캠퍼스 행사)
- scholarships.ics (장학금 마감일)
"""

import sys
from pathlib import Path

# scholarship 모듈의 ics_builder를 import하기 위한 경로 설정
sys.path.append(str(Path(__file__).parent))

from scholarship.utils.ics_builder import merge_ics_texts


def merge_ics_files():
    """3개의 ICS 파일을 읽어서 하나로 병합"""

    # 현재 스크립트가 있는 디렉토리 (crawler 폴더)
    base_dir = Path(__file__).parent

    # 병합할 ICS 파일들
    ics_files = [
        base_dir / "academy_calender.ics",
        base_dir / "my.ics",
        base_dir / "scholarships.ics"
    ]

    # 출력 파일명
    output_file = base_dir / "merged_calendar.ics"

    print("=" * 60)
    print("ICS 파일 병합 시작")
    print("=" * 60)

    # 파일 존재 여부 확인 및 읽기
    ics_contents = []
    for ics_file in ics_files:
        if not ics_file.exists():
            print(f"⚠️  경고: {ics_file.name} 파일이 존재하지 않습니다.")
            continue

        try:
            with open(ics_file, 'r', encoding='utf-8') as f:
                content = f.read()
                ics_contents.append(content)
                # 이벤트 개수 추정 (VEVENT 개수로 계산)
                event_count = content.count('BEGIN:VEVENT')
                print(f"✓ {ics_file.name:25s} - {event_count:2d}개 이벤트")
        except Exception as e:
            print(f"✗ {ics_file.name} 읽기 실패: {e}")
            continue

    if not ics_contents:
        print("\n오류: 읽을 수 있는 ICS 파일이 없습니다.")
        return False

    print("\n" + "-" * 60)
    print(f"총 {len(ics_contents)}개 파일 로드 완료")
    print("-" * 60)

    # ICS 파일 병합 (기존 merge_ics_texts 함수 활용)
    # merge_ics_texts는 2개의 파일을 병합하므로, 순차적으로 병합
    try:
        print("\n병합 중...")
        merged_content = ics_contents[0]

        for i, next_content in enumerate(ics_contents[1:], 1):
            print(f"  - 파일 {i+1} 병합 중...")
            merged_content = merge_ics_texts(merged_content, next_content)

        # 병합된 이벤트 개수
        merged_event_count = merged_content.count('BEGIN:VEVENT')
        print(f"✓ 병합 완료: {merged_event_count}개 이벤트")

    except Exception as e:
        print(f"\n✗ 병합 실패: {e}")
        import traceback
        traceback.print_exc()
        return False

    # 결과 저장
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(merged_content)

        file_size = output_file.stat().st_size
        print(f"\n{'=' * 60}")
        print(f"✓ 저장 완료: {output_file.name}")
        print(f"  - 파일 크기: {file_size:,} bytes")
        print(f"  - 전체 경로: {output_file}")
        print(f"{'=' * 60}\n")

        return True

    except Exception as e:
        print(f"\n✗ 저장 실패: {e}")
        return False


if __name__ == "__main__":
    success = merge_ics_files()
    sys.exit(0 if success else 1)
