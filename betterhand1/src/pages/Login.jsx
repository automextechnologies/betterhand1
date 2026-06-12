import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api'
import Logo from '../components/common/Logo'
import Spinner from '../components/common/Spinner'
import { getErrMsg } from '../utils/helpers'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = [
  { id:'hospital',    label:'Hospital',    icon:'🏥' },
  { id:'donor',       label:'Donor',        icon:'🩸' },
  { id:'ward_member', label:'Ward Member',  icon:'🏛️' },
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
      // Silent GPS capture
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          p => authApi.updateLocation({ latitude:p.coords.latitude, longitude:p.coords.longitude }).catch(()=>{}),
          ()=>{}, { timeout:8000 }
        )
      }
      navigate(role === 'hospital' ? '/hospital' : '/donor')
    } catch (e) { toast.error(getErrMsg(e)) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><Logo size="lg"/></div>
          <h1 className="text-2xl font-bold text-surface-900">Welcome back</h1>
          <p className="text-surface-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {ROLES.map(r => (
            <button key={r.id} type="button" onClick={() => setRole(r.id)}
              className={`p-3 rounded-lg border text-center transition-all text-sm
                ${role===r.id
                  ? 'border-brand-500 border-brand-500 bg-brand-50 text-brand-700 font-semibold shadow-md'
                  : 'border-surface-200 bg-white text-surface-500 hover:border-surface-300'}`}>
              <span className="text-lg block mb-0.5">{r.icon}</span>
              <span className="text-xs">{r.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-5 space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com"
              {...register('email',{required:'Required'})}/>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input className="input pr-10" type={showPw?'text':'password'} placeholder="••••••••"
                {...register('password',{required:'Required'})}/>
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-500">
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner size={16}/> : <ArrowRight size={16}/>}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-surface-400 text-sm mt-4">
          No account? <Link to="/register" className="text-brand-600 font-medium hover:underline">Register</Link>
        </p>
        <p className="text-center mt-2">
          <Link to="/" className="text-xs text-surface-300 hover:text-surface-500">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}
