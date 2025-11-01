export type CalendarType = 'basic' | 'scholarship' | 'student-council'

const ICS_FILE_URLS: Record<CalendarType, string> = {
  basic: 'https://seyeona-ha.github.io/ssu-calendar/ssu_2025_09.ics',
  scholarship: 'https://seyeona-ha.github.io/ssu-calendar/ssu_2025_09_scholarship.ics',
  'student-council': 'https://seyeona-ha.github.io/ssu-calendar/ssu_2025_09_student_council.ics',
}

const getIcsFileUrl = (type: CalendarType = 'basic'): string => ICS_FILE_URLS[type]

const toWebcalScheme = (url: string): string => url.replace(/^https?:/i, 'webcal:')

const getIcsFileName = (type: CalendarType = 'basic') => {
  try {
    const url = getIcsFileUrl(type)
    const fromUrl = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '')
    return fromUrl || 'ssu-calendar.ics'
  } catch {
    return 'ssu-calendar.ics'
  }
}

export const getAppleCalendarUrl = (type: CalendarType = 'basic'): string =>
  toWebcalScheme(getIcsFileUrl(type))

export const getGoogleCalendarUrl = (type: CalendarType = 'basic'): string => {
  const cid = encodeURIComponent(toWebcalScheme(getIcsFileUrl(type)))
  return `https://calendar.google.com/calendar/u/0/r?cid=${cid}`
}

export const getGoogleCalendarIntentUrl = (type: CalendarType = 'basic'): string => {
  const cid = encodeURIComponent(toWebcalScheme(getIcsFileUrl(type)))
  const fallback = encodeURIComponent(getGoogleCalendarUrl(type))
  return `intent://calendar.google.com/calendar/u/0/render?cid=${cid}#Intent;scheme=https;package=com.google.android.calendar;S.browser_fallback_url=${fallback};end`
}

export const downloadIcsFile = async (type: CalendarType = 'basic'): Promise<void> => {
  const url = getIcsFileUrl(type)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`ICS 파일을 가져오지 못했습니다. (status: ${response.status})`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = getIcsFileName(type)

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(objectUrl)
}

export const detectPlatform = (): 'ios' | 'android' | 'other' => {
  if (typeof navigator === 'undefined') return 'other'

  const opera = typeof window !== 'undefined' && 'opera' in window ? (window as any).opera : ''
  const ua = navigator.userAgent || navigator.vendor || opera || ''

  if (/android/i.test(ua)) return 'android'
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'

  return 'other'
}
