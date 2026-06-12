import { useState, useEffect, useCallback } from 'react'
import { donationApi } from '../../api'
import { AUTO_REFRESH_EVENT } from '../../components/common/Layout'
import { Droplets, Clock, CheckCircle, XCircle, User, RefreshCw, ChevronDown } from 'lucide-react'
import { fmtAgo, urgencyColor } from '../../utils/helpers'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function HospitalRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  const load = useCallback(async () => {
    try { const r = await donationApi.hospitalRequests(); setRequests(r.data?.results || r.data || []) }
    catch { toast.error('Failed to load requests') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = () => load(); window.addEventListener(AUTO_REFRESH_EVENT, h)
    return () => window.removeEventListener(AUTO_REFRESH_EVENT, h)
  }, [load])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} className="text-brand-600"/></div>

  const filtered = filter === 'all' ? requests
    : requests.filter(r => filter === 'active' ? ['pending','active','confirmed'].includes(r.status) : r.status === filter)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2"><Droplets size={22} className="text-brand-600"/> Blood Requests</h1>
          <p className="text-ink-400 text-sm mt-0.5">All requests created by your hospital</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14}/> Refresh</button>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-surface-100 border border-ink-200 w-fit">
        {[['all','All'],['active','Active'],['completed','Completed'],['cancelled','Cancelled']].map(([id,label]) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${filter===id ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-md' : 'text-ink-500 hover:text-brand-600'}`}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <Droplets size={28} className="text-ink-200 mx-auto mb-3"/>
          <p className="text-ink-400 text-sm">No {filter !== 'all' ? filter : ''} requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <div key={req.id} className="card overflow-hidden">
              <button onClick={() => setExpanded(expanded===req.id?null:req.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-surface-50 transition-colors text-left">
                <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center font-mono font-bold text-brand-600 shrink-0">
                  {req.blood_group}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-ink-900">{req.patient_name || 'Patient'}</h4>
                    <span className="text-xs text-ink-400">{req.units_needed} unit{req.units_needed>1?'s':''}</span>
                    <span className={urgencyColor(req.urgency)}>{req.urgency}</span>
                    <span className={`badge ${req.status==='completed'?'badge-green':req.status==='cancelled'?'badge-gray':req.status==='confirmed'?'badge-brand':'badge-yellow'}`}>{req.status}</span>
                  </div>
                  <p className="text-xs text-ink-400 mt-0.5">{req.patient_ward} · {fmtAgo(req.created_at)}</p>
                </div>
                <ChevronDown size={16} className={`text-ink-400 transition-transform ${expanded===req.id?'rotate-180':''}`}/>
              </button>
              {expanded === req.id && (
                <div className="px-4 pb-4 pt-1 border-t border-ink-100 text-sm text-ink-600 space-y-1 animate-fade-up">
                  {req.patient_condition && <p><strong>Condition:</strong> {req.patient_condition}</p>}
                  {req.patient_room && <p><strong>Room/Bed:</strong> {req.patient_room} / {req.patient_bed||'—'}</p>}
                  {req.bystander_name && <p><strong>Bystander:</strong> {req.bystander_name} ({req.bystander_phone})</p>}
                  <div className="flex gap-4 pt-2 text-xs">
                    <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={12}/> {req.accepted_count ?? 0} accepted</span>
                    <span className="flex items-center gap-1 text-rose-600"><XCircle size={12}/> {req.rejected_count ?? 0} rejected</span>
                    <span className="flex items-center gap-1 text-amber-600"><Clock size={12}/> {req.pending_count ?? 0} pending</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
