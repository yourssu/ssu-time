import React from 'react'
import { TopNavBar } from '../components/ui/TopNavBar'
import env from '../env'

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
    <path
      d="M23.9996 19.6363V28.9309H36.916C36.3488 31.9199 34.6468 34.4509 32.0941 36.1527L39.8831 42.1964C44.4213 38.0075 47.0395 31.8547 47.0395 24.5456C47.0395 22.8438 46.8868 21.2073 46.6031 19.6366L23.9996 19.6363Z"
      fill="#4285F4"
    />
    <path
      d="M10.5494 28.568L8.79263 29.9128L2.57434 34.7564C6.52342 42.589 14.6174 48 23.9991 48C30.4789 48 35.9116 45.8618 39.8826 42.1964L32.0936 36.1528C29.9554 37.5927 27.2281 38.4656 23.9991 38.4656C17.7591 38.4656 12.4575 34.2547 10.5592 28.5819L10.5494 28.568Z"
      fill="#34A853"
    />
    <path
      d="M2.57436 13.2436C0.938084 16.4726 0 20.1163 0 23.9999C0 27.8834 0.938084 31.5271 2.57436 34.7561C2.57436 34.7777 10.5599 28.5597 10.5599 28.5597C10.08 27.1197 9.79624 25.5925 9.79624 23.9996C9.79624 22.4067 10.08 20.8795 10.5599 19.4395L2.57436 13.2436Z"
      fill="#FBBC05"
    />
    <path
      d="M23.9996 9.55636C27.5342 9.55636 30.676 10.7781 33.1851 13.1345L40.0577 6.2619C35.8904 2.37833 30.4797 0 23.9996 0C14.6179 0 6.52342 5.38908 2.57434 13.2437L10.5597 19.44C12.4578 13.7672 17.7596 9.55636 23.9996 9.55636Z"
      fill="#EA4335"
    />
  </svg>
)

const NaverIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M0.0455841 0L0 15.9484L5.53846 15.9742L5.56125 9.52258L5.19658 7.50968L10.4387 15.9484L16 16L15.9772 0.051613L10.416 0.0258068L10.5299 6.60645L10.8946 8.95484L5.56125 0.0258068L0.0455841 0Z"
      fill="#00C566"
    />
  </svg>
)

interface LoginButtonProps {
  icon: React.ReactNode
  text: string
  onClick?: () => void
}

const LoginButton: React.FC<LoginButtonProps> = ({ icon, text, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-[50px] w-full items-center justify-center gap-5 rounded-[10px] border border-ssu-muted/40 bg-ssu-background text-[16px] font-medium text-ssu-text transition-colors hover:border-ssu-primary hover:bg-ssu-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ssu-primary/30"
  >
    <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
    <span className="whitespace-nowrap">{text}</span>
  </button>
)

export const LoginPage: React.FC = () => {
  const handleGoogleLogin = () => {
    const clientId = env.VITE_GOOGLE_CLIENT_ID
    const redirectUri =
      env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`

    if (!clientId) {
      console.error('Google Client ID가 설정되지 않았습니다.')
      return
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.append('client_id', clientId)
    authUrl.searchParams.append('redirect_uri', redirectUri)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', 'openid email profile')
    authUrl.searchParams.append('access_type', 'offline')
    authUrl.searchParams.append('prompt', 'consent')

    window.location.href = authUrl.toString()
  }

  const handleNaverLogin = () => {
    const clientId = env.VITE_NAVER_CLIENT_ID
    const redirectUri =
      env.VITE_NAVER_REDIRECT_URI || `${window.location.origin}/auth/callback/naver`

    if (!clientId) {
      console.error('Naver Client ID가 설정되지 않았습니다.')
      return
    }

    const state = Math.random().toString(36).substring(2, 15)
    sessionStorage.setItem('naver_oauth_state', state)

    const authUrl = new URL('https://nid.naver.com/oauth2.0/authorize')
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('client_id', clientId)
    authUrl.searchParams.append('redirect_uri', redirectUri)
    authUrl.searchParams.append('state', state)

    window.location.href = authUrl.toString()
  }

  return (
    <>
      <TopNavBar />
      <div className="flex h-[calc(100vh-60px)] w-full flex-col items-center justify-center gap-14 bg-ssu-background">
        <div className="flex w-full max-w-[400px] flex-col items-center gap-4 px-5">
          <img
            src="/logo.svg"
            alt="SSU Time 로고"
            className="h-12 w-[215px]"
            loading="lazy"
          />
          <div className="flex w-full flex-col items-center gap-[17px] text-center">
            <h1 className="text-[22px] font-semibold leading-[22px] text-ssu-text">
              발표 준비, 여기서 한 번에 끝내세요
            </h1>
            <p className="text-sm text-ssu-muted">
              SSU Time과 함께 발표 자료 업로드부터 연습, 결과 공유까지 편리하게 진행해 보세요.
            </p>
          </div>
        </div>
        <div className="flex w-full max-w-[400px] flex-col items-stretch gap-4 px-5">
          <LoginButton
            icon={<GoogleIcon />}
            text="구글로 로그인하기"
            onClick={handleGoogleLogin}
          />
          <LoginButton
            icon={<NaverIcon />}
            text="네이버로 로그인하기"
            onClick={handleNaverLogin}
          />
        </div>
      </div>
    </>
  )
}
