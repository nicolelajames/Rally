/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rally: {
          purple: '#7F77DD',
          teal: '#1D9E75',
          amber: '#BA7517',
          coral: '#D85A30',
          danger: '#E24B4A',
          bg: '#F8F7F4',
          card: '#FFFFFF',
          text: '#1A1A18',
          muted: '#6B6A64',
          border: 'rgba(0,0,0,0.08)',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
