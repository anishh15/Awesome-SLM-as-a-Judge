import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import Lightbox from './Lightbox.jsx'
import CommandPalette from './CommandPalette.jsx'
import { BackToTop, ScrollProgress } from './Chrome.jsx'
import { prefetchPages } from '../pageLoaders.js'
import { loadPapers } from '../lib/site.js'

export default function Layout() {
  const location = useLocation()

  // After the first page is up, fetch the other pages and the paper list
  // in the background so every later navigation is instant.
  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200))
    const id = idle(() => { prefetchPages(); loadPapers() })
    return () => (window.cancelIdleCallback || clearTimeout)(id)
  }, [])

  // Cards light up under the pointer: one delegated listener sets --mx/--my.
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return undefined
    let raf = 0
    const onMove = (e) => {
      const card = e.target.closest?.('.card-link, .stat, .fig-open')
      if (!card) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect()
        card.style.setProperty('--mx', `${e.clientX - r.left}px`)
        card.style.setProperty('--my', `${e.clientY - r.top}px`)
      })
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => { document.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf) }
  }, [])

  const skip = (e) => {
    e.preventDefault()
    const main = document.getElementById('main')
    main?.focus({ preventScroll: true })
    main?.scrollIntoView()
  }

  return (
    <>
      <a className="skip-link" href="#main" onClick={skip}>Skip to content</a>
      <ScrollProgress />
      <Header />
      <main id="main" tabIndex={-1} key={location.pathname.split('/')[1] || 'home'} className="page-enter">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
      <Lightbox />
      <CommandPalette />
      <ScrollRestoration />
    </>
  )
}
