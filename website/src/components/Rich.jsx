import { Link, useLocation } from 'react-router-dom'
import site, { asset } from '../lib/site.js'
import { figureHref } from './figureLink.js'

// Render the JSON produced from the paper's LaTeX (see scripts/lib/inline.mjs).
export default function Rich({ nodes, inline = true, tags = false }) {
  if (!nodes) return null
  const out = renderNodes(tags ? linkTags(nodes) : nodes)
  return inline ? <>{out}</> : <p>{out}</p>
}

// Turn the insight and challenge labels (I1 to I5, C1 to C6) in plain text into links.
const TAG_RE = /\b([IC])([1-9])\b/g
function linkTags(nodes) {
  const ids = new Set([...site.insights.map((i) => i.id), ...site.challenges.map((c) => c.id)])
  return nodes.flatMap((n) => {
    if (typeof n !== 'string') return n.c && n.t !== 'cite' ? [{ ...n, c: linkTags(n.c) }] : [n]
    const out = []
    let last = 0
    for (const m of n.matchAll(TAG_RE)) {
      const id = m[0]
      if (!ids.has(id)) continue
      if (m.index > last) out.push(n.slice(last, m.index))
      out.push({ t: 'tag', id })
      last = m.index + id.length
    }
    if (last < n.length) out.push(n.slice(last))
    return out
  })
}

/** Like Rich, with the first letter capitalised (for a clause quoted as a sentence). */
export function CapRich({ nodes }) {
  if (!nodes?.length) return null
  const [first, ...rest] = nodes
  const head = typeof first === 'string' ? first.charAt(0).toUpperCase() + first.slice(1) : first
  return <>{renderNodes([head, ...rest])}</>
}

function renderNodes(nodes) {
  return nodes.map((n, k) => <Node key={k} n={n} />)
}

function Node({ n }) {
  if (typeof n === 'string') return n
  switch (n.t) {
    case 'b': return <strong>{renderNodes(n.c)}</strong>
    case 'i': return <em>{renderNodes(n.c)}</em>
    case 'sc': return <span className="sc">{renderNodes(n.c)}</span>
    case 'tt': return <code className="inline-code">{renderNodes(n.c)}</code>
    case 'sup': return <sup>{renderNodes(n.c)}</sup>
    case 'sub': return <sub>{renderNodes(n.c)}</sub>
    case 'math': return <span className="math">{renderNodes(n.c)}</span>
    case 'a': return <a className="link" href={n.href} target="_blank" rel="noopener noreferrer">{renderNodes(n.c)}</a>
    case 'cite': return <Cite keys={n.keys} mode={n.mode} />
    case 'ref': return <Ref n={n} />
    case 'tag': return (
      <Link className={`tag-link tag-link-${n.id[0] === 'I' ? 'insight' : 'challenge'}`} viewTransition
        to={n.id[0] === 'I' ? `/insights/${n.id}` : `/challenges/${n.id}`}>{n.id}</Link>
    )
    default: return n.c ? renderNodes(n.c) : null
  }
}

function Ref({ n }) {
  const location = useLocation()
  if (n.to) {
    const isFig = n.to.startsWith('/figures/')
    const to = isFig ? figureHref(location, n.to.slice(9)) : n.to
    // inside the lightbox a figure link swaps the figure instead of stacking history
    const inBox = isFig && new URLSearchParams(location.search).has('fig')
    return (
      <Link className="link ref" to={to} viewTransition={!isFig} preventScrollReset={isFig} replace={inBox}
        state={isFig ? (inBox ? location.state : { figOpen: true }) : undefined}>{n.text}</Link>
    )
  }
  if (n.href) {
    return (
      <a className="link ref" href={asset(n.href)} target="_blank" rel="noopener"
        title={n.title ? `${n.title} (opens the PDF)` : 'Opens the PDF'}>{n.text}</a>
    )
  }
  return n.text
}

/** natbib-style citation: (Zheng et al., 2023; Zhu et al., 2025) or Zheng et al. (2023). */
export function Cite({ keys, mode = 'p' }) {
  const items = keys.map((k) => ({ k, c: site.citeIndex[k] }))
  if (mode === 't') {
    return (
      <span className="cite-group">
        {items.map(({ k, c }, i) => (
          <span key={k}>
            {i > 0 && '; '}
            <CiteLink k={k} c={c}>{c ? `${c.author} (${c.year})` : k}</CiteLink>
          </span>
        ))}
      </span>
    )
  }
  return (
    <span className="cite-group">
      (
      {items.map(({ k, c }, i) => (
        <span key={k}>
          {i > 0 && '; '}
          <CiteLink k={k} c={c}>{c ? `${c.author}, ${c.year}` : k}</CiteLink>
        </span>
      ))}
      )
    </span>
  )
}

function CiteLink({ k, c, children }) {
  return (
    <Link className="cite" to={`/papers?paper=${encodeURIComponent(k)}`} viewTransition data-tip={c ? `${c.name ? `${c.name}: ` : ''}${c.title}` : undefined}>
      {children}
    </Link>
  )
}
