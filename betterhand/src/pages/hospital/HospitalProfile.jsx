import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api'
import { STATES, getDistricts, LOCAL_BODY_TYPES } from '../../utils/locationData'
import { Save, MapPin, Phone, Building, ChevronDown, Building2, UserCircle, Map, Navigation } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner'
import { motion } from 'framer-motion'

const SS = { color:'#252030', backgroundColor:'#ffffff' }
const OS = { backgroundColor:'#ffffff', color:'#252030' }

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
  }, [reset])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await authApi.updateHospital(data)
      setProfile(res.data)
      const me = await authApi.me()
      setUser(me.data)
      toast.success('Hospital profile updated successfully')
    } catch { toast.error('Failed to update hospital profile') }
    finally { setLoading(false) }
  }

  const getLocation = () => {
    if (!navigator.geolocation) { toast.error('Location services not supported by your browser'); return }
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          await authApi.updateLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
          toast.success(`📍 Precise location saved: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
          // Update local profile state to reflect new location
          setProfile(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }))
        } catch { toast.error('Failed to save hospital location') }
        finally { setLocLoading(false) }
      },
      () => { toast.error('Could not access GPS location. Please check browser permissions.'); setLocLoading(false) },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl space-y-8 pb-12">
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
          <Building2 size={28} className="text-brand-600"/>
        </div>
        <div>
          <h1 className="text-3xl font-display font-black text-ink-900 tracking-tight">Facility Settings</h1>
          <p className="text-ink-500 text-[15px] font-medium mt-1">Manage your hospital's identity, contact details, and precise location.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: GPS & Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* GPS Card */}
          <motion.div variants={itemVariants} className="card p-6 border-ink-200 bg-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500 opacity-50"/>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <Navigation size={20}/>
              </div>
              <h3 className="text-[16px] font-display font-black text-ink-900">GPS Coordinates</h3>
            </div>
            
            <div className="mb-6">
              {profile?.latitude ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <p className="text-[12px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin size={12}/> Active Location</p>
                  <p className="text-[14px] font-mono font-medium text-emerald-800">
                    {parseFloat(profile.latitude).toFixed(4)}, {parseFloat(profile.longitude).toFixed(4)}
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-[12px] font-bold text-amber-600 uppercase tracking-wider mb-1">⚠️ Action Required</p>
                  <p className="text-[13px] font-medium text-amber-800 leading-snug">
                    GPS location is missing. Donors cannot accurately navigate to your facility without this.
                  </p>
                </div>
              )}
            </div>

            <button onClick={getLocation} disabled={locLoading} 
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-ink-900 text-white font-bold text-[14px] shadow-md hover:bg-ink-800 transition-colors disabled:opacity-70">
              {locLoading ? <Spinner size={18}/> : <MapPin size={18}/>}
              {locLoading ? 'Acquiring Signal…' : 'Update GPS Location'}
            </button>
          </motion.div>

          {/* Verification Status */}
          <motion.div variants={itemVariants} className="card p-6 border-ink-200 bg-white">
            <h3 className="text-[16px] font-display font-black text-ink-900 mb-4 flex items-center gap-2">
              <UserCircle size={20} className="text-ink-400"/> Account Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-ink-100">
                <span className="text-[13px] font-bold text-ink-500">Status</span>
                <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider">Verified Facility</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-ink-100">
                <span className="text-[13px] font-bold text-ink-500">Account Type</span>
                <span className="text-[14px] font-bold text-ink-900">Hospital Admin</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[13px] font-bold text-ink-500">Joined</span>
                <span className="text-[14px] font-bold text-ink-900">Since Registration</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Form */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="card p-6 sm:p-8 border-ink-200 bg-white">
            <h3 className="text-xl font-display font-black text-ink-900 mb-6 border-b border-ink-100 pb-4">Facility Information</h3>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="label text-[13px] font-bold text-ink-700 mb-1.5 flex items-center gap-1.5"><Building size={14} className="text-ink-400"/> Registered Facility Name</label>
                  <input className="input font-medium" placeholder="e.g. City General Hospital" {...register('name')}/>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label text-[13px] font-bold text-ink-700 mb-1.5 flex items-center gap-1.5"><Phone size={14} className="text-ink-400"/> Emergency Phone</label>
                    <input className="input font-medium" placeholder="+91 9876543210" {...register('phone')}/>
                  </div>
                  <div>
                    <label className="label text-[13px] font-bold text-ink-700 mb-1.5 flex items-center gap-1.5"><Phone size={14} className="text-emerald-500"/> WhatsApp Number</label>
                    <input className="input font-medium" placeholder="+91 9876543210" {...register('whatsapp_number')}/>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4 pt-6 border-t border-ink-100">
                <h4 className="text-[15px] font-display font-black text-ink-900 flex items-center gap-2"><Map size={18} className="text-ink-400"/> Address Details</h4>
                
                <div>
                  <label className="label text-[13px] font-bold text-ink-700 mb-1.5">Street Address / Building</label>
                  <textarea className="input resize-none font-medium" rows="2" placeholder="Full postal address..." {...register('address')}/>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label text-[13px] font-bold text-ink-700 mb-1.5">State</label>
                    <div className="relative">
                      <select className="select pr-8 font-medium bg-ink-50 border-transparent focus:border-brand-500 focus:bg-white transition-colors" style={SS} {...register('state')}>
                        <option value="" style={OS}>Select State</option>
                        {STATES.map(s => <option key={s} value={s} style={OS}>{s}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none"/>
                    </div>
                  </div>
                  <div>
                    <label className="label text-[13px] font-bold text-ink-700 mb-1.5">District</label>
                    <div className="relative">
                      <select className="select pr-8 font-medium bg-ink-50 border-transparent focus:border-brand-500 focus:bg-white transition-colors disabled:opacity-50" style={SS} {...register('district')} disabled={!selState}>
                        <option value="" style={OS}>{selState?'Select District':'Select State First'}</option>
                        {districts.map(d => <option key={d} value={d} style={OS}>{d}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none"/>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label text-[13px] font-bold text-ink-700 mb-1.5">Local Body Type</label>
                    <div className="relative">
                      <select className="select pr-8 font-medium bg-ink-50 border-transparent focus:border-brand-500 focus:bg-white transition-colors" style={SS} {...register('local_body_type')}>
                        <option value="" style={OS}>Select Type</option>
                        {LOCAL_BODY_TYPES.map(t => <option key={t.value} value={t.value} style={OS}>{t.label}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none"/>
                    </div>
                  </div>
                  <div>
                    <label className="label text-[13px] font-bold text-ink-700 mb-1.5">Local Body Name</label>
                    <input className="input font-medium" placeholder="e.g. Kochi Corporation" {...register('local_body_name')}/>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label text-[13px] font-bold text-ink-700 mb-1.5">Ward Number</label>
                    <input className="input font-medium" placeholder="e.g. 15" {...register('ward_number')}/>
                  </div>
                  <div>
                    <label className="label text-[13px] font-bold text-ink-700 mb-1.5">Pincode</label>
                    <input className="input font-medium" placeholder="e.g. 682001" {...register('pincode')}/>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-ink-100 flex justify-end">
                <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto px-8 py-3 shadow-brand-500/25 text-[15px]">
                  {loading ? <Spinner size={18}/> : <Save size={18}/>}
                  {loading ? 'Saving Changes…' : 'Save Facility Profile'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  )
}
