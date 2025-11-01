import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SimplePdfViewer } from '../components/ui/SimplePdfViewer';
import { TopNavBar } from '../components/ui/TopNavBar';
import { GoalTimeModal } from '../components/ui/GoalTimeModal';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { ScriptModal } from '../components/ScriptModal';
import { Sidebar, StatusBar, ExitModal, PracticeGuide, PracticeToolbar, SaveStatus } from '../components/practice';
import SelectionTooltip from '../components/practice/SelectionTooltip';
import { colors } from '../theme/colors';
import { useIsMobile } from '../hooks/useIsMobile';
import { SlideInput } from '../components/ScriptModal/ScriptModalForm';
import { getScript, getScripts, setScript, saveScripts, ScriptMap, PageScriptData } from '../lib/scriptStorage';
import { updateCurrentPage } from '../lib/api';


interface PracticePageState {
  pdfFile: File;
  slides: SlideInput[];
  fileId: number;
}

// Helper: SlideInput[] + pageTimes를 ScriptMap으로 변환
function buildScriptMap(
  slides: SlideInput[],
  pageTimes: Record<number, { minutes: number; seconds: number }>
): ScriptMap {
  const scriptMap: ScriptMap = {};
  slides.forEach(slide => {
    const pageTime = pageTimes[slide.slideNumber] || { minutes: 0, seconds: 0 };
    const duration = pageTime.minutes * 60 + pageTime.seconds;
    scriptMap[slide.slideNumber] = {
      content: slide.content || '',
      duration
    };
  });
  return scriptMap;
}

// Helper: 파일명에서 날짜 파싱 (script_YYMMDDHHMMSS.json -> 날짜 문자열)
function parseScriptFilename(filename: string): string {
  // script_251011231436.json -> 251011231436
  const match = filename.match(/script_(\d{12})\.json/);
  if (!match) return filename;

  const timestamp = match[1];
  const year = '20' + timestamp.substring(0, 2);
  const month = timestamp.substring(2, 4);
  const day = timestamp.substring(4, 6);
  const hour = timestamp.substring(6, 8);
  const minute = timestamp.substring(8, 10);

  // 오전/오후 구분
  const hourNum = parseInt(hour);
  const period = hourNum < 12 ? '오전' : '오후';
  const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;

  return `${year}.${month}.${day}. ${period} ${displayHour}:${minute}`;
}

// Helper: 파일명에서 날짜를 파싱해 Date로 반환
function parseScriptFilenameToDate(filename: string): Date | null {
  const match = filename.match(/script_(\d{12})\.json/);
  if (!match) return null;
  const ts = match[1];
  const year = 2000 + parseInt(ts.substring(0, 2), 10);
  const month = parseInt(ts.substring(2, 4), 10) - 1; // 0-indexed
  const day = parseInt(ts.substring(4, 6), 10);
  const hour = parseInt(ts.substring(6, 8), 10);
  const minute = parseInt(ts.substring(8, 10), 10);
  const second = parseInt(ts.substring(10, 12), 10);
  return new Date(year, month, day, hour, minute, second);
}

// Helper: 상대 시간 포맷 (분/시/일/달/년 중 가장 큰 단위만 표시)
function formatRelativeTimeFromFilename(filename: string): string {
  const date = parseScriptFilenameToDate(filename);
  if (!date) return '방금 전 수정됨.';
  const now = new Date();
  let diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) diffMs = 0; // 미래값 방어

  // 연/월은 달력을 기준으로 계산 (일/시/분은 ms 차이를 사용)
  const nowY = now.getFullYear();
  const nowM = now.getMonth();
  const nowD = now.getDate();
  const baseY = date.getFullYear();
  const baseM = date.getMonth();
  const baseD = date.getDate();

  let years = nowY - baseY;
  if (nowM < baseM || (nowM === baseM && nowD < baseD)) years -= 1;
  if (years >= 1) return `${years}년 전 수정됨.`;

  let totalMonths = (nowY - baseY) * 12 + (nowM - baseM);
  if (nowD < baseD) totalMonths -= 1;
  if (totalMonths >= 1) return `${totalMonths}달 전 수정됨.`;

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  const days = Math.floor(diffMs / dayMs);
  if (days >= 1) return `${days}일 전 수정됨.`;

  const hours = Math.floor(diffMs / hourMs);
  if (hours >= 1) return `${hours}시간 전 수정됨.`;

  const minutes = Math.floor(diffMs / minuteMs);
  if (minutes >= 1) return `${minutes}분 전 수정됨.`;

  return '방금 전 수정됨.';
}

