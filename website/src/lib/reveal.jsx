import { useEffect, useRef } from 'react'

// One shared IntersectionObserver for every element that fades in on scroll.
let io = null
function observer() {
  if (!io) {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
      }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 })
  }
  return io
}

export function useReveal(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    observer().observe(el)
    return () => observer().unobserve(el)
  }, [ref])
}

/** A block that fades and rises into place the first time it scrolls into view. */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null)
  useReveal(ref)
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--delay': `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  )
}
