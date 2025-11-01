import React from 'react';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface PagePreviewProps {
  /** 전체 페이지 수 */
  totalPages: number;
  /** 현재 선택된 페이지 번호 */
  currentPage?: number;
  /** 페이지 변경 시 호출되는 콜백 */
  onPageChange?: (pageNumber: number) => void;
  /** 제목 */
  title?: string;
  /** 설명 */
  description?: string;
  /** 페이지당 표시할 아이템 수 */
  itemsPerPage?: number;
}

export function PagePreview({
  totalPages,
  currentPage = 1,
  onPageChange,
  title = "발표 대본",
  description = "설명을 입력하세요",
  itemsPerPage = 20,
}: PagePreviewProps) {
  const renderPageThumbnails = () => {
    const thumbnails = [];
    
    for (let i = 1; i <= Math.min(totalPages, itemsPerPage); i++) {
      const isSelected = i === currentPage;
      
      thumbnails.push(
        <div
          key={i}
          style={{
            ...thumbnailStyle,
            ...(isSelected ? selectedThumbnailStyle : {}),
          }}
          onClick={() => onPageChange?.(i)}
        >
          <div style={thumbnailContentStyle}>
            <span style={{
              ...thumbnailNumberStyle,
              color: isSelected ? colors.static.white : colors.label.normal,
            }}>{i}</span>
          </div>
        </div>
      );
    }
    
    return thumbnails;
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={titleContainerStyle}>
          <span style={titleStyle}>{title}</span>
          <span style={descriptionStyle}>{description}</span>
        </div>
      </div>
      
      <div style={gridContainerStyle}>
        <div style={gridStyle}>
          {renderPageThumbnails()}
        </div>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '400px',
  padding: '20px',
  backgroundColor: colors.background.normal,
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: '20px',
};

const titleContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const titleStyle: React.CSSProperties = {
  ...typography.title[2],
  color: colors.label.normal,
};

const descriptionStyle: React.CSSProperties = {
  ...typography.label,
  color: colors.label.alternative,
};

const gridContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '300px',
  border: `1px solid ${colors.line.normal}`,
  borderRadius: '8px',
  backgroundColor: colors.background.alternative,
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gridTemplateRows: 'repeat(4, 1fr)',
  gap: '8px',
  padding: '20px',
  width: '100%',
  height: '100%',
};

const thumbnailStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '60px',
  height: '60px',
  backgroundColor: colors.background.normal,
  border: `1px solid ${colors.line.normal}`,
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  position: 'relative',
};

const selectedThumbnailStyle: React.CSSProperties = {
  backgroundColor: colors.primary.normal,
  border: `1px solid ${colors.primary.normal}`,
  boxShadow: '0 0 0 2px rgba(50, 130, 255, 0.2)',
};

const thumbnailContentStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
};

const thumbnailNumberStyle: React.CSSProperties = {
  ...typography.body.reading,
  fontWeight: 500,
}; 