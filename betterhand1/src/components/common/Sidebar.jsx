import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api'
import Logo from './Logo'
import ProfileEditModal from './ProfileEditModal'
import {
  LayoutDashboard, Droplets, Navigation, BarChart3,
  CalendarDays, UserCircle, LogOut, Bell, Shield,
  Heart, Pencil, Search
} from 'lucide-react'
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
  const nav = role === 'hospital' ? hospitalNav : role === 'donor' ? donorNav : wardNav
  const displayName = user?.profile?.name || user?.profile?.full_name || user?.profile?.member?.full_name || user?.email?.split('@')[0]
  const roleName = role === 'hospital' ? 'Hospital' : role === 'donor' ? 'Donor' : 'Ward Member'
  const roleColor = role === 'hospital' ? 'badge-blue' : role === 'donor' ? 'badge-red' : 'badge-green'

  const handleLogout = async () => {
    try { await authApi.logout({ refresh: refreshToken }) } catch {}
    logout(); navigate('/login'); toast.success('Logged out')
  }

  return (
    <>
      <aside className="w-60 min-h-screen flex flex-col bg-white border-r border-surface-200/60 shrink-0">
        <div className="p-5 border-b border-surface-100"><Logo/></div>
        <div className="px-5 pt-4 pb-2">
          <span className={`badge ${roleColor}`}>{roleName}</span>
        </div>
        <nav className="flex-1 px-3 py-1 space-y-0.5">
          {nav.map(({ to, icon:Icon, label }) => (
            <NavLink key={to} to={to}
              end={['/hospital','/donor','/ward'].includes(to)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 font-medium
                 ${isActive
                   ? 'bg-gradient-to-r from-brand-600 to-brand-400 text-white shadow-md'
                   : 'text-surface-500 hover:text-brand-600 hover:bg-brand-50'}`
              }>
              <Icon size={17} strokeWidth={1.8}/>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-surface-100 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 text-white flex items-center justify-center text-xs font-bold">
              {displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-surface-800 truncate">{displayName}</p>
              <p className="text-[10px] text-surface-400 truncate">{user?.email}</p>
            </div>
            {(role === 'hospital' || role === 'donor') && (
              <button onClick={() => setShowProfile(true)}
                className="p-1.5 rounded-lg hover:bg-brand-50 text-surface-400 hover:text-brand-600">
                <Pencil size={12}/>
              </button>
            )}
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs text-surface-400
                       hover:text-red-600 hover:bg-red-50 transition-colors font-medium">
            <LogOut size={14}/>Log out
          </button>
        </div>
      </aside>
      {showProfile && <ProfileEditModal onClose={() => setShowProfile(false)}/>}
    </>
  )
}
