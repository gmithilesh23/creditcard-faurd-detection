/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070B14',
          900: '#0B0F19',
          850: '#0F1626',
          800: '#111827',
          750: '#151F32',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
        },
        brand: {
          blue: '#3B82F6',
          cyan: '#06B6D4',
          sky: '#0EA5E9',
          indigo: '#6366F1',
        },
        status: {
          genuine: '#10B981',
          fraud: '#EF4444',
          warning: '#F59E0B',
          review: '#F97316',
          purple: '#A855F7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.3)',
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.3)',
        'glow-red': '0 0 20px -5px rgba(239, 68, 68, 0.3)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}

