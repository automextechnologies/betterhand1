import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api'
import Logo from './Logo'
import ProfileEditModal from './ProfileEditModal'
import { LayoutDashboard, Droplets, Navigation, BarChart3, CalendarDays, UserCircle, LogOut, Bell, Shield, Heart, Pencil, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const hospitalNav = [
  { to:'/hospital',          icon:LayoutDashboard, label:'Dashboard' },
  { to:'/hospital/requests', icon:Droplets,        label:'Blood Requests' },
  { to:'/hospital/tracking', icon:Navigation,      label:'Live Tracking' },
  { to:'/hospital/analytics',icon:BarChart3,       label:'Analytics' },
  { to:'/hospital/donors',   icon:Search,          label:'Find Donors' },
  { to:'/hospital/camps',    icon:CalendarDays,    label:'Blood Camps' },
  { to:'/hospital/profile',  icon:UserCircle,      label:'Profile' },
]
const donorNav = [
  { to:'/donor',          icon:LayoutDashboard, label:'Dashboard' },
  { to:'/donor/requests', icon:Bell,            label:'Blood Requests' },
  { to:'/donor/navigate', icon:Navigation,      label:'Navigate' },
  { to:'/donor/history',  icon:Heart,           label:'My Donations' },
  { to:'/donor/camps',    icon:CalendarDays,    label:'Blood Camps' },
  { to:'/donor/profile',  icon:UserCircle,      label:'Profile' },
]
const wardNav = [
  { to:'/ward',         icon:LayoutDashboard, label:'Dashboard' },
  { to:'/ward/alerts',  icon:Bell,            label:'Blood Alerts' },
  { to:'/ward/donors',  icon:Search,          label:'Ward Donors' },
  { to:'/ward/profile', icon:Shield,          label:'Profile' },
]

export default function Sidebar() {
  const { user, logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const role = user?.role
  const nav = role==='hospital'?hospitalNav:role==='donor'?donorNav:wardNav
  const displayName = user?.profile?.name||user?.profile?.full_name||user?.profile?.member?.full_name||user?.email?.split('@')[0]
  const roleName = role==='hospital'?'Hospital':role==='donor'?'Donor':'Ward Member'
  
  const getBadgeColor = () => {
    if (role === 'hospital') return 'bg-brand-50 text-brand-600 border-brand-200'
    if (role === 'donor') return 'bg-accent-50 text-accent-600 border-accent-200'
    return 'bg-emerald-50 text-emerald-600 border-emerald-200'
  }

  const getGradient = () => {
    if (role === 'hospital') return 'from-brand-500 to-brand-600 shadow-brand-500/30'
    if (role === 'donor') return 'from-accent-500 to-accent-600 shadow-accent-500/30'
    return 'from-emerald-500 to-emerald-600 shadow-emerald-500/30'
  }

  const handleLogout = async () => {
    try { await authApi.logout({ refresh:refreshToken }) } catch {}
    logout(); navigate('/login'); toast.success('Logged out')
  }

  return (
    <>
      <aside className="w-[17rem] min-h-screen flex flex-col glass border-r border-white/50 shrink-0 z-40">
        <div className="p-6 border-b border-ink-100/50">
          <Logo/>
        </div>
        
        <div className="px-6 pt-5 pb-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getBadgeColor()}`}>
            {roleName}
          </span>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1.5 relative overflow-y-auto overflow-x-hidden">
          {nav.map(({to,icon:Icon,label}) => (
            <NavLink key={to} to={to} end={['/hospital','/donor','/ward'].includes(to)}
              className={({isActive}) =>
                `relative group flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[14.5px] font-medium transition-all z-10
                 ${isActive
                   ? 'text-white shadow-md'
                   : 'text-ink-500 hover:text-ink-900 hover:bg-white/50'}`
              }>
              {({isActive}) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r ${getGradient()} -z-10`}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.8} className={isActive ? 'text-white' : 'text-ink-400 group-hover:text-ink-600 transition-colors'}/>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-ink-100/50 bg-white/40">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient()} text-white flex items-center justify-center text-sm font-bold shadow-md`}>
              {displayName?.[0]?.toUpperCase()||'?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink-900 truncate">{displayName}</p>
              <p className="text-xs text-ink-500 truncate font-medium">{user?.email}</p>
            </div>
            {(role==='hospital'||role==='donor') && (
              <button onClick={()=>setShowProfile(true)} className="p-2 rounded-lg bg-white/60 hover:bg-white text-ink-400 hover:text-brand-600 transition-all shadow-sm border border-ink-100">
                <Pencil size={14}/>
              </button>
            )}
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-ink-500 hover:text-rose-600 hover:bg-rose-50 transition-all group">
            <LogOut size={18} className="text-ink-400 group-hover:text-rose-500 transition-colors"/>Log out
          </button>
        </div>
      </aside>
      {showProfile && <ProfileEditModal onClose={()=>setShowProfile(false)}/>}
    </>
  )
}
