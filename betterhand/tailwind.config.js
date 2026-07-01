export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337' },
        ink: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b' },
        emerald: { 50: '#ecfdf5', 100: '#d1fae5', 400: '#34d399', 500: '#10b981', 600: '#059669' },
        amber: { 50: '#fffbeb', 100: '#fef3c7', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
        sky: { 50: '#f0f9ff', 100: '#e0f2fe', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7' },
        surface: { 50: '#ffffff', 100: '#fafafa', 200: '#f4f4f5', 300: '#e4e4e7', 400: '#d4d4d8', 500: '#a1a1aa', 600: '#71717a', 700: '#52525b', 800: '#3f3f46', 900: '#18181b' },
        accent: { 500: '#8b5cf6', 600: '#7c3aed' },
      },
      fontFamily: { display: ['"Inter"', '"Fraunces"', 'serif'], body: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'] },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem', '5xl': '3rem' },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 40px rgba(225, 29, 72, 0.3)',
        'soft': '0 4px 24px rgba(0, 0, 0, 0.04)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
      },
      animation: {
        'fade-up': 'fadeUp .6s cubic-bezier(.16,1,.3,1) both',
        'fade-in': 'fadeIn .4s ease both',
        'scale-in': 'scaleIn .35s cubic-bezier(.16,1,.3,1) both',
        'slide-up': 'slideUp .7s cubic-bezier(.16,1,.3,1) both',
        'float': 'float 7s ease-in-out infinite',
        'heartbeat': 'heartbeat 2.5s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(18px)' }, to: { opacity: 1, transform: 'none' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn: { from: { opacity: 0, transform: 'scale(.93)' }, to: { opacity: 1, transform: 'none' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(32px)' }, to: { opacity: 1, transform: 'none' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        heartbeat: { '0%, 100%': { transform: 'scale(1)' }, '12%': { transform: 'scale(1.15)' }, '24%': { transform: 'scale(1)' }, '36%': { transform: 'scale(1.1)' }, '50%': { transform: 'scale(1)' } },
      },
    }
  },
  plugins: []
}
