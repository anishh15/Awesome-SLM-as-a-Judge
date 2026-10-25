import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Download, ExternalLink, X, ZoomIn, ZoomOut } from 'lucide-react'
import site, { asset, figSrc } from '../lib/site.js'
import { useTheme } from '../lib/theme.jsx'
import { FigureImage, figureLabel } from './Figure.jsx'
import Rich from './Rich.jsx'

const ORDER = site.figures

/** Full-size figure viewer, driven by the ?fig= search parameter on any page. */
export default function Lightbox() {
  const [params, setParams] = useSearchParams()
  const id = params.get('fig')
  const fig = useMemo(() => ORDER.find((f) => f.id === id) || null, [id])
  const navigate = useNavigate()
  const location = useLocation()
  const { theme } = useTheme()
  const [zoom, setZoom] = useState(false)
  const closeRef = useRef(null)
  const lastFocus = useRef(null)
  const stageRef = useRef(null)

  // Remember what had focus, lock page scroll without a layout jump.
  useLayoutEffect(() => {
    if (!fig) return undefined
    if (!lastFocus.current) lastFocus.current = document.activeElement
    const root = document.documentElement
    const sbw = window.innerWidth - root.clientWidth
    root.style.setProperty('--sbw', `${sbw}px`)
    root.classList.add('is-locked')
    return () => { root.classList.remove('is-locked') }
  }, [fig])

  useEffect(() => {
    if (fig) { setZoom(false); closeRef.current?.focus({ preventScroll: true }) }
  }, [fig])

  const close = useCallback(() => {
    const restore = lastFocus.current
    lastFocus.current = null
    // Opened by a link on this page: going back closes it and keeps history tidy.
    if (location.state?.figOpen) {
      navigate(-1)
    } else {
      const next = new URLSearchParams(params)
      next.delete('fig')
      setParams(next, { replace: true, preventScrollReset: true })
    }
    requestAnimationFrame(() => restore?.focus?.({ preventScroll: true }))
  }, [navigate, params, setParams, location.state])

  const go = useCallback((delta) => {
    const k = ORDER.findIndex((f) => f.id === id)
    const next = ORDER[(k + delta + ORDER.length) % ORDER.length]
    const p = new URLSearchParams(params)
    p.set('fig', next.id)
    setParams(p, { replace: true, preventScrollReset: true, state: location.state })
  }, [id, params, setParams, location.state])

  useEffect(() => {
    if (!fig) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close() }
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Tab') {
        const nodes = [...document.querySelectorAll('.lightbox [href], .lightbox button:not([disabled])')]
        if (!nodes.length) return
        const first = nodes[0], last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fig, close, go])

  // Drag to pan when zoomed in.
  useEffect(() => {
    const el = stageRef.current
    if (!el || !zoom) return undefined
    let start = null
    const down = (e) => { start = { x: e.clientX, y: e.clientY, l: el.scrollLeft, t: el.scrollTop }; el.setPointerCapture(e.pointerId); el.classList.add('is-dragging') }
    const move = (e) => { if (!start) return; el.scrollLeft = start.l - (e.clientX - start.x); el.scrollTop = start.t - (e.clientY - start.y) }
    const up = () => { start = null; el.classList.remove('is-dragging') }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up) }
  }, [zoom, fig])

  if (!fig) return null
  const k = ORDER.findIndex((f) => f.id === id)
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
      <div className="lightbox-backdrop" onClick={close} />
      <div className="lightbox-panel">
        <div className="lightbox-bar">
          <div className="lightbox-heading">
            <span className="fig-num">{figureLabel(fig)}</span>
            <h2 id="lightbox-title" className="lightbox-title">{fig.title}</h2>
          </div>
          <div className="lightbox-actions">
            <span className="lightbox-count tnum" aria-hidden="true">{k + 1} / {ORDER.length}</span>
            <button type="button" className="icon-btn" onClick={() => setZoom((z) => !z)} aria-pressed={zoom} aria-label={zoom ? 'Fit to window' : 'Zoom in'}>
              {zoom ? <ZoomOut size={17} /> : <ZoomIn size={17} />}
            </button>
            <a className="icon-btn" href={figSrc(fig.stem, theme)} download={`${fig.stem}_${theme}.svg`} aria-label={`Download SVG (${theme} theme)`}>
              <Download size={17} />
            </a>
            <a className="icon-btn hide-xs" href={figSrc(fig.stem, theme)} target="_blank" rel="noopener" aria-label="Open the SVG in a new tab">
              <ExternalLink size={17} />
            </a>
            <button ref={closeRef} type="button" className="icon-btn" onClick={close} aria-label="Close">
              <X size={19} />
            </button>
          </div>
        </div>
        <div ref={stageRef} className={`lightbox-stage${zoom ? ' is-zoomed' : ''}`} onDoubleClick={() => setZoom((z) => !z)}>
          <FigureImage key={fig.id} fig={fig} priority className="lightbox-img" />
        </div>
        <div className="lightbox-foot">
          <button type="button" className="icon-btn lightbox-nav" onClick={() => go(-1)} aria-label="Previous figure"><ChevronLeft size={20} /></button>
          <div className="lightbox-caption">
            {fig.subcaption && <p className="lightbox-sub"><strong>({fig.panel})</strong> <Rich nodes={fig.subcaption} /></p>}
            <p><strong>{`Figure ${fig.number}.`}</strong> <Rich nodes={fig.caption} tags /></p>
            {fig.where && (
              <p className="lightbox-where">
                In the paper:{' '}
                <a className="link" href={asset(fig.where.href)} target="_blank" rel="noopener">
                  {fig.where.subLabel ? `${fig.where.subLabel} ${fig.where.subTitle}` : `${fig.where.label} ${fig.where.title}`}
                </a>
                {fig.where.subLabel && <span> ({fig.where.label} {fig.where.title})</span>}
              </p>
            )}
          </div>
          <button type="button" className="icon-btn lightbox-nav" onClick={() => go(1)} aria-label="Next figure"><ChevronRight size={20} /></button>
        </div>
      </div>
    </div>
  )
}
