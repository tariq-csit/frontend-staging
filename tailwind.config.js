/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
      primary:{
        900:'#353086',
        100: rgba(53, 48, 134, 0.1)
      },
      secondary: '#BBBBBB',
      },
      radius:{
        nav: '100px',
        component: '16px'
      },
      padding:{
        nav: '16px',
      },
      height:{
        nav: '44px'
      },
      gap:{
        nav: '10px'
      }
    },
  },
  plugins: [],
}

