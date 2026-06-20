import { useState, useEffect } from 'react'
import { BookOpen, FileText } from 'lucide-react'
import GithubIcon from './GithubIcon'

const NAV_ITEMS = [
  { id: 'insights', label: 'Insights' },
  { id: 'taxonomy', label: 'Taxonomy' },
  { id: 'systems', label: 'Systems' },
  { id: 'families', label: 'Families' },
  { id: 'strategies', label: 'Strategies' },
  { id: 'reliability', label: 'Reliability' },
  { id: 'future', label: 'Future' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = NAV_ITEMS.map(n => document.getElementById(n.id)).filter(Boolean)
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <a href="#" className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="nav-brand-dot" />
          Awesome SLM-as-a-Judge
        </a>

        <ul className="nav-links">
          {NAV_ITEMS.map(item => (
            <li key={item.id}>
              <button
                className={`nav-link ${active === item.id ? 'active' : ''}`}
                onClick={() => scrollTo(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', gap: '8px' }}>
          <a href="paper.pdf" target="_blank" rel="noopener" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <FileText size={14} /> Paper
          </a>
          <a href="https://github.com/anishh15/Awesome-SLM-as-a-Judge" target="_blank" rel="noopener" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <GithubIcon size={14} /> GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}
