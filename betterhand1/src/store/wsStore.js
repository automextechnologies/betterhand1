import { create } from 'zustand'

let socket = null
let reconnectTimer = null

export const useWsStore = create((set, get) => ({
  connected: false,
  events: [],
  _handlers: {},

  connect: (token) => {
    if (socket && socket.readyState === WebSocket.OPEN) return
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }

    const base = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/donation/'
    const url = `${base}?token=${encodeURIComponent(token)}`

    try { socket = new WebSocket(url) } catch { return }

    socket.onopen = () => { set({ connected: true }) }

    socket.onclose = (e) => {
      set({ connected: false })
      socket = null
      if (e.code !== 4001 && e.code !== 1000) {
        reconnectTimer = setTimeout(() => {
          const stored = sessionStorage.getItem('bh-auth')
          if (stored) {
            try {
              const { state } = JSON.parse(stored)
              if (state?.accessToken) get().connect(state.accessToken)
            } catch {}
          }
        }, 5000)
      }
    }

    socket.onerror = () => { set({ connected: false }) }

    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        const handlers = get()._handlers[data.type] || []
        handlers.forEach(fn => { try { fn(data.payload || data) } catch {} })
        set(s => ({ events: [data, ...s.events.slice(0, 49)] }))
      } catch {}
    }
  },

  disconnect: () => {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
    if (socket) { socket.close(1000); socket = null }
    set({ connected: false })
  },

  send: (msg) => {
    if (socket && socket.readyState === WebSocket.OPEN)
      socket.send(JSON.stringify(msg))
  },

  on: (event, fn) => set(s => ({
    _handlers: { ...s._handlers, [event]: [...(s._handlers[event] || []), fn] }
  })),

  off: (event, fn) => set(s => ({
    _handlers: { ...s._handlers, [event]: (s._handlers[event] || []).filter(f => f !== fn) }
  })),
}))
