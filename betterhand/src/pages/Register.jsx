import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api'
import Logo from '../components/common/Logo'
import Spinner from '../components/common/Spinner'
import { BLOOD_GROUPS, getErrMsg } from '../utils/helpers'
import { STATES, getDistricts, LOCAL_BODY_TYPES } from '../utils/locationData'
import { Eye, EyeOff, UserPlus, ChevronDown, MapPin, Building2, Droplet, Landmark } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = [
  { id: 'hospital', label: 'Hospital', icon: Building2, color: 'text-brand-600', bg: 'bg-brand-600' },
  { id: 'donor', label: 'Donor', icon: Droplet, color: 'text-accent-600', bg: 'bg-accent-600' },
  { id: 'ward_member', label: 'Ward', icon: Landmark, color: 'text-emerald-600', bg: 'bg-emerald-600' },
]

function getGPS() {
  return new Promise(resolve => {
    if (!navigator.geolocation) { resolve(null); return }
    navigator.geolocation.getCurrentPosition(
      p => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 0 }
    )
  })
}

function LocationFields({ register, errors, watch, prefix = '', required = true }) {
  const sel = watch ? watch(`${prefix}state`) : ''
  const districts = getDistricts(sel)
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="label">State {required && '*'}</label>
          <div className="relative group">
            <select className="input appearance-none pr-10 rounded-xl" {...register(`${prefix}state`, required ? { required: 'Required' } : {})}>
              <option value="">Select state</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none group-focus-within:text-brand-500 transition-colors" />
          </div>
          {errors?.[`${prefix}state`] && <p className="text-brand-600 text-xs mt-1 font-semibold ml-1">{errors[`${prefix}state`]?.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="label">District {required && '*'}</label>
          <div className="relative group">
            <select className="input appearance-none pr-10 rounded-xl" {...register(`${prefix}district`, required ? { required: 'Required' } : {})}>
              <option value="">{sel ? 'Select district' : 'Select state first'}</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none group-focus-within:text-brand-500 transition-colors" />
          </div>
          {errors?.[`${prefix}district`] && <p className="text-brand-600 text-xs mt-1 font-semibold ml-1">{errors[`${prefix}district`]?.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="label">Local Body Type {required && '*'}</label>
          <div className="relative group">
            <select className="input appearance-none pr-10 rounded-xl" {...register(`${prefix}local_body_type`, required ? { required: 'Required' } : {})}>
              <option value="">Select type</option>
              {LOCAL_BODY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none group-focus-within:text-brand-500 transition-colors" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="label">Local Body Name {required && '*'}</label>
          <input className="input rounded-xl" placeholder="e.g. Kochi Corp" {...register(`${prefix}local_body_name`, required ? { required: 'Required' } : {})} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="label">Ward Number {required && '*'}</label>
          <input className="input rounded-xl" placeholder="e.g. 15" {...register(`${prefix}ward_number`, required ? { required: 'Required' } : {})} />
          {errors?.[`${prefix}ward_number`] && <p className="text-brand-600 text-xs mt-1 font-semibold ml-1">{errors[`${prefix}ward_number`]?.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="label">Pincode</label>
          <input className="input rounded-xl" placeholder="682001" {...register(`${prefix}pincode`)} />
        </div>
      </div>
    </div>
  )
}

export default function Register() {
  const [role, setRole] = useState('hospital')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('idle')
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()
  const { login } = useAuthStore()
  const navigate = useNavigate()
  
  const isStudent = watch('is_student')
  const [colleges, setColleges] = useState([])
  
  const loadColleges = async (q) => {
    try { const r = await authApi.colleges({}); setColleges(r.data?.colleges || []) } catch {}
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      setGpsStatus('getting')
      const gps = await getGPS()
      if (gps) {
        setGpsStatus('got')
        toast.success(`📍 Location captured: ${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)}`)
      } else {
        setGpsStatus('failed')
        toast('⚠️ Could not get location. Update later in Profile.', { icon: '📍' })
      }

      let res
      if (role === 'hospital') {
        res = await authApi.registerHospital({
          email: data.email, password: data.password,
          name: data.name, registration_number: data.registration_number,
          phone: data.phone, address: data.address || '',
          city: data.district || '', state: data.state || '',
          district: data.district || '', pincode: data.pincode || '',
          local_body_type: data.local_body_type || '',
          local_body_name: data.local_body_name || '',
          ward_number: data.ward_number || '',
          whatsapp_number: data.whatsapp_number || '',
        })
      } else if (role === 'donor') {
        res = await authApi.registerDonor({
          email: data.email, password: data.password,
          full_name: data.full_name, blood_group: data.blood_group,
          phone: data.phone, age: data.age ? +data.age : undefined,
          gender: data.gender || '',
          state: data.state || '', district: data.district || '',
          city: data.district || '',
          local_body_type: data.local_body_type || '',
          local_body_name: data.local_body_name || '',
          ward_number: data.ward_number || '',
          pincode: data.pincode || '',
          is_student: !!data.is_student,
          college_name: data.is_student ? (data.college_name || '') : '',
          college_district: data.is_student ? (data.college_district || '') : '',
        })
      } else {
        res = await authApi.registerWard({
          email: data.email, password: data.password,
          full_name: data.full_name, phone: data.phone,
          designation: data.designation || '',
          state: data.state, district: data.district,
          local_body_type: data.local_body_type,
          local_body_name: data.local_body_name,
          ward_number: data.ward_number,
        })
      }

      const userData = res.data.user || res.data.member || { email: data.email, role }
      if (!userData.role) userData.role = role
      login(userData, res.data.access, res.data.refresh)

      if (gps) {
        try {
          await authApi.updateLocation(gps)
          const raw = sessionStorage.getItem('bh-auth')
          if (raw) {
            const parsed = JSON.parse(raw)
            const s = parsed?.state || parsed
            if (s?.user?.profile) {
              s.user.profile.latitude = gps.latitude
              s.user.profile.longitude = gps.longitude
              sessionStorage.setItem('bh-auth', JSON.stringify(parsed))
            }
          }
        } catch {}
      }

      toast.success('Account created! 🎉')
      navigate(role === 'hospital' ? '/hospital' : role === 'donor' ? '/donor' : '/ward')

    } catch (e) {
      toast.error(getErrMsg(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-body bg-surface-50 selection:bg-brand-200 selection:text-brand-900">
      
      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 sm:px-12 lg:px-20 xl:px-28 py-12 relative z-10 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Logo size="lg" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="w-full max-w-md mx-auto flex-1"
        >
          <div className="mb-10">
            <h1 className="text-4xl font-display font-black text-ink-900 tracking-tight mb-3">Create account.</h1>
            <p className="text-ink-500 text-lg">Join BetterHand and start saving lives today.</p>
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
                  onClick={() => { setRole(r.id); reset() }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.25rem] transition-all duration-300 relative
                    ${active ? 'text-white shadow-md' : 'text-ink-500 hover:text-ink-900'}`}
                >
                  {active && (
                    <motion.div
                      layoutId="register-role"
                      className={`absolute inset-0 rounded-[1.25rem] -z-10 ${r.bg}`}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[15px] font-bold hidden sm:inline">{r.label}</span>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Base Credentials */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="label">Email Address *</label>
                <input 
                  type="email" 
                  placeholder="you@example.com"
                  className="input rounded-xl py-3.5"
                  {...register('email', { required: 'Required' })}
                />
                {errors.email && <p className="text-brand-600 text-xs mt-1.5 ml-1 font-semibold">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="label">Password *</label>
                <div className="relative group">
                  <input 
                    type={showPw ? 'text' : 'password'} 
                    placeholder="Min 8 characters"
                    className="input rounded-xl py-3.5 pr-11"
                    {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-800 transition-colors">
                    {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-brand-600 text-xs mt-1.5 ml-1 font-semibold">{errors.password.message}</p>}
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-ink-200 to-transparent"></div>

            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* HOSPITAL */}
                {role === 'hospital' && (
                  <div className="space-y-5">
                    <h3 className="text-xs font-black text-brand-600 uppercase tracking-widest">Hospital Details</h3>
                    <div className="space-y-1.5">
                      <label className="label">Hospital Name *</label>
                      <input className="input rounded-xl" placeholder="City General Hospital" {...register('name', { required: 'Required' })} />
                      {errors.name && <p className="text-brand-600 text-xs mt-1 font-semibold ml-1">{errors.name.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="label">Reg. Number *</label>
                        <input className="input rounded-xl" placeholder="KL-2024-001" {...register('registration_number', { required: 'Required' })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="label">Phone *</label>
                        <input className="input rounded-xl" placeholder="+91 9876543210" {...register('phone', { required: 'Required' })} />
                      </div>
                    </div>
                    <h3 className="text-xs font-black text-brand-600 uppercase tracking-widest mt-8">Location</h3>
                    <LocationFields register={register} errors={errors} watch={watch} />
                  </div>
                )}

                {/* DONOR */}
                {role === 'donor' && (
                  <div className="space-y-5">
                    <h3 className="text-xs font-black text-accent-600 uppercase tracking-widest">Personal Info</h3>
                    <div className="space-y-1.5">
                      <label className="label">Full Name *</label>
                      <input className="input rounded-xl" placeholder="John Doe" {...register('full_name', { required: 'Required' })} />
                      {errors.full_name && <p className="text-brand-600 text-xs mt-1 font-semibold ml-1">{errors.full_name.message}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="label">Blood Group *</label>
                        <div className="relative group">
                          <select className="input appearance-none pr-10 rounded-xl" {...register('blood_group', { required: 'Required' })}>
                            <option value="">Select</option>
                            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none group-focus-within:text-brand-500 transition-colors" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="label">Phone *</label>
                        <input className="input rounded-xl" placeholder="+91 9876543210" {...register('phone', { required: 'Required' })} />
                      </div>
                    </div>

                    <div className="p-5 rounded-[1.25rem] bg-accent-50/50 border border-accent-100">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-5 h-5 rounded border-accent-300 text-accent-600 focus:ring-accent-500" {...register('is_student')} />
                        <span className="text-[15px] font-bold text-ink-900 group-hover:text-accent-700 transition-colors">I am a student <span className="text-ink-400 font-medium">(optional)</span></span>
                      </label>
                      {isStudent && (
                        <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="grid grid-cols-2 gap-4 mt-5">
                          <div className="space-y-1.5">
                            <label className="label">College Name</label>
                            <input className="input rounded-xl" list="college-list" placeholder="Start typing…" {...register('college_name')} onChange={e => { if (e.target.value.length >= 2) loadColleges(e.target.value) }} />
                            <datalist id="college-list">
                              {colleges.map(col => <option key={col.name} value={col.name} />)}
                            </datalist>
                          </div>
                          <div className="space-y-1.5">
                            <label className="label">District</label>
                            <input className="input rounded-xl" placeholder="e.g. Malappuram" {...register('college_district')} />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <h3 className="text-xs font-black text-accent-600 uppercase tracking-widest mt-8">Home Location</h3>
                    <LocationFields register={register} errors={errors} watch={watch} />
                  </div>
                )}

                {/* WARD */}
                {role === 'ward_member' && (
                  <div className="space-y-5">
                    <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest">Ward Details</h3>
                    <div className="space-y-1.5">
                      <label className="label">Full Name *</label>
                      <input className="input rounded-xl" placeholder="Ramesh Kumar" {...register('full_name', { required: 'Required' })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="label">Phone *</label>
                        <input className="input rounded-xl" placeholder="+91 9876543210" {...register('phone', { required: 'Required' })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="label">Designation</label>
                        <input className="input rounded-xl" placeholder="Ward Councillor" {...register('designation')} />
                      </div>
                    </div>
                    <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mt-8">Jurisdiction</h3>
                    <LocationFields register={register} errors={errors} watch={watch} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* GPS Status Banner */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-brand-50 border border-brand-100 mt-8">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-brand-600" />
              </div>
              <p className="text-[13px] font-medium text-brand-900 leading-relaxed">
                Your GPS location will be captured automatically upon submission to ensure accurate matching.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full flex items-center justify-center gap-2 text-white py-4 mt-6 rounded-2xl font-bold text-base shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0
                ${role === 'hospital' ? 'bg-brand-600 shadow-brand-600/25 hover:shadow-brand-600/35' : 
                  role === 'ward_member' ? 'bg-emerald-600 shadow-emerald-600/25 hover:shadow-emerald-600/35' : 
                  'bg-accent-600 shadow-accent-600/25 hover:shadow-accent-600/35'}`}
            >
              {loading ? <Spinner size={20} /> : <UserPlus size={20} />}
              {loading ? (gpsStatus === 'getting' ? 'Getting location…' : 'Creating account…') : 'Create Account'}
            </button>
          </form>

          <div className="mt-10 text-center pb-8">
            <p className="text-ink-500 text-[15px] font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:text-brand-800 transition-colors">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Visual Section (Split Screen) */}
      <div className="hidden lg:flex w-1/2 relative bg-ink-900 items-center justify-center overflow-hidden p-12 fixed right-0 h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent-900/40 via-ink-900 to-ink-900"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1600&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-lg text-center"
        >
          <div className="glass-dark p-12 rounded-[3rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex justify-center gap-4 mb-8">
               <div className="w-16 h-16 rounded-2xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30 text-brand-400">
                  <Building2 size={28} />
               </div>
               <div className="w-16 h-16 rounded-2xl bg-accent-500/20 flex items-center justify-center border border-accent-500/30 text-accent-400">
                  <Droplet size={28} />
               </div>
               <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
                  <Landmark size={28} />
               </div>
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-4 leading-snug">One Network.<br/>Three Pillars.</h2>
            <p className="text-ink-300 text-lg font-medium">Hospitals, Donors, and Ward Members working seamlessly together to eliminate blood shortage.</p>
          </div>
        </motion.div>
      </div>

    </div>
  )
}
