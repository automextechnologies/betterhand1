import { Droplet } from 'lucide-react'
export default function Logo({ size = 'md' }) {
  const s = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl'
  const box = size === 'lg' ? 'w-11 h-11' : size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  const ic = size === 'lg' ? 22 : size === 'sm' ? 14 : 18
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${box} rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 flex items-center justify-center shadow-glow`}>
        <Droplet size={ic} className="text-white fill-white"/>
      </div>
      <span className={`${s} font-display font-bold tracking-tight`}>
        <span className="text-ink-900">Better</span><span className="text-brand-600">Hand</span>
      </span>
    </div>
  )
}
