import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import Logo from '../components/common/Logo'
import { Droplets, MapPin, MessageCircle, Users, Award, Calendar, ArrowRight, CheckCircle, Heart, Shield, Zap, Clock, Building2, Droplet, Landmark, Activity, ChevronRight, Play } from 'lucide-react'

// Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 70, damping: 15 } }
}
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 50 } }
}

export default function Landing() {
  const { scrollY } = useScroll()
  const yHero = useTransform(scrollY, [0, 1000], [0, 200])
  const opacityHero = useTransform(scrollY, [0, 800], [1, 0])

  return (
    <div className="min-h-screen bg-surface-50 overflow-x-hidden selection:bg-brand-200 selection:text-brand-900 font-body">
      
      {/* Animated Abstract Mesh Background */}
      <div className="fixed inset-0 mesh-bg opacity-80 pointer-events-none -z-10 animate-pulse-slow" />
      
      {/* Decorative Glow Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-400/20 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-600/15 blur-[120px] pointer-events-none -z-10" />

      {/* Nav */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed w-full top-0 z-50 glass border-b border-white/40 px-6 lg:px-12 py-4 flex items-center justify-between"
      >
        <Logo />
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-semibold text-ink-600 hover:text-ink-900 transition-colors">Sign In</Link>
          <Link to="/register" className="btn-primary group">
            Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-40 pb-32 max-w-[90rem] mx-auto min-h-[90vh] flex flex-col lg:flex-row items-center gap-16">
        
        {/* Content */}
        <motion.div 
          className="flex-1 relative z-10 lg:pr-12 text-center lg:text-left"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          style={{ y: yHero, opacity: opacityHero }}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl glass-dark border border-white/10 text-white text-xs font-semibold tracking-wide uppercase mb-8 shadow-2xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
            </span>
            Live Blood Donation Network
          </motion.div>

          <motion.h1 variants={fadeUp} className="font-display text-6xl lg:text-[5.5rem] font-black leading-[1.05] tracking-tight mb-8 text-ink-900">
            Every Second<br/>
            <span className="bg-gradient-to-r from-brand-600 via-rose-500 to-accent-600 bg-clip-text text-transparent animate-gradient">
              Saves A Life
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-ink-600 text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium">
            BetterHand connects hospitals with eligible blood donors instantly.
            GPS matching, live tracking, and real-time chat — an ultra-modern ecosystem revolutionizing how we save lives.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-16">
            <Link to="/register" className="btn-primary py-4 px-8 text-base">
              <Droplets size={20} className="group-hover:scale-110 transition-transform" /> Join as Donor
            </Link>
            <Link to="/register" className="btn-secondary py-4 px-8 text-base bg-white/50 hover:bg-white">
              Register Hospital
            </Link>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-6 max-w-md mx-auto lg:mx-0">
            {[
              { val: '98%', label: 'Match Rate', icon: Activity, color: 'text-brand-600', bg: 'bg-brand-50' },
              { val: '<12m', label: 'Avg Response', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4 group">
                <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center shadow-inner-light group-hover:scale-110 transition-transform duration-300`}>
                  <s.icon size={26} className={s.color} />
                </div>
                <div className="text-left">
                  <p className="text-3xl font-display font-black text-ink-900 leading-none tracking-tight">{s.val}</p>
                  <p className="text-sm text-ink-500 font-semibold mt-1">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero Visuals */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, type: 'spring', bounce: 0.3 }}
          className="flex-1 relative w-full max-w-2xl mx-auto hidden lg:block"
        >
          {/* Main 3D Generated Image */}
          <div className="relative z-10 w-full aspect-square rounded-[3rem] p-4 glass-dark shadow-2xl overflow-visible hover:-translate-y-4 transition-transform duration-700 ease-out">
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative bg-ink-900 border border-white/10">
              <img 
                src="/hero-3d.png" 
                alt="3D Blood Drop Network" 
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000 ease-out opacity-90 mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
              
              {/* Overlay pulse */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-32 h-32 rounded-full border border-brand-500/30 animate-ping absolute"></div>
                 <div className="w-48 h-48 rounded-full border border-brand-500/20 animate-ping absolute" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <button className="w-20 h-20 rounded-full glass flex items-center justify-center text-white hover:scale-110 hover:bg-white hover:text-brand-600 transition-all duration-300 shadow-glow">
                <Play size={32} className="ml-2" />
              </button>
            </div>
          </div>

          {/* Floating UI Card 1 (Match Found) */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-16 top-32 z-30 glass p-5 pr-8 rounded-[1.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] flex items-center gap-5 backdrop-blur-xl"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-inner">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Match
              </p>
              <p className="text-base font-display font-bold text-ink-900">O- Negative Donor</p>
              <p className="text-sm text-ink-500 font-medium mt-0.5">ETA: 8 mins away</p>
            </div>
          </motion.div>

          {/* Floating UI Card 2 (Location) */}
          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-12 bottom-40 z-30 glass p-5 rounded-[1.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] flex items-center gap-4 backdrop-blur-xl"
          >
             <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center border border-brand-100 shadow-inner">
              <MapPin size={24} className="text-brand-600 animate-bounce" />
            </div>
            <div>
              <p className="text-base font-display font-bold text-ink-900">City Hospital</p>
              <p className="text-sm text-ink-500 font-medium mt-0.5">Requesting Urgent Blood</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="px-6 lg:px-12 py-32 bg-white relative rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.03)] z-20">
        <div className="max-w-[90rem] mx-auto">
          <motion.div 
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-24"
          >
            <span className="badge badge-brand mb-6 px-4 py-2 text-sm uppercase tracking-widest border border-brand-200">How It Works</span>
            <h2 className="font-display text-5xl lg:text-6xl font-black text-ink-900 mt-3 tracking-tight">
              Request to donation in <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600">under 12 mins</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', icon: Droplets, title: 'Request Blood', desc: 'Hospital creates an urgent request with patient details and exact blood type.', color: 'from-brand-500 to-brand-600', shadow: 'shadow-brand-500/20' },
              { num: '02', icon: Users, title: 'Donors Notified', desc: 'All nearby eligible donors receive an instant push notification.', color: 'from-accent-500 to-accent-600', shadow: 'shadow-accent-500/20' },
              { num: '03', icon: MapPin, title: 'Live Tracking', desc: 'Hospital confirms top 3 donors and tracks them on a live GPS map.', color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20' },
              { num: '04', icon: MessageCircle, title: 'Chat & Save', desc: 'Real-time chat, seamless arrival confirmation, and donation logging.', color: 'from-sky-400 to-sky-600', shadow: 'shadow-sky-500/20' },
            ].map((s, i) => (
              <motion.div 
                key={s.num} 
                initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="relative p-10 bg-surface-50 rounded-[2.5rem] border border-ink-100 group hover:-translate-y-3 transition-all duration-500 hover:bg-white hover:shadow-card-hover overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-ink-100 to-transparent opacity-50 rounded-bl-[4rem] -z-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-8 shadow-xl ${s.shadow} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                  <s.icon size={28} className="text-white" />
                </div>
                <span className="absolute top-8 right-8 text-5xl font-display font-black text-ink-100/50 group-hover:text-ink-200 transition-colors duration-500">{s.num}</span>
                <h3 className="font-display text-2xl font-bold text-ink-900 mb-4">{s.title}</h3>
                <p className="text-ink-500 text-base leading-relaxed font-medium">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="px-6 lg:px-12 py-32 bg-ink-900 relative overflow-hidden">
        {/* Dark Mode Glows */}
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[140px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent-600/10 rounded-full blur-[160px] -z-10 pointer-events-none" />
        
        <div className="max-w-[90rem] mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20 text-white">
            <span className="badge bg-white/10 text-white border-white/20 mb-6 px-4 py-2 text-sm uppercase tracking-widest">Premium Features</span>
            <h2 className="font-display text-5xl lg:text-6xl font-black mt-3 tracking-tight">
              Everything you need to <span className="text-brand-400">save lives.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            {[
              { icon: MapPin, title: 'Live GPS Tracking', desc: 'Track confirmed donors on an interactive map with real-time location updates every 10s.', span: 'md:col-span-2', bg: 'bg-gradient-to-br from-white/10 to-white/5' },
              { icon: Droplets, title: 'Instant Matching', desc: 'GPS-based matching finds eligible donors instantly.', span: 'md:col-span-1', bg: 'bg-white/5' },
              { icon: MessageCircle, title: 'Real-time Chat', desc: 'Instant chat between hospital and donor. One-tap call or WhatsApp integration.', span: 'md:col-span-1', bg: 'bg-white/5' },
              { icon: Award, title: 'Badges & Ratings', desc: 'Donors earn recognition — First Drop, Lifesaver, Hero, Legend badges for milestones.', span: 'md:col-span-2', bg: 'bg-gradient-to-tr from-white/10 to-white/5' },
            ].map((f, i) => (
              <motion.div 
                key={f.title} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-[2rem] p-10 ${f.bg} border border-white/10 backdrop-blur-md hover:-translate-y-2 hover:bg-white/10 transition-all duration-300 group cursor-default flex flex-col justify-end ${f.span}`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-500 transition-all duration-300 text-white`}>
                  <f.icon size={26} />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-ink-200 text-base leading-relaxed font-medium max-w-lg">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 lg:px-12 py-40 text-center overflow-hidden bg-surface-50">
        <div className="absolute inset-0 mesh-bg opacity-50 -z-10" />
        <div className="max-w-4xl mx-auto glass p-16 lg:p-24 rounded-[4rem] shadow-card-hover border border-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-100/40 via-transparent to-accent-100/40 -z-10" />
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} viewport={{ once: true }}
            className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-10 shadow-glow animate-float rotate-3 hover:rotate-0 transition-transform duration-300"
          >
            <Droplets size={52} className="text-white" />
          </motion.div>

          <h2 className="font-display text-5xl lg:text-7xl font-black text-ink-900 mb-8 tracking-tight leading-tight">Ready to <span className="text-brand-600">save lives?</span></h2>
          <p className="text-ink-600 text-xl lg:text-2xl font-medium mb-14 max-w-2xl mx-auto leading-relaxed">Join thousands of donors and hospitals working together to ensure no life is lost due to blood shortage.</p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/register" className="btn-primary text-lg py-5 px-14 rounded-2xl shadow-[0_0_40px_rgba(225,29,72,0.4)] hover:shadow-[0_0_60px_rgba(225,29,72,0.6)]">
              Get Started Now
            </Link>
            <Link to="/login" className="btn-secondary text-lg py-5 px-14 rounded-2xl">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-200 px-6 lg:px-12 py-16 bg-white relative z-10">
        <div className="max-w-[90rem] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <Logo size="lg" />
          <div className="flex gap-10 text-base text-ink-500 font-semibold">
            <Link to="/privacy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-brand-600 transition-colors">Terms & Conditions</Link>
            <Link to="/login" className="hover:text-brand-600 transition-colors">Sign In</Link>
          </div>
          <p className="text-sm text-ink-400 font-medium">© 2026 BetterHand. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
