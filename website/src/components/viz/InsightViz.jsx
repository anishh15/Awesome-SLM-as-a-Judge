import { useRef } from 'react'
import { useReveal } from '../../lib/reveal.jsx'
import { insightById, citeText } from '../../lib/site.js'
import { FACTS } from '../../lib/facts.js'

// Small data visuals for the five insights. Every number comes from lib/facts.js,
// which the data build checks against the paper's LaTeX.

const pct = (v, [a, b]) => ((v - a) / (b - a)) * 100
const fmtPct = (v) => `${v}%`
const { I1, I2, I3, I4, I5 } = FACTS

/** The full visual for one insight, with its caption (Insights page). */
export default function InsightViz({ id }) {
  const ref = useRef(null)
  useReveal(ref)
  const spec = FULL[id]
  if (!spec) return null
  const ins = insightById[id]
  const where = ins?.subsection?.num || ins?.section?.num
  return (
    <figure ref={ref} className={`iv iv-full iv-${id}`}>
      <p className="iv-head" aria-hidden="true">
        <span>{spec.title}</span>
        {where && <span className="iv-where">§{where}</span>}
      </p>
      <div className="iv-graphic" role="img" aria-label={spec.alt}>
        <spec.Draw />
      </div>
      <figcaption className="iv-caption">{spec.caption}</figcaption>
    </figure>
  )
}

/** A compact visual for a home insight card (about 72px tall, 240 to 300px wide). */
export function InsightMini({ id, className = '' }) {
  const ref = useRef(null)
  useReveal(ref)
  const spec = MINI[id]
  if (!spec) return null
  return (
    <div ref={ref} className={`iv iv-mini iv-${id} ${className}`} role="img" aria-label={spec.alt}>
      <spec.Draw />
    </div>
  )
}

// ── shared pieces ────────────────────────────────────────────────────────────

function Axis({ domain, ticks, fmt = (t) => t }) {
  return (
    <div className="iv-row iv-row-axis" aria-hidden="true">
      <span className="iv-name" />
      <span className="iv-axis">
        {ticks.map((t) => <span key={t} style={{ left: `${pct(t, domain)}%` }}>{fmt(t)}</span>)}
      </span>
      <span />
    </div>
  )
}

function Bar({ name, value, domain, label, tone = 'teal', d = 0 }) {
  return (
    <div className="iv-row">
      <span className="iv-name">{name}</span>
      <span className="iv-track">
        <i className={`iv-fill tone-${tone}`} style={{ width: `${pct(value, domain)}%`, '--d': `${d}ms` }} />
      </span>
      <span className="iv-val tnum">{label}</span>
    </div>
  )
}

function Range({ from, to, domain, fromLabel, toLabel, mark, d = 0 }) {
  const a = pct(from, domain)
  const b = pct(to, domain)
  return (
    <span className="iv-range">
      {mark != null && <span className="iv-mark" style={{ left: `${pct(mark, domain)}%` }} />}
      <i className="iv-band" style={{ left: `${a}%`, width: `${b - a}%`, '--d': `${d}ms` }} />
      <span className="iv-end tnum" style={{ left: `${a}%` }}>{fromLabel}</span>
      <span className="iv-end iv-end-r tnum" style={{ left: `${b}%` }}>{toLabel}</span>
    </span>
  )
}

function Lights({ n, d = 0 }) {
  return (
    <span className="iv-lights">
      {Array.from({ length: n }, (_, k) => <i key={k} style={{ '--d': `${d + k * 90}ms` }} />)}
    </span>
  )
}

function Cells({ n, open = false, tone = 'teal', d = 0, total = 8 }) {
  return (
    <span className="iv-cells" style={{ '--n': total }}>
      {Array.from({ length: n }, (_, k) => <i key={k} className={`tone-${tone}`} style={{ '--d': `${d + k * 70}ms` }} />)}
      {open && <i className="iv-cell-open" style={{ '--d': `${d + n * 70}ms` }} />}
    </span>
  )
}

