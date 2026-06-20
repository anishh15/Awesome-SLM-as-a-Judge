import { useEffect, useRef, useState } from 'react'

export default function ScrollReveal({
  children,
  className = '',
  animation = 'reveal',  // 'reveal' | 'reveal-left' | 'reveal-right' | 'reveal-scale' | 'stagger'
  threshold = 0.15,
  delay = 0,
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setVisible(true), delay)
          } else {
            setVisible(true)
          }
          observer.unobserve(el)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, delay])

  return (
    <div
      ref={ref}
      className={`${animation} ${visible ? 'visible' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
