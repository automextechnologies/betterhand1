import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api'
import { BLOOD_GROUPS } from '../../utils/helpers'
import { STATES, getDistricts, LOCAL_BODY_TYPES } from '../../utils/locationData'
import { Save, MapPin, Heart, ChevronDown, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner'

const SS = { color:'white', backgroundColor:'#0f0e17' }
const OS = { backgroundColor:'#0f0e17', color:'white' }

export default function DonorProfile() {
  const { user, setUser } = useAuthStore()
  const { register, handleSubmit, watch, reset } = useForm()
  const [loading, setLoading]   = useState(false)
  const [locLoading, setLocLoading] = useState(false)
  const [profile, setProfile]   = useState(null)
  const selState   = watch('state')
  const districts  = getDistricts(selState)

  useEffect(() => {
    authApi.donorProfile().then(r => {
      setProfile(r.data)
      reset(r.data)
    }).catch(() => {})
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await authApi.updateDonor(data)
      setProfile(res.data)
      const me = await authApi.me()
      setUser(me.data)
      toast.success('Profile updated ✅')
    } catch { toast.error('Failed to update') }
    finally { setLoading(false) }
  }

  const getLocation = () => {
    if (!navigator.geolocation) { toast.error('Location not supported'); return }
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          await authApi.updateLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
          toast.success(`📍 Location saved: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
        } catch { toast.error('Failed to save location') }
        finally { setLocLoading(false) }
      },
      () => { toast.error('Could not get location'); setLocLoading(false) },
      { timeout: 10000 }
    )
  }

  const toggleAvailability = async () => {
    try {
      const res = await authApi.toggleAvailability()
      // Update local profile state immediately
      setProfile(prev => prev ? { ...prev, is_available: res.data.is_available } : prev)
      // Also update auth store
      const me = await authApi.me()
      setUser(me.data)
      toast.success(res.data.is_available ? '✅ You are now available!' : '❌ You are now unavailable')
    } catch { toast.error('Failed to update') }
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Heart size={22} className="text-danger-500"/> Donor Profile
        </h1>
        <p className="text-surface-400 text-sm mt-0.5">Update your details, blood group and location</p>
      </div>

      {/* GPS + Availability */}
      <div className="grid grid-cols-1 gap-4">
        <div className="card p-4 flex items-center justify-between gap-4">
          <div>
            <p className=" font-semibold text-surface-900 flex items-center gap-2">
              <MapPin size={15} className="text-brand-400"/> GPS Location
            </p>
            <p className="text-xs text-surface-400 mt-0.5">
              {profile?.latitude
                ? `${parseFloat(profile.latitude).toFixed(4)}, ${parseFloat(profile.longitude).toFixed(4)}`
                : '⚠️ No location — hospitals cannot find you!'}
            </p>
          </div>
          <button onClick={getLocation} disabled={locLoading} className="btn-primary shrink-0 py-2 text-sm">
            {locLoading ? <Spinner size={14}/> : <MapPin size={14}/>}
            {locLoading ? 'Getting…' : 'Update'}
          </button>
        </div>

        <div className="card p-4 flex items-center justify-between gap-4">
          <div>
            <p className=" font-semibold text-surface-900">Availability Status</p>
            <p className="text-xs text-surface-400 mt-0.5">
              {profile?.is_available ? '✅ You will receive blood requests' : '❌ You will NOT receive requests'}
            </p>
          </div>
          <button onClick={toggleAvailability}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${profile?.is_available
                ? 'bg-accent-50 text-accent-600 border border-accent-500/30 hover:bg-brand-50 hover:text-danger-500'
                : 'bg-brand-50 text-danger-500 border border-danger-500/30 hover:bg-accent-50 hover:text-accent-600'}`}>
            {profile?.is_available ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
            {profile?.is_available ? 'Available' : 'Unavailable'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" {...register('full_name')}/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Blood Group</label>
            <div className="relative">
              <select className="select pr-8" style={SS} {...register('blood_group')}>
                <option value="" style={OS}>Select</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g} style={OS}>{g}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
            </div>
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')}/>
          </div>
          <div>
            <label className="label">WhatsApp</label>
            <input className="input" {...register('whatsapp_number')}/>
          </div>
          <div>
            <label className="label">Age</label>
            <input type="number" className="input" {...register('age')}/>
          </div>
        </div>
        <div className="divider"/>
        <p className="text-xs text-brand-400  uppercase tracking-wider">📍 Home Location</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">State</label>
            <div className="relative">
              <select className="select pr-8" style={SS} {...register('state')}>
                <option value="" style={OS}>Select state</option>
                {STATES.map(s => <option key={s} value={s} style={OS}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
            </div>
          </div>
          <div>
            <label className="label">District</label>
            <div className="relative">
              <select className="select pr-8" style={SS} {...register('district')}>
                <option value="" style={OS}>{selState?'Select district':'State first'}</option>
                {districts.map(d => <option key={d} value={d} style={OS}>{d}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
            </div>
          </div>
          <div>
            <label className="label">Local Body Type</label>
            <div className="relative">
              <select className="select pr-8" style={SS} {...register('local_body_type')}>
                <option value="" style={OS}>Select type</option>
                {LOCAL_BODY_TYPES.map(t => <option key={t.value} value={t.value} style={OS}>{t.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
            </div>
          </div>
          <div>
            <label className="label">Local Body Name</label>
            <input className="input" placeholder="Kochi Corporation" {...register('local_body_name')}/>
          </div>
          <div>
            <label className="label">Ward Number</label>
            <input className="input" placeholder="15" {...register('ward_number')}/>
          </div>
          <div>
            <label className="label">Pincode</label>
            <input className="input" {...register('pincode')}/>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? <Spinner size={16}/> : <Save size={16}/>}
          {loading ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
