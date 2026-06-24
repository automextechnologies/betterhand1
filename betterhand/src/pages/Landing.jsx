import { Link } from 'react-router-dom'
import Logo from '../components/common/Logo'
import { Droplets, MapPin, MessageCircle, Users, Award, Calendar, ArrowRight, CheckCircle, Heart, Shield, Zap, Clock, Building2, Droplet, Landmark, Activity, ChevronRight } from 'lucide-react'

const delay = (i) => ({ animationDelay: `${i * 100}ms` })

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-50 overflow-x-hidden selection:bg-brand-200 selection:text-brand-900">
      
      {/* Dynamic Mesh Background */}
      <div className="absolute inset-0 mesh-bg opacity-70 pointer-events-none -z-10" />

      {/* Nav */}
      <nav className="fixed w-full top-0 z-50 glass border-b-0 px-6 lg:px-16 py-4 flex items-center justify-between transition-all duration-300">
        <Logo />
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-display font-medium text-ink-600 hover:text-brand-600 transition-colors">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm shadow-glow group">
            Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Modern Hero Section */}
      <section className="relative px-6 lg:px-16 pt-32 pb-24 lg:pt-40 lg:pb-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* Hero Content */}
        <div className="flex-1 relative z-10 lg:pr-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-brand-200 text-brand-600 text-sm font-display font-semibold mb-8 animate-fade-up shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
            </span>
            Live Blood Donation Network
          </div>

          <h1 className="font-display text-5xl lg:text-7xl xl:text-[5rem] font-bold leading-[1.05] tracking-tight mb-6 animate-slide-up" style={delay(1)}>
            Every Second<br/>
            <span className="bg-gradient-to-r from-brand-600 via-rose-500 to-brand-500 bg-clip-text text-transparent animate-gradient bg-[length:200%]">
              Saves A Life
            </span>
          </h1>

          <p className="text-ink-500 font-body text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed animate-slide-up" style={delay(2)}>
            BetterHand connects hospitals with eligible blood donors instantly.
            GPS matching, live tracking, and real-time chat — revolutionizing how we save lives.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-16 animate-slide-up" style={delay(3)}>
            <Link to="/register" className="btn-primary text-base py-4 px-8 shadow-glow hover:shadow-brand-500/30 group">
              <Droplets size={20} className="group-hover:scale-110 transition-transform" /> Join as Donor
            </Link>
            <Link to="/register" className="btn-secondary text-base py-4 px-8 bg-white/80 backdrop-blur-sm border-ink-200">
              Register Hospital <ChevronRight size={18} />
            </Link>
          </div>

          {/* Mini Stats Grid */}
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto lg:mx-0">
            {[
              { val: '98%', label: 'Match Rate', icon: Activity, color: 'text-brand-500', bg: 'bg-brand-50' },
              { val: '<12m', label: 'Avg Response', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-4 animate-fade-up" style={delay(4 + i)}>
                <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center`}>
                  <s.icon size={24} className={s.color} />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-display font-bold text-ink-900 leading-none">{s.val}</p>
                  <p className="text-sm text-ink-500 font-body mt-1">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visuals (The WOW factor) */}
        <div className="flex-1 relative w-full max-w-xl lg:max-w-none mx-auto animate-fade-in" style={{ animationDelay: '600ms' }}>
          
          {/* Main 3D Generated Image */}
          <div className="relative z-10 w-full aspect-square rounded-[2.5rem] p-4 glass shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 ease-out">
            <div className="w-full h-full rounded-[2rem] overflow-hidden relative bg-white">
              <img 
                src="/hero-3d.png" 
                alt="3D Blood Drop Network" 
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Floating UI Card 1 (Match Found) */}
          <div className="absolute -left-12 top-24 z-20 glass p-4 pr-6 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex items-center gap-4 animate-float" style={{ animationDelay: '0s' }}>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-0.5">Live Match</p>
              <p className="text-sm font-display font-bold text-ink-900">O- Negative Donor Found</p>
              <p className="text-xs text-brand-600 font-medium">ETA: 8 mins away</p>
            </div>
          </div>

          {/* Floating UI Card 2 (Location) */}
          <div className="absolute -right-8 bottom-32 z-20 glass p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex items-center gap-3 animate-float" style={{ animationDelay: '2s' }}>
             <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
              <MapPin size={20} className="text-brand-600 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-display font-bold text-ink-900">City Hospital</p>
              <p className="text-xs text-ink-500">Requesting Urgent Blood</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 lg:px-16 py-28 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="badge badge-brand mb-4 px-3 py-1.5 text-sm">How It Works</span>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-ink-900 mt-3">
              Request to donation in <span className="text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">under 12 mins</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', icon: Droplets, title: 'Request Blood', desc: 'Hospital creates an urgent request with patient details and exact blood type.', color: 'from-brand-500 to-brand-600', shadow: 'shadow-brand-500/20' },
              { num: '02', icon: Users, title: 'Donors Notified', desc: 'All nearby eligible donors receive an instant push notification.', color: 'from-amber-400 to-amber-500', shadow: 'shadow-amber-500/20' },
              { num: '03', icon: MapPin, title: 'Live Tracking', desc: 'Hospital confirms top 3 donors and tracks them on a live GPS map.', color: 'from-emerald-400 to-emerald-500', shadow: 'shadow-emerald-500/20' },
              { num: '04', icon: MessageCircle, title: 'Chat & Save', desc: 'Real-time chat, seamless arrival confirmation, and donation logging.', color: 'from-sky-400 to-sky-500', shadow: 'shadow-sky-500/20' },
            ].map((s, i) => (
              <div key={s.num} className="relative p-8 bg-surface-50 rounded-[2rem] border border-ink-100 group hover:-translate-y-2 transition-all duration-300 hover:bg-white hover:shadow-card-hover">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-6 shadow-lg ${s.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <s.icon size={26} className="text-white" />
                </div>
                <span className="absolute top-8 right-8 text-4xl font-display font-black text-ink-100 group-hover:text-ink-200 transition-colors">{s.num}</span>
                <h3 className="font-display text-xl font-bold text-ink-900 mb-3">{s.title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed font-body">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-16 py-28 bg-surface-50 relative overflow-hidden">
        {/* Background glow for features */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-200/20 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="badge badge-green mb-4 px-3 py-1.5 text-sm">Features</span>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-ink-900 mt-3">
              Everything you need to <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">save lives</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Droplets, title: 'Instant Matching', desc: 'GPS-based matching finds eligible donors by blood group and distance instantly.', bg: 'bg-white', border: 'border-ink-200', iconBg: 'bg-brand-50', iconColor: 'text-brand-600' },
              { icon: MapPin, title: 'Live GPS Tracking', desc: 'Track confirmed donors on an interactive map with real-time location updates every 10s.', bg: 'bg-white', border: 'border-ink-200', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
              { icon: MessageCircle, title: 'Real-time Chat', desc: 'Instant chat between hospital and donor. One-tap call or WhatsApp integration.', bg: 'bg-white', border: 'border-ink-200', iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
              { icon: Users, title: 'Ward Members', desc: 'Local government ward coordinators mobilize community donors for faster response.', bg: 'bg-white', border: 'border-ink-200', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
              { icon: Award, title: 'Badges & Ratings', desc: 'Donors earn recognition — First Drop, Lifesaver, Hero, Legend badges for milestones.', bg: 'bg-white', border: 'border-ink-200', iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
              { icon: Calendar, title: 'Blood Camps', desc: 'Schedule community donation drives. Donors pre-register. Track capacity in real-time.', bg: 'bg-white', border: 'border-ink-200', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
            ].map(f => (
              <div key={f.title} className={`rounded-[2rem] p-8 ${f.bg} ${f.border} border hover:-translate-y-1.5 shadow-soft hover:shadow-card-hover transition-all duration-300 group cursor-default`}>
                <div className={`w-14 h-14 rounded-2xl ${f.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon size={26} className={f.iconColor} />
                </div>
                <h3 className="font-display text-xl font-bold text-ink-900 mb-3">{f.title}</h3>
                <p className="text-ink-500 text-[15px] leading-relaxed font-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Roles */}
      <section className="px-6 lg:px-16 py-32 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-ink-900">Built for <span className="text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">three roles</span></h2>
            <p className="text-ink-500 mt-6 text-lg max-w-2xl mx-auto">A unified ecosystem connecting every critical touchpoint in the blood donation lifecycle.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { icon: Building2, role: 'Hospital', gradient: 'from-brand-600 to-brand-700', items: ['Create blood requests', 'View top 3 donors by ETA', 'Live GPS tracking on map', 'Real-time chat with donors', 'Analytics dashboard', 'Blood camp management'] },
              { icon: Droplet, role: 'Donor', gradient: 'from-brand-400 to-brand-500', items: ['Instant notifications', 'Accept with one tap', 'GPS navigation to hospital', 'Earn badges & ratings', 'Donation history', 'Register for blood camps'] },
              { icon: Landmark, role: 'Ward Member', gradient: 'from-ink-800 to-ink-900', items: ['Blood alerts in your ward', 'Top 3 local donors list', 'Call/WhatsApp donors', 'Broadcast to ward', 'Contact bystanders', 'Ward donor directory'] },
            ].map(r => (
              <div key={r.role} className="card p-8 group hover:-translate-y-2 hover:shadow-card-hover transition-all duration-300 rounded-[2rem]">
                <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br ${r.gradient} text-white font-body font-bold text-sm mb-8 shadow-md`}>
                  <r.icon size={18} /> {r.role}
                </div>
                <ul className="space-y-4 mb-10">
                  {r.items.map(item => (
                    <li key={item} className="flex items-start gap-3 text-[15px] text-ink-600 font-body">
                      <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="btn-secondary w-full text-sm py-3.5 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-300">Register as {r.role}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 lg:px-16 py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-ink-900 -z-20" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1600&q=80')] bg-cover bg-center opacity-10 -z-10 mix-blend-overlay" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-gradient-to-b from-brand-600/20 to-transparent blur-3xl -z-10" />

        <div className="max-w-3xl mx-auto glass-dark p-12 lg:p-20 rounded-[3rem]">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-10 shadow-glow animate-float">
            <Droplets size={44} className="text-white" />
          </div>
          <h2 className="font-display text-4xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">Ready to save lives?</h2>
          <p className="text-ink-200 text-lg lg:text-xl font-body mb-12 max-w-xl mx-auto">Join thousands of donors and hospitals working together to ensure no life is lost due to blood shortage.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg py-4 px-12 shadow-[0_0_40px_rgba(225,29,72,0.4)] hover:shadow-[0_0_60px_rgba(225,29,72,0.6)]">
              Get Started Now
            </Link>
            <Link to="/login" className="btn-secondary text-lg py-4 px-12 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30 hover:text-white">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-200 px-6 lg:px-16 py-12 bg-surface-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" />
          <div className="flex gap-8 text-sm text-ink-500 font-body font-medium">
            <Link to="/privacy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-brand-600 transition-colors">Terms & Conditions</Link>
            <Link to="/login" className="hover:text-brand-600 transition-colors">Sign In</Link>
          </div>
          <p className="text-sm text-ink-400 font-body">© 2026 BetterHand. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
