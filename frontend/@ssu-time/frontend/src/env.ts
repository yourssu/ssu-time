// 환경변수 타입 정의
interface Env {
  VITE_API_URL?: string;
  VITE_APP_NAME?: string;
  VITE_GOOGLE_CLIENT_ID?: string;
  VITE_GOOGLE_REDIRECT_URI?: string;
  VITE_NAVER_CLIENT_ID?: string;
  VITE_NAVER_REDIRECT_URI?: string;
}

// 환경변수 가져오기
const env: Env = {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME || '새 프로젝트',
  VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  VITE_GOOGLE_REDIRECT_URI: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
  VITE_NAVER_CLIENT_ID: import.meta.env.VITE_NAVER_CLIENT_ID,
  VITE_NAVER_REDIRECT_URI: import.meta.env.VITE_NAVER_REDIRECT_URI,
}

export default env 