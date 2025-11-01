import { useState, useRef } from 'react';
import { UploadProgress } from './UploadProgress';
import { ErrorModal } from '../ui/ErrorModal';
import { uploadFile, pollFileStatus, FileInfoResponse } from '../../lib/api';

interface PdfUploaderProps {
  onFileSelect?: (file: File) => void;
  onUploadComplete?: (file: File, fileInfo: FileInfoResponse) => void;
}

export function PdfUploader({ onFileSelect, onUploadComplete }: PdfUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (!allowedTypes.includes(file.type)) {
        setError({
          title: "업로드 실패",
          message: "PDF 또는 PPTX 파일만 업로드 가능합니다."
        });
        return;
      }

      // 20MB = 20 * 1024 * 1024 bytes
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        setError({
          title: "파일 크기 초과",
          message: "파일 크기가 20MB를 초과합니다. 20MB 이하의 파일을 업로드해주세요."
        });
        return;
      }

      setSelectedFile(file);
      setIsUploading(true);
      onFileSelect?.(file);

      // Perform actual API upload
      performUpload(file);
    }
  };

  const handleErrorClose = () => {
    setError(null);
  };

  const performUpload = async (file: File) => {
    try {
      setProgress(0);

      // Upload file with progress tracking
      const fileInfo = await uploadFile(file, (uploadProgress) => {
        // Upload progress is 0-100, we'll use 0-80 for upload
        setProgress(Math.min(uploadProgress * 0.8, 80));
      });

      // Start polling for processing status (80-100%)
      setProgress(80);

      const completedFileInfo = await pollFileStatus(fileInfo.id, {
        interval: 2000,
        maxAttempts: 30,
        onStatusChange: (status) => {
          if (status === 'PROCESSING') {
            setProgress(85);
          }
        }
      });

      setProgress(100);
      setIsUploading(false);
      onUploadComplete?.(file, completedFileInfo);

    } catch (error) {
      setIsUploading(false);
      setProgress(0);
      setSelectedFile(null);

      const errorMessage = error instanceof Error
        ? error.message
        : '파일 업로드에 실패했습니다.';

      setError({
        title: '업로드 실패',
        message: errorMessage
      });
    }
  };

  return (
    <>
      {/* 에러 모달 */}
      {error && (
        <ErrorModal
          title={error.title}
          message={error.message}
          onClose={handleErrorClose}
          isVisible={true}
        />
      )}
      
      <div style={containerStyle} onClick={handleClick}>
        <input
          type="file"
          accept=".pdf,.pptx"
          onChange={handleFileSelect}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        
        {!isUploading && !selectedFile && (
          <div style={initialStateStyle}>
            <div style={fileNameStyle}>
              [파일명]
            </div>
            <div style={descriptionStyle}>
              PDF 또는 PPTX 파일을 업로드 해주세요
            </div>
          </div>
        )}

        {isUploading && (
          <div style={uploadingStateStyle}>
            <div style={fileNameContainerStyle}>
              <div style={fileNameStyle}>
                {selectedFile?.name || '[파일명]'}
              </div>
            </div>
            
            <div style={statusTextStyle}>
              파일을 업로드 중입니다
            </div>
            
            <UploadProgress 
              progress={progress}
              fileName={selectedFile?.name}
              totalSize={selectedFile?.size}
            />
          </div>
        )}

        {!isUploading && selectedFile && progress === 100 && (
          <div style={completedStateStyle}>
            <div style={fileNameStyle}>
              {selectedFile.name}
            </div>
            <div style={completedTextStyle}>
              업로드 완료
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// 스타일 정의
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0px',
  gap: '10px',
  width: '245px',
  minHeight: '69px',
  cursor: 'pointer',
  flex: 'none',
  order: 0,
  flexGrow: 0,
};

const initialStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
};

const uploadingStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0px',
  gap: '10px',
  width: '245px',
  height: '69px',
};

const fileNameContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0px',
  gap: '5px',
  width: '147px',
  height: '43px',
};

const fileNameStyle: React.CSSProperties = {
  width: 'auto',
  minWidth: '53px',
  height: '19px',
  fontFamily: 'Pretendard',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: '16px',
  lineHeight: '19px',
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center',
  color: '#171719',
  flex: 'none',
  order: 0,
  flexGrow: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '200px',
};

const statusTextStyle: React.CSSProperties = {
  width: '147px',
  height: '19px',
  fontFamily: 'Pretendard',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: '16px',
  lineHeight: '19px',
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center',
  color: '#171719',
  flex: 'none',
  order: 0,
  flexGrow: 0,
};

const descriptionStyle: React.CSSProperties = {
  fontFamily: 'Pretendard',
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '17px',
  color: '#78787B',
  textAlign: 'center',
};

const completedStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
};

const completedTextStyle: React.CSSProperties = {
  fontFamily: 'Pretendard',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: '16px',
  lineHeight: '19px',
  color: '#00C851',
  textAlign: 'center',
}; 