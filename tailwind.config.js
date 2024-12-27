/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'100': 'rgba(53, 48, 134, 0.1)',
  				'900': '#353086',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			button: '#4943A4',
  			listBg: '#FAFAFB',
  			statusGreen: 'rgba(0, 128, 0, 0.30)',
  			statusTextGreen: '#008000',
  			statusOrange: 'rgba(255, 140, 4, 0.30)',
  			statusTextOrange: '#FF5E04',
  			statusSilver: ' rgba(93, 93, 93, 0.15)',
  			statusTextSilver: '#5D5D5D',
  			inputBorder: '#787486',
				previewText: '#787486',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			nav: '6.25rem',
  			component: '1rem',
  			chart: '1.25rem',
  			form: '1rem',
  			formInput: '0.375rem',
  			reportItem: '1rem',
  			activity: '0.5rem',
  			input: '0.375rem',
				settingsSection: '0.5rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		// padding: {
  		// 	nav: '0.75rem 1rem',// px-4 py-3
  		// 	component: '1.5rem',// p-6
  		// 	chart: '1.5rem 0.75rem',// py-6 px-3
  		// 	listItem: '0.625rem',// p-2.5
  		// 	form: '2rem',// p-8
  		// 	formInput: '0rem 0.9375rem',
  		// 	reportsComponent: '1.25rem',
  		// 	reoprtItem: '1.25rem',
  		// 	settingSection: '3.75rem',
  		// 	input: '0.9375rem',
			// 	formBtn: '0.5rem 1rem'
  		// },
  		// height: {
  		// 	icon: '1.25rem',
  		// 	iconContainer: '3.75rem',
  		// 	activity: '6rem',
  		// 	tableVarients: '3.125rem',
  		// 	team: '2.1875rem',
  		// 	input: '2.625rem',
  		// 	textArea: '8.75rem',
			// 	attachmentsField: '10.4375rem'
  		// },
  		// gap: {
  		// 	nav: '0.625rem',
  		// 	component: '1.5rem',
  		// 	listItem: '0.625rem',
  		// 	form: '0.625rem',
  		// 	reoprtItem: '2rem',
  		// 	settingSection: '0.75rem',
  		// 	teamIcons: '0.9375rem'
  		// },
  		boxShadow: {
  			component: '0px 5px 10px 0px rgba(0, 0, 0, 0.08)',
				otpSlot: '0px 4px 4px 0px rgba(0, 0, 0, 0.25);'
  		},
  		// width: {
  		// 	form: '64.5625rem',
  		// 	iconContainer: '',
  		// 	activityIcon: '',
  		// 	tableVarients: '',
  		// 	team: '',
  		// 	formField: ''
  		// },
  		// fontSize: {
  		// 	'2xs': '0.65rem',
  		// 	'3xs': '0.5rem',
  		// 	'4xs': '0.425rem'
  		// },
  		flex: {
  			component: '1 0% 0%'
  		},
  		fontFamily: {
  			poppins: 'Poppins',
				inter: 'Inter'
  		}
  	}
  },
  plugins: ["tailwindcss-animate"],
}
