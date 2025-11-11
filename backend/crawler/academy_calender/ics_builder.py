import requests
from bs4 import BeautifulSoup
from datetime import datetime, date
import vobject
import pytz
import uuid

cal = vobject.iCalendar()
#tz = pytz.timezone('Asia/Seoul')

def clean_date(date_text):
    text = ' '.join(date_text.split())
    text = text.replace(' ~ ', '~').replace('~ ', '~').replace(' ~', '~')
    return text.strip()

# 나중에는 국가 장학금, 학교 축제 일정도 추가
def crawling_year(year, month):
    url = f'https://ssu.ac.kr/%ED%95%99%EC%82%AC/%ED%95%99%EC%82%AC%EC%9D%BC%EC%A0%95/?years={year}'
    req = requests.get(url)
    soup = BeautifulSoup(req.text, 'html.parser')
    rows = soup.find_all('div', class_='row')
    
    seen = set()
    
    for r in rows:
        date_div = r.find('div', class_='col-12 col-lg-4 col-xl-3 font-weight-normal text-primary')
        title_div = r.find('div', class_='col-12 col-lg-8 col-xl-9')

        if not (date_div and title_div):
            continue

        date_cleaned = clean_date(date_div.get_text())
        title_text = ' '.join(title_div.get_text(strip=True).split())
        
        # 중복 row 제거
        key = (date_cleaned, title_text)
        if key in seen:
            continue
        seen.add(key)

        if '~' in date_cleaned:
            first_date, second_date = date_cleaned.split('~')
        else:
            first_date = second_date = date_cleaned
            
        first_date = first_date.strip().split('(')[0]
        second_date = second_date.strip().split('(')[0]

        if not first_date.startswith(str(year)):
            first_date = f"{year}.{first_date}"
        if not second_date.startswith(str(year)):
            second_date = f"{year}.{second_date}"
        
        first_date_obj = datetime.strptime(first_date.strip(), "%Y.%m.%d")
        second_date_obj = datetime.strptime(second_date.strip(), "%Y.%m.%d")

        if (year == 2025 and first_date_obj.month >= month) or (year == 2026 and first_date_obj.month <= month):
            make_ics(first_date_obj, second_date_obj, title_text)

def make_ics(startDate, endDate, title):
    duration_days = (endDate - startDate).days

    if duration_days < 7:
        vevent = cal.add('vevent')
        vevent.add('dtstart').value = datetime(startDate.year, startDate.month, startDate.day, 0, 0, 0)
        vevent.add('dtend').value = datetime(endDate.year, endDate.month, endDate.day, 0, 0, 0)
        vevent.add('summary').value = title
        vevent.add('categories').value = ["STANDARD"]
        vevent.add('uid').value = str(uuid.uuid4()) + "@yourssu.com"

    else:
        if "기간" in title:
            start_title = title.replace("기간", "시작")
            end_title = title.replace("기간", "마감")
        else:
            start_title = f"{title} 시작"
            end_title = f"{title} 마감"

        start_event = cal.add('vevent')
        start_event.add('dtstart').value = date(startDate.year, startDate.month, startDate.day)  # all-day
        start_event.add('summary').value = start_title
        start_event.add('categories').value = ["STANDARD"]
        start_event.add('uid').value = str(uuid.uuid4()) + "@yourssu.com"

        end_event = cal.add('vevent')
        end_event.add('dtstart').value = date(endDate.year, endDate.month, endDate.day)  # all-day
        end_event.add('summary').value = end_title
        end_event.add('categories').value = ["STANDARD"]
        end_event.add('uid').value = str(uuid.uuid4()) + "@yourssu.com"


crawling_year(2025, 10)
crawling_year(2026, 2)

with open('../academy_calender.ics', 'wb') as f:
    f.write(cal.serialize().encode('utf-8'))


