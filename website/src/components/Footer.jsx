import { Link } from 'react-router-dom'
import site, { pdfUrl } from '../lib/site.js'
import { GitHubIcon, LogoMark } from './Icons.jsx'
import { NAV } from './Header.jsx'

export default function Footer() {
  const { config, paper } = site
  const blob = (p) => `${config.repo}/blob/main/${p}`
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand" viewTransition>
            <LogoMark size={28} />
            <span className="brand-name"><span className="brand-awesome">Awesome</span> <b>SLM</b>-as-a-<b className="brand-accent">Judge</b></span>
          </Link>
          <p className="footer-blurb">
            The companion site of <em>{paper.title}</em> by {paper.authors.map((a) => a.name).join(', ').replace(/, ([^,]*)$/, ' and $1')}.
            {' '}{config.venue}.
          </p>
          <div className="footer-icons">
            <a className="icon-btn" href={config.repo} target="_blank" rel="noopener noreferrer" aria-label="GitHub repository"><GitHubIcon size={17} /></a>
          </div>
        </div>
        <nav className="footer-col" aria-label="Pages">
          <p className="footer-head">Pages</p>
          {NAV.map((n) => <Link key={n.to} to={n.to} viewTransition>{n.label}</Link>)}
          <Link to="/cite" viewTransition>Cite</Link>
        </nav>
        <div className="footer-col">
          <p className="footer-head">Resources</p>
          <a href={pdfUrl} target="_blank" rel="noopener">Paper (PDF)</a>
          <a href={config.repo} target="_blank" rel="noopener noreferrer">GitHub repository</a>
          <a href={blob('CITATION.cff')} target="_blank" rel="noopener noreferrer">CITATION.cff</a>
          <a href={blob('CONTRIBUTING.md')} target="_blank" rel="noopener noreferrer">Contributing</a>
        </div>
        <div className="footer-col">
          <p className="footer-head">Contact</p>
          {paper.authors.map((a) => (
            <a key={a.email} href={`mailto:${a.email}`}>{a.name}</a>
          ))}
          <a href={`${config.repo}/issues`} target="_blank" rel="noopener noreferrer">Open an issue</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>The list and code are MIT licensed. Figures come from the survey; each listed work belongs to its authors.</p>
      </div>
    </footer>
  )
}
