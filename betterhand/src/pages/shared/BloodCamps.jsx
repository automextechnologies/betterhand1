import { useState, useEffect } from 'react'
import { donationApi } from '../../api'
import { useAuthStore } from '../../store/authStore'
import { Calendar, MapPin, Clock, Users, Plus, CheckCircle } from 'lucide-react'
import { fmtDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner'

export default function BloodCamps() {
  const { user } = useAuthStore()
  const [camps, setCamps]     = useState([])
  const [myRegs, setMyRegs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [registering, setRegistering] = useState({})
  const [form, setForm] = useState({ title:'', location:'', city:'', state:'', scheduled_date:'', start_time:'09:00', end_time:'17:00', capacity:50, description:'', target_blood_groups:'' })

  const load = async () => {
    setLoading(true)
    try {
      if (user?.role === 'hospital') {
        const r = await donationApi.myCamps()
        setCamps(r.data?.results || r.data || [])
      } else {
        const r = await donationApi.camps({})
        setCamps(r.data?.results || r.data || [])
      }
      if (user?.role === 'donor') {
        const r = await donationApi.myCampRegs()
        setMyRegs(r.data?.results || r.data || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const isReg = (id) => myRegs.some(r => r.camp_id === id && r.status === 'registered')

  const register = async (id) => {
    setRegistering(p => ({ ...p, [id]: true }))
    try { await donationApi.registerCamp(id); toast.success('Registered!'); load() }
    catch (e) { toast.error(e.response?.data?.error || 'Failed') }
    finally { setRegistering(p => ({ ...p, [id]: false })) }
  }

  const cancel = async (id) => {
    try { await donationApi.cancelCampReg(id); toast.success('Cancelled'); load() }
    catch { toast.error('Failed') }
  }

  const createCamp = async () => {
    try { await donationApi.createCamp(form); toast.success('Camp created!'); setShowCreate(false); load() }
    catch { toast.error('Failed to create') }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} className="text-brand-600"/></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2"><Calendar size={22} className="text-brand-600"/>Blood Camps</h1>
          <p className="text-ink-400 text-sm mt-0.5">Upcoming community donation drives</p>
        </div>
        {user?.role === 'hospital' && (
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary"><Plus size={15}/>Create Camp</button>
        )}
      </div>

      {showCreate && (
        <div className="card p-5 space-y-4">
          <h3 className=" font-semibold text-ink-900">New Blood Camp</h3>
          <div className="grid grid-cols-2 gap-4">
            {[['title','Camp Title *'],['location','Location *'],['city','City *'],['state','State *']].map(([k,l]) => (
              <div key={k}>
                <label className="label">{l}</label>
                <input className="input" value={form[k]} onChange={e => setForm(p=>({...p,[k]:e.target.value}))}/>
              </div>
            ))}
            <div>
              <label className="label">Date *</label>
              <input type="date" className="input" value={form.scheduled_date} onChange={e => setForm(p=>({...p,scheduled_date:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Capacity</label>
              <input type="number" className="input" value={form.capacity} onChange={e => setForm(p=>({...p,capacity:+e.target.value}))}/>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows="2" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={createCamp} className="btn-primary flex-1 justify-center"><Plus size={15}/>Create</button>
          </div>
        </div>
      )}

      {camps.length === 0 ? (
        <div className="card p-10 text-center">
          <Calendar size={32} className="text-ink-300 mx-auto mb-3"/>
          <p className="text-ink-400">No upcoming blood camps.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {camps.map(c => (
            <div key={c.id} className="card p-5 hover:border-brand-700/30 transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className=" font-semibold text-ink-900">{c.title}</h3>
                  {c.hospital_name && <p className="text-xs text-brand-600/70 mt-0.5">by {c.hospital_name}</p>}
                </div>
                <span className={`badge shrink-0 ${c.is_full ? 'badge-red' : 'badge-green'}`}>{c.is_full ? 'Full' : 'Open'}</span>
              </div>
              <div className="space-y-1.5 mb-4 text-sm text-ink-600">
                <div className="flex items-center gap-2"><Calendar size={13} className="text-brand-600"/>{fmtDate(c.scheduled_date)}</div>
                <div className="flex items-center gap-2"><Clock size={13} className="text-brand-600"/>{c.start_time} — {c.end_time}</div>
                <div className="flex items-center gap-2"><MapPin size={13} className="text-brand-600"/>{c.location}, {c.city}</div>
                <div className="flex items-center gap-2"><Users size={13} className="text-brand-600"/>{c.registered_count}/{c.capacity} registered</div>
              </div>
              {user?.role === 'donor' && (isReg(c.id) ? (
                <button onClick={() => cancel(c.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-accent-500/30 hover:bg-brand-50 hover:text-danger-500 transition-all text-sm font-semibold">
                  <CheckCircle size={14}/> Registered — Cancel?
                </button>
              ) : (
                <button onClick={() => register(c.id)} disabled={c.is_full || registering[c.id]}
                  className="btn-primary w-full justify-center text-sm py-2.5">
                  {registering[c.id] ? <Spinner size={14}/> : <Calendar size={14}/>}
                  {registering[c.id] ? 'Registering…' : 'Register'}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
