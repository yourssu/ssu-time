import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { isLoggedInAtom, userAtom } from '../../atoms/auth';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import * as scriptStorage from '../../lib/scriptStorage';
import * as boardStorage from '../../lib/boardStorage';

export interface LogoutButtonProps {
  onClick?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onClick }) => {
  const navigate = useNavigate();
  const [, setIsLoggedIn] = useAtom(isLoggedInAtom);
  const [, setUser] = useAtom(userAtom);

  const handleLogout = () => {
    // 로그인 상태 초기화
    setIsLoggedIn(false);
    setUser(null);

    // 로컬스토리지 정리
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    scriptStorage.clearAll();
    boardStorage.clearAll();

    onClick?.();

    // 초기화면으로 이동 (강제 재렌더링)
    navigate('/', { replace: true });
    window.location.reload();
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        display: 'flex',
        padding: '0 15px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        borderRadius: '8px',
        background: colors.fill.normal,
        border: 'none',
        cursor: 'pointer',
        fontFamily: typography.button[2].fontFamily,
        fontWeight: typography.button[2].fontWeight,
        fontSize: typography.button[2].fontSize,
        lineHeight: typography.button[2].lineHeight,
        color: colors.primary.normal,
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
        outline: 'none',
        height: '30px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.fill.strong;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.fill.normal;
      }}
    >
      로그아웃
    </button>
  );
};