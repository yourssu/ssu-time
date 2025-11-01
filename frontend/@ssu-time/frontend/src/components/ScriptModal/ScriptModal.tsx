import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScriptModalOverlay } from './ScriptModalOverlay';
import { ScriptModalContainer } from './ScriptModalContainer';
import { ScriptModalContent } from './ScriptModalContent';
import { MemoizedScriptModalPreview } from './ScriptModalPreview';
import { ScriptModalDivider } from './ScriptModalDivider';
import { MemoizedScriptModalForm, ScriptModalFormRef } from './ScriptModalForm';
import { ScriptModalFooter } from './ScriptModalFooter';
import { SlideInput } from './ScriptModalForm';
import { getPdfPageCount } from '../../lib/pdfUtils';
import { ErrorModal } from '../ui/ErrorModal';
import { getScripts, saveScripts as persistScripts, PageScriptData } from '../../lib/scriptStorage';

export interface ScriptModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** PDF 파일 (필수) */
  pdfFile: File;
  /** 파일 ID (API 저장용) */
  fileId: number;
  /** 슬라이드 입력 데이터 */
  slides?: SlideInput[];
  /** 슬라이드 내용 변경 시 호출되는 콜백 */
  onSlideChange?: (slideNumber: number, content: string) => void;
  /** 저장 버튼 클릭 시 호출되는 콜백 */
  onSave?: (slides: SlideInput[]) => void;
  /** 문서로 출력하기 버튼 클릭 시 */
  onExport?: (slides: SlideInput[]) => void;
  /** 미리보기 콘텐츠 렌더링 함수 */
  renderPreviewContent?: () => React.ReactNode;
}

