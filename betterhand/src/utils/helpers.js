import { formatDistanceToNow, format } from 'date-fns'

export const fmtDate  = d => d ? format(new Date(d), 'dd MMM yyyy') : '—'
export const fmtTime  = d => d ? format(new Date(d), 'hh:mm a') : '—'
export const fmtAgo   = d => d ? formatDistanceToNow(new Date(d), { addSuffix: true }) : '—'
export const fmtDateShort = d => d ? format(new Date(d), 'MMM d') : '—'

export const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

export const urgencyColor = u => ({
  normal:   'badge-gray',
  urgent:   'badge-yellow',
  critical: 'badge-red',
}[u] || 'badge-gray')

export const urgencyLabel = u => u?.charAt(0).toUpperCase() + u?.slice(1)

export const statusColor = s => ({
  pending:    'badge-yellow',
  active:     'badge-brand',
  confirmed:  'badge-brand',
  completed:  'badge-green',
  cancelled:  'badge-gray',
  expired:    'badge-gray',
  accepted:   'badge-brand',
  rejected:   'badge-red',
  missed:     'badge-gray',
  not_needed: 'badge-gray',
}[s] || 'badge-gray')

export const bloodGroupColors = {
  'A+':'#ef4444','A-':'#f97316','B+':'#8b5cf6','B-':'#6d28d9',
  'AB+':'#ec4899','AB-':'#be185d','O+':'#10b981','O-':'#059669'
}

export const whatsappLink = phone => {
  const digits = phone?.replace(/\D/g,'')
  return digits ? `https://wa.me/${digits}` : null
}
export const callLink = phone => phone ? `tel:${phone}` : null

export const getErrMsg = err =>
  err?.response?.data?.detail ||
  err?.response?.data?.error ||
  Object.values(err?.response?.data || {})?.[0]?.[0] ||
  err?.message ||
  'Something went wrong'

export const formatEta = m => {
  if (!m) return '—'
  if (m < 60) return `${m} min`
  return `${Math.floor(m/60)}h ${m%60}m`
}
