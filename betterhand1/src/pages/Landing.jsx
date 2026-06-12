import { Link } from 'react-router-dom'
import Logo from '../components/common/Logo'
import { Droplets, MapPin, MessageCircle, Users, Award, Calendar, ArrowRight, CheckCircle } from 'lucide-react'

const STEPS = [
  { icon:Droplets,       title:'Request Blood',     desc:'Hospital creates an urgent blood request with patient details.' },
  { icon:Users,          title:'Donors Notified',    desc:'All nearby eligible donors get instant notification.' },
  { icon:MapPin,         title:'Track Live',         desc:'Hospital tracks confirmed donors on live map.' },
  { icon:MessageCircle,  title:'Chat & Complete',    desc:'Real-time chat, arrival, and donation completion.' },
]

const FEATURES = [
  { icon:Droplets,      title:'Instant Matching',    desc:'Match with nearby donors by blood group and distance automatically.' },
  { icon:MapPin,        title:'Live GPS Tracking',   desc:'Track confirmed donors in real-time on an interactive map.' },
  { icon:MessageCircle, title:'Real-time Chat',      desc:'Chat between hospital and donor with call and WhatsApp buttons.' },
  { icon:Users,         title:'Ward Members',        desc:'Government ward coordinators mobilize community donors locally.' },
  { icon:Award,         title:'Badges & Ratings',    desc:'Donors earn recognition badges based on donation history.' },
  { icon:Calendar,      title:'Blood Camps',         desc:'Schedule community donation drives. Donors register in advance.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-surface-100 px-6 lg:px-12 py-3 flex items-center justify-between">
        <Logo/>
        <div className="flex items-center gap-2">
          <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 lg:px-12 py-20 lg:py-28 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"/>
          Real-time Blood Donation Platform
        </div>
        <h1 className="text-4xl lg:text-6xl font-extrabold text-surface-900 leading-tight mb-5 tracking-tight">
          Every second<br/><span className="text-brand-600">saves a life</span>
        </h1>
        <p className="text-surface-500 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          BetterHand connects hospitals with blood donors in real-time. 
          Track donors live, chat instantly, and save lives faster.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link to="/register" className="btn-primary text-base px-6 py-3">
            <Droplets size={18}/> Join as Donor
          </Link>
          <Link to="/register" className="btn-secondary text-base px-6 py-3">
            Register Hospital <ArrowRight size={16}/>
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[['98%','Success rate'],['12 min','Avg response'],['500+','Active donors'],['24/7','Available']].map(([v,l]) => (
            <div key={l} className="p-4 rounded-xl bg-surface-50 border border-surface-100">
              <p className="text-2xl font-bold text-surface-900">{v}</p>
              <p className="text-xs text-surface-400 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 lg:px-12 py-16 bg-surface-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-surface-900 text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s,i) => (
              <div key={s.title} className="bg-white rounded-xl border border-surface-200 p-5 text-center">
                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3">
                  <s.icon size={20}/>
                </div>
                <p className="text-xs text-brand-600 font-semibold mb-1">Step {i+1}</p>
                <h3 className="font-semibold text-surface-900 text-sm mb-1">{s.title}</h3>
                <p className="text-surface-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-12 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-surface-900 text-center mb-10">Everything you need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-5">
                <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center mb-3">
                  <f.icon size={18}/>
                </div>
                <h3 className="font-semibold text-surface-900 text-sm mb-1">{f.title}</h3>
                <p className="text-surface-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="px-6 lg:px-12 py-16 bg-surface-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-surface-900 text-center mb-10">Built for three roles</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { icon:'🏥', role:'Hospital', color:'bg-blue-50 text-blue-700 border-blue-100',
                items:['Create blood requests','View top 3 donors','Live tracking on map','Chat with donors','Analytics dashboard','Blood camp management'] },
              { icon:'🩸', role:'Donor', color:'bg-red-50 text-red-700 border-red-100',
                items:['Get instant notifications','Accept with one tap','Navigate to hospital','Earn badges & ratings','View donation history','Register for camps'] },
              { icon:'🏛️', role:'Ward Member', color:'bg-green-50 text-green-700 border-green-100',
                items:['Receive blood alerts','Get top 3 local donors','Call/WhatsApp donors','Broadcast to ward','Track alert status','Community coordination'] },
            ].map(r => (
              <div key={r.role} className="card p-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${r.color} mb-4`}>
                  {r.icon} {r.role}
                </div>
                <ul className="space-y-2">
                  {r.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-surface-500">
                      <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0"/>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="btn-primary w-full mt-5 text-xs py-2">
                  Register as {r.role}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-12 py-16 text-center">
        <h2 className="text-2xl font-bold text-surface-900 mb-3">Ready to save lives?</h2>
        <p className="text-surface-400 mb-6">Join BetterHand today.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/register" className="btn-primary px-6 py-3"><Droplets size={16}/> Get Started</Link>
          <Link to="/login" className="btn-secondary px-6 py-3">Sign In <ArrowRight size={14}/></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-100 px-6 lg:px-12 py-6 flex items-center justify-between text-xs text-surface-400">
        <Logo size="sm"/>
        <span>© 2024 BetterHand</span>
      </footer>
    </div>
  )
}
