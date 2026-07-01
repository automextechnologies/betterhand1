import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'
import MobileNav from './MobileNav'
import { Toaster } from 'react-hot-toast'
import { useWsStore } from '../../store/wsStore'
import { useAuthStore } from '../../store/authStore'
import { useLocationUpdate } from '../../hooks/useLocationUpdate'
export const AUTO_REFRESH_EVENT = 'betterhand:autorefresh'

export default function Layout({ children }) {
  const { accessToken, user } = useAuthStore()
  const { connect } = useWsStore()
  useEffect(() => { if (accessToken) connect(accessToken) }, [accessToken])
  useEffect(() => {
    const id = setInterval(() => window.dispatchEvent(new CustomEvent(AUTO_REFRESH_EVENT)), 5000)
    return () => clearInterval(id)
  }, [])
  useLocationUpdate(user?.role==='donor'||user?.role==='hospital')

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-surface-50 font-body selection:bg-brand-200 selection:text-brand-900 relative">
      <div className="fixed inset-0 mesh-bg opacity-60 pointer-events-none z-0" />
      
      {/* Mobile Top Header */}
      <MobileHeader />

      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden lg:flex">
        <Sidebar/>
      </div>

      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative z-10 pb-24 lg:pb-0">
        <div className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      <Toaster position="top-center" toastOptions={{
        style:{background:'rgba(255, 255, 255, 0.9)',backdropFilter:'blur(12px)',border:'1px solid rgba(255, 255, 255, 0.5)',color:'#1f2937',fontSize:'14px',fontWeight:'600',borderRadius:'16px',boxShadow:'0 10px 30px rgba(0,0,0,0.08)'},
        success:{iconTheme:{primary:'#10b981',secondary:'#fff'}},
        error:{iconTheme:{primary:'#e11d48',secondary:'#fff'}},
        duration:3000
      }}/>
    </div>
  )
}
