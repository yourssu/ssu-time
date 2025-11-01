import { useEffect, useMemo, useState } from 'react'
import {
  detectPlatform,
  downloadIcsFile,
  getAppleCalendarUrl,
  getGoogleCalendarUrl,
} from '../lib/calendar'

type Platform = 'ios' | 'android' | 'other'

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const primaryButton = `${buttonBase} bg-ssu-primary text-white hover:bg-ssu-primary-dark focus-visible:outline-ssu-primary`
const secondaryButton = `${buttonBase} border border-ssu-muted/40 text-ssu-text hover:border-ssu-primary hover:text-ssu-primary focus-visible:outline-ssu-primary`

export function CalendarExportSection() {
  const [platform, setPlatform] = useState<Platform>('other')
  const [isProcessing, setIsProcessing] = useState(false)

  const appleCalendarUrl = useMemo(() => getAppleCalendarUrl(), [])
  const httpsFallbackUrl = useMemo(
    () => appleCalendarUrl.replace(/^webcal:/i, 'https:'),
    [appleCalendarUrl],
  )
  const googleCalendarUrl = useMemo(() => getGoogleCalendarUrl(), [])

  useEffect(() => {
    setPlatform(detectPlatform())
  }, [])

  const handleAppleCalendar = async () => {
    if (platform === 'ios') {
      window.location.href = appleCalendarUrl
      return
    }

    try {
      setIsProcessing(true)
      await downloadIcsFile()
    } catch (error) {
      console.error('ICS 파일 다운로드 실패', error)
      window.open(httpsFallbackUrl, '_blank', 'noopener')
    } finally {
      setIsProcessing(false)
    }
  }

  const renderButtons = () => {
    switch (platform) {
      case 'ios':
        return (
          <button type="button" className={primaryButton} onClick={handleAppleCalendar}>
            애플 캘린더에 추가
          </button>
        )
      case 'android':
        return (
          <a className={primaryButton} href={googleCalendarUrl} target="_blank" rel="noreferrer">
            구글 캘린더에서 보기
          </a>
        )
      default:
        return (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              className={primaryButton}
              onClick={handleAppleCalendar}
              disabled={isProcessing}
            >
              {isProcessing ? '다운로드 중…' : '애플 캘린더(.ics)'}
            </button>
            <a className={secondaryButton} href={googleCalendarUrl} target="_blank" rel="noreferrer">
              구글 캘린더 열기
            </a>
          </div>
        )
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-ssu-muted/20 bg-white p-10 text-center shadow-sm">
      <h2 className="text-2xl font-semibold text-ssu-text md:text-3xl">일정 받아보기</h2>
      <p className="text-sm leading-relaxed text-ssu-muted md:text-base">
        베타 오픈 일정을 캘린더에 바로 추가하고 놓치지 마세요. 사용하는 플랫폼에 맞는 캘린더를 안내해 드립니다.
      </p>
      <div className="mt-2 flex justify-center">{renderButtons()}</div>
      <p className="text-xs text-ssu-muted/80">
        다른 일정으로 활용하고 싶다면 .ics 파일을 내려받아 캘린더 앱에서 가져올 수 있습니다.
      </p>
    </section>
  )
}
