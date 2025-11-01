const ICS_FILE_URL = 'https://seyeona-ha.github.io/ssu-calendar/ssu_2025_09.ics'

const toWebcalScheme = (url: string): string => url.replace(/^https?:/i, 'webcal:')

const getIcsFileName = () => {
  try {
    const fromUrl = decodeURIComponent(new URL(ICS_FILE_URL).pathname.split('/').pop() ?? '')
    return fromUrl || 'ssu-calendar.ics'
  } catch {
    return 'ssu-calendar.ics'
  }
}

export const getAppleCalendarUrl = (): string => toWebcalScheme(ICS_FILE_URL)

export const getGoogleCalendarUrl = (): string => {
  const cid = encodeURIComponent(toWebcalScheme(ICS_FILE_URL))
  return `https://calendar.google.com/calendar/u/0/r?cid=${cid}`
}

export const getGoogleCalendarIntentUrl = (): string => {
  const cid = encodeURIComponent(toWebcalScheme(ICS_FILE_URL))
  const fallback = encodeURIComponent(getGoogleCalendarUrl())
  return `intent://calendar.google.com/calendar/u/0/render?cid=${cid}#Intent;scheme=https;package=com.google.android.calendar;S.browser_fallback_url=${fallback};end`
}

export const downloadIcsFile = async (): Promise<void> => {
  const response = await fetch(ICS_FILE_URL)
  if (!response.ok) {
    throw new Error(`ICS 파일을 가져오지 못했습니다. (status: ${response.status})`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = getIcsFileName()

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
