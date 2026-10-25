import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../lib/motion.js'

/** Counts up to `value` the first time it scrolls into view. */
export default function Counter({ value, duration = 1100, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(value)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion() || typeof value !== 'number') return undefined
    setShown(0)
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return
      started.current = true
      const t0 = performance.now()
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / duration)
        const eased = 1 - Math.pow(1 - p, 4)
        setShown(Math.round(value * eased))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      io.disconnect()
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [value, duration])
  return (
    <span ref={ref} className="counter tnum">
      <span className="counter-ghost" aria-hidden="true">{prefix}{value}{suffix}</span>
      <span className="counter-live" aria-hidden="true">{prefix}{shown}{suffix}</span>
      <span className="visually-hidden">{prefix}{value}{suffix}</span>
    </span>
  )
}
