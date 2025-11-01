import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { colors } from '../../theme/colors';
import { Button } from '../ui/Button';

interface TimerControlProps {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  isPracticing?: boolean;
  onPracticeToggle?: () => void;
  onExitClick?: () => void;
}

export const TimerControl: React.FC<TimerControlProps> = ({
  minutes,
  seconds,
  isRunning,
  onToggle,
  onReset,
  isPracticing = false,
  onPracticeToggle,
  onExitClick: _onExitClick,
}) => {
  const isMobile = useIsMobile(480);
  const [isHovered, setIsHovered] = useState(false);
  const formatTime = (value: number) => value.toString().padStart(2, '0');

  const handleTimerDisplayClick = () => {
    if (onPracticeToggle) {
      onPracticeToggle();
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div style={{ ...containerStyle, height: isMobile ? '44px' : containerStyle.height }}>
      <div style={timerControlStyle}>
        <div 
          style={{
            ...timerDisplayStyle,
            width: isMobile ? '120%' : timerDisplayStyle.width,
            margin: isMobile ? '6px 0' : (timerDisplayStyle as any).margin,
          }}
        >
          <div 
            style={{
              ...timerTextStyle,
              cursor: onPracticeToggle ? 'pointer' : 'default',
              fontWeight: isHovered ? 600 : 500,
            }}
            onClick={handleTimerDisplayClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {isPracticing ? '연습 중' : `${formatTime(minutes)}:${formatTime(seconds)}`}
          </div>
          <div style={timerButtonsInlineStyle}>
            <Button 
              variant={isRunning ? "secondary" : "primary"}
              size="small"
              onClick={onToggle}
              style={{ 
                width: isMobile ? 'auto' : 'auto',
                height: isMobile ? '28px' : '30px',
                padding: isMobile ? '6px 12px' : '7px 15px',
                minWidth: 'auto',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              {isRunning ? '중지' : '시작'}
            </Button>
            <button 
              onClick={onReset}
              style={{ 
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                color: colors.primary.normal,
                fontFamily: 'Pretendard, sans-serif',
                fontSize: isMobile ? '12px' : '13px',
                cursor: 'pointer',
                height: isMobile ? '28px' : '30px',
              }}
            >
              초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  height: '50px',
  padding: 0,
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1px',
  backgroundColor: 'transparent',
  borderRadius: '12px',
  width: 'fit-content',
  boxSizing: 'border-box',
};

const timerControlStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 0,
  flexWrap: 'nowrap',
};

const timerDisplayStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'center',
  width: '213px',
  height: '50px',
  gap: '10px',
  flexShrink: 0,
  borderRadius: '8px',
  fontSize: '16px',
  fontFamily: 'Pretendard, sans-serif',
  boxSizing: 'border-box',
  backgroundColor: colors.background.alternative,
  margin: '12px 8px',
};

const timerTextStyle: React.CSSProperties = {
  color: colors.label.normal,
  fontWeight: 600,
  justifySelf: 'center',
};

const timerButtonsInlineStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  paddingRight: '10px',
};