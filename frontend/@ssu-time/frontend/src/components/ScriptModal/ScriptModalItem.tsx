import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
// import { colors } from '../../theme/colors';

interface ScriptModalItemProps {
  slideNumber: number;
  value: string;
  onChange: (value: string) => void;
  onFocus?: (slideNumber: number) => void;
  onGenerate?: (slideNumber: number) => void; // deprecated
}

export interface ScriptModalItemRef {
  getCurrentValue: () => string;
  getSlideNumber: () => number;
}

const ScriptModalItem = forwardRef<ScriptModalItemRef, ScriptModalItemProps>(({ 
  slideNumber,
  value,
  onChange: _onChange,
  onFocus
}, ref) => {
  const isMobile = useIsMobile(480);
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // props.value가 변경되면 로컬 값 동기화
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // 외부에서 현재 로컬 값을 가져올 수 있도록 imperative handle 제공
  useImperativeHandle(ref, () => ({
    getCurrentValue: () => localValue,
    getSlideNumber: () => slideNumber
  }), [localValue, slideNumber]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.(slideNumber);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // 포커스 해제시 아무런 동작도 하지 않음
  };

  const handleChange = (newValue: string) => {
    // 입력 중에는 로컬 상태만 업데이트
    setLocalValue(newValue);
    // 실시간 상태 업데이트 제거
  };

  return (
    <div style={itemStyle}>
      <div style={headerStyle}>
        <div style={{
          ...slideNumberStyle,
          color: isFocused ? '#3282ff' : '#171719',
          transition: 'color 0.2s ease'
        }}>
          <span style={{ fontSize: isMobile ? '16px' : undefined }}>슬라이드{slideNumber}</span>
        </div>
        {/* 생성 버튼 제거 */}
      </div>
      <div style={{
        ...textareaWrapperStyle,
        background: isFocused ? '#FFF' : '#f1f2f5',
        border: isFocused ? '2px solid #3282ff' : '2px solid transparent',
        transition: 'border-color 0.2s ease, background-color 0.2s ease'
      }}>
        <textarea
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="내용을 입력하세요."
          style={{
            ...textareaStyle,
            fontSize: isMobile ? '13px' : textareaStyle.fontSize,
            padding: isMobile ? '16px 20px' : textareaStyle.padding,
          }}
        />
      </div>
    </div>
  );
});

ScriptModalItem.displayName = 'ScriptModalItem';

// 메모이제이션된 컴포넌트로 export
export const MemoizedScriptModalItem = React.memo(ScriptModalItem);

// 기존 export도 유지 (호환성)
export { ScriptModalItem };

const itemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  width: '100%',
  marginTop: '20px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '5px',
};

const slideNumberStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 12px',
  fontFamily: 'Pretendard',
  fontWeight: 500,
  fontSize: '18px',
  color: '#171719',
};

const textareaWrapperStyle: React.CSSProperties = {
  backgroundColor: '#f1f2f5',
  borderRadius: '10px',
  height: '120px',
  width: '100%',
  boxSizing: 'border-box',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  padding: '20px 27px',
  fontFamily: 'Pretendard',
  fontWeight: 500,
  fontSize: '14px',
  color: '#171719',
  resize: 'none',
  borderRadius: '10px',
}; 

// 생성 버튼은 제거되었습니다