import { useEffect, useRef } from 'react'

// Leaflet map wrapper — renders donor(s) + hospital on map
export default function LiveMap({ hospital, donors = [], className = '' }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markersRef   = useRef({})

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    import('leaflet').then(L => {
      if (!containerRef.current || containerRef.current._leaflet_id) return
      const map = L.map(containerRef.current, {
        center: hospital
          ? [parseFloat(hospital.lat), parseFloat(hospital.lng)]
          : [10.0, 76.3],
        zoom: 13,
        zoomControl: false,
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

      // Hospital marker
      if (hospital?.lat) {
        const hospitalIcon = L.divIcon({
          html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#7c3aff,#4c10c0);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 20px rgba(124,58,255,0.6)"></div>`,
          iconSize: [36, 36], iconAnchor: [18, 36], className: ''
        })
        L.marker([parseFloat(hospital.lat), parseFloat(hospital.lng)], { icon: hospitalIcon })
          .addTo(map).bindPopup(`<b>${hospital.name || 'Hospital'}</b>`)
        markersRef.current['hospital'] = true
      }
      mapRef.current = map
    })
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then(L => {
      donors.forEach((d, i) => {
        if (!d.lat || !d.lng) return
        const colors = ['#10b981','#f59e0b','#60a5fa']
        const id = d.id || i
        const lat = parseFloat(d.lat)
        const lng = parseFloat(d.lng)
        const icon = L.divIcon({
          html: `<div style="width:28px;height:28px;background:${colors[i%3]};border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;box-shadow:0 2px 12px ${colors[i%3]}80">${i+1}</div>`,
          iconSize: [28, 28], iconAnchor: [14, 14], className: ''
        })
        if (markersRef.current[id]) {
          markersRef.current[id].setLatLng([lat, lng])
        } else {
          markersRef.current[id] = L.marker([lat, lng], { icon }).addTo(mapRef.current)
            .bindPopup(`<b>${d.name}</b><br/>ETA: ${d.eta || '—'} min`)
        }
      })
      // Fit bounds if we have positions
      const allPoints = []
      if (hospital?.lat) allPoints.push([parseFloat(hospital.lat), parseFloat(hospital.lng)])
      donors.forEach(d => { if (d.lat && d.lng) allPoints.push([parseFloat(d.lat), parseFloat(d.lng)]) })
      if (allPoints.length > 1) {
        mapRef.current.fitBounds(allPoints, { padding: [40, 40] })
      }
    })
  }, [donors, hospital])

  return <div ref={containerRef} className={`rounded-2xl overflow-hidden ${className}`}/>
}
