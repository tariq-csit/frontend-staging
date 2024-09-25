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
         100: 'rgba(53, 48, 134, 0.1)'
      },
       secondary: '#BBBBBB',
       button: '#4943A4',
       listBg: '#FAFAFB',
       statusGreen: 'rgba(0, 128, 0, 0.30)',
       statusTextGreen: '#008000',
       statusOrange: 'rgba(255, 140, 4, 0.30)',
       statusTextOrange: '#FF5E04',
       statusSilver: ' rgba(93, 93, 93, 0.15)',
       statusTextSilver: '#5D5D5D'
      },
      borderRadius:{
        nav: '6.25rem',
        component: '1rem',
        chart: '1.25rem',
        form: '1rem',
        formInput: '0.375rem',
        reportItem: '1rem',
        activity: '0.5rem'

      },
      padding:{
        nav: '0.75rem 1rem',
        component: '1.5rem',
        chart: '1.5rem 0.75rem',
        listItem: '0.625rem',
        form: '2rem', 
        formInput: '0rem 0.9375rem',
        reportsComponent: '1.25rem',
        reoprtItem: '1.25rem',
        settingSection: '3.75rem'

      },
      height:{
        nav: '2.75rem',
        listItem: '3.125rem',
        formInput: '2.625rem',
        reportListItem: '3.75rem',
        activityIcon: '2.5rem'
      },
      gap:{
        nav: '0.625rem',
        component: '1.5rem',
        listItem: '0.625rem',
        form: '0.625rem',
        reoprtItem: '2rem',
        settingSection: '0.75rem',
        teamIcons: '0.9375rem'
      },
      boxShadow:{
        component: '0px 5px 10px 0px rgba(0, 0, 0, 0.08)',
      },
      width:{
        form: '64.5625rem',
        icon: '1.25rem',
        iconContainer: '3.75rem',
        activityIcon: '2.5rem',
        tableVarients: '11.58931rem',
        team: '2.1875rem'
      },
      height:{
        icon: '1.25rem',
        iconContainer: '3.75rem',
        activity: '6rem',
        tableVarients: '3.125rem',
        team: '2.1875rem'
      },
      fontSize:{
        xxs: '0.65rem',
        xxxs: '0.5rem',
        xxxxs: '0.425rem'
      },
      flex:{
        component: '1 0% 0%'
      }
    },
  },
  plugins: [],
}