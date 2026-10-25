import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, FileText } from 'lucide-react'
import site, { asset, figureById, insightById } from '../lib/site.js'
import useTitle from '../lib/useTitle.js'
import { Word } from '../lib/words.js'
import { scrollToId } from '../lib/motion.js'
import { Reveal } from '../lib/reveal.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Rich from '../components/Rich.jsx'
import { ChallengeTag, GradeBadge, InsightTag } from '../components/Badges.jsx'
import { FigureCard } from '../components/Figure.jsx'

export default function Challenges() {
  useTitle('Open challenges')
  const { id } = useParams()
  const first = useRef(true)
  useEffect(() => {
    if (!id) { first.current = false; return undefined }
    const t = setTimeout(() => {
      scrollToId(`challenge-${id}`, first.current ? 'auto' : undefined)
      document.getElementById(`challenge-${id}`)?.classList.add('is-target')
      first.current = false
    }, first.current ? 40 : 0)
    return () => clearTimeout(t)
  }, [id])

  const { refs } = site
  const i5 = site.insights.find((i) => i.section?.num === site.challengesSection.num) || insightById.I5
  const flow = figureById[refs.flowchart.num]
  const coverage = figureById[refs.coverage.num]

  return (
    <>
      <PageHeader eyebrow="Open challenges" title={`${Word(site.challenges.length)} problems the field has not solved`}>
        <p><Rich nodes={site.challengesIntro} /></p>
      </PageHeader>

      <section className="section section-tight">
        <div className="container">
          {i5 && (
            <Reveal className="gradient-callout">
              <div className="gradient-callout-head">
                <InsightTag id={i5.id} />
                <span className="gradient-callout-kicker">The challenges follow from this insight</span>
                <GradeBadge grade={i5.grade} compact />
              </div>
              <p className="gradient-callout-title">{i5.short}</p>
              <Link className="card-more" to={`/insights/${i5.id}`} viewTransition>The evidence for {i5.id} <ArrowRight size={15} /></Link>
            </Reveal>
          )}

          <ol className="challenge-grid">
            {site.challenges.map((c, k) => (
              <Reveal as="li" key={c.id} delay={(k % 2) * 60} id={`challenge-${c.id}`} className="card card-pad challenge-card">
                <div className="challenge-card-head">
                  <ChallengeTag id={c.id} size="lg" />
                  <h2 className="challenge-title">{c.title}</h2>
                </div>
                <p className="challenge-body"><Rich nodes={c.body} /></p>
              </Reveal>
            ))}
          </ol>
          <p className="challenge-foot">
            <a className="btn btn-secondary btn-sm" href={asset(refs.future.href)} target="_blank" rel="noopener">
              <FileText size={15} /> Appendix {refs.future.num}: {refs.future.title}
            </a>
          </p>
        </div>
      </section>

      <section className="section section-alt" id="deployment" aria-labelledby="h-deploy">
        <div className="container deploy-grid">
          <div className="deploy-text">
            <SectionHeading id="h-deploy" eyebrow="From insights to deployment" title="Choosing a judge" />
            <Reveal className="deploy-prose">
              <p className="deploy-lead"><Rich nodes={site.deploymentSteps[0]} tags /></p>
              <ul className="deploy-steps">
                {site.deploymentSteps.slice(1).map((s, k) => <li key={k}><Rich nodes={s} tags /></li>)}
              </ul>
            </Reveal>
            <p className="muted deploy-src">From <a className="link" href={asset(site.challengesSection.href)} target="_blank" rel="noopener">§{site.challengesSection.num} {site.challengesSection.title}</a>.</p>
          </div>
          <Reveal className="deploy-fig" delay={80}>
            <FigureCard fig={flow} priority={false} />
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="h-coverage">
        <div className="container container-narrow">
          <SectionHeading id="h-coverage" eyebrow={`Figure ${coverage.number}`} title="Where the evidence concentrates"
            lead={<>{coverage.title}.</>} />
          <Reveal><FigureCard fig={coverage} showTitle={false} /></Reveal>
        </div>
      </section>
    </>
  )
}
