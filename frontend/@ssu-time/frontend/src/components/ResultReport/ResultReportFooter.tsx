import React from 'react';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from '../ui/Button';
import { File } from 'lucide-react';

export interface ResultReportFooterProps {
  onGoHome?: () => void;
  onRetry?: () => void;
}

export const ResultReportFooter: React.FC<ResultReportFooterProps> = ({
  onGoHome,
  onRetry,
}) => {
  return (
    <div style={footerStyle}>
      <div style={footerContentStyle}>
        <button style={homeButtonStyle} onClick={onGoHome}>
          <File size={16} color="#525c6b" />
          <span style={homeButtonTextStyle}>처음으로</span>
        </button>
        <Button
          variant="primary"
          size="medium"
          onClick={onRetry}
          style={retryButtonStyle}
        >
          다시 연습
        </Button>
      </div>
    </div>
  );
};

const footerStyle: React.CSSProperties = {
  borderTop: `1px solid ${colors.line?.normal || '#E7E7E8'}`,
  padding: '0 60px',
  height: '95px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
};

const footerContentStyle: React.CSSProperties = {
  display: 'flex',
  gap: '24px',
  alignItems: 'center',
};

const homeButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '3px',
  padding: '7px 0',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  ...typography.body.reading,
};

const homeButtonTextStyle: React.CSSProperties = {
  color: '#525c6b',
  fontSize: '14px',
  fontWeight: 500,
};

const retryButtonStyle: React.CSSProperties = {
  width: '110px',
};