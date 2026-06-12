import { useState, useEffect } from 'react'
import { donationApi } from '../../api'
import { Heart, Award, Calendar, Droplets, Clock, RefreshCw, Star } from 'lucide-react'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

const BADGES = {
  first_drop:'First Drop', lifesaver:'Lifesaver', hero:'Hero', legend:'Legend',
  guardian:'Guardian', top_rated:'Top Rated', rapid_responder:'Rapid Responder'
}

export default function DonorHistory() {
  const [history, setHistory] = useState([])
  const [badges, setBadges] = useState([])
  const [cooldown, setCooldown] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [h, b, c] = await Promise.all([
        donationApi.donorHistory(), donationApi.myBadges(), donationApi.cooldown()
      ])
      setHistory(h.data?.results || h.data || [])
      setBadges(b.data?.badges || b.data || [])
      setCooldown(c.data)
    } catch { toast.error('Failed to load history') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} className="text-brand-600"/></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2"><Heart size={22} className="text-brand-600"/> My Donations</h1>
          <p className="text-ink-400 text-sm mt-0.5">Your donation history and earned badges</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14}/> Refresh</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center mb-2"><Droplets size={18} className="text-brand-600"/></div>
          <p className="text-2xl font-display font-bold text-ink-900">{history.length}</p>
          <p className="text-xs text-ink-400">Total Donations</p>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center mb-2"><Award size={18} className="text-amber-600"/></div>
          <p className="text-2xl font-display font-bold text-ink-900">{badges.length}</p>
          <p className="text-xs text-ink-400">Badges Earned</p>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center mb-2"><Clock size={18} className="text-emerald-600"/></div>
          <p className="text-sm font-display font-bold text-ink-900 mt-1">
            {cooldown?.is_on_cooldown ? `Until ${cooldown.cooldown_until?.slice(0,10)}` : 'Ready to donate'}
          </p>
          <p className="text-xs text-ink-400">Cooldown Status</p>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="card p-5">
          <h3 className="font-display font-bold text-ink-900 mb-3">Your Badges</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map(b => {
              const key = typeof b === 'string' ? b : b.badge
              return <span key={key} className="badge badge-brand flex items-center gap-1"><Award size={11}/> {BADGES[key]||key}</span>
            })}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h3 className="font-display font-bold text-ink-900 mb-3">Donation Records</h3>
        {history.length === 0 ? (
          <div className="card p-10 text-center">
            <Heart size={28} className="text-ink-200 mx-auto mb-3"/>
            <p className="text-ink-400 text-sm">No donations yet. Your first donation will appear here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(d => (
              <div key={d.id} className="card p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center font-mono font-bold text-brand-600 shrink-0">
                  {d.blood_group}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-ink-900 text-sm">{d.hospital_name}</h4>
                  <p className="text-xs text-ink-400 flex items-center gap-2 mt-0.5">
                    <Calendar size={11}/> {d.donated_at?.slice(0,10)} · {d.units_donated} unit{d.units_donated>1?'s':''}
                    {d.hospital_city && <span>· {d.hospital_city}</span>}
                  </p>
                </div>
                {d.hospital_rating && (
                  <span className="badge badge-yellow flex items-center gap-1"><Star size={11}/> {d.hospital_rating.stars}/5</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
