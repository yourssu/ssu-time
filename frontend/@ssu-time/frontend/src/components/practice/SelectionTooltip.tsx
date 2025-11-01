import React from 'react';
import { colors } from '../../theme/colors';

interface SelectionTooltipProps {
  visible: boolean;
  x: number; // viewport X (px)
  y: number; // viewport Y (px)
  onHighlight?: () => void; // 형광펜 색은 고정
  onClose?: () => void;
  slideNumber?: number;
  onGenerateScript?: () => void; // 현재 슬라이드 대본 재생성
  onBold?: () => void; // 볼드체 적용
}

export const SelectionTooltip: React.FC<SelectionTooltipProps> = ({
  visible,
  x,
  y,
  slideNumber = 0,
  onGenerateScript,
}) => {

  if (!visible) return null;

  // Figma 스타일: 어두운 캡슐, 내부 세그먼트, 구분선, Pretendard 13/500, 화이트 텍스트
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: y,
    left: x,
    transform: 'translate(-50%, calc(-100% - 10px))',
    zIndex: 10000, // z-index를 매우 높게 설정
    background: '#3F3F3F',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'auto',
    overflow: 'hidden',
    height: '40px',
  };

  const segmentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '0 12px',
    height: '40px',
    color: colors.static.white,
    fontFamily: 'Pretendard, sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    cursor: 'default',
  };

  const clickableStyle: React.CSSProperties = {
    ...segmentStyle,
    cursor: 'pointer',
  };

  /* const dividerStyle: React.CSSProperties = {
    width: '0.5px',
    height: '40px',
    background: '#000',
  }; */

  // 형광펜 동그라미: CSS + SVG 요구사항 병행
  // - border-radius: 20px
  // - border: 0.714px solid #C5F53C
  // - background: #C5F53C
  // - fill: #C5F53C; stroke: #FFF; stroke-width: 1px
  /* const highlighterWrapStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    borderRadius: '20px',
    background: '#C5F53C',
    border: '0.714px solid #C5F53C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }; */

  const MagicIcon = () => (
    <svg width="14.5" height="14.5" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.36 2.109c0 .12.048.235.133.32.085.085.2.133.32.133s.235-.048.32-.133a.452.452 0 0 0 .133-.32V.451a.453.453 0 0 0-.453-.453.453.453 0 0 0-.453.453v1.658ZM12.438 2.14a.454.454 0 0 0-.64-.64L10.625 2.67a.57.57 0 0 0-.101.282.57.57 0 0 0 .101.281c.042.043.093.077.149.1.056.023.115.035.175.034.06 0 .12-.012.176-.035a.45.45 0 0 0 .147-.1L12.438 2.14ZM6.36 3.312a.45.45 0 0 0 .496.138.45.45 0 0 0 .246-.246.57.57 0 0 0 .1-.318.57.57 0 0 0-.1-.318L5.829 1.5a.454.454 0 0 0-.64.64L6.36 3.312ZM5.797 5.578h-1.658a.453.453 0 0 1 0-.906h1.658a.453.453 0 0 1 0 .906ZM13.486 5.578h-1.658a.453.453 0 0 1 0-.906h1.658a.453.453 0 1 1 0 .906ZM11.797 8.75l-1.178-1.172a.57.57 0 0 1-.1-.282.57.57 0 0 1 .1-.282c.042-.043.093-.077.149-.1a.56.56 0 0 1 .351 0c.056.023.107.057.149.1l1.172 1.172-.643.464ZM9.266 9.798V8.141a.453.453 0 0 1 .906 0v1.657a.453.453 0 0 1-.906 0ZM10.04 5.179 8.868 6.352a.453.453 0 0 1-.64-.64l1.172-1.173a.453.453 0 1 1 .64.64ZM7.321 7.898 1.618 13.602a.453.453 0 1 1-.64-.64l5.703-5.704a.453.453 0 0 1 .64.64Z" fill="#FFFFFF"/>
    </svg>
  );

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onGenerateScript) {
      onGenerateScript();
    } else {
      // no-op
    }
  };

  const handleMouseEvent = (e: React.MouseEvent) => {
    // mousedown과 mouseup 이벤트가 document로 전파되는 것을 막아
    // 텍스트 선택 해제 및 툴팁 숨김을 방지
    e.stopPropagation(); // React 합성 이벤트 전파 막기
    e.nativeEvent.stopImmediatePropagation(); // 네이티브 DOM 이벤트도 막기
  };

  return (
    <div
      role="dialog"
      aria-label="선택 툴팁"
      style={containerStyle}
      onMouseDown={handleMouseEvent}
      onMouseUp={handleMouseEvent}
    >
      <div
        style={clickableStyle}
        onClick={handleGenerateClick}
        aria-label={`슬라이드 ${slideNumber} 대본 생성`}
        title={`슬라이드 ${slideNumber} 대본 생성`}
      >
        <MagicIcon />
        <span>슬라이드 {slideNumber} 대본 생성</span>
      </div>
      {/**
       * 형광펜/강조 버튼 (주석 처리로 비활성화; 필요 시 즉시 복원)
       *
       * <div style={dividerStyle} />
       * <div style={clickableStyle} onClick={onHighlight} aria-label="형광펜" title="형광펜">
       *   <span>형광펜</span>
       *   <div style={highlighterWrapStyle}>
       *     <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
       *       <circle cx="8" cy="8" r="7" fill="#C5F53C" stroke="#FFFFFF" strokeWidth="1" />
       *     </svg>
       *   </div>
       * </div>
       * <div style={dividerStyle} />
       * <div style={{ ...clickableStyle, padding: '0 12px' }} onClick={onBold} aria-label="강조" title="강조 (*볼드)">
       *   <span>강조</span>
       * </div>
       */}
    </div>
  );
};

export default SelectionTooltip;


