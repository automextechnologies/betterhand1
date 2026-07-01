import { useState, useEffect } from 'react'
import { donationApi } from '../../api'
import { Heart, Award, Calendar, Droplets, Clock, RefreshCw, Star } from 'lucide-react'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

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

  if (loading) return <div className="flex justify-center py-20"><Spinner size={40} className="text-brand-600"/></div>

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
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-ink-900 flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 rounded-2xl">
              <Heart size={24} className="text-brand-600"/>
            </div>
            My Donations
          </h1>
          <p className="text-ink-500 text-[15px] font-medium mt-2">Your complete donation history and earned achievements.</p>
        </div>
        <button onClick={load} className="btn-secondary shadow-sm hover:shadow-md">
          <RefreshCw size={16}/> Refresh
        </button>
      </motion.div>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="card p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0 shadow-inner">
            <Droplets size={24} className="text-brand-600"/>
          </div>
          <div>
            <p className="text-3xl font-display font-black text-ink-900">{history.length}</p>
            <p className="text-sm font-bold text-ink-500 uppercase tracking-wider mt-0.5">Total Donations</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="card p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 shadow-inner">
            <Award size={24} className="text-amber-600"/>
          </div>
          <div>
            <p className="text-3xl font-display font-black text-ink-900">{badges.length}</p>
            <p className="text-sm font-bold text-ink-500 uppercase tracking-wider mt-0.5">Badges Earned</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 shadow-inner">
            <Clock size={24} className="text-emerald-600"/>
          </div>
          <div>
            <p className="text-[17px] font-display font-black text-ink-900 leading-tight">
              {cooldown?.is_on_cooldown ? `Until ${cooldown.cooldown_until?.slice(0,10)}` : 'Ready to donate'}
            </p>
            <p className="text-sm font-bold text-ink-500 uppercase tracking-wider mt-1.5">Cooldown Status</p>
          </div>
        </motion.div>
      </div>

      {/* Badges & History Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-display font-black text-ink-900 mb-5">Donation Records</h3>
            {history.length === 0 ? (
              <div className="card p-12 text-center">
                <Heart size={32} className="text-ink-300 mx-auto mb-4"/>
                <p className="text-lg font-bold text-ink-900 mb-2">No donations yet</p>
                <p className="text-ink-500 text-[15px]">Your heroic journey hasn't started. Your first donation will appear here!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map(d => (
                  <motion.div key={d.id} variants={itemVariants} className="card p-5 flex items-center gap-5 transition-all hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center font-mono font-black text-brand-600 text-xl shrink-0 shadow-inner">
                      {d.blood_group}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[17px] font-display font-bold text-ink-900 truncate">{d.hospital_name}</h4>
                      <div className="flex items-center gap-3 text-sm text-ink-500 font-medium mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(d.donated_at).toLocaleDateString()}</span>
                        {d.hospital_city && <span className="hidden sm:inline">•</span>}
                        {d.hospital_city && <span>{d.hospital_city}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-bold">
                        {d.units_donated} unit{d.units_donated>1?'s':''}
                      </span>
                      {d.hospital_rating && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                          <Star size={12} className="fill-amber-500 text-amber-500"/> {d.hospital_rating.stars}/5
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Badges Column */}
        {badges.length > 0 && (
          <motion.div variants={itemVariants} className="card p-6">
            <h3 className="text-xl font-display font-black text-ink-900 mb-5 flex items-center gap-2">
              <Award size={24} className="text-amber-500"/>
              Your Badges
            </h3>
            <div className="flex flex-col gap-3">
              {badges.map(b => {
                const key = typeof b === 'string' ? b : b.badge
                const icons = { first_drop:'🩸', lifesaver:'💖', hero:'🦸', legend:'👑', guardian:'🛡️', top_rated:'⭐', rapid_responder:'⚡' }
                return (
                  <div key={key} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 p-3 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-2xl drop-shadow-sm bg-white p-2 rounded-xl shadow-sm">{icons[key] || '🏅'}</span>
                    <span className="font-bold text-amber-900 text-[15px]">{BADGES[key]||key}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