function Ring({ share, size = 104, stroke = 12 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg className="iv-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle className="iv-ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
      <circle className="iv-ring-arc" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
        strokeDasharray={`${c * share} ${c}`} style={{ '--c': c * share }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  )
}

function Families() {
  return (
    <span className="iv-families">
      {I3.poll.value.map((m, k) => (
        <span key={m} className="iv-family"><i className={`fam fam-${k}`} />{m}</span>
      ))}
    </span>
  )
}

// ── I1 ───────────────────────────────────────────────────────────────────────
function I1Full() {
  const [lo, hi] = I1.gainRange.value
  return (
    <>
      <div className="iv-block">
        <p className="iv-label">Same-backbone comparisons</p>
        <div className="iv-row">
          <span className="iv-name">Papers</span>
          <Lights n={I1.papers.value} />
          <span className="iv-val tnum">{I1.papers.value} of {I1.papers.value} improve</span>
        </div>
      </div>
      <div className="iv-block">
        <p className="iv-label">Relative gain over the base model</p>
        <div className="iv-row">
          <span className="iv-name">Range</span>
          <span className="iv-track iv-track-line">
            <Range from={lo} to={hi} domain={[0, 70]} fromLabel={`${lo}%`} toLabel={`${hi}%`} d={700} />
          </span>
          <span className="iv-val" />
        </div>
        <Axis domain={[0, 70]} ticks={[0, 20, 40, 60]} fmt={fmtPct} />
      </div>
    </>
  )
}

// ── I2 ───────────────────────────────────────────────────────────────────────
const GAIN = [0, 35]
function I2Full() {
  const g = I2.thinkingGain.value
  const [f0, f1] = I2.flops.value
  return (
    <>
      <div className="iv-block">
        <p className="iv-label">Relative accuracy gain from thinking mode</p>
        <Bar name="0.6B judge" value={g['0.6B']} domain={GAIN} label={`${g['0.6B']}%`} />
        <Bar name="4B judge" value={g['4B']} domain={GAIN} label={`${g['4B']}%`} d={120} />
        <Axis domain={GAIN} ticks={[0, 10, 20, 30]} fmt={fmtPct} />
      </div>
      <p className="iv-aside">On the hard Chat Hard pairs, thinking mode lifts the accuracy of 1.7B and 4B judges by about {I2.chatHard.value}%.</p>
      <div className="iv-block">
        <p className="iv-label">Compute, relative to no thinking (dashed line)</p>
        <div className="iv-row">
          <span className="iv-name">FLOPs</span>
          <span className="iv-track iv-track-line">
            <Range from={f0} to={f1} domain={[0, 5]} fromLabel={`${f0}×`} toLabel={`${f1}×`} mark={1} d={500} />
          </span>
          <span className="iv-val" />
        </div>
        <Axis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} fmt={(t) => `${t}×`} />
      </div>
    </>
  )
}

// ── I3 ───────────────────────────────────────────────────────────────────────
function I3Full() {
  const k = I3.cost.value
  return (
    <div className="iv-block">
      <p className="iv-label">API cost, in units of the panel's cost</p>
      <div className="iv-row iv-row-tall">
        <span className="iv-name">Panel of three<Families /></span>
        <Cells n={1} />
        <span className="iv-val tnum">1×</span>
      </div>
      <div className="iv-row iv-row-tall">
        <span className="iv-name">One GPT-4 judge</span>
        <Cells n={k} open tone="muted" d={200} />
        <span className="iv-val tnum">over {k}×</span>
      </div>
    </div>
  )
}

