import React, { useState } from 'react';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export interface ResultReportSlideCardProps {
  slideNumber: number;
  content: string;
  timeText: string;
  percentageText: string;
  percentage: number;
  isLongestSlide?: boolean;
  onSlideClick?: () => void;
}

export const ResultReportSlideCard: React.FC<ResultReportSlideCardProps> = ({
  slideNumber,
  content,
  timeText,
  percentageText,
  percentage,
  isLongestSlide = false,
  onSlideClick,
}) => {
  const [showScript, setShowScript] = useState(false);

  const handleCardClick = () => {
    setShowScript(!showScript);
    onSlideClick?.();
  };

  return (
    <div style={cardContainerStyle}>
      <div style={slideHeaderStyle}>
        <span style={slideNumberStyle}>슬라이드{slideNumber}</span>
        {isLongestSlide && (
          <div style={longestSlideTagStyle}>
            <span style={longestSlideTagTextStyle}>여기서 제일 오래 머물렀어요!</span>
          </div>
        )}
      </div>
      
      <div style={flipContainerStyle} onClick={handleCardClick}>
        <div style={{
          ...flipCardStyle,
          transform: showScript ? 'rotateX(180deg)' : 'rotateX(0deg)'
        }}>
          {/* 앞면 - 시간 정보 */}
          <div style={{
            ...flipCardFaceStyle,
            ...flipCardFrontStyle
          }}>
            <div style={timeContentStyle}>
              <div style={timeMainStyle}>
                {timeText}
              </div>
              <div style={timeSubStyle}>
                {percentageText}
              </div>
              <div style={progressBarContainerStyle}>
                <div 
                  style={{
                    ...progressBarFillStyle,
                    width: `${percentage}%`
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* 뒷면 - 대본 */}
          <div style={{
            ...flipCardFaceStyle,
            ...flipCardBackStyle
          }}>
            <div style={scriptContentStyle}>
              {content || ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const cardContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  width: '100%',
};

const slideHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '12px',
  gap: '17px',
};

const slideNumberStyle: React.CSSProperties = {
  ...typography.title[3],
  color: colors.label.normal,
  fontWeight: 500,
  fontSize: '18px',
};

const flipContainerStyle: React.CSSProperties = {
  perspective: '1000px',
  width: '100%',
  height: '120px',
  cursor: 'pointer',
};

const flipCardStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  transition: 'transform 0.5s',
  transformStyle: 'preserve-3d',
};

const flipCardFaceStyle: React.CSSProperties = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
};

const flipCardFrontStyle: React.CSSProperties = {
  backgroundColor: colors.fill.neutral,
};

const flipCardBackStyle: React.CSSProperties = {
  backgroundColor: colors.fill.neutral,
  transform: 'rotateX(180deg)',
  alignItems: 'flex-start',
  padding: '20px 27px',
};

const timeContentStyle: React.CSSProperties = {
  padding: '20px 27px',
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  width: '100%',
};

const timeMainStyle: React.CSSProperties = {
  ...typography.body.normal,
  color: colors.label.normal,
  fontWeight: 700,
  fontSize: '16px',
};

const timeSubStyle: React.CSSProperties = {
  ...typography.label,
  color: colors.label.normal,
  fontWeight: 400,
  fontSize: '13px',
};

const scriptContentStyle: React.CSSProperties = {
  ...typography.body.reading,
  color: colors.label.normal,
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: '1.4',
  width: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'pre-wrap',
};

const progressBarContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '6px',
  backgroundColor: '#e0e0e0',
  borderRadius: '3px',
  marginTop: '8px',
  overflow: 'hidden',
};

const progressBarFillStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: colors.primary.normal,
  borderRadius: '3px',
  transition: 'width 0.3s ease',
};

const longestSlideTagStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 15px',
  backgroundColor: '#d5e1f6',
  borderRadius: '60px',
  flexShrink: 0,
};

const longestSlideTagTextStyle: React.CSSProperties = {
  color: '#0a64ff',
  fontSize: '16px',
  fontWeight: 500,
  fontFamily: 'Pretendard, sans-serif',
  lineHeight: 'normal',
  whiteSpace: 'nowrap',
};