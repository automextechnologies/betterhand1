import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { LogOut, Pencil } from 'lucide-react'
import ProfileEditModal from './ProfileEditModal'
import { authApi } from '../../api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'

export default function MobileHeader() {
  const { user, logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const role = user?.role
  
  const getBadgeColor = () => {
    if (role === 'hospital') return 'bg-brand-50 text-brand-600 border-brand-200'
    if (role === 'donor') return 'bg-accent-50 text-accent-600 border-accent-200'
    return 'bg-emerald-50 text-emerald-600 border-emerald-200'
  }

  const roleName = role==='hospital'?'Hospital':role==='donor'?'Donor':'Ward Member'

  const handleLogout = async () => {
    try { await authApi.logout({ refresh:refreshToken }) } catch {}
    logout()
    navigate('/login')
    toast.success('Logged out')
  }

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 glass border-b border-white/50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="scale-75 origin-left">
            <Logo />
          </div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getBadgeColor()} uppercase tracking-wider`}>
            {roleName}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {(role === 'hospital' || role === 'donor') && (
            <button onClick={() => setShowProfile(true)} className="p-2 rounded-xl bg-white/60 hover:bg-white text-ink-500 hover:text-brand-600 transition-all border border-ink-100 shadow-sm">
              <Pencil size={16} />
            </button>
          )}
          <button onClick={handleLogout} className="p-2 rounded-xl bg-white/60 hover:bg-rose-50 text-ink-500 hover:text-rose-600 transition-all border border-ink-100 shadow-sm">
            <LogOut size={16} />
          </button>
        </div>
      </header>
      
      {showProfile && <ProfileEditModal onClose={() => setShowProfile(false)} />}
    </>
  )
}
