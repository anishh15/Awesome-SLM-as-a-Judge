import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { ok = false }
    ta.remove()
    return ok
  }
}

export default function CopyButton({ text, label = 'Copy', done = 'Copied', className = '', size = 'sm' }) {
  const [state, setState] = useState('idle')
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const onClick = async () => {
    const ok = await copy(text)
    setState(ok ? 'done' : 'fail')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), 1800)
  }
  return (
    <button type="button" className={`btn btn-${size} btn-ghost copy-btn ${state === 'done' ? 'is-done' : ''} ${className}`} onClick={onClick}>
      <span className="copy-icon" aria-hidden="true">{state === 'done' ? <Check size={15} /> : <Copy size={15} />}</span>
      <span aria-live="polite">{state === 'done' ? done : state === 'fail' ? 'Press Ctrl+C' : label}</span>
    </button>
  )
}
