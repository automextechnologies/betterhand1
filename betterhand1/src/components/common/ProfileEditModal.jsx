import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api'
import { BLOOD_GROUPS, getErrMsg } from '../../utils/helpers'
import { STATES, getDistricts, LOCAL_BODY_TYPES } from '../../utils/locationData'
import { X, Save, MapPin, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from './Spinner'

const SS = { color:'#27272a', backgroundColor:'#ffffff' }
const OS = { backgroundColor:'#ffffff', color:'#27272a' }

export default function ProfileEditModal({ onClose }) {
  const { user, setUser } = useAuthStore()
  const role = user?.role
  const profile = user?.profile
  const { register, handleSubmit, watch, reset, formState:{ errors } } = useForm()
  const [loading, setLoading]   = useState(false)
  const [locLoading, setLocLoading] = useState(false)

  const selState   = watch('state')
  const districts  = getDistricts(selState)

  // Pre-fill form with existing data
  useEffect(() => {
    if (profile) reset({ ...profile })
  }, [profile])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      let res
      if (role === 'hospital') {
        res = await authApi.updateHospital(data)
      } else if (role === 'donor') {
        res = await authApi.updateDonor(data)
      }
      // Refresh user profile
      const me = await authApi.me()
      setUser(me.data)
      // Update localStorage
      const raw = sessionStorage.getItem('bh-auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        const s = parsed?.state || parsed
        s.user = me.data
        sessionStorage.setItem('bh-auth', JSON.stringify(parsed))
      }
      toast.success('Profile updated successfully!')
      onClose()
    } catch (e) {
      toast.error(getErrMsg(e))
    } finally { setLoading(false) }
  }

  const fetchMyLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          await authApi.updateLocation({
            latitude:  pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
          toast.success(`📍 Location updated: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
        } catch { toast.error('Failed to save location') }
        finally { setLocLoading(false) }
      },
      () => { toast.error('Could not get location'); setLocLoading(false) },
      { timeout:10000, maximumAge:60000 }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 shrink-0">
          <h2 className=" font-bold text-surface-900 text-lg">Edit Profile</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X size={18}/></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">

          {/* Location update button */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-brand-950/40 border border-brand-700/30">
            <div>
              <p className="text-sm  font-semibold text-surface-900">📍 Update GPS Location</p>
              <p className="text-xs text-surface-400 mt-0.5">Used for donor matching (auto-updates every hour)</p>
            </div>
            <button type="button" onClick={fetchMyLocation} disabled={locLoading}
              className="btn-secondary text-xs py-2 shrink-0">
              {locLoading ? <Spinner size={13}/> : <MapPin size={13}/>}
              {locLoading ? 'Fetching…' : 'Get Location'}
            </button>
          </div>

          {/* Hospital fields */}
          {role === 'hospital' && (
            <>
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
            </>
          )}

          {/* Donor fields */}
          {role === 'donor' && (
            <>
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
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200">
                <input type="checkbox" id="avail" className="w-4 h-4 accent-brand-500" {...register('is_available')}/>
                <label htmlFor="avail" className="text-sm text-surface-900 cursor-pointer">
                  Available for blood donation
                </label>
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
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Spinner size={16}/> : <Save size={16}/>}
              {loading ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
