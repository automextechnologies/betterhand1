import { useEffect, useRef } from 'react'

export default function useAutoRefresh(callback, intervalMs = 5000, enabled = true) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    if (!enabled) return
    cbRef.current()
    const timer = setInterval(() => cbRef.current(), intervalMs)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') cbRef.current()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [intervalMs, enabled])
}
