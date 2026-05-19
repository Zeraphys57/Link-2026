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
        // Earthy underground palette — warm stone tones replace neutral gray
        gray: {
          50:  '#f4f1eb',
          100: '#e9e5dd',
          200: '#d6d1c8',
          300: '#b9b4aa',
          400: '#918c80',
          500: '#635e55',
          600: '#45413a',
          700: '#2e2a25',
          800: '#1f1c18',
          900: '#161411',
          950: '#0c0a07',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
