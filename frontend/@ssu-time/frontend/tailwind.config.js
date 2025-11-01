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
      },
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
      },
      boxShadow: {
        'dropdown': '0px 10px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
