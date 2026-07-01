import { useState, useEffect, useCallback } from 'react'
import { donationApi } from '../../api'
import { AUTO_REFRESH_EVENT } from '../../components/common/Layout'
import { Droplets, Clock, CheckCircle, XCircle, User, RefreshCw, ChevronDown, Activity, Phone, Info } from 'lucide-react'
import { fmtAgo, urgencyColor } from '../../utils/helpers'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function HospitalRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  const load = useCallback(async () => {
    try { const r = await donationApi.hospitalRequests(); setRequests(r.data?.results || r.data || []) }
    catch { toast.error('Failed to load operations history') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = () => load(); window.addEventListener(AUTO_REFRESH_EVENT, h)
    return () => window.removeEventListener(AUTO_REFRESH_EVENT, h)
  }, [load])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={40} className="text-brand-600"/></div>

  const filtered = filter === 'all' ? requests
    : requests.filter(r => filter === 'active' ? ['pending','active','confirmed'].includes(r.status) : r.status === filter)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-12 max-w-4xl">
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-ink-900 flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 rounded-2xl">
              <Droplets size={24} className="text-brand-600"/>
            </div>
            Operations History
          </h1>
          <p className="text-ink-500 text-[15px] font-medium mt-2">Comprehensive log of all blood requests initiated by your facility.</p>
        </div>
        <button onClick={load} className="btn-secondary bg-white border border-ink-200 shadow-sm hover:border-ink-300">
          <RefreshCw size={16}/> Sync Data
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-2 p-1.5 rounded-2xl bg-white border border-ink-200 shadow-sm w-fit overflow-x-auto max-w-full no-scrollbar">
        {[
          { id:'all', label:'All Operations' },
          { id:'active', label:'Active' },
          { id:'completed', label:'Completed' },
          { id:'cancelled', label:'Cancelled' }
        ].map(({id, label}) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all whitespace-nowrap
              ${filter===id ? 'bg-ink-900 text-white shadow-md' : 'text-ink-500 hover:text-ink-800 hover:bg-ink-50'}`}>
            {label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {filtered.length === 0 ? (
            <div className="card p-16 text-center mt-6 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-ink-50 rounded-full flex items-center justify-center mb-5">
                <Activity size={32} className="text-ink-300"/>
              </div>
              <h3 className="text-xl font-display font-black text-ink-900 mb-2">No {filter !== 'all' ? filter : ''} operations found</h3>
              <p className="text-ink-500 text-[15px]">There are no blood requests matching this filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(req => {
                const isOpen = expanded === req.id
                return (
                  <motion.div variants={itemVariants} key={req.id} className="card overflow-hidden shadow-sm hover:shadow-md transition-shadow border-ink-200">
                    <button onClick={() => setExpanded(isOpen ? null : req.id)}
                      className={`w-full flex flex-col sm:flex-row sm:items-center gap-4 p-5 transition-colors text-left ${isOpen ? 'bg-ink-50/50' : 'hover:bg-ink-50/30'}`}>
                      
                      <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center font-display font-black text-brand-600 text-xl shrink-0 shadow-inner">
                          {req.blood_group}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h4 className="text-lg font-display font-bold text-ink-900">{req.patient_name || 'Anonymous Patient'}</h4>
                            <span className="bg-ink-100 text-ink-700 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                              {req.units_needed} Unit{req.units_needed>1?'s':''}
                            </span>
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider
                              ${req.urgency === 'Critical' ? 'bg-rose-100 text-rose-700' : req.urgency === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                              {req.urgency}
                            </span>
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider
                              ${req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                                req.status === 'cancelled' ? 'bg-ink-200 text-ink-600' : 
                                req.status === 'confirmed' ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-700'}`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-[14px] text-ink-500 font-medium truncate flex items-center gap-2">
                            {req.patient_ward && <span className="text-ink-700 font-bold">{req.patient_ward}</span>}
                            {req.patient_ward && <span className="text-ink-300">•</span>}
                            <span>Broadcasted {fmtAgo(req.created_at)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-ink-100">
                        <div className="flex gap-4 text-[13px] font-bold">
                          <span className="flex items-center gap-1.5 text-emerald-600" title="Accepted"><CheckCircle size={16}/> {req.accepted_count ?? 0}</span>
                          <span className="flex items-center gap-1.5 text-amber-600" title="Pending"><Clock size={16}/> {req.pending_count ?? 0}</span>
                          <span className="flex items-center gap-1.5 text-rose-600" title="Rejected"><XCircle size={16}/> {req.rejected_count ?? 0}</span>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform shrink-0 bg-white shadow-sm border border-ink-100 ${isOpen ? 'rotate-180' : ''}`}>
                          <ChevronDown size={16} className="text-ink-600"/>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-ink-100 bg-ink-50/30"
                        >
                          <div className="p-6">
                            <h5 className="text-[13px] font-bold text-ink-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <Info size={16}/> Medical Context
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {req.patient_condition && (
                                <div className="space-y-1">
                                  <p className="text-[12px] font-bold text-ink-400 uppercase tracking-wider">Clinical Condition</p>
                                  <p className="text-[15px] font-medium text-ink-900">{req.patient_condition}</p>
                                </div>
                              )}
                              
                              {(req.patient_room || req.patient_bed) && (
                                <div className="space-y-1">
                                  <p className="text-[12px] font-bold text-ink-400 uppercase tracking-wider">Location</p>
                                  <p className="text-[15px] font-medium text-ink-900">
                                    {req.patient_room ? `Room ${req.patient_room}` : ''}
                                    {req.patient_room && req.patient_bed ? ' / ' : ''}
                                    {req.patient_bed ? `Bed ${req.patient_bed}` : ''}
                                  </p>
                                </div>
                              )}

                              {req.bystander_name && (
                                <div className="space-y-1 lg:col-span-1 sm:col-span-2">
                                  <p className="text-[12px] font-bold text-ink-400 uppercase tracking-wider">Emergency Contact</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[15px] font-medium text-ink-900">{req.bystander_name}</span>
                                    {req.bystander_phone && (
                                      <span className="text-[13px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100 flex items-center gap-1.5">
                                        <Phone size={12}/> {req.bystander_phone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
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
      </AnimatePresence>
    </motion.div>
  )
}
