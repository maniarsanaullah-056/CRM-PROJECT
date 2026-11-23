import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/format'

function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total]
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '…', current - 1, current, current + 1, '…', total]
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center gap-1">
      <button
        className="icon-btn h-8 w-8"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        style={{ opacity: page === 1 ? 0.35 : 1 }}
      >
        <ChevronLeft size={15} />
      </button>
      {pageWindow(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-xs text-faint">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              'h-8 w-8 rounded-lg text-xs font-semibold tabular-nums transition-all',
              p === page ? 'gradient-brand text-white' : 'text-muted hover:bg-tint hover:text-ink',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        className="icon-btn h-8 w-8"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        style={{ opacity: page === totalPages ? 0.35 : 1 }}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}
