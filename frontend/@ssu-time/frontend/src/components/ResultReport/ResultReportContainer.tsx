import React from 'react';
import { colors } from '../../theme/colors';

export interface ResultReportContainerProps {
  children: React.ReactNode;
}

export const ResultReportContainer: React.FC<ResultReportContainerProps> = ({
  children,
}) => {
  return (
    <div style={containerStyle}>
      {children}
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  backgroundColor: colors.static.white,
  borderRadius: '0px',
  width: '1440px',
  height: '900px',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Pretendard, sans-serif',
  position: 'relative',
  overflow: 'hidden',
};