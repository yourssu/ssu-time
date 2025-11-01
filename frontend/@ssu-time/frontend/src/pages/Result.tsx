import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PracticeResult } from '../components/ResultReport';
import { TopNavBar } from '../components/ui/TopNavBar';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { colors } from '../theme/colors';
import { useIsMobile } from '../hooks/useIsMobile';
import { ExpectedQuestion } from '../lib/api';

export function Result() {
  const isMobile = useIsMobile(480);
  const location = useLocation();
  const navigate = useNavigate();
  // 페이지 이동 상태(현재 미사용)
  const [isScriptCardFlipped, setIsScriptCardFlipped] = React.useState(false);
  const [practiceResult, setPracticeResult] = React.useState<PracticeResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [questions, setQuestions] = React.useState<ExpectedQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = React.useState(false);
  // Hover tooltip for per-slide time bars (must be declared before any early returns)
  const [hoveredBarIndex, setHoveredBarIndex] = React.useState<number | null>(null);
  const formatSecToMMSS = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  // Virtual container for responsive trend bars
  const trendContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [trendContainerWidth, setTrendContainerWidth] = React.useState(0);
  React.useEffect(() => {
    const el = trendContainerRef.current;
    if (!el) return;
    const update = () => setTrendContainerWidth(el.clientWidth);
    update();
    const handleResize = () => update();
    window.addEventListener('resize', handleResize);
    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(() => update());
      ro.observe(el);
    } catch (_) {
      // ignore
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, []);

  React.useEffect(() => {
    const loadResultData = async () => {
      const state = location.state as any;

      if (!state) {
        setIsLoading(false);
        return;
      }

      // fileId가 있으면 localStorage에서 script를 가져와서 업데이트
      if (state.fileId) {
        try {
          const { getScripts } = await import('../lib/scriptStorage');
          const scriptData = await getScripts(state.fileId);

          // pageTimes 구성 (각 슬라이드의 duration을 minutes/seconds로 변환)
          const pageTimes: Record<number, { minutes: number; seconds: number }> = {};
          Object.entries(scriptData.slides).forEach(([slideNum, data]) => {
            const num = Number(slideNum);
            const totalSeconds = data.duration;
            pageTimes[num] = {
              minutes: Math.floor(totalSeconds / 60),
              seconds: totalSeconds % 60
            };
          });

          // totalTime 계산 (모든 duration 합산)
          const totalSeconds = Object.values(scriptData.slides).reduce((sum, slide) => sum + slide.duration, 0);
          const totalTime = {
            minutes: Math.floor(totalSeconds / 60),
            seconds: totalSeconds % 60
          };

          // goalTime 구성
          const goalTime = {
            minutes: Math.floor(scriptData.goalTime / 60),
            seconds: scriptData.goalTime % 60
          };

          // slides 업데이트 (content를 script에서 가져온 것으로 업데이트)
          const updatedSlides = state.slides.map((slide: any) => ({
            ...slide,
            content: scriptData.slides[slide.slideNumber]?.content || slide.content
          }));

          setPracticeResult({
            totalTime,
            pageTimes,
            slides: updatedSlides,
            pdfFile: state.pdfFile,
            goalTime
          } as any);
        } catch (error) {
          console.error('Script 로드 실패, state 데이터 사용:', error);
          setPracticeResult(state);
        }
      } else {
        setPracticeResult(state);
      }

      setIsLoading(false);
    };

    loadResultData();
  }, [location.state]);

  // 예상 질문 생성 (별도 useEffect로 비동기 처리)
  React.useEffect(() => {
    const generateQuestions = async () => {
      const state = location.state as any;

      if (!state?.fileId || !practiceResult) {
        return;
      }

      setIsLoadingQuestions(true);
      try {
        const { getScripts } = await import('../lib/scriptStorage');
        const scriptData = await getScripts(state.fileId);

        const { generateExpectedQuestions } = await import('../lib/api');
        const result = await generateExpectedQuestions(
          state.fileId,
          scriptData.goalTime,
          scriptData.slides
        );
        setQuestions(result.questions);
      } catch (error) {
        console.error('예상 질문 생성 실패:', error);
        setQuestions([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    generateQuestions();
  }, [practiceResult, location.state]);

  if (isLoading) {
    return (
      <div style={errorContainerStyle}>
        <div style={errorTextStyle}>로딩 중...</div>
      </div>
    );
  }

  if (!practiceResult) {
    return (
      <div style={errorContainerStyle}>
        <div style={errorTextStyle}>결과 데이터를 찾을 수 없습니다.</div>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/', { replace: true })}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  // const handleGoHome = () => {
  //   navigate('/', { replace: true });
  // };

  const handleRetry = () => {
    const state = location.state as any;
    navigate('/practice', {
      state: {
        pdfFile: practiceResult.pdfFile,
        slides: practiceResult.slides,
        fileId: state?.fileId
      },
      replace: true
    });
  };

  const formatTime = (time: { minutes: number; seconds: number }) => {
    return `${time.minutes.toString().padStart(2, '0')}분 ${time.seconds.toString().padStart(2, '0')}초`;
  };

  const totalSec = practiceResult.totalTime.minutes * 60 + practiceResult.totalTime.seconds;

  const goalSeconds = (practiceResult as any).goalTime
    ? (practiceResult as any).goalTime.minutes * 60 + (practiceResult as any).goalTime.seconds
    : undefined;

  const diffSec = goalSeconds !== undefined ? totalSec - goalSeconds : undefined;
  const isUnderGoal = goalSeconds !== undefined ? totalSec < goalSeconds : false;

  const longestSlideNumber: number | undefined = (() => {
    const entries = Object.entries(practiceResult.pageTimes);
    if (entries.length === 0) return undefined;
    const sorted = entries
      .map(([num, t]) => ({ num: Number(num), sec: t.minutes * 60 + t.seconds }))
      .sort((a, b) => b.sec - a.sec);
    return sorted[0]?.num;
  })();

  const longestSlide = longestSlideNumber
    ? practiceResult.slides.find(s => s.slideNumber === longestSlideNumber)
    : undefined;
  const longestScript = longestSlide?.content ?? '';


  return (
    <div style={containerStyle}>
      <TopNavBar />
      <div style={{
        ...pageContentStyle,
        padding: isMobile ? '12px 20px' : pageContentStyle.padding,
      }}>
        {/* 제목 바 */}
        <div style={{
          ...reportTitleRowStyle,
          padding: isMobile ? '0 20px' : reportTitleRowStyle.padding,
        }}>
          <span style={reportTitleTextStyle}>발표 보고서</span>
        </div>
        {/* 메인 컨텐츠 영역 */}
        <div style={{
          ...mainBackgroundStyle,
          padding: isMobile ? '0 20px' : mainBackgroundStyle.padding,
          alignItems: isMobile ? 'stretch' : mainBackgroundStyle.alignItems,
        }}>
          {/* 회색 배경 컨테이너 */}
          <div style={{
            ...grayBackgroundContainerStyle,
            padding: isMobile ? '16px' : grayBackgroundContainerStyle.padding,
            borderRadius: isMobile ? '16px' : grayBackgroundContainerStyle.borderRadius,
            gap: isMobile ? '20px' : grayBackgroundContainerStyle.gap,
          }}>
            {/* 요약 섹션 */}
            <div style={{
              ...summarySectionStyle,
              gap: isMobile ? '20px' : summarySectionStyle.gap,
            }}>
              <div style={summaryTextGroupStyle}>
                <div style={summaryIntroStyle}>발표 요약 정보</div>
              </div>
              <div style={{
                ...summaryCardsRowStyle,
                flexDirection: isMobile ? 'column' : 'row',
              }}>
            {/* 발표 시간 */}
            <div style={{
              ...summaryCardStyle,
              width: isMobile ? '100%' : summaryCardStyle.width,
              height: isMobile ? 'auto' : summaryCardStyle.height,
              padding: isMobile ? '20px' : summaryCardStyle.padding,
            }}>
              <div style={summaryCardTitleStyle}>발표 시간</div>
              <div style={summaryCardValueGroupStyle}>
                <div style={summaryBigValueStyle}>{formatTime(practiceResult.totalTime)}</div>
                <div style={summarySubTextStyle}>발표를 진행했어요</div>
              </div>
            </div>
            {/* 목표 시간 대비 */}
            <div style={{
              ...summaryCardStyle,
              width: isMobile ? '100%' : summaryCardStyle.width,
              height: isMobile ? 'auto' : summaryCardStyle.height,
              padding: isMobile ? '20px' : summaryCardStyle.padding,
            }}>
              <div style={summaryCardTitleStyle}>목표 시간 대비</div>
              <div style={summaryCardValueRowStyle}>
                <div style={{
                  ...attentionIconBoxStyle,
                  backgroundColor: isUnderGoal ? '#22C55E' : '#ff5274',
                }}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="#FFFFFF" strokeWidth="1" />
                    <rect x="8" y="10.5" width="0.01" height="0.01" stroke="#FFFFFF" strokeWidth="1.5" />
                    <path d="M8 8V5.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div style={summaryBigValueStyle}>
                    {goalSeconds !== undefined ? (() => {
                      const diff = totalSec - goalSeconds;
                      const sign = diff >= 0 ? '+' : '-';
                      const abs = Math.abs(diff);
                      const m = Math.floor(abs / 60);
                      const s = abs % 60;
                      return `${sign}${m}분 ${s.toString().padStart(2, '0')}초`;
                    })() : '—'}
                  </div>
                  <div style={{ ...summarySubTextStyle, color: diffSec !== undefined && diffSec > 0 ? '#FF3B30' : summarySubTextStyle.color }}>
                    {diffSec === undefined
                      ? '목표 시간이 설정되지 않았어요'
                      : (totalSec < (goalSeconds as number))
                        ? '시간 조절이 휼륭했어요'
                        : diffSec > 0
                          ? '더 초과됐어요'
                          : '목표 시간 안에 끝냈어요'}
                  </div>
                </div>
              </div>
            </div>
            {/* 가장 오래 발표한 슬라이드 - 카드 클릭 시 대본 보기 (뒤집기) */}
            <div
              style={{
                ...summaryCardStyle,
                width: isMobile ? '100%' : '618px',
                cursor: longestSlideNumber ? 'pointer' : 'default',
                height: isMobile ? 'auto' : (isScriptCardFlipped ? 'auto' : '180px'),
              }}
              onClick={() => {
                if (longestSlideNumber) setIsScriptCardFlipped(prev => !prev);
              }}
              title={longestSlideNumber ? '카드를 클릭하면 대본을 확인/닫을 수 있어요' : undefined}
              aria-label="가장 오래 발표한 슬라이드 카드"
            >
              <div style={summaryCardTitleStyle}>이 슬라이드에 시간을 가장 많이 썼어요!</div>
              {longestSlideNumber ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {!isScriptCardFlipped && (
                    <>
                      <div style={summaryBigValueStyle}>슬라이드 {longestSlideNumber}</div>
                      <div style={summarySubTextStyle}>카드를 클릭하면 대본을 확인할 수 있어요</div>
                    </>
                  )}
                  {isScriptCardFlipped && (
                    <div style={scriptBoxStyle}>
                      <pre style={scriptTextStyle}>{longestScript || '대본이 없습니다.'}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <div style={emptyTextStyle}>데이터 없음</div>
              )}
            </div>
            </div>
            </div>
            {/* 인사이트 (시간 추이 + 질문 TOP5) */}
            <div style={{
              ...insightRowStyle,
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'stretch',
            }}>
              <div style={insightLeftStyle}>
                <div style={insightTextGroupStyle}>
                  <div style={insightIntroStyle}>슬라이드마다 시간을 어떻게 썼는지 한눈에 보여드릴게요</div>
                  <div style={insightTitleStyle}>슬라이드별 발표 시간 추이</div>
                </div>
                <div ref={trendContainerRef} style={{ width: '100%' }}>
                  {(() => {
                    const slideCount = practiceResult.slides.length;
                    const gapPx = 12; // trendBarRowStyle gap과 동일
                    const horizontalPadding = 24; // padding: 0 12px
                    const effectiveWidth = Math.max(0, trendContainerWidth - horizontalPadding);
                    const barWidth = 40; // 고정 폭
                    const totalBarsWidth = slideCount * barWidth + Math.max(0, slideCount - 1) * gapPx;
                    const needScroll = totalBarsWidth > effectiveWidth;
                    return (
                  <div style={{ width: '100%', overflowX: needScroll ? 'auto' : 'visible' }}>
                    <div style={{
                      ...trendBarRowStyle,
                      justifyContent: needScroll ? 'flex-start' : (isMobile ? 'flex-start' : 'center'),
                      width: needScroll ? `${totalBarsWidth}px` : '100%',
                    }}>
                  {practiceResult.slides.map((slide, idx) => {
                    const t = practiceResult.pageTimes[slide.slideNumber] || { minutes: 0, seconds: 0 };
                    const sec = t.minutes * 60 + t.seconds;
                    const maxSec = Math.max(1, ...Object.values(practiceResult.pageTimes).map(v => v.minutes * 60 + v.seconds));
                    const h = Math.max(24, Math.round((sec / maxSec) * 200));
                    const ratio = sec / maxSec;
                    const color = ratio > 0.75 ? '#3282FF' : ratio > 0.5 ? '#84B4FF' : '#CCDFFF';
                    const barWidthLocal = barWidth;
                    const trendRowH = 229; // trendBarRowStyle height(px)
                    const tooltipH = 33; // tooltip height(px)
                    const tooltipOffset = 10;
                    const placeInside = h + tooltipOffset + tooltipH > trendRowH;
                    const tooltipBottom = placeInside ? Math.max(0, h - tooltipH - 6) : h + tooltipOffset;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px', minWidth: `${barWidthLocal}px`, flexShrink: 0 }}>
                        <div
                          style={{ position: 'relative', width: `${barWidthLocal}px`, height: `${h}px` }}
                          onMouseEnter={() => setHoveredBarIndex(idx)}
                          onMouseLeave={() => setHoveredBarIndex(null)}
                        >
                          <div style={{
                            position: 'absolute',
                            left: 0,
                            bottom: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: '12px',
                            backgroundColor: color,
                          }} />
                          {hoveredBarIndex === idx && (
                            <div style={{
                              position: 'absolute',
                              left: '50%',
                              bottom: `${tooltipBottom}px`,
                              transform: 'translateX(-50%)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'flex-start',
                              padding: '8px 12px',
                              gap: '4px',
                              width: '71px',
                              height: '33px',
                              background: '#FFFFFF',
                              boxShadow: '1px 1px 2px rgba(0, 0, 0, 0.15)',
                              borderRadius: '16px',
                              zIndex: 1
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '3px',
                                  background: colors.primary.normal,
                                  display: 'inline-block'
                                }} />
                                <span style={{
                                  fontFamily: 'Pretendard, sans-serif',
                                  fontSize: '13px',
                                  fontWeight: 500,
                                  color: colors.label.neutral
                                }}>{formatSecToMMSS(sec)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 400,
                          lineHeight: '16px',
                          color: colors.label.normal,
                          textAlign: 'center',
                          width: `${barWidthLocal}px`
                        }}>{slide.slideNumber}</div>
                      </div>
                    );
                  })}
                    </div>
                    </div>
                    );})()}
                </div>
              </div>
              <div style={insightRightStyle}>
                <div style={insightRightHeaderStyle}>
                  <div style={insightIntroStyle}>이런 질문이 나올 수 있어요!</div>
                  <div style={insightTitleStyle}>예상 질문 TOP5</div>
                </div>
                <div style={{
                  ...questionCardStyle,
                  height: isMobile ? 'auto' : questionCardStyle.height,
                }}>
                  {isLoadingQuestions ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
                      <Spinner size={32} />
                      <div style={{ fontSize: '14px', color: colors.label.neutral }}>예상 질문을 생성하는 중...</div>
                    </div>
                  ) : questions.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <div style={{ fontSize: '14px', color: colors.label.neutral }}>예상 질문을 생성할 수 없습니다</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: isMobile ? '16px' : '23px 32px', gap: '16px', width: '100%', height: isMobile ? 'auto' : '100%', overflowY: isMobile ? 'visible' : 'auto' }}>
                      {questions.slice(0, 5).map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
                          <div style={numberBadgeStyle}>{i + 1}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                            <span style={{ fontSize: '16px', lineHeight: '16px', color: colors.label.normal, fontWeight: 500 }}>{item.question}</span>
                            <span style={{ fontSize: '12px', color: colors.label.neutral, fontWeight: 400 }}>#{item.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* 다시 연습하기 버튼 */}
          <div style={{
            ...buttonRowStyle,
            justifyContent: isMobile ? 'center' : buttonRowStyle.justifyContent,
            padding: isMobile ? '0 20px' : buttonRowStyle.padding,
          }}>
            <Button
              variant="primary"
              size={isMobile ? 'small' : 'medium'}
              onClick={handleRetry}
              style={retryButtonStyle}
            >
              다시 연습하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  width: '100vw',
  height: '100vh',
  backgroundColor: colors.static.white,
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Pretendard, sans-serif',
  margin: 0,
  padding: 0,
  overflow: 'hidden',
};

const pageContentStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '24px 0',
  gap: '16px',
  height: 'calc(100vh - 60px)',
  overflowY: 'auto',
};

// 제목 바 스타일
const reportTitleRowStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '1440px',
  padding: '0 70px',
  display: 'flex',
  alignItems: 'center',
};

const reportTitleTextStyle: React.CSSProperties = {
  fontFamily: 'Pretendard, sans-serif',
  fontSize: '20px',
  fontWeight: 600,
  lineHeight: '24px',
  color: '#171719',
};

const mainBackgroundStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '1440px',
  padding: '0 70px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '36px',
};

const grayBackgroundContainerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '1300px',
  margin: '0 auto',
  padding: '24px',
  paddingBottom: '28px',
  backgroundColor: '#F7F7F8',
  borderRadius: '28px',
  display: 'flex',
  flexDirection: 'column',
  gap: '36px',
};

const summarySectionStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '36px',
};

const summaryTextGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '0 16px',
};

const summaryIntroStyle: React.CSSProperties = {
  fontFamily: 'Pretendard, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '17px',
  color: '#7D7E83',
};

// removed headline usage

const summaryCardsRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
};

const summaryCardStyle: React.CSSProperties = {
  backgroundColor: colors.static.white,
  borderRadius: '16px',
  width: '301px',
  height: '180px',
  padding: '30px 32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '28px',
};

const summaryCardTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '17px',
  color: colors.label.normal,
};

const summaryCardValueGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const summaryCardValueRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
};

const attentionIconBoxStyle: React.CSSProperties = {
  width: '18px',
  height: '18px',
  borderRadius: '8px',
  backgroundColor: '#ff5274',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const summaryBigValueStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 600,
  lineHeight: '21px',
  letterSpacing: '-0.02em',
  color: colors.label.normal,
};

const summarySubTextStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '17px',
  color: '#78787B',
};

// (사용 안 함)

// const flipBackHeaderStyle: React.CSSProperties = {
//   fontSize: '14px',
//   color: colors.label.normal,
//   fontWeight: 500,
// };

const scriptBoxStyle: React.CSSProperties = {
  backgroundColor: colors.fill?.normal || '#F4F6F8',
  borderRadius: '12px',
  padding: '16px 18px',
  height: '107px',
  width: '100%',
  overflowY: 'auto',
  boxSizing: 'border-box',
};

const scriptTextStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: 'Pretendard, sans-serif',
  fontSize: '13px',
  color: colors.label.normal,
  whiteSpace: 'pre-wrap',
  lineHeight: 1.5,
};

// const flipHintStyle: React.CSSProperties = {
//   fontSize: '12px',
//   color: colors.label.neutral,
// };

const insightRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  alignItems: 'stretch',
  justifyContent: 'center',
  width: '100%',
};

