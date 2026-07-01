import { useState, useEffect } from 'react'
import { wardApi } from '../../api'
import { useAuthStore } from '../../store/authStore'
import { Shield, User, Phone, MapPin, Mail, Landmark, CheckCircle, AlertTriangle, Building2, Map, Award } from 'lucide-react'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function WardProfile() {
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    wardApi.dashboard()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load ward profile'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={40} className="text-brand-600"/></div>

  const ward = data?.ward
  const verified = data?.is_verified

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl space-y-8 pb-12">
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center shadow-inner shrink-0 relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand-200/50 scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full"/>
          <Shield size={28} className="text-brand-600 relative z-10"/>
        </div>
        <div>
          <h1 className="text-3xl font-display font-black text-ink-900 tracking-tight">Ward Profile</h1>
          <p className="text-ink-500 text-[15px] font-medium mt-1">Your official coordination identity and jurisdiction details.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Identity Card */}
        <motion.div variants={itemVariants} className="md:col-span-1 card p-6 border-ink-200 bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500 opacity-50"/>
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500 to-accent-600 text-white flex items-center justify-center text-4xl font-display font-black shadow-lg shadow-brand-500/25 mb-4 border-4 border-white">
              {(data?.member_name||'?')[0].toUpperCase()}
            </div>
            <h2 className="text-[20px] font-display font-black text-ink-900">{data?.member_name}</h2>
            <p className="text-[13px] font-bold text-ink-500 uppercase tracking-wider mt-1 mb-4">Ward Coordinator</p>
            
            <div className={`px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border
              ${verified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {verified ? <><CheckCircle size={14}/> Verified Identity</> : <><AlertTriangle size={14}/> Pending Admin Verification</>}
            </div>
          </div>
          
          <div className="space-y-4 pt-6 border-t border-ink-100">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider flex items-center gap-1"><Mail size={12}/> Registered Email</span>
              <span className="text-[14px] font-bold text-ink-900 break-all">{user?.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider flex items-center gap-1"><Award size={12}/> Account Role</span>
              <span className="text-[14px] font-bold text-ink-900">Local Body Member</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Jurisdiction Details */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          <div className="card p-6 sm:p-8 border-ink-200 bg-white">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-ink-100">
              <div className="w-10 h-10 rounded-xl bg-ink-100 text-ink-600 flex items-center justify-center shadow-inner"><Map size={20}/></div>
              <div>
                <h3 className="text-[18px] font-display font-black text-ink-900">Jurisdiction Information</h3>
                <p className="text-[13px] font-medium text-ink-500">The geographical area under your coordination</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-ink-50 border border-ink-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-ink-200 shadow-sm flex items-center justify-center text-ink-500 shrink-0">
                  <Landmark size={24}/>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1">Local Body Name</p>
                  <p className="text-[16px] font-display font-black text-ink-900">{ward?.local_body_name || 'Not Specified'}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-ink-50 border border-ink-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-ink-200 shadow-sm flex items-center justify-center text-brand-600 shrink-0 font-display font-black text-xl">
                  #{ward?.ward_number || '?'}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1">Ward Number</p>
                  <p className="text-[16px] font-display font-black text-ink-900">Ward {ward?.ward_number || 'Not Specified'}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-ink-50 border border-ink-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-ink-200 shadow-sm flex items-center justify-center text-ink-500 shrink-0">
                  <Building2 size={24}/>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1">District</p>
                  <p className="text-[16px] font-display font-black text-ink-900">{ward?.district || 'Not Specified'}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-ink-50 border border-ink-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-ink-200 shadow-sm flex items-center justify-center text-ink-500 shrink-0">
                  <MapPin size={24}/>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1">State</p>
                  <p className="text-[16px] font-display font-black text-ink-900">{ward?.state || 'Not Specified'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-bold text-brand-900">Need to update jurisdiction details?</p>
                <p className="text-[12px] font-medium text-brand-700 mt-0.5">Please contact the system administrator to change assigned ward.</p>
              </div>
            </div>
          </div>

          {!verified && (
            <motion.div variants={itemVariants} className="card p-6 border-amber-200 bg-amber-50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24}/>
                </div>
                <div>
                  <h3 className="text-[16px] font-display font-black text-amber-900 mb-1">Action Required</h3>
                  <p className="text-[14px] font-medium text-amber-800 leading-relaxed">
                    Your ward coordinator account is currently restricted. An administrator must verify your credentials and jurisdiction assignment before you can broadcast blood alerts or access the full local donor directory.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
