import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/common/Layout'
import { Toaster } from 'react-hot-toast'
import Landing           from './pages/Landing'
import Login             from './pages/Login'
import Register          from './pages/Register'
import HospitalDashboard from './pages/hospital/HospitalDashboard'
import HospitalAnalytics from './pages/hospital/HospitalAnalytics'
import HospitalProfile   from './pages/hospital/HospitalProfile'
import DonorDashboard    from './pages/donor/DonorDashboard'
import DonorNavigate     from './pages/donor/DonorNavigate'
import DonorProfile      from './pages/donor/DonorProfile'
import WardDashboard     from './pages/ward/WardDashboard'
import BloodCamps        from './pages/shared/BloodCamps'

function getAuth() {
  try {
    const raw = sessionStorage.getItem('bh-auth')
    if (!raw) return { ok:false, role:null }
    const s = JSON.parse(raw)?.state || JSON.parse(raw)
    return { ok:!!s?.accessToken && !!s?.isAuthenticated, role:s?.user?.role || null }
  } catch { return { ok:false, role:null } }
}

function ProtectedRoute({ children, role }) {
  const { ok, role:userRole } = getAuth()
  if (!ok) return <Navigate to="/login" replace/>
  if (role && userRole && userRole !== role) {
    if (userRole === 'hospital')    return <Navigate to="/hospital" replace/>
    if (userRole === 'donor')       return <Navigate to="/donor"    replace/>
    if (userRole === 'ward_member') return <Navigate to="/ward"     replace/>
    return <Navigate to="/login" replace/>
  }
  return <Layout>{children}</Layout>
}

const H = (r, el) => <ProtectedRoute role={r}>{el}</ProtectedRoute>

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style:{ background:'#fff', border:'1px solid #e5e7eb', color:'#1f2937', fontSize:'13px' },
      }}/>
      <Routes>
        <Route path="/"         element={<Landing/>}/>
        <Route path="/login"    element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>

        {/* Hospital — all sidebar pages */}
        <Route path="/hospital"            element={H('hospital', <HospitalDashboard/>)}/>
        <Route path="/hospital/requests"   element={H('hospital', <HospitalDashboard/>)}/>
        <Route path="/hospital/tracking"   element={H('hospital', <HospitalDashboard/>)}/>
        <Route path="/hospital/donors"     element={H('hospital', <HospitalDashboard/>)}/>
        <Route path="/hospital/analytics"  element={H('hospital', <HospitalAnalytics/>)}/>
        <Route path="/hospital/camps"      element={H('hospital', <BloodCamps/>)}/>
        <Route path="/hospital/profile"    element={H('hospital', <HospitalProfile/>)}/>

        {/* Donor — all sidebar pages */}
        <Route path="/donor"           element={H('donor', <DonorDashboard/>)}/>
        <Route path="/donor/requests"  element={H('donor', <DonorDashboard/>)}/>
        <Route path="/donor/navigate"  element={H('donor', <DonorNavigate/>)}/>
        <Route path="/donor/history"   element={H('donor', <DonorDashboard/>)}/>
        <Route path="/donor/camps"     element={H('donor', <BloodCamps/>)}/>
        <Route path="/donor/profile"   element={H('donor', <DonorProfile/>)}/>

        {/* Ward — all sidebar pages */}
        <Route path="/ward"          element={H('ward_member', <WardDashboard/>)}/>
        <Route path="/ward/alerts"   element={H('ward_member', <WardDashboard/>)}/>
        <Route path="/ward/donors"   element={H('ward_member', <WardDashboard/>)}/>
        <Route path="/ward/profile"  element={H('ward_member', <WardDashboard/>)}/>

        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </BrowserRouter>
  )
}
