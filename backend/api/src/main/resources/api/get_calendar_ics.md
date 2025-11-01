### 개요

-**기능**: 키별로 S3에 저장된 ICS를 프록시하여 `text/calendar`로 반환

-**Base URL**: `https://{도메인}`

-**버전**: `v1`

-**인증**: 없음

-**캐싱**: `Cache-Control: public, max-age=300` (5분)

### webcal 사용

-**구독용 링크**: `webcal://{도메인}/api/v1/calendars/{key}` 또는 `webcal://{도메인}/api/v1/calendars/{key}.ics`

- 클라이언트(캘린더 앱)는 내부적으로 동일 경로를 HTTPS로 호출하여 ICS를 가져갑니다.

### 키 규칙

- chips: 기본형(b=1), 행사형(e=2), 장학형(s=4) → 조합 7개
- 키 문자열(소문자, 알파벳순): `b`, `e`, `s`, `be`, `bs`, `es`, `bes`
- 파일명 권장: `{key}.ics`

---

### 엔드포인트

#### GET /api/calendars/

#### GET /api/calendars/(key).ics

요청

- Path params

-`key` (string): `b|e|s|be|bs|es|bes`

응답 (성공: 200 OK)

- Headers

-`Content-Type: text/calendar; charset=utf-8`

-`Content-Disposition: inline; filename="{key}.ics"`

-`Cache-Control: public, max-age=300`

- Body: ICS 바이너리

오류

- 404 Not Found: 등록되지 않은 `key`
- 502 Bad Gateway: S3에서 ICS 가져오기 실패
- 5xx: 서버 오류

예시

```bash

curl-fSLhttps://{도메인}/api/v1/calendars/bes.ics-obes.ics\

  -H 'Accept: text/calendar'

```

```http

GET /api/v1/calendars/bes HTTP/1.1

Host: {도메인}

Accept: text/calendar


HTTP/1.1 200 OK

Content-Type: text/calendar; charset=utf-8

Content-Disposition: inline; filename="bes.ics"

Cache-Control: public, max-age=300


BEGIN:VCALENDAR

VERSION:2.0

PRODID:-//YOURSSU//Calendar//EN

... 실제 S3 원본 ICS 내용 ...

END:VCALENDAR

```

---

### 운영/구성 참고사항

- RDS 연동 토글: `app.calendar.rds.enabled=true` 설정 시 MySQL `calendar_link`에서 `key`→`s3_url` 조회
- 기본값은 RDS 비활성(스텁 레포지토리 사용)으로 부팅 가능
- 외부 API 계약에는 영향 없음

MySQL 스키마(제안)

```sql

CREATETABLEcalendar_link (

  id BIGINT AUTO_INCREMENT PRIMARY KEY,

`key`VARCHAR(16) NOT NULL,

  s3_url VARCHAR(2048) NOT NULL,

  updated_at TIMESTAMPNOT NULLDEFAULT CURRENT_TIMESTAMP ONUPDATE CURRENT_TIMESTAMP,

UNIQUEKEY uq_calendar_link_key (`key`)

);


INSERT INTO calendar_link (`key`, s3_url) VALUES

('b',   'https://s3....../b.ics'),

('e',   'https://s3....../e.ics'),

('s',   'https://s3....../s.ics'),

('be',  'https://s3....../be.ics'),

('bs',  'https://s3....../bs.ics'),

('es',  'https://s3....../es.ics'),

('bes', 'https://s3....../bes.ics');

```