export function Practice() {
  const isMobile = useIsMobile(480);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [practiceData, setPracticeData] = useState<PracticePageState | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
  const [scriptContent, setScriptContent] = useState('');
  const [showGoalTimeModal, setShowGoalTimeModal] = useState(true);
  const [goalTime, setGoalTime] = useState({ minutes: 0, seconds: 0 });
  const [showStopwatch, setShowStopwatch] = useState(true);
  const [isGoalTimeSet, setIsGoalTimeSet] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showPracticeGuide, setShowPracticeGuide] = useState(false);
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);
  // 미리보기 오버레이 상태
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const revisionAnchorRef = useRef<HTMLDivElement | null>(null);
  const revisionDropdownRef = useRef<HTMLDivElement | null>(null);
  const [selectedRevisionIndex, setSelectedRevisionIndex] = useState<number | null>(null);
  const [revisionList, setRevisionList] = useState<Array<{ filename: string; dateLabel: string }>>([]);
  const [previewingRevision, setPreviewingRevision] = useState(false); // 미리보기 중인지 여부
  const [previewScriptContent, setPreviewScriptContent] = useState<string>(''); // 미리보기 대본 내용

  // 드롭다운 외부 클릭 시 닫기 및 미리보기 취소
  useEffect(() => {
    if (!showRevisionHistory) {
      // 드롭다운이 닫힐 때 미리보기 취소
      if (previewingRevision) {
        setPreviewingRevision(false);
        setPreviewScriptContent('');
        setSelectedRevisionIndex(null);
      }
      return;
    }
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const anchor = revisionAnchorRef.current;
      const dropdown = revisionDropdownRef.current;
      if (!anchor) return;
      if (anchor.contains(target)) return; // 내부 클릭은 유지
      if (dropdown && dropdown.contains(target)) return;
      setShowRevisionHistory(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [showRevisionHistory, previewingRevision]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  
  // 페이지별 시간 추적
  const [currentPageTime, setCurrentPageTime] = useState({ minutes: 0, seconds: 0 });
  const [pageTimes, setPageTimes] = useState<Record<number, { minutes: number; seconds: number }>>({});
  
  // 대본 입력 영역 포커스 상태
  const [isScriptFocused, setIsScriptFocused] = useState(false);
  const [isScriptInputVisible, setIsScriptInputVisible] = useState(true);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false); // 전체 대본 생성
  const [isRegeneratingPage, setIsRegeneratingPage] = useState(false); // 단일 페이지 재생성
  const undoRef = useRef<Record<number, string[]>>({});
  const [dismissedEmptyGuide, setDismissedEmptyGuide] = useState(false); // 빈 상태 가이드 수동 닫힘

  // 텍스트 선택 툴팁 상태
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const pdfAreaRef = useRef<HTMLDivElement | null>(null);
  const scriptAreaRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [previewOverlayRect, setPreviewOverlayRect] = useState<{ top: number; left: number; width: number; height: number }>({ top: 0, left: 0, width: 0, height: 0 });

  // 되돌림: textarea 오버레이 렌더링 제거

  const saveScriptWithStatus = async (
    fileId: number,
    slideNumber: number,
    content: string,
    duration: number,
    goalTime: number,
    allSlides: ScriptMap
  ) => {
    if (isPreviewOpen || previewingRevision) {
      // 미리보기 중에는 저장 비활성화
      return;
    }
    setSaveStatus('saving');
    try {
      await setScript(fileId, slideNumber, content, duration, goalTime, allSlides);
      setSaveStatus('success');
    } catch (error) {
      console.error('대본 저장 실패:', error);
      setSaveStatus('error');
    }
  };

  const saveScriptsWithStatus = async (
    fileId: number,
    goalTime: number,
    slides: ScriptMap
  ) => {
    if (isPreviewOpen || previewingRevision) {
      return;
    }
    setSaveStatus('saving');
    try {
      await saveScripts(fileId, goalTime, slides);
      setSaveStatus('success');
    } catch (error) {
      console.error('대본 저장 실패:', error);
      setSaveStatus('error');
    }
  };

  useEffect(() => {
    const state = location.state as PracticePageState;
    if (!state || !state.pdfFile || !state.fileId) {
      navigate('/', { replace: true });
      return;
    }

    const loadInitialData = async () => {
      try {
        // 1. Get page count from the PDF
        const { getPdfPageCount } = await import('../lib/pdfUtils');
        const pageCount = await getPdfPageCount(state.pdfFile);

        // 2. Get stored scripts
        const { getScripts } = await import('../lib/scriptStorage');
        const scriptData = await getScripts(state.fileId);

        // 3. Create the initial slide structure and merge with stored scripts
        const initialSlides: SlideInput[] = Array.from({ length: pageCount }, (_, i) => {
            const slideNumber = i + 1;
            return {
                slideNumber: slideNumber,
                pageNumber: slideNumber,
                content: scriptData.slides[slideNumber]?.content || '',
            };
        });

        // 4. Set the complete practiceData state
        setPracticeData({
            ...state,
            slides: initialSlides,
        });

        // 5. Load times and other data from scriptData (as before)
        const loadedPageTimes: Record<number, { minutes: number; seconds: number }> = {};
        Object.entries(scriptData.slides).forEach(([pageNum, pageData]) => {
          const totalSeconds = pageData.duration || 0;
          loadedPageTimes[Number(pageNum)] = {
            minutes: Math.floor(totalSeconds / 60),
            seconds: totalSeconds % 60
          };
        });
        setPageTimes(loadedPageTimes);
        
        if (loadedPageTimes[1]) {
          setCurrentPageTime(loadedPageTimes[1]);
        }
        
        let totalMinutes = 0;
        let totalSeconds = 0;
        Object.values(loadedPageTimes).forEach(pageTime => {
          totalMinutes += pageTime.minutes;
          totalSeconds += pageTime.seconds;
        });
        totalMinutes += Math.floor(totalSeconds / 60);
        totalSeconds = totalSeconds % 60;
        setTimer({ minutes: totalMinutes, seconds: totalSeconds });
        
        if (scriptData.goalTime > 0) {
          const goalMinutes = Math.floor(scriptData.goalTime / 60);
          const goalSeconds = scriptData.goalTime % 60;
          setGoalTime({ minutes: goalMinutes, seconds: goalSeconds });
          setIsGoalTimeSet(true);
          setShowGoalTimeModal(false);
        }

      } catch (error) {
        console.error('초기 데이터 로드 실패:', error);
        navigate('/', { state: { error: { title: '오류', message: '연습 데이터를 불러오는 데 실패했습니다.' } } });
      }
    };

    loadInitialData();
  }, [location.state, navigate]);

  // 공유 링크 제거로 storedName 조회 로직 삭제



  useEffect(() => {
    if (practiceData) {
      const currentSlideData = practiceData.slides.find(slide => slide.slideNumber === currentSlide);
      const base = currentSlideData?.content || '';

      // API를 통해 대본과 시간 조회 (비동기)
      getScript(practiceData.fileId, currentSlide).then(scriptData => {
        setScriptContent(scriptData.content || base);

        // 저장된 시간이 있으면 currentPageTime 업데이트 (pageTimes에 없는 경우만)
        if (scriptData.duration && !pageTimes[currentSlide]) {
          const minutes = Math.floor(scriptData.duration / 60);
          const seconds = scriptData.duration % 60;
          setCurrentPageTime({ minutes, seconds });
        }
      }).catch(err => {
        console.warn('대본 조회 실패:', err);
        setScriptContent(base);
      });

      // 슬라이드 전환 시 undo 스택 초기화 (해당 슬라이드만)
      if (!undoRef.current[currentSlide]) undoRef.current[currentSlide] = [];
    }
  }, [currentSlide, practiceData, pageTimes]);

  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setTimer(prev => {
          const newSeconds = prev.seconds + 1;
          if (newSeconds >= 60) {
            return { minutes: prev.minutes + 1, seconds: 0 };
          }
          return { ...prev, seconds: newSeconds };
        });

        // 현재 페이지 시간도 업데이트
        setCurrentPageTime(prev => {
          const newSeconds = prev.seconds + 1;
          if (newSeconds >= 60) {
            return { minutes: prev.minutes + 1, seconds: 0 };
          }
          return { ...prev, seconds: newSeconds };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // 페이지 변경 시 또는 타이머 시작 시 시간 추적
  useEffect(() => {
    // 현재 페이지의 기존 시간을 가져오거나 초기화 (타이머 상태와 무관하게)
    const existingTime = pageTimes[currentSlide];
    setCurrentPageTime(existingTime || { minutes: 0, seconds: 0 });
  }, [currentSlide, pageTimes]);

  // 키보드 이벤트 핸들러 추가 (좌우 화살표로 슬라이드 전환)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 대본 입력 영역에 포커스가 있으면 키보드 이벤트 무시
      if (isScriptFocused) return;
      
      // 모달이 열려있으면 키보드 이벤트 무시
      if (showGoalTimeModal || showScriptModal || showExitModal) return;

      if (event.key === 'ArrowLeft') {
        // 왼쪽 화살표: 이전 슬라이드
        if (currentSlide > 1) {
          handleSlideClick(currentSlide - 1);
        }
      } else if (event.key === 'ArrowRight') {
        // 오른쪽 화살표: 다음 슬라이드
        if (practiceData && currentSlide < practiceData.slides.length) {
          handleSlideClick(currentSlide + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlide, practiceData, isScriptFocused, showGoalTimeModal, showScriptModal, showExitModal]);

  // Cmd/Ctrl+Z: 입력 영역에서도 되돌리기 (API 저장 포함)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isUndo = (e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z');
      if (!isUndo) return;
      // 입력 영역에 포커스가 있을 때만 처리
      if (!isScriptFocused) return;
      const stack = undoRef.current[currentSlide] || [];
      if (stack.length === 0) return;
      const prev = stack.pop() as string;
      setScriptContent(prev);
      if (practiceData) {
        const updatedSlides = practiceData.slides.map(slide =>
          slide.slideNumber === currentSlide ? { ...slide, content: prev } : slide
        );
        setPracticeData({ ...practiceData, slides: updatedSlides });

        // race condition 방지: 업데이트된 전체 슬라이드 데이터 전달
        const scriptMap = buildScriptMap(updatedSlides, pageTimes);
        const goalTimeSeconds = goalTime.minutes * 60 + goalTime.seconds;
        saveScriptWithStatus(practiceData.fileId, currentSlide, prev, 0, goalTimeSeconds, scriptMap);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentSlide, isScriptFocused, practiceData, pageTimes, goalTime]);

  // 툴바 상단 여백 (일괄 적용)
  const toolbarTopGap = '2px';

  // 미리보기 오버레이 위치를 textarea에 맞춤
  useEffect(() => {
    const recalc = () => {
      const ta = textareaRef.current;
      const container = scriptAreaRef.current;
      if (!ta || !container) return;
      const taRect = ta.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      setPreviewOverlayRect({
        top: Math.round(taRect.top - cRect.top),
        left: Math.round(taRect.left - cRect.left),
        width: Math.round(taRect.width),
        height: Math.round(taRect.height),
      });
    };
    recalc();
    window.addEventListener('resize', recalc);
    window.addEventListener('scroll', recalc, true);
    return () => {
      window.removeEventListener('resize', recalc);
      window.removeEventListener('scroll', recalc, true);
    };
  }, [isPreviewOpen, previewingRevision, isScriptInputVisible]);

  // 텍스트 선택 발생 시 툴팁 표시 (UI 전용)
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const active = document.activeElement as HTMLElement | null;
      // textarea 내부 선택 처리 (window.getSelection으로는 잡히지 않음)
      if (active && active.tagName === 'TEXTAREA') {
        const textarea = active as HTMLTextAreaElement;
        const withinScript = scriptAreaRef.current ? scriptAreaRef.current.contains(textarea) : false;
        if (withinScript && textarea.selectionStart !== textarea.selectionEnd) {
          setTooltipPosition({ x: Math.round(e.clientX), y: Math.round(e.clientY) });
          setIsTooltipVisible(true);
          return;
        }
      }

      const selection = window.getSelection();
      if (!selection) {
        setIsTooltipVisible(false);
        return;
      }
      const selectedText = selection.toString();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      if (selectedText && range) {
        // 선택이 허용된 영역(PDF 컨테이너/대본 영역) 내인지 확인
        const anchor = selection.anchorNode as Node | null;
        const focus = selection.focusNode as Node | null;
        const withinPdf = pdfAreaRef.current ? (anchor ? pdfAreaRef.current.contains(anchor) : false) || (focus ? pdfAreaRef.current.contains(focus) : false) : false;
        const withinScript = scriptAreaRef.current ? (anchor ? scriptAreaRef.current.contains(anchor) : false) || (focus ? scriptAreaRef.current.contains(focus) : false) : false;
        if (!withinPdf && !withinScript) {
          setIsTooltipVisible(false);
          return;
        }

        const rects = range.getClientRects();
        const lastRect = rects.length > 0 ? rects[rects.length - 1] : range.getBoundingClientRect();
        const centerX = lastRect.left + lastRect.width / 2;
        const topY = lastRect.top; // 툴팁은 위로 띄우므로 top 기준
        setTooltipPosition({ x: Math.round(centerX), y: Math.round(topY) });
        setIsTooltipVisible(true);
      } else {
        setIsTooltipVisible(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsTooltipVisible(false);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyDown);
    const handleScroll = () => setIsTooltipVisible(false);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);


  if (!practiceData) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingTextStyle}>연습 페이지를 준비하는 중...</div>
      </div>
    );
  }

  const { pdfFile, slides } = practiceData;
  const totalSlides = slides.length;
  // TODO: API 연동 시 실제 수정 내역 데이터로 교체
  // mockRevisions 제거 (빌드 최적화)

  const handleSlideClick = async (slideNumber: number) => {
    if (!practiceData) return;

    // 1. Create the most up-to-date version of the slides array
    const updatedSlides = practiceData.slides.map(slide =>
      slide.slideNumber === currentSlide
        ? { ...slide, content: scriptContent ?? '' }
        : slide
    );

    // 2. Update the main state so the next render is correct
    setPracticeData({
        ...practiceData,
        slides: updatedSlides
    });

    // 3. Now, perform the save operation with the updated data
    const updatedPageTimes = isTimerRunning
      ? { ...pageTimes, [currentSlide]: currentPageTime }
      : pageTimes;

    if (isTimerRunning) {
      setPageTimes(updatedPageTimes);
    }

    const pageTime = updatedPageTimes[currentSlide] || currentPageTime;
    const durationSeconds = pageTime.minutes * 60 + pageTime.seconds;
    const scriptMap = buildScriptMap(updatedSlides, updatedPageTimes);
    const goalTimeSeconds = goalTime.minutes * 60 + goalTime.seconds;

    saveScriptWithStatus(practiceData.fileId, currentSlide, scriptContent ?? '', durationSeconds, goalTimeSeconds, scriptMap);

    // 4. Finally, change the slide
    setCurrentSlide(slideNumber);

    // 5. Update current page via API
    try {
      await updateCurrentPage(practiceData.fileId, slideNumber);
    } catch (error) {
      console.error('현재 페이지 업데이트 실패:', error);
      // 실패해도 UI는 정상 동작하도록 에러를 무시합니다
    }
  };


  const toggleTimer = () => {
    if (isTimerRunning) {
      // 타이머 중지 시 현재 페이지 시간을 저장
      const updatedPageTimes = {
        ...pageTimes,
        [currentSlide]: currentPageTime
      };
      setPageTimes(updatedPageTimes);

      // 타이머 중지 시 현재 슬라이드의 대본 저장 (대본 없어도 duration 저장)
      if (practiceData) {
        const pageTime = updatedPageTimes[currentSlide] || currentPageTime;
        const durationSeconds = pageTime.minutes * 60 + pageTime.seconds;

        // 현재 슬라이드의 content를 업데이트한 slides 생성
        const updatedSlides = practiceData.slides.map(slide =>
          slide.slideNumber === currentSlide
            ? { ...slide, content: scriptContent ?? '' }
            : slide
        );

        // race condition 방지: 전체 슬라이드 데이터 전달
        const scriptMap = buildScriptMap(updatedSlides, updatedPageTimes);
        const goalTimeSeconds = goalTime.minutes * 60 + goalTime.seconds;
        saveScriptWithStatus(practiceData.fileId, currentSlide, scriptContent ?? '', durationSeconds, goalTimeSeconds, scriptMap);
      }
    } else {
      // 타이머 시작 시 안내문 숨김
      setShowPracticeGuide(false);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = async () => {
    // 모든 페이지의 duration을 0으로 초기화하여 저장
    if (practiceData) {
      try {

        const scriptsWithZeroDuration: Record<number, PageScriptData> = {};

        // 모든 슬라이드의 대본은 유지하되, duration만 0으로 설정
        practiceData.slides.forEach(slide => {
          scriptsWithZeroDuration[slide.slideNumber] = {
            content: slide.content,
            duration: 0
          };
        });

        const goalTimeSeconds = goalTime.minutes * 60 + goalTime.seconds;
        await saveScriptsWithStatus(practiceData.fileId, goalTimeSeconds, scriptsWithZeroDuration);
        
      } catch (error) {
        console.error('타이머 초기화 시 duration 저장 실패:', error);
      }
    }

    // 상태 초기화
    setIsTimerRunning(false);
    setTimer({ minutes: 0, seconds: 0 });
    setCurrentPageTime({ minutes: 0, seconds: 0 });
    setPageTimes({});
  };

  const handleScriptFocus = () => {
    setIsScriptFocused(true);
    setDismissedEmptyGuide(true);
  };

  const handleScriptBlur = () => {
    setIsScriptFocused(false);
    if (practiceData) {
      const updatedSlides = practiceData.slides.map(slide =>
        slide.slideNumber === currentSlide
          ? { ...slide, content: scriptContent }
          : slide
      );
      setPracticeData({
        ...practiceData,
        slides: updatedSlides
      });

      // 현재 슬라이드의 소요 시간을 초로 변환
      const pageTime = pageTimes[currentSlide] || currentPageTime;
      const durationSeconds = pageTime.minutes * 60 + pageTime.seconds;

      // race condition 방지: 전체 슬라이드 데이터 전달
      const scriptMap = buildScriptMap(updatedSlides, pageTimes);
      const goalTimeSeconds = goalTime.minutes * 60 + goalTime.seconds;
      saveScriptWithStatus(practiceData.fileId, currentSlide, scriptContent ?? '', durationSeconds, goalTimeSeconds, scriptMap);
    }
  };

  const handleGoalTimeComplete = async (goalMinutes: number, goalSeconds: number, showStopwatchSetting: boolean) => {
    setGoalTime({ minutes: goalMinutes, seconds: goalSeconds });
    setShowStopwatch(showStopwatchSetting);
    setIsPracticing(!showStopwatchSetting);
    setShowGoalTimeModal(false);
    setIsGoalTimeSet(true);
    // 목표시간 설정 완료 후 안내문 표시
    setShowPracticeGuide(true);

    // 목표 시간을 API로 저장
    if (practiceData) {
      try {

        // 기존 스크립트 가져오기
        const scriptData = await getScripts(practiceData.fileId);
        const goalTimeSeconds = goalMinutes * 60 + goalSeconds;

        // 목표 시간만 업데이트
        await saveScriptsWithStatus(practiceData.fileId, goalTimeSeconds, scriptData.slides);
        
      } catch (error) {
        console.error('목표 시간 저장 실패:', error);
      }
    }
  };

  const handleTimeSettingClick = () => {
    setShowGoalTimeModal(true);
  };

  const handleScriptWritingClick = () => {
    setShowScriptModal(true);
  };

  const handleScriptModalClose = async () => {
    setShowScriptModal(false);

    // 모달 닫힐 때 최신 대본 다시 불러오기 (localStorage)
    if (practiceData) {
      try {
        const { getScripts } = await import('../lib/scriptStorage');
        const scriptData = await getScripts(practiceData.fileId);

        // 현재 슬라이드의 대본 업데이트
        const currentSlideScript = scriptData.slides[currentSlide];
        if (currentSlideScript) {
          setScriptContent(currentSlideScript.content || '');
          
        }

        // practiceData의 모든 슬라이드 대본 업데이트
        const updatedSlides = practiceData.slides.map(slide => {
          const slideScript = scriptData.slides[slide.slideNumber];
          return {
            ...slide,
            content: slideScript?.content || slide.content
          };
        });

        setPracticeData({
          ...practiceData,
          slides: updatedSlides
        });

        
      } catch (error) {
        console.error('ScriptModal 닫힘 - 대본 로드 실패:', error);
      }
    }
  };

  const handleScriptModalSave = (slides: SlideInput[]) => {
    // ScriptModal에서 저장이 완료되었고, onClose()도 호출됨
    // 모달이 닫힐 때 handleScriptModalClose가 최신 데이터를 로드할 것임
    if (practiceData) {
      setPracticeData({
        ...practiceData,
        slides: slides
      });
    }
  };

  // 공유하기 기능 제거됨

  const handleScriptSlideChange = (slideNumber: number, content: string) => {
    if (practiceData) {
      const updatedSlides = practiceData.slides.map(slide =>
        slide.slideNumber === slideNumber
          ? { ...slide, content }
          : slide
      );
      setPracticeData({
        ...practiceData,
        slides: updatedSlides
      });
    }
  };

  const handlePracticeToggle = () => {
    setIsPracticing(!isPracticing);
  };

  const handleStopwatchToggle = (showStopwatch: boolean) => {
    // 스톱워치 보기 옵션과 연동
    // showStopwatch가 false면 스톱워치를 숨기고 "연습 중" 표시
    setShowStopwatch(showStopwatch);
    setIsPracticing(!showStopwatch);
  };

  const handleExitClick = () => {
    setShowExitModal(true);
  };

  const handleExitCancel = () => {
    setShowExitModal(false);
  };

  const handleExitConfirm = async () => {
    setShowExitModal(false);

    // 현재 페이지 시간을 포함한 최종 pageTimes 계산
    const finalPageTimes = {
      ...pageTimes,
      [currentSlide]: currentPageTime
    };

    // 모든 페이지의 duration을 API로 저장
    if (practiceData) {
      try {

        const scriptsWithDuration: Record<number, PageScriptData> = {};

        practiceData.slides.forEach(slide => {
          const pageTime = finalPageTimes[slide.slideNumber] || { minutes: 0, seconds: 0 };
          const durationSeconds = pageTime.minutes * 60 + pageTime.seconds;

          scriptsWithDuration[slide.slideNumber] = {
            content: slide.content,
            duration: durationSeconds
          };
        });

        const goalTimeSeconds = goalTime.minutes * 60 + goalTime.seconds;
        await saveScriptsWithStatus(practiceData.fileId, goalTimeSeconds, scriptsWithDuration);
        
      } catch (error) {
        console.error('연습 종료 - duration 저장 실패:', error);
      }
    }

    // 결과 데이터 구성
    const resultData = {
      totalTime: timer,
      pageTimes: finalPageTimes,
      slides: practiceData.slides,
      pdfFile: practiceData.pdfFile,
      goalTime: goalTime,
      fileId: practiceData.fileId
    };

    // 결과 보고서 페이지로 이동
    navigate('/result', {
      state: resultData,
      replace: true
    });
  };

  const handleGuideClick = () => {
    setShowPracticeGuide(false);
  };

  const handleScriptInputToggle = () => {
    setIsScriptInputVisible(!isScriptInputVisible);
  };

  // 수정 내역 버튼 클릭 시 API로 목록 조회
  const handleRevisionHistoryClick = async () => {
    const newState = !showRevisionHistory;
    setShowRevisionHistory(newState);

    // 드롭다운을 열 때마다 API 조회 (최신 목록 가져오기)
    if (newState && practiceData) {
      try {
        const { listScripts } = await import('../lib/api');
        const filenames = await listScripts(practiceData.fileId);

        // 파일명을 날짜로 변환
        const revisions = filenames.map(filename => ({
          filename,
          dateLabel: parseScriptFilename(filename)
        }));

        setRevisionList(revisions);
      } catch (error) {
        console.error('수정 내역 조회 실패:', error);
      }
    }
  };

  // 수정 내역 항목 클릭 (미리보기)
  const handleRevisionItemClick = async (index: number) => {
    if (!practiceData) return;

    const revision = revisionList[index];
    if (!revision) return;

    // 선택된 항목 토글
    if (selectedRevisionIndex === index) {
      // 이미 선택된 항목을 다시 클릭하면 미리보기 취소
      setSelectedRevisionIndex(null);
      setPreviewingRevision(false);
      setPreviewScriptContent('');
      return;
    }

    try {
      // 특정 파일명의 대본 조회
      const { getScript } = await import('../lib/api');
      const scriptData = await getScript(practiceData.fileId, revision.filename);

      // 현재 슬라이드의 대본을 미리보기로 설정 (scriptContent는 변경하지 않음)
      const currentSlideScript = scriptData.slides[currentSlide];
      if (currentSlideScript) {
        setPreviewScriptContent(currentSlideScript.content || '');
        setPreviewingRevision(true);
      }

      setSelectedRevisionIndex(index);
    } catch (error) {
      console.error('대본 미리보기 실패:', error);
    }
  };

  // 복원 버튼 클릭
  const handleRestoreRevision = async (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // 부모의 onClick 방지

    if (!practiceData) return;

    const revision = revisionList[index];
    if (!revision) return;

    try {
      // 특정 파일명의 대본 조회
      const { getScript } = await import('../lib/api');
      const scriptData = await getScript(practiceData.fileId, revision.filename);

      // 모든 슬라이드 업데이트
      const updatedSlides = practiceData.slides.map(slide => {
        const slideScript = scriptData.slides[slide.slideNumber];
        return {
          ...slide,
          content: slideScript?.content || slide.content
        };
      });

      setPracticeData({
        ...practiceData,
        slides: updatedSlides
      });

      // 현재 슬라이드 content도 업데이트
      const currentSlideScript = scriptData.slides[currentSlide];
      if (currentSlideScript) {
        setScriptContent(currentSlideScript.content || '');
      }

      // localStorage 업데이트
      const all = JSON.parse(localStorage.getItem('ssu-time.scripts') || '{}');
      all[String(practiceData.fileId)] = scriptData;
      localStorage.setItem('ssu-time.scripts', JSON.stringify(all));

      
      setShowRevisionHistory(false);
      setSelectedRevisionIndex(null);
      setPreviewingRevision(false);
    } catch (error) {
      console.error('대본 복원 실패:', error);
    }
  };

  const handleRegenerateCurrentPage = async () => {
    

    if (!practiceData || isRegeneratingPage || isGeneratingScript) {
      
      return;
    }

    // 툴팁 닫기
    setIsTooltipVisible(false);

    setIsRegeneratingPage(true);
    try {
      const { regeneratePageScript } = await import('../lib/api');
      

      // 현재 페이지의 기존 스크립트를 전달
      const existingScript = scriptContent || '';

      // 단일 페이지 재생성 API 호출
      const transcriptPage = await regeneratePageScript(
        practiceData.fileId,
        currentSlide,
        existingScript
      );
      

      // 1. localStorage 먼저 업데이트 (백엔드는 이미 regenerate API에서 저장됨)
      const pageTime = pageTimes[currentSlide] || currentPageTime;
      const durationSeconds = pageTime.minutes * 60 + pageTime.seconds;
      const goalTimeSeconds = goalTime.minutes * 60 + goalTime.seconds;

      // localStorage에서 현재 스크립트 데이터 가져오기
      const all = JSON.parse(localStorage.getItem('ssu-time.scripts') || '{}');
      const currentScriptData = all[String(practiceData.fileId)] || { goalTime: goalTimeSeconds, slides: {} };

      // 현재 페이지만 업데이트
      currentScriptData.slides[currentSlide] = {
        content: transcriptPage.content,
        duration: durationSeconds
      };
      currentScriptData.goalTime = goalTimeSeconds;

      // localStorage에 저장
      all[String(practiceData.fileId)] = currentScriptData;
      localStorage.setItem('ssu-time.scripts', JSON.stringify(all));
      

      // 2. 그 다음 UI 업데이트
      setScriptContent(transcriptPage.content);

      // practiceData 업데이트
      const updatedSlides = practiceData.slides.map(slide =>
        slide.slideNumber === currentSlide
          ? { ...slide, content: transcriptPage.content }
          : slide
      );

      setPracticeData({
        ...practiceData,
        slides: updatedSlides
      });

      
      setIsRegeneratingPage(false);
    } catch (error) {
      console.error('페이지 대본 재생성 실패:', error);
      setIsRegeneratingPage(false);
    }
  };

  const handleGenerateAllScripts = async () => {
    if (!practiceData || isGeneratingScript || isRegeneratingPage) return;
    setIsGeneratingScript(true);
    try {
      const { generateScript: generateScriptApi } = await import('../lib/api');
      const transcriptPages = await generateScriptApi(practiceData.fileId);

      const scriptMap: ScriptMap = {};
      transcriptPages.forEach(page => {
        scriptMap[page.pageNumber] = {
          content: page.content,
          duration: 0
        };
      });

      const { saveScripts } = await import('../lib/scriptStorage');
      await saveScripts(practiceData.fileId, 0, scriptMap);

      const currentScript = scriptMap[currentSlide];
      if (currentScript) {
        setScriptContent(currentScript.content || '');
      }

      const updatedSlides = practiceData.slides.map(slide => {
        const slideScript = scriptMap[slide.slideNumber];
        return {
          ...slide,
          content: slideScript?.content || slide.content
        };
      });

      setPracticeData({
        ...practiceData,
        slides: updatedSlides
      });

      setIsGeneratingScript(false);
    } catch (error) {
      console.error('대본 생성 실패:', error);
      setIsGeneratingScript(false);
    }
  };


  return (
    <div style={containerStyle}>
      {/* TopNavBar 사용 */}
      <TopNavBar />
      
      {/* 메인 콘텐츠 */}
      <div style={mainContentStyle}>
        {/* 연습 안내문 - 절대 위치 */}
        <PracticeGuide 
          isVisible={showPracticeGuide} 
          onDismiss={handleGuideClick}
        />
        
        {/* 왼쪽 사이드바 (모바일 오버레이) */}
        <div
          style={{
            position: isMobile ? 'absolute' : 'relative',
            zIndex: isMobile ? 30 : 'auto',
            top: 0,
            left: 0,
            height: '100%',
            transform: isMobile ? (isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
            transition: isMobile ? 'transform 0.2s ease' : undefined,
            boxShadow: isMobile && isSidebarOpen ? '0 0 20px rgba(0,0,0,0.15)' : 'none',
          }}
        >
        <Sidebar
          slides={slides}
          currentSlide={currentSlide}
          timer={timer}
          isTimerRunning={isTimerRunning}
          pdfFile={pdfFile}
          onSlideClick={handleSlideClick}
          onToggleTimer={toggleTimer}
          onResetTimer={resetTimer}
          isPracticing={isPracticing}
          onPracticeToggle={handlePracticeToggle}
          onExitClick={handleExitClick}
          saveStatus={saveStatus}
          onSaveStatusIdle={() => setSaveStatus('idle')}
          onCloseSidebar={isMobile ? () => setIsSidebarOpen(false) : undefined}
        />
        </div>

        {/* 메인 영역 */}
        <div style={mainAreaStyle}>
          {/* 상단 상태바 */}
          <StatusBar
            currentSlide={currentSlide}
            totalSlides={totalSlides}
            isMobile={isMobile}
            onToggleSidebar={isMobile ? () => setIsSidebarOpen(v => !v) : undefined}
          />

          {/* 콘텐츠 영역 */}
          <div style={{
            ...contentAreaStyle,
            padding: isMobile ? '0 22px' : contentAreaStyle.padding,
          }}>
            {/* PDF 뷰어 */}
            <div style={{
              ...pdfViewerContainerStyle,
              height: isMobile
                ? 'calc(100vh - 60px - 48px)'
                : (isScriptInputVisible ? '614px' : 'calc(100vh - 180px)'),
              margin: isMobile ? '0 5px' : 0,
            }}>
              <div ref={pdfAreaRef} style={{ position: 'absolute', inset: 0 }}>
                <SimplePdfViewer
                  file={pdfFile}
                  currentPage={currentSlide}
                />
              </div>

              {/* 목표 시간 설정 모달 - PDF 뷰어 내부에서 오버레이 */}
              {showGoalTimeModal && (
                <div style={pdfOverlayStyle}>
                  <GoalTimeModal
                    isOpen={showGoalTimeModal}
                    onComplete={handleGoalTimeComplete}
                    onStopwatchToggle={handleStopwatchToggle}
                    embedded={true}
                    initialMinutes={isGoalTimeSet ? goalTime.minutes : 10}
                    initialSeconds={isGoalTimeSet ? goalTime.seconds : 0}
                    initialStopwatchSetting={showStopwatch}
                  />
                </div>
              )}

            </div>

            {/* 대본 입력 영역 */}
            {isScriptInputVisible && (
          <div ref={scriptAreaRef} style={{ ...scriptInputContainerStyle, position: 'relative' }}>
            {/* 스크립트 헤더(슬라이드/타이머/수정 내역 버튼) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.label.neutral }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isTimerRunning ? colors.primary.normal : colors.label.neutral }} />
                <div style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px' }}>슬라이드 {String(currentSlide).padStart(2, '0')}</div>
                <div style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: isTimerRunning ? colors.primary.normal : colors.label.neutral }}>
                  {String(currentPageTime.minutes).padStart(2, '0')}:{String(currentPageTime.seconds).padStart(2, '0')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div ref={revisionAnchorRef} style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    onClick={handleRevisionHistoryClick}
                    style={{
                      background: colors.fill.neutral,
                      color: colors.label.alternative,
                      border: 'none',
                      height: '27px',
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontFamily: 'Pretendard, sans-serif',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                    aria-label="수정 내역"
                  >
                    수정 내역 ▾
                  </button>
                  {showRevisionHistory && (
                    <div
                      ref={revisionDropdownRef}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '270px',
                        background: colors.static.white,
                        borderRadius: '16px',
                        boxShadow: '0px 2px 5px rgba(0,0,0,0.15)',
                        padding: '0 12px',
                        zIndex: 1000,
                      }}
                    >
                      {revisionList.length === 0 ? (
                        <div style={{
                          padding: '20px',
                          textAlign: 'center',
                          color: colors.label.alternative,
                          fontFamily: 'Pretendard, sans-serif',
                          fontSize: '13px'
                        }}>
                          수정 내역이 없습니다
                        </div>
                      ) : (
                        <div style={{ maxHeight: revisionList.length > 3 ? '200px' : 'auto', overflowY: revisionList.length > 3 ? 'auto' : 'visible', display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0' }}>
                          {revisionList.map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                height: '55px', padding: '0 12px',
                                background: selectedRevisionIndex === idx ? colors.fill.neutral : colors.static.white,
                                borderRadius: '12px',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleRevisionItemClick(idx)}
                              role="button"
                              aria-label={`수정 내역 ${idx + 1}`}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <div style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '13px', color: selectedRevisionIndex === idx ? colors.label.normal : colors.label.neutral }}>{item.dateLabel}</div>
                                <div style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '11px', color: colors.label.alternative }}>{formatRelativeTimeFromFilename(item.filename)}</div>
                              </div>
                              {selectedRevisionIndex === idx && (
                                <Button
                                  variant="primary"
                                  size="small"
                                  onClick={(e) => handleRestoreRevision(e, idx)}
                                  style={{ height: '30px', minWidth: 'unset', padding: '0 12px' }}
                                >
                                  복원
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <textarea 
                    ref={textareaRef}
                    value={previewingRevision ? (previewScriptContent ?? '') : scriptContent}
                    onChange={(e) => {
                      // 입력 전 상태를 undo 스택에 저장 (연속 입력 최적화는 생략)
                      const stack = undoRef.current[currentSlide] || (undoRef.current[currentSlide] = []);
                      if (stack.length === 0 || stack[stack.length - 1] !== scriptContent) {
                        stack.push(scriptContent);
                      }
                      setScriptContent(e.target.value);
                    }}
                    onFocus={handleScriptFocus}
                    onBlur={handleScriptBlur}
                    onMouseDown={() => setDismissedEmptyGuide(true)}
                    placeholder={(
                      !previewingRevision &&
                      !isGeneratingScript &&
                      !isRegeneratingPage &&
                      (!scriptContent || scriptContent.trim() === '') &&
                      !dismissedEmptyGuide
                    ) ? '' : '해당 슬라이드의 대본을 입력하세요.'}
                    disabled={isGeneratingScript || isRegeneratingPage || isPreviewOpen || previewingRevision}
                    style={{
                      ...textareaStyle,
                      backgroundColor: isScriptFocused ? colors.static.white : colors.fill.normal,
                      border: (isScriptFocused || previewingRevision || isPreviewOpen) ? `2px solid ${colors.primary.normal}` : '2px solid transparent',
                      opacity: (isGeneratingScript || isRegeneratingPage) ? 0.6 : 1,
                      transition: 'background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease'
                    }}
                  />
              {(!previewingRevision && !isGeneratingScript && !isRegeneratingPage && (!scriptContent || scriptContent.trim() === '') && !dismissedEmptyGuide) && (
                <div style={emptyGuideOverlayStyle}>
                  <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={emptyGuideCardStyle}
                      onClick={async () => {
                        setDismissedEmptyGuide(true);
                        await handleGenerateAllScripts();
                        const ta = textareaRef.current;
                        if (ta) ta.focus();
                      }}
                      role="button"
                      aria-label="전체 대본 생성"
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flex: '0 0 auto' }}>
                        <g clipPath="url(#clip0_1644_7740)">
                          <path d="M7.54069 3.293L0.950187 9.8845C0.679397 10.1749 0.531908 10.559 0.538806 10.956C0.545703 11.353 0.706448 11.7318 0.987162 12.0125C1.26788 12.2933 1.64663 12.4541 2.04361 12.4611C2.44058 12.4681 2.82476 12.3207 3.11519 12.05L9.70719 5.4595L7.54069 3.293ZM8.29319 5.4595L7.00019 6.7525L6.25019 6L7.54319 4.707L8.29319 5.4595ZM2.40819 11.344C2.30711 11.4403 2.17283 11.4941 2.03319 11.4941C1.89355 11.4941 1.75926 11.4403 1.65819 11.344C1.5589 11.2445 1.50313 11.1096 1.50313 10.969C1.50313 10.8284 1.5589 10.6935 1.65819 10.594L5.54269 6.709L6.29519 7.4615L2.40819 11.344ZM11.1667 7.814L12.5002 8.481L11.1667 9.15L10.5002 10.481L9.83369 9.15L8.50019 8.481L9.83369 7.814L10.5002 6.481L11.1667 7.814ZM3.83369 3.1665L2.50019 2.5L3.83369 1.8335L4.50019 0.5L5.16669 1.8335L6.50019 2.5L5.16669 3.1665L4.50019 4.5L3.83369 3.1665ZM10.1667 2.8335L9.00019 2.25L10.1667 1.6665L10.7502 0.5L11.3337 1.6665L12.5002 2.25L11.3337 2.8335L10.7502 4L10.1667 2.8335Z" fill="#7D7E83"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_1644_7740">
                            <rect width="12" height="12" fill="white" transform="translate(0.5 0.5)"/>
                          </clipPath>
                        </defs>
                      </svg>
                      <div style={emptyGuideTitleStyle}>클릭만 하면 전체 대본 완성</div>
                    </div>
                    <button
                      onClick={async () => {
                        setDismissedEmptyGuide(true);
                        await handleGenerateAllScripts();
                        const ta = textareaRef.current;
                        if (ta) ta.focus();
                      }}
                      style={emptyGuideActionStyle}
                    >
                      직접 작성하기
                    </button>
                  </div>
                </div>
              )}
            </div>
                {/* 스타일 렌더러 제거 (되돌림) */}
                {/* 선택 툴팁은 페이지 전역 1회 렌더링됨 */}
            {(isGeneratingScript || isRegeneratingPage) && (
                  <div style={scriptGeneratingOverlayStyle}>
                    <Spinner size={20} color={colors.primary.normal} strokeWidth={2.5} />
                    <div style={overlayTextStyle}>
                      {isRegeneratingPage
                        ? '1장의 대본 생성 중...'
                        : `${practiceData.slides.length}장의 대본 생성 중...`}
                    </div>
                  </div>
                )}
                {(isPreviewOpen || previewingRevision) && (
                  <div style={{
                    position: 'absolute',
                    top: previewOverlayRect.top,
                    left: previewOverlayRect.left,
                    width: previewOverlayRect.width,
                    height: previewOverlayRect.height,
                    background: 'transparent',
                    borderRadius: '15px',
                    zIndex: 50,
                  }}>
                    {/* 제목 없음, textarea 그대로 보이도록 투명 오버레이 */}
                    <button
                      onClick={() => {
                        if (previewingRevision) {
                          setPreviewingRevision(false);
                          setPreviewScriptContent('');
                          setSelectedRevisionIndex(null);
                        }
                        if (isPreviewOpen) setIsPreviewOpen(false);
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        border: 'none',
                        background: colors.fill.neutral,
                        color: colors.label.alternative,
                        borderRadius: '8px',
                        height: '30px',
                        padding: '0 12px',
                        cursor: 'pointer',
                        fontFamily: 'Pretendard, sans-serif',
                        fontSize: '13px',
                      }}
                    >
                      닫기
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* 연습 툴바 - 피그마 디자인에 맞춤 (반응형 여백 적용) */}
            <div style={{ marginTop: isMobile ? 8 : toolbarTopGap }}>
            <PracticeToolbar
              onViewToggle={handleScriptInputToggle}
              onTimeSettingClick={handleTimeSettingClick}
              onEditScript={handleScriptWritingClick}
              onGenerateScript={handleRegenerateCurrentPage}
              onPracticeToggle={handlePracticeToggle}
              onEnd={handleExitClick}
              currentPageTime={currentPageTime}
              isPracticing={isPracticing}
              disabled={isGeneratingScript || isRegeneratingPage}
              currentSlide={currentSlide}
              totalSlides={practiceData.slides.length}
            />
            </div>
          </div>
        </div>
      </div>
      {/* 수정 내역 드롭다운만 사용. 모달은 제거됨 */}

      {/* 대본 작성 모달 */}
      {showScriptModal && practiceData && (
        <ScriptModal
          isOpen={showScriptModal}
          onClose={handleScriptModalClose}
          pdfFile={practiceData.pdfFile}
          fileId={practiceData.fileId}
          slides={practiceData.slides}
          onSave={handleScriptModalSave}
          onSlideChange={handleScriptSlideChange}
          onExport={() => {
            try {
              // localStorage의 json 대본을 가져와 인쇄용 HTML 생성
              const all = JSON.parse(localStorage.getItem('ssu-time.scripts') || '{}');
              const stored = all[String(practiceData.fileId)];
              const map = stored?.slides || {};
              const ids = Object.keys(map).map(n => Number(n)).sort((a,b)=>a-b);
              const filename = practiceData.pdfFile?.name || '발표 대본';
              const escapeHtml = (s: string) => (s || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
              const sections = ids.map(id => (
                `<section class=\"slide-section\">` +
                  `<div class=\"slide-title\">슬라이드 ${String(id).padStart(2,'0')}</div>` +
                  `<div class=\"slide-content\">${escapeHtml(map[id]?.content || '')}</div>` +
                `</section>`
              )).join('');

              // 동일 창에서 프린트: print root를 DOM에 주입하고 프린트 후 제거
              const printRoot = document.createElement('div');
              printRoot.id = 'print-root';
              printRoot.innerHTML = `
                <style>
                  @page { margin: 16mm; }
                  /* 프린트 시 print-root만 보이도록 */
                  @media print {
                    body * { visibility: hidden !important; }
                    #print-root, #print-root * { visibility: visible !important; }
                    #print-root { position: absolute; left: 0; top: 0; }
                  }
                  /* 화면에서는 안 보이게 */
                  @media screen { #print-root { display: none; } }
                  .doc { font-family: Pretendard, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#171719; }
                  .doc-title { font-size: 20px; font-weight: 700; margin: 0 0 16px 0; }
                  .slide-section { margin-bottom: 18px; }
                  .slide-title { font-size: 16px; font-weight: 700; margin: 18px 0 6px; }
                  .slide-content { white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
                </style>
                <div class="doc">
                  <h1 class="doc-title">${escapeHtml(filename)}</h1>
                  ${sections}
                </div>
              `;
              document.body.appendChild(printRoot);
              const cleanup = () => {
                try { document.body.removeChild(printRoot); } catch {}
                window.removeEventListener('afterprint', cleanup);
              };
              window.addEventListener('afterprint', cleanup);
              window.print();
              // 일부 브라우저에서 afterprint가 호출되지 않을 수 있어 타임아웃 보강
              setTimeout(cleanup, 1500);
            } catch (e) {
              console.error('문서로 출력하기 실패:', e);
            }
          }}
        />
      )}

      {/* 종료 모달 */}
      <ExitModal
        isOpen={showExitModal}
        onCancel={handleExitCancel}
        onConfirm={handleExitConfirm}
      />

      {/* 선택 툴팁 - 최상위 레벨 렌더링 */}
      <SelectionTooltip
        visible={isTooltipVisible}
        x={tooltipPosition.x}
        y={tooltipPosition.y}
        slideNumber={currentSlide}
        onGenerateScript={handleRegenerateCurrentPage}
        onHighlight={() => {
          try {
            // 우선순위: 미리보기 중이면 원본 변경하지 않음
            if (previewingRevision) return;
            const ta = textareaRef.current;
            if (!ta) return;
            const start = ta.selectionStart ?? 0;
            const end = ta.selectionEnd ?? 0;
            if (end <= start) return; // 선택 없음
            const selected = scriptContent.slice(start, end);
            const toInsert = `\`${selected}\``; // 형광펜: 백틱
            const before = scriptContent.slice(0, start);
            const after = scriptContent.slice(end);
            const next = `${before}${toInsert}${after}`;
            setScriptContent(next);
            // 커서 이동 및 선택 해제
            requestAnimationFrame(() => {
              ta.focus();
              ta.selectionStart = ta.selectionEnd = start + toInsert.length;
            });
          } finally {
            setIsTooltipVisible(false);
          }
        }}
        onBold={() => {
          try {
            if (previewingRevision) return;
            const ta = textareaRef.current;
            if (!ta) return;
            const start = ta.selectionStart ?? 0;
            const end = ta.selectionEnd ?? 0;
            if (end <= start) return;
            const selected = scriptContent.slice(start, end);
            const toInsert = `*${selected}*`;
            const before = scriptContent.slice(0, start);
            const after = scriptContent.slice(end);
            const next = `${before}${toInsert}${after}`;
            setScriptContent(next);
            requestAnimationFrame(() => {
              ta.focus();
              ta.selectionStart = ta.selectionEnd = start + toInsert.length;
            });
          } finally {
            setIsTooltipVisible(false);
          }
        }}
        onClose={() => setIsTooltipVisible(false)}
      />
    </div>
  );
}

// 스타일 정의 - 피그마 디자인에 정확히 맞춤
const containerStyle: React.CSSProperties = {
  width: '100vw',
  height: '100vh',
  backgroundColor: colors.background.normal,
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Pretendard, sans-serif',
  margin: 0,
  padding: 0,
  overflow: 'hidden',
};

const loadingContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: colors.background.normal,
};

const loadingTextStyle: React.CSSProperties = {
  fontSize: '16px',
  color: colors.label.neutral,
  fontFamily: 'Pretendard, sans-serif',
};

// 메인 콘텐츠 스타일
const mainContentStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  height: 'calc(100vh - 60px)', // TopNavBar 높이 제외
  overflow: 'hidden',
  position: 'relative',
};

// 메인 영역 스타일
const mainAreaStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: colors.background.normal,
  borderLeft: `1px solid ${colors.fill.neutral}`,
  height: '100%',
};

// 콘텐츠 영역 (PDF + 대본)
const contentAreaStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '0 45px',
  gap: '16px',
  overflow: 'hidden',
};

// PDF 뷰어 컨테이너
const pdfViewerContainerStyle: React.CSSProperties = {
  backgroundColor: colors.fill.normal,
  borderRadius: '12px',
  height: '614px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
};

// PDF 뷰어 내부 오버레이
const pdfOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(71, 69, 69, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  borderRadius: '12px',
};

// 대본 입력 컨테이너
const scriptInputContainerStyle: React.CSSProperties = {
  flex: 'none',
  marginBottom: '0px',
};

// 대본 텍스트에어리어
const textareaStyle: React.CSSProperties = {
  width: '100%',
  height: '191px',
  maxHeight: '191px',
  minHeight: '116px',
  borderRadius: '15px',
  padding: '35px 40px',
  fontSize: '16px',
  fontWeight: 500,
  color: colors.label.normal,
  fontFamily: 'Pretendard, sans-serif',
  resize: 'none',
  outline: 'none',
  boxSizing: 'border-box',
  lineHeight: 1.5,
};

// 빈 상태 가이드 카드 스타일
const emptyGuideCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  background: colors.fill.normal,
  border: `1px solid ${colors.line.normal}`,
  borderRadius: '8px',
  padding: '8px 14px',
  boxSizing: 'border-box',
  cursor: 'pointer',
};

const emptyGuideTitleStyle: React.CSSProperties = {
  fontFamily: 'Pretendard, sans-serif',
  fontSize: '13px',
  fontWeight: 500,
  color: colors.label.neutral,
};

// deprecated: subtitle 스타일 (현재 미사용)

// textarea 중앙 오버레이 컨테이너
const emptyGuideOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none', // 클릭은 아래 textarea로 통과
};

const emptyGuideActionStyle: React.CSSProperties = {
  marginTop: '12px',
  background: 'transparent',
  border: 'none',
  padding: 0,
  fontFamily: 'Pretendard, sans-serif',
  fontSize: '12px',
  color: '#AEAFB0',
  cursor: 'pointer',
  pointerEvents: 'auto',
};

// 대본 생성 중 오버레이
const scriptGeneratingOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  pointerEvents: 'none',
};

const overlayTextStyle: React.CSSProperties = {
  fontFamily: 'Pretendard, sans-serif',
  fontSize: '14px',
  color: colors.label.neutral,
};
