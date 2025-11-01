import React, { useState } from 'react';
import { colors } from '../../theme/colors';

interface GoalTimeModalProps {
  isOpen: boolean;
  onClose?: () => void; // embedded 모드에서는 선택적
  onComplete: (goalMinutes: number, goalSeconds: number, showStopwatch: boolean) => void;
  onStopwatchToggle?: (showStopwatch: boolean) => void; // 체크박스 변경 시 즉시 호출
  embedded?: boolean; // PDF 뷰어 내부에서 사용할 때
  initialMinutes?: number;
  initialSeconds?: number;
  initialStopwatchSetting?: boolean; // 초기 스톱워치 설정값
}

export const GoalTimeModal: React.FC<GoalTimeModalProps> = ({
  isOpen,
  onClose: _onClose,
  onComplete,
  onStopwatchToggle,
  embedded = false,
  initialMinutes = 10,
  initialSeconds = 30,
  initialStopwatchSetting = true,
}) => {
  const [goalMinutes, setGoalMinutes] = useState(initialMinutes);
  const [goalSeconds, setGoalSeconds] = useState(initialSeconds);
  const [showStopwatch, setShowStopwatch] = useState(initialStopwatchSetting);
  const [isEditingMinutes, setIsEditingMinutes] = useState(false);
  const [isEditingSeconds, setIsEditingSeconds] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(initialMinutes.toString());
  const [inputSeconds, setInputSeconds] = useState(initialSeconds.toString());

  if (!isOpen) return null;

  const handleDecrease = () => {
    const totalSeconds = goalMinutes * 60 + goalSeconds - 30;
    if (totalSeconds >= 30) { // 최소 30초
      const newMinutes = Math.floor(totalSeconds / 60);
      const newSeconds = totalSeconds % 60;
      setGoalMinutes(newMinutes);
      setGoalSeconds(newSeconds);
    }
  };

  const handleIncrease = () => {
    const totalSeconds = goalMinutes * 60 + goalSeconds + 30;
    const newMinutes = Math.floor(totalSeconds / 60);
    const newSeconds = totalSeconds % 60;
    setGoalMinutes(newMinutes);
    setGoalSeconds(newSeconds);
  };

  const handleMinutesClick = () => {
    setIsEditingMinutes(true);
    setInputMinutes(goalMinutes.toString());
  };

  const handleSecondsClick = () => {
    setIsEditingSeconds(true);
    setInputSeconds(goalSeconds.toString());
  };

  const handleMinutesBlur = () => {
    const minutes = parseInt(inputMinutes) || 0;
    if (minutes >= 0) {
      setGoalMinutes(minutes);
    }
    setIsEditingMinutes(false);
  };

  const handleSecondsBlur = () => {
    const seconds = parseInt(inputSeconds) || 0;
    if (seconds >= 0 && seconds < 60) {
      setGoalSeconds(seconds);
    }
    setIsEditingSeconds(false);
  };

  const handleMinutesKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMinutesBlur();
    }
  };

  const handleSecondsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSecondsBlur();
    }
  };

  const handleComplete = () => {
    onComplete(goalMinutes, goalSeconds, showStopwatch);
  };

  const handleStopwatchChange = (checked: boolean) => {
    setShowStopwatch(checked);
    // 체크박스 변경 시 즉시 연습 상태 변경
    if (onStopwatchToggle) {
      onStopwatchToggle(checked);
    }
  };


  // embedded 모드일 때는 오버레이 없이 모달만 렌더링
  if (embedded) {
    return (
      <div style={embeddedModalStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
          <div style={titleStyle}>목표시간</div>
          <div style={descriptionStyle}>발표 시간을 설정하세요</div>
        </div>
        
        <div style={timePickerContainerStyle}>
          <button style={buttonStyle} onClick={handleDecrease}>
            -
          </button>
          
          <div style={timeDisplayContainerStyle}>
            {isEditingMinutes ? (
              <input
                type="number"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(e.target.value)}
                onBlur={handleMinutesBlur}
                onKeyDown={handleMinutesKeyDown}
                style={timeInputStyle}
                min="0"
                autoFocus
              />
            ) : (
              <span style={timePartStyle} onClick={handleMinutesClick}>
                {goalMinutes}분
              </span>
            )}
            {isEditingSeconds ? (
              <input
                type="number"
                value={inputSeconds}
                onChange={(e) => setInputSeconds(e.target.value)}
                onBlur={handleSecondsBlur}
                onKeyDown={handleSecondsKeyDown}
                style={timeInputStyle}
                min="0"
                max="59"
                autoFocus
              />
            ) : (
              <span style={timePartStyle} onClick={handleSecondsClick}>
                {goalSeconds}초
              </span>
            )}
          </div>
          
          <button style={buttonStyle} onClick={handleIncrease}>
            +
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div style={checkboxContainerStyle}>
            <input
              type="checkbox"
              id="showStopwatch"
              checked={showStopwatch}
              onChange={(e) => handleStopwatchChange(e.target.checked)}
              style={checkboxStyle}
            />
            <label htmlFor="showStopwatch" style={checkboxLabelStyle}>
              연습 시 스톱워치 보기
            </label>
          </div>

          <button style={completeButtonStyle} onClick={handleComplete}>
            완료
          </button>
        </div>
      </div>
    );
  }

  // 기본 모드 (전체 화면 오버레이)
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={titleStyle}>목표시간</div>
        <div style={descriptionStyle}>발표 시간을 설정하세요</div>
        
        <div style={timePickerContainerStyle}>
          <button style={buttonStyle} onClick={handleDecrease}>
            -
          </button>
          
          <div style={timeDisplayContainerStyle}>
            {isEditingMinutes ? (
              <input
                type="number"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(e.target.value)}
                onBlur={handleMinutesBlur}
                onKeyDown={handleMinutesKeyDown}
                style={timeInputStyle}
                min="0"
                autoFocus
              />
            ) : (
              <span style={timePartStyle} onClick={handleMinutesClick}>
                {goalMinutes}
              </span>
            )}
            <span style={separatorStyle}>분</span>
            {isEditingSeconds ? (
              <input
                type="number"
                value={inputSeconds}
                onChange={(e) => setInputSeconds(e.target.value)}
                onBlur={handleSecondsBlur}
                onKeyDown={handleSecondsKeyDown}
                style={timeInputStyle}
                min="0"
                max="59"
                autoFocus
              />
            ) : (
              <span style={timePartStyle} onClick={handleSecondsClick}>
                {goalSeconds}
              </span>
            )}
            <span style={separatorStyle}>초</span>
          </div>
          
          <button style={buttonStyle} onClick={handleIncrease}>
            +
          </button>
        </div>

        <div style={checkboxContainerStyle}>
          <input
            type="checkbox"
            id="showStopwatch"
            checked={showStopwatch}
            onChange={(e) => handleStopwatchChange(e.target.checked)}
            style={checkboxStyle}
          />
          <label htmlFor="showStopwatch" style={checkboxLabelStyle}>
            연습 시 스톱워치 보기
          </label>
        </div>

        <button style={completeButtonStyle} onClick={handleComplete}>
          완료
        </button>
      </div>
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
};

