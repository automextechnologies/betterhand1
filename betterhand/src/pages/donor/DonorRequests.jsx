import { useState, useEffect, useCallback } from 'react'
import { donationApi } from '../../api'
import { AUTO_REFRESH_EVENT } from '../../components/common/Layout'
import { Bell, MapPin, Clock, Building, User, Check, X, RefreshCw, Landmark } from 'lucide-react'
import { fmtAgo, urgencyColor } from '../../utils/helpers'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

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

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} className="text-brand-600"/></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2"><Bell size={22} className="text-brand-600"/> Blood Requests</h1>
          <p className="text-ink-400 text-sm mt-0.5">Hospitals near you that need blood</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14}/> Refresh</button>
      </div>

      {pending.length === 0 ? (
        <div className="card p-10 text-center">
          <Bell size={28} className="text-ink-200 mx-auto mb-3"/>
          <p className="text-ink-400 text-sm">No pending requests right now.</p>
          <p className="text-ink-300 text-xs mt-1">You'll be notified when a hospital needs your blood type.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map(resp => (
            <div key={resp.id} className="card p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center font-mono font-bold text-brand-600 text-lg shrink-0">
                  {resp.blood_group}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-ink-900 flex items-center gap-1"><Building size={14}/> {resp.hospital_name}</h4>
                    <span className={urgencyColor(resp.urgency)}>{resp.urgency}</span>
                    {resp.via_ward && <span className="badge badge-brand flex items-center gap-1"><Landmark size={10}/> Via Ward Member</span>}
                  </div>
                  {resp.patient_name && <p className="text-xs text-ink-500 mt-1 flex items-center gap-1"><User size={11}/> {resp.patient_name}</p>}
                  {resp.patient_condition && <p className="text-xs text-ink-400 mt-0.5">{resp.patient_condition}</p>}
                  <div className="flex gap-3 mt-1 text-xs text-ink-400">
                    <span>{resp.units_needed} unit{resp.units_needed>1?'s':''}</span>
                    {resp.distance_km != null && <span className="flex items-center gap-1"><MapPin size={10}/> {resp.distance_km} km</span>}
                    <span className="flex items-center gap-1"><Clock size={10}/> {fmtAgo(resp.created_at)}</span>
                  </div>
                  {resp.via_ward && resp.ward_member_name && (
                    <p className="text-xs text-brand-600 mt-1">Coordinated by {resp.ward_member_name}</p>
                  )}
                </div>
              </div>
              {resp.status === 'pending' ? (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleAccept(resp)} disabled={responding[resp.id]}
                    className="btn-primary justify-center">
                    {responding[resp.id] ? <Spinner size={15}/> : <Check size={15}/>} Accept
                  </button>
                  <button onClick={() => respond(resp.id,'rejected')} disabled={responding[resp.id]}
                    className="btn-secondary justify-center">
                    <X size={15}/> Decline
                  </button>
                </div>
              ) : (
                <div className={`text-center py-2 rounded-xl text-sm font-semibold
                  ${resp.status==='accepted'?'bg-emerald-50 text-emerald-700':resp.status==='confirmed'?'bg-brand-50 text-brand-700':'bg-ink-100 text-ink-500'}`}>
                  {resp.status==='accepted' ? '✓ You accepted — awaiting confirmation'
                   : resp.status==='confirmed' ? '🎉 Confirmed! Head to the hospital'
                   : resp.status}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
