import { useState, useEffect, useCallback } from 'react'
import useAutoRefresh from '../../hooks/useAutoRefresh'
import { donationApi, authApi } from '../../api'
import { useAuthStore } from '../../store/authStore'
import { useWsStore } from '../../store/wsStore'
import { useNavigate } from 'react-router-dom'
import { Heart, Clock, Star, Trophy, CheckCircle, XCircle, MapPin, Bell } from 'lucide-react'
import { fmtDate, urgencyColor, statusColor, formatEta } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner'

function BloodGroupBadge({ group }) {
  return <span className="bg-blood px-3 py-1.5 rounded-xl font-mono font-bold text-rose-600 text-lg">{group}</span>
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
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }, [])

  // Auto-refresh every 5 seconds
  useAutoRefresh(load, 5000)


  // Realtime: new request notification
  useEffect(() => {
    const handler = () => { load(); toast('🩸 New blood request!') }
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
    navigator.geolocation?.getCurrentPosition(
      pos => respond(resp.id, 'accepted', pos.coords.latitude, pos.coords.longitude),
      ()  => respond(resp.id, 'accepted')
    )
  }

  const profile = user?.profile

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} className="text-brand-600"/></div>

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with profile */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 flex items-center justify-center text-xl font-bold text-ink-900 shrink-0">
          {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className=" text-xl font-bold text-ink-900">{profile?.full_name || 'Donor'}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <BloodGroupBadge group={profile?.blood_group || '—'}/>
            <button onClick={async () => {
                try {
                  const r = await authApi.toggleAvailability()
                  setProfile(p => p ? {...p, is_available: r.data.is_available} : p)
                  toast.success(r.data.is_available ? '✅ Available!' : '❌ Unavailable')
                } catch { toast.error('Failed') }
              }}
              className={`badge cursor-pointer hover:opacity-80 transition-opacity ${profile?.is_available ? 'badge-green' : 'badge-gray'}`}>
              {profile?.is_available ? '✓ Available — Click to turn off' : '✗ Unavailable — Click to turn on'}
            </button>
            {cooldown?.is_on_cooldown && (
              <span className="badge badge-yellow">
                <Clock size={11}/> Cooldown · {cooldown.days_remaining}d left
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl  font-bold text-ink-900">{history.length}</p>
          <p className="text-xs text-ink-400">Total Donations</p>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="card p-4">
          <h3 className=" font-semibold text-ink-900 mb-3 flex items-center gap-2">
            <Trophy size={16} className="text-yellow-400"/> Badges Earned
          </h3>
          <div className="flex flex-wrap gap-2">
            {badges.map(b => {
              const icons = { first_drop:'🩸', lifesaver:'💖', hero:'🦸', legend:'👑', guardian:'🛡️', top_rated:'⭐', rapid_responder:'⚡' }
              const labels = { first_drop:'First Drop', lifesaver:'Lifesaver', hero:'Hero', legend:'Legend', guardian:'Guardian', top_rated:'Top Rated', rapid_responder:'Rapid Responder' }
              return (
                <div key={b.badge} className="glass px-3 py-2 rounded-xl flex items-center gap-2 text-sm">
                  <span className="text-lg">{icons[b.badge]}</span>
                  <span className=" font-medium text-ink-900">{labels[b.badge]}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pending requests */}
      <div>
        <h2 className=" font-semibold text-ink-900 mb-3 flex items-center gap-2">
          <Bell size={17} className="text-brand-600"/>
          Blood Requests
          {pending.length > 0 && <span className="badge badge-red ml-1">{pending.length}</span>}
        </h2>

        {pending.length === 0 ? (
          <div className="card p-8 text-center">
            <Bell size={28} className="text-ink-200 mx-auto mb-3"/>
            <p className="text-ink-400">No pending blood requests right now.</p>
            <p className="text-ink-300 text-xs mt-1">You'll be notified when a hospital needs your blood type.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(resp => (
              <div key={resp.id} className={`card p-4 animate-fade-up ${resp.via_ward ? 'border-2 border-brand-500/50 shadow-lg' : 'border border-brand-700/30 shadow-md'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blood flex items-center justify-center shrink-0">
                    <span className="font-mono font-bold text-rose-600">{resp.blood_group}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className=" font-semibold text-ink-900">{resp.hospital_name}</h3>
                      <span className={urgencyColor(resp.urgency)}>{resp.urgency}</span>
                      {resp.via_ward && (
                        <span className="badge badge-brand text-[10px] flex items-center gap-1">
                          🏛️ Via Ward Member
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink-500 mt-0.5">{resp.units_needed} unit{resp.units_needed > 1 ? 's' : ''} needed</p>
                    {resp.via_ward && resp.ward_member_name && (
                      <p className="text-xs text-brand-600 mt-1 flex items-center gap-1">
                        🏛️ Requested by your ward member: <strong>{resp.ward_member_name}</strong>
                        {resp.ward_member_phone && (
                          <a href={`tel:${resp.ward_member_phone}`} className="text-brand-600 hover:text-brand-600 ml-1">
                            ({resp.ward_member_phone})
                          </a>
                        )}
                      </p>
                    )}
                    {resp.patient_name && (
                      <p className="text-xs text-brand-600/70 mt-1">Patient: {resp.patient_name}</p>
                    )}
                    {resp.patient_condition && (
                      <p className="text-xs text-ink-300 mt-0.5 line-clamp-1">{resp.patient_condition}</p>
                    )}
                    {resp.hospital_latitude && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-ink-400">
                        <MapPin size={11} className="text-brand-600"/>
                        <a href={`https://maps.google.com/?q=${resp.hospital_latitude},${resp.hospital_longitude}`}
                           target="_blank" rel="noreferrer" className="hover:text-brand-600 transition-colors">
                          View hospital location
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {resp.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(resp.id, 'rejected')}
                      disabled={responding[resp.id]}
                      className="btn-danger flex-1 justify-center"
                    >
                      <XCircle size={15}/> Reject
                    </button>
                    <button
                      onClick={() => handleAccept(resp)}
                      disabled={responding[resp.id]}
                      className="btn-primary flex-1 justify-center shadow-lg"
                    >
                      {responding[resp.id] ? <Spinner size={15}/> : <CheckCircle size={15}/>}
                      Accept
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className={`badge ${statusColor(resp.status)}`}>{resp.status}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent donation history */}
      {history.length > 0 && (
        <div className="card p-4">
          <h3 className=" font-semibold text-ink-900 mb-3 flex items-center gap-2">
            <Heart size={16} className="text-rose-600"/> Recent Donations
          </h3>
          <div className="space-y-2">
            {history.slice(0, 5).map(h => (
              <div key={h.id} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0">
                <div className="w-8 h-8 rounded-lg bg-blood flex items-center justify-center text-xs font-mono font-bold text-rose-600">
                  {h.blood_group}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-ink-900">{h.hospital_name}</p>
                  <p className="text-xs text-ink-400">{fmtDate(h.donated_at)}</p>
                </div>
                <span className="badge badge-green text-xs">{h.units_donated} unit</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
