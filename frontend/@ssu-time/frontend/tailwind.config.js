/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ssu-primary': '#3282FF',
        'ssu-primary-dark': '#0A64FF',
        'ssu-text': '#171719',
        'ssu-background': '#ffffff',
        'ssu-muted': '#7d7e83',
        // iOS system colors
        'ios-blue': '#007AFF',
        'ios-gray6': '#F2F2F7',
        'ios-gray4': '#D1D1D6',
        'ios-dark-gray': '#3C3C43',
      },
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
      },
      boxShadow: {
        'dropdown': '0px 10px 30px rgba(0, 0, 0, 0.12)',
      },
      spacing: {
        '18': '4.5rem', // 72px
      },
    },
  },
  plugins: [],
}