// ── I4 ───────────────────────────────────────────────────────────────────────
function I4Full() {
  const { kappa, cost } = I4.roles.value
  return (
    <>
      <div className="iv-block iv-ring-block">
        <span className="iv-ring-wrap">
          <Ring share={I4.mast.value} />
          <span className="iv-ring-center"><small>about</small>1/3</span>
        </span>
        <p className="iv-ring-text">
          of multi-agent failures trace to <strong>inter-agent misalignment</strong>, such as ignored input and derailed tasks (MAST).
        </p>
      </div>
      <div className="iv-block">
        <p className="iv-label">Safety evaluation: cost relative to GPT-4o</p>
        <Bar name="GPT-4o" value={100} domain={[0, 100]} label="100%" tone="muted" d={500} />
        <Bar name="Critic, defender, judge (Qwen3-14B)" value={cost} domain={[0, 100]} label={`about ${cost}%`} d={620} />
        <p className="iv-note">Agreement within {kappa.toFixed(2)} Cohen's κ of GPT-4o.</p>
      </div>
    </>
  )
}

// ── I5 ───────────────────────────────────────────────────────────────────────
const DOMAINS = [
  { name: 'Math, code', gap: 'near parity' },
  { name: 'Factual QA', gap: 'good agreement' },
  { name: 'Creative, medical', gap: 'widest gap' },
]
/** Three ordered steps: the gap grows as verification gets harder. */
function Steps({ compact = false }) {
  return (
    <ol className={`iv-steps${compact ? ' iv-steps-compact' : ''}`}>
      {DOMAINS.map((x, k) => (
        <li key={x.name} style={{ '--k': k }}>
          <span className="iv-step-bar" aria-hidden="true"><i /></span>
          <span className="iv-step-name">{x.name}</span>
          <span className="iv-step-gap">{x.gap}</span>
        </li>
      ))}
    </ol>
  )
}

function I5Full() {
  return (
    <div className="iv-block">
      <p className="iv-label">Gap between SLM and LLM judges, by domain (ordinal, from Table 2)</p>
      <Steps />
      <div className="iv-grad-axis">
        <span>more verifiable</span>
        <span>less verifiable</span>
      </div>
    </div>
  )
}

const cite = (key) => citeText(key)

const FULL = {
  I1: {
    title: 'Training against scale',
    Draw: I1Full,
    alt: `In all ${I1.papers.value} same-backbone papers, evaluation training improves the base model, with relative gains from ${I1.gainRange.value[0]}% to ${I1.gainRange.value[1]}%.`,
    caption: <>In all {I1.papers.value} papers that keep the backbone fixed, evaluation training improves the base model, with relative gains of {I1.gainRange.value[0]}% to {I1.gainRange.value[1]}%. Selene Mini lifts LLaMA-3.1-8B-Instruct from {I1.seleneMini.value[0].toFixed(3)} to {I1.seleneMini.value[1].toFixed(3)} ({I1.seleneMini.gain}%; {cite('alexandru2025atla')}). FLAMe-RM, a trained 24B judge shown as a reference point above 14B, scores {I1.scale.value.large.toFixed(3)} ({cite('vu2024foundational')}).</>,
  },
  I2: {
    title: 'Gain and cost of thinking mode',
    Draw: I2Full,
    alt: `Relative accuracy gain from thinking mode: ${I2.thinkingGain.value['0.6B']}% at 0.6B and ${I2.thinkingGain.value['4B']}% at 4B; about ${I2.chatHard.value}% on Chat Hard for 1.7B and 4B judges. Thinking mode uses ${I2.flops.value[0]} to ${I2.flops.value[1]} times the FLOPs.`,
    caption: <>The smallest judge gains most from thinking mode, {I2.thinkingGain.value['0.6B']}% at 0.6B against {I2.thinkingGain.value['4B']}% at 4B, for {I2.flops.value[0]} to {I2.flops.value[1]} times the FLOPs ({cite('jayarao2025explicit')}). On Chat Hard pairs, 1.7B and 4B judges gain about {I2.chatHard.value}%.</>,
  },
  I3: {
    title: 'Panel against single judge',
    Draw: I3Full,
    alt: `A panel of ${I3.poll.value.join(', ')} outperforms one GPT-4 judge at over ${I3.cost.value} times lower API cost.`,
    caption: <>PoLL, a panel of {I3.poll.value[0]}, {I3.poll.value[1]} and {I3.poll.value[2]}, outperforms a single GPT-4 judge at over {I3.cost.value} times lower API cost ({cite('verga2024replacing')}).</>,
  },
  I4: {
    title: 'Debate failures and role-based debate',
    Draw: I4Full,
    alt: `About a third of multi-agent failures trace to inter-agent misalignment. A critic, defender and judge on Qwen3-14B come within ${I4.roles.value.kappa} Cohen's kappa of GPT-4o at about ${I4.roles.value.cost}% of its cost.`,
    caption: <>MAST traces about a third of multi-agent failures to inter-agent misalignment ({cite('cemri2026multi')}). With distinct roles, three Qwen3-14B agents come within {I4.roles.value.kappa.toFixed(2)} Cohen's κ of GPT-4o at about {I4.roles.value.cost}% of its cost ({cite('lin2025efficient')}).</>,
  },
  I5: {
    title: 'The verifiability gradient',
    Draw: I5Full,
    alt: 'Ordinal: the gap between SLM and LLM judges is near parity for math and code, small for factual QA, and widest for creative and medical evaluation.',
    caption: <>SLM judges reach near parity on math and code and agree well on factual QA, but drop sharply on creative tasks, where no external oracle exists. Table 2 lists creative and medical evaluation as the widest gap. The steps show order only; their heights are not measured values.</>,
  },
}

