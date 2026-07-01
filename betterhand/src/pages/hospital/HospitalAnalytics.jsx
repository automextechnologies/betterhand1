import { useState, useEffect } from 'react'
import { donationApi } from '../../api'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, Droplets, CheckCircle, Star, BarChart3, Activity } from 'lucide-react'
import Spinner from '../../components/common/Spinner'
import { motion } from 'framer-motion'

const COLORS = ['#e11d48', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 border border-ink-200 shadow-xl text-sm min-w-[120px]">
      <p className="text-ink-500 font-bold uppercase tracking-wider mb-2 text-[11px]">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4 mt-1">
          <span className="flex items-center gap-1.5 font-medium text-ink-700">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
            {p.name}
          </span>
          <span className="font-display font-black text-ink-900">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function HospitalAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    donationApi.analytics().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={40} className="text-brand-600"/></div>
  if (!data) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-ink-50 rounded-full flex items-center justify-center mb-4">
        <BarChart3 size={32} className="text-ink-300"/>
      </div>
      <p className="text-ink-500 font-medium">Insufficient data to generate analytics.</p>
    </div>
  )

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
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
          <Activity size={28} className="text-brand-600"/>
        </div>
        <div>
          <h1 className="text-3xl font-display font-black text-ink-900 tracking-tight">Performance Analytics</h1>
          <p className="text-ink-500 text-[15px] font-medium mt-1">Data-driven insights into your facility's blood operations</p>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Operations', val: data.total_requests, icon: Droplets, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Success Rate', val: `${data.success_rate_percent}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Units Secured', val: data.completed_donations, icon: CheckCircle, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Donor Rating', val: `${data.avg_donor_rating}/5`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((k, i) => (
          <motion.div variants={itemVariants} key={k.label} className="card p-6 flex items-center gap-5 relative overflow-hidden group border-ink-200">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/40 to-transparent rounded-full blur-2xl -z-10 group-hover:scale-110 transition-transform duration-500`} />
            <div className={`w-14 h-14 rounded-2xl ${k.bg} flex items-center justify-center shrink-0 shadow-inner border border-white/50`}>
              <k.icon size={24} className={k.color}/>
            </div>
            <div>
              <p className="text-3xl font-display font-black text-ink-900 leading-none">{k.val}</p>
              <p className="text-[13px] font-bold text-ink-500 uppercase tracking-wider mt-1.5">{k.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly trend */}
        <motion.div variants={itemVariants} className="card p-6 border-ink-200 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-display font-black text-ink-900">Monthly Fulfillment Volume</h3>
              <p className="text-[13px] text-ink-500 font-medium">Successful donations over the last 6 months</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-ink-50 flex items-center justify-center"><TrendingUp size={18} className="text-ink-400"/></div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthly_donations || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill:'#64748b', fontSize:12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill:'#64748b', fontSize:12, fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip/>}/>
                <Line type="monotone" dataKey="count" name="Donations" stroke="#e11d48" strokeWidth={3}
                  dot={{ fill:'#ffffff', stroke: '#e11d48', strokeWidth: 2, r:4 }} activeDot={{ r:6, fill:'#e11d48', stroke: '#ffffff', strokeWidth: 2 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* By blood group */}
        <motion.div variants={itemVariants} className="card p-6 border-ink-200 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-display font-black text-ink-900">Demand by Blood Group</h3>
              <p className="text-[13px] text-ink-500 font-medium">Distribution of blood types requested</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-ink-50 flex items-center justify-center"><Droplets size={18} className="text-ink-400"/></div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.by_blood_group || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="blood_group" axisLine={false} tickLine={false} tick={{ fill:'#64748b', fontSize:12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill:'#64748b', fontSize:12, fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="count" name="Requests" radius={[6,6,0,0]} barSize={40}>
                  {(data.by_blood_group || []).map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* By urgency */}
        <motion.div variants={itemVariants} className="card p-6 border-ink-200 bg-white">
          <h3 className="text-[16px] font-display font-black text-ink-900 mb-1">Operations by Priority</h3>
          <p className="text-[13px] text-ink-500 font-medium mb-6">Breakdown of requests by urgency level</p>
          
          <div className="flex flex-col sm:flex-row items-center gap-8 h-[200px]">
            <div className="flex-1 w-full h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.by_urgency || []} dataKey="count" nameKey="urgency"
                       cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
                    {(data.by_urgency || []).map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-display font-black text-ink-900 leading-none">{(data.by_urgency || []).reduce((a,b)=>a+b.count,0)}</span>
                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">Total</span>
              </div>
            </div>
            <div className="space-y-3 sm:w-48">
              {(data.by_urgency || []).map((u, i) => (
                <div key={u.urgency} className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50 transition-colors">
                  <div className="w-3 h-3 rounded-full shadow-inner" style={{ background: COLORS[i%COLORS.length] }}/>
                  <span className="text-[14px] font-bold text-ink-700 capitalize flex-1">{u.urgency}</span>
                  <span className="text-[15px] font-display font-black text-ink-900">{u.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* By status */}
        <motion.div variants={itemVariants} className="card p-6 border-ink-200 bg-white">
          <h3 className="text-[16px] font-display font-black text-ink-900 mb-1">Pipeline Conversion</h3>
          <p className="text-[13px] text-ink-500 font-medium mb-6">Status progression of all initiated requests</p>
          
          <div className="space-y-5 h-[200px] flex flex-col justify-center">
            {(data.by_status || []).map((s, i) => {
              const max = Math.max(...(data.by_status || []).map(x => x.count), 1)
              return (
                <div key={s.status} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[14px] font-bold text-ink-700 capitalize flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i%COLORS.length] }}></div>
                      {s.status}
                    </span>
                    <span className="text-[15px] font-display font-black text-ink-900">{s.count}</span>
                  </div>
                  <div className="h-3 bg-ink-50 rounded-full overflow-hidden border border-ink-100 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(s.count / max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full relative"
                      style={{ background: COLORS[i%COLORS.length] }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full"></div>
                    </motion.div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
