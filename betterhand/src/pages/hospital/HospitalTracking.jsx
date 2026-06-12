import { useState, useEffect, useCallback } from 'react'
import { donationApi } from '../../api'
import { AUTO_REFRESH_EVENT } from '../../components/common/Layout'
import LiveMap from '../../components/common/LiveMap'
import { Navigation, RefreshCw, MapPin, Clock, User } from 'lucide-react'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function HospitalTracking() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try { const r = await donationApi.dashboard(); setData(r.data) }
    catch { toast.error('Failed to load tracking') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = () => load(); window.addEventListener(AUTO_REFRESH_EVENT, h)
    return () => window.removeEventListener(AUTO_REFRESH_EVENT, h)
  }, [load])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} className="text-brand-600"/></div>

  const active = (data?.active_requests_list || data?.requests || []).filter(
    r => ['confirmed','active'].includes(r.status))
  const confirmed = []
  active.forEach(r => (r.confirmed_donors || r.top_donors || []).forEach(d => confirmed.push({ ...d, request:r })))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2"><Navigation size={22} className="text-brand-600"/> Live Tracking</h1>
          <p className="text-ink-400 text-sm mt-0.5">Track confirmed donors heading to your hospital</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14}/> Refresh</button>
      </div>

      {confirmed.length === 0 ? (
        <div className="card p-10 text-center">
          <MapPin size={28} className="text-ink-200 mx-auto mb-3"/>
          <p className="text-ink-400 text-sm">No donors currently being tracked.</p>
          <p className="text-ink-300 text-xs mt-1">Confirm donors from a request to track them live here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {confirmed.map((d,i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><User size={18}/></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-ink-900">{d.full_name || d.donor_name}</h4>
                  <p className="text-xs text-ink-400">{d.blood_group} · for {d.request?.patient_name}</p>
                </div>
                {d.eta_minutes != null && <span className="badge badge-brand flex items-center gap-1"><Clock size={11}/> {d.eta_minutes} min</span>}
              </div>
              {d.latitude && d.longitude && (
                <div className="h-48 rounded-xl overflow-hidden">
                  <LiveMap
                    hospital={d.request?.hospital_latitude ? {
                      lat:d.request.hospital_latitude, lng:d.request.hospital_longitude,
                      name:d.request.hospital_name } : null}
                    donors={[{ id:d.donor_id||i, lat:d.latitude, lng:d.longitude,
                      name:d.full_name||d.donor_name, eta:d.eta_minutes }]}/>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
