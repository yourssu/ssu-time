import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TopNavBar } from './components/ui/TopNavBar'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Practice } from './pages/Practice'
import { Result } from './pages/Result'
import { LoginPage } from './pages/LoginPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import PublicPage from './pages/Public'
import { register } from './lib/api'
import { colors } from './theme/colors'
import './App.css'
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
        className="app" 
        style={{ 
          width: '100vw', 
          minHeight: '100vh', 
          margin: 0, 
          padding: 0,
          backgroundColor: colors.background.normal,
          color: colors.label.normal,
          fontFamily: 'Pretendard, sans-serif',
        }}
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
              <main style={{ 
                maxWidth: isMobile ? '100%' : '1200px', 
                margin: '0 auto', 
                padding: isMobile ? '27px 20px 0' : '27px 70px 0',
                width: '100%',
                boxSizing: 'border-box',
                minHeight: 'calc(100vh - 80px)', // TopNavBar 높이 고려
              }}>
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