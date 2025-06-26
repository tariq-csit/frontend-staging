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
  			statusGreen: '#86EFAC',
  			statusTextGreen: '#166534',
  			statusOrange: '#FDE68A',
  			statusTextOrange: '#92400E',
  			statusSilver: '#E5E7EB',
  			statusTextSilver: '#6B7280',
  			priorityRed: 'rgba(254, 202, 202, 1)',
  			priorityTextRed: '#991B1B',
  			priorityBlue: 'rgba(59, 130, 246, 0.2)',
  			priorityTextBlue: '#3B82F6',
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
  		boxShadow: {
  			component: '0px 5px 10px 0px rgba(0, 0, 0, 0.08)',
  			otpSlot: '0px 4px 4px 0px rgba(0, 0, 0, 0.25);'
  		},
  		flex: {
  			component: '1 0% 0%'
  		},
  		fontFamily: {
  			poppins: 'Poppins',
  			inter: 'Inter'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: ["tailwindcss-animate"],
}
