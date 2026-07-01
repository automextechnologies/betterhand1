import { useState, useEffect, useCallback } from 'react'
import useAutoRefresh from '../../hooks/useAutoRefresh'
import { donationApi, authApi } from '../../api'
import { useAuthStore } from '../../store/authStore'
import { useWsStore } from '../../store/wsStore'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Clock, Trophy, CheckCircle, XCircle, MapPin, Bell, Activity, ArrowRight, ShieldCheck, Droplet, Landmark } from 'lucide-react'
import { fmtDate, urgencyColor, statusColor } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner'

function BloodGroupBadge({ group }) {
  return (
    <div className="bg-brand-50 border border-brand-100 px-3 py-1 rounded-xl shadow-sm">
      <span className="font-mono font-bold text-brand-600 text-lg">{group}</span>
    </div>
  )
}

export default function DonorDashboard() {
  const { user } = useAuthStore()
  const { on, off } = useWsStore()
  const navigate = useNavigate()
  const [pending, setPending] = useState([])
  const [cooldown, setCooldown] = useState(null)
  const [badges, setBadges] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState({})
  const [profile, setProfile] = useState(user?.profile)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, cRes, bRes, hRes] = await Promise.all([
        donationApi.pendingRequests(),
        donationApi.cooldown(),
        donationApi.myBadges(),
        donationApi.donorHistory(),
      ])
      setPending(pRes.data)
      setCooldown(cRes.data)
      setBadges(bRes.data)
      setHistory(hRes.data?.results || hRes.data || [])
    } catch { toast.error('Failed to load dashboard data') }
    finally { setLoading(false) }
  }, [])

  useAutoRefresh(load, 5000)

  useEffect(() => {
    const handler = () => { load(); toast.success('🩸 New blood request nearby!') }
    on('blood_request', handler)
    on('new_request', handler)
    return () => { off('blood_request', handler); off('new_request', handler) }
  }, [on, off, load])

  const respond = async (responseId, status, lat, lng) => {
    setResponding(p => ({ ...p, [responseId]: true }))
    try {
      await donationApi.respond(responseId, { status, donor_latitude: lat, donor_longitude: lng })
      toast.success(status === 'accepted' ? '✅ Accepted! Hospital will confirm you shortly.' : 'Response recorded.')
      if (status === 'accepted') navigate('/donor/navigate')
      load()
    } catch (e) {
      toast.error('Failed to respond')
    } finally {
      setResponding(p => ({ ...p, [responseId]: false }))
    }
  }

  const handleAccept = async (resp) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => respond(resp.id, 'accepted', pos.coords.latitude, pos.coords.longitude),
        ()  => respond(resp.id, 'accepted')
      )
    } else {
      respond(resp.id, 'accepted')
    }
  }

  const toggleAvailability = async () => {
    try {
      const r = await authApi.toggleAvailability()
      setProfile(p => p ? {...p, is_available: r.data.is_available} : p)
      toast.success(r.data.is_available ? '✅ You are now available to donate!' : '⏸️ You are marked as unavailable.')
    } catch { toast.error('Failed to update availability') }
  }

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><Spinner size={40} className="text-brand-600"/></div>

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
      
      {/* Premium Header Profile Banner */}
      <motion.div variants={itemVariants} className="glass p-8 rounded-[32px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent-200/60 to-transparent rounded-full blur-3xl -z-10 -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-accent-500 to-accent-700 shadow-lg shadow-accent-500/30 flex items-center justify-center text-2xl font-black text-white shrink-0">
              {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-display font-black text-ink-900 tracking-tight">{profile?.full_name || 'Donor'}</h1>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <BloodGroupBadge group={profile?.blood_group || '—'}/>
                <button onClick={toggleAvailability}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-bold transition-all shadow-sm
                    ${profile?.is_available 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                      : 'bg-ink-100 text-ink-600 border border-ink-200 hover:bg-ink-200'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${profile?.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-ink-400'}`} />
                  {profile?.is_available ? 'Available Now' : 'Unavailable'}
                </button>
                {cooldown?.is_on_cooldown && (
                  <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                    <Clock size={14}/> Cooldown · {cooldown.days_remaining}d left
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="flex items-center gap-8 bg-white/50 backdrop-blur-md px-8 py-5 rounded-[24px] border border-white/60 shadow-sm">
            <div className="text-center">
              <p className="text-4xl font-display font-black text-ink-900">{history.length}</p>
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wider mt-1">Donations</p>
            </div>
            <div className="w-px h-12 bg-ink-200" />
            <div className="text-center">
              <p className="text-4xl font-display font-black text-brand-600">{history.length * 3}</p>
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wider mt-1">Lives Saved</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column (Pending Requests) */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-black text-ink-900 flex items-center gap-3">
              <Activity size={24} className="text-brand-600"/>
              Active Blood Requests
            </h2>
            {pending.length > 0 && (
              <span className="bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-black shadow-sm">{pending.length} New</span>
            )}
          </motion.div>

          {pending.length === 0 ? (
            <motion.div variants={itemVariants} className="card p-10 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-ink-50 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck size={32} className="text-ink-400"/>
              </div>
              <h3 className="text-xl font-display font-bold text-ink-900 mb-2">You're all caught up!</h3>
              <p className="text-ink-500 max-w-sm mx-auto text-[15px] leading-relaxed">No pending blood requests in your area right now. Keep your notifications on; we'll alert you when a hospital needs your blood type.</p>
            </motion.div>
          ) : (
            <div className="space-y-5">
              {pending.map(resp => (
                <motion.div key={resp.id} variants={itemVariants} 
                  className={`card relative overflow-hidden p-6
                    ${resp.via_ward ? 'border-2 border-emerald-400 shadow-[0_8px_20px_rgba(16,185,129,0.15)]' : ''}`}>
                  
                  {resp.via_ward && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-[1.5rem] z-10 shadow-sm">
                      Ward Priority
                    </div>
                  )}

                  <div className="flex items-start gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 shadow-inner">
                      <span className="font-mono font-black text-brand-600 text-2xl">{resp.blood_group}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-1.5">
                        <h3 className="text-xl font-display font-bold text-ink-900">{resp.hospital_name}</h3>
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider
                          ${resp.urgency === 'Critical' ? 'bg-brand-100 text-brand-700' : 
                            resp.urgency === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                          {resp.urgency}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-[15px] text-ink-600">
                        <p className="flex items-center gap-1.5">
                          <Droplet size={16} className="text-brand-600" />
                          <span className="font-bold text-ink-900">{resp.units_needed} unit{resp.units_needed > 1 ? 's' : ''}</span> needed
                        </p>
                        {resp.patient_name && (
                          <p className="flex items-center gap-1.5 border-l border-ink-200 pl-5">
                            <span className="text-ink-400">Patient:</span> <span className="font-semibold text-ink-900">{resp.patient_name}</span>
                          </p>
                        )}
                      </div>

                      {resp.patient_condition && (
                        <p className="text-sm text-ink-500 mt-3 bg-ink-50/50 p-3 rounded-xl border border-ink-100 inline-block">
                          <span className="font-bold text-ink-800">Condition:</span> {resp.patient_condition}
                        </p>
                      )}

                      {resp.via_ward && resp.ward_member_name && (
                        <p className="text-xs font-bold text-emerald-700 mt-4 flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl w-fit border border-emerald-100">
                          <Landmark size={16}/>
                          Requested by Ward Member: {resp.ward_member_name}
                          {resp.ward_member_phone && (
                            <a href={`tel:${resp.ward_member_phone}`} className="ml-1 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800">
                              ({resp.ward_member_phone})
                            </a>
                          )}
                        </p>
                      )}
                      
                      {resp.hospital_latitude && (
                        <div className="mt-4">
                          <a href={`https://maps.google.com/?q=${resp.hospital_latitude},${resp.hospital_longitude}`}
                             target="_blank" rel="noreferrer" 
                             className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl transition-colors border border-sky-100">
                            <MapPin size={16}/> Open Map Location
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {resp.status === 'pending' ? (
                    <div className="flex gap-4 pt-4 border-t border-ink-100">
                      <button
                        onClick={() => respond(resp.id, 'rejected')}
                        disabled={responding[resp.id]}
                        className="btn-ghost flex-1 py-4 text-base bg-ink-50"
                      >
                        <XCircle size={20}/> Decline
                      </button>
                      <button
                        onClick={() => handleAccept(resp)}
                        disabled={responding[resp.id]}
                        className="btn-primary flex-[2] py-4 text-base shadow-brand-500/25 hover:shadow-brand-500/40 bg-gradient-to-r from-brand-600 to-brand-500"
                      >
                        {responding[resp.id] ? <Spinner size={20}/> : <CheckCircle size={20}/>}
                        Accept Request
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center pt-4 border-t border-ink-100">
                      <span className={`px-5 py-2.5 rounded-2xl text-sm font-bold uppercase tracking-wider
                        ${resp.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-600'}`}>
                        Status: {resp.status}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Column (Badges & History) */}
        <div className="space-y-6">
          
          {/* Badges Section */}
          {badges.length > 0 && (
            <motion.div variants={itemVariants} className="card p-6">
              <h3 className="text-xl font-display font-black text-ink-900 mb-5 flex items-center gap-2">
                <Trophy size={24} className="text-amber-500"/>
                Achievements
              </h3>
              <div className="flex flex-wrap gap-3">
                {badges.map(b => {
                  const icons = { first_drop:'🩸', lifesaver:'💖', hero:'🦸', legend:'👑', guardian:'🛡️', top_rated:'⭐', rapid_responder:'⚡' }
                  const labels = { first_drop:'First Drop', lifesaver:'Lifesaver', hero:'Hero', legend:'Legend', guardian:'Guardian', top_rated:'Top Rated', rapid_responder:'Rapid Responder' }
                  return (
                    <div key={b.badge} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-xl drop-shadow-sm">{icons[b.badge]}</span>
                      <span className="text-sm font-bold text-amber-900">{labels[b.badge]}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <motion.div variants={itemVariants} className="card p-6">
              <h3 className="text-xl font-display font-black text-ink-900 mb-5 flex items-center gap-2">
                <Heart size={24} className="text-brand-600"/>
                Recent Donations
              </h3>
              <div className="space-y-4">
                {history.slice(0, 5).map((h, i) => (
                  <div key={h.id} className={`flex items-center gap-4 ${i !== history.slice(0,5).length - 1 ? 'pb-4 border-b border-ink-100' : ''}`}>
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                      <span className="font-mono font-bold text-brand-600 text-sm">{h.blood_group}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-ink-900 truncate">{h.hospital_name}</p>
                      <p className="text-xs text-ink-500 mt-1 font-medium">{fmtDate(h.donated_at)}</p>
                    </div>
                    <span className="badge badge-green">
                      {h.units_donated} unit
                    </span>
                  </div>
                ))}
              </div>
              {history.length > 5 && (
                <button className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-sm font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-all">
                  View All History <ArrowRight size={16}/>
                </button>
              )}
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  )
}