const modalStyle: React.CSSProperties = {
  backgroundColor: colors.static.white,
  borderRadius: '20px',
  padding: '40px',
  width: '400px',
  textAlign: 'center',
  fontFamily: 'Pretendard, sans-serif',
};

const embeddedModalStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  borderRadius: '20px',
  padding: '0',
  width: '340px',
  textAlign: 'center',
  fontFamily: 'Pretendard, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  alignItems: 'center',
  justifyContent: 'center',
};

const titleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 500,
  color: colors.static.white,
  marginBottom: '5px',
};

const descriptionStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 400,
  color: colors.static.white,
  marginBottom: '0',
};

const timePickerContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '5px',
  marginBottom: '0',
};

const buttonStyle: React.CSSProperties = {
  width: '39px',
  height: '39px',
  borderRadius: '5px',
  border: '1px solid #c5c5c7',
  backgroundColor: '#eeeeee',
  color: '#7d7e83',
  fontSize: '15px',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const timeDisplayContainerStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  borderRadius: '5px',
  border: '1px solid #c5c5c7',
  padding: '10px 71px',
  fontSize: '16px',
  fontWeight: 500,
  color: colors.static.white,
  width: '194px',
  height: '39px',
  display: 'flex',
  alignItems: 'center',
  gap: '3px',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
};

const timePartStyle: React.CSSProperties = {
  cursor: 'pointer',
  padding: '2px 4px',
  borderRadius: '4px',
  transition: 'background-color 0.2s ease',
  whiteSpace: 'nowrap',
};

const timeInputStyle: React.CSSProperties = {
  width: '60px',
  padding: '2px 4px',
  border: 'none',
  background: 'transparent',
  fontSize: '18px',
  fontWeight: 500,
  color: colors.static.white,
  textAlign: 'center',
  outline: 'none',
  fontFamily: 'Pretendard, sans-serif',
};

const separatorStyle: React.CSSProperties = {
  fontSize: '18px',
  color: colors.static.white,
  fontWeight: 500,
  margin: '0 2px',
};

const checkboxContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '5px',
  marginBottom: '12px',
};

const checkboxStyle: React.CSSProperties = {
  width: '16px',
  height: '16px',
  accentColor: '#2563EB',
  borderRadius: '2px',
};

const checkboxLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: colors.static.white,
  fontWeight: 400,
  cursor: 'pointer',
};

const completeButtonStyle: React.CSSProperties = {
  width: '340px',
  height: '50px',
  backgroundColor: colors.primary.normal,
  color: colors.static.white,
  border: 'none',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'Pretendard, sans-serif',
};