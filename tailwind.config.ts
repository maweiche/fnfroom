import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				dark: 'hsl(var(--primary-dark))',
  				light: 'hsl(var(--primary-light))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))',
  				gold: 'hsl(var(--card-gold))',
  				rust: 'hsl(var(--card-rust))',
  				forest: 'hsl(var(--card-forest))',
  				mint: 'hsl(var(--card-mint))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			basketball: 'hsl(var(--basketball))',
  			football: 'hsl(var(--football))',
  			lacrosse: 'hsl(var(--lacrosse))',
  			success: 'hsl(var(--success))',
  			error: 'hsl(var(--error))',
  			warning: 'hsl(var(--warning))',
  			info: 'hsl(var(--info))',
  			'spotlight-gold': 'hsl(var(--spotlight-gold))',
  			'warm-cream': 'hsl(var(--warm-cream))',
  			'film-gray': 'hsl(var(--film-gray))',
  			'charcoal-black': 'hsl(var(--charcoal-black))',
  			pearl: 'hsl(var(--pearl))',
  			'cloud-gray': 'hsl(var(--cloud-gray))',
  			'navy-header': 'hsl(var(--navy-header))',
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-inter)',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'var(--font-space-grotesk)',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-jetbrains-mono)',
  				'Courier New',
  				'monospace'
  			]
  		},
  		spacing: {
  			xs: '4px',
  			sm: '8px',
  			md: '12px',
  			base: '16px',
  			lg: '24px',
  			xl: '32px',
  			'2xl': '48px',
  			'3xl': '64px'
  		},
  		boxShadow: {
  			sm: '0 1px 2px 0 rgba(26, 22, 18, 0.08)',
  			md: '0 4px 8px -2px rgba(26, 22, 18, 0.12), 0 2px 4px -1px rgba(26, 22, 18, 0.08)',
  			lg: '0 10px 20px -5px rgba(26, 22, 18, 0.15), 0 4px 8px -2px rgba(26, 22, 18, 0.1)',
  			card: '0 2px 8px -2px rgba(26, 22, 18, 0.12), 0 1px 4px -1px rgba(26, 22, 18, 0.08)',
  			'card-hover': '0 8px 16px -4px rgba(26, 22, 18, 0.16), 0 4px 8px -2px rgba(26, 22, 18, 0.12)',
  			'glow-spotlight': '0 0 24px rgba(212, 165, 116, 0.25), 0 0 48px rgba(212, 165, 116, 0.1)',
  			'glow-hero': '0 8px 32px rgba(212, 165, 116, 0.3), 0 0 64px rgba(212, 165, 116, 0.15)'
  		},
  		typography: {
  			xs: '11px',
  			sm: '12px',
  			base: '14px',
  			lg: '16px',
  			xl: '18px',
  			'2xl': '24px',
  			'3xl': '32px',
  			'4xl': '48px',
  			'5xl': '64px'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.2s ease-in-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'scale-in': 'scaleIn 0.15s ease-out',
  			'marquee': 'marquee 40s linear infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			marquee: {
  				'0%': {
  					transform: 'translateX(0)'
  				},
  				'100%': {
  					transform: 'translateX(-50%)'
  				}
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
