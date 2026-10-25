import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, CornerDownLeft, FileText, Image, Lightbulb, Puzzle, Search, StickyNote } from 'lucide-react'
import site, { asset, loadPapers } from '../lib/site.js'
import { figureLabel } from './Figure.jsx'
import { NAV } from './Header.jsx'

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function staticItems() {
  const items = []
  for (const n of [...NAV, { to: '/cite', label: 'Cite' }]) items.push({ group: 'Pages', icon: BookOpen, title: n.label, to: n.to })
  for (const i of site.insights) items.push({ group: 'Insights', icon: Lightbulb, title: `${i.id} · ${i.short}`, sub: `${i.grade}. ${i.statement}`, to: `/insights/${i.id}` })
  for (const c of site.challenges) items.push({ group: 'Challenges', icon: Puzzle, title: `${c.id} · ${c.title}`, to: `/challenges/${c.id}` })
  for (const f of site.figures) items.push({ group: 'Figures', icon: Image, title: `${figureLabel(f)} · ${f.title}`, sub: f.where?.label, fig: f.id })
  for (const s of [...site.sections, ...site.appendices]) {
    const label = s.appendix ? `Appendix ${s.num}` : `§${s.num}`
    items.push({ group: 'In the paper (PDF)', icon: FileText, title: `${label} · ${s.title}`, href: asset(s.href) })
    if (!s.appendix) for (const ss of s.subsections) items.push({ group: 'In the paper (PDF)', icon: FileText, title: `§${ss.num} · ${ss.title}`, href: asset(ss.href), minor: true })
  }
  return items
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const [papers, setPapers] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const lastFocus = useRef(null)
  const base = useMemo(staticItems, [])

  const show = useCallback(() => {
    lastFocus.current = document.activeElement
    setOpen(true)
    loadPapers().then(setPapers)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open ? setOpen(false) : show() }
      else if (e.key === '/' && !typing && !open) { e.preventDefault(); show() }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('site:search', show)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('site:search', show) }
  }, [open, show])

  useEffect(() => {
    if (open) {
      setQ(''); setActive(0)
      const root = document.documentElement
      root.style.setProperty('--sbw', `${window.innerWidth - root.clientWidth}px`)
      root.classList.add('is-locked')
      requestAnimationFrame(() => inputRef.current?.focus())
      return () => root.classList.remove('is-locked')
    }
    return undefined
  }, [open])

  const results = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean)
    let items = base
    if (papers) {
      items = items.concat(papers.map((p) => ({
        group: 'Papers', icon: StickyNote, title: p.title,
        sub: [p.name, p.cite, p.venue].filter(Boolean).join(' · '),
        hay: `${p.title} ${p.name || ''} ${p.authors.join(' ')} ${p.venue} ${p.year} ${p.key}`,
        to: `/papers?paper=${encodeURIComponent(p.key)}`,
      })))
    }
    if (!terms.length) return items.filter((i) => i.group === 'Pages' || i.group === 'Insights' || i.group === 'Challenges')
    const scored = []
    for (const it of items) {
      const hay = norm(it.hay || `${it.title} ${it.sub || ''}`)
      if (!terms.every((t) => hay.includes(t))) continue
      const title = norm(it.title)
      let score = terms.reduce((a, t) => a + (title.includes(t) ? 2 : 1) + (title.startsWith(t) ? 2 : 0), 0)
      if (it.minor) score -= 1
      scored.push({ it, score })
    }
    scored.sort((a, b) => b.score - a.score)
    const perGroup = {}
    return scored.map((s) => s.it).filter((it) => { perGroup[it.group] = (perGroup[it.group] || 0) + 1; return perGroup[it.group] <= 7 })
  }, [q, base, papers])

  const grouped = useMemo(() => {
    const order = ['Pages', 'Insights', 'Challenges', 'Figures', 'Papers', 'In the paper (PDF)']
    return order.map((g) => ({ g, items: results.filter((r) => r.group === g) })).filter((x) => x.items.length)
  }, [results])
  const flat = grouped.flatMap((x) => x.items)

  useEffect(() => { setActive(0) }, [q])
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const close = () => { setOpen(false); requestAnimationFrame(() => lastFocus.current?.focus?.({ preventScroll: true })) }
  const choose = (it) => {
    setOpen(false)
    if (!it) return
    if (it.href) { window.open(it.href, '_blank', 'noopener'); return }
    if (it.fig) {
      const p = new URLSearchParams(location.search); p.set('fig', it.fig)
      navigate({ pathname: location.pathname, search: `?${p}` }, { state: { figOpen: true }, preventScrollReset: true })
      return
    }
    navigate(it.to, { viewTransition: true })
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(flat.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); choose(flat[active]) }
    // the input is the dialog's only focus stop (options use aria-activedescendant),
    // so Tab stays on it instead of reaching the page behind the modal
    else if (e.key === 'Tab') { e.preventDefault(); inputRef.current?.focus() }
  }

  if (!open) return null
  let idx = -1
  return (
    <div className="palette" role="dialog" aria-modal="true" aria-label="Search the site">
      <div className="palette-backdrop" onClick={close} />
      <div className="palette-panel" onKeyDown={onKeyDown}>
        <div className="palette-input-row">
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            className="palette-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${site.counts.works} works, insights, figures and sections`}
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={flat[active] ? `pal-${active}` : undefined}
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="kbd">Esc</kbd>
        </div>
        <div className="palette-list" id="palette-list" role="listbox" ref={listRef}>
          {grouped.length === 0 && <p className="palette-empty">Nothing matches “{q}”.</p>}
          {grouped.map(({ g, items }) => (
            <div key={g} className="palette-group" role="group" aria-label={g}>
              <p className="palette-group-title">{g}</p>
              {items.map((it) => {
                idx += 1
                const k = idx
                const Icon = it.icon
                return (
                  <div
                    key={`${g}-${it.title}-${k}`}
                    id={`pal-${k}`}
                    role="option"
                    aria-selected={k === active}
                    data-active={k === active}
                    className="palette-item"
                    onMouseMove={() => setActive(k)}
                    onClick={() => choose(it)}
                  >
                    <Icon size={16} className="palette-icon" aria-hidden="true" />
                    <span className="palette-text">
                      <span className="palette-title">{it.title}</span>
                      {it.sub && <span className="palette-sub">{it.sub}</span>}
                    </span>
                    {k === active && <CornerDownLeft size={14} className="palette-enter" aria-hidden="true" />}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="palette-foot">
          <span><kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd> move</span>
          <span><kbd className="kbd">↵</kbd> open</span>
          <span><kbd className="kbd">/</kbd> or <kbd className="kbd">⌘K</kbd> search</span>
        </div>
      </div>
    </div>
  )
}
