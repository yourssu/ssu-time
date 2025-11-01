import React, { useEffect } from 'react';
import { SlideCard } from './SlideCard';
import { TimerControl } from './TimerControl';
import { colors } from '../../theme/colors';
import { SlideInput } from '../ScriptModal/ScriptModalForm';
import { SaveStatusIndicator, SaveStatus } from './SaveStatusIndicator';

interface SidebarProps {
  slides: SlideInput[];
  currentSlide: number;
  timer: { minutes: number; seconds: number };
  isTimerRunning: boolean;
  pdfFile?: File | null;
  onSlideClick: (slideNumber: number) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  isPracticing?: boolean;
  onPracticeToggle?: () => void;
  onExitClick?: () => void;
  saveStatus: SaveStatus;
  onSaveStatusIdle: () => void;
  onCloseSidebar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  slides,
  currentSlide,
  timer,
  isTimerRunning,
  pdfFile,
  onSlideClick,
  onToggleTimer,
  onResetTimer,
  isPracticing = false,
  onPracticeToggle,
  onExitClick,
  saveStatus,
  onSaveStatusIdle,
  onCloseSidebar,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 입력 필드에 포커스가 있을 때는 키보드 이벤트 무시
      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.hasAttribute('contenteditable')
      )) {
        return;
      }

      switch (event.key) {
        case 'ArrowUp':
          if (currentSlide > 1) {
            onSlideClick(currentSlide - 1);
          }
          break;
        case 'ArrowDown':
          if (currentSlide < slides.length) {
            onSlideClick(currentSlide + 1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlide, slides.length, onSlideClick]);

  return (
    <div style={sidebarStyle}>
      {/* 타이머 컨트롤 섹션 */}
      <div style={topControlPanelStyle}>
        {/* 총 발표 시간 텍스트 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', boxSizing: 'border-box', width: '100%' }}>
          <p style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: 'normal',
            color: colors.label.normal,
            margin: 0,
          }}>
            총 발표 시간
          </p>
          <SaveStatusIndicator status={saveStatus} onIdle={onSaveStatusIdle} />
        </div>
        
        {/* 타이머 컨트롤 */}
        <TimerControl
          minutes={timer.minutes}
          seconds={timer.seconds}
          isRunning={isTimerRunning}
          onToggle={() => {
            onToggleTimer();
            if (onCloseSidebar) onCloseSidebar();
          }}
          onReset={onResetTimer}
          isPracticing={isPracticing}
          onPracticeToggle={onPracticeToggle}
          onExitClick={onExitClick}
        />
      </div>

      {/* 슬라이드 리스트 */}
      <div style={slideListStyle}>
        {slides.map((slide) => (
          <SlideCard
            key={slide.slideNumber}
            slideNumber={slide.slideNumber}
            isActive={currentSlide === slide.slideNumber}
            onClick={() => {
              onSlideClick(slide.slideNumber);
              if (onCloseSidebar) onCloseSidebar();
            }}
            pdfFile={pdfFile}
          />
        ))}
      </div>
    </div>
  );
};

const sidebarStyle: React.CSSProperties = {
  width: 'min(85vw, 250px)',
  maxWidth: '250px',
  backgroundColor: colors.background.normal,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderTop: 'none',
};

const slideListStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  backgroundColor: colors.background.normal,
};

const topControlPanelStyle: React.CSSProperties = {
  backgroundColor: colors.static.white,
  borderTop: 'none',
  borderBottom: 'none',
  padding: '20px 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  boxSizing: 'border-box',
};