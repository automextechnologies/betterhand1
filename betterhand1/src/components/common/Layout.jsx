import { useEffect } from 'react'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'
import { useWsStore } from '../../store/wsStore'
import { useAuthStore } from '../../store/authStore'
import { useLocationUpdate } from '../../hooks/useLocationUpdate'

export const AUTO_REFRESH_EVENT = 'betterhand:autorefresh'

export default function Layout({ children }) {
  const { accessToken, user } = useAuthStore()
  const { connect, connected } = useWsStore()

  useEffect(() => { if (accessToken) connect(accessToken) }, [accessToken])
  useEffect(() => {
    const id = setInterval(() => window.dispatchEvent(new CustomEvent(AUTO_REFRESH_EVENT)), 5000)
    return () => clearInterval(id)
  }, [])

  const isLocRole = user?.role === 'donor' || user?.role === 'hospital'
  useLocationUpdate(isLocRole)

  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar/>
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <div className="flex-1 p-6 max-w-6xl w-full mx-auto">{children}</div>
      </main>
      <Toaster position="top-right" toastOptions={{
        style:{ background:'#fff', border:'1px solid #e5e7eb', color:'#1f2937', fontSize:'13px', fontFamily:'Inter' },
        success:{ iconTheme:{ primary:'#10b981', secondary:'#fff' } },
        error:  { iconTheme:{ primary:'#ef4444', secondary:'#fff' } },
        duration:3000,
      }}/>
    </div>
  )
}
