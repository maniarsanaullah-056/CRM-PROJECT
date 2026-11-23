import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { cn, uid } from '../utils/format'

const ToastContext = createContext(null)

const ICONS = {
  success: { Icon: CheckCircle2, cls: 'text-green border-green/30 bg-green/10' },
  error: { Icon: XCircle, cls: 'text-red border-red/30 bg-red/10' },
  info: { Icon: Info, cls: 'text-blue border-blue/30 bg-blue/10' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toast = useCallback((type, message) => {
    const id = uid()
    setToasts((t) => [...t.slice(-2), { id, type, message }])
    window.setTimeout(() => remove(id), 4200)
  }, [remove])

  const api = {
    success: (m) => toast('success', m),
    error: (m) => toast('error', m),
    info: (m) => toast('info', m),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map(({ id, type, message }) => {
          const { Icon, cls } = ICONS[type] || ICONS.info
          return (
            <div
              key={id}
              role="status"
              className={cn(
                'animate-toast-in flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] font-medium text-ink shadow-2xl shadow-black/50 backdrop-blur-md',
                cls,
              )}
            >
              <Icon size={17} className="mt-0.5 shrink-0" />
              <span className="flex-1 leading-snug">{message}</span>
              <button onClick={() => remove(id)} className="text-muted transition-colors hover:text-ink" aria-label="Dismiss">
                <X size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
