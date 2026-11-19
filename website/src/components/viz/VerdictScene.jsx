import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../../lib/motion.js'
import { InsightTag } from '../Badges.jsx'

// Hero illustration of the survey's core loop: one small judge compares two
// answers, the order is swapped to test position consistency (§5.3), and a
// cross-family panel votes (I3). Illustrative only; no data.
const ACTS = [
  { key: 'judge', label: 'Judge', caption: 'A small judge reads both answers and picks one.' },
  { key: 'swap', label: 'Swap', caption: 'Swap the order and ask again. Only a verdict that survives the swap counts (position-consistent accuracy, §5.3).' },
  { key: 'panel', label: 'Panel', caption: 'Three judges from different families vote. Their errors are less correlated, so the majority is right more often.', tag: 'I3' },
]
const STEP_MS = [3200, 3600, 4200]
const JURORS = [
  { family: 'Qwen', vote: 'A' },
  { family: 'LLaMA', vote: 'B' },
  { family: 'Phi', vote: 'A' },
]

export default function VerdictScene() {
  const ref = useRef(null)
  const [act, setAct] = useState(0)
  const [beat, setBeat] = useState(0) // 0 reading, 1 verdict shown
  const [visible, setVisible] = useState(false)
  const [paused, setPaused] = useState(false)
  const still = reducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Each act reads first, then shows its verdict, then moves on.
  useEffect(() => {
    if (still) { setBeat(1); return undefined }
    if (!visible || paused) return undefined
    setBeat(0)
    const t1 = setTimeout(() => setBeat(1), 1300)
    const t2 = setTimeout(() => setAct((a) => (a + 1) % ACTS.length), STEP_MS[act])
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [act, visible, paused, still])

  const swapped = act === 1
  const panel = act === 2
  const current = ACTS[act]

  return (
    <figure
      ref={ref}
      className={`verdict-scene act-${current.key}${beat ? ' is-decided' : ''}${still ? ' is-still' : ''}`}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Illustration: a small judge compares two answers, the order is swapped, then a three-judge panel votes"
    >
      <div className="vs-stage" aria-hidden="true">
        <div className="vs-question">
          <span className="vs-q-label">Task</span>
          <span className="vs-q-text">Solve 3x + 6 = 42</span>
        </div>

        <div className={`vs-card vs-card-a${swapped ? ' is-right' : ''}`}>
          <span className="vs-card-label">Answer A</span>
          <span className="vs-card-text">3x = 36, so x = 12</span>
          <span className="vs-line" /><span className="vs-line vs-line-short" />
        </div>
        <div className={`vs-card vs-card-b${swapped ? ' is-left' : ''}`}>
          <span className="vs-card-label">Answer B</span>
          <span className="vs-card-text">3x = 48, so x = 16</span>
          <span className="vs-line" /><span className="vs-line vs-line-short" />
        </div>

        <svg className="vs-wires" viewBox="0 0 600 160" preserveAspectRatio="none">
          <path className="vs-wire vs-wire-l" d="M150 80 C 230 80, 240 80, 300 80" />
          <path className="vs-wire vs-wire-r" d="M450 80 C 370 80, 360 80, 300 80" />
        </svg>

        <div className="vs-judges">
          {panel
            ? JURORS.map((j, k) => (
              <span key={j.family} className={`vs-juror vs-juror-${k}`} style={{ '--k': k }}>
                <span className="vs-juror-dot" />
                <span className="vs-juror-name">{j.family}</span>
                <span className={`vs-juror-vote vote-${j.vote}`}>{j.vote}</span>
              </span>
            ))
            : (
              <span className="vs-judge">
                <span className="vs-judge-name">SLM judge</span>
                <span className="vs-judge-size">≤14B</span>
                <span className="vs-read"><span className="vs-read-fill" /></span>
              </span>
            )}
        </div>

        <div className="vs-verdict">
          {panel
            ? <><span className="vs-verdict-main">A wins 2 to 1</span><span className="vs-verdict-sub">majority vote</span></>
            : swapped
              ? <><span className="vs-verdict-main">Still A</span><span className="vs-verdict-sub">consistent after the swap</span></>
              : <><span className="vs-verdict-main">A</span><span className="vs-verdict-sub">verdict</span></>}
          <span className="vs-check">✓</span>
        </div>
      </div>

      <figcaption className="vs-caption">
        <span className="vs-steps" role="group" aria-label="Scene">
          {ACTS.map((a, k) => (
            <button
              key={a.key}
              type="button"
              aria-pressed={k === act}
              className="vs-step"
              onClick={() => { setAct(k); setBeat(still ? 1 : 0) }}
            >
              <span className="vs-step-num">{k + 1}</span>{a.label}
            </button>
          ))}
        </span>
        <span className="vs-caption-text" aria-live="polite">
          {current.tag && <InsightTag id={current.tag} />}{current.caption}
        </span>
      </figcaption>
    </figure>
  )
}

