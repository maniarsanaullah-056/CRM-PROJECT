// ── Form primitives ─────────────────────────────────────────────────────────
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/format'

export function FormField({ label, required = false, error, hint, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="ml-1 text-red">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-[11px] font-medium text-red">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ icon: Icon, className = '', error = false, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />}
      <input
        {...props}
        className={cn(
          'input',
          Icon && 'pl-10',
          error && 'border-red/50 focus:border-red/60 focus:ring-red/15',
          className,
        )}
      />
    </div>
  )
}

export function Textarea({ className = '', rows = 3, ...props }) {
  return <textarea rows={rows} {...props} className={cn('input resize-none', className)} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <div className="relative">
      <select {...props} className={cn('input appearance-none pr-10', className)}>
        {children}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  )
}
