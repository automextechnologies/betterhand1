import { useState, useEffect, useCallback } from 'react'
import { donationApi } from '../../api'
import { useWsStore } from '../../store/wsStore'
import { useAuthStore } from '../../store/authStore'
import BloodRequestForm from '../../components/hospital/BloodRequestForm'
import Top3Donors from '../../components/hospital/Top3Donors'
import NearestDonors from '../../components/hospital/NearestDonors'
import ChatWindow from '../../components/common/ChatWindow'
import LiveMap from '../../components/common/LiveMap'
import { AUTO_REFRESH_EVENT } from '../../components/common/Layout'
import {
  Plus, Droplets, CheckCircle, Clock, BarChart2,
  RefreshCw, AlertTriangle, ChevronDown, ChevronUp,
  Users, Trash2, Phone, MessageCircle, XCircle
} from 'lucide-react'
import { fmtAgo, urgencyColor, statusColor, callLink, whatsappLink } from '../../utils/helpers'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import api from '../../api/axios'


// ── Confirm Complete Modal ──────────────────────────────────────────────────
function CompleteModal({ response, onClose, onDone }) {
  const [units, setUnits]     = useState(1)
  const [notes, setNotes]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (action) => {
    setLoading(true)
    try {
      if (action === 'donated') {
        await donationApi.completeDonation(response.id, { units_donated: units, notes })
        toast.success('✅ Donation recorded! Cooldown started.')
      } else if (action === 'no_donation') {
        await api.post('/donation/responses/' + response.id + '/no-donation/', { notes })
        toast.success('Marked arrived — no donation, no cooldown.')
      } else if (action === 'cancel') {
        await api.post('/donation/responses/' + response.id + '/cancel/', { notes })
        toast.success('Donor cancelled.')
      }
      onDone()
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="card w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-ink-200">
          <h2 className=" font-bold text-ink-900">Complete Donation</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-lg text-ink-400">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-brand-950/40 border border-brand-700/30">
            <p className="text-sm text-ink-800  font-semibold">{response.donor_name}</p>
            <p className="text-xs text-ink-500 mt-0.5">{response.blood_group} donor</p>
          </div>
          <div>
            <label className="label">Units Donated</label>
            <input type="number" min="0" max="5" className="input" value={units}
              onChange={e => setUnits(+e.target.value)}/>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea rows="2" className="input resize-none" placeholder="Any notes…"
              value={notes} onChange={e => setNotes(e.target.value)}/>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => submit('cancel')} disabled={loading}
              className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all text-xs font-semibold">
              {loading ? <Spinner size={13}/> : <XCircle size={13}/>}
              Cancel
            </button>
            <button onClick={() => submit('no_donation')} disabled={loading}
              className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all text-xs font-semibold">
              {loading ? <Spinner size={13}/> : <CheckCircle size={13}/>}
              No Donation
            </button>
            <button onClick={() => submit('donated')} disabled={loading}
              className="btn-primary justify-center py-3 text-xs">
              {loading ? <Spinner size={13}/> : <CheckCircle size={13}/>}
              Donated ✅
            </button>
          </div>
          <p className="text-[11px] text-ink-400 text-center">
            Cancel = remove donor · No Donation = arrived but didn't donate (no cooldown) · Donated = record donation (90-day cooldown)
          </p>
        </div>
      </div>
    </div>
  )
}