// ── mini variants ────────────────────────────────────────────────────────────
const MINI = {
  I1: {
    alt: FULL.I1.alt,
    Draw: () => (
      <>
        <p className="ivm-label">{I1.papers.value} of {I1.papers.value} same-backbone papers improve</p>
        <Lights n={I1.papers.value} />
        <div className="ivm-row">
          <span className="iv-track iv-track-line">
            <Range from={I1.gainRange.value[0]} to={I1.gainRange.value[1]} domain={[0, 70]}
              fromLabel={`+${I1.gainRange.value[0]}%`} toLabel={`+${I1.gainRange.value[1]}%`} d={700} />
          </span>
        </div>
      </>
    ),
  },
  I2: {
    alt: FULL.I2.alt,
    Draw: () => (
      <>
        <p className="ivm-label">Gain from thinking mode</p>
        <Bar name="0.6B" value={I2.thinkingGain.value['0.6B']} domain={[0, 20]} label={`${I2.thinkingGain.value['0.6B']}%`} />
        <Bar name="4B" value={I2.thinkingGain.value['4B']} domain={[0, 20]} label={`${I2.thinkingGain.value['4B']}%`} d={120} />
      </>
    ),
  },
  I3: {
    alt: FULL.I3.alt,
    Draw: () => (
      <>
        <p className="ivm-label">API cost</p>
        <div className="iv-row">
          <span className="iv-name ivm-fams"><i className="fam fam-0" /><i className="fam fam-1" /><i className="fam fam-2" /></span>
          <Cells n={1} />
          <span className="iv-val tnum">1×</span>
        </div>
        <div className="iv-row">
          <span className="iv-name ivm-fams"><i className="fam fam-big" /></span>
          <Cells n={I3.cost.value} open tone="muted" d={200} />
          <span className="iv-val tnum">&gt;{I3.cost.value}×</span>
        </div>
      </>
    ),
  },
  I4: {
    alt: `About a third of multi-agent failures trace to inter-agent misalignment.`,
    Draw: () => (
      <div className="ivm-ring">
        <span className="iv-ring-wrap">
          <Ring share={I4.mast.value} size={60} stroke={8} />
          <span className="iv-ring-center ivm-ring-center">1/3</span>
        </span>
        <p>About a third of multi-agent failures trace to inter-agent misalignment.</p>
      </div>
    ),
  },
  I5: {
    alt: FULL.I5.alt,
    Draw: () => (
      <div className="ivm-grad">
        <p className="ivm-label">Gap to LLM judges (ordinal)</p>
        <Steps compact />
      </div>
    ),
  },
}
