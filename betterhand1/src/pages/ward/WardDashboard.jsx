import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { wardApi } from '../../api'
import { useAuthStore } from '../../store/authStore'
import { useWsStore } from '../../store/wsStore'
import { AUTO_REFRESH_EVENT } from '../../components/common/Layout'
import {
  Bell, CheckCircle, Clock, Users, Phone, MessageCircle,
  MapPin, Zap, Star, User, Building, AlertTriangle, RefreshCw, Search
} from 'lucide-react'
import { fmtAgo, urgencyColor, whatsappLink, callLink } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg max-h-[92vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-surface-200">
          <div>
            <h2 className="font-bold text-surface-900">Top 3 Local Donors</h2>
            <p className="text-xs text-surface-400 mt-0.5">Call or WhatsApp them to donate</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8"><Spinner size={28}/></div>
          ) : !data ? (
            <p className="text-surface-400 text-center py-8">No donors found</p>
          ) : (
            <>
              {/* Alert details */}
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
                <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
                  <Building size={14}/> {data.hospital_name}
                  <span className={`badge ml-auto ${urgencyColor(data.urgency)}`}>{data.urgency}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-blood">{data.blood_group}</span>
                  <span className="text-surface-600">blood needed</span>
                </div>
                {data.patient_name && (
                  <p className="text-xs text-surface-600">👤 Patient: <strong>{data.patient_name}</strong></p>
                )}
                {data.bystander_phone && (
                  <p className="text-xs text-purple-600">
                    📱 Bystander: <a href={'tel:' + data.bystander_phone} className="font-semibold hover:underline">{data.bystander_phone}</a>
                  </p>
                )}
                {data.hospital_message && (
                  <p className="text-xs text-surface-400 italic">"{data.hospital_message}"</p>
                )}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {data.hospital_phone && (
                    <a href={callLink(data.hospital_phone)}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 text-xs font-semibold">
                      <Phone size={12}/> Call Hospital
                    </a>
                  )}
                  {data.hospital_whatsapp && (
                    <a href={whatsappLink(data.hospital_whatsapp)} target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 text-green-600 border border-green-200 text-xs font-semibold">
                      <MessageCircle size={12}/> WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Top 3 donors */}
              <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold">Contact donors personally</p>
              <div className="space-y-3">
                {(data.top_donors || []).length === 0 ? (
                  <div className="text-center py-6">
                    <Users size={28} className="text-surface-200 mx-auto mb-2"/>
                    <p className="text-surface-400 text-sm">No eligible donors found</p>
                  </div>
                ) : (data.top_donors || []).map((d, i) => {
                  const contacted = notified.includes(d.donor_id)
                  return (
                    <div key={d.donor_id} className={`card p-4 ${contacted ? 'border-green-300 bg-green-50' : ''}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0
                          ${['bg-emerald-600','bg-amber-600','bg-sky-600'][i]}`}>{i+1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-surface-900">{d.full_name}</h4>
                            <span className="bg-blood text-xs">{d.blood_group}</span>
                            {contacted && <span className="badge badge-green text-[10px]">✓ Contacted</span>}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-surface-400">
                            <span><MapPin size={10} className="inline"/> {d.distance_km} km</span>
                            <span><Star size={10} className="inline text-yellow-400"/> {d.avg_rating || 'Unrated'}</span>
                            <span><Zap size={10} className="inline"/> {d.donation_count} donations</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <a href={callLink(d.phone)}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 text-xs font-semibold">
                          <Phone size={12}/> Call
                        </a>
                        {d.whatsapp_link ? (
                          <a href={d.whatsapp_link} target="_blank" rel="noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 text-green-600 border border-green-200 text-xs font-semibold">
                            <MessageCircle size={12}/> WhatsApp
                          </a>
                        ) : (
                          <span className="flex items-center justify-center py-2 rounded-lg bg-surface-50 text-surface-300 text-xs">No WhatsApp</span>
                        )}
                      </div>
                      {!contacted && (
                        <button onClick={() => markContacted(d.donor_id)}
                          className="mt-2 w-full py-2 rounded-lg text-xs text-surface-400 hover:text-green-600 hover:bg-green-50 border border-surface-200 transition-all">
                          ✓ Mark as contacted
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Broadcast */}
              <div className="pt-3 border-t border-surface-200">
                <p className="text-xs text-surface-400 mb-2">Broadcast to ALL donors in your ward:</p>
                <button onClick={broadcast} disabled={broadcasting} className="btn-primary w-full justify-center">
                  {broadcasting ? <Spinner size={15}/> : <Bell size={15}/>}
                  {broadcasting ? 'Broadcasting…' : 'Broadcast to All Ward Donors'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
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
    catch { toast.error('Failed to load dashboard') }
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
    const h = () => { toast('🩸 New blood alert!', { icon:'🚨', duration:6000 }); load() }
    on('ward_blood_alert', h)
    return () => off('ward_blood_alert', h)
  }, [on, off, load])

  const resolve = async (alertId) => {
    try { await wardApi.resolve(alertId); toast.success('Resolved ✅'); load() }
    catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32}/></div>

  const ward   = data?.ward
  const stats  = data?.alerts
  const alerts = data?.recent_alerts || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Users size={22} className="text-brand-600"/> Ward Dashboard
          </h1>
          <p className="text-surface-400 text-sm mt-0.5">
            {data?.member_name} · Ward {ward?.ward_number}, {ward?.local_body_name}
            {!data?.is_verified && <span className="badge badge-yellow ml-2">⏳ Pending verification</span>}
          </p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14}/> Refresh</button>
      </div>

      {/* Verification warning */}
      {!data?.is_verified && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
          <AlertTriangle size={16} className="text-yellow-600 shrink-0 mt-0.5"/>
          <div>
            <p className="text-yellow-700 font-semibold text-sm">Pending Verification</p>
            <p className="text-yellow-600 text-xs mt-1">Admin must verify you at localhost:8000/admin</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Alerts', val:stats?.total??0,    icon:Bell,        color:'text-brand-600',  bg:'bg-brand-100' },
          { label:'Pending',      val:stats?.pending??0,  icon:Clock,       color:'text-amber-600',  bg:'bg-amber-100' },
          { label:'Notified',     val:stats?.notified??0, icon:Users,       color:'text-blue-600',   bg:'bg-blue-100' },
          { label:'Resolved',     val:stats?.resolved??0, icon:CheckCircle, color:'text-green-600',  bg:'bg-green-100' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon size={18} className={s.color}/>
            </div>
            <p className="text-2xl font-bold text-surface-900">{s.val}</p>
            <p className="text-xs text-surface-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Ward donor summary */}
      {data?.ward_donors && (
        <div className="card p-5">
          <h3 className="font-semibold text-surface-900 mb-3">Donors in Your Ward</h3>
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold text-surface-900">{data.ward_donors.total}</p>
              <p className="text-xs text-surface-400">Total registered</p>
            </div>
            <div className="w-px bg-surface-200"/>
            <div>
              <p className="text-3xl font-bold text-green-600">{data.ward_donors.available}</p>
              <p className="text-xs text-surface-400">Available now</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TABS ────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-100 border border-surface-200 w-fit">
        {[
          { id:'overview', label:'Overview', icon:Bell },
          { id:'alerts',   label:'Blood Alerts', icon:AlertTriangle },
          { id:'donors',   label:'Ward Donors', icon:Users },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${activeTab === t.id
                ? 'bg-gradient-to-r from-brand-600 to-brand-400 text-white shadow-md'
                : 'text-surface-500 hover:text-brand-600'}`}>
            <t.icon size={15}/> {t.label}
          </button>
        ))}
      </div>

      {/* ── DONORS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'donors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
              <Users size={18} className="text-brand-600"/> Ward Donors
              <span className="badge badge-brand">{donors.length}</span>
            </h2>
            <div className="flex gap-2">
              <select className="select text-sm py-2 w-32" value={bgFilter}
                onChange={e => setBgFilter(e.target.value)}>
                <option value="">All Groups</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g =>
                  <option key={g} value={g}>{g}</option>
                )}
              </select>
              <button onClick={() => setAvailFilter(!availFilter)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all
                  ${availFilter ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-surface-500 border-surface-200'}`}>
                {availFilter ? '✓ Available' : 'All'}
              </button>
            </div>
          </div>

          {donorsLoading ? (
            <div className="flex justify-center py-10"><Spinner size={24}/></div>
          ) : donors.length === 0 ? (
            <div className="card p-10 text-center">
              <Users size={32} className="text-surface-200 mx-auto mb-3"/>
              <p className="text-surface-500">No donors found in your ward.</p>
              <p className="text-surface-400 text-xs mt-1">Donors registered with your ward number appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {donors.map(d => (
                <div key={d.id} className="card p-4 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center font-mono font-bold text-red-600 text-sm shrink-0">
                      {d.blood_group}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-surface-900 text-sm">{d.full_name}</h4>
                        <span className={`badge text-[10px] ${d.is_available ? 'badge-green' : 'badge-gray'}`}>
                          {d.is_available ? '✓ Available' : 'Unavailable'}
                        </span>
                        {d.on_cooldown && <span className="badge badge-yellow text-[10px]">Cooldown</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-surface-400">
                        {d.ward_number && <span>Ward {d.ward_number}</span>}
                        {d.district && <span>{d.district}</span>}
                        {d.donation_count > 0 && <span>🩸 {d.donation_count} donations</span>}
                        {d.avg_rating && <span>⭐ {d.avg_rating}/5</span>}
                        {d.last_donated && <span>Last: {d.last_donated}</span>}
                        {d.age && <span>Age: {d.age}</span>}
                        {d.gender && <span>{d.gender}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {d.phone && (
                      <a href={'tel:' + d.phone}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 text-xs font-semibold">
                        <Phone size={12}/> Call
                      </a>
                    )}
                    {(d.whatsapp_link || d.phone) && (
                      <a href={d.whatsapp_link || ('https://wa.me/' + (d.phone||'').replace(/[^0-9]/g,''))}
                         target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 text-xs font-semibold">
                        <MessageCircle size={12}/> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ALERTS TAB (also shows on overview) ─────────────────────────── */}
      {(activeTab === 'overview' || activeTab === 'alerts') && (
        <div>
          <h2 className="font-semibold text-surface-900 mb-3 flex items-center gap-2">
            <Bell size={16} className="text-brand-600"/> Blood Alerts
            {stats?.pending > 0 && <span className="badge badge-red">{stats.pending} pending</span>}
          </h2>

          {alerts.length === 0 ? (
            <div className="card p-10 text-center">
              <Bell size={28} className="text-surface-200 mx-auto mb-3"/>
              <p className="text-surface-400 text-sm">No alerts yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className="card p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center font-mono font-bold text-red-600 text-lg shrink-0">
                      {alert.blood_group}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-surface-900">{alert.hospital_name}</h4>
                        <span className={urgencyColor(alert.urgency)}>{alert.urgency}</span>
                        <span className={`badge ${alert.status==='resolved'?'badge-green':alert.status==='notified'?'badge-brand':'badge-yellow'}`}>
                          {alert.status}
                        </span>
                      </div>
                      {alert.patient_name && (
                        <p className="text-xs text-surface-600 mt-1">👤 Patient: <strong>{alert.patient_name}</strong></p>
                      )}
                      {alert.patient_condition && (
                        <p className="text-xs text-surface-400 mt-0.5">{alert.patient_condition}</p>
                      )}
                      {alert.hospital_message && (
                        <p className="text-xs text-surface-400 mt-1 italic">"{alert.hospital_message}"</p>
                      )}
                      <p className="text-xs text-surface-300 mt-1">{fmtAgo(alert.created_at)}</p>
                    </div>
                  </div>

                  {/* Contact buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {alert.hospital_phone && (
                      <a href={callLink(alert.hospital_phone)}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 text-xs font-semibold">
                        <Phone size={12}/> Call Hospital
                      </a>
                    )}
                    {alert.hospital_whatsapp && (
                      <a href={whatsappLink(alert.hospital_whatsapp)} target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 text-green-600 border border-green-200 text-xs font-semibold">
                        <MessageCircle size={12}/> WhatsApp Hospital
                      </a>
                    )}
                  </div>

                  {/* Bystander contact */}
                  {alert.bystander_phone && (
                    <div className="mb-3">
                      <a href={'tel:' + alert.bystander_phone}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 text-xs font-semibold w-full">
                        <Phone size={12}/> Call Bystander ({alert.bystander_phone})
                      </a>
                    </div>
                  )}

                  {alert.status !== 'resolved' && (
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedAlert(alert.id)}
                        className="btn-primary flex-1 justify-center text-sm">
                        <Users size={14}/> Get Top 3 Donors
                      </button>
                      <button onClick={() => resolve(alert.id)}
                        className="btn-secondary text-sm px-4">
                        <CheckCircle size={14}/> Resolve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top 3 Modal */}
      {selectedAlert && (
        <Top3Modal alertId={selectedAlert} onClose={() => setSelectedAlert(null)}/>
      )}
    </div>
  )
}
