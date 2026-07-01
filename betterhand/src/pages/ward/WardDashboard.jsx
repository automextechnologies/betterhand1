import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { wardApi } from '../../api'
import { useAuthStore } from '../../store/authStore'
import { useWsStore } from '../../store/wsStore'
import { AUTO_REFRESH_EVENT } from '../../components/common/Layout'
import {
  Bell, CheckCircle, Clock, Users, Phone, MessageCircle,
  MapPin, Zap, Star, User, Building, AlertTriangle, RefreshCw, Search,
  HeartPulse, ShieldAlert, Droplets, Info
} from 'lucide-react'
import { fmtAgo, urgencyColor, whatsappLink, callLink } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner'
import { motion, AnimatePresence } from 'framer-motion'

// ── Top 3 Donors Modal ──────────────────────────────────────────────────────
function Top3Modal({ alertId, onClose }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [broadcasting, setBroadcasting] = useState(false)
  const [notified, setNotified] = useState([])

  useEffect(() => {
    wardApi.top3Donors(alertId)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load donors'))
      .finally(() => setLoading(false))
  }, [alertId])

  const broadcast = async () => {
    setBroadcasting(true)
    try {
      await wardApi.broadcast(alertId)
      toast.success('✅ Broadcast sent to all ward donors!')
    } catch { toast.error('Broadcast failed') }
    finally { setBroadcasting(false) }
  }

  const markContacted = (donorId) => {
    setNotified(prev => prev.includes(donorId) ? prev : [...prev, donorId])
    toast.success('Marked as contacted!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white/95 backdrop-blur-xl w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl border border-white flex flex-col"
      >
        <div className="flex flex-col p-6 bg-gradient-to-b from-ink-50/50 to-transparent border-b border-ink-100 shrink-0 relative">
          <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-ink-100 text-ink-500 hover:bg-ink-200 hover:text-ink-700 transition-colors">✕</button>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 shadow-inner">
            <Users size={24}/>
          </div>
          <h2 className="text-2xl font-display font-black text-ink-900 tracking-tight">Top Local Donors</h2>
          <p className="text-ink-500 font-medium text-[14px] mt-1">Contact the closest matches in your ward directly</p>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner size={32} className="text-brand-600 mb-4"/>
              <p className="text-ink-500 font-medium animate-pulse">Finding best donor matches...</p>
            </div>
          ) : !data ? (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-16 h-16 bg-ink-50 rounded-full flex items-center justify-center mb-4"><Users size={24} className="text-ink-300"/></div>
              <p className="text-ink-500 font-medium">No suitable donors found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Alert details */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-50/50 to-brand-100/30 border border-brand-200/50 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5 text-brand-700 font-bold text-[14px]">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"><Building size={14}/></div>
                    {data.hospital_name}
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                    data.urgency === 'emergency' ? 'bg-red-100 text-red-700 border border-red-200' :
                    data.urgency === 'urgent' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {data.urgency}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-display font-black text-lg shadow-inner">
                      {data.blood_group}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-brand-600/70 uppercase tracking-wider">Required</p>
                      <p className="text-[14px] font-bold text-ink-900">Blood Type</p>
                    </div>
                  </div>
                  
                  {data.patient_name && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-brand-200 text-brand-500 flex items-center justify-center shadow-sm">
                        <User size={18}/>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-brand-600/70 uppercase tracking-wider">Patient</p>
                        <p className="text-[14px] font-bold text-ink-900 truncate" title={data.patient_name}>{data.patient_name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {(data.bystander_phone || data.hospital_message) && (
                  <div className="pt-3 border-t border-brand-200/50 space-y-2">
                    {data.bystander_phone && (
                      <div className="flex items-center justify-between bg-white/60 p-2.5 rounded-xl border border-brand-100">
                        <div className="flex items-center gap-2 text-[13px] font-medium text-ink-600">
                          <Phone size={14} className="text-brand-500"/> Bystander Contact
                        </div>
                        <a href={'tel:' + data.bystander_phone} className="font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1.5">
                          {data.bystander_phone}
                        </a>
                      </div>
                    )}
                    {data.hospital_message && (
                      <p className="text-[13px] text-ink-600 italic bg-white/40 p-3 rounded-xl border border-brand-100 border-dashed">
                        "{data.hospital_message}"
                      </p>
                    )}
                  </div>
                )}
                
                {(data.hospital_phone || data.hospital_whatsapp) && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {data.hospital_phone && (
                      <a href={callLink(data.hospital_phone)} className="btn-secondary py-2.5 bg-white border-brand-200 hover:border-brand-300 hover:bg-brand-50 text-brand-700 shadow-sm">
                        <Phone size={14}/> Call Hospital
                      </a>
                    )}
                    {data.hospital_whatsapp && (
                      <a href={whatsappLink(data.hospital_whatsapp)} target="_blank" rel="noreferrer" className="btn-secondary py-2.5 bg-white border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700 shadow-sm">
                        <MessageCircle size={14}/> WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Top 3 donors */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-[15px] font-display font-black text-ink-900">Recommended Donors</h3>
                  <div className="h-px flex-1 bg-ink-100"></div>
                </div>
                
                <div className="space-y-4">
                  {(data.top_donors || []).length === 0 ? (
                    <div className="text-center py-8 bg-ink-50 rounded-2xl border border-ink-100 border-dashed">
                      <Users size={28} className="text-ink-300 mx-auto mb-2"/>
                      <p className="text-ink-500 font-medium">No eligible donors found</p>
                    </div>
                  ) : (data.top_donors || []).map((d, i) => {
                    const contacted = notified.includes(d.donor_id)
                    return (
                      <div key={d.donor_id} className={`card p-4 transition-all duration-300 ${contacted ? 'border-emerald-200 bg-emerald-50/30' : 'border-ink-200 bg-white hover:border-ink-300 hover:shadow-md'}`}>
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-lg text-white shrink-0 shadow-inner
                            ${['bg-gradient-to-br from-amber-400 to-amber-600',
                               'bg-gradient-to-br from-slate-400 to-slate-600',
                               'bg-gradient-to-br from-orange-400 to-orange-600'][i] || 'bg-ink-400'}`}>
                            #{i+1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-bold text-ink-900 truncate">{d.full_name}</h4>
                              {contacted && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase flex items-center gap-1"><CheckCircle size={10}/> Contacted</span>}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider">{d.blood_group}</span>
                              <span className="w-1 h-1 rounded-full bg-ink-300"></span>
                              <span className="text-[12px] font-medium text-ink-500 flex items-center gap-1"><MapPin size={12} className="text-ink-400"/> {d.distance_km} km away</span>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2">
                              <span className="flex items-center gap-1 text-[12px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md"><Star size={12}/> {d.avg_rating || 'New'}</span>
                              <span className="flex items-center gap-1 text-[12px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md"><HeartPulse size={12}/> {d.donation_count} Donations</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <a href={callLink(d.phone)} className="btn-secondary py-2 bg-white shadow-sm border-ink-200 hover:border-ink-300 hover:bg-ink-50">
                            <Phone size={14} className="text-ink-600"/> Call Donor
                          </a>
                          {d.whatsapp_link ? (
                            <a href={d.whatsapp_link} target="_blank" rel="noreferrer" className="btn-secondary py-2 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300">
                              <MessageCircle size={14}/> WhatsApp
                            </a>
                          ) : (
                            <span className="flex items-center justify-center py-2 rounded-xl bg-ink-50 text-ink-400 text-[13px] font-medium border border-ink-100">No WhatsApp</span>
                          )}
                        </div>
                        
                        {!contacted && (
                          <button onClick={() => markContacted(d.donor_id)} className="w-full py-2 rounded-xl text-[13px] font-bold text-ink-500 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all flex items-center justify-center gap-1.5">
                            <CheckCircle size={14}/> Mark as Contacted
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Broadcast Footer */}
        {data && (data.top_donors || []).length > 0 && (
          <div className="p-6 bg-ink-50 border-t border-ink-100 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-[14px] font-bold text-ink-900">Still need more donors?</h4>
                <p className="text-[12px] text-ink-500 font-medium">Send a push notification to all compatible donors in Ward.</p>
              </div>
            </div>
            <button onClick={broadcast} disabled={broadcasting} className="btn-primary w-full justify-center py-3.5 shadow-brand-500/25">
              {broadcasting ? <Spinner size={18}/> : <Bell size={18}/>}
              {broadcasting ? 'Broadcasting Alert…' : 'Broadcast to All Ward Donors'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ── Main Ward Dashboard ─────────────────────────────────────────────────────
export default function WardDashboard() {
  const { user }    = useAuthStore()
  const { on, off } = useWsStore()
  const location    = useLocation()

  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [activeTab, setActiveTab]   = useState('overview')
  const [donors, setDonors]         = useState([])
  const [donorsLoading, setDonorsLoading] = useState(false)
  const [bgFilter, setBgFilter]     = useState('')
  const [availFilter, setAvailFilter] = useState(false)

  const load = useCallback(async () => {
    try { const r = await wardApi.dashboard(); setData(r.data) }
    catch { toast.error('Failed to load dashboard data') }
    finally { setLoading(false) }
  }, [])

  const loadDonors = useCallback(async () => {
    setDonorsLoading(true)
    try {
      const params = {}
      if (bgFilter) params.blood_group = bgFilter
      if (availFilter) params.available = 'true'
      const r = await wardApi.wardDonors(params)
      setDonors(r.data?.donors || [])
    } catch {}
    finally { setDonorsLoading(false) }
  }, [bgFilter, availFilter])

  useEffect(() => {
    if (location.pathname.includes('/donors')) setActiveTab('donors')
    else if (location.pathname.includes('/alerts')) setActiveTab('alerts')
    else setActiveTab('overview')
  }, [location.pathname])

  useEffect(() => { load() }, [load])
  useEffect(() => { if (activeTab === 'donors') loadDonors() }, [activeTab, loadDonors])

  useEffect(() => {
    const h = () => load()
    window.addEventListener(AUTO_REFRESH_EVENT, h)
    return () => window.removeEventListener(AUTO_REFRESH_EVENT, h)
  }, [load])

  useEffect(() => {
    const h = () => { toast('🩸 New emergency blood alert in your ward!', { icon:'🚨', duration:6000 }); load() }
    on('ward_blood_alert', h)
    return () => off('ward_blood_alert', h)
  }, [on, off, load])

  const resolve = async (alertId) => {
    try { await wardApi.resolve(alertId); toast.success('Alert resolved successfully ✅'); load() }
    catch { toast.error('Failed to resolve alert') }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size={40} className="text-brand-600"/></div>

  const ward   = data?.ward
  const stats  = data?.alerts
  const alerts = data?.recent_alerts || []

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center shadow-inner shrink-0 relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-200/50 scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full"/>
            <ShieldAlert size={28} className="text-brand-600 relative z-10"/>
          </div>
          <div>
            <h1 className="text-3xl font-display font-black text-ink-900 tracking-tight">Ward Command Center</h1>
            <p className="text-ink-500 text-[15px] font-medium mt-1 flex items-center gap-2">
              <User size={14}/> {data?.member_name} <span className="w-1 h-1 rounded-full bg-ink-300"></span> 
              Ward {ward?.ward_number}, {ward?.local_body_name}
              {!data?.is_verified && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ml-1">Pending Admin Verification</span>}
            </p>
          </div>
        </div>
        <button onClick={load} className="btn-secondary bg-white border border-ink-200 shadow-sm hover:border-ink-300 px-5 py-2.5">
          <RefreshCw size={16}/> Sync Data
        </button>
      </motion.div>

      {/* Verification warning */}
      {!data?.is_verified && (
        <motion.div variants={itemVariants} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={20}/>
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-amber-800">Account Pending Verification</h4>
            <p className="text-[13px] font-medium text-amber-700 mt-0.5 leading-relaxed">Your ward member account must be verified by a system administrator before you can fully manage local donors and broadcast alerts.</p>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label:'Total Alerts', val:stats?.total??0,    icon:Bell,        color:'text-brand-600',  bg:'bg-brand-50' },
          { label:'Pending Actions',val:stats?.pending??0,  icon:Clock,       color:'text-amber-600',  bg:'bg-amber-50' },
          { label:'Donors Notified',val:stats?.notified??0, icon:Users,       color:'text-sky-600',   bg:'bg-sky-50' },
          { label:'Resolved Cases', val:stats?.resolved??0, icon:CheckCircle, color:'text-emerald-600',  bg:'bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className="card p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group border-ink-200">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/60 to-transparent rounded-full blur-2xl -z-10 group-hover:scale-110 transition-transform duration-500`} />
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4 shadow-inner border border-white/50`}>
              <s.icon size={22} className={s.color}/>
            </div>
            <div>
              <p className="text-3xl font-display font-black text-ink-900 leading-none">{s.val}</p>
              <p className="text-[13px] font-bold text-ink-500 uppercase tracking-wider mt-2">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── TABS ────────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex gap-2 p-1.5 rounded-2xl bg-ink-100 border border-ink-200/50 w-fit overflow-x-auto max-w-full custom-scrollbar">
        {[
          { id:'overview', label:'Overview Dashboard', icon:Bell },
          { id:'alerts',   label:'Active Blood Alerts', icon:AlertTriangle },
          { id:'donors',   label:'Ward Donor Directory', icon:Users },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all whitespace-nowrap
              ${activeTab === t.id
                ? 'bg-white text-ink-900 shadow-sm border border-ink-200/50'
                : 'text-ink-500 hover:text-ink-700 hover:bg-white/50 border border-transparent'}`}>
            <t.icon size={16} className={activeTab === t.id ? 'text-brand-600' : ''}/> {t.label}
          </button>
        ))}
      </motion.div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
          {/* Ward donor summary */}
          {data?.ward_donors && (
            <motion.div variants={itemVariants} className="card p-6 border-ink-200 bg-gradient-to-br from-white to-ink-50/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-ink-100 text-ink-600 flex items-center justify-center shadow-inner"><Users size={20}/></div>
                <div>
                  <h3 className="text-[16px] font-display font-black text-ink-900">Ward Donor Capacity</h3>
                  <p className="text-[13px] font-medium text-ink-500">Overview of blood availability in your jurisdiction</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-ink-100 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-ink-50 flex items-center justify-center border-4 border-ink-100"><Users size={24} className="text-ink-400"/></div>
                  <div>
                    <p className="text-3xl font-display font-black text-ink-900 leading-none">{data.ward_donors.total}</p>
                    <p className="text-[12px] font-bold text-ink-500 uppercase tracking-wider mt-1.5">Total Registered</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-ink-100 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-100"><HeartPulse size={24} className="text-emerald-500"/></div>
                  <div>
                    <p className="text-3xl font-display font-black text-emerald-600 leading-none">{data.ward_donors.available}</p>
                    <p className="text-[12px] font-bold text-ink-500 uppercase tracking-wider mt-1.5">Available to Donate</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Alerts Section (Overview) */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-display font-black text-ink-900 flex items-center gap-2">
                <AlertTriangle size={20} className="text-brand-600"/> Recent Ward Alerts
                {stats?.pending > 0 && <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-lg text-[12px] font-bold shadow-sm border border-red-200">{stats.pending} Action Required</span>}
              </h2>
              <button onClick={() => setActiveTab('alerts')} className="text-[13px] font-bold text-brand-600 hover:text-brand-700">View All →</button>
            </div>

            {alerts.length === 0 ? (
              <div className="card p-12 text-center border-ink-200 border-dashed bg-ink-50/50">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-ink-100">
                  <ShieldAlert size={32} className="text-ink-300"/>
                </div>
                <p className="text-[16px] font-display font-black text-ink-900 mb-1">No Active Alerts</p>
                <p className="text-ink-500 text-[14px] font-medium max-w-md mx-auto">Your ward currently has no active blood requests from local hospitals.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.slice(0, 3).map(alert => <AlertCard key={alert.id} alert={alert} onResolve={resolve} onGetDonors={setSelectedAlert} />)}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* ── ALERTS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
            <h2 className="text-[20px] font-display font-black text-ink-900 flex items-center gap-2">
              <AlertTriangle size={24} className="text-brand-600"/> All Blood Alerts
            </h2>
            <div className="bg-ink-100 p-1 rounded-xl flex">
              <button className="px-4 py-1.5 rounded-lg text-[13px] font-bold bg-white shadow-sm text-ink-900">All</button>
              <button className="px-4 py-1.5 rounded-lg text-[13px] font-bold text-ink-500 hover:text-ink-700">Pending</button>
              <button className="px-4 py-1.5 rounded-lg text-[13px] font-bold text-ink-500 hover:text-ink-700">Resolved</button>
            </div>
          </div>

          {alerts.length === 0 ? (
            <motion.div variants={itemVariants} className="card p-16 text-center border-ink-200 border-dashed bg-ink-50/50">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-ink-100">
                <ShieldAlert size={40} className="text-ink-300"/>
              </div>
              <h3 className="text-xl font-display font-black text-ink-900 mb-2">All Clear</h3>
              <p className="text-ink-500 text-[15px] font-medium max-w-md mx-auto">There is no history of blood alerts in your ward.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, i) => (
                <motion.div variants={itemVariants} key={alert.id} custom={i}>
                  <AlertCard alert={alert} onResolve={resolve} onGetDonors={setSelectedAlert} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── DONORS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'donors' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-ink-200 shadow-sm">
            <h2 className="text-[18px] font-display font-black text-ink-900 flex items-center gap-2 shrink-0">
              <Users size={20} className="text-brand-600"/> Ward Directory
              <span className="bg-ink-100 text-ink-700 px-2.5 py-0.5 rounded-md text-[12px] font-bold">{donors.length} Total</span>
            </h2>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-40">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"/>
                <select className="select w-full pl-9 py-2.5 text-[13px] font-bold bg-ink-50 border-transparent focus:border-brand-500 focus:bg-white" value={bgFilter}
                  onChange={e => setBgFilter(e.target.value)}>
                  <option value="">All Blood Types</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g =>
                    <option key={g} value={g}>{g}</option>
                  )}
                </select>
              </div>
              <button onClick={() => setAvailFilter(!availFilter)}
                className={`px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all shadow-sm flex-1 sm:flex-none justify-center
                  ${availFilter ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-emerald-500/10' : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-50 hover:border-ink-300'}`}>
                {availFilter ? <><CheckCircle size={14}/> Available Only</> : 'Show All Status'}
              </button>
            </div>
          </motion.div>

          {donorsLoading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <Spinner size={40} className="text-brand-600 mb-4"/>
              <p className="text-ink-500 font-medium animate-pulse">Loading directory...</p>
            </div>
          ) : donors.length === 0 ? (
            <motion.div variants={itemVariants} className="card p-16 text-center border-ink-200 border-dashed bg-ink-50/50">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-ink-100">
                <Users size={40} className="text-ink-300"/>
              </div>
              <h3 className="text-xl font-display font-black text-ink-900 mb-2">No Donors Found</h3>
              <p className="text-ink-500 text-[15px] font-medium max-w-md mx-auto">We couldn't find any donors matching your current filters in this ward.</p>
              {(bgFilter || availFilter) && (
                <button onClick={() => {setBgFilter(''); setAvailFilter(false)}} className="mt-6 btn-secondary bg-white">
                  Clear Filters
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
              {donors.map((d, i) => (
                <motion.div variants={itemVariants} key={d.id} custom={i} className="card overflow-hidden border-ink-200 bg-white hover:shadow-md hover:border-ink-300 transition-all group flex flex-col h-full">
                  <div className="p-5 flex-1 flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center font-display font-black text-xl text-brand-600 shrink-0 shadow-inner border border-brand-200/50">
                      {d.blood_group}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                        <h4 className="text-[16px] font-display font-black text-ink-900 truncate">{d.full_name}</h4>
                        <div className="flex items-center gap-2">
                          {d.on_cooldown ? (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Clock size={10}/> Cooldown</span>
                          ) : d.is_available ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle size={10}/> Available</span>
                          ) : (
                            <span className="bg-ink-100 text-ink-500 border border-ink-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">Unavailable</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-[13px] font-medium text-ink-500">
                        {d.ward_number && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-ink-400"/> Ward {d.ward_number}</span>}
                        {d.district && <span className="flex items-center gap-1.5"><Building size={14} className="text-ink-400"/> {d.district}</span>}
                        {d.age && <span className="flex items-center gap-1.5"><User size={14} className="text-ink-400"/> {d.age} yrs {d.gender ? `· ${d.gender}` : ''}</span>}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-ink-600 bg-ink-50 px-2.5 py-1 rounded-lg border border-ink-100">
                          <HeartPulse size={14} className="text-brand-500"/> {d.donation_count} Donations
                        </div>
                        {d.avg_rating && (
                          <div className="flex items-center gap-1.5 text-[12px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                            <Star size={14} className="text-amber-500"/> {d.avg_rating}/5
                          </div>
                        )}
                        {d.last_donated && (
                          <div className="flex items-center gap-1.5 text-[12px] font-bold text-ink-600 bg-ink-50 px-2.5 py-1 rounded-lg border border-ink-100 ml-auto sm:ml-0">
                            <Clock size={14} className="text-ink-400"/> Last: {d.last_donated}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-px bg-ink-100 border-t border-ink-100">
                    <a href={d.phone ? 'tel:' + d.phone : '#'} onClick={e => !d.phone && e.preventDefault()}
                      className={`flex items-center justify-center gap-2 py-3.5 text-[13px] font-bold transition-colors bg-white hover:bg-blue-50 hover:text-blue-700
                        ${d.phone ? 'text-blue-600' : 'text-ink-300 cursor-not-allowed'}`}>
                      <Phone size={16}/> Call Direct
                    </a>
                    <a href={(d.whatsapp_link || d.phone) ? (d.whatsapp_link || ('https://wa.me/' + (d.phone||'').replace(/[^0-9]/g,''))) : '#'} 
                       target="_blank" rel="noreferrer" onClick={e => !(d.whatsapp_link || d.phone) && e.preventDefault()}
                      className={`flex items-center justify-center gap-2 py-3.5 text-[13px] font-bold transition-colors bg-white hover:bg-emerald-50 hover:text-emerald-700
                        ${(d.whatsapp_link || d.phone) ? 'text-emerald-600' : 'text-ink-300 cursor-not-allowed'}`}>
                      <MessageCircle size={16}/> WhatsApp
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Top 3 Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <Top3Modal alertId={selectedAlert} onClose={() => setSelectedAlert(null)}/>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Alert Card Component ────────────────────────────────────────────────────
function AlertCard({ alert, onResolve, onGetDonors }) {
  const isEmergency = alert.urgency === 'emergency'
  const isResolved = alert.status === 'resolved'
  
  return (
    <div className={`card overflow-hidden transition-all duration-300 ${
      isResolved ? 'border-ink-200 bg-ink-50/30 opacity-75' : 
      isEmergency ? 'border-red-200 shadow-md shadow-red-500/5 hover:border-red-300' : 'border-ink-200 hover:border-ink-300 hover:shadow-md bg-white'
    }`}>
      {/* Top Border Accent */}
      {!isResolved && (
        <div className={`h-1.5 w-full ${isEmergency ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-brand-500 to-accent-500'}`}></div>
      )}
      
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="relative shrink-0">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black text-2xl shadow-inner border
              ${isResolved ? 'bg-ink-100 text-ink-400 border-ink-200' : 
                isEmergency ? 'bg-red-50 text-red-600 border-red-200' : 'bg-brand-50 text-brand-600 border-brand-200'}`}>
              {alert.blood_group}
            </div>
            {!isResolved && isEmergency && (
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                <span className="absolute w-full h-full rounded-full bg-red-400 animate-ping opacity-75"></span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
              <div>
                <h4 className={`text-[18px] font-display font-black mb-1 ${isResolved ? 'text-ink-600 line-through decoration-ink-300' : 'text-ink-900'}`}>{alert.hospital_name}</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    alert.urgency === 'emergency' ? 'bg-red-100 text-red-700 border-red-200' :
                    alert.urgency === 'urgent' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}>
                    {alert.urgency} Priority
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    isResolved ? 'bg-ink-100 text-ink-600 border-ink-200 flex items-center gap-1' :
                    alert.status === 'notified' ? 'bg-brand-50 text-brand-700 border-brand-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {isResolved && <CheckCircle size={10}/>}
                    {alert.status}
                  </span>
                  <span className="text-[12px] font-medium text-ink-400 flex items-center gap-1">
                    <Clock size={12}/> {fmtAgo(alert.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-ink-50/50 p-3 rounded-xl border border-ink-100">
              {alert.patient_name && (
                <div className="flex items-start gap-2">
                  <User size={14} className="text-ink-400 mt-0.5 shrink-0"/>
                  <div>
                    <p className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">Patient Details</p>
                    <p className="text-[14px] font-bold text-ink-900">{alert.patient_name}</p>
                    {alert.patient_condition && <p className="text-[12px] text-ink-600 mt-0.5 leading-snug">{alert.patient_condition}</p>}
                  </div>
                </div>
              )}
              
              {alert.hospital_message && (
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-ink-400 mt-0.5 shrink-0"/>
                  <div>
                    <p className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">Physician Note</p>
                    <p className="text-[13px] text-ink-700 italic mt-0.5 leading-snug">"{alert.hospital_message}"</p>
                  </div>
                </div>
              )}
            </div>
            
            {!isResolved && (
              <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
                <button onClick={() => onGetDonors(alert.id)}
                  className="btn-primary w-full sm:flex-1 py-3 justify-center shadow-brand-500/25">
                  <Users size={16}/> Identify Top 3 Ward Matches
                </button>
                <div className="flex gap-3 w-full sm:w-auto">
                  {alert.bystander_phone && (
                    <a href={'tel:' + alert.bystander_phone}
                      className="btn-secondary w-full sm:w-auto px-4 py-3 bg-white border-ink-200 hover:border-ink-300 text-ink-700 shadow-sm justify-center" title="Call Bystander">
                      <Phone size={16}/> <span className="sm:hidden ml-2">Bystander</span>
                    </a>
                  )}
                  <button onClick={() => onResolve(alert.id)}
                    className="btn-secondary w-full sm:w-auto px-5 py-3 bg-white border-emerald-200 hover:bg-emerald-50 text-emerald-700 hover:border-emerald-300 shadow-sm justify-center">
                    <CheckCircle size={16}/> Resolve
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
