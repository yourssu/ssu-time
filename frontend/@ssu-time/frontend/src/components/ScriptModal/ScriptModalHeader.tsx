import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Typography } from '../ui/Typography';

interface ScriptModalHeaderProps {
  title: string;
  description: string;
}

export const ScriptModalHeader: React.FC<ScriptModalHeaderProps> = ({
  title,
  description
}) => {
  const isMobile = useIsMobile(480);
  const localHeaderStyle: React.CSSProperties = {
    ...headerStyle,
    gap: isMobile ? '8px' : headerStyle.gap as string,
  };
  return (
    <div style={localHeaderStyle}>
      <Typography
        variant="title2"
        component="h2"
        style={{
          ...titleStyle,
          fontSize: isMobile ? '16px' : titleStyle.fontSize,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
          flexShrink: 1,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="label"
        color="alternative"
        style={{
          ...descriptionStyle,
          fontSize: isMobile ? '11px' : descriptionStyle.fontSize,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
          flexShrink: 1,
        }}
      >
        {description}
      </Typography>
    </div>
  );
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'end',
  justifyContent: 'flex-start',
  width: '100%',
  gap: '15px',
  padding: '8px 10px 0 10px',
  position: 'sticky',
  top: 0,
  backgroundColor: '#ffffff',
  zIndex: 1,
};

const titleStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: '20px',
  color: '#171719',
};

const descriptionStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#78787b',
  alignSelf: 'flex-end',
}; 