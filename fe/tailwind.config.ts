import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
    },
  },
  plugins: [],
}
export default config
