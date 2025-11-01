import React from 'react';

interface UploadProgressProps {
  progress: number;
  fileName?: string;
  fileSize?: number; // 현재 업로드된 크기 (bytes)
  totalSize?: number; // 전체 파일 크기 (bytes)
  style?: React.CSSProperties;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ 
  progress, 
  fileName: _fileName, 
  fileSize,
  totalSize,
  style = {} 
}) => {
  // 파일 크기 포맷팅 함수
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      // 1MB 미만이면 KB 단위
      return `${Math.ceil(bytes / 1024)}KB`;
    } else {
      // 1MB 이상이면 MB 단위 (소수점 버림)
      return `${Math.floor(bytes / (1024 * 1024))}MB`;
    }
  };

  // 업로드 진행률에 따른 현재 크기 계산
  const getCurrentSize = () => {
    if (fileSize !== undefined) {
      return fileSize;
    }
    if (totalSize !== undefined) {
      return Math.floor((totalSize * progress) / 100);
    }
    return 0;
  };

  const currentSize = getCurrentSize();
  const displayTotalSize = totalSize || 0;
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginTop: '10px',
      ...style
    }}>
      {/* Progress Bar Container */}
      <div style={{
        position: 'relative',
        width: '200px',
        height: '5px'
      }}>
        {/* Background */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: '#AEAFB0',
          borderRadius: '22px'
        }} />
        {/* Fill */}
        <div style={{
          position: 'absolute',
          width: `${progress}%`,
          height: '100%',
          background: '#0A64FF',
          borderRadius: '22px',
          transition: 'width 0.2s ease-in-out'
        }} />
      </div>
      
      {/* Progress Text */}
      <div style={{
        fontFamily: 'Pretendard',
        fontWeight: 400,
        fontSize: '13px',
        lineHeight: '16px',
        color: '#AEAFB0',
        minWidth: '70px'
      }}>
        {displayTotalSize > 0 
          ? `${formatFileSize(currentSize)}/${formatFileSize(displayTotalSize)}`
          : '0KB/0KB'
        }
      </div>
    </div>
  );
}; 