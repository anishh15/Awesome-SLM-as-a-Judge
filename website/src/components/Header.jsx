import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { FileText, Menu, Moon, Search, Sun, X } from 'lucide-react'
import site, { pdfUrl } from '../lib/site.js'
import { useTheme } from '../lib/theme.jsx'
import { GitHubIcon, LogoMark } from './Icons.jsx'
import { openSearch } from './searchBus.js'

export const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/survey', label: 'Survey' },
  { to: '/insights', label: 'Insights' },
  { to: '/challenges', label: 'Challenges' },
  { to: '/papers', label: 'Papers' },
  { to: '/figures', label: 'Figures' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const navRef = useRef(null)
  const pillRef = useRef(null)
  const placed = useRef(false)

  // The active-page pill slides between links (transform only, so it stays smooth).
  useLayoutEffect(() => {
    const place = () => {
      const nav = navRef.current, pill = pillRef.current
      if (!nav || !pill) return
      const active = nav.querySelector('.nav-link.active')
      if (!active) { pill.style.opacity = '0'; return }
      const instant = !placed.current
      if (instant) pill.style.transition = 'none'
      pill.style.opacity = '1'
      pill.style.width = `${active.offsetWidth}px`
      pill.style.transform = `translateX(${active.offsetLeft}px)`
      if (instant) { void pill.offsetWidth; pill.style.transition = ''; placed.current = true }
    }
    place()
    window.addEventListener('resize', place)
    document.fonts?.ready?.then(place)
    return () => window.removeEventListener('resize', place)
  }, [location.pathname])

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 8))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus() } }
    const onClick = (e) => {
      if (!menuRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onClick)
    menuRef.current?.querySelector('nav')?.focus({ preventScroll: true })
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onClick) }
  }, [open])

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="brand" viewTransition aria-label="Awesome SLM-as-a-Judge, home">
          <LogoMark size={30} />
          <span className="brand-text">
            <span className="brand-name"><span className="brand-awesome">Awesome</span> <b>SLM</b>-as-a-<b className="brand-accent">Judge</b></span>
            <span className="brand-sub">Survey · {site.config.venue}</span>
          </span>
        </Link>

        <nav className="nav-main" aria-label="Main" ref={navRef}>
          <span className="nav-pill" aria-hidden="true" ref={pillRef} />
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} viewTransition className="nav-link">
              <span className="nav-label">{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="icon-btn search-btn" onClick={openSearch} aria-label="Search the site (Ctrl K)">
            <Search size={17} />
            <span className="search-btn-label">Search</span>
            <kbd className="kbd">⌘K</kbd>
          </button>
          <a className="icon-btn hide-sm" href={pdfUrl} target="_blank" rel="noopener" aria-label="Paper PDF">
            <FileText size={17} />
          </a>
          <a className="icon-btn hide-sm" href={site.config.repo} target="_blank" rel="noopener noreferrer" aria-label="GitHub repository">
            <GitHubIcon size={17} />
          </a>
          <button type="button" className="icon-btn theme-btn" onClick={(e) => toggle(e.currentTarget)}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
            <span className="theme-icons" data-theme-icon={theme}>
              <Sun size={17} className="sun" />
              <Moon size={17} className="moon" />
            </span>
          </button>
          <NavLink to="/cite" viewTransition className="btn btn-sm btn-primary cite-btn hide-md">Cite</NavLink>
          <button ref={buttonRef} type="button" className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)}
            aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" ref={menuRef} className={`mobile-menu${open ? " is-open" : ""}`} inert={open ? undefined : true}>
        <nav className="container mobile-nav" aria-label="Main menu" tabIndex={-1}>
          {[...NAV, { to: '/cite', label: 'Cite' }].map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} viewTransition className="mobile-link">{n.label}</NavLink>
          ))}
          <div className="mobile-extra">
            <a className="btn btn-sm btn-secondary" href={pdfUrl} target="_blank" rel="noopener"><FileText size={15} /> Paper (PDF)</a>
            <a className="btn btn-sm btn-secondary" href={site.config.repo} target="_blank" rel="noopener noreferrer"><GitHubIcon size={15} /> GitHub</a>
          </div>
        </nav>
      </div>
    </header>
  )
}
