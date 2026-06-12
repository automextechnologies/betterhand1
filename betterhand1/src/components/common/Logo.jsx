export default function Logo({ size = 'md' }) {
  const s = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl'
  const icon = size === 'lg' ? 'w-11 h-11 text-base' : size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs'
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${icon} rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center shadow-glow`}>
        <span className="font-black text-white italic tracking-tighter" style={{fontFamily:'Georgia,serif'}}>BH</span>
      </div>
      <span className={`${s} font-bold tracking-tight`}>
        <span className="text-surface-900">Better</span>
        <span className="text-brand-600">Hand</span>
      </span>
    </div>
  )
}
