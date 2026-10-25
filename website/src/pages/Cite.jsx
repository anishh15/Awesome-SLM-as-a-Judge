import { FileText, Mail, ArrowUpRight } from 'lucide-react'
import site, { mb, pdfUrl } from '../lib/site.js'
import useTitle from '../lib/useTitle.js'
import { Reveal } from '../lib/reveal.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import BibTeX from '../components/BibTeX.jsx'
import CopyButton from '../components/CopyButton.jsx'
import { GitHubIcon } from '../components/Icons.jsx'

const joinNames = (xs) => (xs.length < 3 ? xs.join(' and ') : `${xs.slice(0, -1).join(', ')}, and ${xs[xs.length - 1]}`)

export default function Cite() {
  useTitle('Cite')
  const { paper, config } = site
  const status = config.venue.replace(new RegExp(`,?\\s*${config.year}$`), '')
  const plain = `${joinNames(paper.authors.map((a) => a.name))}. ${config.year}. ${paper.title}. ${status}. ${config.url}`
  const blob = (p) => `${config.repo}/blob/main/${p}`

  return (
    <>
      <PageHeader eyebrow="Cite" title="Citing the survey">
        <p>
          If the survey or the paper list helps your work, please cite the survey ({status.toLowerCase()}, {config.year}).
        </p>
      </PageHeader>

      <section className="section section-tight">
        <div className="container cite-grid">
          <Reveal className="cite-main">
            <BibTeX text={config.bibtex} />
            <div className="plain-cite">
              <div className="code-head">
                <span className="code-title">Plain text</span>
                <CopyButton text={plain} label="Copy" />
              </div>
              <p className="plain-cite-text">{plain}</p>
            </div>
            <p className="muted cite-note">
              GitHub’s “Cite this repository” button gives the same reference from{' '}
              <a className="link" href={blob('CITATION.cff')} target="_blank" rel="noopener noreferrer">CITATION.cff</a>.
            </p>
          </Reveal>
          <Reveal className="cite-side" delay={80}>
            <div className="card card-pad paper-card">
              <p className="quote-label">The paper</p>
              <p className="paper-card-title">{paper.title}</p>
              <p className="muted">{config.venue}</p>
              <div className="btn-row">
                <a className="btn btn-primary" href={pdfUrl} target="_blank" rel="noopener"><FileText size={17} /> PDF <span className="btn-meta">{mb(paper.pdfBytes)}</span></a>
                <a className="btn btn-secondary" href={config.repo} target="_blank" rel="noopener noreferrer"><GitHubIcon size={16} /> Repository</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="h-authors">
        <div className="container">
          <SectionHeading id="h-authors" eyebrow="Authors" title="Who wrote it" />
          <div className="authors-grid">
            {paper.authors.map((a, k) => (
              <Reveal key={a.name} delay={k * 60} className="card card-pad author-card">
                <p className="author-card-name">{a.name}</p>
                <p className="author-card-aff">{paper.affiliations.filter((x) => a.affiliations.includes(x.id)).map((x) => x.name).join('; ')}</p>
                <div className="author-card-links">
                  {a.email && <a className="plink" href={`mailto:${a.email}`}><Mail size={14} /> {a.email}</a>}
                  {a.url && <a className="plink" href={a.url} target="_blank" rel="noopener noreferrer"><GitHubIcon size={13} /> {a.url.replace(/^https:\/\/(www\.)?/, '')} <ArrowUpRight size={12} className="plink-arrow" /></a>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="h-repo">
        <div className="container container-narrow">
          <SectionHeading id="h-repo" eyebrow="The repository" title="Found an error or a missing work?"
            lead={<>Open an issue or a pull request on GitHub.</>} />
          <div className="btn-row">
            <a className="btn btn-secondary" href={`${config.repo}/issues`} target="_blank" rel="noopener noreferrer">Open an issue</a>
            <a className="btn btn-ghost" href={blob('CONTRIBUTING.md')} target="_blank" rel="noopener noreferrer">How to contribute</a>
          </div>
        </div>
      </section>
    </>
  )
}
