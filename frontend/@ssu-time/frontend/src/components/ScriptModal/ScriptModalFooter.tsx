import React from 'react';
import { Button } from '../ui/Button';

interface ScriptModalFooterProps {
  onClose: () => void;
  onSave: () => void;
  onExport?: () => void;
}

export const ScriptModalFooter: React.FC<ScriptModalFooterProps> = ({
  onClose,
  onExport
}) => {
  return (
    <div style={footerStyle}>
      <div style={buttonContainerStyle}>
        <Button variant="primary" size="medium" onClick={onExport} style={{ fontSize: '13px' }}>
          문서로 출력하기
        </Button>
        <Button variant="secondary" size="medium" onClick={onClose} style={{ fontSize: '13px' }}>
          닫기
        </Button>
      </div>
    </div>
  );
};

const footerStyle: React.CSSProperties = {
  borderTop: '1px solid #eeeeee',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  width: '100%',
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '20px 52px',
  gap: '10px',
};

 