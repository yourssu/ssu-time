import React, { useEffect, useState } from 'react';
import { Spinner } from '../ui/Spinner';
import { colors } from '../../theme/colors';
import { Check, AlertTriangle } from 'lucide-react';

export type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  onIdle: () => void;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status, onIdle }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let timer: number;
    if (status === 'saving') {
      setVisible(true);
    } else if (status === 'success' || status === 'error') {
      setVisible(true);
      timer = setTimeout(() => {
        setVisible(false);
        onIdle();
      }, 10000); // 10초 후 사라짐
    } else {
      setVisible(false);
    }

    return () => clearTimeout(timer);
  }, [status, onIdle]);

  useEffect(() => {
    switch (status) {
      case 'saving':
        setMessage('자동 저장 중...');
        break;
      case 'success':
        setMessage('저장 완료');
        break;
      case 'error':
        setMessage('자동 저장 실패');
        break;
      default:
        setMessage('');
        break;
    }
  }, [status]);

  if (!visible) {
    return null;
  }

  const renderIcon = () => {
    switch (status) {
      case 'saving':
        return <Spinner size={12} strokeWidth={2} color={colors.label.neutral} />;
      case 'success':
        return <Check size={14} color={colors.semantic.success} />;
      case 'error':
        return <AlertTriangle size={14} color={colors.semantic.error} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      color: status === 'error' ? colors.semantic.error : colors.label.neutral,
      fontFamily: 'Pretendard, sans-serif',
      transition: 'opacity 0.3s ease',
      opacity: visible ? 1 : 0,
    }}>
      {renderIcon()}
      <span>{message}</span>
    </div>
  );
};
