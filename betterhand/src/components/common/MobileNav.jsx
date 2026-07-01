import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LayoutDashboard, Droplets, Navigation, BarChart3, CalendarDays, UserCircle, Bell, Shield, Heart, Search } from 'lucide-react'

const hospitalNav = [
  { to:'/hospital',          icon:LayoutDashboard, label:'Home' },
  { to:'/hospital/requests', icon:Droplets,        label:'Requests' },
  { to:'/hospital/tracking', icon:Navigation,      label:'Tracking' },
  { to:'/hospital/profile',  icon:UserCircle,      label:'Profile' },
]
const donorNav = [
  { to:'/donor',          icon:LayoutDashboard, label:'Home' },
  { to:'/donor/requests', icon:Bell,            label:'Alerts' },
  { to:'/donor/navigate', icon:Navigation,      label:'Map' },
  { to:'/donor/profile',  icon:UserCircle,      label:'Profile' },
]
const wardNav = [
  { to:'/ward',         icon:LayoutDashboard, label:'Home' },
  { to:'/ward/alerts',  icon:Bell,            label:'Alerts' },
  { to:'/ward/donors',  icon:Search,          label:'Donors' },
  { to:'/ward/profile', icon:Shield,          label:'Profile' },
]

export default function MobileNav() {
  const { user } = useAuthStore()
  const role = user?.role
  const nav = role === 'hospital' ? hospitalNav : role === 'donor' ? donorNav : wardNav

  const getGradient = () => {
    if (role === 'hospital') return 'from-brand-500 to-brand-600'
    if (role === 'donor') return 'from-accent-500 to-accent-600'
    return 'from-emerald-500 to-emerald-600'
  }

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 glass-dark border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={['/hospital', '/donor', '/ward'].includes(to)}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
                isActive ? 'text-white' : 'text-ink-400 hover:text-ink-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? `bg-gradient-to-tr ${getGradient()} shadow-lg` : 'bg-transparent'}`}>
                  <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2 : 1.8} />
                </div>
                <span className={`text-[10px] font-semibold transition-all ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
