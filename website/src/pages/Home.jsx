import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Cpu, FileText, Library, Lightbulb, Puzzle, Quote } from 'lucide-react'
import site, { figureById, mb, pdfUrl } from '../lib/site.js'
import useTitle from '../lib/useTitle.js'
import { word, Word } from '../lib/words.js'
import { Reveal } from '../lib/reveal.jsx'
import Rich, { CapRich } from '../components/Rich.jsx'
import Counter from '../components/Counter.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import CopyButton from '../components/CopyButton.jsx'
import { ChallengeTag, GradeBadge, InsightTag, Tag } from '../components/Badges.jsx'
import { FigureCard } from '../components/Figure.jsx'
import { GitHubIcon, ScaleGlyph } from '../components/Icons.jsx'
import BibTeX from '../components/BibTeX.jsx'
import Clamp from '../components/Clamp.jsx'
import CorpusChart from '../components/CorpusChart.jsx'

export default function Home() {
  useTitle(null)
  const { paper, config, corpus } = site
  return (
    <>
      <Hero />

      <section className="section section-tight">
        <div className="container abstract-grid">
          <Reveal className="abstract">
            <p className="eyebrow">Abstract</p>
            <Clamp><p className="abstract-text"><Rich nodes={site.abstract} tags /></p></Clamp>
          </Reveal>
          <div className="abstract-side">
            <Reveal className="card card-pad quote-card" delay={80}>
              <Quote size={22} className="quote-icon" aria-hidden="true" />
              <p className="quote-label">The convergent finding</p>
              <p className="quote-text">{capitalize(site.keyFinding)}.</p>
              <p className="quote-source">{site.refs.conclusion.title}, §{site.refs.conclusion.num}</p>
            </Reveal>
            <Reveal className="card card-pad scope-card" delay={140}>
              <p className="quote-label">What counts as small</p>
              <p className="scope-value">{site.threshold}</p>
              <p className="scope-text">
                <CapRich nodes={site.definitionShort.clause} />.
              </p>
              <Link className="card-more" to="/survey/scope" viewTransition>The definition in full <ArrowRight size={15} /></Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="h-insights">
        <div className="container">
          <SectionHeading
            id="h-insights"
            eyebrow={`${Word(site.insights.length)} insights`}
            title="What the evidence says, and how strongly"
            lead={<>The titles and grades are the rows of Table {site.refs.insightsTable.num} in the survey.</>}
            action={<Link className="btn btn-secondary btn-sm" to="/insights" viewTransition>All insights <ArrowRight size={15} className="btn-arrow" /></Link>}
          />
          <div className="insight-grid">
            {site.insights.map((ins, k) => (
              <Reveal key={ins.id} delay={k * 60} className="insight-cell">
                <Link to={`/insights/${ins.id}`} viewTransition className="card card-link insight-card">
                  <div className="insight-card-top">
                    <InsightTag id={ins.id} />
                    <GradeBadge grade={ins.grade} compact />
                  </div>
                  <h3 className="insight-card-title">{ins.short}</h3>
                  <p className="insight-card-claim"><Rich nodes={ins.boundary} /></p>
                  <span className="card-more">Read the evidence <ArrowRight size={15} /></span>
                </Link>
              </Reveal>
            ))}
            <Reveal delay={site.insights.length * 60} className="insight-cell">
              <Link to="/insights" viewTransition className="card card-link insight-card insight-card-legend">
                <p className="quote-label">Evidence grades</p>
                <ul className="legend-list">
                  {site.gradeLegend.map((g) => (
                    <li key={g.grade}><GradeBadge grade={g.grade} /><span className="legend-text"><Rich nodes={g.text} /></span></li>
                  ))}
                </ul>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-taxonomy">
        <div className="container taxonomy-grid">
          <div className="taxonomy-text">
            <SectionHeading
              id="h-taxonomy"
              eyebrow="Taxonomy"
              title={`${Word(site.sections.filter(isDimension).length)} dimensions, from one judge to many`}
              lead={<>Each dimension of Figure {site.refs.taxonomy.num} is a section of the paper, and the tags show where each insight and challenge sits.</>}
            />
            <ol className="dimension-list">
              {site.sections.filter(isDimension).map((s, k) => (
                <Reveal as="li" key={s.num} delay={k * 50} className="dimension">
                  <span className="dimension-num">§{s.num}</span>
                  <span className="dimension-body">
                    <span className="dimension-title">{s.title}</span>
                    <span className="dimension-tags">
                      {[...s.tags, ...s.subsections.flatMap((ss) => ss.tags)].map((t) => <Tag key={t} id={t} size="sm" />)}
                      {s.subsections.length > 0 && <span className="muted dimension-count">{s.subsections.length} subsections</span>}
                    </span>
                  </span>
                </Reveal>
              ))}
            </ol>
            <Link className="btn btn-secondary btn-sm" to="/survey" viewTransition>Outline, scope and judge systems <ArrowRight size={15} className="btn-arrow" /></Link>
          </div>
          <Reveal className="taxonomy-figure" delay={100}>
            <FigureCard fig={figureById['1']} />
          </Reveal>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="h-corpus">
        <div className="container">
          <SectionHeading
            id="h-corpus"
            eyebrow="The corpus"
            title={<><Counter value={corpus.total} /> works in {word(corpus.categories.length)} categories</>}
            action={<Link className="btn btn-secondary btn-sm" to="/papers" viewTransition>Browse the list <ArrowRight size={15} className="btn-arrow" /></Link>}
          />
          <CorpusChart />
        </div>
      </section>

      <section className="section" aria-labelledby="h-challenges">
        <div className="container">
          <SectionHeading
            id="h-challenges"
            eyebrow="Open challenges"
            title={`${Word(site.challenges.length)} problems the field has not solved`}
            lead={<Rich nodes={site.challengesIntro} />}
            action={<Link className="btn btn-secondary btn-sm" to="/challenges" viewTransition>Challenges and deployment <ArrowRight size={15} className="btn-arrow" /></Link>}
          />
          <div className="challenge-strip">
            {site.challenges.map((c, k) => (
              <Reveal key={c.id} delay={k * 50}>
                <Link to={`/challenges/${c.id}`} viewTransition className="card card-link challenge-mini">
                  <ChallengeTag id={c.id} />
                  <span className="challenge-mini-title">{c.title}</span>
                  <ArrowRight size={15} className="challenge-mini-arrow" aria-hidden="true" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="h-cite">
        <div className="container cite-teaser">
          <div>
            <SectionHeading
              id="h-cite"
              eyebrow="Cite"
              title="Using the survey or the list?"
              lead={<>Please cite the survey. The same reference is in the repository’s <code className="inline-code">CITATION.cff</code>.</>}
            />
            <div className="btn-row">
              <a className="btn btn-primary" href={pdfUrl} target="_blank" rel="noopener"><FileText size={17} /> Read the paper <span className="btn-meta">PDF, {mb(paper.pdfBytes)}</span></a>
              <Link className="btn btn-secondary" to="/cite" viewTransition>More citation formats</Link>
            </div>
          </div>
          <Reveal delay={80}>
            <BibTeX text={config.bibtex} />
          </Reveal>
        </div>
      </section>
    </>
  )
}

const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s)
// The five dimensions of Fig. 1 are the sections between the introduction and the conclusion.
const isDimension = (s) => !/^(Introduction|Conclusion)$/.test(s.title)

function Hero() {
  const { paper, config, counts, corpus } = site
  const affOf = (a) => a.affiliations.join(',')
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
      </div>
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="pill-badge hero-in" style={{ '--i': 0 }}><span className="pill-dot" /> Survey · {config.venue}</p>
          <h1 className="hero-title hero-in" style={{ '--i': 1 }}>
            Small Language Models <span className="hero-title-accent">as Judges</span>
          </h1>
          <p className="hero-sub hero-in" style={{ '--i': 2 }}>A Survey</p>
          <p className="hero-question hero-in" style={{ '--i': 3 }}>
            <span className="hero-question-mark" aria-hidden="true"><ScaleGlyph size={20} /></span>
            <span><Rich nodes={site.question} /></span>
          </p>
          <div className="hero-authors hero-in" style={{ '--i': 4 }}>
            <p className="author-line">
              {paper.authors.map((a, k) => (
                <span key={a.name} className="author">
                  {a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer">{a.name}</a> : a.name}
                  <sup>{affOf(a)}</sup>
                  {k < paper.authors.length - 1 && <span className="author-sep" aria-hidden="true" />}
                </span>
              ))}
            </p>
            <p className="affil-line">
              {paper.affiliations.map((af) => (
                <span key={af.id}><sup>{af.id}</sup>{af.name}</span>
              ))}
            </p>
          </div>
          <div className="btn-row hero-in hero-ctas" style={{ '--i': 5 }}>
            <a className="btn btn-primary btn-lg" href={pdfUrl} target="_blank" rel="noopener">
              <FileText size={18} /> Read the paper <span className="btn-meta">PDF</span>
            </a>
            <Link className="btn btn-secondary btn-lg" to="/papers" viewTransition>
              <BookOpen size={18} /> Browse {corpus.total} works
            </Link>
            <a className="btn btn-ghost btn-lg" href={config.repo} target="_blank" rel="noopener noreferrer">
              <GitHubIcon size={18} /> GitHub
            </a>
          </div>
        </div>
      </div>
      <div className="container">
        <dl className="stat-row hero-in" style={{ '--i': 6 }}>
          <Stat icon={Library} value={<Counter value={counts.works} />} label="works surveyed" to="/papers" />
          <Stat icon={Cpu} value={site.threshold} label="parameter scope" to="/survey/scope" />
          <Stat icon={Lightbulb} value={<Counter value={counts.insights} />} label="evidence-graded insights" to="/insights" gold />
          <Stat icon={Puzzle} value={<Counter value={counts.challenges} />} label="open challenges" to="/challenges" />
        </dl>
      </div>
    </section>
  )
}

function Stat({ icon: Icon, value, label, to, gold = false }) {
  return (
    <Link to={to} viewTransition className={`stat${gold ? ' stat-gold' : ''}`}>
      <dt className="stat-label">{label}</dt>
      <dd className="stat-value">{value}</dd>
      <span className="stat-icon" aria-hidden="true"><Icon size={16} /></span>
    </Link>
  )
}
