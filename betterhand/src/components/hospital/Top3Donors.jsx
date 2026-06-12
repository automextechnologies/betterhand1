import { useState } from 'react'
import { donationApi } from '../../api'
import { MapPin, Clock, Star, Phone, MessageCircle, CheckCircle, Users, Zap } from 'lucide-react'
import { whatsappLink, callLink, formatEta, getErrMsg } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Spinner from '../common/Spinner'
import clsx from 'clsx'

const COLORS = ['from-emerald-600 to-emerald-800', 'from-amber-600 to-amber-800', 'from-sky-600 to-sky-800']
const LABELS = ['1st', '2nd', '3rd']

export default function Top3Donors({ requestId, donors, stats, onConfirmed }) {
  const [confirming, setConfirming] = useState(false)

  const handleConfirmAll = async () => {
    if (!donors.length) return
    setConfirming(true)
    try {
      const ids = donors.map(d => d.id)
      await donationApi.confirmAll(requestId, { response_ids: ids })
      toast.success(`✅ ${donors.length} donors confirmed! They are heading to you.`)
      onConfirmed?.()
    } catch (e) {
      toast.error(getErrMsg(e))
    } finally {
      setConfirming(false)
    }
  }

  if (!donors?.length) {
    return (
      <div className="card p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-3">
          <Users size={22} className="text-ink-400"/>
        </div>
        <p className="text-ink-500 text-sm">Waiting for donor responses…</p>
        <p className="text-ink-900/25 text-xs mt-1">Notifications sent. Check back in a moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Accepted', val: stats.total_accepted, color: 'text-emerald-600' },
            { label: 'Pending', val: stats.pending_count, color: 'text-yellow-400' },
            { label: 'Rejected', val: stats.rejected_count, color: 'text-rose-600' },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl px-3 py-2.5 text-center">
              <p className={`text-xl  font-bold ${s.color}`}>{s.val ?? 0}</p>
              <p className="text-xs text-ink-400 font-body">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Confirm All button */}
      <button
        onClick={handleConfirmAll}
        disabled={confirming}
        className="btn-primary w-full justify-center text-base py-3 shadow-lg animate-pulse-glow"
      >
        {confirming ? <Spinner size={18}/> : <CheckCircle size={18}/>}
        {confirming ? 'Confirming…' : `✅ Select All ${donors.length} Donors`}
      </button>

      {/* Donor cards */}
      <div className="space-y-3">
        {donors.map((d, i) => (
          <div key={d.id} className={clsx('card p-4 border animate-fade-up', 'border-ink-200 hover:border-brand-700/40 transition-all duration-300')}
               style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-start gap-3">
              {/* Rank badge */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${COLORS[i]} flex items-center justify-center text-ink-900  font-bold text-sm shrink-0`}>
                {LABELS[i]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className=" font-semibold text-ink-900 truncate">{d.donor_name}</h4>
                  <span className="bg-blood px-2 py-0.5 rounded-md text-xs font-mono font-bold shrink-0">
                    {d.blood_group}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-ink-500">
                    <MapPin size={11} className="text-brand-600"/>
                    {d.distance_km ? `${parseFloat(d.distance_km).toFixed(1)} km` : '—'}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-500">
                    <Clock size={11} className="text-amber-400"/>
                    ETA {formatEta(d.eta_minutes)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-500">
                    <Star size={11} className="text-yellow-400 fill-yellow-400"/>
                    {d.avg_rating ? `${d.avg_rating}/5` : 'Unrated'}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-500">
                    <Zap size={11} className="text-emerald-600"/>
                    {d.acceptance_rate ? `${d.acceptance_rate}% reliable` : `${d.total_donations || 0} donations`}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-3">
              {d.donor_phone && (
                <a href={callLink(d.donor_phone)} className="btn-ghost flex-1 justify-center text-xs py-2 border border-ink-200">
                  <Phone size={13}/> Call
                </a>
              )}
              {d.donor_whatsapp && (
                <a href={whatsappLink(d.donor_whatsapp)} target="_blank" rel="noreferrer"
                   className="btn-ghost flex-1 justify-center text-xs py-2 border border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                  <MessageCircle size={13}/> WhatsApp
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
