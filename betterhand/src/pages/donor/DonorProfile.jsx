import { useState, useEffect } from 'react'
import { ChevronDown, ClipboardCheck, Heart, MapPin, Save, ToggleLeft, ToggleRight, UserCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api'
import { BLOOD_GROUPS } from '../../utils/helpers'
import { STATES, getDistricts, LOCAL_BODY_TYPES } from '../../utils/locationData'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner'
import { motion, AnimatePresence } from 'framer-motion'

const SS = { color:'#1f1b19', backgroundColor:'#ffffff' }
const OS = { backgroundColor:'#ffffff', color:'#1f1b19' }

export default function DonorProfile() {
  const { user, setUser } = useAuthStore()
  const { register, handleSubmit, watch, reset } = useForm()
  const [loading, setLoading]   = useState(false)
  const [locLoading, setLocLoading] = useState(false)
  const [profile, setProfile]   = useState(null)
  const [q, setQ] = useState({})
  const [qLoading, setQLoading] = useState(false)
  const [showQ, setShowQ] = useState(false)
  const selState   = watch('state')
  const districts  = getDistricts(selState)

  useEffect(() => {
    authApi.donorProfile().then(r => {
      const p = r.data
      setQ({
        q_weight_ok:p?.q_weight_ok, q_age_ok:p?.q_age_ok, q_no_illness:p?.q_no_illness,
        q_no_medication:p?.q_no_medication, q_no_recent_donation:p?.q_no_recent_donation,
        q_no_tattoo:p?.q_no_tattoo, q_no_alcohol:p?.q_no_alcohol,
        consent_given:p?.consent_given, q_chronic_conditions:p?.q_chronic_conditions||'',
        q_last_donation_date:p?.q_last_donation_date||''
      })
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
    } catch { toast.error('Failed to update profile') }
    finally { setLoading(false) }
  }

  const getLocation = () => {
    if (!navigator.geolocation) { toast.error('Location not supported by browser'); return }
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          await authApi.updateLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
          toast.success(`📍 Location saved! Hospital matching accuracy improved.`)
        } catch { toast.error('Failed to save location') }
        finally { setLocLoading(false) }
      },
      () => { toast.error('Could not get location. Please enable GPS permissions.'); setLocLoading(false) },
      { timeout: 10000 }
    )
  }

  const toggleAvailability = async () => {
    try {
      const res = await authApi.toggleAvailability()
      setProfile(prev => prev ? { ...prev, is_available: res.data.is_available } : prev)
      const me = await authApi.me()
      setUser(me.data)
      toast.success(res.data.is_available ? '✅ You are now available to donate!' : '⏸️ You are now marked as unavailable.')
    } catch { toast.error('Failed to update availability') }
  }

  const submitQuestionnaire = async () => {
    if (!q.consent_given) { toast.error('Please provide consent to continue'); return }
    setQLoading(true)
    try {
      await authApi.questionnaire(q)
      setProfile(p => p ? { ...p, questionnaire_completed:true, ...q } : p)
      toast.success('✅ Questionnaire saved — you now have priority status!')
      setShowQ(false)
    } catch { toast.error('Failed to save questionnaire') }
    finally { setQLoading(false) }
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
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-3xl space-y-8 pb-12">
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="p-3 bg-brand-50 rounded-2xl shadow-inner">
          <UserCircle size={28} className="text-brand-600"/>
        </div>
        <div>
          <h1 className="text-3xl font-display font-black text-ink-900">Donor Profile</h1>
          <p className="text-ink-500 text-[15px] font-medium mt-1">Manage your personal details and donation preferences.</p>
        </div>
      </motion.div>

      {/* GPS + Availability Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="card p-6 flex flex-col justify-between gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-100/50 to-transparent rounded-full blur-2xl -z-10 group-hover:scale-110 transition-transform duration-500" />
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center mb-4">
              <MapPin size={20} className="text-sky-600"/>
            </div>
            <h3 className="text-lg font-display font-bold text-ink-900">GPS Location</h3>
            <p className="text-sm font-medium text-ink-500 mt-1 h-10">
              {profile?.latitude
                ? <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">Active: {parseFloat(profile.latitude).toFixed(4)}, {parseFloat(profile.longitude).toFixed(4)}</span>
                : <span className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg">⚠️ No location set</span>}
            </p>
          </div>
          <button onClick={getLocation} disabled={locLoading} className="btn-secondary w-full justify-center bg-white border-sky-100 hover:border-sky-200 hover:text-sky-700">
            {locLoading ? <Spinner size={16}/> : <MapPin size={16}/>}
            {locLoading ? 'Acquiring Signal…' : 'Update Location'}
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-6 flex flex-col justify-between gap-5 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl to-transparent rounded-full blur-2xl -z-10 group-hover:scale-110 transition-transform duration-500
            ${profile?.is_available ? 'from-emerald-100/50' : 'from-ink-100/50'}`} />
          <div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors
              ${profile?.is_available ? 'bg-emerald-50 text-emerald-600' : 'bg-ink-100 text-ink-500'}`}>
              <Heart size={20}/>
            </div>
            <h3 className="text-lg font-display font-bold text-ink-900">Availability Status</h3>
            <p className="text-sm font-medium text-ink-500 mt-1 h-10">
              {profile?.is_available ? 'Hospitals can send you requests.' : 'You will not receive new requests.'}
            </p>
          </div>
          <button onClick={toggleAvailability}
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[15px] font-bold transition-all shadow-sm
              ${profile?.is_available
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-ink-100 text-ink-600 border border-ink-200 hover:bg-ink-200'}`}>
            {profile?.is_available ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
            {profile?.is_available ? 'Available Now' : 'Currently Unavailable'}
          </button>
        </motion.div>
      </div>

      <motion.form variants={itemVariants} onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-8">
        <div>
          <h3 className="text-xl font-display font-bold text-ink-900 mb-6">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="label">Full Name</label>
              <input className="input" placeholder="e.g. John Doe" {...register('full_name')}/>
            </div>
            <div className="space-y-1.5">
              <label className="label">Blood Group</label>
              <div className="relative">
                <select className="input appearance-none pr-10 font-bold" style={SS} {...register('blood_group')}>
                  <option value="" style={OS}>Select Group</option>
                  {BLOOD_GROUPS.map(g => <option key={g} value={g} style={OS}>{g}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"/>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="label">Age</label>
              <input type="number" className="input" placeholder="e.g. 25" {...register('age')}/>
            </div>
            <div className="space-y-1.5">
              <label className="label">Phone Number</label>
              <input type="tel" className="input" placeholder="e.g. 9876543210" {...register('phone')}/>
            </div>
            <div className="space-y-1.5">
              <label className="label">WhatsApp Number</label>
              <input type="tel" className="input" placeholder="e.g. 9876543210" {...register('whatsapp_number')}/>
            </div>
          </div>
        </div>

        <div className="h-px bg-ink-100 w-full" />

        <div>
          <h3 className="text-xl font-display font-bold text-ink-900 mb-6 flex items-center gap-2">
            <MapPin size={20} className="text-brand-600"/> Address Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="label">State</label>
              <div className="relative">
                <select className="input appearance-none pr-10" style={SS} {...register('state')}>
                  <option value="" style={OS}>Select State</option>
                  {STATES.map(s => <option key={s} value={s} style={OS}>{s}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"/>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="label">District</label>
              <div className="relative">
                <select className="input appearance-none pr-10" style={SS} {...register('district')}>
                  <option value="" style={OS}>{selState?'Select District':'Select State First'}</option>
                  {districts.map(d => <option key={d} value={d} style={OS}>{d}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"/>
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="label">Local Body Type</label>
              <div className="relative">
                <select className="input appearance-none pr-10" style={SS} {...register('local_body_type')}>
                  <option value="" style={OS}>Select Body Type</option>
                  {LOCAL_BODY_TYPES.map(t => <option key={t.value} value={t.value} style={OS}>{t.label}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"/>
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="label">Local Body Name</label>
              <input className="input" placeholder="e.g. Kochi Corporation" {...register('local_body_name')}/>
            </div>
            <div className="space-y-1.5">
              <label className="label">Ward Number</label>
              <input className="input" placeholder="e.g. 15" {...register('ward_number')}/>
            </div>
            <div className="space-y-1.5">
              <label className="label">Pincode</label>
              <input className="input" placeholder="e.g. 682001" {...register('pincode')}/>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base shadow-brand-500/25">
            {loading ? <Spinner size={20}/> : <Save size={20}/>}
            {loading ? 'Saving Changes…' : 'Save Profile Details'}
          </button>
        </div>
      </motion.form>

      {/* ── Blood Donor Questionnaire & Consent ── */}
      <motion.div variants={itemVariants} className="card overflow-hidden border-brand-100 shadow-sm">
        <button type="button" onClick={() => setShowQ(s => !s)}
          className="w-full flex items-center justify-between p-6 hover:bg-brand-50/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner
              ${profile?.questionnaire_completed ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-brand-50 border border-brand-100 text-brand-600'}`}>
              <ClipboardCheck size={24}/>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-display font-bold text-ink-900">Health Questionnaire & Consent</h3>
              <p className="text-[13px] font-bold mt-1">
                {profile?.questionnaire_completed
                  ? <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">✓ Completed — Priority Match Status Active</span>
                  : <span className="text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">Complete to unlock Priority Match Status</span>}
              </p>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center transition-transform ${showQ ? 'rotate-180' : ''}`}>
            <ChevronDown size={18} className="text-ink-500"/>
          </div>
        </button>

        <AnimatePresence>
          {showQ && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="px-6 pb-6"
            >
              <div className="h-px bg-ink-100 mb-6" />
              <div className="space-y-4">
                <p className="text-sm font-medium text-ink-500 mb-4 bg-ink-50 p-4 rounded-xl">Please check all that apply to you. Honest answers ensure patient safety.</p>
                {[
                  ['q_weight_ok','I weigh at least 50 kg'],
                  ['q_age_ok','I am between 18 and 65 years old'],
                  ['q_no_illness','I have no fever, cold, or infection currently'],
                  ['q_no_medication','I am not on antibiotics or blood-thinning medication'],
                  ['q_no_recent_donation','I have not donated blood in the last 3 months'],
                  ['q_no_tattoo','No tattoo, piercing, or surgery in the last 6 months'],
                  ['q_no_alcohol','I have not consumed alcohol in the last 24 hours'],
                ].map(([key,label]) => (
                  <label key={key} className="flex items-center gap-4 p-4 rounded-xl border border-ink-100 hover:border-brand-200 hover:bg-brand-50/50 cursor-pointer transition-colors group">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer appearance-none w-5 h-5 rounded-md border-2 border-ink-300 checked:bg-brand-600 checked:border-brand-600 transition-colors"
                        checked={!!q[key]} onChange={e => setQ(p => ({...p,[key]:e.target.checked}))}/>
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[15px] font-medium text-ink-800 group-hover:text-ink-900">{label}</span>
                  </label>
                ))}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-1.5">
                    <label className="label">Last Donation Date (if any)</label>
                    <input type="date" className="input" value={q.q_last_donation_date||''}
                      onChange={e => setQ(p => ({...p,q_last_donation_date:e.target.value}))}/>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="label">Chronic Conditions / Allergies (optional)</label>
                    <textarea rows="3" className="input resize-none" placeholder="e.g. diabetes, none…"
                      value={q.q_chronic_conditions||''}
                      onChange={e => setQ(p => ({...p,q_chronic_conditions:e.target.value}))}/>
                  </div>
                </div>

                <div className="pt-4">
                  <label className="flex items-start gap-4 p-5 rounded-2xl bg-brand-50 border border-brand-200 cursor-pointer">
                    <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                      <input type="checkbox" className="peer appearance-none w-5 h-5 rounded-md border-2 border-brand-300 checked:bg-brand-600 checked:border-brand-600 transition-colors bg-white"
                        checked={!!q.consent_given} onChange={e => setQ(p => ({...p,consent_given:e.target.checked}))}/>
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[14px] leading-relaxed text-brand-900 font-medium">
                      <strong className="text-brand-950 font-black">Official Consent:</strong> I confirm the above information is accurate and I voluntarily consent to donate blood. I understand BetterHand is a coordination platform only.
                    </span>
                  </label>
                </div>

                <button type="button" onClick={submitQuestionnaire} disabled={qLoading}
                  className="btn-primary w-full justify-center py-4 mt-6 text-base shadow-brand-500/25">
                  {qLoading ? <Spinner size={20}/> : <ClipboardCheck size={20}/>}
                  {qLoading ? 'Saving Questionnaire…' : 'Submit Questionnaire & Unlock Priority'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
