import React from 'react';
import { colors } from '../../theme/colors';

interface StatusBarProps {
  currentSlide: number;
  totalSlides: number;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentSlide,
  totalSlides,
  isMobile,
  onToggleSidebar,
}) => {
  const localStatusBarStyle: React.CSSProperties = {
    ...statusBarStyle,
    padding: isMobile ? '0 16px' : statusBarStyle.padding,
    height: isMobile ? '48px' : statusBarStyle.height,
  };

  return (
    <div style={localStatusBarStyle}>
      {/* 왼쪽: 빈 공간 */}
      <div style={leftSectionStyle}>
        {isMobile && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            style={{
              height: '30px',
              padding: '0 10px',
              borderRadius: '8px',
              border: '1px solid #eee',
              background: '#fff',
              color: colors.label.normal,
              cursor: 'pointer',
              fontFamily: 'Pretendard, sans-serif',
              fontSize: '12px',
            }}
            aria-label="사이드바 열기"
            title="사이드바"
          >
            메뉴
          </button>
        )}
      </div>
      
      {/* 중앙: 페이지 번호 */}
      <div style={pageIndicatorStyle}>
        <span>{currentSlide}</span>
        <span>/</span>
        <span>{totalSlides}</span>
      </div>
      
      {/* 우측: 빈 공간 */}
      <div style={actionButtonsStyle}>
      </div>
    </div>
  );
};

const statusBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 41px',
  height: '60px',
};

const leftSectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};



const pageIndicatorStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  fontSize: '14px',
  fontWeight: 500,
  color: colors.label.neutral,
  fontFamily: 'Pretendard, sans-serif',
};

const actionButtonsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '9px',
};


