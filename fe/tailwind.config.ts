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
        // Design tokens — use these classes, never hardcode hex values in components
        primary:    'var(--color-primary)',
        background: 'var(--color-background)',
        card:       'var(--color-card)',
        success:    'var(--color-success)',
        warning:    'var(--color-warning)',
        urgent:     'var(--color-urgent)',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body:    ['Be Vietnam Pro', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
