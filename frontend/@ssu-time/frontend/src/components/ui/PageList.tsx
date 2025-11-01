import React from 'react';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface PageListProps {
  /** 페이지 목록 */
  pages: Array<{
    id: number;
    title: string;
    description?: string;
    isSelected?: boolean;
  }>;
  /** 페이지 선택 콜백 */
  onPageSelect?: (pageId: number) => void;
  /** 새 페이지 추가 콜백 */
  onAddPage?: () => void;
  /** 헤더 제목 */
  title?: string;
}

export function PageList({ 
  pages, 
  onPageSelect, 
  onAddPage, 
  title = "페이지 목록" 
}: PageListProps) {
  const renderPageItem = (page: typeof pages[0], index: number) => {
    const isSelected = page.isSelected || false;
    
    return (
      <div
        key={page.id}
        style={{
          ...pageItemStyle,
          ...(isSelected ? selectedPageItemStyle : {}),
        }}
        onClick={() => onPageSelect?.(page.id)}
      >
        <div style={pageContentStyle}>
          <div style={pageNumberStyle}>
            {index + 1}
          </div>
          <div style={pageInfoStyle}>
            <div style={pageTitleStyle}>
              {page.title}
            </div>
            {page.description && (
              <div style={pageDescriptionStyle}>
                {page.description}
              </div>
            )}
          </div>
        </div>
        
        {isSelected && (
          <div style={selectedIndicatorStyle} />
        )}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>{title}</span>
        {onAddPage && (
          <button 
            style={addButtonStyle}
            onClick={onAddPage}
          >
            추가
          </button>
        )}
      </div>
      
      <div style={listContainerStyle}>
        {pages.map((page, index) => renderPageItem(page, index))}
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '400px',
  backgroundColor: colors.background.normal,
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  borderBottom: `1px solid ${colors.line.normal}`,
};

const titleStyle: React.CSSProperties = {
  ...typography.title[2],
  color: colors.label.normal,
};

const addButtonStyle: React.CSSProperties = {
  ...typography.button[2],
  padding: '8px 16px',
  backgroundColor: colors.primary.normal,
  color: colors.static.white,
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  outline: 'none',
};

const listContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '400px',
  overflowY: 'auto',
};

const pageItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: `1px solid ${colors.line.normal}`,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  position: 'relative',
};

const selectedPageItemStyle: React.CSSProperties = {
  backgroundColor: colors.fill.normal,
};

const pageContentStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flex: 1,
};

const pageNumberStyle: React.CSSProperties = {
  ...typography.body.reading,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  backgroundColor: colors.fill.normal,
  borderRadius: '6px',
  color: colors.label.normal,
  fontWeight: 600,
  flexShrink: 0,
};

const pageInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
};

const pageTitleStyle: React.CSSProperties = {
  ...typography.body.reading,
  color: colors.label.normal,
  fontWeight: 600,
};

const pageDescriptionStyle: React.CSSProperties = {
  ...typography.label,
  color: colors.label.alternative,
  lineHeight: '16px',
};

const selectedIndicatorStyle: React.CSSProperties = {
  position: 'absolute',
  right: '20px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '8px',
  height: '8px',
  backgroundColor: colors.primary.normal,
  borderRadius: '50%',
}; 