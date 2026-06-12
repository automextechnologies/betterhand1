import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { donationApi, authApi } from '../../api'
import { BLOOD_GROUPS, getErrMsg } from '../../utils/helpers'
import { STATES, getDistricts, LOCAL_BODY_TYPES } from '../../utils/locationData'
import { Droplets, User, Users, X, MapPin, ChevronDown, Search, Phone, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../common/Spinner'

const SS = { color:'#27272a', backgroundColor:'#ffffff' }
const OS = { backgroundColor:'#ffffff', color:'#27272a' }

function StepDot({ num, label, active, done }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold
      ${active ? 'text-surface-900' : done ? 'text-green-600' : 'text-surface-400'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
        ${active ? 'bg-gradient-to-r from-brand-600 to-brand-400 border-brand-400 text-white shadow-md'
          : done  ? 'bg-green-100 border-green-500 text-green-600'
          : 'bg-surface-100 border-surface-300 text-surface-400'}`}>
        {done ? '✓' : num}
      </div>
      <span className="hidden sm:block">{label}</span>
    </div>
  )
}

function SField({ label, name, register, errors, options, req, placeholder }) {
  return (
    <div>
      <label className="label">{label}{req&&' *'}</label>
      <div className="relative">
        <select className="select pr-8" style={SS}
          {...register(name, req?{required:'Required'}:{})}>
          <option value="" style={OS}>{placeholder||`Select ${label}`}</option>
          {options.map(o=>(
            <option key={typeof o==='string'?o:o.value}
                    value={typeof o==='string'?o:o.value} style={OS}>
              {typeof o==='string'?o:o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
      </div>
      {errors?.[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  )
}

export default function BloodRequestForm({ onSuccess, onClose }) {
  const { register, handleSubmit, watch, getValues, formState:{errors} } = useForm({
    defaultValues:{ urgency:'urgent', units_needed:1, search_radius_km:50, notify_ward_members:false }
  })

  const [step, setStep]             = useState(1)
  const [loading, setLoading]       = useState(false)
  const [wardMembers, setWardMembers] = useState([])
  const [searching, setSearching]   = useState(false)
  const [selected, setSelected]     = useState(null)
  const submitRef = useRef(false)

  const notifyWard = watch('notify_ward_members')
  const pState     = watch('patient_state')
  const pDistricts = getDistricts(pState)

  const searchWard = async () => {
    const state   = getValues('patient_state')
    const district= getValues('patient_district')
    if (!state || !district) return
    setSearching(true)
    setSelected(null)
    try {
      const res = await authApi.wards({
        state, district,
        local_body_name: getValues('patient_local_body_name') || '',
        ward_number:     getValues('patient_ward_number') || '',
      })
      const list = res.data?.results || res.data || []
      setWardMembers(Array.isArray(list) ? list : [])
      if (!list.length) toast('No ward member found for this area.', {icon:'ℹ️'})
    } catch { setWardMembers([]) }
    finally { setSearching(false) }
  }

  const validateStep = () => {
    const v = getValues()
    if (step === 1) {
      if (!v.blood_group)  { toast.error('Select blood group'); return false }
      if (!v.urgency)      { toast.error('Select urgency'); return false }
      if (!v.units_needed) { toast.error('Enter units needed'); return false }
    }
    if (step === 2) {
      if (!v.patient_name)      { toast.error('Enter patient name'); return false }
      if (!v.patient_condition) { toast.error('Enter medical condition'); return false }
      if (!v.patient_ward_type) { toast.error('Enter ward/unit'); return false }
    }
    return true
  }

  const goNext = () => { if (validateStep()) setStep(s => s+1) }
  const goBack = () => setStep(s => s-1)

  const doSubmit = async (data) => {
    if (submitRef.current) return
    submitRef.current = true
    setLoading(true)
    try {
      const payload = {
        blood_group:       data.blood_group,
        units_needed:      +data.units_needed,
        urgency:           data.urgency,
        note:              data.note || '',
        search_radius_km:  +data.search_radius_km,
        patient_name:      data.patient_name,
        patient_age:       data.patient_age ? +data.patient_age : undefined,
        patient_condition: data.patient_condition,
        patient_ward:      data.patient_ward_type || '',
        patient_room:      data.patient_room || '',
        patient_bed:       data.patient_bed  || '',
        bystander_name:    data.bystander_name   || '',
        bystander_phone:   data.bystander_phone  || '',
        notify_ward_members: !!data.notify_ward_members,
        ward_member_message: data.ward_member_message || '',
        patient_state:           data.patient_state           || '',
        patient_district:        data.patient_district        || '',
        patient_local_body_type: data.patient_local_body_type || '',
        patient_local_body_name: data.patient_local_body_name || '',
        patient_ward_number:     data.patient_ward_number     || '',
      }
      if (selected) payload.ward_id = selected.id
      await donationApi.createRequest(payload)
      toast.success('🩸 Blood request created! Notifying donors…')
      onSuccess?.()
    } catch(e) {
      toast.error(getErrMsg(e))
      submitRef.current = false
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="card w-full max-w-2xl max-h-[92vh] flex flex-col shadow-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-brand-600 to-brand-400 flex items-center justify-center">
              <Droplets size={16} className="text-white"/>
            </div>
            <h2 className="font-bold text-surface-900">New Blood Request</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-900 transition-colors">
            <X size={18}/>
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-surface-200 shrink-0">
          <StepDot num={1} label="Blood Details" active={step===1} done={step>1}/>
          <div className="flex-1 h-px bg-surface-200"/>
          <StepDot num={2} label="Patient Info"  active={step===2} done={step>2}/>
          <div className="flex-1 h-px bg-surface-200"/>
          <StepDot num={3} label="Ward Member"   active={step===3} done={step>3}/>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">

          {/* ── STEP 1: Blood Details ── */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-up">
              <p className="text-xs text-surface-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Droplets size={12} className="text-brand-600"/> Blood Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <SField label="Blood Group" name="blood_group" register={register}
                  errors={errors} options={BLOOD_GROUPS} req placeholder="Select blood group"/>
                <div>
                  <label className="label">Units Needed *</label>
                  <input type="number" min="1" max="10" className="input"
                    {...register('units_needed',{required:true,min:1})}/>
                </div>
                <SField label="Urgency" name="urgency" register={register} errors={errors} req
                  options={[
                    {value:'normal',  label:'🟢 Normal (24 hrs)'},
                    {value:'urgent',  label:'🟡 Urgent (4-6 hrs)'},
                    {value:'critical',label:'🔴 Critical (Immediate)'},
                  ]}/>
                <div>
                  <label className="label">Search Radius (km)</label>
                  <input type="number" min="5" max="200" className="input" {...register('search_radius_km')}/>
                </div>
              </div>
              <div>
                <label className="label">Additional Note</label>
                <textarea rows="2" className="input resize-none" placeholder="Any extra info…" {...register('note')}/>
              </div>
            </div>
          )}

          {/* ── STEP 2: Patient Info ── */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-up">
              <p className="text-xs text-surface-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <User size={12} className="text-brand-600"/> Patient Information
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Patient Name *</label>
                  <input className="input" placeholder="Full name"
                    {...register('patient_name',{required:'Required'})}/>
                  {errors.patient_name && <p className="text-red-500 text-xs mt-1">{errors.patient_name.message}</p>}
                </div>
                <div>
                  <label className="label">Age</label>
                  <input type="number" className="input" placeholder="45" {...register('patient_age')}/>
                </div>
                <div className="col-span-2">
                  <label className="label">Medical Condition *</label>
                  <textarea rows="2" className="input resize-none"
                    placeholder="e.g., Open heart surgery, emergency transfusion…"
                    {...register('patient_condition',{required:'Required'})}/>
                  {errors.patient_condition && <p className="text-red-500 text-xs mt-1">{errors.patient_condition.message}</p>}
                </div>
                <div>
                  <label className="label">Ward / Unit *</label>
                  <input className="input" placeholder="ICU, General…"
                    {...register('patient_ward_type',{required:'Required'})}/>
                  {errors.patient_ward_type && <p className="text-red-500 text-xs mt-1">{errors.patient_ward_type.message}</p>}
                </div>
                <div>
                  <label className="label">Room No.</label>
                  <input className="input" placeholder="204" {...register('patient_room')}/>
                </div>
                <div>
                  <label className="label">Bed No.</label>
                  <input className="input" placeholder="10" {...register('patient_bed')}/>
                </div>
                <div>
                  <label className="label">Bystander Name</label>
                  <input className="input" placeholder="Patient's family member"
                    {...register('bystander_name')}/>
                </div>
                <div>
                  <label className="label">Bystander Contact</label>
                  <input className="input" placeholder="+91 9876543210"
                    {...register('bystander_phone')}/>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Ward Member ── */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-up">
              <p className="text-xs text-surface-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Users size={12} className="text-brand-600"/> Ward Member Notification
                <span className="badge badge-gray ml-2">Optional</span>
              </p>

              <div className="p-4 rounded-xl bg-brand-50 border border-brand-200">
                <p className="text-sm text-brand-700 font-semibold mb-1">🏛️ Notify a Ward Member?</p>
                <p className="text-xs text-brand-600/70 leading-relaxed">
                  Enter the patient's home area below to find and notify their local
                  government ward member. They will personally contact nearby donors —
                  increasing success rate significantly. <strong>This step is optional.</strong>
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
                <div>
                  <p className="text-sm font-semibold text-surface-900">Enable Ward Member Notification</p>
                  <p className="text-xs text-surface-400 mt-0.5">Toggle on to fill patient home area</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" {...register('notify_ward_members')}/>
                    <div className="w-12 h-6 bg-surface-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-brand-600 peer-checked:to-brand-400 transition-all duration-300"/>
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-6 shadow-sm"/>
                  </div>
                </label>
              </div>

              {notifyWard && (
                <div className="space-y-4 p-4 rounded-xl bg-surface-50 border border-surface-200">
                  <p className="text-xs text-surface-500 flex items-center gap-1.5">
                    <MapPin size={11} className="text-brand-600"/> Patient's Home Ward / Area
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">State</label>
                      <div className="relative">
                        <select className="select pr-8" style={SS} {...register('patient_state')}>
                          <option value="" style={OS}>Select state</option>
                          {STATES.map(s=><option key={s} value={s} style={OS}>{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
                      </div>
                    </div>
                    <div>
                      <label className="label">District</label>
                      <div className="relative">
                        <select className="select pr-8" style={SS} {...register('patient_district')}>
                          <option value="" style={OS}>{pState?'Select district':'Select state first'}</option>
                          {pDistricts.map(d=><option key={d} value={d} style={OS}>{d}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
                      </div>
                    </div>
                    <SField label="Local Body Type" name="patient_local_body_type"
                      register={register} errors={errors} options={LOCAL_BODY_TYPES}/>
                    <div>
                      <label className="label">Local Body Name</label>
                      <input className="input" placeholder="e.g. Kochi Corporation"
                        {...register('patient_local_body_name')}/>
                    </div>
                    <div>
                      <label className="label">Ward Number</label>
                      <input className="input" placeholder="e.g. 15"
                        {...register('patient_ward_number')}/>
                    </div>
                    <div className="flex items-end">
                      <button type="button" onClick={searchWard} disabled={searching}
                        className="btn-secondary w-full justify-center text-sm">
                        {searching ? <Spinner size={14}/> : <Search size={14}/>}
                        {searching ? 'Searching…' : 'Find Ward Member'}
                      </button>
                    </div>
                  </div>

                  {wardMembers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-green-600 font-semibold">
                        ✅ {wardMembers.length} Ward Member{wardMembers.length>1?'s':''} Found
                      </p>
                      {wardMembers.map(wm => {
                        const m   = wm.members?.[0]
                        const sel = selected?.id === wm.id
                        return (
                          <div key={wm.id} onClick={()=>setSelected(sel?null:wm)}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                              ${sel?'border-brand-500 bg-brand-50 shadow-md':'border-surface-200 bg-white hover:border-brand-300'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${sel?'bg-gradient-to-r from-brand-600 to-brand-400 text-white':'bg-surface-100 text-surface-600'}`}>
                              {wm.ward_number}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-surface-900 text-sm">
                                Ward {wm.ward_number} — {wm.local_body_name}
                              </p>
                              <p className="text-xs text-surface-400">{wm.district}, {wm.state}</p>
                              {m && (
                                <p className="text-xs text-brand-600 mt-0.5">
                                  👤 {m.full_name} · {m.phone}
                                  {m.is_verified && <span className="ml-2 badge badge-green text-[9px]">✓ Verified</span>}
                                </p>
                              )}
                            </div>
                            {sel && <span className="badge badge-green shrink-0 text-xs">Selected ✓</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div>
                    <label className="label">Message to Ward Member</label>
                    <textarea rows="3" className="input resize-none"
                      placeholder="Explain urgency, patient details, any special notes…"
                      {...register('ward_member_message')}/>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                <p className="text-xs text-green-700 leading-relaxed">
                  ✅ Click <strong>"Create Request"</strong> below to send.
                  {notifyWard && selected
                    ? ` Ward member ${selected.members?.[0]?.full_name || 'selected'} will be notified.`
                    : notifyWard
                    ? ' No ward member selected — only direct donors will be notified.'
                    : ' Only direct donors will be notified.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-200 bg-white flex gap-3 shrink-0">
          {step > 1 ? (
            <button type="button" onClick={goBack} className="btn-secondary flex-1 justify-center">
              <ArrowLeft size={15}/> Back
            </button>
          ) : (
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button type="button" onClick={goNext} className="btn-primary flex-1 justify-center">
              Next <ArrowRight size={15}/>
            </button>
          ) : (
            <button type="button"
              disabled={loading}
              onClick={handleSubmit(doSubmit)}
              className="btn-primary flex-1 justify-center shadow-lg">
              {loading
                ? <><Spinner size={16}/> Creating…</>
                : <><Droplets size={16}/> Create Request</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
