// ── Animated count-up number (no dependencies) ───────────────────────────────
import { useEffect, useRef, useState } from 'react'
import { formatNumber } from '../../utils/format'

export default function AnimatedNumber({ value = 0, format = formatNumber, duration = 750 }) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(null)
  const fromRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    const to = Number(value) || 0
    const start = performance.now()
    const easeOut = (t) => 1 - Math.pow(2, -10 * t)

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = t >= 1 ? 1 : easeOut(t)
      setDisplay(from + (to - from) * eased)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else fromRef.current = to
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); fromRef.current = to }
  }, [value, duration])

  return <span className="tabular-nums">{format(Math.round(display))}</span>
}
