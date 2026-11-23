import { useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/format'

/**
 * Lightweight dropdown: <Dropdown trigger={<button/>}>{(close) => items}</Dropdown>
 * or controlled via items prop.
 */
export default function Dropdown({ trigger, children, align = 'right', className = '', panelClassName = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div onClick={() => setOpen((v) => !v)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            'animate-modal-in absolute z-50 mt-2 min-w-56 overflow-hidden rounded-2xl border border-line bg-secondary p-1.5 shadow-2xl shadow-black/60',
            align === 'right' ? 'right-0' : 'left-0',
            panelClassName,
          )}
        >
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ icon: Icon, label, description, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] font-medium transition-colors',
        danger ? 'text-red hover:bg-red/10' : 'text-body hover:bg-tint hover:text-ink',
      )}
    >
      {Icon && <Icon size={15} className="shrink-0 opacity-80" />}
      <span className="min-w-0">
        <span className="block truncate">{label}</span>
        {description && <span className="block truncate text-[10px] font-normal text-muted">{description}</span>}
      </span>
    </button>
  )
}
