import React from 'react'
import { colors } from '../../theme/colors'
import { Progress } from './Progress'

type Variant = 'loading' | 'success' | 'sizeError' | 'fail'

interface StatusToastProps {
  visible: boolean
  variant: Variant
  title?: string
  subtitle?: string
  progress?: number // 0-100 (loading일 때만 사용)
}

export const StatusToast: React.FC<StatusToastProps> = ({ visible, variant, title, subtitle, progress }) => {
  if (!visible) return null

  const { circleColor, icon } = getIcon(variant)
  const defaultTexts = getDefaultTexts(variant)

  return (
    <div
      style={{
        position: 'fixed',
        right: '24px',
        bottom: '24px',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: colors.background.normal,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '18px 24px',
          borderRadius: '20px',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
          minWidth: '428px',
          height: '87px',
        }}
      >
        <div
          style={{
            width: '41px',
            height: '41px',
            borderRadius: '14px',
            background: circleColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto',
          }}
        >
          {icon}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '212px' }}>
          <div style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: '16px', color: colors.label.normal }}>
            {title ?? defaultTexts.title}
          </div>
          {(subtitle ?? defaultTexts.subtitle) && (
            <div style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: '13px', color: colors.label.normal }}>
              {subtitle ?? defaultTexts.subtitle}
            </div>
          )}
          {variant === 'loading' && typeof progress === 'number' && (
            <div style={{ marginTop: '12px' }}>
              <Progress value={progress} heightPx={6} />
              <div style={{ marginTop: '8px', fontSize: '12px', color: colors.label.neutral }}>
                {Math.floor(progress)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getDefaultTexts(variant: Variant): { title: string; subtitle: string } {
  switch (variant) {
    case 'loading':
      return { title: '발표 자료가 업로드 중이에요', subtitle: '' }
    case 'success':
      return { title: '업로드 완료!', subtitle: '발표 연습을 시작해보세요.' }
    case 'sizeError':
      return { title: '파일 크기 오류', subtitle: '20MB 이하의 파일만 업로드할 수 있어요.' }
    case 'fail':
    default:
      return { title: '업로드 실패', subtitle: '' }
  }
}

function getIcon(variant: Variant): { circleColor: string; icon: React.ReactNode } {
  if (variant === 'loading') {
    return {
      circleColor: '#3282FF',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 11C21.5523 11 22 11.4477 22 12C22 17.5228 17.5228 22 12 22C9.98405 22 8.10917 21.3999 6.53906 20.3739L5.20703 21.7069C4.92103 21.9929 4.49086 22.0785 4.11719 21.9237C3.74359 21.7689 3.5 21.4043 3.5 21V17C3.5 16.4477 3.94772 16 4.5 16H8.5C8.90442 16 9.26902 16.2436 9.42383 16.6172C9.57861 16.9909 9.49303 17.421 9.20703 17.707L7.99121 18.9219C9.17037 19.6065 10.5387 20 12 20C16.4183 20 20 16.4183 20 12C20 11.4477 20.4477 11 21 11ZM12 2C14.0155 2 15.8901 2.59952 17.46 3.625L18.793 2.29297C19.079 2.00698 19.5091 1.9214 19.8828 2.07617C20.2564 2.23099 20.5 2.59558 20.5 3V7C20.5 7.55228 20.0523 8 19.5 8H15.5C15.0956 8 14.731 7.75641 14.5762 7.38281C14.4214 7.00913 14.507 6.57896 14.793 6.29297L16.0078 5.07715C14.8289 4.393 13.4608 4 12 4C7.58172 4 4 7.58172 4 12C4 12.5523 3.55228 13 3 13C2.44772 13 2 12.5523 2 12C2 6.47715 6.47715 2 12 2Z" fill="white"/>
        </svg>
      ),
    }
  }
  if (variant === 'success') {
    return {
      circleColor: '#00C566',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
          <path d="M15 10L11 14L9 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    }
  }
  return {
    circleColor: '#FF4D27',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5"/>
        <rect x="12" y="16" width="0.01" height="0.01" stroke="white" strokeWidth="2.25"/>
        <path d="M12 12L12 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  }
}


