import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api'
import { STATES, getDistricts, LOCAL_BODY_TYPES } from '../../utils/locationData'
import { Save, MapPin, Phone, Building, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner'

const SS = { color:'white', backgroundColor:'#0f0e17' }
const OS = { backgroundColor:'#0f0e17', color:'white' }

export default function HospitalProfile() {
  const { user, setUser } = useAuthStore()
  const { register, handleSubmit, watch, reset } = useForm()
  const [loading, setLoading]   = useState(false)
  const [locLoading, setLocLoading] = useState(false)
  const [profile, setProfile]   = useState(null)
  const selState   = watch('state')
  const districts  = getDistricts(selState)

  useEffect(() => {
    authApi.hospitalProfile().then(r => {
      setProfile(r.data)
      reset(r.data)
    }).catch(() => {})
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await authApi.updateHospital(data)
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

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Building size={22} className="text-brand-400"/> Hospital Profile
        </h1>
        <p className="text-surface-400 text-sm mt-0.5">Update your hospital details and location</p>
      </div>

      {/* GPS Location Card */}
      <div className="card p-5 flex items-center justify-between gap-4">
        <div>
          <p className=" font-semibold text-surface-900 flex items-center gap-2">
            <MapPin size={16} className="text-brand-400"/> GPS Location
          </p>
          <p className="text-xs text-surface-400 mt-1">
            {profile?.latitude
              ? `Current: ${parseFloat(profile.latitude).toFixed(4)}, ${parseFloat(profile.longitude).toFixed(4)}`
              : '⚠️ No location set — donors cannot be found without this!'}
          </p>
        </div>
        <button onClick={getLocation} disabled={locLoading} className="btn-primary shrink-0">
          {locLoading ? <Spinner size={15}/> : <MapPin size={15}/>}
          {locLoading ? 'Getting…' : 'Update Location'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <div>
          <label className="label">Hospital Name</label>
          <input className="input" {...register('name')}/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')}/>
          </div>
          <div>
            <label className="label">WhatsApp</label>
            <input className="input" {...register('whatsapp_number')}/>
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <textarea className="input resize-none" rows="2" {...register('address')}/>
        </div>
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
                <option value="" style={OS}>{selState?'Select district':'Select state first'}</option>
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
