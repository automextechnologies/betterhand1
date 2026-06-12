import { useState, useEffect, useRef, useCallback } from 'react'
import { donationApi } from '../../api'
import { useWsStore } from '../../store/wsStore'
import ChatWindow from '../../components/common/ChatWindow'
import { AUTO_REFRESH_EVENT } from '../../components/common/Layout'
import { Navigation, Clock, MapPin, Phone, MessageCircle } from 'lucide-react'
import { callLink, whatsappLink, formatEta } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner'

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
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
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
          html: `<div style="width:44px;height:44px;background:linear-gradient(135deg,#7c3aff,#4c10c0);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 20px rgba(124,58,255,0.7)"></div>`,
          iconSize:[44,44], iconAnchor:[22,44], className:''
        })
        hospitalMarker.current = L.marker([hLat, hLng], { icon })
          .addTo(map)
          .bindPopup(`<b>🏥 ${activeResponse.hospital_name}</b>`, { maxWidth:200 })
      }

      // Donor marker
      const donorIcon = L.divIcon({
        html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#10b981,#059669);border-radius:50%;border:3px solid white;box-shadow:0 4px 16px rgba(16,185,129,0.7);display:flex;align-items:center;justify-content:center;font-size:16px;">🩸</div>`,
        iconSize:[36,36], iconAnchor:[18,18], className:''
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
              style: { color:'#7c3aff', weight:6, opacity:0.85 }
            }).addTo(map)
            map.fitBounds(L.geoJSON(route.geometry).getBounds(), { padding:[50,50] })
          }
        })
        .catch(() => {
          // Fallback straight line
          if (routeLayer.current) map.removeLayer(routeLayer.current)
          routeLayer.current = L.polyline([[dLat,dLng],[hLat,hLng]], {
            color:'#7c3aff', weight:4, dashArray:'12,8'
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

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} className="text-brand-400"/></div>

  if (!activeResponse) return (
    <div className="card p-12 text-center">
      <Navigation size={36} className="text-surface-300 mx-auto mb-4"/>
      <h2 className=" text-xl font-semibold text-surface-900 mb-2">No Active Navigation</h2>
      <p className="text-surface-400 text-sm">Accept a blood request first. Your route to hospital will appear here.</p>
    </div>
  )

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Navigation size={20} className="text-brand-400"/>Navigate to Hospital
          </h1>
          <p className="text-surface-400 text-sm mt-0.5">Live location shared every 10s · Route auto-updates</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon:Clock, label:'ETA', val:eta ? formatEta(eta) : '—', color:'text-amber-400' },
          { icon:MapPin, label:'Distance', val:distance ? `${distance} km` : '—', color:'text-brand-400' },
          { icon:Navigation, label:'Status', val:'En Route', color:'text-accent-600' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-3 text-center border border-surface-200">
            <s.icon size={16} className={`${s.color} mx-auto mb-1`}/>
            <p className="text-lg  font-bold text-surface-900">{s.val}</p>
            <p className="text-xs text-surface-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Hospital + Patient info card */}
      <div className="card p-4 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className=" font-semibold text-surface-900">{activeResponse.hospital_name}</h3>
            <p className="text-sm text-surface-500 mt-0.5">
              {activeResponse.blood_group} · {activeResponse.units_needed} unit(s) · {activeResponse.urgency}
            </p>
            {activeResponse.patient_name && (
              <p className="text-xs text-brand-600/80 mt-1">👤 Patient: {activeResponse.patient_name}</p>
            )}
            {activeResponse.patient_condition && (
              <p className="text-xs text-surface-400 mt-0.5">{activeResponse.patient_condition}</p>
            )}
          </div>
        </div>

        {/* Contact buttons — Hospital + Patient ward */}
        <div className="grid grid-cols-2 gap-2">
          {activeResponse.hospital_phone && (
            <a href={callLink(activeResponse.hospital_phone)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-600/30 hover:bg-sky-600/30 transition-colors text-sm  font-semibold">
              <Phone size={14}/> Call Hospital
            </a>
          )}
          {activeResponse.hospital_whatsapp && (
            <a href={whatsappLink(activeResponse.hospital_whatsapp)} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-50 text-accent-600 border border-accent-600/30 hover:bg-accent-50 transition-colors text-sm  font-semibold">
              <MessageCircle size={14}/> WhatsApp Hospital
            </a>
          )}
          {/* Patient ward contact */}
          {activeResponse.ward_contact_phone && (
            <a href={callLink(activeResponse.ward_contact_phone)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-600/30 hover:bg-purple-600/30 transition-colors text-sm  font-semibold">
              <Phone size={14}/> Ward Contact
            </a>
          )}
          {activeResponse.hospital_phone && (
            <a href={`https://maps.google.com/?q=${activeResponse.hospital_latitude},${activeResponse.hospital_longitude}`}
               target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-600/30 hover:bg-amber-600/30 transition-colors text-sm  font-semibold">
              <MapPin size={14}/> Open in Maps
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Map */}
        <div className="xl:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className=" font-semibold text-surface-600 text-sm flex items-center gap-1.5">
              <MapPin size={13} className="text-brand-400"/> Live Route Map
            </h3>
            <span className="badge badge-green text-xs">● Updating every 10s</span>
          </div>
          {/* Map container — fixed height, visible background */}
          <div
            ref={mapDivRef}
            style={{
              height: '380px',
              width: '100%',
              borderRadius: '1rem',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.07)',
              background: '#1a1830',
              position: 'relative',
            }}
          >
            {!mapReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-surface-400 gap-2">
                <Spinner size={24} className="text-brand-400"/>
                <p className="text-xs">Loading map…</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-surface-400">
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-brand-500"/>Hospital</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-accent-500"/>You</span>
            <span className="flex items-center gap-1.5"><div className="w-8 h-0.5 bg-brand-500"/>Road Route</span>
          </div>
        </div>
        {/* Chat */}
        <div className="xl:col-span-1">
          <ChatWindow
            responseId={activeResponse.id}
            otherName={activeResponse.hospital_name}
            otherPhone={activeResponse.hospital_phone}
            otherWhatsapp={activeResponse.hospital_whatsapp}
            className="h-full min-h-96"
          />
        </div>
      </div>
    </div>
  )
}
