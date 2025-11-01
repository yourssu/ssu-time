const baseFontFamily = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";

export const typography = {
  title: {
    1: {
      fontFamily: baseFontFamily,
      fontWeight: 600,
      fontSize: '22px',
      lineHeight: '22px',
    },
    2: {
      fontFamily: baseFontFamily,
      fontWeight: 600,
      fontSize: '20px',
      lineHeight: '20px',
    },
    3: {
      fontFamily: baseFontFamily,
      fontWeight: 500,
      fontSize: '18px',
      lineHeight: '18px',
    },
  },
  body: {
    normal: {
      fontFamily: baseFontFamily,
      fontWeight: 500,
      fontSize: '16px',
      lineHeight: '16px',
    },
    reading: {
      fontFamily: baseFontFamily,
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: '14px',
    },
  },
  button: {
    1: {
      fontFamily: baseFontFamily,
      fontWeight: 500,
      fontSize: '16px',
      lineHeight: '16px',
    },
    2: {
      fontFamily: baseFontFamily,
      fontWeight: 500,
      fontSize: '13px',
      lineHeight: '13px',
    },
  },
  label: {
    fontFamily: baseFontFamily,
    fontWeight: 400,
    fontSize: '13px',
    lineHeight: '13px',
  },
  caption: {
    fontFamily: baseFontFamily,
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '12px',
  },
  heading: {
    2: {
      fontFamily: baseFontFamily,
      fontWeight: 600,
      fontSize: '20px',
      lineHeight: '28px',
    },
  },
  headline: {
    2: {
      fontFamily: baseFontFamily,
      fontWeight: 600,
      fontSize: '17px',
      lineHeight: '24px',
    },
  },
  captionBold: {
    1: {
      fontFamily: baseFontFamily,
      fontWeight: 600,
      fontSize: '12px',
      lineHeight: '16px',
    },
    2: {
      fontFamily: baseFontFamily,
      fontWeight: 600,
      fontSize: '11px',
      lineHeight: '14px',
    },
  },
} as const;

export type Typography = typeof typography; 