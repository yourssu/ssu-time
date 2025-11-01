import React from 'react';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export interface ResultReportHeaderProps {
  totalTime: string;
}

export const ResultReportHeader: React.FC<ResultReportHeaderProps> = ({
  totalTime,
}) => {
  return (
    <div style={headerStyle}>
      <div style={headerContentStyle}>
        <div style={titleSectionStyle}>
          <span style={titleStyle}>총 소요시간</span>
        </div>
        <div style={timeSectionStyle}>
          <span style={timeStyle}>{totalTime}</span>
        </div>
      </div>
    </div>
  );
};

const headerStyle: React.CSSProperties = {
  width: '100%',
  padding: '35px 50px 20px 50px',
  borderBottom: `1px solid ${colors.line?.normal || '#E7E7E8'}`,
};

const headerContentStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  padding: '20px 0',
};

const titleSectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '15px',
};

const titleStyle: React.CSSProperties = {
  ...typography.title[2],
  color: colors.label.normal,
  fontWeight: 600,
  fontSize: '20px',
};

const timeSectionStyle: React.CSSProperties = {
  flex: 1,
  textAlign: 'left',
  paddingLeft: '15px',
};

const timeStyle: React.CSSProperties = {
  ...typography.title[2],
  color: colors.label.normal,
  fontWeight: 600,
  fontSize: '20px',
};