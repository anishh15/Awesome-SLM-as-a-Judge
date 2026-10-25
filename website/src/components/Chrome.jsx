import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { scrollBehavior } from '../lib/motion.js'

/** Thin reading-progress bar at the top of the window. */
export function ScrollProgress() {
  const ref = useRef(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      const p = h > 0 ? Math.min(1, window.scrollY / h) : 0
      if (ref.current) ref.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])
  return <div className="scroll-progress" aria-hidden="true"><div ref={ref} className="scroll-progress-bar" /></div>
}

export function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setShow(window.scrollY > window.innerHeight * 1.4))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])
  return (
    <button type="button" className={`back-to-top${show ? ' is-shown' : ''}`} tabIndex={show ? 0 : -1}
      aria-hidden={!show} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior() })}>
      <ArrowUp size={18} />
    </button>
  )
}
