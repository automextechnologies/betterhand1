import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  timeout: 15000,
})

function getTokens() {
  try {
    const raw = sessionStorage.getItem('bh-auth')
    if (!raw) return {}
    const s = JSON.parse(raw)?.state || JSON.parse(raw)
    return { access: s?.accessToken, refresh: s?.refreshToken }
  } catch { return {} }
}

function saveAccessToken(token) {
  try {
    const raw = sessionStorage.getItem('bh-auth')
    if (!raw) return
    const parsed = JSON.parse(raw)
    const target = parsed?.state || parsed
    target.accessToken = token
    sessionStorage.setItem('bh-auth', JSON.stringify(parsed))
  } catch {}
}

api.interceptors.request.use(cfg => {
  const { access } = getTokens()
  if (access) cfg.headers.Authorization = `Bearer ${access}`
  return cfg
})

let refreshing = false
let queue = []

api.interceptors.response.use(
  r => r,
  async err => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      if (refreshing) {
        return new Promise((res, rej) => queue.push({ res, rej }))
          .then(t => { orig.headers.Authorization = `Bearer ${t}`; return api(orig) })
      }
      refreshing = true
      const { refresh } = getTokens()
      if (!refresh) {
        refreshing = false
        sessionStorage.removeItem('bh-auth')
        window.location.href = '/login'
        return Promise.reject(err)
      }
      try {
        const { data } = await axios.post(`${BASE}/accounts/token/refresh/`, { refresh })
        saveAccessToken(data.access)
        queue.forEach(q => q.res(data.access))
        queue = []
        orig.headers.Authorization = `Bearer ${data.access}`
        return api(orig)
      } catch (e) {
        queue.forEach(q => q.rej(e))
        queue = []
        sessionStorage.removeItem('bh-auth')
        window.location.href = '/login'
        return Promise.reject(e)
      } finally { refreshing = false }
    }
    return Promise.reject(err)
  }
)

export default api
