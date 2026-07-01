import { useState, useEffect, useCallback } from 'react'
import { donationApi } from '../../api'
import { AUTO_REFRESH_EVENT } from '../../components/common/Layout'
import LiveMap from '../../components/common/LiveMap'
import { Navigation, RefreshCw, MapPin, Clock, User, Droplets, Info } from 'lucide-react'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function HospitalTracking() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try { const r = await donationApi.dashboard(); setData(r.data) }
    catch { toast.error('Failed to load live dispatch tracking') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = () => load(); window.addEventListener(AUTO_REFRESH_EVENT, h)
    return () => window.removeEventListener(AUTO_REFRESH_EVENT, h)
  }, [load])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={40} className="text-brand-600"/></div>

  const active = (data?.active_requests_list || data?.requests || data?.active_requests || []).filter(
    r => ['confirmed','active'].includes(r.request?.status || r.status))
  const confirmed = []
  active.forEach(item => {
    const req = item.request || item;
    const donors = item.confirmed_donors || req.confirmed_donors || item.top_donors || []
    donors.forEach(d => {
      // Ensure we have latitude/longitude correctly mapped
      const lat = d.donor_latitude || d.latitude;
      const lng = d.donor_longitude || d.longitude;
      const name = d.donor_name || d.full_name;
      const id = d.id || d.donor_id;
      
      if(lat && lng) {
        confirmed.push({ ...d, request:req, lat, lng, name, mappedId: id })
      }
    })
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-12 max-w-6xl">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-ink-900 flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 rounded-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-brand-200/50 scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full"/>
              <Navigation size={24} className="text-brand-600 relative z-10"/>
            </div>
            Live Dispatch Tracking
          </h1>
          <p className="text-ink-500 text-[15px] font-medium mt-2">Real-time GPS tracking of confirmed donors en route to your facility.</p>
        </div>
        <button onClick={load} className="btn-secondary bg-white border border-ink-200 shadow-sm hover:border-ink-300 px-5 py-2.5">
          <RefreshCw size={16}/> Sync Location Data
        </button>
      </motion.div>

      {confirmed.length === 0 ? (
        <motion.div variants={itemVariants} className="card p-16 text-center mt-6 flex flex-col items-center justify-center border-ink-200 shadow-sm bg-white/50 backdrop-blur-sm">
          <div className="w-24 h-24 bg-ink-50 rounded-full flex items-center justify-center mb-6 border border-ink-100 shadow-inner">
            <MapPin size={40} className="text-ink-300"/>
          </div>
          <h3 className="text-xl font-display font-black text-ink-900 mb-2">No Active Dispatches</h3>
          <p className="text-ink-500 text-[15px] max-w-md mx-auto">There are currently no confirmed donors actively traveling to your hospital. Confirm donors from the operations dashboard to track them here.</p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {confirmed.map((d,i) => (
            <div key={i} className="card overflow-hidden border-ink-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col bg-white">
              <div className="p-5 border-b border-ink-100 bg-gradient-to-r from-ink-50/50 to-transparent flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner border border-emerald-100">
                      <User size={24}/>
                    </div>
                    {/* Pulsing indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-display font-black text-ink-900">{d.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-brand-50 text-brand-700 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider">
                        <Droplets size={10}/> {d.blood_group || d.request?.blood_group || 'Unknown'}
                      </span>
                      <span className="text-ink-400 text-[13px] font-medium">•</span>
                      <span className="text-ink-500 text-[13px] font-medium truncate max-w-[150px] sm:max-w-[200px]" title={d.request?.patient_name}>
                        Patient: {d.request?.patient_name || 'Anonymous'}
                      </span>
                    </div>
                  </div>
                </div>

                {d.eta_minutes != null && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1">ETA</span>
                    <span className="bg-brand-600 text-white px-3 py-1.5 rounded-lg text-[14px] font-black flex items-center gap-1.5 shadow-brand-500/25">
                      <Clock size={14}/> {d.eta_minutes} min
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 bg-ink-50 relative z-0">
                {/* Decorative map overlay to simulate HUD */}
                <div className="absolute inset-0 pointer-events-none z-10 border-[6px] border-white/20 mix-blend-overlay"></div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-bold text-ink-700 shadow-sm z-20 flex items-center gap-1.5 border border-ink-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Live Tracking Active
                </div>
                
                <div className="h-[300px] w-full">
                  <LiveMap
                    hospital={d.request?.hospital_latitude ? {
                      lat: d.request.hospital_latitude, 
                      lng: d.request.hospital_longitude,
                      name: d.request.hospital_name || 'Your Facility'
                    } : null}
                    donors={[{ 
                      id: d.mappedId || i, 
                      lat: d.lat, 
                      lng: d.lng,
                      name: d.name, 
                      eta: d.eta_minutes 
                    }]}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              
              <div className="p-3 bg-white border-t border-ink-100 flex justify-between items-center text-[12px] font-medium text-ink-500">
                <span className="flex items-center gap-1.5"><Info size={14} className="text-brand-500"/> Location auto-updates every 30s</span>
                <span>ID: #{d.mappedId?.toString().substring(0,6) || 'SYS-'+i}</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
