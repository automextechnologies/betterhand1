import { useState, useEffect } from 'react'
import { ChevronDown, ClipboardCheck, Heart, MapPin, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api'
import { BLOOD_GROUPS } from '../../utils/helpers'
import { STATES, getDistricts, LOCAL_BODY_TYPES } from '../../utils/locationData'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner'

const SS = { color:'#252030', backgroundColor:'#ffffff' }
const OS = { backgroundColor:'#ffffff', color:'#252030' }

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

  const submitQuestionnaire = async () => {
    if (!q.consent_given) { toast.error('Please provide consent to continue'); return }
    setQLoading(true)
    try {
      const res = await authApi.questionnaire(q)
      setProfile(p => p ? { ...p, questionnaire_completed:true, ...q } : p)
      toast.success('✅ Questionnaire saved — you now have priority status!')
    } catch { toast.error('Failed to save') }
    finally { setQLoading(false) }
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Heart size={22} className="text-danger-500"/> Donor Profile
        </h1>
        <p className="text-ink-400 text-sm mt-0.5">Update your details, blood group and location</p>
      </div>

      {/* GPS + Availability */}
      <div className="grid grid-cols-1 gap-4">
        <div className="card p-4 flex items-center justify-between gap-4">
          <div>
            <p className=" font-semibold text-ink-900 flex items-center gap-2">
              <MapPin size={15} className="text-brand-600"/> GPS Location
            </p>
            <p className="text-xs text-ink-400 mt-0.5">
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
            <p className=" font-semibold text-ink-900">Availability Status</p>
            <p className="text-xs text-ink-400 mt-0.5">
              {profile?.is_available ? '✅ You will receive blood requests' : '❌ You will NOT receive requests'}
            </p>
          </div>
          <button onClick={toggleAvailability}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${profile?.is_available
                ? 'bg-emerald-50 text-emerald-600 border border-accent-500/30 hover:bg-brand-50 hover:text-danger-500'
                : 'bg-brand-50 text-danger-500 border border-danger-500/30 hover:bg-emerald-50 hover:text-emerald-600'}`}>
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
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"/>
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
        <p className="text-xs text-brand-600  uppercase tracking-wider">📍 Home Location</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">State</label>
            <div className="relative">
              <select className="select pr-8" style={SS} {...register('state')}>
                <option value="" style={OS}>Select state</option>
                {STATES.map(s => <option key={s} value={s} style={OS}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"/>
            </div>
          </div>
          <div>
            <label className="label">District</label>
            <div className="relative">
              <select className="select pr-8" style={SS} {...register('district')}>
                <option value="" style={OS}>{selState?'Select district':'State first'}</option>
                {districts.map(d => <option key={d} value={d} style={OS}>{d}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"/>
            </div>
          </div>
          <div>
            <label className="label">Local Body Type</label>
            <div className="relative">
              <select className="select pr-8" style={SS} {...register('local_body_type')}>
                <option value="" style={OS}>Select type</option>
                {LOCAL_BODY_TYPES.map(t => <option key={t.value} value={t.value} style={OS}>{t.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"/>
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

      {/* ── Blood Donor Questionnaire & Consent (optional, gives priority) ── */}
      <div className="card overflow-hidden">
        <button type="button" onClick={() => setShowQ(s => !s)}
          className="w-full flex items-center justify-between p-5 hover:bg-surface-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile?.questionnaire_completed ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-100 text-brand-600'}`}>
              <ClipboardCheck size={20}/>
            </div>
            <div className="text-left">
              <h3 className="font-display font-bold text-ink-900">Blood Donor Questionnaire & Consent</h3>
              <p className="text-xs text-ink-400">
                {profile?.questionnaire_completed
                  ? '✓ Completed — you have priority status'
                  : 'Optional — completing this gives you priority in matching'}
              </p>
            </div>
          </div>
          <span className="text-ink-400">{showQ ? '−' : '+'}</span>
        </button>

        {showQ && (
          <div className="p-5 pt-0 space-y-3 animate-fade-up">
            <div className="divider mb-3"/>
            {[
              ['q_weight_ok','I weigh at least 50 kg'],
              ['q_age_ok','I am between 18 and 65 years old'],
              ['q_no_illness','I have no fever, cold, or infection currently'],
              ['q_no_medication','I am not on antibiotics or blood-thinning medication'],
              ['q_no_recent_donation','I have not donated blood in the last 3 months'],
              ['q_no_tattoo','No tattoo, piercing, or surgery in the last 6 months'],
              ['q_no_alcohol','I have not consumed alcohol in the last 24 hours'],
            ].map(([key,label]) => (
              <label key={key} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-50 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 mt-0.5 rounded accent-brand-600"
                  checked={!!q[key]} onChange={e => setQ(p => ({...p,[key]:e.target.checked}))}/>
                <span className="text-sm text-ink-700">{label}</span>
              </label>
            ))}
            <div>
              <label className="label">Last Donation Date (if any)</label>
              <input type="date" className="input" value={q.q_last_donation_date||''}
                onChange={e => setQ(p => ({...p,q_last_donation_date:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Chronic Conditions / Allergies (optional)</label>
              <textarea rows="2" className="input resize-none" placeholder="e.g. diabetes, none…"
                value={q.q_chronic_conditions||''}
                onChange={e => setQ(p => ({...p,q_chronic_conditions:e.target.value}))}/>
            </div>
            <label className="flex items-start gap-3 p-3 rounded-xl bg-brand-50 border border-brand-100 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mt-0.5 rounded accent-brand-600"
                checked={!!q.consent_given} onChange={e => setQ(p => ({...p,consent_given:e.target.checked}))}/>
              <span className="text-sm text-ink-700">
                <strong>Consent:</strong> I confirm the above information is accurate and I voluntarily
                consent to donate blood. I understand BetterHand is a coordination platform only.
              </span>
            </label>
            <button type="button" onClick={submitQuestionnaire} disabled={qLoading}
              className="btn-primary w-full justify-center">
              {qLoading ? <Spinner size={16}/> : <ClipboardCheck size={16}/>}
              {qLoading ? 'Saving…' : 'Save Questionnaire & Get Priority'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
