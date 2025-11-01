import React from 'react';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export interface TypographyProps {
  variant?: 'title1' | 'title2' | 'title3' | 'body' | 'bodyReading' | 'label' | 'caption';
  color?: keyof typeof colors.label | keyof typeof colors.primary | 'white' | 'black';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  component?: keyof JSX.IntrinsicElements;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'normal',
  children,
  className = '',
  style = {},
  component = 'p',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'title1':
        return typography.title[1];
      case 'title2':
        return typography.title[2];
      case 'title3':
        return typography.title[3];
      case 'body':
        return typography.body.normal;
      case 'bodyReading':
        return typography.body.reading;
      case 'label':
        return typography.label;
      case 'caption':
        return typography.caption;
      default:
        return typography.body.normal;
    }
  };

  const getColor = (colorKey: string) => {
    if (colorKey === 'white') return colors.static.white;
    if (colorKey === 'black') return colors.static.black;
    if (colorKey in colors.label) {
      return colors.label[colorKey as keyof typeof colors.label];
    }
    if (colorKey in colors.primary) {
      return colors.primary[colorKey as keyof typeof colors.primary];
    }
    return colors.label.normal;
  };

  const Component = component;

  return (
    <Component
      className={`typography ${className}`}
      style={{
        ...getVariantStyles(),
        color: getColor(color),
        margin: 0,
        padding: 0,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}; 