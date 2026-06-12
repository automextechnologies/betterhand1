import { useState, useEffect } from 'react'
import { wardApi } from '../../api'
import { useAuthStore } from '../../store/authStore'
import { Shield, User, Phone, MapPin, Mail, Landmark, CheckCircle, AlertTriangle } from 'lucide-react'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function WardProfile() {
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    wardApi.dashboard()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} className="text-brand-600"/></div>

  const ward = data?.ward
  const verified = data?.is_verified

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="section-title flex items-center gap-2"><Shield size={22} className="text-brand-600"/> Ward Member Profile</h1>
        <p className="text-ink-400 text-sm mt-0.5">Your ward coordination details</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-2xl font-display font-bold">
            {(data?.member_name||'?')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900">{data?.member_name}</h2>
            <span className={`badge mt-1 ${verified?'badge-green':'badge-yellow'}`}>
              {verified ? <><CheckCircle size={11}/> Verified</> : <><AlertTriangle size={11}/> Pending Verification</>}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            [Mail, 'Email', user?.email],
            [Landmark, 'Ward', `Ward ${ward?.ward_number}, ${ward?.local_body_name}`],
            [MapPin, 'District', `${ward?.district}, ${ward?.state}`],
          ].map(([Icon,label,val]) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-ink-100">
              <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center"><Icon size={16} className="text-brand-600"/></div>
              <div>
                <p className="text-xs text-ink-400">{label}</p>
                <p className="text-sm font-semibold text-ink-800">{val}</p>
              </div>
            </div>
          ))}
        </div>

        {!verified && (
          <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5"/>
            <p className="text-xs text-amber-700">Your account is pending admin verification. You'll start receiving blood alerts once verified.</p>
          </div>
        )}
      </div>
    </div>
  )
}
