import { Zap } from 'lucide-react'
import { cn } from '../../utils/format'

export function LoadingSpinner({ size = 22, className = '' }) {
  return (
    <svg className={cn('spinner text-purple', className)} width={size} height={size} viewBox="0 0 24 24" fill="none" role="status" aria-label="Loading">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  )
}

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="gradient-brand flex h-14 w-14 items-center justify-center rounded-2xl">
        <Zap size={26} className="text-white" fill="white" />
      </div>
      <LoadingSpinner size={20} />
      <p className="text-xs font-medium uppercase tracking-widest text-faint">Loading workspace</p>
    </div>
  )
}
