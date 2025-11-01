import React, { useState, useRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { UploadProgress } from './UploadProgress';
import { ErrorModal } from '../ui/ErrorModal';
import { StatusToast } from '../ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { uploadFile, pollFileStatus, FileInfoResponse } from '../../lib/api';

interface FileUploadBoxProps {
  className?: string;
  onUploadComplete?: (file: File, fileInfo?: FileInfoResponse) => void;
}

export const FileUploadBox = React.forwardRef<{ open: () => void }, FileUploadBoxProps>(({ className = '', onUploadComplete }, ref) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ visible: boolean; variant: 'loading' | 'success' | 'sizeError' | 'fail'; title?: string; subtitle?: string }>({ visible: false, variant: 'loading' });

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  // 외부에서 파일 선택창을 열 수 있도록 공개 메서드 제공
  useImperativeHandle(ref, () => ({
    open: () => handleClick(),
  }));

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 확장자/크기 검증 (pdf, pptx 허용)
      const name = file.name || '';
      const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
      const allowedExts = ['pdf', 'pptx'];

      if (!allowedExts.includes(ext)) {
        setError({
          title: "확장자 오류",
          message: "PDF, PPTX 파일만 업로드할 수 있어요."
        });
        setToast({ visible: true, variant: 'sizeError', title: '파일 확장자 오류', subtitle: 'PDF, PPTX만 업로드할 수 있어요.' });
        return;
      }

      // 20MB = 20 * 1024 * 1024 bytes
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        setError({
          title: "파일 크기 초과",
          message: "파일 크기가 20MB를 초과합니다. 20MB 이하의 파일을 업로드해주세요."
        });
        setToast({ visible: true, variant: 'sizeError', title: '파일 크기 오류', subtitle: '20MB 이하의 파일만 업로드할 수 있어요.' });
        return;
      }

      setSelectedFile(file);
      setIsUploading(true);
      setToast({ visible: true, variant: 'loading' });
      setProgress(0);

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
      setToast({ visible: true, variant: 'success' });
      onUploadComplete?.(file, completedFileInfo);

      // Reset after 3 seconds
      setTimeout(() => {
        setSelectedFile(null);
        setProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setToast({ ...toast, visible: false });
      }, 3000);

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
      setToast({ visible: true, variant: 'fail', title: '업로드 실패', subtitle: errorMessage });

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const renderFileIcon = () => (
    <div 
      className="file-icon"
      style={{
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="48" height="48" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M22.0367 3.16575C21.3427 2.99913 20.623 2.99947 19.6705 2.99992L14.6381 2.99997C13.4306 2.99995 12.4341 2.99994 11.6223 3.06626C10.7791 3.13515 10.0041 3.283 9.27606 3.65393C8.14709 4.22917 7.2292 5.14706 6.65396 6.27603C6.28303 7.00403 6.13518 7.77909 6.06629 8.62223C5.99997 9.43402 5.99998 10.4306 6 11.638V24.3619C5.99998 25.5694 5.99997 26.5659 6.06629 27.3777C6.13518 28.2209 6.28303 28.9959 6.65396 29.7239C7.2292 30.8529 8.14709 31.7708 9.27606 32.346C10.0041 32.7169 10.7791 32.8648 11.6223 32.9337C12.434 33 13.4306 33 14.638 33H21.362C22.5694 33 23.566 33 24.3777 32.9337C25.2209 32.8648 25.9959 32.7169 26.7239 32.346C27.8529 31.7708 28.7708 30.8529 29.346 29.7239C29.717 28.9959 29.8648 28.2209 29.9337 27.3777C30 26.5659 30 25.5694 30 24.3619L30 13.3295C30.0005 12.377 30.0008 11.6573 29.8342 10.9633C29.6872 10.351 29.4448 9.76578 29.1158 9.22894C28.7429 8.62036 28.2338 8.11171 27.5599 7.43852L25.5615 5.44005C24.8883 4.76621 24.3796 4.25707 23.771 3.88413C23.2342 3.55516 22.6489 3.31273 22.0367 3.16575ZM19.5 5.99997H14.7C13.4151 5.99997 12.5417 6.00114 11.8666 6.0563C11.2089 6.11003 10.8726 6.20742 10.638 6.32695C10.0735 6.61457 9.6146 7.07352 9.32698 7.638C9.20745 7.8726 9.11006 8.20891 9.05633 8.86653C9.00117 9.54166 9 10.4151 9 11.7V24.3C9 25.5848 9.00117 26.4583 9.05633 27.1334C9.11006 27.791 9.20745 28.1273 9.32698 28.3619C9.6146 28.9264 10.0735 29.3854 10.638 29.673C10.8726 29.7925 11.2089 29.8899 11.8666 29.9436C12.5417 29.9988 13.4151 30 14.7 30H21.3C22.5849 30 23.4583 29.9988 24.1334 29.9436C24.7911 29.8899 25.1274 29.7925 25.362 29.673C25.9265 29.3854 26.3854 28.9264 26.673 28.3619C26.7926 28.1273 26.8899 27.791 26.9437 27.1334C26.9988 26.4583 27 25.5848 27 24.3V13.5H24C21.5147 13.5 19.5 11.4853 19.5 8.99997V5.99997ZM26.34 10.5C26.1597 10.2868 25.8718 9.99312 25.3305 9.4518L23.5482 7.66946C23.0069 7.12814 22.7132 6.84027 22.5 6.66001V8.99997C22.5 9.8284 23.1716 10.5 24 10.5H26.34Z" fill={colors.label.normal}/>
        <path d="M19.5 18C19.5 17.1716 18.8284 16.5 18 16.5C17.1716 16.5 16.5 17.1716 16.5 18V19.5H15C14.1716 19.5 13.5 20.1716 13.5 21C13.5 21.8284 14.1716 22.5 15 22.5H16.5V24C16.5 24.8284 17.1716 25.5 18 25.5C18.8284 25.5 19.5 24.8284 19.5 24V22.5H21C21.8284 22.5 22.5 21.8284 22.5 21C22.5 20.1716 21.8284 19.5 21 19.5H19.5V18Z" fill={colors.label.normal}/>
      </svg>
    </div>
  );

  const renderInitialContent = () => (
    <div 
      className="upload-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        width: 'auto',
        height: 'auto',
      }}
    >
      {renderFileIcon()}
      <div 
        className="text-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          width: 'auto',
          height: 'auto',
        }}
      >
        <div
          className="main-text"
          style={{
            ...typography.body.normal,
            color: colors.label.normal,
            textAlign: 'center',
            margin: 0,
          }}
        >
          PDF 또는 PPTX 파일을 업로드 해주세요.
        </div>
        <div 
          className="sub-text" 
          style={{ 
            ...typography.label,
            color: colors.label.neutral,
            textAlign: 'center', 
            justifyContent: 'center', 
            display: 'flex', 
            alignItems: 'center',
            margin: 0,
          }}
        >
          최대 100페이지 이하 / 20MB 이하
        </div>
      </div>
    </div>
  );

  const renderUploadingContent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{
        ...typography.body.normal,
        color: colors.label.normal,
        textAlign: 'center',
        maxWidth: '300px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {selectedFile?.name || '[파일명]'}
      </div>
      
      <div style={{
        ...typography.body.normal,
        color: colors.label.normal,
        textAlign: 'center'
      }}>
        파일을 업로드 중입니다
      </div>
      
      <UploadProgress 
        progress={progress}
        fileName={selectedFile?.name}
        totalSize={selectedFile?.size}
      />
    </div>
  );

  const renderCompletedContent = () => (
    <div 
      className="upload-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <div style={{
        ...typography.body.normal,
        color: colors.semantic.success,
        textAlign: 'center',
        marginBottom: '8px'
      }}>
        ✅ 업로드 완료: {selectedFile?.name}
      </div>
      <div style={{
        ...typography.label,
        color: colors.label.neutral,
        textAlign: 'center',
        fontSize: '12px'
      }}>
        클릭하여 다른 파일 업로드 (3초 후 자동 리셋)
      </div>
    </div>
  );

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
      
      <input
        type="file"
        accept=".pdf,.pptx"
        onChange={handleFileSelect}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      
      <div 
        className={`upload-container ${className}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          cursor: isUploading ? 'default' : 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 40px',
          width: '100%',
          minHeight: '300px',
          backgroundColor: isHovered && !isUploading ? colors.fill.strong : colors.fill.normal,
          borderRadius: '30px',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
        }}
      >
        {/* 상태는 토스트로 노출 (업로드 중엔 진행률 포함). 확실한 뷰포트 기준 위치를 위해 포털 사용 */}
        {createPortal(
          <StatusToast
            visible={isUploading || toast.visible}
            variant={isUploading ? 'loading' : toast.variant}
            title={toast.title}
            subtitle={toast.subtitle}
            progress={isUploading ? progress : undefined}
          />,
          document.body
        )}
        {!isUploading && !selectedFile && renderInitialContent()}
        {isUploading && renderUploadingContent()}
        {!isUploading && selectedFile && progress === 100 && renderCompletedContent()}
      </div>
    </>
  );
});