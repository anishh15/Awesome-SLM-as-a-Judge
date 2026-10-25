import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Maximize2 } from 'lucide-react'
import { figSrc } from '../lib/site.js'
import { figureHref } from './figureLink.js'

/**
 * A figure in both themes. Both renders sit in a box with the figure's own
 * aspect ratio, so nothing moves while they load; CSS shows the one that
 * matches the theme, and the browser only fetches the visible one.
 */
export function FigureImage({ fig, priority = false, className = '', sizes }) {
  const [loaded, setLoaded] = useState({})
  return (
    <div className={`fig-frame ${className}`} style={{ aspectRatio: `${fig.width} / ${fig.height}` }}>
      {['light', 'dark'].map((t) => (
        <img
          key={t}
          className={`fig-img fig-${t}${loaded[t] ? ' is-loaded' : ''}`}
          src={figSrc(fig.stem, t)}
          alt={fig.alt}
          width={Math.round(fig.width)}
          height={Math.round(fig.height)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
          onLoad={() => setLoaded((s) => ({ ...s, [t]: true }))}
        />
      ))}
    </div>
  )
}

export const figureLabel = (fig) => (fig.panel ? `Figure ${fig.number}(${fig.panel})` : `Figure ${fig.number}`)

/** A figure that opens in the lightbox, with its number, title and location. */
export function FigureCard({ fig, showTitle = true, caption = null, priority = false, className = '' }) {
  const location = useLocation()
  return (
    <figure className={`fig-card ${className}`}>
      <Link className="fig-open" to={figureHref(location, fig.id)} state={{ figOpen: true }} preventScrollReset aria-label={`Open ${figureLabel(fig)} full size`}>
        <FigureImage fig={fig} priority={priority} />
        <span className="fig-zoom" aria-hidden="true"><Maximize2 size={15} /></span>
      </Link>
      {(showTitle || caption) && (
        <figcaption className="fig-caption">
          <span className="fig-num">{figureLabel(fig)}</span>
          {showTitle && <span className="fig-title">{fig.title}</span>}
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
