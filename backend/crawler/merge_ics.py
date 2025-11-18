#!/usr/bin/env python3
"""
ICS 파일 병합 스크립트 (카테고리 조합별 파일 생성)

crawler 폴더 내 3개의 ICS 파일을 읽어서 카테고리 조합별로 8개의 파일을 생성합니다:
- academy_calender.ics (학사일정 - STANDARD)
- my.ics (캠퍼스 행사 - EVENT, SCHOLARSHIP)
- scholarships.ics (장학금 마감일 - SCHOLARSHIP)

카테고리 조합 (2^3 = 8개):
1. merged_empty.ics - 빈 파일
2. merged_standard.ics - STANDARD만
3. merged_scholarship.ics - SCHOLARSHIP만
4. merged_event.ics - EVENT만
5. merged_standard_scholarship.ics - STANDARD + SCHOLARSHIP
6. merged_standard_event.ics - STANDARD + EVENT
7. merged_scholarship_event.ics - SCHOLARSHIP + EVENT
8. merged_all.ics - STANDARD + SCHOLARSHIP + EVENT (전체)
"""

import sys
from pathlib import Path
from itertools import combinations

# scholarship 모듈의 ics_builder를 import하기 위한 경로 설정
sys.path.append(str(Path(__file__).parent))

from ics import Calendar


def filter_events_by_categories(calendar: Calendar, included_categories: set) -> Calendar:
    """
    카테고리 조합에 맞는 이벤트만 필터링하여 새 캘린더 반환

    Args:
        calendar: 원본 캘린더
        included_categories: 포함할 카테고리 집합 (예: {'STANDARD', 'SCHOLARSHIP'})

    Returns:
        필터링된 캘린더
    """
    filtered_cal = Calendar()

    for event in calendar.events:
        # 이벤트의 카테고리 확인
        event_categories = event.categories if event.categories else set()

        # 이벤트의 카테고리가 포함할 카테고리와 교집합이 있으면 추가
        if event_categories & included_categories:
            filtered_cal.events.add(event)

    return filtered_cal


def merge_ics_files():
    """3개의 ICS 파일을 읽어서 카테고리 조합별로 8개의 파일 생성"""

    # 현재 스크립트가 있는 디렉토리 (crawler 폴더)
    base_dir = Path(__file__).parent

    # 병합할 ICS 파일들
    ics_files = [
        base_dir / "academy_calender.ics",
        base_dir / "my.ics",
        base_dir / "scholarships.ics"
    ]

    print("=" * 70)
    print("ICS 파일 카테고리별 조합 생성 시작")
    print("=" * 70)

    # 모든 파일을 하나의 캘린더로 병합
    merged_calendar = Calendar()

    for ics_file in ics_files:
        if not ics_file.exists():
            print(f"⚠️  경고: {ics_file.name} 파일이 존재하지 않습니다.")
            continue

        try:
            with open(ics_file, 'r', encoding='utf-8') as f:
                content = f.read()
                cal = Calendar(content)

                # 이벤트 추가 (중복 체크는 나중에)
                for event in cal.events:
                    merged_calendar.events.add(event)

                event_count = len(cal.events)
                print(f"✓ {ics_file.name:25s} - {event_count:2d}개 이벤트 로드")

        except Exception as e:
            print(f"✗ {ics_file.name} 읽기 실패: {e}")
            continue

    total_events = len(merged_calendar.events)
    print(f"\n총 {total_events}개 이벤트 로드 완료")

    # 카테고리 종류 정의
    all_categories = {'STANDARD', 'SCHOLARSHIP', 'EVENT'}

    # 8가지 조합 생성 (공집합 포함)
    # 0개, 1개, 2개, 3개 조합
    category_combinations = [set()]  # 빈 집합부터 시작

    # 1개 선택
    for cat in all_categories:
        category_combinations.append({cat})

    # 2개 선택
    for combo in combinations(all_categories, 2):
        category_combinations.append(set(combo))

    # 3개 선택 (전체)
    category_combinations.append(all_categories)

    # 파일명 매핑
    filename_map = {
        frozenset(): "merged_empty.ics",
        frozenset({'STANDARD'}): "merged_standard.ics",
        frozenset({'SCHOLARSHIP'}): "merged_scholarship.ics",
        frozenset({'EVENT'}): "merged_event.ics",
        frozenset({'STANDARD', 'SCHOLARSHIP'}): "merged_standard_scholarship.ics",
        frozenset({'STANDARD', 'EVENT'}): "merged_standard_event.ics",
        frozenset({'SCHOLARSHIP', 'EVENT'}): "merged_scholarship_event.ics",
        frozenset({'STANDARD', 'SCHOLARSHIP', 'EVENT'}): "merged_all.ics",
    }

    print("\n" + "-" * 70)
    print("카테고리 조합별 파일 생성 중...")
    print("-" * 70)

    results = []

    for categories in category_combinations:
        # 파일명 결정
        filename = filename_map[frozenset(categories)]
        output_file = base_dir / filename

        # 카테고리 필터링
        if categories:
            filtered_cal = filter_events_by_categories(merged_calendar, categories)
        else:
            # 빈 파일
            filtered_cal = Calendar()

        event_count = len(filtered_cal.events)

        # 파일 저장
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(str(filtered_cal))

            file_size = output_file.stat().st_size
            category_str = ', '.join(sorted(categories)) if categories else '없음'

            results.append({
                'filename': filename,
                'categories': category_str,
                'count': event_count,
                'size': file_size
            })

        except Exception as e:
            print(f"✗ {filename} 저장 실패: {e}")

    # 결과 출력
    print("\n" + "=" * 70)
    print("생성 완료!")
    print("=" * 70)

    # 파일명 길이에 맞춰 정렬하여 출력
    for result in sorted(results, key=lambda x: x['count']):
        filename = result['filename']
        categories = result['categories']
        count = result['count']
        size = result['size']

        print(f"✓ {filename:35s} {count:2d}개 이벤트 ({size:6,}B) - [{categories}]")

    print("=" * 70 + "\n")

    return True


if __name__ == "__main__":
    success = merge_ics_files()
    sys.exit(0 if success else 1)
