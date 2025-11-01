export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '64px',
} as const;

export const padding = {
  xs: '4px 8px',
  sm: '7px 15px',
  md: '10px 20px',
  lg: '15px 30px',
  xl: '20px 40px',
} as const;

export type Spacing = typeof spacing;
export type Padding = typeof padding; 