import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ScriptModalContentProps {
  children: React.ReactNode;
}

export const ScriptModalContent: React.FC<ScriptModalContentProps> = ({
  children
}) => {
  const isMobile = useIsMobile(480);
  const localWrapperStyle: React.CSSProperties = {
    ...contentWrapperStyle,
    flexDirection: isMobile ? 'column' : contentWrapperStyle.flexDirection,
    gap: isMobile ? '12px' : contentWrapperStyle.gap,
    padding: isMobile ? '10px' : contentWrapperStyle.padding,
    paddingBottom: isMobile ? '80px' : contentWrapperStyle.padding,
    alignItems: isMobile ? 'stretch' : contentWrapperStyle.alignItems,
    justifyContent: isMobile ? 'flex-start' : contentWrapperStyle.justifyContent,
  };
  return (
    <div style={contentStyle}>
      <div style={localWrapperStyle}>
        {children}
      </div>
    </div>
  );
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  overflowY: 'auto',
};

const contentWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  width: '100%',
  height: '100%',
  gap: '20px',
}; 