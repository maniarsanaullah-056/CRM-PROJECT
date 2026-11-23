import { formatCurrency } from '../../utils/format'

/** Dark tooltip shared by every Recharts chart in the app. */
export default function ChartTooltip({ active, payload, label, currency = false }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-xl border border-line bg-secondary/95 px-3.5 py-2.5 shadow-2xl shadow-black/60 backdrop-blur-md">
      {label && <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.color || entry.fill || '#7C3AED' }} />
            <span className="text-muted">{entry.name}</span>
            <span className="ml-auto pl-3 font-bold tabular-nums text-ink">
              {currency ? formatCurrency(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
