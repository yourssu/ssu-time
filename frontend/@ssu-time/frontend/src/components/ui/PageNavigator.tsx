import React from 'react';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface PageNavigatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PageNavigator({
  currentPage,
  totalPages,
  onPageChange,
}: PageNavigatorProps) {
  const renderPageButton = (pageNumber: number) => {
    const isActive = pageNumber === currentPage;
    
    return (
      <button
        key={pageNumber}
        style={{
          ...pageButtonStyle,
          ...(isActive ? activePageButtonStyle : {}),
        }}
        onClick={() => onPageChange(pageNumber)}
      >
        {pageNumber}
      </button>
    );
  };

  const renderScrollbar = () => {
    const scrollPercentage = (currentPage - 1) / (totalPages - 1) * 100;
    
    return (
      <div style={scrollbarContainerStyle}>
        <div style={scrollbarTrackStyle}>
          <div 
            style={{
              ...scrollbarThumbStyle,
              top: `${scrollPercentage}%`,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>페이지</span>
        <span style={pageCountStyle}>{currentPage}/{totalPages}</span>
      </div>
      
      <div style={pagesContainerStyle}>
        {Array.from({ length: totalPages }, (_, index) => renderPageButton(index + 1))}
      </div>
      
      {totalPages > 4 && renderScrollbar()}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '80px',
  height: '100%',
  backgroundColor: colors.background.normal,
  borderRadius: '8px',
  padding: '16px 12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  marginBottom: '16px',
};

const titleStyle: React.CSSProperties = {
  ...typography.label,
  color: colors.label.normal,
  fontWeight: 500,
};

const pageCountStyle: React.CSSProperties = {
  ...typography.caption,
  color: colors.label.assistive,
};

const pagesContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
};

const pageButtonStyle: React.CSSProperties = {
  ...typography.body.reading,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '56px',
  height: '32px',
  backgroundColor: colors.background.normal,
  border: `1px solid ${colors.line.normal}`,
  borderRadius: '6px',
  color: colors.label.normal,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  outline: 'none',
};

const activePageButtonStyle: React.CSSProperties = {
  backgroundColor: colors.primary.normal,
  color: colors.static.white,
  border: `1px solid ${colors.primary.normal}`,
};

const scrollbarContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '4px',
  height: '100%',
  marginLeft: '8px',
};

const scrollbarTrackStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: '4px',
  height: '100%',
  backgroundColor: colors.fill.normal,
  borderRadius: '2px',
};

const scrollbarThumbStyle: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  width: '4px',
  height: '20px',
  backgroundColor: colors.primary.normal,
  borderRadius: '2px',
  transition: 'top 0.2s ease',
}; 