import { useState, useEffect } from 'react'
import { donationApi } from '../../api'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Droplets, CheckCircle, Star } from 'lucide-react'
import Spinner from '../../components/common/Spinner'

const COLORS = ['#7c3aff','#10b981','#f59e0b','#ef4444','#60a5fa','#a78bfa','#34d399','#fb923c']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-3 py-2 border border-ink-200 text-xs">
      <p className="text-ink-600 mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }} className="font-mono font-medium">{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function HospitalAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    donationApi.analytics().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} className="text-brand-600"/></div>
  if (!data) return <p className="text-ink-400 text-center py-20">No analytics data.</p>

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="section-title">Analytics</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', val: data.total_requests, icon: Droplets, color: 'text-brand-600' },
          { label: 'Success Rate', val: `${data.success_rate_percent}%`, icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Completed', val: data.completed_donations, icon: CheckCircle, color: 'text-sky-400' },
          { label: 'Avg Rating', val: `${data.avg_donor_rating}/5`, icon: Star, color: 'text-yellow-400' },
        ].map(k => (
          <div key={k.label} className="stat-card animate-fade-up">
            <k.icon size={20} className={k.color}/>
            <p className="text-3xl  font-bold text-ink-900 mt-2">{k.val}</p>
            <p className="text-xs text-ink-400">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly trend */}
        <div className="card p-5">
          <h3 className=" font-semibold text-ink-900 mb-4">Monthly Donations</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.monthly_donations || []}>
              <XAxis dataKey="month" stroke="#ffffff30" tick={{ fill:'#ffffff50', fontSize:11 }}/>
              <YAxis stroke="#ffffff30" tick={{ fill:'#ffffff50', fontSize:11 }}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Line type="monotone" dataKey="count" stroke="#7c3aff" strokeWidth={2.5}
                dot={{ fill:'#7c3aff', r:4 }} activeDot={{ r:6, fill:'#9772ff' }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* By blood group */}
        <div className="card p-5">
          <h3 className=" font-semibold text-ink-900 mb-4">Donations by Blood Group</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.by_blood_group || []}>
              <XAxis dataKey="blood_group" stroke="#ffffff30" tick={{ fill:'#ffffff50', fontSize:11 }}/>
              <YAxis stroke="#ffffff30" tick={{ fill:'#ffffff50', fontSize:11 }}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {(data.by_blood_group || []).map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By urgency */}
        <div className="card p-5">
          <h3 className=" font-semibold text-ink-900 mb-4">Requests by Urgency</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={data.by_urgency || []} dataKey="count" nameKey="urgency"
                     cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4}>
                  {(data.by_urgency || []).map((_, i) => <Cell key={i} fill={COLORS[i]}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {(data.by_urgency || []).map((u, i) => (
                <div key={u.urgency} className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }}/>
                  <span className="text-ink-600 capitalize">{u.urgency}</span>
                  <span className="text-ink-900 font-mono font-medium ml-auto">{u.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By status */}
        <div className="card p-5">
          <h3 className=" font-semibold text-ink-900 mb-4">Requests by Status</h3>
          <div className="space-y-3">
            {(data.by_status || []).map((s, i) => {
              const max = Math.max(...(data.by_status || []).map(x => x.count), 1)
              return (
                <div key={s.status}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-ink-600 capitalize">{s.status}</span>
                    <span className="text-sm font-mono text-ink-900">{s.count}</span>
                  </div>
                  <div className="h-2 bg-surface-50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{ width: `${(s.count / max) * 100}%`, background: COLORS[i] }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
