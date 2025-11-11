import re
from datetime import datetime
from typing import List, Tuple, Dict

from config import DURATION_THRESHOLD_DAYS


def extract_foundation_name(raw_title: str) -> str:
    title = raw_title.strip()
    title = re.sub(r'^★+\s*', '', title)
    title = re.sub(r'^\(재공지\)\s*', '', title)
    title = re.sub(r'\(기한\s*연장\)', '', title)
    title = re.sub(r'\s+', ' ', title)

    m = re.search(r'([가-힣A-Za-z0-9·]+(?:장학재단|장학회|재단))', title)
    if m:
        return m.group(1)
    m = re.search(r'㈜?\s*([가-힣A-Za-z0-9·]+)\s*(?:장학생|장학금)', title)
    if m:
        return m.group(1)

    t2 = re.sub(r'\d{4}학년도?\s*\d?학기?', '', title)
    t2 = re.sub(r'(선발\s*공고|추천\s*공고|모집\s*공고|공고)', '', t2)
    t2 = t2.strip()
    m = re.search(r'㈜?\s*([가-힣A-Za-z0-9·]{2,})', t2)
    if m:
        return m.group(1)
    return title.split()[0] if title.split() else title


def _is_application_label(label: str) -> bool:
    # 신청성 일정 분류 키워드 확대: 제출 포함
    return bool(re.search(r'(신청|접수|모집|추천|제출)', label))


def build_events_from_schedule_item(
    foundation: str,
    label: str,
    dates: List[Tuple[int, int, int]],
    link: str,
    duration_threshold_days: int = DURATION_THRESHOLD_DAYS,
) -> List[Dict]:
    sdates = sorted(dates)
    start = datetime(sdates[0][0], sdates[0][1], sdates[0][2]).date()
    end = datetime(sdates[-1][0], sdates[-1][1], sdates[-1][2]).date()

    final_events: List[Dict] = []

    def _pack(ev_title: str, dts: List[Tuple[int, int, int]]):
        final_events.append({
            'title': ev_title,
            'dates': dts,
            'url': link,
        })

    if len(sdates) == 1:
        _pack(f"{foundation} 장학금 마감", sdates)
        return final_events

    delta_days = (end - start).days + 1
    if _is_application_label(label):
        if delta_days <= duration_threshold_days:
            _pack(f"{foundation} 장학금 신청기간", sdates)
        else:
            _pack(f"{foundation} 장학금 신청 시작", [sdates[0]])
            _pack(f"{foundation} 장학금 신청 마감", [sdates[-1]])
    else:
        if delta_days <= duration_threshold_days:
            _pack(f"{foundation} 장학금 {label}", sdates)
        else:
            _pack(f"{foundation} 장학금 {label} 시작", [sdates[0]])
            _pack(f"{foundation} 장학금 {label} 마감", [sdates[-1]])

    return final_events
