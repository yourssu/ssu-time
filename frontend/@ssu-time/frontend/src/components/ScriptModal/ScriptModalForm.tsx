import React, { useCallback, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MemoizedScriptModalItem, ScriptModalItemRef } from './ScriptModalItem';

export interface SlideInput {
  slideNumber: number;
  pageNumber: number;
  content: string;
}

interface ScriptModalFormProps {
  slides: SlideInput[];
  onSlideChange?: (slideNumber: number, content: string) => void;
  onFocus?: (slideNumber: number) => void;
}

export interface ScriptModalFormRef {
  getAllCurrentValues: () => SlideInput[];
}

const ScriptModalForm = forwardRef<ScriptModalFormRef, ScriptModalFormProps>(({ 
  slides,
  onSlideChange: _onSlideChange,
  onFocus
}, ref) => {
  const isMobile = useIsMobile(480);
  const itemRefs = useRef<Record<number, ScriptModalItemRef | null>>({});

  const handleFocus = useCallback((slideNumber: number) => {
    onFocus?.(slideNumber);
  }, [onFocus]);

  // 각 슬라이드에 대한 개별 콜백들을 메모이제이션 (현재는 사용하지 않음)
  const slideCallbacks = useMemo(() => {
    return slides.reduce((acc, slide) => {
      acc[slide.slideNumber] = (_content: string) => {
        // 실시간 업데이트 제거 - 아무것도 하지 않음
      };
      return acc;
    }, {} as Record<number, (content: string) => void>);
  }, [slides]);

  // 외부에서 모든 현재 값들을 가져올 수 있도록 imperative handle 제공
  useImperativeHandle(ref, () => ({
    getAllCurrentValues: () => {
      return slides.map(slide => {
        const itemRef = itemRefs.current[slide.slideNumber];
        const currentValue = itemRef?.getCurrentValue();
        // 빈 문자열도 유효한 값이므로 ?? 대신 명시적 체크
        return {
          ...slide,
          content: currentValue !== undefined ? currentValue : slide.content
        };
      });
    }
  }), [slides]);

  return (
    <div style={{
      ...formSectionStyle,
      flexDirection: isMobile ? 'column' : formSectionStyle.flexDirection,
      height: isMobile ? 'auto' : formSectionStyle.height,
    }}>
      {/* 선택/전체 선택 컨트롤 제거 */}
      <div style={{
        ...inputListStyle,
        // 뷰포트 기반 리스트 높이 제한: 헤더(약 60) + 프리뷰(약 250) + 구분선/여백(약 48) + 푸터(약 68) 고려
        maxHeight: isMobile ? 'calc(100vh - 60px - 250px - 48px - 68px)' : inputListStyle.maxHeight,
        paddingRight: isMobile ? 0 : inputListStyle.paddingRight,
        paddingBottom: isMobile ? '80px' : undefined, // 마지막 항목 잘림 방지
        width: '100%',
      }}>
        {slides.map((slide) => (
          <MemoizedScriptModalItem
            key={slide.slideNumber}
            ref={(ref) => {
              itemRefs.current[slide.slideNumber] = ref;
            }}
            slideNumber={slide.slideNumber}
            value={slide.content}
            onChange={slideCallbacks[slide.slideNumber]}
            onFocus={handleFocus}
          />
        ))}
      </div>
    </div>
  );
});

ScriptModalForm.displayName = 'ScriptModalForm';

// 메모이제이션된 컴포넌트로 export
export const MemoizedScriptModalForm = React.memo(ScriptModalForm);

const formSectionStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'center',
  height: '100%',
};

// 선택 컨트롤 제거됨

const inputListStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  overflowY: 'auto',
  maxHeight: '598px',
  paddingRight: '10px',
}; 