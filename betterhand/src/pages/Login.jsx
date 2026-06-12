import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api'
import Logo from '../components/common/Logo'
import Spinner from '../components/common/Spinner'
import { getErrMsg } from '../utils/helpers'
import { Eye, EyeOff, ArrowRight, Building2, Droplet, Landmark, HeartPulse } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = [
  { id:'hospital',    label:'Hospital', icon:Building2, desc:'Manage requests' },
  { id:'donor',       label:'Donor',     icon:Droplet,   desc:'Donate blood' },
  { id:'ward_member', label:'Ward',      icon:Landmark,  desc:'Coordinate' },
]

export default function Login() {
  const [role, setRole]     = useState('hospital')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState:{errors} } = useForm()
  const { login } = useAuthStore()
  const navigate  = useNavigate()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      let res
      if (role === 'ward_member') {
        res = await authApi.loginWard({ email:data.email, password:data.password })
        const u = res.data.user || { id:res.data.member?.id, email:data.email, role:'ward_member', profile:res.data.member }
        if (!u.role) u.role = 'ward_member'
        login(u, res.data.access, res.data.refresh)
        navigate('/ward'); return
      }
      res = await authApi.loginHospital({ email:data.email, password:data.password })
      if (res.data.user?.role !== role) { toast.error(`This is a ${res.data.user?.role} account`); setLoading(false); return }
      login(res.data.user, res.data.access, res.data.refresh)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          p => authApi.updateLocation({ latitude:p.coords.latitude, longitude:p.coords.longitude }).catch(()=>{}), ()=>{}, {timeout:8000})
      }
      navigate(role === 'hospital' ? '/hospital' : '/donor')
    } catch (e) { toast.error(getErrMsg(e)) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — emotional image panel */}
      <div className="hidden lg:flex w-[48%] relative overflow-hidden flex-col justify-between p-12"
        style={{background:'linear-gradient(155deg,#881337 0%,#be123c 45%,#e11d48 100%)'}}>
        <div className="absolute inset-0 opacity-20"
          style={{backgroundImage:'url(https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=1000&q=80)',backgroundSize:'cover',backgroundPosition:'center',mixBlendMode:'overlay'}}/>
        <div className="absolute inset-0" style={{background:'radial-gradient(circle at 30% 20%,rgba(255,255,255,0.1) 0,transparent 50%)'}}/>
        <div className="relative z-10"><Logo size="lg"/></div>
        <div className="relative z-10">
          <HeartPulse size={40} className="text-white/90 mb-6 animate-heartbeat"/>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4 text-balance">
            Your blood can give someone another sunrise.
          </h2>
          <p className="text-white/70 font-body text-base leading-relaxed max-w-md">
            Join thousands of donors and hospitals saving lives together, one drop at a time.
          </p>
          <div className="flex gap-8 mt-10">
            {[['12k+','Lives saved'],['500+','Active donors'],['98%','Success rate']].map(([n,l]) => (
              <div key={l}>
                <p className="font-display text-3xl font-bold text-white">{n}</p>
                <p className="text-white/60 text-xs font-body mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-white/40 text-xs font-body">© 2024 BetterHand</div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="lg:hidden flex justify-center mb-6"><Logo size="lg"/></div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Welcome back</h1>
          <p className="text-ink-400 text-sm mt-1 mb-8 font-body">Sign in to continue saving lives</p>

          <div className="grid grid-cols-3 gap-2.5 mb-6">
            {ROLES.map(r => {
              const Icon = r.icon
              const active = role === r.id
              return (
                <button key={r.id} type="button" onClick={() => setRole(r.id)}
                  className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 group
                    ${active ? 'border-brand-500 bg-white shadow-soft -translate-y-0.5' : 'border-ink-200 bg-white/50 hover:border-brand-300'}`}>
                  <div className={`w-9 h-9 mx-auto rounded-xl flex items-center justify-center mb-2 transition-all
                    ${active ? 'bg-gradient-to-br from-brand-500 to-brand-700 shadow-md' : 'bg-ink-100 group-hover:bg-brand-50'}`}>
                    <Icon size={18} className={active ? 'text-white' : 'text-ink-400 group-hover:text-brand-500'}/>
                  </div>
                  <span className={`text-xs font-body font-bold block ${active?'text-brand-700':'text-ink-500'}`}>{r.label}</span>
                </button>
              )
            })}
          </div>

          <div className="card p-6 space-y-4 border-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@example.com" {...register('email',{required:'Required'})}/>
                {errors.email && <p className="text-brand-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input className="input pr-10" type={showPw?'text':'password'} placeholder="••••••••" {...register('password',{required:'Required'})}/>
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500">
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {errors.password && <p className="text-brand-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <Spinner size={16}/> : <ArrowRight size={16}/>}
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="text-center text-ink-400 text-sm mt-5 font-body">
            No account? <Link to="/register" className="text-brand-600 font-bold hover:underline">Register</Link>
          </p>
          <p className="text-center mt-2"><Link to="/" className="text-xs text-ink-300 hover:text-ink-500 font-body">← Back to home</Link></p>
        </div>
      </div>
    </div>
  )
}
