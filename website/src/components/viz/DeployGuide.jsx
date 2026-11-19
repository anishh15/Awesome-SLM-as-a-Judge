import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import site from '../../lib/site.js'
import Rich from '../Rich.jsx'
import { Tag } from '../Badges.jsx'

// The survey's deployment recipe (Sec. 6 and Fig. 14) as a small chooser.
const DOMAINS = [
  { id: 'verifiable', label: 'Fully or mostly verifiable', examples: 'code, math, factual QA' },
  { id: 'partial', label: 'Partially verifiable', examples: 'safety, multilingual' },
  { id: 'subjective', label: 'Subjective', examples: 'creative, medical' },
]

const PRIORITIES = [
  { id: 'cost', label: 'Cost-sensitive', note: 'keep spending low' },
  { id: 'quality', label: 'Quality-critical', note: 'quality matters most' },
]

// Titles, specs and tags follow the boxes of Fig. 14; `find` picks the
// sentence of the Sec. 6 paragraph and `part` the clause that applies.
const DESIGNS = {
  single: { title: 'Single SLM judge', spec: '3–8B, direct mode, no CoT', tags: ['I1', 'I5'], find: 'single fine-tuned' },
  cascade: { title: 'Cascade', spec: 'SLM first, escalate uncertain to LLM', tags: ['I2', 'C1'], find: 'cascade', split: ', while ', part: 0 },
  panel: { title: 'Cross-family panel', spec: '3 SLMs, e.g., Phi + LLaMA + Qwen', tags: ['I3'], find: 'cascade', split: ', while ', part: 1 },
  human: { title: 'Human oversight', spec: 'Human oversight required, triage pass only', tags: ['I5', 'C1'], find: 'human in the loop', split: ', and ', part: 1 },
}

const NOTES = [
  { label: 'Report', find: 'position-consistent', strip: 'Whatever the design, ' },
  { label: 'Debate', find: 'Debate earns', split: ', and ', part: 0 },
  { label: 'Hard cases', find: 'thinking mode' },
]

const plain = (nodes) => nodes.map((n) => (typeof n === 'string' ? n : n.text || '')).join('')
const findStep = (words) => site.deploymentSteps.find((s) => plain(s).includes(words)) || null

const cap = (nodes) => (typeof nodes[0] === 'string' && nodes[0] ? [nodes[0][0].toUpperCase() + nodes[0].slice(1), ...nodes.slice(1)] : nodes)
const endDot = (nodes) => {
  const k = nodes.length - 1
  return typeof nodes[k] === 'string' ? [...nodes.slice(0, k), nodes[k].replace(/[,;:]?\s*$/, '').replace(/([^.])$/, '$1.')] : [...nodes, '.']
}

/** The clause of a paragraph sentence that applies (the whole sentence if no split), optionally without a lead-in. */
function Sentence({ find, split, part, strip }) {
  let nodes = findStep(find)
  if (!nodes) return null
  if (strip && typeof nodes[0] === 'string' && nodes[0].startsWith(strip)) nodes = cap([nodes[0].slice(strip.length), ...nodes.slice(1)])
  const at = split ? nodes.findIndex((n) => typeof n === 'string' && n.includes(split)) : -1
  if (at < 0) return <Rich nodes={nodes} tags />
  const cut = nodes[at].indexOf(split)
  const clause = part === 0
    ? endDot([...nodes.slice(0, at), nodes[at].slice(0, cut)])
    : cap([nodes[at].slice(cut + split.length), ...nodes.slice(at + 1)])
  return <Rich nodes={clause} tags />
}

/** An insight or challenge tag with its short title, linking to its page. */
function TagRow({ id }) {
  const insight = id.startsWith('I')
  const item = (insight ? site.insights : site.challenges).find((x) => x.id === id)
  return (
    <li>
      <Link className="dg-tag" to={insight ? `/insights/${id}` : `/challenges/${id}`} viewTransition>
        <Tag id={id} size="sm" />
        <span className="dg-tag-text">{item?.short || item?.title}</span>
      </Link>
    </li>
  )
}

