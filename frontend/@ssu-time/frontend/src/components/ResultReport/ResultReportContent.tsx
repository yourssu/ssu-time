import React from 'react';
import { colors } from '../../theme/colors';
import { SimplePdfViewer } from '../ui/SimplePdfViewer';
import { ResultReportSlideCard } from './ResultReportSlideCard';
import { SlideInput } from '../ScriptModal/ScriptModalForm';

export interface ResultReportContentProps {
  pdfFile: File;
  slides: SlideInput[];
  pageTimes: Record<number, { minutes: number; seconds: number }>;
  totalTime: { minutes: number; seconds: number };
}

export const ResultReportContent: React.FC<ResultReportContentProps> = ({
  pdfFile,
  slides,
  pageTimes,
  totalTime,
}) => {
  const calculatePercentage = (pageTime: { minutes: number; seconds: number }) => {
    const totalSeconds = totalTime.minutes * 60 + totalTime.seconds;
    const pageSeconds = pageTime.minutes * 60 + pageTime.seconds;
    
    if (totalSeconds === 0) return 0;
    return Math.round((pageSeconds / totalSeconds) * 100);
  };

  const formatTime = (time: { minutes: number; seconds: number }) => {
    return `${time.minutes.toString().padStart(2, '0')}분 ${time.seconds.toString().padStart(2, '0')}초`;
  };

  return (
    <div style={contentStyle}>
      <div style={mainContentStyle}>
        <div style={pdfViewerStyle}>
          <SimplePdfViewer 
            file={pdfFile} 
            currentPage={1}
          />
        </div>
        <div style={slideListStyle}>
          <div style={slideListInnerStyle}>
            <div style={slideCardsContainerStyle}>
              {slides.map((slide) => {
                const pageTime = pageTimes[slide.slideNumber] || { minutes: 0, seconds: 0 };
                const percentage = calculatePercentage(pageTime);
                
                return (
                  <ResultReportSlideCard
                    key={slide.slideNumber}
                    slideNumber={slide.slideNumber}
                    content={slide.content}
                    timeText={`${formatTime(pageTime)} 소요`}
                    percentageText={`전체 소요 시간의 ${percentage}%`}
                    percentage={percentage}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  padding: '0 20px',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
};

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  gap: '18px',
  padding: '0',
  minHeight: 0,
};

const pdfViewerStyle: React.CSSProperties = {
  width: '500px',
  flexShrink: 0,
  backgroundColor: colors.fill.normal,
  borderRadius: '12px',
  padding: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: '500px',
};

const slideListStyle: React.CSSProperties = {
  flex: 1,
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  minWidth: 0,
};

const slideListInnerStyle: React.CSSProperties = {
  display: 'flex',
  height: '100%',
  position: 'relative',
};

const slideCardsContainerStyle: React.CSSProperties = {
  flex: 1,
  padding: '27px 10px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  paddingRight: '13px',
};

