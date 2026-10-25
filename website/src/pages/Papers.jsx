import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Braces, Check, Code2, Download, FileText, Search, X, Box, ScrollText } from 'lucide-react'
import site, { asset, loadPapers } from '../lib/site.js'
import useTitle from '../lib/useTitle.js'
import { word } from '../lib/words.js'
import { scrollBehavior } from '../lib/motion.js'
import PageHeader from '../components/PageHeader.jsx'
import CopyButton from '../components/CopyButton.jsx'
import { CategoryDot } from '../components/Badges.jsx'
import { figureLabel } from '../components/Figure.jsx'
import { figureHref } from '../components/figureLink.js'

const CATS = site.corpus.categories
const YEARS = site.corpus.years.map((y) => y.bin)
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const SORTS = { group: 'By category', new: 'Newest first', old: 'Oldest first', title: 'Title A to Z' }

export default function Papers() {
  useTitle('Paper list')
  const [papers, setPapers] = useState(null)
  useEffect(() => { loadPapers().then(setPapers) }, [])
  const { category: pathCat } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()

  const cat = params.get('cat') || pathCat || ''
  const year = params.get('year') || ''
  const code = params.get('code') === '1'
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'group'
  const focus = params.get('paper') || ''
  const urlQ = params.get('q') || ''
  const [q, setQ] = useState(urlQ)
  const dq = useDeferredValue(q)
  // the last ?q= this page wrote; any other change came from a link or history
  const wroteQ = useRef(urlQ)
  useEffect(() => {
    if (urlQ !== wroteQ.current) { wroteQ.current = urlQ; setQ(urlQ) }
  }, [urlQ])

  // /papers/:category is a shareable alias; turn it into ?cat= on /papers so
  // that All and Clear filters can reset the category like any other filter
  useEffect(() => {
    if (!pathCat) return
    const next = new URLSearchParams(params)
    if (!next.has('cat')) next.set('cat', pathCat)
    navigate({ pathname: '/papers', search: `?${next}` }, { replace: true, preventScrollReset: true })
  }, [pathCat]) // eslint-disable-line react-hooks/exhaustive-deps

  const apply = useCallback((next) => {
    setParams(next, { replace: true, preventScrollReset: true })
  }, [setParams])

  const update = useCallback((patch) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === '' || v === null || v === false || v === undefined) next.delete(k)
      else next.set(k, v === true ? '1' : v)
    }
    if (!('paper' in patch)) next.delete('paper')
    apply(next)
  }, [params, apply])

  // keep ?q= in step with the box, without a history entry per keystroke
  useEffect(() => {
    const t = setTimeout(() => { if (urlQ !== q) { wroteQ.current = q; update({ q }) } }, 250)
    return () => clearTimeout(t)
  }, [q]) // eslint-disable-line react-hooks/exhaustive-deps

  const terms = useMemo(() => norm(dq).split(/\s+/).filter(Boolean), [dq])
  const matchText = useCallback((p) => {
    if (!terms.length) return true
    const hay = norm(`${p.title} ${p.name || ''} ${p.authors.join(' ')} ${p.venue} ${p.venueFull || ''} ${p.year} ${p.key} ${p.cite || ''}`)
    return terms.every((t) => hay.includes(t))
  }, [terms])

  const base = useMemo(() => (papers || []).filter((p) => matchText(p) && (!code || p.links.code)), [papers, matchText, code])
  const shown = useMemo(() => {
    let list = base.filter((p) => (!cat || p.category === cat) && (!year || p.yearBin === year))
    if (sort === 'new') list = [...list].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
    if (sort === 'old') list = [...list].sort((a, b) => a.year - b.year || a.title.localeCompare(b.title))
    if (sort === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'group') list = [...list].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
    return list
  }, [base, cat, year, sort])

  const catCounts = useMemo(() => Object.fromEntries(CATS.map((c) => [c.id, base.filter((p) => p.category === c.id && (!year || p.yearBin === year)).length])), [base, year])
  const yearCounts = useMemo(() => Object.fromEntries(YEARS.map((y) => [y, base.filter((p) => p.yearBin === y && (!cat || p.category === cat)).length])), [base, cat])
  const total = papers ? papers.length : site.counts.works
  const filtered = Boolean(cat || year || code || terms.length)

  // ?paper= scrolls to one work and marks it
  useEffect(() => {
    if (!focus || !papers) return undefined
    const t = setTimeout(() => {
      const el = document.getElementById(`paper-${focus}`)
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3
      window.scrollTo({ top: Math.max(0, top), behavior: scrollBehavior() })
    }, 60)
    return () => clearTimeout(t)
  }, [focus, papers])

  const inputRef = useRef(null)
  const clearAll = () => { setQ(''); wroteQ.current = ''; apply(new URLSearchParams(sort !== 'group' ? { sort } : {})) }

  const bibOfShown = useMemo(() => shown.map((p) => p.bibtex).filter(Boolean).join('\n\n') + '\n', [shown])
  const downloadBib = () => {
    const blob = new Blob([bibOfShown], { type: 'application/x-bibtex' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filtered ? 'slm-judge-survey-selection.bib' : 'slm-judge-survey.bib'
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <>
      <PageHeader eyebrow="Paper list" title={`All ${site.counts.works} works the survey cites`}>
        <p>The works are grouped into {word(CATS.length)} categories, each with links to the paper and the code and its BibTeX.</p>
      </PageHeader>

      <div className="papers-toolbar">
        <div className="container toolbar-inner">
          <div className="search-field">
            <Search size={17} className="search-field-icon" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setQ('') }}
              placeholder="Search titles, authors, venues"
              aria-label="Search the paper list"
              className="search-input"
              autoComplete="off"
              spellCheck="false"
            />
            {q && <button type="button" className="search-clear" onClick={() => { setQ(''); inputRef.current?.focus() }} aria-label="Clear search"><X size={15} /></button>}
          </div>
          <div className="toolbar-row">
            <div className="chips" role="group" aria-label="Category">
              <button type="button" className={`fchip${!cat ? ' is-on' : ''}`} aria-pressed={!cat} onClick={() => update({ cat: '' })}>
                All <span className="fchip-n tnum">{CATS.reduce((a, c) => a + catCounts[c.id], 0)}</span>
              </button>
              {CATS.map((c) => (
                <button key={c.id} type="button" className={`fchip cat-${c.id}${cat === c.id ? ' is-on' : ''}`} aria-pressed={cat === c.id}
                  onClick={() => update({ cat: cat === c.id ? '' : c.id })} disabled={!catCounts[c.id] && cat !== c.id}>
                  <CategoryDot id={c.id} /> {c.title} <span className="fchip-n tnum">{catCounts[c.id]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="toolbar-row toolbar-row-2">
            <div className="chips" role="group" aria-label="Year">
              <button type="button" className={`fchip fchip-sm${!year ? ' is-on' : ''}`} aria-pressed={!year} onClick={() => update({ year: '' })}>Any year</button>
              {YEARS.map((y) => (
                <button key={y} type="button" className={`fchip fchip-sm${year === y ? ' is-on' : ''}`} aria-pressed={year === y}
                  onClick={() => update({ year: year === y ? '' : y })} disabled={!yearCounts[y] && year !== y}>
                  {y} <span className="fchip-n tnum">{yearCounts[y]}</span>
                </button>
              ))}
              <button type="button" className={`fchip fchip-sm${code ? ' is-on' : ''}`} aria-pressed={code} onClick={() => update({ code: !code })}>
                {code ? <Check size={13} /> : <Code2 size={13} />} With code
              </button>
            </div>
            <div className="toolbar-end">
              <label className="select">
                <span className="visually-hidden">Order</span>
                <select value={sort} onChange={(e) => update({ sort: e.target.value === 'group' ? '' : e.target.value })}>
                  {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      <section className="section section-tight papers-section">
        <div className="container">
          <div className="results-bar">
            <p className="results-count" aria-live="polite">
              <span>{papers ? <>Showing <b className="tnum">{shown.length}</b> of <span className="tnum">{total}</span> works</> : 'Loading the list…'}</span>
              {filtered && <button type="button" className="link-btn" onClick={clearAll}>Clear filters</button>}
            </p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={downloadBib} disabled={!shown.length}>
              <Download size={15} /> BibTeX of {filtered ? 'these' : 'all'} {shown.length}
            </button>
          </div>

          {papers && shown.length === 0 && (
            <div className="empty">
              <p className="empty-title">No work matches these filters.</p>
              <button type="button" className="btn btn-secondary btn-sm" onClick={clearAll}>Clear filters</button>
            </div>
          )}

          {papers && sort === 'group' && CATS.filter((c) => shown.some((p) => p.category === c.id)).map((c) => (
            <CategoryBlock key={c.id} c={c} papers={shown.filter((p) => p.category === c.id)} terms={terms} focus={focus} />
          ))}
          {papers && sort !== 'group' && (
            <ol className="paper-list">
              {shown.map((p) => <PaperCard key={p.key} p={p} terms={terms} focus={focus} showCat />)}
            </ol>
          )}
          {!papers && <div className="paper-skeleton" aria-hidden="true">{Array.from({ length: 6 }, (_, k) => <div key={k} className="skeleton-card" />)}</div>}
        </div>
      </section>
    </>
  )
}

function CategoryBlock({ c, papers, terms, focus }) {
  const location = useLocation()
  const fig = c.figure ? site.figures.find((f) => f.stem === c.figure) : null
  return (
    <section className={`cat-block cat-${c.id}`} aria-labelledby={`cat-${c.id}`}>
      <header className="cat-head">
        <div className="cat-head-main">
          <h2 id={`cat-${c.id}`} className="cat-title"><CategoryDot id={c.id} /> {c.title} <span className="cat-count tnum">{papers.length}{papers.length !== c.count ? ` of ${c.count}` : ''}</span></h2>
          <p className="cat-summary">{c.summary} <span className="muted">Survey: {c.where}</span></p>
        </div>
        {fig && <Link className="cat-fig-link" to={figureHref(location, fig.id)} state={{ figOpen: true }} preventScrollReset>{figureLabel(fig)}</Link>}
      </header>
      {c.groups.filter((g) => papers.some((p) => p.group === g.id)).map((g) => {
        const list = papers.filter((p) => p.group === g.id)
        return (
          <div key={g.id} className="group-block">
            <h3 className="group-title">{g.title} <span className="group-count tnum">{list.length}</span></h3>
            <ol className="paper-list">
              {list.map((p) => <PaperCard key={p.key} p={p} terms={terms} focus={focus} />)}
            </ol>
          </div>
        )
      })}
    </section>
  )
}

function host(url) {
  try {
    const h = new URL(url).hostname.replace(/^www\./, '')
    if (h.includes('aclanthology')) return 'ACL Anthology'
    if (h.includes('openreview')) return 'OpenReview'
    if (h.includes('arxiv')) return 'arXiv'
    if (h.includes('nature.com')) return 'Nature'
    if (h.includes('github')) return 'GitHub'
    if (h.includes('huggingface')) return 'Hugging Face'
    return h
  } catch { return 'Link' }
}

function Highlight({ text, terms }) {
  if (!terms.length) return text
  const n = norm(text)
  const marks = []
  for (const t of terms) {
    let i = n.indexOf(t)
    while (i >= 0) { marks.push([i, i + t.length]); i = n.indexOf(t, i + t.length) }
  }
  if (!marks.length) return text
  marks.sort((a, b) => a[0] - b[0])
  const out = []
  let pos = 0
  for (const [a, b] of marks) {
    if (a < pos) continue
    if (a > pos) out.push(text.slice(pos, a))
    out.push(<mark key={a}>{text.slice(a, b)}</mark>)
    pos = b
  }
  out.push(text.slice(pos))
  return out
}

function sectionHref(s) {
  if (s.startsWith('§')) return asset(`${site.config.pdf}#section.${s.slice(1)}`)
  const m = /^App\. ([A-Z])/.exec(s)
  return m ? asset(`${site.config.pdf}#appendix.${m[1]}`) : null
}

function PaperCard({ p, terms, focus, showCat = false }) {
  const [bib, setBib] = useState(false)
  const isFocus = focus === p.key
  const authors = p.authors.length > 4 ? `${p.authors.slice(0, 3).join(', ')} et al.` : `${p.authors.join(', ')}${p.etAl ? ' et al.' : ''}`
  const cat = CATS.find((c) => c.id === p.category)
  return (
    <li id={`paper-${p.key}`} className={`paper${isFocus ? ' is-focus' : ''}`}>
      <div className="paper-main">
        <div className="paper-top">
          {p.name && <span className="paper-name"><Highlight text={p.name} terms={terms} /></span>}
          <span className="paper-venue">{p.venue} {p.year}</span>
          {showCat && cat && <span className={`paper-cat cat-${cat.id}`}><CategoryDot id={cat.id} /> {cat.title}</span>}
        </div>
        <h4 className="paper-title">
          <a href={p.links.paper} target="_blank" rel="noopener noreferrer"><Highlight text={p.title} terms={terms} /></a>
        </h4>
        <p className="paper-authors" title={p.authors.join(', ') + (p.etAl ? ', et al.' : '')}><Highlight text={authors} terms={terms} /></p>
        {p.sections.length > 0 && (
          <p className="paper-cited">
            <span className="paper-cited-label">Cited in</span>
            {p.sections.map((s) => {
              const href = sectionHref(s)
              return href ? <a key={s} className="sec-chip" href={href} target="_blank" rel="noopener" title={`Open ${s} in the PDF`}>{s}</a> : <span key={s} className="sec-chip">{s}</span>
            })}
          </p>
        )}
        {p.note && <p className="paper-note">{p.note}</p>}
      </div>
      <div className="paper-actions">
        <a className="plink plink-primary" href={p.links.paper} target="_blank" rel="noopener noreferrer"><FileText size={14} /> {host(p.links.paper)} <ArrowUpRight size={12} className="plink-arrow" /></a>
        {p.links.arxiv && <a className="plink" href={p.links.arxiv} target="_blank" rel="noopener noreferrer"><ScrollText size={14} /> arXiv <ArrowUpRight size={12} className="plink-arrow" /></a>}
        {p.links.code && <a className="plink" href={p.links.code} target="_blank" rel="noopener noreferrer"><Code2 size={14} /> Code <ArrowUpRight size={12} className="plink-arrow" /></a>}
        {p.links.model && <a className="plink" href={p.links.model} target="_blank" rel="noopener noreferrer"><Box size={14} /> Model <ArrowUpRight size={12} className="plink-arrow" /></a>}
        <button type="button" className={`plink${bib ? ' is-on' : ''}`} aria-expanded={bib} onClick={() => setBib((b) => !b)}><Braces size={14} /> BibTeX</button>
      </div>
      {bib && (
        <div className="paper-bib">
          <div className="paper-bib-head"><span className="muted">{p.cite}</span><CopyButton text={p.bibtex} label="Copy" /></div>
          <pre className="code-block">{p.bibtex}</pre>
        </div>
      )}
    </li>
  )
}

