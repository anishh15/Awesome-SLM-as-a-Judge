import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadPapers } from '../../lib/site.js'

// A slow ribbon of the judges and benchmarks named in the survey; each opens the paper list.
const KEEP = new Set(['judge-systems', 'benchmarks-metrics'])

export default function SystemsTicker() {
  const [items, setItems] = useState([])
  useEffect(() => {
    let live = true
    loadPapers().then((ps) => {
      if (live) setItems(ps.filter((p) => p.name && KEEP.has(p.category)).map((p) => ({ name: p.name, cat: p.category, key: p.key })))
    })
    return () => { live = false }
  }, [])
  if (!items.length) return <div className="ticker ticker-empty" aria-hidden="true" />

  const row = (hidden) => (
    <ul className="ticker-row" aria-hidden={hidden || undefined}>
      {items.map((it) => (
        <li key={it.key} className={`cat-${it.cat}`}>
          <Link to={`/papers?q=${encodeURIComponent(it.name)}`} viewTransition tabIndex={-1} className="ticker-item">
            <span className="ticker-dot" />{it.name}
          </Link>
        </li>
      ))}
    </ul>
  )
  return (
    <div className="ticker" role="region" aria-label="Judges and benchmarks named in the survey">
      <span className="ticker-label">Named in the survey</span>
      <div className="ticker-viewport">
        <div className="ticker-track" style={{ '--n': items.length }}>
          {row(false)}
          {row(true)}
        </div>
      </div>
      <Link to="/papers" viewTransition className="ticker-all">All {items.length}</Link>
    </div>
  )
}
