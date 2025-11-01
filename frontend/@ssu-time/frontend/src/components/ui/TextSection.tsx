import React from 'react';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface TextSectionProps {
  title: string;
  subtitle: string;
  onTitleClick?: () => void;
}

export const TextSection: React.FC<TextSectionProps> = ({ title, subtitle, onTitleClick }) => {
  return (
    <div 
      className="text-section"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        padding: '0',
      }}
    >
      <div 
        className="text-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          width: '100%',
        }}
      >
        <div 
          className="title-text"
          onClick={onTitleClick}
          style={{
            ...typography.title[1],
            color: colors.label.normal,
            textAlign: 'center',
            margin: 0,
            cursor: onTitleClick ? 'pointer' : 'default',
            userSelect: 'none',
            transition: 'opacity 0.2s ease',
          }}
        >
          {title}
        </div>
        <div 
          className="subtitle-text"
          style={{
            ...typography.body.normal,
            color: colors.primary.normal,
            textAlign: 'center',
            margin: 0,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}; 