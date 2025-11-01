import React, { useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ScriptModalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const ScriptModalOverlay: React.FC<ScriptModalOverlayProps> = ({
  isOpen,
  onClose,
  children
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isMobile = useIsMobile(480);

  // 모바일에서 배경(문서) 스크롤 방지
  useEffect(() => {
    if (!isMobile) return;
    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    const prevBody = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    const prevHtmlOverscroll = html.style.overscrollBehavior;

    // iOS Safari 대응: body를 fixed로 고정하고 현재 스크롤 보존
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';

    return () => {
      // 스타일 복원 및 기존 스크롤 위치 복귀
      body.style.position = prevBody.position;
      body.style.top = prevBody.top;
      body.style.left = prevBody.left;
      body.style.right = prevBody.right;
      body.style.width = prevBody.width;
      body.style.overflow = prevBody.overflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      const restoreY = Math.abs(parseInt(prevBody.top || '0', 10)) || 0;
      window.scrollTo(0, restoreY);
    };
  }, [isMobile]);

  return (
    <div
      style={{
        ...overlayStyle,
        padding: isMobile ? '0px' : overlayStyle.padding,
        overflow: 'hidden', // 최상위 스크롤 방지
        overscrollBehavior: 'none',
      }}
      onClick={handleOverlayClick}
    >
      {children}
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
}; 