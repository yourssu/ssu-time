export type CalendarEvent = {
  title: string
  description?: string
  location?: string
  start: string
  end: string
}

export const ssuTimeLaunchEvent: CalendarEvent = {
  title: 'SSU Time 베타 오픈',
  description:
    'SSU Time 베타 서비스 사전 등록 알림입니다.\n신청 후 안내 드린 링크에서 업데이트 소식을 확인하세요.',
  location: '숭실대학교',
  start: '2025-03-01T09:00:00+09:00',
  end: '2025-03-01T10:00:00+09:00',
}

const ICS_LINE_BREAK = '\r\n'

const escapeIcsText = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')

const formatAsUtc = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

const buildIcsContent = (event: CalendarEvent): string => {
  const dtStamp = formatAsUtc(new Date().toISOString())
  const dtStart = formatAsUtc(event.start)
  const dtEnd = formatAsUtc(event.end)
  const uid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : dtStamp

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SSU Time//Calendar Export//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    event.description ? `DESCRIPTION:${escapeIcsText(event.description)}` : '',
    event.location ? `LOCATION:${escapeIcsText(event.location)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)

  return lines.join(ICS_LINE_BREAK)
}

const buildFileName = (title: string): string =>
  `${title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'event'}.ics`

export const triggerIcsDownload = (event: CalendarEvent) => {
  const blob = new Blob([buildIcsContent(event)], {
    type: 'text/calendar;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = buildFileName(event.title)

  // iOS Safari ignores the download attribute: fall back to opening the blob URL.
  if (/iP(ad|hone|od)/.test(navigator.userAgent)) {
    window.location.href = url
  } else {
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 0)
}

export const buildGoogleCalendarUrl = (event: CalendarEvent): string => {
  const start = formatAsUtc(event.start)
  const end = formatAsUtc(event.end)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
  })

  if (event.description) {
    params.set('details', event.description)
  }

  if (event.location) {
    params.set('location', event.location)
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export const detectPlatform = (): 'ios' | 'android' | 'other' => {
  if (typeof navigator === 'undefined') return 'other'

  const opera = typeof window !== 'undefined' && 'opera' in window ? (window as any).opera : ''
  const ua = navigator.userAgent || navigator.vendor || opera || ''

  if (/android/i.test(ua)) return 'android'
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'

  return 'other'
}
