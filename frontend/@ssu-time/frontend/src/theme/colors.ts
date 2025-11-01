export const colors = {
  primary: {
    normal: '#3282FF',
    strong: '#0A64FF',
  },
  label: {
    normal: '#171719',
    strong: '#000000',
    alternative: '#78787B',
    neutral: '#7D7E83',
    assistive: '#AEAFB0',
    disable: '#C2C2C3',
  },
  fill: {
    normal: '#F1F2F5',
    strong: '#D9D9D9',
    alternative: '#D8D8D8',
    neutral: '#EEEEEE',
  },
  background: {
    normal: '#FFFFFF',
    alternative: '#F7F7F8',
  },
  line: {
    normal: '#C5C5C7',
    alternative: '#D5D5D6',
    neutralOpacity: 'rgba(112, 115, 124, 0.16)',
  },
  interaction: {
    inactive: '#989BA2',
    disable: '#F4F4F5',
  },
  static: {
    white: '#FFFFFF',
    black: '#000000',
  },
  semantic: {
    error: '#FF3742',
    warning: '#FF8F00',
    success: '#00C851',
    info: '#17A2B8',
  },
} as const;

export type Colors = typeof colors; 