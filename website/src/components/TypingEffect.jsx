import { useState, useEffect } from 'react'

export default function TypingEffect({ phrases, typingSpeed = 45, deletingSpeed = 25, pauseDuration = 2200 }) {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const cur = phrases[phraseIdx]
    let timeout

    if (!isDeleting && charIdx < cur.length) {
      timeout = setTimeout(() => setCharIdx(charIdx + 1), typingSpeed)
    } else if (!isDeleting && charIdx === cur.length) {
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration)
    } else if (isDeleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(charIdx - 1), deletingSpeed)
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false)
      setPhraseIdx((phraseIdx + 1) % phrases.length)
    }

    return () => clearTimeout(timeout)
  }, [charIdx, isDeleting, phraseIdx, phrases, typingSpeed, deletingSpeed, pauseDuration])

  return (
    <span className="typing-cursor" style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-accent-bright)' }}>
      {phrases[phraseIdx].substring(0, charIdx)}
    </span>
  )
}
