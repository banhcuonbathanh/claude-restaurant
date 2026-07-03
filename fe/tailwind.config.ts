import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:    'var(--color-primary)',
        background: 'var(--color-background)',
        card:       'var(--color-card)',
        success:    'var(--color-success)',
        warning:    'var(--color-warning)',
        urgent:     'var(--color-urgent)',
        foreground: 'var(--color-foreground)',
        border:     'var(--color-border)',
        muted:      'var(--color-muted)',
        'muted-fg': 'var(--color-muted-fg)',
        ring:       'var(--color-primary)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 2px)',
        sm:  'calc(var(--radius) - 4px)',
        xl:  'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      keyframes: {
        // Soft "breathing" hint — gently scales the selected filling pill to draw attention
        'soft-hint': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.03)' },
        },
        // New-order notice — banner drops in from above the viewport
        'slide-down': {
          from: { transform: 'translateY(-120%)', opacity: '0' },
          to:   { transform: 'translateY(0)',     opacity: '1' },
        },
      },
      animation: {
        'soft-hint':  'soft-hint 3.8s ease-in-out infinite',
        'slide-down': 'slide-down 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
export default config
