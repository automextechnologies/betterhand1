import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api'
import Logo from '../components/common/Logo'
import Spinner from '../components/common/Spinner'
import { getErrMsg } from '../utils/helpers'
import { Eye, EyeOff, ArrowRight, Building2, Droplet, Droplets, Landmark, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = [
  { id: 'hospital', label: 'Hospital', icon: Building2, color: 'text-brand-600', bg: 'bg-brand-600' },
  { id: 'donor', label: 'Donor', icon: Droplet, color: 'text-accent-600', bg: 'bg-accent-600' },
  { id: 'ward_member', label: 'Ward', icon: Landmark, color: 'text-emerald-600', bg: 'bg-emerald-600' },
]

export default function Login() {
  const [role, setRole] = useState('hospital')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      let res
      if (role === 'ward_member') {
        res = await authApi.loginWard({ email: data.email, password: data.password })
        const u = res.data.user || { id: res.data.member?.id, email: data.email, role: 'ward_member', profile: res.data.member }
        if (!u.role) u.role = 'ward_member'
        login(u, res.data.access, res.data.refresh)
        navigate('/ward'); return
      }
      res = await authApi.loginHospital({ email: data.email, password: data.password })
      if (res.data.user?.role !== role) { toast.error(`This is a ${res.data.user?.role} account`); setLoading(false); return }
      login(res.data.user, res.data.access, res.data.refresh)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          p => authApi.updateLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }).catch(() => {}), () => {}, { timeout: 8000 }
        )
      }
      navigate(role === 'hospital' ? '/hospital' : '/donor')
    } catch (e) { toast.error(getErrMsg(e)) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex font-body bg-surface-50 selection:bg-brand-200 selection:text-brand-900 overflow-hidden">
      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 relative z-10">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="absolute top-8 left-8 sm:left-12 lg:left-24">
          <Logo size="lg" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="w-full max-w-md mx-auto mt-20 lg:mt-0"
        >
          <div className="mb-10">
            <h1 className="text-4xl font-display font-black text-ink-900 tracking-tight mb-3">Welcome back.</h1>
            <p className="text-ink-500 text-lg">Enter your details to access your account.</p>
          </div>
          
          {/* Role Selector */}
          <div className="flex p-1.5 bg-ink-100/50 backdrop-blur-md rounded-[1.5rem] mb-10 shadow-inner">
            {ROLES.map(r => {
              const active = role === r.id
              const Icon = r.icon
              return (
                <button 
                  key={r.id} 
                  type="button" 
                  onClick={() => setRole(r.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.25rem] transition-all duration-300 relative
                    ${active ? 'text-white shadow-md' : 'text-ink-500 hover:text-ink-900'}`}
                >
                  {active && (
                    <motion.div
                      layoutId="login-role"
                      className={`absolute inset-0 rounded-[1.25rem] -z-10 ${r.bg}`}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[15px] font-bold">{r.label}</span>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1.5">
              <label className="label">Email Address</label>
              <div className="relative flex items-center group">
                <Mail size={20} className="absolute left-5 text-ink-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="you@example.com"
                  className="input pl-12 py-4 rounded-2xl"
                  {...register('email', { required: 'Required' })}
                />
              </div>
              {errors.email && <p className="text-brand-600 text-xs mt-1.5 ml-1 font-semibold">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="label">Password</label>
              <div className="relative flex items-center group">
                <Lock size={20} className="absolute left-5 text-ink-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type={showPw ? 'text' : 'password'} 
                  placeholder="••••••••"
                  className="input pl-12 pr-12 py-4 rounded-2xl"
                  {...register('password', { required: 'Required' })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-5 text-ink-400 hover:text-ink-800 transition-colors">
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button type="button" className="text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors">Forgot password?</button>
              </div>
              {errors.password && <p className="text-brand-600 text-xs mt-1.5 ml-1 font-semibold">{errors.password.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full py-4 mt-4 text-base rounded-2xl"
            >
              {loading ? <Spinner size={20} /> : 'Sign In'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-ink-500 text-[15px] font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-800 transition-colors">Create one</Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Visual Section (Split Screen) */}
      <div className="hidden lg:flex w-1/2 relative bg-ink-900 items-center justify-center overflow-hidden p-12">
        {/* Dynamic mesh background for dark side */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-900/40 via-ink-900 to-ink-900"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1600&q=80')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-lg text-center"
        >
          <div className="glass-dark p-12 rounded-[3rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="w-20 h-20 rounded-3xl bg-brand-500/20 flex items-center justify-center mx-auto mb-8 border border-brand-500/30">
              <Droplets size={40} className="text-brand-400" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-4 leading-snug">Connect. Donate.<br/>Save Lives.</h2>
            <p className="text-ink-300 text-lg font-medium">Join the fastest growing network of blood donors and hospitals.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
