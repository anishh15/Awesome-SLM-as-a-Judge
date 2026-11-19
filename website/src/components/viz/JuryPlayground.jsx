import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Check, Play, Square, X as Cross } from 'lucide-react'
import { insightById } from '../../lib/site.js'
import { reducedMotion } from '../../lib/motion.js'

// An interactive version of the Condorcet formula in the survey's Sec. 4.1,
// with one extra knob for judges that share their errors.

const SIZES = [1, 3, 5, 7, 9]
const CASES = 20
const STEP_MS = 320

function choose(n, k) {
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return r
}

/** Majority-vote accuracy of n independent judges, each right with probability p. */
export function majority(n, p) {
  let s = 0
  for (let k = Math.floor(n / 2) + 1; k <= n; k++) s += choose(n, k) * p ** k * (1 - p) ** (n - k)
  return s
}

/** With probability rho all judges copy one verdict; otherwise they vote independently. */
export const accuracy = (n, p, rho) => rho * p + (1 - rho) * majority(n, p)

/** One simulated case: each judge's verdict (true = right) and whether errors were shared. */
function simulate(n, p, rho) {
  const shared = Math.random() < rho
  if (shared) {
    const v = Math.random() < p
    return { votes: Array(n).fill(v), shared }
  }
  return { votes: Array.from({ length: n }, () => Math.random() < p), shared }
}
const majorityRight = (votes) => votes.filter(Boolean).length > votes.length / 2

const fmt = (x) => `${(x * 100).toFixed(1)}%`

export default function JuryPlayground() {
  const uid = useId()
  const [n, setN] = useState(5)
  const [p, setP] = useState(0.7)
  const [rho, setRho] = useState(0)
  const [cases, setCases] = useState([])
  const [current, setCurrent] = useState(null)
  const [running, setRunning] = useState(false)
  const [said, setSaid] = useState('')
  const timer = useRef(null)

  const acc = accuracy(n, p, rho)
  const gain = acc - p
  const where = insightById.I3?.subsection?.num || '4.1'

  const stop = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = null
    setRunning(false)
  }, [])

  // a new setting clears the old trial run
  useEffect(() => { stop(); setCases([]); setCurrent(null) }, [n, p, rho, stop])
  useEffect(() => () => clearTimeout(timer.current), [])

  // announce the result once the sliders settle (not on first render)
  const initial = useRef(`${n}|${p}|${rho}`)
  useEffect(() => {
    if (`${n}|${p}|${rho}` === initial.current) return undefined
    initial.current = null
    const t = setTimeout(() => setSaid(
      `Majority accuracy ${fmt(acc)} with ${n} ${n === 1 ? 'judge' : 'judges'}, p ${p.toFixed(2)}, shared errors ${rho.toFixed(2)}. One judge: ${fmt(p)}.`), 600)
    return () => clearTimeout(t)
  }, [acc, n, p, rho])

  const tally = (list) => `Majority right in ${list.filter((c) => c.ok).length} of ${list.length} cases; ${list.filter((c) => c.shared).length} had shared errors.`

  const run = () => {
    if (running) { stop(); return }
    const all = Array.from({ length: CASES }, () => {
      const c = simulate(n, p, rho)
      return { ...c, ok: majorityRight(c.votes) }
    })
    if (reducedMotion()) {
      setCases(all); setCurrent({ ...all[CASES - 1], k: CASES - 1 }); setSaid(tally(all))
      return
    }
    setCases([]); setRunning(true)
    let k = 0
    const tick = () => {
      const c = all[k]
      setCurrent({ ...c, k })
      setCases(all.slice(0, k + 1))
      k += 1
      if (k < CASES) timer.current = setTimeout(tick, STEP_MS)
      else { timer.current = null; setRunning(false); setSaid(tally(all)) }
    }
    tick()
  }

  const right = cases.filter((c) => c.ok).length
  const votes = current?.votes || Array(n).fill(null)

  return (
    <section className="jury" aria-labelledby={`${uid}-title`}>
      <header className="jury-head">
        <p className="jury-kicker">Interactive illustration · §{where}</p>
        <h3 id={`${uid}-title`} className="jury-title">Majority vote with shared errors</h3>
        <p className="jury-lead">
          Section {where} uses the Condorcet jury theorem: if each judge is right with probability <i>p</i> &gt; 0.5
          and errors are independent, majority-vote accuracy tends to 1 as the jury grows. Independent errors cancel out,
          but shared errors do not. Judges from different model families fail in less correlated ways, so a cross-family
          panel is closer to the independent case (I3).
        </p>
      </header>

      <div className="jury-grid">
        <div className="jury-controls">
          <Slider id={`${uid}-n`} label="Jury size n" value={n} min={1} max={9} step={2}
            text={`${n} ${n === 1 ? 'judge' : 'judges'}`} onChange={(v) => setN(SIZES.includes(v) ? v : 5)} />
          <Slider id={`${uid}-p`} label="Each judge is right with probability p" value={p} min={0.5} max={0.95} step={0.01}
            text={p.toFixed(2)} onChange={setP} />
          <Slider id={`${uid}-r`} label="Shared errors ρ" value={rho} min={0} max={1} step={0.05}
            text={rho.toFixed(2)} onChange={setRho}
            hint="0: independent votes. 1: every judge copies one verdict." />
          <div className="jury-formula">
            <p><span className="jury-formula-tag">§{where}</span> P<sub>maj</sub> = Σ<sub>k&gt;n/2</sub> C(n,k) p<sup>k</sup> (1−p)<sup>n−k</sup></p>
            <p><span className="jury-formula-tag">here</span> accuracy = ρ·p + (1−ρ)·P<sub>maj</sub></p>
          </div>
        </div>

        <div className="jury-result">
          <div className="jury-number">
            <p className="jury-number-label">Majority-vote accuracy</p>
            <output className="jury-big tnum" htmlFor={`${uid}-n ${uid}-p ${uid}-r`}>{fmt(acc)}</output>
            <p className="jury-compare tnum">
              One judge: {fmt(p)}
            </p>
          </div>
          <div className="jury-plot">
            <Curve n={n} p={p} rho={rho} />
            <p className="jury-key" aria-hidden="true">
              <span><i className="k-mine" />this setting</span>
              <span><i className="k-indep" />independent errors</span>
              <span><i className="k-single" />one judge</span>
            </p>
          </div>
        </div>
      </div>

      <div className="jury-sim">
        <div className="jury-sim-top">
          <button type="button" className="btn btn-secondary btn-sm" onClick={run}>
            {running ? <Square size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            {running ? 'Stop' : `Run ${CASES} cases`}
          </button>
          <p className="jury-tally tnum" aria-hidden="true">
            {cases.length
              ? <>Majority right in <strong>{right}</strong> of {cases.length} <span className="muted">(expected about {(acc * CASES).toFixed(1)} of {CASES})</span></>
              : `Expected about ${(acc * CASES).toFixed(1)} of ${CASES} right`}
          </p>
        </div>
        <div className="jury-row" aria-hidden="true">
          <div className="jury-dots">
            {votes.map((v, j) => (
              <span key={`${current?.k ?? 'x'}-${j}`} className={`jury-dot${v === true ? ' is-right' : v === false ? ' is-wrong' : ''}`}
                style={{ '--j': j }}>
                {v === true && <Check size={13} strokeWidth={3} />}
                {v === false && <Cross size={13} strokeWidth={3} />}
              </span>
            ))}
          </div>
          <p className="jury-case">
            {current
              ? <>Case {current.k + 1}: {current.shared ? 'shared error, all copy one verdict' : 'independent votes'}. Majority is <strong className={current.ok ? 'jury-ok' : 'jury-bad'}>{current.ok ? 'right' : 'wrong'}</strong>.</>
              : 'Each dot is one judge. A run draws 20 cases at the current setting.'}
          </p>
        </div>
        <ol className="jury-strip" aria-hidden="true" style={{ '--cases': CASES }}>
          {Array.from({ length: CASES }, (_, k) => {
            const c = cases[k]
            return <li key={k} className={c ? (c.ok ? 'is-right' : 'is-wrong') + (c.shared ? ' is-shared' : '') : ''} />
          })}
        </ol>
        <p className="jury-legend" aria-hidden="true">
          <span><i className="is-right" />majority right</span>
          <span><i className="is-wrong" />majority wrong</span>
          <span><i className="is-shared" />shared-error case</span>
        </p>
      </div>

      <p className="jury-foot">This illustrates the formula and shows no data from the surveyed studies. The shared-error control is a simple model and is not from the paper.</p>
      <p className="visually-hidden" aria-live="polite">{said}</p>
    </section>
  )
}

