import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { reducedMotion } from './motion.js'

const KEY = 'slmjudge-theme'
const ThemeContext = createContext({ theme: 'light', toggle: () => {} })

const stored = () => { try { return localStorage.getItem(KEY) } catch { return null } }
function apply(theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')

  // Follow the system setting until the reader picks a theme.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => {
      if (stored()) return
      const t = e.matches ? 'dark' : 'light'
      apply(t); setTheme(t)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback((origin) => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem(KEY, next) } catch { /* private mode */ }
    const change = () => { apply(next); setTheme(next) }
    if (!document.startViewTransition || reducedMotion()) { change(); return }
    const root = document.documentElement
    const rect = origin?.getBoundingClientRect?.()
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40
    const y = rect ? rect.top + rect.height / 2 : 32
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    root.style.setProperty('--x', `${x}px`)
    root.style.setProperty('--y', `${y}px`)
    root.style.setProperty('--r', `${r}px`)
    root.classList.add('theme-switching')
    const vt = document.startViewTransition(() => flushSync(change))
    vt.finished.finally(() => root.classList.remove('theme-switching'))
  }, [])

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
