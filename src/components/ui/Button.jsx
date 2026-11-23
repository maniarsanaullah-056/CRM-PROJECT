import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/format'

const VARIANTS = {
  primary: 'gradient-brand text-white hover:brightness-[0.93] active:brightness-[0.88]',
  secondary: 'bg-secondary text-ink border border-line hover:bg-secondary/80 hover:text-ink hover:border-line',
  ghost: 'text-muted hover:text-ink hover:bg-tint',
  danger: 'bg-red/10 text-red border border-red/30 hover:bg-red/20 hover:border-red/40',
  outline: 'border border-purple/40 text-purple hover:bg-purple/10 hover:border-purple/60',
  success: 'bg-green/10 text-green border border-green/30 hover:bg-green/20',
}

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-[13px] gap-2 rounded-xl',
  lg: 'h-12 px-6 text-sm gap-2 rounded-xl',
  icon: 'h-9 w-9 justify-center rounded-xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
}) {
  const isDisabled = disabled || loading
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'inline-flex select-none items-center justify-center font-semibold transition-all duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-solid)]/50',
        VARIANTS[variant],
        SIZES[size],
        isDisabled && 'cursor-not-allowed opacity-50 saturate-50',
        className,
      )}
    >
      {loading ? <Loader2 size={16} className="spinner" /> : Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2.2} />}
      {children}
      {!loading && IconRight && <IconRight size={size === 'sm' ? 14 : 16} strokeWidth={2.2} />}
    </button>
  )
}
