import React from 'react';
import { colors } from '../../theme/colors';
import { Button } from '../ui/Button';

interface ExitModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={contentStyle}>
          <div style={headerStyle}>
            <div style={iconStyle}>
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M8.33334 25C8.33334 15.7953 15.7953 8.33334 25 8.33334C34.2047 8.33334 41.6667 15.7953 41.6667 25C41.6667 34.2047 34.2047 41.6667 25 41.6667C15.7953 41.6667 8.33334 34.2047 8.33334 25ZM27.0833 16.6667C27.0833 15.516 26.1506 14.5833 25 14.5833C23.8494 14.5833 22.9167 15.516 22.9167 16.6667V25C22.9167 25.5525 23.1362 26.0824 23.5269 26.4731L27.6935 30.6398C28.5071 31.4534 29.8262 31.4534 30.6398 30.6398C31.4534 29.8262 31.4534 28.5071 30.6398 27.6935L27.0833 24.1371V16.6667Z"
                  fill="#EEEEEE"
                  fillRule="evenodd"
                />
                <path
                  d="M10.8333 12.5C9.91293 13.1904 8.60709 13.0038 7.91673 12.0834C7.22638 11.1629 7.41292 9.85709 8.33339 9.16673L12.5001 6.04173C13.4205 5.35138 14.7264 5.53792 15.4167 6.45839C16.1071 7.37887 15.9206 8.6847 15.0001 9.37506L10.8333 12.5Z"
                  fill="#EEEEEE"
                />
                <path
                  d="M39.1667 6.04173C38.2462 5.35138 36.9404 5.53792 36.25 6.45839C35.5597 7.37887 35.7462 8.6847 36.6667 9.37506L40.8333 12.5C41.7538 13.1904 43.0596 13.0038 43.75 12.0834C44.4404 11.1629 44.2538 9.85709 43.3333 9.16673L39.1667 6.04173Z"
                  fill="#EEEEEE"
                />
              </svg>
            </div>
            
            <div style={textContainerStyle}>
              <h3 style={titleStyle}>발표를 종료하시겠어요?</h3>
              <p style={subtitleStyle}>지금 종료하면 결과를 확인할 수 있어요.</p>
            </div>
          </div>
          
          <div style={buttonContainerStyle}>
            <Button
              variant="secondary"
              size="small"
              onClick={onCancel}
              className="cancel-button"
            >
              계속하기
            </Button>
            <Button
              variant="primary"
              size="small"
              onClick={onConfirm}
              className="confirm-button"
            >
              종료하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: colors.static.white,
  borderRadius: '20px',
  boxShadow: '1px 1px 10px 0px rgba(0, 0, 0, 0.1)',
  width: '330px',
  margin: '20px',
};

const contentStyle: React.CSSProperties = {
  padding: '28px 53px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '9px',
  width: '100%',
};

const iconStyle: React.CSSProperties = {
  width: '50px',
  height: '50px',
  flexShrink: 0,
};

const textContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'Pretendard, sans-serif',
  fontSize: '18px',
  fontWeight: 500,
  color: colors.label.normal,
  margin: 0,
  textAlign: 'center',
  whiteSpace: 'nowrap',
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'Pretendard, sans-serif',
  fontSize: '13px',
  fontWeight: 400,
  color: colors.label.neutral,
  margin: 0,
  textAlign: 'center',
  whiteSpace: 'nowrap',
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  gap: '8px',
  alignItems: 'center',
  justifyContent: 'center',
};

