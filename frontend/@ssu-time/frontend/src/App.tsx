import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import clsx from 'clsx'
import { TopNavBar } from './components/ui/TopNavBar'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Practice } from './pages/Practice'
import { Result } from './pages/Result'
import { LoginPage } from './pages/LoginPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import PublicPage from './pages/Public'
import { register } from './lib/api'
import { useIsMobile } from './hooks/useIsMobile'

function App() {
  const isMobile = useIsMobile(480)

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        try {
          await register();
        } catch (error) {
          console.error('자동 회원가입 실패:', error);
        }
      }

      // 초기화 상태를 전역 블로킹 없이 진행
    };

    initializeAuth();
  }, []);

  // 초기화 완료 전에도 UI를 즉시 렌더링하고, 내부 라우트에서 필요한 곳만 로딩 처리

  return (
    <BrowserRouter>
      <div
        className={clsx(
          'min-h-screen w-screen',
          'bg-ssu-background font-pretendard text-ssu-text'
        )}
      >
        <Routes>
          {/* Practice 페이지는 독립적 레이아웃 */}
          <Route path="/practice" element={<Practice />} />
          
          {/* Result 페이지는 독립적 레이아웃 */}
          <Route path="/result" element={<Result />} />
          {/* Public 보기 페이지 (storedName은 query param: ?file=uuid) */}
          <Route path="/public" element={<PublicPage />} />
          
          {/* Login 페이지는 독립적 레이아웃 */}
          <Route path="/login" element={<LoginPage />} />

          {/* OAuth 콜백 페이지는 독립적 레이아웃 */}
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/auth/callback/naver" element={<AuthCallbackPage />} />
          
          {/* 다른 페이지들은 기본 레이아웃 */}
          <Route path="/*" element={
            <>
              <TopNavBar />
              <main
                className={clsx(
                  'box-border w-full',
                  'min-h-[calc(100vh-80px)] pt-[27px]',
                  isMobile
                    ? 'px-5'
                    : 'mx-auto max-w-[1200px] px-[70px]'
                )}
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App 
