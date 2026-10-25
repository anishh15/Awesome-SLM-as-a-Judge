import { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, FileText } from 'lucide-react'
import site, { asset, figureById } from '../lib/site.js'
import useTitle from '../lib/useTitle.js'
import useScrollSpy from '../lib/useScrollSpy.js'
import { list, word } from '../lib/words.js'
import { scrollToId } from '../lib/motion.js'
import { Reveal } from '../lib/reveal.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Rich from '../components/Rich.jsx'
import { GradeBadge, InsightTag } from '../components/Badges.jsx'
import { FigureCard, figureLabel } from '../components/Figure.jsx'


// below 1080px the insight rail is a sticky bar under the header
const railOffset = () => (window.innerWidth <= 1080 ? 136 : 84)

export default function Insights() {
  useTitle('Five insights')
  const { id } = useParams()
  const navigate = useNavigate()
  const ids = [...site.insights.map((i) => `insight-${i.id}`), ...(site.finding ? ['finding'] : [])]
  const active = useScrollSpy(ids)
  const first = useRef(true)

  // /insights/I3 scrolls to I3: at once on arrival, smoothly afterwards.
  useEffect(() => {
    if (!id) { first.current = false; return undefined }
    const t = setTimeout(() => {
      scrollToId(`insight-${id}`, first.current ? 'auto' : undefined, railOffset())
      first.current = false
    }, first.current ? 40 : 0)
    return () => clearTimeout(t)
  }, [id])

  const go = (e, iid) => {
    e.preventDefault()
    if (`/insights/${iid}` === window.location.hash.slice(1)) scrollToId(`insight-${iid}`, undefined, railOffset())
    else navigate(`/insights/${iid}`, { replace: true, preventScrollReset: true })
  }
  const t2 = site.refs.insightsTable.num
  const trends = site.refs.trends.num

  return (
    <>
      <PageHeader eyebrow="Five insights" title="What the surveyed work agrees on">
        <p>Each insight is shown with its evidence grade, its limits from Table {t2} and its panel of Figure {trends}.</p>
      </PageHeader>

      <section className="section section-tight">
        <div className="container">
          <div className="grades">
            {site.gradeLegend.map((g, k) => (
              <Reveal key={g.grade} delay={k * 60} className="card card-pad grade-card">
                <GradeBadge grade={g.grade} />
                <p className="grade-card-text"><Rich nodes={g.text} />.</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="grade-note"><p><Rich nodes={site.independence} /></p></Reveal>

          <Reveal className="glance">
            <details className="glance-details">
            <summary className="glance-title">The {word(site.counts.insights)} insights at a glance <span className="muted">· Table {t2}</span><ChevronDown size={18} className="summary-arrow" aria-hidden="true" /></summary>
            <div className="table-wrap glance-table">
              <table className="paper-table">
                <thead>
                  <tr><th>Insight</th><th>Evidence</th><th>Main support</th><th>Boundary conditions</th><th>Design</th></tr>
                </thead>
                <tbody>
                  {site.insights.map((i) => (
                    <tr key={i.id}>
                      <td className="strong glance-first">
                        <a href={`#/insights/${i.id}`} onClick={(e) => go(e, i.id)} className="glance-insight">
                          <InsightTag id={i.id} size="sm" /> <span>{i.short}</span>
                        </a>
                      </td>
                      <td><span className="sc">{i.grade}</span>: <Rich nodes={i.evidence} /></td>
                      <td><Rich nodes={i.support} /></td>
                      <td><Rich nodes={i.boundary} /></td>
                      <td><Rich nodes={i.design} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="table-caption"><strong>Table {t2}.</strong> <Rich nodes={site.insightsCaption} /></p>
            </details>
          </Reveal>
        </div>
      </section>

      <section className="section section-tight insights-body">
        <div className="container insights-layout">
          <nav className="insight-rail" aria-label="Insights on this page">
            <p className="rail-title">On this page</p>
            {site.insights.map((i) => (
              <a key={i.id} href={`#/insights/${i.id}`} onClick={(e) => go(e, i.id)}
                className={`rail-link${active === `insight-${i.id}` ? ' is-active' : ''}`}
                aria-current={active === `insight-${i.id}` ? 'location' : undefined}>
                <InsightTag id={i.id} size="sm" />
                <span>{i.short}</span>
              </a>
            ))}
            {site.finding && (
              <a href="#/insights" onClick={(e) => { e.preventDefault(); scrollToId('finding', undefined, railOffset()) }}
                className={`rail-link${active === 'finding' ? ' is-active' : ''}`}>
                <span className="tag tag-sm tag-finding">§{site.finding.subsection?.num || site.finding.section?.num}</span>
                <span>A related finding</span>
              </a>
            )}
          </nav>

          <div className="insight-list">
            {site.insights.map((i) => <InsightBlock key={i.id} ins={i} trends={trends} />)}
            {site.finding && <Finding f={site.finding} />}
          </div>
        </div>
      </section>
    </>
  )
}

function Where({ s }) {
  if (!s) return null
  return (
    <a className="where-link" href={asset(`${site.config.pdf}#${s.dest}`)} target="_blank" rel="noopener"
      title="Opens the section in the PDF">
      <FileText size={13} aria-hidden="true" /> §{s.num} {s.title}
    </a>
  )
}

function FromPaper({ children }) {
  return (
    <details className="from-paper">
      <summary>
        <span>Read the paragraph in the survey</span>
        <ChevronDown size={16} className="summary-arrow" aria-hidden="true" />
      </summary>
      <div className="from-paper-body">{children}</div>
    </details>
  )
}

function InsightBlock({ ins, trends }) {
  const fig = ins.figure ? figureById[ins.figure] : null
  const withPanels = site.insights.filter((i) => i.figure).map((i) => i.id)
  const mast = site.figures.find((f) => /MAST/.test(f.title))
  return (
    <article id={`insight-${ins.id}`} className="insight-block">
      <Reveal className="insight-head">
        <div className="insight-head-row">
          <InsightTag id={ins.id} size="lg" />
          <div className="insight-head-text">
            <p className="insight-kicker"><Where s={ins.subsection || ins.section} /></p>
            <h2 className="insight-title">{ins.short}</h2>
          </div>
        </div>
        <GradeBadge grade={ins.grade} detail={<Rich nodes={ins.evidence} />} />
      </Reveal>

      <div className="insight-grid-body">
        <div className="insight-main">
          <Reveal as="blockquote" className="claim">
            <p className="claim-title">{ins.statement}</p>
            <p className="claim-text"><Rich nodes={ins.claim} /></p>
          </Reveal>
          <Reveal className="facts" delay={60}>
            <div className="fact"><p className="fact-label">Main support</p><p><Rich nodes={ins.support} /></p></div>
            <div className="fact"><p className="fact-label">Boundary conditions</p><p><Rich nodes={ins.boundary} /></p></div>
            <div className="fact"><p className="fact-label">Design</p><p><Rich nodes={ins.design} /></p></div>
          </Reveal>
          <Reveal delay={80}>
            <FromPaper>
              <p><span className="sc">{ins.statement}.</span> [<span className="sc">{ins.grade}</span>: {ins.detail}] <em><Rich nodes={ins.claim} /></em> <Rich nodes={ins.body} /></p>
              {ins.takeaway && <p className="takeaway"><Rich nodes={ins.takeaway} /></p>}
            </FromPaper>
          </Reveal>
        </div>
        <Reveal className="insight-fig" delay={100}>
          {fig ? (
            <FigureCard fig={fig} showTitle={false} caption={<span className="fig-sub"><Rich nodes={fig.subcaption} /></span>} />
          ) : (
            <div className="insight-nofig">
              <p>
                Figure {trends} has panels for {list(withPanels)}. The survey discusses {ins.id} in <Where s={ins.section} />.
              </p>
              {mast && (
                <p>
                  <Link className="link" to={`?fig=${mast.id}`} state={{ figOpen: true }} preventScrollReset>{figureLabel(mast)}</Link>{' '}
                  shows the {mast.title.charAt(0).toLowerCase() + mast.title.slice(1)} ({mast.where.label}).
                </p>
              )}
            </div>
          )}
        </Reveal>
      </div>
    </article>
  )
}

function Finding({ f }) {
  return (
    <article id="finding" className="insight-block finding-block">
      <Reveal className="insight-head">
        <div className="insight-head-text">
          <p className="insight-kicker">A related finding · <Where s={f.subsection || f.section} /></p>
          <h2 className="insight-title finding-title">{f.statement}</h2>
        </div>
        <GradeBadge grade={f.grade} detail={f.detail} />
      </Reveal>
      <Reveal as="blockquote" className="claim" delay={60}>
        <p className="claim-text"><Rich nodes={f.claim} /></p>
      </Reveal>
      <Reveal delay={80}>
        <FromPaper><p><Rich nodes={f.body} /></p></FromPaper>
      </Reveal>
    </article>
  )
}
