import { useState } from 'react'
import { FileText, BookOpen, Copy, Check, Heart } from 'lucide-react'
import GithubIcon from './GithubIcon'
import { citation, paperMeta } from '../data/paperData'

export default function Footer() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <footer className="footer" id="citation">
      <div className="container">
        <div className="footer-grid">
          {/* Citation */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--c-text)' }}>
              📎 Citation
            </h3>
            <div className="citation-box">
              <button className="citation-copy-btn" onClick={handleCopy}>
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
              {citation}
            </div>
          </div>

          {/* Authors */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--c-text)' }}>
              Authors
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {paperMeta.authors.map(a => (
                <div key={a.name}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--c-text)' }}>{a.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--c-text-muted)' }}>{a.affiliation}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--c-text)' }}>
              Links
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="paper.pdf" target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--c-text-secondary)' }}>
                <FileText size={15} /> Read Paper (PDF)
              </a>
              <a href={paperMeta.repo} target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--c-text-secondary)' }}>
                <GithubIcon size={15} /> GitHub Repository
              </a>
              <a href={paperMeta.repo} target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--c-text-secondary)' }}>
                <BookOpen size={15} /> Awesome List
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 · Small Language Models as Judges: A Survey</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Made with <Heart size={12} style={{ color: 'var(--c-accent)' }} /> by Anish, Nitesh & Gaurav
          </span>
        </div>
      </div>
    </footer>
  )
}
