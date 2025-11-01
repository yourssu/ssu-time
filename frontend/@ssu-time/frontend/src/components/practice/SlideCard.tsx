import React from 'react';
import { colors } from '../../theme/colors';
import { SimplePdfViewer } from '../ui/SimplePdfViewer';

interface SlideCardProps {
  slideNumber: number;
  isActive: boolean;
  onClick: () => void;
  pdfFile?: File | null;
}

export const SlideCard: React.FC<SlideCardProps> = ({
  slideNumber,
  isActive,
  onClick,
  pdfFile,
}) => {
  return (
    <div 
      style={{
        ...slideCardStyle,
        backgroundColor: isActive ? colors.fill.normal : colors.background.normal,
        color: isActive ? colors.label.normal : colors.label.alternative,
        // 요청에 따라 우측 스트로크 제거
        borderRight: undefined,
      }}
      onClick={onClick}
    >
      <div style={slideNumberWrapperStyle}>
        <div style={slideNumberInnerStyle}>
          <p style={slideNumberTextStyle}>
            {slideNumber}
          </p>
        </div>
      </div>
      <div style={slidePreviewStyle}>
        {pdfFile ? (
          <SimplePdfViewer
            file={pdfFile}
            currentPage={slideNumber}
          />
        ) : (
          <div style={placeholderStyle}>
            <div style={placeholderIconStyle}>📄</div>
          </div>
        )}
      </div>
    </div>
  );
};

const slideCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  padding: '12px 20px',
  gap: '10px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  boxSizing: 'border-box',
};

const slideNumberWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '9px',
  flexShrink: 0,
};

const slideNumberInnerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  flexShrink: 0,
};

const slideNumberTextStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 400,
  fontFamily: 'Pretendard, sans-serif',
  lineHeight: 'normal',
  margin: 0,
  width: '100%',
  flexShrink: 0,
};

const slidePreviewStyle: React.CSSProperties = {
  flex: 1,
  height: '135px',
  backgroundColor: colors.fill.normal,
  borderRadius: '12px',
  border: `1px solid ${colors.line.normal}`,
  overflow: 'hidden',
  position: 'relative',
};

const placeholderStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.fill.normal,
};

const placeholderIconStyle: React.CSSProperties = {
  fontSize: '32px',
  opacity: 0.5,
};