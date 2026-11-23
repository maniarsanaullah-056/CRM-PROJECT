import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn, formatNumber } from '../../utils/format'
import AnimatedNumber from './AnimatedNumber'

const ACCENTS = {
  purple: { icon: 'bg-purple/15 text-[var(--accent-soft)] border-purple/25', ring: 'group-hover:border-faint' },
  blue: { icon: 'bg-blue/15 text-blue border-blue/25', ring: 'group-hover:border-faint' },
  green: { icon: 'bg-green/15 text-green border-green/25', ring: 'group-hover:border-faint' },
  orange: { icon: 'bg-orange/15 text-orange border-orange/25', ring: 'group-hover:border-faint' },
  red: { icon: 'bg-red/15 text-red border-red/25', ring: 'group-hover:border-faint' },
}

/** Deterministic pseudo-random walk so every label gets its own stable sparkline. */
const sparklineFor = (label = '') => {
  let seed = 2166136261
  for (let i = 0; i < label.length; i++) {
    seed ^= label.charCodeAt(i)
    seed = Math.imul(seed, 16777619)
  }
  const rand = () => {
    seed = Math.imul(seed ^ (seed >>> 13), 1274126177)
    seed = Math.imul(seed ^ (seed >>> 16), 1000000007)
    return (Math.abs(seed) % 1000) / 1000
  }
  const points = []
  let v = 45 + rand() * 15
  for (let i = 0; i < 14; i++) {
    v = Math.max(8, Math.min(84, v + (rand() - 0.4) * 16))
    points.push(v)
  }
  return points
}

const toPath = (pts, w = 96, h = 30) => {
  const max = Math.max(...pts)
  const min = Math.min(...pts)
  const range = max - min || 1
  return pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * w
      const y = h - ((p - min) / range) * (h - 4) - 2
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export default function StatsCard({ label, value, icon: Icon, accent = 'purple', delta, deltaTone = 'green', sub, format, className = '' }) {
  const a = ACCENTS[accent] || ACCENTS.purple
  const TrendIcon = deltaTone === 'red' ? TrendingDown : TrendingUp
  const numeric = typeof value === 'number'
  const spark = sparklineFor(label)

  return (
    <div className={cn('card card-hover group relative overflow-hidden p-4 sm:p-5', a.ring, className)}>
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
          <p className="mt-1.5 truncate text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            {numeric ? <AnimatedNumber value={value} format={format || formatNumber} /> : value}
          </p>
          {delta && (
            <p className={cn('mt-1.5 flex items-center gap-1 text-[11px] font-semibold', deltaTone === 'red' ? 'text-red' : 'text-green')}>
              <TrendIcon size={12} strokeWidth={2.5} />
              {delta}
            </p>
          )}
          {sub && !delta && <p className="mt-1.5 text-[11px] font-medium text-muted">{sub}</p>}
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-105', a.icon)}>
          <Icon size={20} strokeWidth={1.8} />
        </div>
      </div>
      {/* Animated decorative sparkline */}
      <svg viewBox="0 0 96 30" className="mt-2 h-7 w-full" aria-hidden="true">
        <path
          d={toPath(spark)}
          fill="none"
          stroke="var(--accent-solid)"
          strokeOpacity="0.55"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="260"
          className="sparkline-draw"
        />
      </svg>
    </div>
  )
}
