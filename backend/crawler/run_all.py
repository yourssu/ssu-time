#!/usr/bin/env python3
"""
모든 크롤러를 순차적으로 실행하고 ICS 파일을 병합하는 통합 스크립트

실행 순서:
1. academy_calender 크롤러 (학사일정)
2. chonghak 크롤러 (총학생회 공지)
3. scholarship 크롤러 (장학금)
4. merge_ics (카테고리별 병합)
"""

import subprocess
import sys
from pathlib import Path
from datetime import datetime
import time


def run_crawler(name: str, script_path: Path, cwd: Path) -> dict:
    """
    크롤러를 실행하고 결과를 반환

    Args:
        name: 크롤러 이름
        script_path: 실행할 스크립트 경로
        cwd: 작업 디렉토리

    Returns:
        실행 결과 딕셔너리 {success, duration, error}
    """
    print("=" * 70)
    print(f"🚀 {name} 크롤러 실행 중...")
    print(f"   스크립트: {script_path.relative_to(Path.cwd())}")
    print(f"   작업 디렉토리: {cwd.relative_to(Path.cwd())}")
    print("=" * 70)

    start_time = time.time()

    try:
        # 크롤러 실행
        result = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=str(cwd),
            capture_output=True,
            text=True,
            timeout=300  # 5분 타임아웃
        )

        duration = time.time() - start_time

        # 표준 출력 표시
        if result.stdout:
            print(result.stdout)

        # 표준 에러 표시
        if result.stderr:
            print("⚠️  경고/에러 메시지:")
            print(result.stderr)

        if result.returncode == 0:
            print(f"✓ {name} 크롤러 완료 ({duration:.2f}초)")
            return {"success": True, "duration": duration, "error": None}
        else:
            print(f"✗ {name} 크롤러 실패 (종료 코드: {result.returncode})")
            return {"success": False, "duration": duration, "error": f"Exit code {result.returncode}"}

    except subprocess.TimeoutExpired:
        duration = time.time() - start_time
        print(f"✗ {name} 크롤러 타임아웃 (5분 초과)")
        return {"success": False, "duration": duration, "error": "Timeout"}

    except Exception as e:
        duration = time.time() - start_time
        print(f"✗ {name} 크롤러 실행 중 예외 발생: {e}")
        return {"success": False, "duration": duration, "error": str(e)}


def main():
    """메인 실행 함수"""
    print("\n" + "=" * 70)
    print("🎯 전체 크롤러 실행 시작")
    print(f"   시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70 + "\n")

    overall_start = time.time()

    # 기본 경로 설정
    base_dir = Path(__file__).parent / "functions"  # crawler 폴더

    # 크롤러 설정
    crawlers = [
        {
            "name": "학사일정 (academy_calender)",
            "script": base_dir / "academy_calender" / "handler.py",
            "cwd": base_dir / "academy_calender"
        },
        {
            "name": "총학생회 공지 (chonghak)",
            "script": base_dir / "chonghak" / "handler.py",
            "cwd": base_dir / "chonghak"
        },
        {
            "name": "장학금 (scholarship)",
            "script": base_dir / "scholarship" / "handler.py",
            "cwd": base_dir / "scholarship"
        }
    ]

    # 결과 저장
    results = []

    # 각 크롤러 순차 실행
    for crawler in crawlers:
        result = run_crawler(
            name=crawler["name"],
            script_path=crawler["script"],
            cwd=crawler["cwd"]
        )
        results.append({
            "name": crawler["name"],
            **result
        })
        print()  # 줄바꿈

    # ICS 파일 병합
    print("=" * 70)
    print("🔗 ICS 파일 병합 중...")
    print("=" * 70)

    merge_result = run_crawler(
        name="ICS 병합",
        script_path=base_dir / "merge_ics.py",
        cwd=base_dir
    )
    results.append({
        "name": "ICS 병합",
        **merge_result
    })

    overall_duration = time.time() - overall_start

    # 최종 결과 요약
    print("\n" + "=" * 70)
    print("📊 실행 결과 요약")
    print("=" * 70)

    success_count = sum(1 for r in results if r["success"])
    total_count = len(results)

    for result in results:
        status = "✓" if result["success"] else "✗"
        name = result["name"]
        duration = result["duration"]
        error = result.get("error", "")

        if result["success"]:
            print(f"{status} {name:35s} - {duration:6.2f}초")
        else:
            print(f"{status} {name:35s} - 실패 ({error})")

    print("-" * 70)
    print(f"성공: {success_count}/{total_count}")
    print(f"전체 소요 시간: {overall_duration:.2f}초")
    print("=" * 70 + "\n")

    # 종료 코드: 모든 작업이 성공하면 0, 하나라도 실패하면 1
    if success_count == total_count:
        print("🎉 모든 크롤러 실행 완료!")
        return 0
    else:
        print("⚠️  일부 크롤러 실행 실패")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
