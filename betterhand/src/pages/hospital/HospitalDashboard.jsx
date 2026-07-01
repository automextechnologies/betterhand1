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
  Users, Trash2, Phone, MessageCircle, XCircle, MapPin
} from 'lucide-react'
import { fmtAgo, urgencyColor, statusColor, callLink, whatsappLink } from '../../utils/helpers'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'

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
    } catch { toast.error('Failed to update donation status') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card w-full max-w-md overflow-hidden shadow-2xl border-brand-200">
        <div className="flex items-center justify-between p-6 border-b border-ink-100 bg-white/50">
          <h2 className="text-xl font-display font-black text-ink-900">Complete Donation</h2>
          <button onClick={onClose} className="p-2 hover:bg-ink-100 rounded-xl text-ink-500 transition-colors"><XCircle size={20}/></button>
        </div>
        <div className="p-6 space-y-6 bg-white/80">
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center font-display font-bold text-brand-600 shadow-sm border border-brand-100">
              {response.blood_group}
            </div>
            <div>
              <p className="text-[15px] text-ink-900 font-bold">{response.donor_name}</p>
              <p className="text-xs text-brand-600 font-semibold mt-0.5 uppercase tracking-wider">Donor Profile</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="label">Units Donated</label>
            <input type="number" min="0" max="5" className="input text-lg font-bold" value={units}
              onChange={e => setUnits(+e.target.value)}/>
          </div>
          <div className="space-y-1.5">
            <label className="label">Medical Notes (optional)</label>
            <textarea rows="3" className="input resize-none" placeholder="Add any relevant medical notes here…"
              value={notes} onChange={e => setNotes(e.target.value)}/>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button onClick={() => submit('cancel')} disabled={loading}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all text-[13px] font-bold shadow-sm">
              {loading ? <Spinner size={16}/> : <XCircle size={16}/>}
              Cancel
            </button>
            <button onClick={() => submit('no_donation')} disabled={loading}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all text-[13px] font-bold shadow-sm whitespace-nowrap">
              {loading ? <Spinner size={16}/> : <AlertTriangle size={16}/>}
              No Donation
            </button>
            <button onClick={() => submit('donated')} disabled={loading}
              className="btn-primary justify-center py-3 px-4 text-[13px] shadow-brand-500/25">
              {loading ? <Spinner size={16}/> : <CheckCircle size={16}/>}
              Donated
            </button>
          </div>
          <p className="text-xs text-ink-500 text-center font-medium leading-relaxed bg-ink-50 p-3 rounded-xl">
            <span className="font-bold text-ink-700">Cancel</span> removes donor · <span className="font-bold text-ink-700">No Donation</span> means arrived but didn't donate (no cooldown) · <span className="font-bold text-brand-600">Donated</span> records donation and starts 90-day cooldown
          </p>
        </div>
      </motion.div>
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
    if (!window.confirm('⚠️ CRITICAL WARNING: This will permanently delete ALL blood requests, donations and chat history. Are you absolutely sure you want to proceed?')) return
    setClearing(true)
    try {
      await api.post('/donation/clear-data/')
      toast.success('✅ All system data successfully cleared!')
      setData(null)
      fetchDashboard()
    } catch {
      // Fallback: delete requests one by one
      try {
        const reqs = data?.active_requests || []
        for (const item of reqs) {
          await api.post(`/donation/requests/${item.request.id}/cancel/`)
        }
        toast.success('Active requests cancelled as fallback')
        fetchDashboard()
      } catch { toast.error('System failed to clear data') }
    } finally { setClearing(false) }
  }

  const stats = data?.stats
  const activeRequests = data?.active_requests || []

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-12">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <span className="text-2xl font-black text-brand-600">H</span>
          </div>
          <div>
            <h1 className="text-3xl font-display font-black text-ink-900 tracking-tight">Hospital Command Center</h1>
            <p className="text-ink-500 text-[15px] font-medium mt-1">
              {user?.profile?.name || 'Hospital'} • Real-time emergency blood management
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={clearAllData} disabled={clearing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-bold
                       bg-white text-rose-600 border border-rose-200 shadow-sm
                       hover:bg-rose-50 hover:border-rose-300 transition-all">
            {clearing ? <Spinner size={16}/> : <Trash2 size={16}/>}
            Clear System Data
          </button>
          <button onClick={fetchDashboard} className="btn-secondary bg-white border border-ink-200 shadow-sm hover:border-ink-300 px-4 py-2.5">
            <RefreshCw size={16}/> Sync
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary px-5 py-2.5 shadow-brand-500/25">
            <Plus size={18}/> Broadcast Request
          </button>
        </div>
      </motion.div>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label:'Total Requests',  val:stats?.total_requests??0,       icon:Droplets,      color:'text-brand-600',  bg:'bg-brand-50' },
          { label:'Active Now',      val:stats?.active_requests??0,      icon:AlertTriangle, color:'text-amber-600',  bg:'bg-amber-50' },
          { label:'Donations',       val:stats?.completed_donations??0,  icon:CheckCircle,   color:'text-emerald-600',  bg:'bg-emerald-50' },
          { label:'This Month',      val:stats?.donations_this_month??0, icon:BarChart2,     color:'text-sky-600',  bg:'bg-sky-50' },
        ].map(s => (
          <motion.div variants={itemVariants} key={s.label} className="card p-6 flex items-center gap-5 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/40 to-transparent rounded-full blur-2xl -z-10 group-hover:scale-110 transition-transform duration-500`} />
            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center shrink-0 shadow-inner border border-white/50`}>
              <s.icon size={24} className={s.color}/>
            </div>
            <div>
              <p className="text-3xl font-display font-black text-ink-900 leading-none">{s.val}</p>
              <p className="text-[13px] font-bold text-ink-500 uppercase tracking-wider mt-1.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 p-1.5 rounded-2xl bg-white border border-ink-200 shadow-sm w-fit">
        {[
          { id:'requests', icon:Droplets, label:'Active Operations' },
          { id:'donors',   icon:Users,    label:'Donor Radar' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all
              ${activeTab===t.id ? 'bg-ink-900 text-white shadow-md' : 'text-ink-500 hover:text-ink-800 hover:bg-ink-50'}`}>
            <t.icon size={18}/>{t.label}
          </button>
        ))}
      </motion.div>

      {/* Tab: Active Requests */}
      <AnimatePresence mode="wait">
        {activeTab === 'requests' && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {loading ? (
              <div className="flex justify-center py-20"><Spinner size={40} className="text-brand-600"/></div>
            ) : activeRequests.length === 0 ? (
              <div className="card p-16 text-center max-w-2xl mx-auto flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-ink-50 rounded-full flex items-center justify-center mb-6">
                  <Droplets size={40} className="text-ink-300"/>
                </div>
                <h3 className="text-2xl font-display font-black text-ink-900 mb-2">No Active Operations</h3>
                <p className="text-ink-500 text-[15px] mb-6 max-w-sm">There are currently no active blood requests broadcasted from your facility.</p>
                <button onClick={() => setShowForm(true)} className="btn-primary px-6 py-3 shadow-brand-500/25">
                  <Plus size={18}/> Broadcast New Request
                </button>
              </div>
            ) : (
              <div className="space-y-6">
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
                    <motion.div variants={itemVariants} key={req.id} className="card overflow-hidden shadow-sm hover:shadow-md transition-shadow border-ink-200">
                      {/* Request row */}
                      <div className={`flex items-center gap-5 p-5 cursor-pointer transition-colors ${isOpen ? 'bg-ink-50/50' : 'hover:bg-ink-50/30'}`}
                           onClick={() => setExpanded(isOpen ? null : req.id)}>
                        <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 shadow-inner">
                          <span className="font-display font-black text-brand-600 text-xl">{req.blood_group}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h3 className="text-lg font-display font-bold text-ink-900">
                              {req.patient_name||'Anonymous Patient'} • {req.units_needed} Unit{req.units_needed>1?'s':''}
                            </h3>
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider
                              ${req.urgency === 'Critical' ? 'bg-rose-100 text-rose-700' : req.urgency === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                              {req.urgency}
                            </span>
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider
                              ${req.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-700'}`}>
                              {req.status}
                            </span>
                            {req.notify_ward_members && <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"><Users size={12}/> Ward Alert</span>}
                          </div>
                          <p className="text-[14px] text-ink-500 font-medium truncate">
                            {req.patient_ward&&`${req.patient_ward} • `}{req.patient_condition}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 mt-2.5 text-[13px] font-bold">
                            <span className="text-ink-400 flex items-center gap-1.5"><Clock size={14}/> {fmtAgo(req.created_at)}</span>
                            <span className="text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-md"><CheckCircle size={14}/> {item.accepted_count} Accepted</span>
                            <span className="text-amber-600 flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded-md"><AlertTriangle size={14}/> {item.pending_count} Pending</span>
                            <span className="text-rose-600 flex items-center gap-1.5 bg-rose-50 px-2 py-0.5 rounded-md"><XCircle size={14}/> {item.rejected_count} Rejected</span>
                          </div>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform shrink-0 bg-white shadow-sm border border-ink-100 ${isOpen ? 'rotate-180' : ''}`}>
                          <ChevronDown size={20} className="text-ink-600"/>
                        </div>
                      </div>

                      {/* Expanded */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-ink-100 bg-ink-50/20"
                          >
                            <div className="p-6">
                              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Top 3 */}
                                <div className="space-y-4">
                                  <h4 className="text-[15px] font-display font-black text-ink-900 flex items-center gap-2">
                                    <Users size={18} className="text-brand-600"/> Rapid Response Donors
                                  </h4>
                                  <Top3Donors requestId={req.id} donors={top3}
                                    stats={{ total_accepted:item.accepted_count, pending_count:item.pending_count, rejected_count:item.rejected_count }}
                                    onConfirmed={fetchDashboard}/>
                                </div>

                                {/* Map + confirmed list */}
                                <div className="space-y-4">
                                  <h4 className="text-[15px] font-display font-black text-ink-900 flex items-center gap-2">
                                    <MapPin size={18} className="text-brand-600"/> Live Operations Map
                                  </h4>
                                  <div className="rounded-2xl overflow-hidden border border-ink-200 shadow-sm relative z-0">
                                    <LiveMap
                                      hospital={{ name:user?.profile?.name, lat:req.hospital_latitude, lng:req.hospital_longitude }}
                                      donors={mapDonors} className="h-64"/>
                                  </div>

                                  {/* Confirmed donors with complete buttons */}
                                  {confirmed.length > 0 && (
                                    <div className="space-y-3 pt-2">
                                      <h5 className="text-[13px] font-bold text-ink-500 uppercase tracking-wider">Confirmed Dispatch</h5>
                                      {confirmed.map((d, i) => (
                                        <div key={d.id} className="card p-4 border border-ink-200 shadow-sm bg-white">
                                          <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black text-white shadow-sm
                                              ${['bg-brand-600','bg-amber-500','bg-sky-500'][i] || 'bg-ink-800'}`}>{i+1}</div>
                                            <div className="flex-1">
                                              <span className="text-ink-900 text-[15px] font-bold block leading-tight">{d.donor_name}</span>
                                              <span className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 block
                                                ${d.status === 'completed' ? 'text-emerald-600' : 'text-brand-600'}`}>{d.status}</span>
                                            </div>
                                          </div>

                                          {/* Contact */}
                                          <div className="flex gap-2 mb-3">
                                            {d.donor_phone && (
                                              <a href={callLink(d.donor_phone)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-ink-50 text-ink-800 hover:bg-ink-100 transition-colors text-[13px] font-bold border border-ink-200">
                                                <Phone size={14} className="text-sky-600"/> Call
                                              </a>
                                            )}
                                            {d.donor_whatsapp && (
                                              <a href={whatsappLink(d.donor_whatsapp)} target="_blank" rel="noreferrer"
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-[13px] font-bold border border-emerald-200">
                                                <MessageCircle size={14}/> WhatsApp
                                              </a>
                                            )}
                                          </div>

                                          {/* Complete buttons — only for confirmed */}
                                          {d.status === 'confirmed' && (
                                            <button onClick={() => setCompleting({...d, blood_group: req.blood_group})}
                                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                                                         bg-brand-600 text-white shadow-brand-500/25
                                                         hover:bg-brand-700 transition-all text-[14px] font-bold">
                                              <CheckCircle size={16}/> Record Donation Complete
                                            </button>
                                          )}
                                          {d.status === 'completed' && (
                                            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[14px] text-emerald-700 font-bold">
                                              <CheckCircle size={16}/> Donation Recorded Successfully
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Chat */}
                                <div className="space-y-4">
                                  <h4 className="text-[15px] font-display font-black text-ink-900 flex items-center gap-2">
                                    <MessageCircle size={18} className="text-brand-600"/> Secure Comms Channel
                                  </h4>
                                  {confirmed.length > 0 ? (
                                    <div className="card overflow-hidden shadow-sm border-ink-200 h-[480px]">
                                      <ChatWindow responseId={confirmed[0].id}
                                        otherName={confirmed[0].donor_name}
                                        otherPhone={confirmed[0].donor_phone}
                                        otherWhatsapp={confirmed[0].donor_whatsapp}
                                        className="h-full border-0 rounded-none shadow-none"/>
                                    </div>
                                  ) : (
                                    <div className="card h-[480px] flex flex-col items-center justify-center text-center p-8 border-ink-200 bg-white">
                                      <div className="w-20 h-20 bg-ink-50 rounded-full flex items-center justify-center mb-4">
                                        <Clock size={32} className="text-ink-300"/>
                                      </div>
                                      <p className="text-ink-600 text-[15px] font-medium leading-relaxed">Secure communication channel will activate once a donor is confirmed for this operation.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab: Find Donors */}
      <AnimatePresence mode="wait">
        {activeTab === 'donors' && (
          <motion.div
            key="donors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <NearestDonors/>
          </motion.div>
        )}
      </AnimatePresence>

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
    </motion.div>
  )
}
