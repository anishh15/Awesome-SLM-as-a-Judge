// The generated data (scripts/build-data.mjs) and small helpers around it.
import site from '../generated/site.json'

export default site
export const BASE = import.meta.env.BASE_URL
export const asset = (p) => `${BASE}${String(p).replace(/^\.?\//, '')}`
export const pdfUrl = asset(site.config.pdf)
export const figSrc = (stem, theme) => `${BASE}figures/${theme}/${stem}.svg`
export const figureById = Object.fromEntries(site.figures.map((f) => [f.id, f]))
export const insightById = Object.fromEntries(site.insights.map((i) => [i.id, i]))
export const categoryById = Object.fromEntries(site.corpus.categories.map((c) => [c.id, c]))

let papersPromise = null
/** The paper list is its own chunk; it loads on the Papers page and in search. */
export function loadPapers() {
  papersPromise ||= import('../generated/papers.json').then((m) => m.default)
  return papersPromise
}

/** natbib-style citation text for one key: "Zheng et al., 2023". */
export function citeText(key, mode = 'p') {
  const c = site.citeIndex[key]
  if (!c) return key
  return mode === 't' ? `${c.author} (${c.year})` : `${c.author}, ${c.year}`
}

export const mb = (bytes) => `${(bytes / 1e6).toFixed(1)} MB`
