import React from 'react';
import { ResultReportOverlay } from './ResultReportOverlay';
import { ResultReportContainer } from './ResultReportContainer';
import { ResultReportContent } from './ResultReportContent';
import { ResultReportHeader } from './ResultReportHeader';
import { ResultReportFooter } from './ResultReportFooter';
import { SlideInput } from '../ScriptModal/ScriptModalForm';

export interface PracticeResult {
  /** 총 소요 시간 */
  totalTime: { minutes: number; seconds: number };
  /** 페이지별 소요 시간 */
  pageTimes: Record<number, { minutes: number; seconds: number }>;
  /** 슬라이드 데이터 */
  slides: SlideInput[];
  /** PDF 파일 */
  pdfFile: File;
}

export interface ResultReportProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 연습 결과 데이터 */
  practiceResult: PracticeResult;
  /** 처음으로 버튼 클릭 시 호출되는 콜백 */
  onGoHome?: () => void;
  /** 다시 연습하기 버튼 클릭 시 호출되는 콜백 */
  onRetry?: () => void;
}

export const ResultReport: React.FC<ResultReportProps> = ({
  isOpen,
  onClose,
  practiceResult,
  onGoHome,
  onRetry,
}) => {
  const formatTime = (time: { minutes: number; seconds: number }) => {
    return `${time.minutes.toString().padStart(2, '0')}분 ${time.seconds.toString().padStart(2, '0')}초`;
  };

  return (
    <ResultReportOverlay isOpen={isOpen} onClose={onClose}>
      <ResultReportContainer>
        <ResultReportHeader
          totalTime={formatTime(practiceResult.totalTime)}
        />
        <ResultReportContent
          pdfFile={practiceResult.pdfFile}
          slides={practiceResult.slides}
          pageTimes={practiceResult.pageTimes}
          totalTime={practiceResult.totalTime}
        />
        <ResultReportFooter
          onGoHome={onGoHome}
          onRetry={onRetry}
        />
      </ResultReportContainer>
    </ResultReportOverlay>
  );
};