export const ScriptModal: React.FC<ScriptModalProps> = ({
  isOpen,
  onClose,
  pdfFile,
  fileId,
  slides = [],
  onSlideChange,
  onSave,
  onExport,
  renderPreviewContent,
}) => {
  const [slideInputs, setSlideInputs] = useState<SlideInput[]>([]);
  const [isLoadingPageCount, setIsLoadingPageCount] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 현재 미리보기 페이지 상태
  const [currentPreviewPage, setCurrentPreviewPage] = useState<number>(1);

  // ScriptModalForm의 ref
  const formRef = useRef<ScriptModalFormRef>(null);
  // Undo 스택: 슬라이드 번호별 변경 이력
  const undoRef = useRef<Record<number, string[]>>({});

  // 디바운스 타이머
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 고정된 제목과 설명
  const title = "발표 대본";
  const description = "슬라이드에 맞춘 대본을 미리 작성할 수 있어요.";

  // PDF 파일의 페이지 수를 가져와서 슬라이드 생성 + API에서 대본 최초 로드
  useEffect(() => {
    const loadPdfPageCount = async () => {
      if (!pdfFile) {
        setError('PDF 파일이 필요합니다.');
        return;
      }

      setIsLoadingPageCount(true);
      setError(null);

      try {
        // PDF 파일의 실제 페이지 수 가져오기
        const pageCount = await getPdfPageCount(pdfFile);

        // PDF 페이지 수에 맞게 슬라이드 생성
        const pdfSlides = Array.from({ length: pageCount }, (_, index) => {
          const slideNumber = index + 1;
          const existingSlide = slides.find(s => s.slideNumber === slideNumber);
          return existingSlide || {
            slideNumber,
            pageNumber: slideNumber,
            content: ''
          };
        });

        // API에서 저장된 스크립트 로드 (최초 1회)
        try {
          const stored = await getScripts(fileId);
          const merged = pdfSlides.map(s => {
            const scriptData = stored.slides[s.slideNumber];
            return { ...s, content: scriptData?.content ?? s.content };
          });
          setSlideInputs(merged);
        } catch (error) {
          console.warn('API 대본 로드 실패, 빈 대본 사용:', error);
          setSlideInputs(pdfSlides);
        }
      } catch (error) {
        console.error('PDF 페이지 수 가져오기 실패:', error);
        const errorMessage = error instanceof Error ? error.message : 'PDF 파일을 읽을 수 없습니다. 올바른 PDF 파일인지 확인해주세요.';
        setError(errorMessage);
        setSlideInputs([]);
      } finally {
        setIsLoadingPageCount(false);
      }
    };

    loadPdfPageCount();
  }, [pdfFile, fileId, slides]);

  // Cmd/Ctrl+Z: 현재 프리뷰 페이지의 직전 내용으로 롤백
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isUndo = (e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z');
      if (!isUndo) return;
      const stack = undoRef.current[currentPreviewPage] || [];
      if (stack.length === 0) return;
      const prevText = stack.pop() as string;
      setSlideInputs(prev => prev.map(s => s.slideNumber === currentPreviewPage ? { ...s, content: prevText } : s));

      // 디바운싱으로 자동 저장 (undo 시에도 적용)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const scriptData = await getScripts(fileId);
          const goalTime = scriptData.goalTime || 0;

          // 기존 duration 보존: scriptData.slides에서 duration 가져오기
          const map: Record<number, PageScriptData> = {};
          slideInputs.forEach(s => {
            const existingDuration = scriptData.slides[s.slideNumber]?.duration ?? 0;
            map[s.slideNumber] = { content: s.content, duration: existingDuration };
          });
          const existingDuration = scriptData.slides[currentPreviewPage]?.duration ?? 0;
          map[currentPreviewPage] = { content: prevText, duration: existingDuration };

          await persistScripts(fileId, goalTime, map);
        } catch (err) {
          console.error('Undo 후 자동 저장 실패:', err);
        }
      }, 1000);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentPreviewPage, slideInputs, fileId]);

  const handleSlideChange = useCallback((slideNumber: number, content: string) => {
    setSlideInputs(prev => {
      // 현재 슬라이드의 내용과 같다면 아무 작업도 하지 않음
      const currentSlide = prev.find(slide => slide.slideNumber === slideNumber);
      if (currentSlide && currentSlide.content === content) {
        return prev; // 이전 상태 그대로 반환하여 리렌더링 방지
      }

      // 실제로 내용이 변경된 경우에만 새로운 상태 반환
      const newSlides = prev.map(slide =>
        slide.slideNumber === slideNumber
          ? { ...slide, content }
          : slide
      );

      // 디바운싱으로 자동 저장 (1초 후)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const scriptData = await getScripts(fileId);
          const goalTime = scriptData.goalTime || 0;

          // 기존 duration 보존: scriptData.slides에서 duration 가져오기
          const map: Record<number, PageScriptData> = {};
          newSlides.forEach(s => {
            const existingDuration = scriptData.slides[s.slideNumber]?.duration ?? 0;
            map[s.slideNumber] = { content: s.content, duration: existingDuration };
          });

          await persistScripts(fileId, goalTime, map);
        } catch (err) {
          console.error('자동 저장 실패:', err);
        }
      }, 1000);

      return newSlides;
    });

    onSlideChange?.(slideNumber, content);
  }, [onSlideChange, fileId]);

  // 포커스 변경 시 미리보기 페이지 업데이트
  const handleFocus = useCallback((slideNumber: number) => {
    setCurrentPreviewPage(slideNumber);
  }, []);

  const handleSave = useCallback(async () => {
    // ScriptModalForm에서 모든 현재 값들을 수집
    const currentValues = formRef.current?.getAllCurrentValues();

    if (currentValues) {
      // 개별 슬라이드 변경 알림
      currentValues.forEach(slide => {
        const existingSlide = slideInputs.find(s => s.slideNumber === slide.slideNumber);
        if (!existingSlide || existingSlide.content !== slide.content) {
          onSlideChange?.(slide.slideNumber, slide.content);
        }
      });

      // API로 즉시 저장 (디바운싱 없음)
      try {
        // 기존 스크립트 데이터에서 goalTime과 duration 가져오기
        const scriptData = await getScripts(fileId);
        const goalTime = scriptData.goalTime || 0;

        // 새로운 slides 데이터 생성 (기존 duration 보존)
        const map: Record<number, PageScriptData> = {};
        currentValues.forEach(s => {
          const existingDuration = scriptData.slides[s.slideNumber]?.duration ?? 0;
          map[s.slideNumber] = { content: s.content, duration: existingDuration };
        });

        // goalTime과 함께 저장
        await persistScripts(fileId, goalTime, map);
        

        // localStorage에 저장되었으므로 currentValues를 그대로 사용
        setSlideInputs(currentValues);
        

        // 저장이 완전히 완료된 후 부모 컴포넌트에 알림 및 모달 닫기
        onSave?.(currentValues);
        onClose();
      } catch (err) {
        console.error('저장 실패:', err);
      }
    }
  }, [slideInputs, onSave, onSlideChange, fileId, onClose]);

  const handleExport = useCallback(() => {
    const currentValues = formRef.current?.getAllCurrentValues();
    if (currentValues) {
      onExport?.(currentValues);
    }
  }, [onExport]);


  // 에러 상태 렌더링
  if (error) {
    return (
      <ScriptModalOverlay isOpen={isOpen} onClose={onClose}>
        <ScriptModalContainer>
          <ErrorModal
            title="PDF 파일 오류"
            message={error}
            onClose={onClose}
          />
        </ScriptModalContainer>
      </ScriptModalOverlay>
    );
  }

  // 로딩 상태 렌더링
  if (isLoadingPageCount) {
    return (
      <ScriptModalOverlay isOpen={isOpen} onClose={onClose}>
        <ScriptModalContainer>
          <div style={loadingContainerStyle}>
            <div style={loadingSpinnerStyle}></div>
            <div style={loadingTextStyle}>PDF 파일을 분석하는 중...</div>
          </div>
        </ScriptModalContainer>
      </ScriptModalOverlay>
    );
  }

  return (
    <ScriptModalOverlay isOpen={isOpen} onClose={onClose}>
      <ScriptModalContainer>
        <ScriptModalContent>
          <MemoizedScriptModalPreview
            title={title}
            description={description}
            pdfFile={pdfFile}
            initialPage={currentPreviewPage}
            totalPages={slideInputs.length}
            renderPreviewContent={renderPreviewContent}
          />
          <ScriptModalDivider />
          <MemoizedScriptModalForm
            ref={formRef}
            slides={slideInputs}
            onSlideChange={handleSlideChange}
            onFocus={handleFocus}
          />
        </ScriptModalContent>
        <ScriptModalFooter
          onClose={onClose}
          onSave={handleSave}
          onExport={handleExport}
        />
      </ScriptModalContainer>
    </ScriptModalOverlay>
  );
};



const loadingContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
  gap: '20px',
  minHeight: '300px',
};

const loadingSpinnerStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  border: '4px solid #f0f0f0',
  borderTop: '4px solid #3282ff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const loadingTextStyle: React.CSSProperties = {
  fontSize: '16px',
  color: '#666',
  fontFamily: 'Pretendard',
};

// 호환성을 위한 타입 export
export type { SlideInput }; 