/** Recommend a judge design from domain verifiability and, if partial, the budget. */
export default function DeployGuide({ className = '' }) {
  const uid = useId()
  const [domain, setDomain] = useState('verifiable')
  const [priority, setPriority] = useState('cost')
  const partial = domain === 'partial'
  const design = domain === 'verifiable' ? 'single' : domain === 'subjective' ? 'human' : priority === 'cost' ? 'cascade' : 'panel'
  const d = DESIGNS[design]
  const dIndex = DOMAINS.findIndex((x) => x.id === domain)

  return (
    <div className={`card dg dg-tone-${domain} ${className}`}>
      <div className="dg-controls">
        <fieldset className="dg-field">
          <legend className="dg-legend"><span className="dg-step" aria-hidden="true">1</span> What is your evaluation domain?</legend>
          <div className="dg-dial" style={{ '--pos': dIndex }}>
            <span className="dg-track" aria-hidden="true" />
            <span className="dg-rail" aria-hidden="true"><span className="dg-thumb" /></span>
            {DOMAINS.map((x) => (
              <label key={x.id} className={`dg-stop${domain === x.id ? ' is-on' : ''}`}>
                <input type="radio" className="visually-hidden" name={`${uid}-domain`} value={x.id}
                  checked={domain === x.id} onChange={() => setDomain(x.id)} />
                <span className="dg-stop-dot" aria-hidden="true" />
                <span className="dg-stop-label">{x.label}</span>
                <span className="dg-stop-ex">{x.examples}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="dg-field dg-field-budget" disabled={!partial}>
          <legend className="dg-legend"><span className="dg-step" aria-hidden="true">2</span> If partly verifiable, what matters more?</legend>
          <div className="dg-seg" style={{ '--pos': PRIORITIES.findIndex((x) => x.id === priority) }}>
            <span className="dg-seg-pill" aria-hidden="true" />
            {PRIORITIES.map((x) => (
              <label key={x.id} className={`dg-seg-opt${priority === x.id ? ' is-on' : ''}`}>
                <input type="radio" className="visually-hidden" name={`${uid}-priority`} value={x.id}
                  checked={priority === x.id} onChange={() => setPriority(x.id)} />
                <span className="dg-seg-label">{x.label}</span>
                <span className="dg-seg-note">{x.note}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <p className="visually-hidden" aria-live="polite">Recommended design: {d.title}. {d.spec}.</p>

      <div key={design} className={`dg-result dg-design-${design}`}>
        <p className="dg-kicker">Recommended design</p>
        <h3 className="dg-title">{d.title}</h3>
        <p className="dg-spec">{d.spec}</p>
        <Schematic design={design} uid={uid} />
        <ul className="dg-tags" aria-label="Based on">{d.tags.map((t) => <TagRow key={t} id={t} />)}</ul>
        <blockquote className="dg-quote">
          <p><Sentence find={d.find} split={d.split} part={d.part} /></p>
        </blockquote>
      </div>

      <div className="dg-always">
        <h4 className="dg-always-title">Whatever the design</h4>
        <ul className="dg-notes">
          {NOTES.map((n) => (
            <li key={n.label}>
              <span className="dg-note-label">{n.label}</span>
              <span className="dg-note-text"><Sentence find={n.find} split={n.split} part={n.part} strip={n.strip} /></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const MAIN_Y = 62

function Doc() {
  return (
    <g className="dg-io">
      <path className="dg-doc" d="M14 37h26l10 10v40H14z" />
      <path className="dg-doc-fold" d="M40 37v10h10" />
      <path className="dg-doc-lines" d="M21 58h22M21 66h22M21 74h14" />
      <text className="dg-io-label" x="32" y="28">Output</text>
    </g>
  )
}

function Verdict({ cx = 326 }) {
  return (
    <g className="dg-io dg-verdict">
      <circle cx={cx} cy={MAIN_Y} r="15" />
      <path d={`M${cx - 6} ${MAIN_Y}l4 4.5 8-9`} pathLength="1" />
      <text className="dg-io-label" x={cx} y="28">Verdict</text>
    </g>
  )
}

function Judge({ x, y, w, h, label, sub, tone }) {
  const cx = x + w / 2
  const cy = y + h / 2
  return (
    <g className={`dg-judge${tone ? ` dg-judge-${tone}` : ''}`}>
      <rect x={x} y={y} width={w} height={h} rx="9" />
      <text className="dg-judge-label" x={cx} y={sub ? cy - 2 : cy + 4.5}>{label}</text>
      {sub && <text className="dg-judge-sub" x={cx} y={cy + 13}>{sub}</text>}
    </g>
  )
}

function FlowArrow({ head, d, k = 0, className = '' }) {
  return <path className={`dg-flow ${className}`} d={d} pathLength="1" markerEnd={`url(#${head})`} style={{ '--k': k }} />
}

/** A small drawing of the recommended design. */
function Schematic({ design, uid }) {
  const head = `${uid}-head`.replace(/:/g, '')
  return (
    <svg className="dg-schematic" viewBox="0 0 360 150" role="img" aria-label={`Diagram: ${DESIGNS[design].title}. ${DESIGNS[design].spec}.`}>
      <defs>
        <marker id={head} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path className="dg-arrowhead" d="M1 1l8 4-8 4z" />
        </marker>
      </defs>
      <Doc />
      {design === 'single' && (
        <>
          <FlowArrow head={head} d={`M56 ${MAIN_Y}H116`} />
          <Judge x={120} y={38} w={100} h={48} label="SLM" sub="3–8B" />
          <path className="dg-link" d="M170 88V106" />
          <g className="dg-tool">
            <rect x="132" y="108" width="76" height="30" rx="8" />
            <text x="170" y="127.5">Tool</text>
          </g>
          <FlowArrow head={head} d={`M224 ${MAIN_Y}H306`} k={1} />
          <Verdict />
        </>
      )}
      {design === 'cascade' && (
        <>
          <FlowArrow head={head} d={`M56 ${MAIN_Y}H96`} />
          <Judge x={100} y={38} w={84} h={48} label="SLM" sub="first" />
          <FlowArrow head={head} d={`M188 ${MAIN_Y}H306`} k={1} />
          <text className="dg-edge-label" x="246" y="54">confident</text>
          <FlowArrow head={head} className="dg-escalate" d="M142 88C142 122 160 124 196 124" k={2} />
          <text className="dg-edge-label dg-edge-escalate" x="126" y="144">uncertain</text>
          <Judge x={200} y={104} w={84} h={40} label="LLM" tone="big" />
          <FlowArrow head={head} className="dg-escalate" d="M288 124C316 124 326 106 326 81" k={3} />
          <Verdict />
        </>
      )}
      {design === 'panel' && (
        <>
          {[29, 62, 95].map((y, k) => (
            <FlowArrow head={head} key={y} d={`M56 ${MAIN_Y}C86 ${MAIN_Y} 96 ${y} 124 ${y}`} k={k * 0.3} />
          ))}
          <Judge x={128} y={14} w={80} h={30} label="Phi" tone="a" />
          <Judge x={128} y={47} w={80} h={30} label="LLaMA" tone="b" />
          <Judge x={128} y={80} w={80} h={30} label="Qwen" tone="c" />
          {[29, 62, 95].map((y, k) => (
            <path key={y} className="dg-flow dg-flow-plain" d={`M212 ${y}C228 ${y} 226 ${MAIN_Y} 240 ${MAIN_Y}`} pathLength="1" style={{ '--k': 1 + k * 0.3 }} />
          ))}
          {[29, 62, 95].map((y, k) => (
            <circle key={y} className={`dg-vote dg-vote-${k}`} cx="212" cy={y} r="4" style={{ '--dy': `${MAIN_Y - y}px`, '--k': k }} />
          ))}
          <g className="dg-tally">
            <rect x="240" y="48" width="48" height="28" rx="8" />
            <text x="264" y="66.5">vote</text>
          </g>
          <FlowArrow head={head} d={`M290 ${MAIN_Y}H306`} k={2} />
          <Verdict />
        </>
      )}
      {design === 'human' && (
        <>
          <FlowArrow head={head} d={`M56 ${MAIN_Y}H80`} />
          <Judge x={84} y={40} w={76} h={44} label="SLM" sub="triage" />
          <FlowArrow head={head} d={`M164 ${MAIN_Y}H190`} k={1} />
          <g className="dg-human">
            <rect x="194" y="36" width="96" height="52" rx="10" />
            <circle cx="214" cy="55" r="6" />
            <path d="M203 75c0-7 5-11 11-11s11 4 11 11" />
            <text x="262" y="67">Human</text>
          </g>
          <FlowArrow head={head} d={`M292 ${MAIN_Y}H306`} k={2} />
          <Verdict />
        </>
      )}
    </svg>
  )
}
