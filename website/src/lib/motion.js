// Motion helpers that respect prefers-reduced-motion.
export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const scrollBehavior = () => (reducedMotion() ? 'auto' : 'smooth')

/** Scroll an element into view below the sticky header. */
export function scrollToId(id, behavior = scrollBehavior(), offset = 80) {
  const el = document.getElementById(id)
  if (!el) return false
  // offsetTop ignores CSS transforms, so a block that is still sliding in
  // (scroll reveal) does not throw the target off
  let top = 0
  for (let n = el; n; n = n.offsetParent) top += n.offsetTop
  top -= offset
  window.scrollTo({ top: Math.max(0, top), behavior })
  return true
}

/** Run a DOM update inside a view transition when the browser supports it. */
export function withTransition(update) {
  if (!document.startViewTransition || reducedMotion()) { update(); return }
  document.startViewTransition(update)
}
