import { Link } from 'react-router-dom'
import Logo from '../components/common/Logo'
import { Droplets, MapPin, MessageCircle, Users, Award, Calendar, ArrowRight, CheckCircle, Heart, Shield, Zap, Clock, Building2, Droplet, Landmark, HeartPulse } from 'lucide-react'

const delay = (i) => ({ animationDelay:`${i*100}ms` })

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#faf8ff] overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-surface-200/50 px-6 lg:px-16 py-3.5 flex items-center justify-between">
        <Logo/>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm font-display">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started <ArrowRight size={14}/></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 lg:px-16 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-500/[.06] blur-[100px] animate-float"/>
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-brand-400/[.05] blur-[80px] animate-float" style={{animationDelay:'2s'}}/>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03]"
            style={{backgroundImage:'radial-gradient(circle,rgba(99,102,241,.3) 1px,transparent 1px)',backgroundSize:'32px 32px'}}/>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-sm font-display font-medium mb-8 animate-fade-up">
            <Heart size={14} className="animate-pulse-soft text-brand-500"/> Real-time Blood Donation Platform
          </div>

          <h1 className="font-display text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 animate-slide-up" style={delay(1)}>
            Every Second<br/>
            <span className="bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 bg-clip-text text-transparent animate-gradient bg-[length:200%]">
              Saves A Life
            </span>
          </h1>

          <p className="text-surface-500 font-body text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={delay(2)}>
            BetterHand connects hospitals with blood donors in real-time.
            GPS matching, live tracking, instant chat — saving lives faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16 animate-slide-up" style={delay(3)}>
            <Link to="/register" className="btn-primary text-base py-3.5 px-8 shadow-glow">
              <Droplets size={18}/> Join as Donor
            </Link>
            <Link to="/register" className="btn-secondary text-base py-3.5 px-8">
              Register Hospital <ArrowRight size={16}/>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { val:'98%', label:'Success Rate', icon:CheckCircle, color:'text-emerald-500' },
              { val:'12m', label:'Avg Response',  icon:Clock,       color:'text-brand-500' },
              { val:'3×',  label:'More Donors',   icon:Users,       color:'text-amber-500' },
              { val:'24/7',label:'Always Active',  icon:Zap,        color:'text-brand-500' },
            ].map((s,i) => (
              <div key={s.label} className="card p-4 text-center hover:scale-105 transition-transform animate-fade-up" style={delay(4+i)}>
                <s.icon size={18} className={`${s.color} mx-auto mb-2`}/>
                <p className="text-2xl font-display font-extrabold text-surface-900">{s.val}</p>
                <p className="text-xs text-surface-400 font-body">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emotional image strip */}
        <div className="relative max-w-5xl mx-auto mt-20 animate-fade-up" style={{animationDelay:'800ms'}}>
          <div className="grid grid-cols-3 gap-4 h-48 lg:h-64">
            <div className="rounded-3xl overflow-hidden shadow-soft">
              <img src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600&q=80" alt="Blood donation" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"/>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-soft mt-6">
              <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80" alt="Helping hands" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"/>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-soft">
              <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80" alt="Care" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"/>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 lg:px-16 py-20 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="badge badge-brand mb-3">How It Works</span>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-surface-900 mt-3">
              Request to donation in <span className="text-brand-600">under 12 minutes</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { num:'01', icon:Droplets,      title:'Request Blood',     desc:'Hospital creates urgent blood request with patient details.',     color:'from-brand-500 to-brand-600' },
              { num:'02', icon:Users,          title:'Donors Notified',    desc:'All nearby eligible donors receive instant notification.',       color:'from-amber-500 to-amber-600' },
              { num:'03', icon:MapPin,         title:'Live Tracking',     desc:'Hospital confirms top 3 donors and tracks on live GPS map.',     color:'from-emerald-500 to-emerald-600' },
              { num:'04', icon:MessageCircle,  title:'Chat & Complete',    desc:'Real-time chat, arrival confirmation, donation recording.',      color:'from-rose-500 to-rose-600' },
            ].map((s,i) => (
              <div key={s.num} className="card p-6 group hover:scale-105 transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <s.icon size={22} className="text-white"/>
                </div>
                <span className="text-[10px] font-display font-bold text-surface-300 uppercase tracking-widest">Step {s.num}</span>
                <h3 className="font-display font-bold text-surface-900 mt-1 mb-2">{s.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed font-body">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="badge badge-green mb-3">Features</span>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-surface-900 mt-3">
              Everything you need to <span className="text-emerald-600">save lives</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon:Droplets,      title:'Instant Matching',    desc:'GPS-based matching finds eligible donors by blood group and distance instantly.',         bg:'bg-brand-50',  border:'border-brand-200',  iconColor:'text-brand-600' },
              { icon:MapPin,        title:'Live GPS Tracking',   desc:'Track confirmed donors on interactive map with real-time location updates every 10s.',    bg:'bg-emerald-50', border:'border-emerald-200',iconColor:'text-emerald-600' },
              { icon:MessageCircle, title:'Real-time Chat',      desc:'Instant chat between hospital and donor. One-tap call or WhatsApp integration.',          bg:'bg-sky-50',     border:'border-sky-200',    iconColor:'text-sky-600' },
              { icon:Users,         title:'Ward Members',        desc:'Local government ward coordinators mobilize community donors for faster response.',       bg:'bg-amber-50',   border:'border-amber-200',  iconColor:'text-amber-600' },
              { icon:Award,         title:'Badges & Ratings',    desc:'Donors earn recognition — First Drop, Lifesaver, Hero, Legend badges for milestones.',    bg:'bg-rose-50',    border:'border-rose-200',   iconColor:'text-rose-600' },
              { icon:Calendar,      title:'Blood Camps',         desc:'Schedule community donation drives. Donors pre-register. Track capacity in real-time.',   bg:'bg-purple-50',  border:'border-purple-200', iconColor:'text-purple-600' },
            ].map(f => (
              <div key={f.title} className={`rounded-2xl p-6 ${f.bg} ${f.border} border hover:-translate-y-1 hover:shadow-md transition-all duration-300 group`}>
                <div className={`w-11 h-11 rounded-xl ${f.bg} ${f.border} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={20} className={f.iconColor}/>
                </div>
                <h3 className="font-display font-bold text-surface-900 mb-2">{f.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed font-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Roles */}
      <section className="px-6 lg:px-16 py-20 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-surface-900">Built for <span className="text-brand-600">three roles</span></h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[
              { icon:Building2, role:'Hospital', gradient:'from-brand-600 to-brand-700', items:['Create blood requests','View top 3 donors by ETA','Live GPS tracking on map','Real-time chat with donors','Analytics dashboard','Blood camp management'] },
              { icon:Droplet, role:'Donor', gradient:'from-brand-500 to-brand-600', items:['Instant notifications','Accept with one tap','GPS navigation to hospital','Earn badges & ratings','Donation history','Register for blood camps'] },
              { icon:Landmark, role:'Ward Member', gradient:'from-ink-700 to-ink-900', items:['Blood alerts in your ward','Top 3 local donors list','Call/WhatsApp donors','Broadcast to ward','Contact bystanders','Ward donor directory'] },
            ].map(r => (
              <div key={r.role} className="card p-6 group hover:scale-[1.02] transition-all duration-300">
                <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br ${r.gradient} text-white font-body font-bold text-sm mb-5 shadow-md`}>
                  <r.icon size={16}/> {r.role}
                </div>
                <ul className="space-y-2.5 mb-6">
                  {r.items.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-surface-500 font-body">
                      <CheckCircle size={15} className="text-emerald-500 mt-0.5 shrink-0"/>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="btn-primary w-full text-xs py-2.5">Register as {r.role}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-16 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-8 shadow-glow animate-float">
            <Droplets size={36} className="text-white"/>
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-extrabold text-surface-900 mb-4">Ready to save lives?</h2>
          <p className="text-surface-400 text-lg font-body mb-8">Every registration could save someone today.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary text-base py-3.5 px-10 shadow-glow">Get Started</Link>
            <Link to="/login" className="btn-secondary text-base py-3.5 px-10">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200/60 px-6 lg:px-16 py-8 bg-white/40">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm"/>
          <div className="flex gap-6 text-xs text-surface-400 font-body">
            <Link to="/privacy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-brand-600 transition-colors">Terms & Conditions</Link>
            <Link to="/login" className="hover:text-brand-600 transition-colors">Sign In</Link>
          </div>
          <p className="text-xs text-surface-300 font-body">© 2024 BetterHand. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
