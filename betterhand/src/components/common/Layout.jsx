import { useEffect } from 'react'
import Sidebar from './Sidebar'
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
    <div className="flex min-h-screen">
      <Sidebar/>
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <div className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">{children}</div>
      </main>
      <Toaster position="top-right" toastOptions={{
        style:{background:'#fff',border:'1px solid #ddd9d5',color:'#332e2b',fontSize:'13px',fontFamily:'Plus Jakarta Sans',borderRadius:'12px',boxShadow:'0 4px 20px rgba(225,29,72,0.08)'},
        success:{iconTheme:{primary:'#10b981',secondary:'#fff'}},
        error:{iconTheme:{primary:'#e11d48',secondary:'#fff'}},
        duration:3000
      }}/>
    </div>
  )
}
