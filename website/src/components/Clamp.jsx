import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

/** Shows the first few lines of a long passage, with a button for the rest. */
export default function Clamp({ children, lines = 5, more = 'Read the full abstract', less = 'Show less' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`clamp${open ? ' is-open' : ''}`} style={{ '--lines': lines }}>
      <div className="clamp-body">{children}</div>
      <button type="button" className="clamp-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? less : more} <ChevronDown size={15} className="clamp-icon" aria-hidden="true" />
      </button>
    </div>
  )
}
