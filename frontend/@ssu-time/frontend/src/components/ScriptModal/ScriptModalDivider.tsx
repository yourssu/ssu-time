import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

export const ScriptModalDivider: React.FC = () => {
  const isMobile = useIsMobile(480);
  if (isMobile) return null;
  return <div style={dividerStyle} />;
};

const dividerStyle: React.CSSProperties = {
  width: '1px',
  height: '598px',
  backgroundColor: '#eeeeee',
  margin: '0 5px',
}; 