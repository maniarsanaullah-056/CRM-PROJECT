// ── Radial productivity indicator (SVG, no chart lib dependency) ─────────────
export default function ProductivityCard({ pct = 0, completed = 0, total = 0, label = 'Productivity', sublabel }) {
  const radius = 52
  const stroke = 11
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, pct))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
          <circle cx="64" cy="64" r={radius} stroke="var(--secondary)" strokeWidth={stroke} fill="none" />
          <circle
            cx="64" cy="64" r={radius} stroke="var(--accent-solid)" strokeWidth={stroke} fill="none"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold tabular-nums text-ink">{clamped}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted">%</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
        <p className="mt-1.5 text-sm font-semibold text-ink">
          {completed} <span className="text-muted">of</span> {total} tasks completed
        </p>
        <p className="mt-1 text-[11px] leading-snug text-muted">
          {sublabel || (clamped >= 80 ? 'Outstanding pace — keep it up.' : clamped >= 50 ? 'Solid progress. Stay consistent.' : clamped > 0 ? 'Focus on pending tasks to climb.' : 'No tasks assigned yet.')}
        </p>
      </div>
    </div>
  )
}
