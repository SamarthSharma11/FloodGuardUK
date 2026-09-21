/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          950: '#070a0f',
          900: '#0d121c',
          850: '#121824',
          800: '#1a2332',
          750: '#243044',
          700: '#30415a',
          600: '#4b5f7d',
          500: '#64748b',
        },
        tactical: {
          cyan: '#0ea5e9',
          teal: '#00d4b2',
          amber: '#f59e0b',
        },
        risk: {
          low: '#10b981',
          moderate: '#eab308',
          high: '#f97316',
          severe: '#f43f5e',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
