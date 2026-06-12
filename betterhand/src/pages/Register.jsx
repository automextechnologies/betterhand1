import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api'
import Logo from '../components/common/Logo'
import Spinner from '../components/common/Spinner'
import { BLOOD_GROUPS, getErrMsg } from '../utils/helpers'
import { STATES, getDistricts, LOCAL_BODY_TYPES } from '../utils/locationData'
import { Eye, EyeOff, UserPlus, ChevronDown, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = [
  { id:'hospital',    label:' Hospital',    desc:'Blood bank / Hospital' },
  { id:'donor',       label:' Donor',        desc:'Individual blood donor' },
  { id:'ward_member', label:' Ward Member',  desc:'Govt. coordinator' },
]

const SS = { color:'#27272a', backgroundColor:'#ffffff' }
const OS = { backgroundColor:'#ffffff', color:'#27272a' }

// Get GPS coordinates
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

function LocationFields({ register, errors, watch, prefix='', required=true }) {
  const sel      = watch ? watch(`${prefix}state`) : ''
  const districts = getDistricts(sel)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">State {required&&'*'}</label>
          <div className="relative">
            <select className="select pr-8" style={SS} {...register(`${prefix}state`, required?{required:'Required'}:{})}>
              <option value="" style={OS}>Select state</option>
              {STATES.map(s => <option key={s} value={s} style={OS}>{s}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
          </div>
          {errors?.[`${prefix}state`] && <p className="text-danger-500 text-xs mt-1">{errors[`${prefix}state`]?.message}</p>}
        </div>
        <div>
          <label className="label">District {required&&'*'}</label>
          <div className="relative">
            <select className="select pr-8" style={SS} {...register(`${prefix}district`, required?{required:'Required'}:{})}>
              <option value="" style={OS}>{sel ? 'Select district' : 'Select state first'}</option>
              {districts.map(d => <option key={d} value={d} style={OS}>{d}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
          </div>
          {errors?.[`${prefix}district`] && <p className="text-danger-500 text-xs mt-1">{errors[`${prefix}district`]?.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Local Body Type {required&&'*'}</label>
          <div className="relative">
            <select className="select pr-8" style={SS} {...register(`${prefix}local_body_type`, required?{required:'Required'}:{})}>
              <option value="" style={OS}>Select type</option>
              {LOCAL_BODY_TYPES.map(t => <option key={t.value} value={t.value} style={OS}>{t.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
          </div>
        </div>
        <div>
          <label className="label">Local Body Name {required&&'*'}</label>
          <input className="input" placeholder="e.g. Kochi Corporation"
            {...register(`${prefix}local_body_name`, required?{required:'Required'}:{})}/>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Ward Number {required&&'*'}</label>
          <input className="input" placeholder="e.g. 15"
            {...register(`${prefix}ward_number`, required?{required:'Required'}:{})}/>
          {errors?.[`${prefix}ward_number`] && <p className="text-danger-500 text-xs mt-1">{errors[`${prefix}ward_number`]?.message}</p>}
        </div>
        <div>
          <label className="label">Pincode</label>
          <input className="input" placeholder="682001" {...register(`${prefix}pincode`)}/>
        </div>
      </div>
    </div>
  )
}

export default function Register() {
  const [role, setRole]       = useState('hospital')
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('idle') // idle | getting | got | failed
  const { register, handleSubmit, watch, reset, formState:{ errors } } = useForm()
  const { login } = useAuthStore()
  const navigate  = useNavigate()
  const isStudent = watch('is_student')
  const [colleges, setColleges] = useState([])
  const loadColleges = async (q) => {
    try { const r = await authApi.colleges({}); setColleges(r.data?.colleges || []) } catch {}
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Get GPS location before registering
      setGpsStatus('getting')
      const gps = await getGPS()
      if (gps) {
        setGpsStatus('got')
        toast.success(`📍 Location captured: ${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)}`)
      } else {
        setGpsStatus('failed')
        toast('⚠️ Could not get location. You can update it later in Profile.', { icon:'📍' })
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

      // Save GPS location to backend immediately after registration
      if (gps) {
        try {
          await authApi.updateLocation(gps)
          // Update stored profile
          const raw = sessionStorage.getItem('bh-auth')
          if (raw) {
            const parsed = JSON.parse(raw)
            const s = parsed?.state || parsed
            if (s?.user?.profile) {
              s.user.profile.latitude  = gps.latitude
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-4"><Logo size="lg"/></div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Create account</h1>
          <p className="text-surface-500 text-sm mt-1">Join BetterHand — save more lives</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {ROLES.map(r => (
            <button key={r.id} type="button" onClick={() => { setRole(r.id); reset() }}
              className={`p-3 rounded-xl border text-left transition-all duration-200
                ${role===r.id ? 'border-brand-400 bg-brand-50 shadow-sm' : 'border-surface-200 bg-white hover:border-surface-300'}`}>
              <p className="text-sm font-display font-semibold text-surface-800">{r.label}</p>
              <p className="text-[10px] text-surface-400 mt-0.5">{r.desc}</p>
            </button>
          ))}
        </div>

        {/* GPS info banner */}
        <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 border text-xs
          ${gpsStatus==='got' ? 'bg-emerald-50 border-green-200 text-green-600'
            : gpsStatus==='failed' ? 'bg-yellow-50 border-yellow-600/20 text-yellow-700'
            : 'bg-brand-50 border-brand-200 text-brand-600'}`}>
          <MapPin size={13} className="shrink-0"/>
          {gpsStatus==='got'    ? '✅ GPS location captured — you will appear in nearby searches'
          : gpsStatus==='failed'? '⚠️ GPS not available — update location later in Profile Settings'
          : gpsStatus==='getting'? '📍 Getting your location…'
          : '📍 Your GPS will be captured on submit for accurate donor/hospital matching'}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          {/* Email + Password */}
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" placeholder="you@example.com"
              {...register('email',{required:'Required'})}/>
            {errors.email && <p className="text-danger-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Password *</label>
            <div className="relative">
              <input className="input pr-12" type={showPw?'text':'password'} placeholder="Min 8 characters"
                {...register('password',{required:'Required',minLength:{value:8,message:'Min 8 chars'}})}/>
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {errors.password && <p className="text-danger-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* HOSPITAL */}
          {role === 'hospital' && (<>
            <div className="divider pt-1"/>
            <div>
              <label className="label">Hospital Name *</label>
              <input className="input" placeholder="City General Hospital"
                {...register('name',{required:'Required'})}/>
              {errors.name && <p className="text-danger-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Reg. Number *</label>
                <input className="input" placeholder="KL-2024-001"
                  {...register('registration_number',{required:'Required'})}/>
              </div>
              <div>
                <label className="label">Phone *</label>
                <input className="input" placeholder="+91 9876543210"
                  {...register('phone',{required:'Required'})}/>
              </div>
              <div>
                <label className="label">WhatsApp</label>
                <input className="input" placeholder="+91 9876543210" {...register('whatsapp_number')}/>
              </div>
            </div>
            <div className="divider pt-1"/>
            <p className="text-xs text-brand-600 font-display font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12}/> Hospital Location *
            </p>
            <LocationFields register={register} errors={errors} watch={watch}/>
          </>)}

          {/* DONOR */}
          {role === 'donor' && (<>
            <div className="divider pt-1"/>
            <div>
              <label className="label">Full Name *</label>
              <input className="input" placeholder="Akshay Kumar"
                {...register('full_name',{required:'Required'})}/>
              {errors.full_name && <p className="text-danger-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Blood Group *</label>
                <div className="relative">
                  <select className="select pr-8" style={SS} {...register('blood_group',{required:'Required'})}>
                    <option value="" style={OS}>Select</option>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g} style={OS}>{g}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
                </div>
                {errors.blood_group && <p className="text-danger-500 text-xs mt-1">{errors.blood_group.message}</p>}
              </div>
              <div>
                <label className="label">Phone *</label>
                <input className="input" placeholder="+91 9876543210"
                  {...register('phone',{required:'Required'})}/>
              </div>
              <div>
                <label className="label">Age</label>
                <input type="number" className="input" placeholder="25" {...register('age')}/>
              </div>
              <div>
                <label className="label">Gender</label>
                <div className="relative">
                  <select className="select pr-8" style={SS} {...register('gender')}>
                    <option value="" style={OS}>Select</option>
                    <option value="male" style={OS}>Male</option>
                    <option value="female" style={OS}>Female</option>
                    <option value="other" style={OS}>Other</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
                </div>
              </div>
            </div>

            {/* Student info — OPTIONAL */}
            <div className="divider pt-1"/>
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-brand-600" {...register('is_student')}/>
                <span className="text-sm font-semibold text-ink-700">I am a student <span className="text-ink-400 font-normal">(optional)</span></span>
              </label>
              {isStudent && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-fade-up">
                  <div>
                    <label className="label">College Name</label>
                    <input className="input" list="college-list" placeholder="Start typing…"
                      {...register('college_name')}
                      onChange={e => { if (e.target.value.length >= 2) loadColleges(e.target.value) }}/>
                    <datalist id="college-list">
                      {colleges.map(col => <option key={col.name} value={col.name}/>)}
                    </datalist>
                    <p className="text-[11px] text-ink-400 mt-1">Pick existing or add new — others can reuse it</p>
                  </div>
                  <div>
                    <label className="label">College District</label>
                    <input className="input" placeholder="e.g. Malappuram" {...register('college_district')}/>
                  </div>
                </div>
              )}
            </div>

            <div className="divider pt-1"/>
            <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12}/> Home Location * (for nearby hospital matching)
            </p>
            <LocationFields register={register} errors={errors} watch={watch}/>
          </>)}

          {/* WARD MEMBER */}
          {role === 'ward_member' && (<>
            <div className="divider pt-1"/>
            <div>
              <label className="label">Full Name *</label>
              <input className="input" placeholder="Ramesh Kumar"
                {...register('full_name',{required:'Required'})}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone *</label>
                <input className="input" placeholder="+91 9876543210"
                  {...register('phone',{required:'Required'})}/>
              </div>
              <div>
                <label className="label">Designation</label>
                <input className="input" placeholder="Ward Councillor" {...register('designation')}/>
              </div>
            </div>
            <div className="divider pt-1"/>
            <p className="text-xs text-brand-600 font-display font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12}/> Ward Location *
            </p>
            <LocationFields register={register} errors={errors} watch={watch}/>
            <div className="p-3 rounded-xl bg-brand-50 border border-brand-200">
              <p className="text-xs text-brand-600">ℹ️ Await admin verification before receiving blood alerts.</p>
            </div>
          </>)}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
            {loading ? <><Spinner size={18}/>{gpsStatus==='getting'?'Getting location…':'Creating account…'}</> : <><UserPlus size={18}/>Create Account</>}
          </button>
        </form>

        <p className="text-center text-surface-500 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
