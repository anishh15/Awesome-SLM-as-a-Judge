import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Table2 } from 'lucide-react'
import site from '../lib/site.js'
import { useReveal } from '../lib/reveal.jsx'
import { CategoryDot } from './Badges.jsx'

// Counts per category and per year, computed by build-data.mjs from
// data/papers.yaml and checked there against App. M of the paper.
export default function CorpusChart() {
  const { corpus } = site
  const ref = useRef(null)
  useReveal(ref)
  const maxCat = Math.max(...corpus.categories.map((c) => c.count))
  const maxYear = Math.max(...corpus.years.map((y) => y.count))
  const [tip, setTip] = useState(null)
  const pct = (n) => Math.round((n / corpus.total) * 100)

  return (
    <div ref={ref} className="reveal corpus">
      <div className="card card-pad corpus-card">
        <div className="corpus-card-head">
          <h3 className="corpus-card-title">By category</h3>
        </div>
        <ul className="cat-bars">
          {corpus.categories.map((c, k) => (
            <li key={c.id} className={`cat-${c.id}`}>
              <Link to={`/papers?cat=${c.id}`} viewTransition className="cat-bar-row" aria-label={`${c.title}: ${c.count} works. Show them`}>
                <span className="cat-bar-label"><CategoryDot id={c.id} /> {c.title}</span>
                <span className="cat-bar-track">
                  <span className="cat-bar-fill" style={{ '--w': c.count / maxCat, '--k': k }} />
                </span>
                <span className="cat-bar-value tnum"><b>{c.count}</b> <span className="muted">{pct(c.count)}%</span></span>
                <ArrowRight size={14} className="cat-bar-arrow" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="card card-pad corpus-card">
        <div className="corpus-card-head">
          <h3 className="corpus-card-title">By year</h3>
          <p className="muted corpus-card-note">Year as given in the bibliography</p>
        </div>
        <div className="year-chart" role="img" aria-label={corpus.years.map((y) => `${y.bin}: ${y.count}`).join(', ')}>
          {corpus.years.map((y, k) => (
            <div
              key={y.bin}
              className="year-col"
              tabIndex={0}
              onPointerEnter={() => setTip(k)}
              onPointerLeave={() => setTip(null)}
              onFocus={() => setTip(k)}
              onBlur={() => setTip(null)}
              aria-label={`${y.bin}: ${y.count} works`}
            >
              <span className="year-value tnum">{y.count}</span>
              <span className="year-bar" style={{ '--h': y.count / maxYear, '--k': k }} />
              <span className="year-label">{y.bin.replace(' or earlier', '')}{y.bin.includes('earlier') && <small> or earlier</small>}</span>
              {tip === k && (
                <span className="year-tip" role="tooltip">
                  <strong className="tnum">{y.count} works</strong> in {y.bin}
                  {corpus.categories.map((c) => {
                    const n = c.years.find((x) => x.bin === y.bin).count
                    return n ? <span key={c.id} className={`year-tip-row cat-${c.id}`}><CategoryDot id={c.id} /> <b className="tnum">{n}</b> {c.title.toLowerCase()}</span> : null
                  })}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <details className="corpus-table-wrap">
        <summary><Table2 size={15} aria-hidden="true" /> Show the counts as a table</summary>
        <div className="table-wrap">
          <table className="paper-table corpus-table">
            <thead>
              <tr><th>Category</th><th className="num">Works</th>{corpus.years.map((y) => <th key={y.bin} className="num">{y.bin}</th>)}</tr>
            </thead>
            <tbody>
              {corpus.categories.map((c) => (
                <tr key={c.id}>
                  <td className="strong"><CategoryDot id={c.id} /> {c.title}</td>
                  <td className="num tnum"><b>{c.count}</b></td>
                  {c.years.map((y) => <td key={y.bin} className="num tnum">{y.count}</td>)}
                </tr>
              ))}
              <tr className="total-row">
                <td className="strong">All works</td>
                <td className="num tnum"><b>{corpus.total}</b></td>
                {corpus.years.map((y) => <td key={y.bin} className="num tnum"><b>{y.count}</b></td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
