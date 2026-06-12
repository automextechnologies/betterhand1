export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand:{50:'#fff1f2',100:'#ffe4e6',200:'#fecdd3',300:'#fda4af',400:'#fb7185',500:'#f43f5e',600:'#e11d48',700:'#be123c',800:'#9f1239',900:'#881337'},
        ink:{50:'#f8f7f6',100:'#efedeb',200:'#ddd9d5',300:'#c0b9b2',400:'#9b918a',500:'#7a6f68',600:'#5f554f',700:'#4a423d',800:'#332e2b',900:'#1f1b19'},
        emerald:{50:'#ecfdf5',100:'#d1fae5',400:'#34d399',500:'#10b981',600:'#059669'},
        amber:{50:'#fffbeb',100:'#fef3c7',400:'#fbbf24',500:'#f59e0b',600:'#d97706'},
        sky:{50:'#f0f9ff',100:'#e0f2fe',400:'#38bdf8',500:'#0ea5e9',600:'#0284c7'},
        surface:{50:'#fdf8f6',100:'#faf0eb',200:'#f0e6e0',300:'#ddd1c9',400:'#a89c93',500:'#7a6f68',600:'#5f554f',700:'#443d39',800:'#2a2522',900:'#1a1614'},
      },
      fontFamily:{display:['"Fraunces"','Georgia','serif'],body:['"Plus Jakarta Sans"','sans-serif']},
      borderRadius:{'2xl':'1rem','3xl':'1.5rem','4xl':'2rem'},
      boxShadow:{
        'card':'0 2px 16px rgba(225,29,72,0.05)',
        'card-hover':'0 12px 40px rgba(225,29,72,0.1)',
        'glow':'0 0 40px rgba(225,29,72,0.18)',
        'soft':'0 4px 24px rgba(31,27,25,0.06)',
      },
      animation:{
        'fade-up':'fadeUp .6s cubic-bezier(.16,1,.3,1) both',
        'fade-in':'fadeIn .4s ease both',
        'scale-in':'scaleIn .35s cubic-bezier(.16,1,.3,1) both',
        'slide-up':'slideUp .7s cubic-bezier(.16,1,.3,1) both',
        'float':'float 7s ease-in-out infinite',
        'heartbeat':'heartbeat 2.5s ease-in-out infinite',
      },
      keyframes:{
        fadeUp:{from:{opacity:0,transform:'translateY(18px)'},to:{opacity:1,transform:'none'}},
        fadeIn:{from:{opacity:0},to:{opacity:1}},
        scaleIn:{from:{opacity:0,transform:'scale(.93)'},to:{opacity:1,transform:'none'}},
        slideUp:{from:{opacity:0,transform:'translateY(32px)'},to:{opacity:1,transform:'none'}},
        float:{'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-14px)'}},
        heartbeat:{'0%,100%':{transform:'scale(1)'},'12%':{transform:'scale(1.15)'},'24%':{transform:'scale(1)'},'36%':{transform:'scale(1.1)'},'50%':{transform:'scale(1)'}},
      },
    }
  },
  plugins:[]
}
