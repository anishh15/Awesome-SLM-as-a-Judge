import { useEffect, useState } from 'react'

/** The id of the section nearest the top of the viewport. */
export default function useScrollSpy(ids, offset = null) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    let raf = 0
    const update = () => {
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        const line = offset ?? window.innerHeight * 0.38
        if (el && el.getBoundingClientRect().top - line <= 0) current = id
      }
      setActive(current)
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [ids.join('|'), offset]) // eslint-disable-line react-hooks/exhaustive-deps
  return active
}