export default function HospitalDashboard() {
  const { user }    = useAuthStore()
  const { on, off } = useWsStore()
  const [showForm, setShowForm]     = useState(false)
  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState(null)
  const [activeTab, setActiveTab]   = useState('requests')
  const [completing, setCompleting] = useState(null) // response to complete
  const [clearing, setClearing]     = useState(false)

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await donationApi.dashboard()
      setData(res.data)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  useEffect(() => {
    const h = () => fetchDashboard()
    on('donor_responded', h); on('donation_confirmed', h); on('donor_location_update', h)
    return () => { off('donor_responded', h); off('donation_confirmed', h); off('donor_location_update', h) }
  }, [on, off, fetchDashboard])

  useEffect(() => {
    const h = () => fetchDashboard()
    window.addEventListener(AUTO_REFRESH_EVENT, h)
    return () => window.removeEventListener(AUTO_REFRESH_EVENT, h)
  }, [fetchDashboard])

  // Clear all data
  const clearAllData = async () => {
    if (!window.confirm('⚠️ This will delete ALL blood requests, donations and chat history. Are you sure?')) return
    setClearing(true)
    try {
      await api.post('/donation/clear-data/')
      toast.success('✅ All data cleared!')
      setData(null)
      fetchDashboard()
    } catch {
      // Fallback: delete requests one by one
      try {
        const reqs = data?.active_requests || []
        for (const item of reqs) {
          await api.post(`/donation/requests/${item.request.id}/cancel/`)
        }
        toast.success('Active requests cancelled')
        fetchDashboard()
      } catch { toast.error('Could not clear data') }
    } finally { setClearing(false) }
  }

  const stats = data?.stats
  const activeRequests = data?.active_requests || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="text-ink-400 text-sm mt-0.5">
            {user?.profile?.name || 'Hospital'} · Real-time blood management
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Clear all data button */}
          <button onClick={clearAllData} disabled={clearing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm  font-semibold
                       bg-rose-50 text-rose-600 border border-danger-600/20
                       hover:bg-danger-600/20 transition-all">
            {clearing ? <Spinner size={13}/> : <Trash2 size={13}/>}
            Clear All Data
          </button>
          <button onClick={fetchDashboard} className="btn-ghost border border-white/10">
            <RefreshCw size={14}/> Refresh
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={15}/> New Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Requests',  val:stats?.total_requests??0,       icon:Droplets,      color:'text-brand-600',  bg:'bg-brand-100' },
          { label:'Active Now',      val:stats?.active_requests??0,      icon:AlertTriangle, color:'text-amber-600',  bg:'bg-amber-100' },
          { label:'Donations',       val:stats?.completed_donations??0,  icon:CheckCircle,   color:'text-green-600',  bg:'bg-green-100' },
          { label:'This Month',      val:stats?.donations_this_month??0, icon:BarChart2,      color:'text-blue-600',  bg:'bg-blue-100' },
        ].map(s => (
          <div key={s.label} className="stat-card animate-fade-up">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon size={18} className={s.color}/>
            </div>
            <p className="text-2xl  font-bold text-ink-900">{s.val}</p>
            <p className="text-xs text-ink-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-50 border border-ink-200 w-fit">
        {[
          { id:'requests', icon:Droplets, label:'Active Requests' },
          { id:'donors',   icon:Users,    label:'Find Donors' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm  font-semibold transition-all
              ${activeTab===t.id ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-ink-800 shadow-md' : 'text-ink-400 hover:text-ink-600'}`}>
            <t.icon size={15}/>{t.label}
          </button>
        ))}
      </div>

      {/* Tab: Active Requests */}
      {activeTab === 'requests' && (
        loading ? (
          <div className="flex justify-center py-10"><Spinner size={28} className="text-brand-600"/></div>
        ) : activeRequests.length === 0 ? (
          <div className="card p-10 text-center">
            <Droplets size={32} className="text-ink-200 mx-auto mb-3"/>
            <p className="text-ink-400">No active requests.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
              <Plus size={15}/> Create Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeRequests.map(item => {
              const req       = item.request
              const isOpen    = expanded === req.id
              const confirmed = item.confirmed_donors || []
              const top3      = item.top_3 || []
              const mapDonors = confirmed.map(d => ({
                id:d.id, name:d.donor_name,
                lat:d.donor_latitude, lng:d.donor_longitude, eta:d.eta_minutes
              }))

              return (
                <div key={req.id} className="card overflow-hidden">
                  {/* Request row */}
                  <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-50 transition-colors"
                       onClick={() => setExpanded(isOpen ? null : req.id)}>
                    <div className="w-14 h-14 rounded-2xl bg-blood flex items-center justify-center shrink-0">
                      <span className="font-mono font-bold text-rose-600 text-lg">{req.blood_group}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className=" font-semibold text-ink-900">
                          {req.patient_name||'Patient'} · {req.units_needed} unit{req.units_needed>1?'s':''}
                        </h3>
                        <span className={urgencyColor(req.urgency)}>{req.urgency}</span>
                        <span className={statusColor(req.status)}>{req.status}</span>
                        {req.notify_ward_members && <span className="badge badge-brand text-[10px]">🏛️ Ward notified</span>}
                      </div>
                      <p className="text-sm text-ink-400 mt-0.5">
                        {req.patient_ward&&`${req.patient_ward} · `}{req.patient_condition?.slice(0,60)} · {fmtAgo(req.created_at)}
                      </p>
                      <div className="flex gap-3 mt-1 text-xs text-ink-400">
                        <span>✅ {item.accepted_count} accepted</span>
                        <span>❌ {item.rejected_count} rejected</span>
                        <span>⏳ {item.pending_count} pending</span>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-ink-300 shrink-0"/> : <ChevronDown size={16} className="text-ink-300 shrink-0"/>}
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div className="border-t border-ink-200 p-4">
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* Top 3 */}
                        <div>
                          <h4 className=" font-semibold text-ink-600 text-sm mb-3">Top 3 Donors</h4>
                          <Top3Donors requestId={req.id} donors={top3}
                            stats={{ total_accepted:item.accepted_count, pending_count:item.pending_count, rejected_count:item.rejected_count }}
                            onConfirmed={fetchDashboard}/>
                        </div>

                        {/* Map + confirmed list */}
                        <div>
                          <h4 className=" font-semibold text-ink-600 text-sm mb-3">Live Tracking</h4>
                          <LiveMap
                            hospital={{ name:user?.profile?.name, lat:req.hospital_latitude, lng:req.hospital_longitude }}
                            donors={mapDonors} className="h-56"/>

                          {/* Confirmed donors with complete buttons */}
                          {confirmed.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {confirmed.map((d, i) => (
                                <div key={d.id} className="card p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-ink-900
                                      ${['bg-emerald-600','bg-amber-600','bg-sky-600'][i]}`}>{i+1}</div>
                                    <span className="text-ink-700 text-sm font-semibold flex-1">{d.donor_name}</span>
                                    <span className={`badge text-xs ${statusColor(d.status)}`}>{d.status}</span>
                                  </div>

                                  {/* Contact */}
                                  <div className="flex gap-1.5 mb-2">
                                    {d.donor_phone && (
                                      <a href={callLink(d.donor_phone)}
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-sky-600/20 text-sky-400 text-xs font-semibold border border-sky-600/20">
                                        <Phone size={11}/> Call
                                      </a>
                                    )}
                                    {d.donor_whatsapp && (
                                      <a href={whatsappLink(d.donor_whatsapp)} target="_blank" rel="noreferrer"
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold border border-accent-600/20">
                                        <MessageCircle size={11}/> WhatsApp
                                      </a>
                                    )}
                                  </div>

                                  {/* Complete buttons — only for confirmed */}
                                  {d.status === 'confirmed' && (
                                    <button onClick={() => setCompleting({...d, blood_group: req.blood_group})}
                                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl
                                                 bg-emerald-50 text-emerald-600 border border-accent-500/30
                                                 hover:bg-accent-600/30 transition-all text-xs font-semibold">
                                      <CheckCircle size={12}/> Mark Donation Complete
                                    </button>
                                  )}
                                  {d.status === 'completed' && (
                                    <div className="text-center py-1.5 text-xs text-emerald-600 font-semibold">
                                      ✅ Donation Completed
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Chat */}
                        <div>
                          {confirmed.length > 0 ? (
                            <ChatWindow responseId={confirmed[0].id}
                              otherName={confirmed[0].donor_name}
                              otherPhone={confirmed[0].donor_phone}
                              otherWhatsapp={confirmed[0].donor_whatsapp}
                              className="h-72"/>
                          ) : (
                            <div className="card h-72 flex items-center justify-center text-center p-6">
                              <div>
                                <Clock size={24} className="text-ink-200 mx-auto mb-2"/>
                                <p className="text-ink-400 text-sm">Chat available after confirming donors</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Tab: Find Donors */}
      {activeTab === 'donors' && <NearestDonors/>}

      {/* Modals */}
      {showForm && (
        <BloodRequestForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchDashboard() }}
        />
      )}

      {completing && (
        <CompleteModal
          response={completing}
          onClose={() => setCompleting(null)}
          onDone={() => { setCompleting(null); fetchDashboard() }}
        />
      )}
    </div>
  )
}
