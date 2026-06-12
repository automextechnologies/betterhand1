import { useState } from 'react'
import api from '../../api/axios'
import { BLOOD_GROUPS, whatsappLink, callLink, getErrMsg } from '../../utils/helpers'
import { Search, MapPin, Phone, MessageCircle, Star, ChevronDown, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../common/Spinner'

const SS = { color:'#252030', backgroundColor:'#ffffff' }
const OS = { backgroundColor:'#ffffff', color:'#252030' }

export default function NearestDonors() {
  const [bloodGroup, setBloodGroup] = useState('')
  const [radius, setRadius]         = useState(50)
  const [donors, setDonors]         = useState([])
  const [loading, setLoading]       = useState(false)
  const [searched, setSearched]     = useState(false)
  const [error, setError]           = useState('')

  const search = async () => {
    if (!bloodGroup) { toast.error('Select a blood group first'); return }
    setLoading(true)
    setSearched(true)
    setError('')
    setDonors([])
    try {
      const res = await api.get(`/accounts/donors/search/?blood_group=${encodeURIComponent(bloodGroup)}&radius_km=${radius}`)
      const list = res.data?.results || []
      setDonors(list)
      if (!list.length) {
        setError(`No available ${bloodGroup} donors found within ${radius}km. Try increasing the radius or check that your hospital location is set in your profile.`)
      } else {
        toast.success(`Found ${list.length} donor${list.length > 1 ? 's' : ''}!`)
      }
    } catch (e) {
      const msg = getErrMsg(e)
      if (msg.includes('location')) {
        setError('Your hospital GPS location is not set. Go to Profile → Edit Profile → Get Location button.')
      } else {
        setError(msg)
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="card p-5 space-y-5">
      <div>
        <h3 className=" font-semibold text-surface-900 text-lg flex items-center gap-2 mb-1">
          <Search size={18} className="text-brand-600"/>
          Find Nearest Available Donors
        </h3>
        <p className="text-surface-400 text-xs">
          Searches donors by blood group within your selected radius from your hospital location.
        </p>
      </div>

      {/* Search controls */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-36">
          <label className="label">Blood Group</label>
          <div className="relative">
            <select className="select pr-8" style={SS} value={bloodGroup}
              onChange={e => setBloodGroup(e.target.value)}>
              <option value="" style={OS}>Select blood group</option>
              {BLOOD_GROUPS.map(g => <option key={g} value={g} style={OS}>{g}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
          </div>
        </div>
        <div className="w-36">
          <label className="label">Search Radius</label>
          <div className="relative">
            <select className="select pr-8" style={SS} value={radius}
              onChange={e => setRadius(+e.target.value)}>
              {[5,10,25,50,100,200].map(r =>
                <option key={r} value={r} style={OS}>{r} km</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
          </div>
        </div>
        <div className="flex items-end">
          <button onClick={search} disabled={loading || !bloodGroup}
            className="btn-primary px-5 py-2.5">
            {loading ? <Spinner size={15}/> : <Search size={15}/>}
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {searched && !loading && error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-900/20 border border-yellow-600/20">
          <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5"/>
          <div>
            <p className="text-yellow-300 text-sm font-medium">No donors found</p>
            <p className="text-yellow-300/60 text-xs mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {donors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-surface-500  uppercase tracking-wider">
              {donors.length} donor{donors.length > 1 ? 's' : ''} found
            </p>
            <span className="badge badge-green text-xs">Sorted by distance</span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin pr-1">
            {donors.map((d, i) => (
              <div key={d.id || i}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200 hover:border-white/15 transition-colors">
                {/* Rank */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-brand-600 to-brand-400 flex items-center justify-center text-xs font-bold text-surface-900 shrink-0">
                  {i + 1}
                </div>
                {/* Blood group */}
                <div className="w-10 h-10 rounded-xl bg-blood flex items-center justify-center font-mono font-bold text-rose-600 text-sm shrink-0">
                  {d.blood_group}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className=" font-semibold text-surface-900 text-sm truncate">{d.full_name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-surface-400 flex-wrap">
                    {d.distance_km != null && (
                      <span className="flex items-center gap-1">
                        <MapPin size={10} className="text-brand-600"/>
                        {parseFloat(d.distance_km).toFixed(1)} km away
                      </span>
                    )}
                    {d.ward_number && (
                      <span>Ward {d.ward_number}</span>
                    )}
                  </div>
                </div>
                {/* Contact buttons */}
                <div className="flex gap-1.5 shrink-0">
                  {d.phone && (
                    <a href={callLink(d.phone)} title="Call donor"
                      className="w-8 h-8 rounded-lg bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 flex items-center justify-center transition-colors">
                      <Phone size={14}/>
                    </a>
                  )}
                  {d.whatsapp_number && (
                    <a href={whatsappLink(d.whatsapp_number)} target="_blank" rel="noreferrer" title="WhatsApp donor"
                      className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-accent-600/30 flex items-center justify-center transition-colors">
                      <MessageCircle size={14}/>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help note */}
      {!searched && (
        <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 text-center">
          <MapPin size={24} className="text-surface-300 mx-auto mb-2"/>
          <p className="text-surface-400 text-sm">Select a blood group and click Search</p>
          <p className="text-surface-900/25 text-xs mt-1">
            Make sure your hospital location is set in Profile → Edit Profile → Get Location
          </p>
        </div>
      )}
    </div>
  )
}
