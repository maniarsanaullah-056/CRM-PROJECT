import { cn, initials } from '../../utils/format'

const PALETTE = {
  purple: '#6D28D9',
  blue: '#2563EB',
  green: '#059669',
  orange: '#D97706',
  red: '#DC2626',
  teal: '#0D9488',
}

const SIZES = {
  xs: 'h-6 w-6 text-[8px]',
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
}

export default function Avatar({ name, color = 'purple', size = 'md', status, className = '' }) {
  const bg = PALETTE[color] || PALETTE.purple
  return (
    <div className={cn('relative inline-flex shrink-0 select-none', className)}>
      <div
        className={cn('flex items-center justify-center rounded-lg font-semibold text-white', SIZES[size])}
        style={{ backgroundColor: bg }}
        aria-label={name}
      >
        {initials(name)}
      </div>
      {status && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card',
            status === 'active' ? 'bg-green' : 'bg-faint',
          )}
        />
      )}
    </div>
  )
}