function Slider({ id, label, value, min, max, step, text, hint, onChange }) {
  const fill = ((value - min) / (max - min)) * 100
  return (
    <div className="jury-slider">
      <div className="jury-slider-top">
        <label htmlFor={id}>{label}</label>
        <span className="jury-slider-val tnum">{text}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        aria-valuetext={text} style={{ '--fill': `${fill}%` }}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <p id={`${id}-hint`} className="jury-hint">{hint}</p>}
    </div>
  )
}

// accuracy against jury size, drawn in pixels so the labels keep their size
const H = 180
const PAD = { l: 40, r: 14, t: 12, b: 36 }

function Curve({ n, p, rho }) {
  const ref = useRef(null)
  const [W, setW] = useState(400)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(([e]) => setW(Math.max(220, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const X = (k) => PAD.l + ((k - 1) / 8) * (W - PAD.l - PAD.r)
  const Y = (v) => PAD.t + (1 - (v - 0.5) / 0.5) * (H - PAD.t - PAD.b)
  const line = (f) => SIZES.map((k, i) => `${i ? 'L' : 'M'}${X(k).toFixed(1)},${Y(f(k)).toFixed(1)}`).join(' ')
  const a = accuracy(n, p, rho)
  return (
    <div ref={ref} className="jury-curve-box">
      <svg className="jury-curve" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Accuracy against jury size from 1 to 9 judges. At ${n} judges: ${fmt(a)}.`}>
        {[0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line className="jc-grid" x1={PAD.l} x2={W - PAD.r} y1={Y(t)} y2={Y(t)} />
            <text className="jc-tick" x={PAD.l - 8} y={Y(t) + 4} textAnchor="end">{t * 100}%</text>
          </g>
        ))}
        {SIZES.map((k) => (
          <text key={k} className={`jc-tick${k === n ? ' is-on' : ''}`} x={X(k)} y={H - PAD.b + 17} textAnchor="middle">{k}</text>
        ))}
        <text className="jc-axis" x={(PAD.l + W - PAD.r) / 2} y={H - 3} textAnchor="middle">jury size n</text>
        <line className="jc-single" x1={PAD.l} x2={W - PAD.r} y1={Y(p)} y2={Y(p)} />
        <path className="jc-indep" d={line((k) => majority(k, p))} />
        <path className="jc-mine" d={line((k) => accuracy(k, p, rho))} />
        <circle className="jc-point" r="5" cx="0" cy="0" style={{ transform: `translate(${X(n)}px, ${Y(a)}px)` }} />
      </svg>
    </div>
  )
}
