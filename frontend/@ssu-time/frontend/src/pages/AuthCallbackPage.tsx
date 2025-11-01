import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { isLoggedInAtom, userAtom } from '../atoms/auth';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { ErrorModal } from '../components/ui/ErrorModal';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [, setIsLoggedIn] = useAtom(isLoggedInAtom);
  const [, setUser] = useAtom(userAtom);
  const [error, setError] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // 에러 발생 시 2초 후 초기 화면으로 이동
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [error, navigate]);

  useEffect(() => {
    const handleCallback = async () => {
      // URL 경로를 확인하여 provider 판별
      const path = window.location.pathname;
      const isNaver = path.includes('/naver');
      const provider = isNaver ? 'naver' : 'google';
      const providerName = isNaver ? 'Naver' : 'Google';

      // URL에서 authorization code 추출
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const errorParam = urlParams.get('error');
      const state = urlParams.get('state');

      // 네이버의 경우 state 검증
      if (isNaver && state) {
        const savedState = sessionStorage.getItem('naver_oauth_state');
        if (savedState !== state) {
          setError({
            title: `${providerName} 로그인 실패`,
            message: 'CSRF 검증 실패: state 값이 일치하지 않습니다.',
          });
          sessionStorage.removeItem('naver_oauth_state');
          return;
        }
        sessionStorage.removeItem('naver_oauth_state');
      }

      // 에러가 있는 경우
      if (errorParam) {
        setError({
          title: `${providerName} 로그인 실패`,
          message: `${providerName} 로그인이 취소되었습니다.`,
        });
        return;
      }

      // code가 없는 경우
      if (!code) {
        setError({
          title: `${providerName} 로그인 실패`,
          message: '인증 코드를 받지 못했습니다.',
        });
        return;
      }

      try {
        // 백엔드에 authorization code 전송
        const token = localStorage.getItem('accessToken');
        const apiEndpoint = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/${provider}`;

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            code,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || `로그인 실패: ${response.status}`;

          // 에러는 현재 페이지에서 모달 표시 후 2초 후 초기 화면으로 이동
          setError({
            title: `${providerName} 로그인 실패`,
            message: errorMessage,
          });
          return;
        }

        const data = await response.json();

        // JWT 토큰 저장
        localStorage.setItem('accessToken', data.result.accessToken);
        localStorage.setItem('refreshToken', data.result.refreshToken);

        // 로그인 상태 업데이트
        setIsLoggedIn(true);

        // 백엔드에서 사용자 정보 가져오기
        try {
          const { getGoogleUserInfo, getNaverUserInfo } = await import('../lib/api');
          const userInfo = isNaver
            ? await getNaverUserInfo()
            : await getGoogleUserInfo();

          if (userInfo) {
            setUser({
              id: userInfo.identifier,
              name: userInfo.email.split('@')[0],
              email: userInfo.email,
              provider: provider
            });
          } else {
            // 사용자 정보를 가져오지 못한 경우 기본값 사용
            setUser({
              id: `${provider}-user`,
              name: `${providerName} User`,
              email: `user@${provider}.com`,
              provider: provider
            });
          }
        } catch (userInfoError) {
          console.error('사용자 정보 조회 실패:', userInfoError);
          // 에러 발생 시에도 기본값으로 설정
          setUser({
            id: `${provider}-user`,
            name: `${providerName} User`,
            email: `user@${provider}.com`,
            provider: provider
          });
        }

        // 메인 페이지로 이동
        navigate('/');
      } catch (err) {
        console.error(`${providerName} 로그인 처리 중 오류:`, err);
        setError({
          title: `${providerName} 로그인 실패`,
          message: err instanceof Error ? err.message : '로그인 처리 중 오류가 발생했습니다.',
        });
      }
    };

    handleCallback();
  }, [navigate, setIsLoggedIn, setUser]);

  const handleCloseError = () => {
    setError(null);
    navigate('/');
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100vh',
          backgroundColor: colors.background.normal,
          gap: '20px',
        }}
      >
        {!error && (
          <>
            <div
              style={{
                width: '48px',
                height: '48px',
                border: `4px solid ${colors.fill.neutral}`,
                borderTop: `4px solid ${colors.primary.normal}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <div
              style={{
                ...typography.title[2],
                color: colors.label.normal,
                textAlign: 'center',
              }}
            >
              로그인 처리 중입니다...
            </div>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </>
        )}
      </div>

      {error && (
        <ErrorModal
          title={error.title}
          message={error.message}
          onClose={handleCloseError}
          isVisible={true}
        />
      )}
    </>
  );
};
