import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, RotateCcw } from 'lucide-react'
import site, { loadPapers } from '../../lib/site.js'
import { reducedMotion } from '../../lib/motion.js'
import { CategoryDot } from '../Badges.jsx'

const CATS = site.corpus.categories
const BINS = site.corpus.years.map((y) => y.bin)
const catById = Object.fromEntries(CATS.map((c) => [c.id, c]))
const catOrder = Object.fromEntries(CATS.map((c, k) => [c.id, k]))
const shortBin = (bin) => bin.replace(' or earlier', '')
// the short name only when the title does not already start with it
const namePart = (p) => (p.name && !p.title.startsWith(p.name) ? p.name : null)

// Delays (ms) for the year-by-year assembly; the axis draws first.
const AXIS_MS = 200
const YEAR_MS = 220
const MARK_MS = 9

/** Order the works: year bin, then category, then year and title. */
function arrange(papers) {
  return BINS.map((bin) => papers
    .filter((p) => p.yearBin === bin)
    .sort((a, b) => catOrder[a.category] - catOrder[b.category] || a.year - b.year || a.title.localeCompare(b.title)))
}

/** One square per surveyed work, grouped by year and coloured by category. */
export default function CorpusTimeline({ title = 'Every work by year', className = '' }) {
  const [papers, setPapers] = useState(null)
  const [inView, setInView] = useState(false)
  const [run, setRun] = useState(0)
  const [tip, setTip] = useState(null)
  const [touchTip, setTouchTip] = useState(false)
  const [roving, setRoving] = useState(0)
  const [preview, setPreview] = useState(null)
  const [locked, setLocked] = useState(null)
  const rootRef = useRef(null)
  const tipRef = useRef(null)
  const markRefs = useRef([])
  const pointer = useRef('mouse')
  const navigate = useNavigate()

  // load the list shortly before the chart is reached, start once it is seen
  useEffect(() => {
    const el = rootRef.current
    if (!el) return undefined
    const near = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { loadPapers().then(setPapers); near.disconnect() }
    }, { rootMargin: '600px 0px' })
    const seen = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); seen.disconnect() }
    }, { threshold: 0.3 })
    near.observe(el)
    seen.observe(el)
    return () => { near.disconnect(); seen.disconnect() }
  }, [])

  const columns = useMemo(() => (papers ? arrange(papers) : null), [papers])
  const flat = useMemo(() => (columns ? columns.flat() : []), [columns])
  const counts = useMemo(() => BINS.map((bin, k) => (columns ? columns[k].length : site.corpus.years[k].count)), [columns])

  useEffect(() => {
    if (!import.meta.env.DEV || !columns) return
    const off = site.corpus.years.filter((y, k) => y.count !== counts[k])
    if (off.length) console.warn('CorpusTimeline: year counts differ from site.corpus', off)
  }, [columns, counts])

  const active = preview ?? locked
  const playing = inView && Boolean(columns)

  // place the tooltip above its square, inside the card
  const [tipPos, setTipPos] = useState(null)
  useLayoutEffect(() => {
    if (tip === null) { setTipPos(null); return }
    const root = rootRef.current
    const mark = markRefs.current[tip]
    const box = tipRef.current
    if (!root || !mark || !box) return
    const r = root.getBoundingClientRect()
    const m = mark.getBoundingClientRect()
    const w = box.offsetWidth
    const h = box.offsetHeight
    const left = Math.min(Math.max(m.left + m.width / 2 - r.left - w / 2, 8), r.width - w - 8)
    const above = m.top - r.top - h - 10
    setTipPos({ left, top: above >= 8 ? above : m.bottom - r.top + 10 })
  }, [tip, touchTip])

  // a tapped tooltip stays until the next tap elsewhere
  useEffect(() => {
    if (!touchTip) return undefined
    const close = (e) => { if (!rootRef.current?.querySelector('.tl-chart')?.contains(e.target)) { setTip(null); setTouchTip(false) } }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [touchTip])

  const focusMark = (i) => {
    const n = Math.max(0, Math.min(flat.length - 1, i))
    setRoving(n)
    markRefs.current[n]?.focus()
  }

  const onGridKey = (e) => {
    pointer.current = 'keyboard'
    const i = roving
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (step) { e.preventDefault(); focusMark(i + step) }
    else if (e.key === 'Home') { e.preventDefault(); focusMark(0) }
    else if (e.key === 'End') { e.preventDefault(); focusMark(flat.length - 1) }
    else if (e.key === 'Escape') setTip(null)
  }

  const onMarkClick = (e, i) => {
    if (pointer.current !== 'touch' || (touchTip && tip === i)) return
    e.preventDefault()
    setTip(i)
    setTouchTip(true)
  }

  const replay = useCallback(() => {
    setTip(null)
    setRun((r) => r + 1)
  }, [])

  const toggleCat = (id) => setLocked((c) => (c === id ? null : id))
  const motion = !reducedMotion()
  let index = -1

  return (
    <div ref={rootRef} className={`card tl${playing ? ' is-playing' : ''} ${className}`}>
      <div className="tl-head">
        <div>
          <h3 className="tl-title">{title}</h3>
          <p className="tl-note muted">Each square is one work. Year as given in the bibliography.</p>
        </div>
        {motion && (
          <button type="button" className="btn btn-ghost btn-sm tl-replay" onClick={replay} disabled={!playing}>
            <RotateCcw size={14} aria-hidden="true" /> Replay
          </button>
        )}
      </div>

      <ul className="tl-legend" aria-label="Highlight a category">
        {CATS.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className={`tl-chip cat-${c.id}${locked === c.id ? ' is-on' : ''}${active && active !== c.id ? ' is-dim' : ''}`}
              aria-pressed={locked === c.id}
              onClick={() => toggleCat(c.id)}
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') setPreview(c.id) }}
              onPointerLeave={() => setPreview(null)}
              onFocus={() => setPreview(c.id)}
              onBlur={() => setPreview(null)}
            >
              <CategoryDot id={c.id} /> {c.title} <span className="tl-chip-n tnum">{c.count}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="tl-chart">
        <div key={run} className="tl-grid" role="group" aria-label={`${flat.length || site.corpus.total} works by year. Use the arrow keys to move between them.`} onKeyDown={onGridKey}>
          {BINS.map((bin, y) => {
            const col = columns ? columns[y] : []
            const n = active ? col.filter((p) => p.category === active).length : counts[y]
            return (
              <div key={bin} className="tl-col" style={{ '--n': counts[y] }}>
                <p className="tl-count" style={{ '--d': `${AXIS_MS + y * YEAR_MS + counts[y] * MARK_MS + 300}ms` }}>
                  <b className={`tnum${active ? ` cat-${active} tl-count-cat` : ''}`}>{n}</b>
                  {active && <span className="muted tnum"> of {counts[y]}</span>}
                </p>
                <div className="tl-marks">
                  {col.map((p, k) => {
                    index += 1
                    const i = index
                    const cat = catById[p.category]
                    return (
                      <Link
                        key={p.key}
                        ref={(el) => { markRefs.current[i] = el }}
                        to={`/papers?paper=${encodeURIComponent(p.key)}`}
                        viewTransition
                        className={`tl-mark cat-${p.category}${active && active !== p.category ? ' is-dim' : ''}${tip === i ? ' is-tip' : ''}`}
                        style={{ '--d': `${AXIS_MS + y * YEAR_MS + k * MARK_MS}ms` }}
                        tabIndex={i === roving ? 0 : -1}
                        aria-label={`${namePart(p) ? `${namePart(p)}: ` : ''}${p.title} (${p.cite}). ${cat.title}, ${p.venue} ${p.year}.`}
                        onPointerDown={(e) => { pointer.current = e.pointerType }}
                        onPointerEnter={(e) => { if (e.pointerType !== 'touch') { setTouchTip(false); setTip(i) } }}
                        onPointerLeave={(e) => { if (e.pointerType !== 'touch') setTip((t) => (t === i ? null : t)) }}
                        onFocus={(e) => { if (e.target.matches(':focus-visible')) pointer.current = 'keyboard'; setRoving(i); setTip(i) }}
                        onBlur={() => setTip((t) => (t === i && !touchTip ? null : t))}
                        onClick={(e) => onMarkClick(e, i)}
                      >
                        <span className="tl-dot" aria-hidden="true" />
                      </Link>
                    )
                  })}
                </div>
                <div className="tl-base" style={{ '--d': `${y * 70}ms` }} aria-hidden="true"><span className="tl-tick" /></div>
                <Link className="tl-year" to={`/papers?year=${encodeURIComponent(bin)}`} viewTransition
                  aria-label={`${counts[y]} works from ${bin}. Show them in the paper list`}>
                  <span className="tl-year-label">{shortBin(bin)}{bin !== shortBin(bin) && <small> or earlier</small>}</span>
                </Link>
              </div>
            )
          })}
        </div>

        {tip !== null && flat[tip] && (
          <div ref={tipRef} className={`tl-tip${touchTip ? ' is-touch' : ''}`} aria-hidden={!touchTip}
            style={tipPos ? { left: tipPos.left, top: tipPos.top } : { visibility: 'hidden' }}>
            <span className={`tl-tip-cat cat-${flat[tip].category}`}><CategoryDot id={flat[tip].category} /> {catById[flat[tip].category].title}</span>
            <span className="tl-tip-title">{namePart(flat[tip]) && <b>{namePart(flat[tip])}: </b>}{flat[tip].title}</span>
            <span className="tl-tip-meta">{flat[tip].cite} · {flat[tip].venue} {flat[tip].year}</span>
            {touchTip
              ? <button type="button" className="tl-tip-open" onClick={() => navigate(`/papers?paper=${encodeURIComponent(flat[tip].key)}`)}>Show in the paper list <ArrowRight size={13} /></button>
              : <span className="tl-tip-hint">{pointer.current === 'keyboard' ? 'Press Enter' : 'Click'} to show it in the paper list</span>}
          </div>
        )}
      </div>

      <p className="tl-foot" aria-live="polite">
        {locked
          ? <Link className="card-more" to={`/papers?cat=${locked}`} viewTransition>Show the {catById[locked].count} works in {catById[locked].title.toLowerCase()} <ArrowRight size={15} /></Link>
          : <span className="muted">Pick a category to highlight it. Select a square to open the work.</span>}
      </p>

      <table className="visually-hidden">
        <caption>Works per year and category</caption>
        <thead>
          <tr><th scope="col">Year</th>{CATS.map((c) => <th key={c.id} scope="col">{c.title}</th>)}<th scope="col">All</th></tr>
        </thead>
        <tbody>
          {BINS.map((bin, y) => (
            <tr key={bin}>
              <th scope="row">{bin}</th>
              {CATS.map((c) => <td key={c.id}>{columns ? columns[y].filter((p) => p.category === c.id).length : c.years[y].count}</td>)}
              <td>{counts[y]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
