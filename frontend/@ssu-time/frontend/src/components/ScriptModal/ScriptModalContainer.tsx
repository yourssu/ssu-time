import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ScriptModalContainerProps {
  children: React.ReactNode;
}

export const ScriptModalContainer: React.FC<ScriptModalContainerProps> = ({
  children
}) => {
  const isMobile = useIsMobile(480);
  const localStyle: React.CSSProperties = {
    ...containerStyle,
    maxWidth: isMobile ? '96vw' : '95vw',
    width: isMobile ? '96vw' : containerStyle.width,
    maxHeight: isMobile ? '100vh' : containerStyle.maxHeight,
    height: isMobile ? '100vh' : undefined,
  };
  return (
    <div style={localStyle}>
      {children}
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '32px',
  width: '1050px',
  maxWidth: '90vw',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
}; 