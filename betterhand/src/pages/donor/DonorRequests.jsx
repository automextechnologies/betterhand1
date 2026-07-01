import { useState, useEffect, useCallback } from 'react'
import { donationApi } from '../../api'
import { AUTO_REFRESH_EVENT } from '../../components/common/Layout'
import { Bell, MapPin, Clock, Building, User, Check, X, RefreshCw, Landmark } from 'lucide-react'
import { fmtAgo } from '../../utils/helpers'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function DonorRequests() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState({})

  const load = useCallback(async () => {
    try { const r = await donationApi.pendingRequests(); setPending(r.data?.results || r.data || []) }
    catch { toast.error('Failed to load requests') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = () => load(); window.addEventListener(AUTO_REFRESH_EVENT, h)
    return () => window.removeEventListener(AUTO_REFRESH_EVENT, h)
  }, [load])

  const respond = async (id, status, lat, lng) => {
    setResponding(p => ({...p,[id]:true}))
    try {
      await donationApi.respond(id, { status, donor_latitude: lat, donor_longitude: lng })
      toast.success(status==='accepted' ? '✅ Accepted! Hospital will confirm you shortly.' : 'Response recorded.')
      load()
    } catch { toast.error('Failed to respond') }
    finally { setResponding(p => ({...p,[id]:false})) }
  }

  const handleAccept = (resp) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => respond(resp.id,'accepted',pos.coords.latitude,pos.coords.longitude),
        () => respond(resp.id,'accepted'), {timeout:8000})
    } else respond(resp.id,'accepted')
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size={40} className="text-brand-600"/></div>

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-12">
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-ink-900 flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 rounded-2xl">
              <Bell size={24} className="text-brand-600"/>
            </div>
            Blood Requests
          </h1>
          <p className="text-ink-500 text-[15px] font-medium mt-2">Hospitals near you that urgently need your blood type.</p>
        </div>
        <button onClick={load} className="btn-secondary shadow-sm hover:shadow-md">
          <RefreshCw size={16}/> Refresh
        </button>
      </motion.div>

      {pending.length === 0 ? (
        <motion.div variants={itemVariants} className="card p-12 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-20 h-20 bg-ink-50 rounded-full flex items-center justify-center mb-6">
            <Bell size={32} className="text-ink-400"/>
          </div>
          <h3 className="text-xl font-display font-bold text-ink-900 mb-2">No pending requests right now</h3>
          <p className="text-ink-500 text-[15px] max-w-sm mx-auto leading-relaxed">You'll be notified immediately when a hospital or ward member requires your assistance.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pending.map(resp => (
            <motion.div key={resp.id} variants={itemVariants} className={`card flex flex-col p-6 transition-all ${resp.via_ward ? 'border-2 border-emerald-400 shadow-[0_8px_20px_rgba(16,185,129,0.15)]' : ''}`}>
              {resp.via_ward && (
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-b-xl rounded-t-none w-fit self-start mb-4 -mt-6 -ml-6 shadow-sm">
                  Ward Priority
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center font-mono font-black text-brand-600 text-xl shrink-0 shadow-inner">
                  {resp.blood_group}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="text-[17px] font-display font-bold text-ink-900 flex items-center gap-1.5"><Building size={16} className="text-ink-400"/> {resp.hospital_name}</h4>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider
                      ${resp.urgency === 'Critical' ? 'bg-brand-100 text-brand-700' : 
                        resp.urgency === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                      {resp.urgency}
                    </span>
                    <span className="flex items-center gap-1 text-[13px] font-bold text-ink-600">
                      • {resp.units_needed} unit{resp.units_needed>1?'s':''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 flex-1 mb-6">
                {resp.patient_name && (
                  <div className="flex items-start gap-2 text-sm">
                    <User size={16} className="text-ink-400 mt-0.5 shrink-0"/>
                    <div>
                      <p className="font-semibold text-ink-900">{resp.patient_name}</p>
                      {resp.patient_condition && <p className="text-ink-500 text-[13px]">{resp.patient_condition}</p>}
                    </div>
                  </div>
                )}
                
                {resp.via_ward && resp.ward_member_name && (
                  <div className="flex items-start gap-2 text-sm bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                    <Landmark size={16} className="text-emerald-600 mt-0.5 shrink-0"/>
                    <div>
                      <p className="font-bold text-emerald-800">Coordinated by {resp.ward_member_name}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 pt-2 text-[13px] font-medium text-ink-500">
                  {resp.distance_km != null && <span className="flex items-center gap-1.5 bg-ink-50 px-2.5 py-1 rounded-lg"><MapPin size={14}/> {resp.distance_km} km away</span>}
                  <span className="flex items-center gap-1.5 bg-ink-50 px-2.5 py-1 rounded-lg"><Clock size={14}/> {fmtAgo(resp.created_at)}</span>
                </div>
              </div>

              {resp.status === 'pending' ? (
                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-ink-100">
                  <button onClick={() => respond(resp.id,'rejected')} disabled={responding[resp.id]}
                    className="btn-ghost justify-center bg-ink-50">
                    <X size={18}/> Decline
                  </button>
                  <button onClick={() => handleAccept(resp)} disabled={responding[resp.id]}
                    className="btn-primary justify-center bg-gradient-to-r from-brand-600 to-brand-500 shadow-brand-500/25">
                    {responding[resp.id] ? <Spinner size={18}/> : <Check size={18}/>} Accept
                  </button>
                </div>
              ) : (
                <div className={`text-center py-3 rounded-2xl text-[13px] font-bold mt-auto
                  ${resp.status==='accepted'?'bg-emerald-50 text-emerald-700':resp.status==='confirmed'?'bg-brand-50 text-brand-700':'bg-ink-100 text-ink-500'}`}>
                  {resp.status==='accepted' ? '✓ Accepted — awaiting confirmation'
                   : resp.status==='confirmed' ? '🎉 Confirmed! Head to hospital'
                   : resp.status}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