const insightLeftStyle: React.CSSProperties = {
  width: '100%',
  flex: '1 1 0',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const insightTextGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '0 16px',
};

const insightIntroStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '17px',
  color: '#7D7E83',
};

const insightTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 600,
  lineHeight: '21px',
  color: '#171719',
};

const trendBarRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-end',
  padding: '0 12px',
  height: '229px',
  width: '100%',
  justifyContent: 'center',
};

const insightRightStyle: React.CSSProperties = {
  width: '100%',
  flex: '1 1 0',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const insightRightHeaderStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '0 12px',
};

const questionCardStyle: React.CSSProperties = {
  backgroundColor: colors.static.white,
  borderRadius: '16px',
  height: '219px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const numberBadgeStyle: React.CSSProperties = {
  width: '18px',
  height: '18px',
  borderRadius: '9px',
  backgroundColor: colors.primary.normal,
  color: colors.static.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: 700,
  alignSelf: 'flex-start',
};


const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  padding: '0',
  gap: '10px',
  width: '100%',
  maxWidth: '1300px',
  margin: '0 auto',
};

const retryButtonStyle: React.CSSProperties = {
  width: '120px',
  height: '36px',
  padding: '10px 20px',
  gap: '3px',
  color: '#FFFFFF',
  fontFamily: 'Pretendard',
  fontSize: '13px',
  fontWeight: 500,
  lineHeight: '16px',
  whiteSpace: 'nowrap',
};

const errorContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: colors.background.normal,
  gap: '20px',
};

const errorTextStyle: React.CSSProperties = {
  fontSize: '16px',
  color: colors.label.neutral,
  fontFamily: 'Pretendard, sans-serif',
};

// Insights section styles
// const insightSectionStyle: React.CSSProperties = {
//   padding: '0 50px 40px 50px',
// };

// const insightGridStyle: React.CSSProperties = {
//   display: 'grid',
//   gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
//   gap: '16px',
// };

// const cardStyle: React.CSSProperties = {
//   backgroundColor: colors.background.normal,
//   border: `1px solid ${colors.fill.neutral}`,
//   borderRadius: '12px',
//   padding: '16px',
//   display: 'flex',
//   flexDirection: 'column',
//   gap: '10px',
// };

// const cardTitleStyle: React.CSSProperties = {
//   fontSize: '14px',
//   color: colors.label.normal,
//   fontWeight: 600,
// };

// const metricRowStyle: React.CSSProperties = {
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'space-between',
//   fontSize: '13px',
//   color: colors.label.normal,
// };

// const metricLabelStyle: React.CSSProperties = {
//   color: colors.label.neutral,
// };

// const metricValueStyle: React.CSSProperties = {
//   fontWeight: 600,
// };

const emptyTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: colors.label.neutral,
};

// const chipRowStyle: React.CSSProperties = {
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'space-between',
// };

// const chipStyle: React.CSSProperties = {
//   fontSize: '12px',
//   color: colors.label.normal,
//   backgroundColor: colors.fill.normal,
//   borderRadius: '8px',
//   padding: '4px 8px',
// };

// const chipValueStyle: React.CSSProperties = {
//   fontSize: '12px',
//   color: colors.label.normal,
// };

// const trendContainerStyle: React.CSSProperties = {
//   display: 'flex',
//   alignItems: 'flex-end',
//   gap: '10px',
//   paddingTop: '6px',
// };

// const badgeStyle: React.CSSProperties = {
//   width: '18px',
//   height: '18px',
//   borderRadius: '9px',
//   backgroundColor: colors.primary.normal,
//   color: colors.static.white,
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   fontSize: '11px',
//   fontWeight: 700,
// };
