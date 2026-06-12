/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand:   { 50:'#f5f3ff',100:'#ede9fe',200:'#ddd6fe',300:'#c4b5fd',400:'#a78bfa',500:'#8b5cf6',600:'#7c3aed',700:'#6d28d9',800:'#5b21b6',900:'#4c1d95' },
        accent:  { 50:'#ecfdf5',100:'#d1fae5',400:'#34d399',500:'#10b981',600:'#059669' },
        red:     { 50:'#fef2f2',100:'#fee2e2',400:'#f87171',500:'#ef4444',600:'#dc2626',700:'#b91c1c' },
        surface: { 50:'#fafafe',100:'#f4f3f9',200:'#e9e7f0',300:'#d4d1de',400:'#9e99ad',500:'#6b6580',600:'#4a4560',700:'#353148',800:'#1f1c2e',900:'#13111f' },
      },
      fontFamily: { sans: ['"Inter"','system-ui','sans-serif'] },
      boxShadow: {
        'card':'0 2px 8px rgba(124,58,237,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'md':'0 4px 12px rgba(124,58,237,0.1)',
        'lg':'0 8px 24px rgba(124,58,237,0.12)',
        'glow':'0 0 20px rgba(124,58,237,0.15)',
      },
      animation: {
        'fade-up':'fadeUp 0.35s ease both',
        'fade-in':'fadeIn 0.25s ease both',
        'scale-in':'scaleIn 0.25s ease both',
      },
      keyframes: {
        fadeUp:{from:{opacity:0,transform:'translateY(10px)'},to:{opacity:1,transform:'translateY(0)'}},
        fadeIn:{from:{opacity:0},to:{opacity:1}},
        scaleIn:{from:{opacity:0,transform:'scale(0.95)'},to:{opacity:1,transform:'scale(1)'}},
      },
    }
  },
  plugins: []
}
