import { useEffect } from 'react'
import site from './site.js'

/** Set the document title for a page. */
export default function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${site.paper.title}` : site.paper.title
  }, [title])
}
