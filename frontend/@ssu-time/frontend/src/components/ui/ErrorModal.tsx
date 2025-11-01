import React from 'react';

export interface ErrorModalProps {
  /** 에러 제목 */
  title?: string;
  /** 에러 메시지 */
  message?: string;
  /** 닫기 버튼 클릭 핸들러 */
  onClose?: () => void;
  /** 컨테이너 추가 스타일 */
  style?: React.CSSProperties;
  /** 컨테이너 추가 클래스명 */
  className?: string;
  /** 알림 표시 여부 */
  isVisible?: boolean;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  title = "업로드 실패",
  message = "잠시 후 다시 시도해주세요.",
  onClose,
  style,
  className = "",
  isVisible = true,
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className={`error-notification ${className}`}
      style={{ ...notificationStyle, ...style }}
    >
      <div style={contentStyle}>
        <div style={leftContentStyle}>
          {/* 에러 아이콘 */}
          <div style={iconContainerStyle}>
            <div style={iconStyle}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z"
                  fill="white"
                />
                <path
                  d="M10 8C10.5523 8 11 8.44772 11 9V15C11 15.5523 10.5523 16 10 16C9.44772 16 9 15.5523 9 15V9C9 8.44772 9.44772 8 10 8Z"
                  fill="white"
                />
                <path
                  d="M11.5 5.5C11.5 6.32843 10.8284 7 10 7C9.17157 7 8.5 6.32843 8.5 5.5C8.5 4.67157 9.17157 4 10 4C10.8284 4 11.5 4.67157 11.5 5.5Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>

          {/* 텍스트 영역 */}
          <div style={textContainerStyle}>
            <div style={titleStyle}>
              {title}
            </div>
            <div style={messageStyle}>
              {message}
            </div>
          </div>
        </div>

        {/* 닫기 버튼 */}
        {onClose && (
          <button 
            onClick={onClose}
            style={closeButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L7 5.58579L12.2929 0.292893C12.6834 -0.0976311 13.3166 -0.0976311 13.7071 0.292893C14.0976 0.683417 14.0976 1.31658 13.7071 1.70711L8.41421 7L13.7071 12.2929C14.0976 12.6834 14.0976 13.3166 13.7071 13.7071C13.3166 14.0976 12.6834 14.0976 12.2929 13.7071L7 8.41421L1.70711 13.7071C1.31658 14.0976 0.683417 14.0976 0.292893 13.7071C-0.0976311 13.3166 -0.0976311 12.6834 0.292893 12.2929L5.58579 7L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893Z"
                fill="#7D7E83"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// 스타일 정의
const notificationStyle: React.CSSProperties = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#ffffff',
  borderRadius: '15px',
  boxShadow: '2px 3px 8px 0px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '640px',
  zIndex: 1000,
  animation: 'slideDown 0.3s ease-out',
};

const contentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '18px 34px',
  minHeight: '77px',
};

const leftContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '20px',
  flex: 1,
};

const iconContainerStyle: React.CSSProperties = {
  backgroundColor: '#ff5a5a',
  borderRadius: '14px',
  width: '41px',
  height: '41px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const iconStyle: React.CSSProperties = {
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const textContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
  maxWidth: '212px',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'Pretendard',
  fontWeight: 600,
  fontSize: '16px',
  lineHeight: 'normal',
  color: '#171719',
  margin: 0,
};

const messageStyle: React.CSSProperties = {
  fontFamily: 'Pretendard',
  fontWeight: 400,
  fontSize: '13px',
  lineHeight: 'normal',
  color: '#171719',
  margin: 0,
};

const closeButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: '4px',
  cursor: 'pointer',
  borderRadius: '4px',
  transition: 'background-color 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  flexShrink: 0,
}; 