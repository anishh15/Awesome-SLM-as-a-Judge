import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import site, { asset, figureById } from '../lib/site.js'
import useTitle from '../lib/useTitle.js'
import { word, Word } from '../lib/words.js'
import { scrollToId } from '../lib/motion.js'
import { Reveal } from '../lib/reveal.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Rich, { CapRich } from '../components/Rich.jsx'
import { Tag } from '../components/Badges.jsx'
import { FigureCard } from '../components/Figure.jsx'

const PARTS = ['outline', 'scope', 'systems']

export default function Survey() {
  useTitle('The survey')
  const { part } = useParams()
  const first = useRef(true)
  useEffect(() => {
    if (part && PARTS.includes(part)) {
      const t = setTimeout(() => scrollToId(part, first.current ? 'auto' : undefined), first.current ? 40 : 0)
      first.current = false
      return () => clearTimeout(t)
    }
    first.current = false
    return undefined
  }, [part])

  const { judgeSystems, refs } = site
  const tax = figureById[refs.taxonomy.num]

  return (
    <>
      <PageHeader eyebrow="The survey" title="How the survey is organized"
        aside={
          <nav className="jump-links" aria-label="On this page">
            <Link to="/survey/outline" preventScrollReset>Outline</Link>
            <Link to="/survey/scope" preventScrollReset>Scope</Link>
            <Link to="/survey/systems" preventScrollReset>Judge systems</Link>
          </nav>
        }>
        <p>This page gives the outline of the paper, what counts as a small model and the judge systems of Table {refs.judgeSystemsTable.num}.</p>
      </PageHeader>

      <section className="section section-tight" id="outline" aria-labelledby="h-outline">
        <div className="container survey-tax">
          <div>
            <SectionHeading id="h-outline" eyebrow="Taxonomy" title={`${Word(site.sections.length)} sections and ${word(site.appendices.length)} appendices`}
              lead={<>Tags mark where each insight and challenge sits, as in Figure {refs.taxonomy.num}.</>} />
            <div className="outline-cols">
              <ol className="outline" aria-label="Main text">
                {site.sections.map((s) => (
                  <li key={s.num} className="outline-item">
                    <a className="outline-head" href={asset(s.href)} target="_blank" rel="noopener">
                      <span className="outline-num">§{s.num}</span>
                      <span className="outline-title">{s.title}</span>
                      <span className="outline-tags">{s.tags.map((t) => <Tag key={t} id={t} size="sm" />)}</span>
                    </a>
                    {s.subsections.length > 0 && (
                      <ol className="outline-sub">
                        {s.subsections.map((ss) => (
                          <li key={ss.num}>
                            <a href={asset(ss.href)} target="_blank" rel="noopener">
                              <span className="outline-subnum">{ss.num}</span>
                              <span>{ss.title}</span>
                              <span className="outline-tags">{ss.tags.map((t) => <Tag key={t} id={t} size="sm" />)}</span>
                            </a>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                ))}
              </ol>
              <ol className="outline outline-app" aria-label="Appendices">
                {site.appendices.map((s) => (
                  <li key={s.num} className="outline-item">
                    <a className="outline-head" href={asset(s.href)} target="_blank" rel="noopener">
                      <span className="outline-num">{s.num}</span>
                      <span className="outline-title">{s.title}</span>
                      <span className="outline-count muted">{s.subsections.length || ''}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <Reveal className="survey-tax-fig">
            <FigureCard fig={tax} />
          </Reveal>
        </div>
      </section>

      <section className="section" id="scope" aria-labelledby="h-scope">
        <div className="container container-narrow">
          <SectionHeading id="h-scope" eyebrow={`Scope · ${site.threshold}`} title="What “small” means in the survey" />
          <Reveal className="definition card card-pad">
            <p className="definition-lead"><CapRich nodes={site.definitionShort.clause} />.</p>
            <p className="definition-moe"><Rich nodes={site.definitionShort.moe} /></p>
            <details className="from-paper">
              <summary><span>Read the full definition</span><ChevronDown size={16} className="summary-arrow" aria-hidden="true" /></summary>
              <div className="from-paper-body">
                {site.definition.map((p, k) => <p key={k}><Rich nodes={p} /></p>)}
              </div>
            </details>
            <p className="muted definition-src">
              From <a className="link" href={asset(site.definitionWhere.href)} target="_blank" rel="noopener">§{site.definitionWhere.num} {site.definitionWhere.title}</a>.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section section-alt" id="systems" aria-labelledby="h-systems">
        <div className="container">
          <SectionHeading id="h-systems" eyebrow={`Table ${refs.judgeSystemsTable.num}`} title="Selected SLM judge systems"
            lead={<>Each system name links to its entry in the paper list.</>} />
          <Reveal>
            <div className="table-wrap">
              <table className="paper-table systems-table">
                <thead><tr>{judgeSystems.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {judgeSystems.rows.map((r, k) => (
                    <tr key={k}>
                      {r.cells.map((c, j) => (
                        <td key={j} className={j === 0 ? 'strong' : j === r.cells.length - 1 ? 'center' : ''}>
                          {j === 0 && r.key ? <Link className="link" to={`/papers?paper=${r.key}`} viewTransition><Rich nodes={c} /></Link> : <Rich nodes={c} />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="table-caption"><strong>Table {refs.judgeSystemsTable.num}.</strong> <Rich nodes={judgeSystems.caption} /></p>
          </Reveal>
        </div>
      </section>

    </>
  )
}
