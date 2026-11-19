import { useRef } from 'react'
import { useReveal } from '../../lib/reveal.jsx'

const LEVEL = { Consensus: 3, Replicated: 2, Preliminary: 1 }

/** Evidence grade as a three-step meter that fills when it scrolls into view.
    size: 'sm' | 'md'; detail: optional text after the grade; count: show "3 of 3". */
export default function GradeMeter({ grade, detail = null, size = 'md', count = true }) {
  const ref = useRef(null)
  useReveal(ref)
  const level = LEVEL[grade] || 0
  return (
    <span ref={ref} className={`gm gm-${size}`}>
      <span className="gm-track" aria-hidden="true">
        {[1, 2, 3].map((k) => (
          <i key={k} className={k <= level ? 'gm-seg on' : 'gm-seg'} style={{ '--i': k - 1 }}><b /></i>
        ))}
      </span>
      <span className="gm-name">{grade}</span>
      {count && <span className="gm-count tnum" aria-hidden="true">{level} of 3</span>}
      <span className="visually-hidden">evidence grade, {level} of 3</span>
      {detail && <span className="gm-detail">{detail}</span>}
    </span>
  )
}
