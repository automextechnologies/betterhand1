import { useEffect, useRef } from 'react'
import { authApi } from '../api'
import toast from 'react-hot-toast'

// Auto-updates GPS location every 1 hour
// Also updates immediately on mount
export function useLocationUpdate(enabled = true) {
  const timerRef   = useRef(null)
  const hasRunRef  = useRef(false)

  const updateLocation = (silent = true) => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          await authApi.updateLocation({
            latitude:  pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
          // Update localStorage too
          const raw = sessionStorage.getItem('bh-auth')
          if (raw) {
            try {
              const parsed = JSON.parse(raw)
              const s = parsed?.state || parsed
              if (s?.user?.profile) {
                s.user.profile.latitude  = pos.coords.latitude
                s.user.profile.longitude = pos.coords.longitude
                sessionStorage.setItem('bh-auth', JSON.stringify(parsed))
              }
            } catch {}
          }
          if (!silent) {
            toast.success(`📍 Location updated: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
          }
        } catch {}
      },
      () => {
        if (!silent) toast.error('Could not get location')
      },
      { timeout: 10000, maximumAge: 300000 }
    )
  }

  useEffect(() => {
    if (!enabled) return
    // Run once immediately (silent)
    if (!hasRunRef.current) {
      hasRunRef.current = true
      updateLocation(true)
    }
    // Then every 1 hour
    timerRef.current = setInterval(() => updateLocation(true), 60 * 60 * 1000)
    return () => clearInterval(timerRef.current)
  }, [enabled])

  return { updateLocation }
}
