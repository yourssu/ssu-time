import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { ScriptModalHeader } from './ScriptModalHeader';
import { SimplePdfViewer } from '../ui/SimplePdfViewer';

interface ScriptModalPreviewProps {
  title: string;
  description: string;
  /** PDF 파일 */
  pdfFile?: File | null;
  /** 초기 페이지 번호 */
  initialPage?: number;
  /** 총 페이지 수 */
  totalPages: number;
  /** 미리보기 콘텐츠 렌더링 함수 (기존 호환성) */
  renderPreviewContent?: () => React.ReactNode;
}

export const ScriptModalPreview: React.FC<ScriptModalPreviewProps> = ({
  title,
  description,
  pdfFile,
  initialPage = 1,
  totalPages: _totalPages,
  renderPreviewContent,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const isMobile = useIsMobile(480);

  // 초기 페이지 변경 시 동기화
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  const renderContent = () => {
    // PDF 파일이 있으면 SimplePdfViewer 사용
    if (pdfFile) {
      return (
        <SimplePdfViewer
          file={pdfFile}
          currentPage={currentPage}
        />
      );
    }

    // 기존 방식의 미리보기 콘텐츠가 있으면 사용
    if (renderPreviewContent) {
      return renderPreviewContent();
    }

    // 기본 플레이스홀더
    return (
      <div style={previewPlaceholderStyle}>
        <div style={previewImageStyle} />
      </div>
    );
  };

  return (
    <div style={{
      ...previewSectionStyle,
      maxWidth: isMobile ? '100%' : previewSectionStyle.maxWidth,
      gap: isMobile ? '8px' : previewSectionStyle.gap,
      justifyContent: isMobile ? 'flex-start' : previewSectionStyle.justifyContent,
      alignItems: isMobile ? 'stretch' : previewSectionStyle.alignItems,
    }}>
      <ScriptModalHeader title={title} description={description} />
      <div style={{
        ...previewContentStyle,
        height: isMobile ? '250px' : previewContentStyle.height,
        maxWidth: isMobile ? '100%' : previewContentStyle.maxWidth,
        width: '100%',
      }}>
        {renderContent()}
      </div>
    </div>
  );
};

// 메모이제이션된 컴포넌트로 export
export const MemoizedScriptModalPreview = React.memo(ScriptModalPreview);

const previewSectionStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: '500px',
  gap: '20px',
};

const previewContentStyle: React.CSSProperties = {
  backgroundColor: '#f1f2f5',
  height: '459px',
  width: '100%',
  maxWidth: '480px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
  overflow: 'hidden',
};

const previewPlaceholderStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const previewImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  backgroundColor: '#eeeeee',
  borderRadius: '8px',
}; 