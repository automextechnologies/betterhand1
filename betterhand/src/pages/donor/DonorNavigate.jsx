import { useState, useEffect, useRef, useCallback } from 'react'
import { donationApi } from '../../api'
import { useWsStore } from '../../store/wsStore'
import ChatWindow from '../../components/common/ChatWindow'
import { AUTO_REFRESH_EVENT } from '../../components/common/Layout'
import { Navigation, Clock, MapPin, Phone, MessageCircle } from 'lucide-react'
import { callLink, whatsappLink, formatEta } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner'
import { motion } from 'framer-motion'

export default function DonorNavigate() {
  const { on, off } = useWsStore()
  const [activeResponse, setActiveResponse] = useState(null)
  const [distance, setDistance] = useState(null)
  const [eta, setEta]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [mapReady, setMapReady] = useState(false)

  const mapDivRef      = useRef(null)
  const leafletMap     = useRef(null)
  const donorMarker    = useRef(null)
  const hospitalMarker = useRef(null)
  const routeLayer     = useRef(null)
  const intervalRef    = useRef(null)

  const loadResponse = useCallback(async () => {
    try {
      const r = await donationApi.donorResponses()
      const list = r.data?.results || r.data || []
      const confirmed = list.find(x => x.status === 'confirmed')
      if (confirmed) { setActiveResponse(confirmed); setEta(confirmed.eta_minutes) }
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadResponse() }, [loadResponse])

  useEffect(() => {
    const h = () => loadResponse()
    window.addEventListener(AUTO_REFRESH_EVENT, h)
    return () => window.removeEventListener(AUTO_REFRESH_EVENT, h)
  }, [loadResponse])

  useEffect(() => {
    const h = () => { toast.success('✅ Confirmed! Head to hospital now!'); loadResponse() }
    on('donation_confirmed', h)
    return () => off('donation_confirmed', h)
  }, [on, off, loadResponse])

  // Init map AFTER div is in DOM
  useEffect(() => {
    if (!mapDivRef.current || leafletMap.current) return
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      import('leaflet').then(({ default: L }) => {
        if (leafletMap.current) return
        const map = L.map(mapDivRef.current, {
          center: [11.2588, 75.7804],
          zoom:   12,
          zoomControl: true,
          scrollWheelZoom: true,
        })
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(map)
        leafletMap.current = map
        setMapReady(true)
      }).catch(err => console.error('Leaflet load failed:', err))
    }, 300)
    return () => clearTimeout(timer)
  }, [activeResponse]) // re-run when response loads

  // Draw hospital marker + route when map + response ready
  const drawRoute = useCallback((dLat, dLng) => {
    if (!leafletMap.current || !activeResponse) return
    import('leaflet').then(({ default: L }) => {
      const map  = leafletMap.current
      const hLat = parseFloat(activeResponse.hospital_latitude  || 11.2588)
      const hLng = parseFloat(activeResponse.hospital_longitude || 75.7804)

      // Hospital marker
      if (!hospitalMarker.current) {
        const icon = L.divIcon({
          html: `<div style="width:48px;height:48px;background:linear-gradient(135deg,#e11d48,#be123c);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:4px solid white;box-shadow:0 8px 24px rgba(225,29,72,0.6);display:flex;align-items:center;justify-content:center"><div style="transform:rotate(45deg);color:white;font-weight:bold;font-size:18px;">H</div></div>`,
          iconSize:[48,48], iconAnchor:[24,48], className:''
        })
        hospitalMarker.current = L.marker([hLat, hLng], { icon })
          .addTo(map)
          .bindPopup(`<b>🏥 ${activeResponse.hospital_name}</b>`, { maxWidth:200 })
      }

      // Donor marker
      const donorIcon = L.divIcon({
        html: `<div style="width:40px;height:40px;background:white;border-radius:50%;border:4px solid #10b981;box-shadow:0 4px 16px rgba(16,185,129,0.4);display:flex;align-items:center;justify-content:center;font-size:18px;">🩸</div>`,
        iconSize:[40,40], iconAnchor:[20,20], className:''
      })
      if (donorMarker.current) {
        donorMarker.current.setLatLng([dLat, dLng])
      } else {
        donorMarker.current = L.marker([dLat, dLng], { icon: donorIcon })
          .addTo(map)
          .bindPopup('<b>🩸 You are here</b>')
      }

      // Fetch OSRM route
      fetch(`https://router.project-osrm.org/route/v1/driving/${dLng},${dLat};${hLng},${hLat}?overview=full&geometries=geojson`)
        .then(r => r.json())
        .then(data => {
          if (data.code === 'Ok' && data.routes?.[0]) {
            const route = data.routes[0]
            setDistance((route.distance / 1000).toFixed(1))
            setEta(Math.ceil(route.duration / 60))
            if (routeLayer.current) map.removeLayer(routeLayer.current)
            routeLayer.current = L.geoJSON(route.geometry, {
              style: { color:'#e11d48', weight:6, opacity:0.8, lineCap:'round', lineJoin:'round' }
            }).addTo(map)
            map.fitBounds(L.geoJSON(route.geometry).getBounds(), { padding:[50,50] })
          }
        })
        .catch(() => {
          // Fallback straight line
          if (routeLayer.current) map.removeLayer(routeLayer.current)
          routeLayer.current = L.polyline([[dLat,dLng],[hLat,hLng]], {
            color:'#e11d48', weight:4, dashArray:'12,8'
          }).addTo(map)
          map.fitBounds([[dLat,dLng],[hLat,hLng]], { padding:[50,50] })
        })
    })
  }, [activeResponse])

  // GPS tracking every 10s
  const trackPosition = useCallback(() => {
    if (!activeResponse) return
    navigator.geolocation?.getCurrentPosition(
      async pos => {
        const { latitude: dLat, longitude: dLng } = pos.coords
        drawRoute(dLat, dLng)
        try {
          const res = await donationApi.updateLocation(activeResponse.id, { latitude: dLat, longitude: dLng })
          if (res.data.distance_remaining_km != null)
            setDistance(parseFloat(res.data.distance_remaining_km).toFixed(1))
        } catch {}
      },
      () => toast.error('Could not get your location'),
      { timeout:8000, maximumAge:0, enableHighAccuracy:true }
    )
  }, [activeResponse, drawRoute])

  useEffect(() => {
    if (!activeResponse || !mapReady) return
    trackPosition()
    intervalRef.current = setInterval(trackPosition, 10000)
    return () => clearInterval(intervalRef.current)
  }, [activeResponse, mapReady, trackPosition])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={40} className="text-brand-600"/></div>

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  if (!activeResponse) return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="card p-16 text-center max-w-2xl mx-auto mt-12 flex flex-col items-center justify-center">
      <div className="w-24 h-24 bg-ink-50 rounded-full flex items-center justify-center mb-6">
        <Navigation size={40} className="text-ink-300"/>
      </div>
      <h2 className="text-2xl font-display font-black text-ink-900 mb-3">No Active Navigation</h2>
      <p className="text-ink-500 text-[15px] leading-relaxed max-w-sm">Accept a blood request first. Once the hospital confirms, your live route and instructions will appear here.</p>
    </motion.div>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-12">
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-ink-900 flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 rounded-2xl">
              <Navigation size={24} className="text-brand-600"/>
            </div>
            Navigate to Hospital
          </h1>
          <p className="text-ink-500 text-[15px] font-medium mt-2 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
            </span>
            Live location shared • Route updates automatically
          </p>
        </div>
      </motion.div>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon:Clock, label:'Estimated Arrival', val:eta ? formatEta(eta) : '—', color:'text-amber-500', bg:'bg-amber-50' },
          { icon:MapPin, label:'Distance Remaining', val:distance ? `${distance} km` : '—', color:'text-brand-600', bg:'bg-brand-50' },
          { icon:Navigation, label:'Mission Status', val:'En Route', color:'text-emerald-600', bg:'bg-emerald-50' },
        ].map(s => (
          <motion.div variants={itemVariants} key={s.label} className="card p-6 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center shrink-0 shadow-inner`}>
              <s.icon size={24} className={s.color}/>
            </div>
            <div>
              <p className="text-3xl font-display font-black text-ink-900 leading-none">{s.val}</p>
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wider mt-1.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Map & Hospital Info */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Hospital + Patient info card */}
          <motion.div variants={itemVariants} className="card p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-display font-black text-ink-900">{activeResponse.hospital_name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-lg text-[13px] font-bold">
                      {activeResponse.blood_group}
                    </span>
                    <span className="bg-ink-100 text-ink-700 px-3 py-1 rounded-lg text-[13px] font-bold">
                      {activeResponse.units_needed} unit(s)
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[13px] font-bold
                      ${activeResponse.urgency === 'Critical' ? 'bg-brand-100 text-brand-700' : 
                        activeResponse.urgency === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                      {activeResponse.urgency}
                    </span>
                  </div>
                </div>
                
                {(activeResponse.patient_name || activeResponse.patient_condition) && (
                  <div className="bg-ink-50 p-4 rounded-xl border border-ink-100">
                    {activeResponse.patient_name && (
                      <p className="text-[15px] font-bold text-ink-900 mb-1">Patient: {activeResponse.patient_name}</p>
                    )}
                    {activeResponse.patient_condition && (
                      <p className="text-sm text-ink-600">{activeResponse.patient_condition}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Contact buttons */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                {activeResponse.hospital_phone && (
                  <a href={callLink(activeResponse.hospital_phone)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-ink-50 text-ink-900 hover:bg-ink-100 transition-colors text-[14px] font-bold border border-ink-200">
                    <Phone size={16} className="text-sky-600"/> Call Hospital
                  </a>
                )}
                {activeResponse.hospital_whatsapp && (
                  <a href={whatsappLink(activeResponse.hospital_whatsapp)} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-[14px] font-bold border border-emerald-200">
                    <MessageCircle size={16}/> WhatsApp Hospital
                  </a>
                )}
                {activeResponse.ward_contact_phone && (
                  <a href={callLink(activeResponse.ward_contact_phone)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-[14px] font-bold border border-purple-200">
                    <Phone size={16}/> Ward Contact
                  </a>
                )}
                {activeResponse.hospital_phone && (
                  <a href={`https://maps.google.com/?q=${activeResponse.hospital_latitude},${activeResponse.hospital_longitude}`}
                     target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors text-[14px] font-bold border border-brand-200">
                    <MapPin size={16}/> Open in G-Maps
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div variants={itemVariants} className="card p-4 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-display font-bold text-ink-900 text-lg flex items-center gap-2">
                <MapPin size={18} className="text-brand-600"/> Live Route Tracking
              </h3>
            </div>
            
            <div
              ref={mapDivRef}
              className="w-full rounded-[20px] overflow-hidden border border-ink-200 relative z-0"
              style={{ height: '420px', background: '#f8f9fa' }}
            >
              {!mapReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-400 bg-ink-50/50 backdrop-blur-sm gap-3 z-10">
                  <Spinner size={32} className="text-brand-600"/>
                  <p className="text-sm font-bold text-ink-600">Initializing Navigation Module…</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm font-bold text-ink-600 pt-2 pb-1">
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-600 shadow-sm"/>Destination</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"/>Your Location</span>
            </div>
          </motion.div>
        </div>
        
        {/* Chat */}
        <motion.div variants={itemVariants} className="xl:col-span-1 h-full">
          <div className="card h-full overflow-hidden flex flex-col min-h-[600px] shadow-sm border border-ink-200">
            <div className="p-5 border-b border-ink-100 bg-ink-50/50">
              <h3 className="font-display font-bold text-ink-900 flex items-center gap-2">
                <MessageCircle size={18} className="text-brand-600"/> Live Chat
              </h3>
              <p className="text-xs text-ink-500 mt-1">Communicate directly with {activeResponse.hospital_name}</p>
            </div>
            <ChatWindow
              responseId={activeResponse.id}
              otherName={activeResponse.hospital_name}
              otherPhone={activeResponse.hospital_phone}
              otherWhatsapp={activeResponse.hospital_whatsapp}
              className="flex-1 border-0 rounded-none shadow-none"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
