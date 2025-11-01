import React from 'react';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface ErrorMessageProps {
  /** 에러 제목 */
  title: string;
  /** 에러 메시지 */
  message: string;
  /** 닫기 콜백 */
  onClose?: () => void;
  /** 에러 타입 */
  type?: 'error' | 'warning' | 'info';
}

export function ErrorMessage({ 
  title, 
  message, 
  onClose, 
  type = 'error' 
}: ErrorMessageProps) {
  const getTypeColor = () => {
    switch (type) {
      case 'error':
        return colors.semantic.error;
      case 'warning':
        return colors.semantic.warning;
      case 'info':
        return colors.semantic.info;
      default:
        return colors.semantic.error;
    }
  };

  return (
    <div style={containerStyle}>
      <div style={iconContainerStyle}>
        <div 
          style={{
            ...iconStyle,
            backgroundColor: getTypeColor(),
          }}
        >
          !
        </div>
      </div>
      
      <div style={contentStyle}>
        <div style={titleStyle}>{title}</div>
        <div style={messageStyle}>{message}</div>
      </div>
      
      {onClose && (
        <button 
          style={closeButtonStyle}
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '16px',
  backgroundColor: colors.background.normal,
  border: `1px solid ${colors.line.normal}`,
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  maxWidth: '400px',
  width: '100%',
};

const iconContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const iconStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  color: colors.static.white,
  fontSize: '12px',
  fontWeight: 'bold',
};

const contentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
};

const titleStyle: React.CSSProperties = {
  ...typography.body.reading,
  color: colors.label.normal,
  fontWeight: 600,
};

const messageStyle: React.CSSProperties = {
  ...typography.label,
  color: colors.label.alternative,
  lineHeight: '16px',
};

const closeButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  color: colors.label.assistive,
  transition: 'color 0.2s ease',
  flexShrink: 0,
  outline: 'none',
}; 