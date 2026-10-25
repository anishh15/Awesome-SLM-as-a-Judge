#!/usr/bin/env node
// Build the JSON the site renders, from files committed in the repository.
// Runs before `vite` and `vite build` (npm predev / prebuild).
//
// Inputs
//   ../data/papers.yaml          the 105 works: metadata, category, links
//   ../data/references.bib       the survey's bibliography (BibTeX per work)
//   paper/*.tex, paper/outline.json   synced from the paper by sync-paper.mjs
//   public/figures/{light,dark}/*.svg  synced figure renders
//   site.config.mjs              venue, paper link, BibTeX, author links
//   ../README.md, ../CITATION.cff     only read to check they agree with the site
// Outputs (git-ignored, rebuilt every time)
//   src/generated/site.json      everything except the paper list
//   src/generated/papers.json    the paper list
//
// The script stops with an error when a count differs from the paper
// (App. M and the abstract), when the paper's tables or lists do not parse
// into the expected shape, or when the BibTeX or status disagree with the
// README and CITATION.cff.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'
import config from '../site.config.mjs'
import { readGroup, findCommands, findEnvs, tabularBody, tabularRows } from './lib/tex.mjs'
import { texToNodes, texToText, nodesToText } from './lib/inline.mjs'
import { parseBib, natbibLabels, splitAuthors } from './lib/bibtex.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.resolve(HERE, '..')
const ROOT = path.resolve(SITE, '..')
const read = (p) => fs.readFileSync(p, 'utf8')
const errors = []
const warnings = []
const fail = (msg) => errors.push(msg)
const warnOnce = new Set()
const warn = (msg) => { if (!warnOnce.has(msg)) { warnOnce.add(msg); warnings.push(msg) } }

// ── inputs ───────────────────────────────────────────────────────────────────
const data = YAML.parse(read(path.join(ROOT, 'data', 'papers.yaml')))
const bibEntries = parseBib(read(path.join(ROOT, 'data', 'references.bib')))
const bib = Object.fromEntries(bibEntries.map((e) => [e.key, e]))
const labelsBib = natbibLabels(bibEntries)
const main = read(path.join(SITE, 'paper', 'main.tex'))
const t2 = read(path.join(SITE, 'paper', 'tables', '2_insight_summary.tex'))
const t3 = read(path.join(SITE, 'paper', 'tables', '3_judge_systems.tex'))
const appM = read(path.join(SITE, 'paper', 'appendix', 'M_methodology.tex'))
const outline = JSON.parse(read(path.join(SITE, 'paper', 'outline.json')))
const sync = JSON.parse(read(path.join(SITE, 'paper', 'SYNC.json')))

// ── LaTeX → nodes, with references resolved ──────────────────────────────────
const L = outline.labels
const pdfHref = (dest) => `${config.paper.pdf}#${dest}`
function resolve(nodes) {
  return nodes.map((n) => {
    if (typeof n === 'string') return n
    if (n.t === 'ref') {
      const lab = L[n.label]
      if (!lab) { fail(`unresolved \\ref{${n.label}}`); return '??' }
      if (n.sub) return { t: 'ref', text: lab.panel || lab.num.replace(/^\d+/, ''), to: `/figures/${lab.num}` }
      if (lab.kind === 'figure') return { t: 'ref', text: lab.num, to: `/figures/${figureFirstId(lab.num)}` }
      if (lab.kind === 'subfigure') return { t: 'ref', text: lab.num, to: `/figures/${lab.num}` }
      if (lab.kind === 'table' && lab.num === '2') return { t: 'ref', text: lab.num, to: '/insights' }
      if (lab.kind === 'table' && lab.num === '3') return { t: 'ref', text: lab.num, to: '/survey/systems' }
      if (lab.dest) return { t: 'ref', text: lab.num, href: pdfHref(lab.dest), title: lab.title }
      return { t: 'ref', text: lab.num }
    }
    if (n.t === 'cite') {
      for (const k of n.keys) if (!bib[k]) fail(`\\cite{${k}} is not in data/references.bib`)
      return n
    }
    if (n.c) return { ...n, c: resolve(n.c) }
    return n
  })
}
const figureFirstId = (num) => outline.figures.find((f) => f.number === num)?.id || num
const tex = (s) => resolve(texToNodes(s, warn))
const plain = (s) => texToText(s, warn)

// Split a node list into sentences (a full stop, question or exclamation mark
// followed by a space and a capital letter ends a sentence).
function sentences(nodes) {
  const out = [[]]
  for (const n of nodes) {
    if (typeof n !== 'string') { out[out.length - 1].push(n); continue }
    const parts = n.split(/(?<=[.?!])\s+(?=[A-Z])/)
    parts.forEach((part, k) => {
      if (k > 0) out.push([])
      if (part) out[out.length - 1].push(part)
    })
  }
  return out.filter((s) => s.length)
}

// Paragraphs of a LaTeX source (blank-line separated), with positions.
function paragraphs(src) {
  const out = []
  const re = /\n[ \t]*\n/g
  let start = 0, m
  while ((m = re.exec(src))) { out.push({ start, end: m.index, text: src.slice(start, m.index).trim() }); start = m.index + m[0].length }
  out.push({ start, end: src.length, text: src.slice(start).trim() })
  return out.filter((p) => p.text)
}
const mainParas = paragraphs(main)
const paraAt = (idx) => mainParas.find((p) => p.start <= idx && idx < p.end)
const paraStarting = (prefix) => mainParas.find((p) => p.text.startsWith(prefix))
function paragraphCmd(name) {
  const p = paraStarting(`\\paragraph{${name}}`)
  if (!p) { fail(`main.tex: no \\paragraph{${name}}`); return [] }
  return tex(p.text.slice(`\\paragraph{${name}}`.length).trim())
}

// Headings of main.tex with positions, matched to the outline's numbers.
const mainSections = outline.sections.filter((s) => s.num && !s.appendix)
const headings = []
for (const cmd of ['section', 'subsection']) {
  for (const h of findCommands(main, cmd)) {
    const title = plain(h.args[0])
    let num = null, dest = null
    for (const s of mainSections) {
      if (cmd === 'section' && s.title === title) { num = s.num; dest = s.dest }
      if (cmd === 'subsection') for (const ss of s.subsections) if (ss.title === title) { num = ss.num; dest = ss.dest }
    }
    if (!num) fail(`main.tex heading not in outline: ${title}`)
    headings.push({ index: h.index, cmd, title, num, dest })
  }
}
headings.sort((a, b) => a.index - b.index)
const headingAt = (idx) => [...headings].reverse().find((h) => h.index < idx)
const sectionAt = (idx) => [...headings].reverse().find((h) => h.index < idx && h.cmd === 'section')

// ── the paper: title, authors, abstract ──────────────────────────────────────
const title = plain(findCommands(main, 'title')[0].args[0])
const authorBlock = findCommands(main, 'author')[0].args[0]
const authors = []
{
  const re = /\\textbf\{([^}]+)\}\\textsuperscript\{([^}]+)\}/g
  let m
  while ((m = re.exec(authorBlock))) authors.push({ name: plain(m[1]), affiliations: m[2].split(',').map((x) => Number(x.trim())) })
  const affRe = /\\textsuperscript\{(\d+)\}([^\\\n]+?)\s*\\\\/g
  var affiliations = []
  while ((m = affRe.exec(authorBlock))) {
    const name = plain(m[2])
    if (name && !affiliations.some((a) => a.id === Number(m[1]))) affiliations.push({ id: Number(m[1]), name })
  }
  affiliations.sort((a, b) => a.id - b.id)
  const emails = [...authorBlock.matchAll(/\\texttt\{([^}]*@[^}]*)\}/g)].map((x) => x[1])
  authors.forEach((a, k) => {
    a.email = emails[k] || null
    a.url = config.authorLinks[a.name] || null
  })
  if (authors.length !== 3 || affiliations.length < 2 || emails.length !== authors.length) fail('author block did not parse')
}
const hrefs = findCommands(authorBlock, 'href', 'mm').map((h) => h.args[0])
const paperWebsite = hrefs.find((h) => h.includes('github.io')) || null
const paperGithub = hrefs.find((h) => h.includes('github.com')) || null
if (paperWebsite !== config.url) fail(`the paper's author block links ${paperWebsite}, config.url is ${config.url}`)
if (paperGithub !== config.repo) fail(`the paper's author block links ${paperGithub}, config.repo is ${config.repo}`)

const abstractTex = findEnvs(main, 'abstract')[0].body.trim()
const abstract = tex(abstractTex)

// ── corpus counts: computed from papers.yaml, checked against the paper ──────
const papersIn = data.papers.filter((p) => p.in_survey !== false)
const yearBin = (y) => (y <= 2023 ? '2023 or earlier' : String(y))
const YEAR_BINS = ['2023 or earlier', '2024', '2025', '2026']
const total = papersIn.length
const byCat = {}
const byYear = Object.fromEntries(YEAR_BINS.map((b) => [b, 0]))
for (const p of papersIn) {
  byCat[p.category] = (byCat[p.category] || 0) + 1
  byYear[yearBin(p.year)] = (byYear[yearBin(p.year)] || 0) + 1
}

// What the paper says (App. M figure note and "By publication year").
const paperSays = { total: null, categories: {}, years: {} }
{
  const m = /Of the (\d+) included:\s*([^}]*?)\.\s*\}/s.exec(appM)
  if (!m) fail('App. M: category counts not found')
  else {
    paperSays.total = Number(m[1])
    for (const part of m[2].replace(/\s+/g, ' ').split(/,\s*/)) {
      const pm = /^(\d+)\s+(.+)$/.exec(part.trim())
      const cat = data.categories.find((c) => c.title.toLowerCase() === pm[2].trim().toLowerCase())
      if (!cat) fail(`App. M category "${pm[2]}" is not a category in data/papers.yaml`)
      else paperSays.categories[cat.id] = Number(pm[1])
    }
  }
  const y = /Of the (\d+) cited works, (\d+) are from 2023 or earlier, (\d+) from 2024, (\d+) from 2025, and (\d+) from 2026/.exec(appM.replace(/\s+/g, ' '))
  if (!y) fail('App. M: year counts not found')
  else {
    if (Number(y[1]) !== paperSays.total) fail('App. M gives two different totals')
    YEAR_BINS.forEach((b, k) => { paperSays.years[b] = Number(y[k + 2]) })
  }
  const a = /\\textbf\{(\d+) works\}/.exec(abstractTex)
  if (!a || Number(a[1]) !== total) fail(`abstract says ${a && a[1]} works, the data file has ${total}`)
}
if (paperSays.total !== total) fail(`App. M reports ${paperSays.total} works, the data file has ${total}`)
for (const c of data.categories) {
  if (byCat[c.id] !== paperSays.categories[c.id]) fail(`${c.id}: ${byCat[c.id]} works, App. M reports ${paperSays.categories[c.id]}`)
  if (byCat[c.id] !== data.corpus.categories[c.id]) fail(`${c.id}: ${byCat[c.id]} works, papers.yaml corpus block says ${data.corpus.categories[c.id]}`)
}
for (const b of YEAR_BINS) {
  if (byYear[b] !== paperSays.years[b]) fail(`year ${b}: ${byYear[b]} works, App. M reports ${paperSays.years[b]}`)
  if (byYear[b] !== data.corpus.years[b]) fail(`year ${b}: ${byYear[b]} works, papers.yaml corpus block says ${data.corpus.years[b]}`)
}

// ── the paper list ───────────────────────────────────────────────────────────
const cats = Object.fromEntries(data.categories.map((c) => [c.id, c]))
const keys = new Set()
const papers = data.papers.map((p) => {
  if (keys.has(p.key)) fail(`${p.key}: duplicate key`)
  keys.add(p.key)
  for (const f of ['title', 'authors', 'year', 'venue', 'category', 'group', 'links']) if (!p[f]) fail(`${p.key}: missing ${f}`)
  if (!cats[p.category]) fail(`${p.key}: unknown category ${p.category}`)
  else if (!cats[p.category].groups.some((g) => g.id === p.group)) fail(`${p.key}: unknown group ${p.group}`)
  if (!p.links?.paper) fail(`${p.key}: missing links.paper`)
  for (const [k, u] of Object.entries(p.links || {})) if (!/^https:\/\//.test(u)) fail(`${p.key}: links.${k} is not https`)
  const b = bib[p.key]
  if (!b) fail(`${p.key}: not in data/references.bib`)
  const lab = labelsBib[p.key]
  return {
    key: p.key,
    name: p.name || null,
    title: p.title,
    authors: p.authors,
    etAl: !!p.et_al,
    year: p.year,
    yearBin: yearBin(p.year),
    venue: p.venue,
    venueFull: p.venue_full || null,
    category: p.category,
    group: p.group,
    inSurvey: p.in_survey !== false,
    sections: p.sections || [],
    links: p.links,
    note: p.note || null,
    cite: lab ? `${lab.author}, ${lab.year}` : null,
    bibtex: b ? b.raw : null,
  }
})
for (const e of bibEntries) if (!keys.has(e.key)) fail(`${e.key}: in references.bib but not in papers.yaml`)

const citeIndex = {}
for (const p of papers) {
  const lab = labelsBib[p.key]
  citeIndex[p.key] = { author: lab.author, year: lab.year, title: p.title, name: p.name, url: p.links.paper, category: p.category }
}

const corpus = {
  total,
  years: YEAR_BINS.map((b) => ({ bin: b, count: byYear[b] })),
  categories: data.categories.map((c) => ({
    id: c.id,
    title: c.title,
    summary: c.summary,
    where: c.where,
    figure: c.figure || null,
    count: byCat[c.id],
    years: YEAR_BINS.map((b) => ({ bin: b, count: papersIn.filter((p) => p.category === c.id && yearBin(p.year) === b).length })),
    groups: c.groups.map((g) => ({ id: g.id, title: g.title, where: g.where, count: papersIn.filter((p) => p.category === c.id && p.group === g.id).length })),
  })),
  withCode: papersIn.filter((p) => p.links.code).length,
  venues: Object.entries(papersIn.reduce((a, p) => ((a[p.venue] = (a[p.venue] || 0) + 1), a), {}))
    .sort((a, b) => b[1] - a[1]).map(([venue, count]) => ({ venue, count })),
  paperSays,
}

// ── Table 2 (insights) and the insight statements in the text ────────────────
const GRADES = ['Consensus', 'Replicated', 'Preliminary']
const t2rows = tabularRows(tabularBody(t2))
const t2head = t2rows[0].map(plain)
if (t2head.join('|') !== 'Insight|Evidence|Main support|Boundary conditions|Design') fail(`Table 2 header changed: ${t2head.join('|')}`)
const insightRows = t2rows.slice(1).map((r) => {
  const m = /^\\textbf\{(I\d)\}~?(.*)$/s.exec(r[0])
  const g = /^\\textsc\{(\w+)\}:\s*(.*)$/s.exec(r[1])
  if (!m || !g) { fail(`Table 2 row did not parse: ${r[0].slice(0, 40)}`); return null }
  return { id: m[1], short: plain(m[2]), grade: g[1], evidence: tex(g[2]), support: tex(r[2]), boundary: tex(r[3]), design: tex(r[4]) }
}).filter(Boolean)
if (insightRows.map((r) => r.id).join() !== 'I1,I2,I3,I4,I5') fail('Table 2 does not list I1 to I5')
const t2caption = tex(findCommands(t2, 'caption')[0].args[0])

// Statements: \textsc{Title.} [\textsc{Grade}: detail] \textit{claim}
const statements = []
{
  const re = /\\textsc\{([^{}]+?)\}\s*\[\\textsc\{(\w+)\}:\s*([^\]]+)\]\s*/g
  let m
  while ((m = re.exec(main))) {
    const after = m.index + m[0].length
    let claim = null, claimEnd = after
    if (main.startsWith('\\textit{', after)) { const [c, e] = readGroup(main, after + 7); claim = c; claimEnd = e }
    const para = paraAt(m.index)
    const sec = sectionAt(m.index), head = headingAt(m.index)
    statements.push({
      index: m.index, title: plain(m[1]).replace(/\.$/, ''), grade: m[2], detail: plain(m[3]),
      claim: claim ? tex(claim) : null,
      body: tex(main.slice(claimEnd, para.end).trim()),
      para,
      section: sec ? { num: sec.num, title: sec.title, dest: sec.dest } : null,
      subsection: head && head.cmd === 'subsection' ? { num: head.num, title: head.title, dest: head.dest } : null,
    })
  }
}
// Insights are the statements outside §5 (Reliability), in order; the §5
// statement is a finding about position-consistent accuracy.
const reliability = mainSections.find((s) => /Reliability/.test(s.title))
const insightStatements = statements.filter((s) => s.section?.num !== reliability?.num)
const pcFinding = statements.find((s) => s.section?.num === reliability?.num) || null
if (insightStatements.length !== 5) fail(`expected 5 insight statements in main.tex, found ${insightStatements.length}`)

// Figure panels that the paper ties to each insight (Fig. 2 subcaptions "I1: ...").
const panelFor = {}
for (const f of outline.figures) {
  const m = f.subcaption && /^(I\d):/.exec(plain(f.subcaption))
  if (m) panelFor[m[1]] = f.id
}

const insights = insightRows.map((row, k) => {
  const s = insightStatements[k]
  if (!s) return row
  if (s.grade !== row.grade) fail(`${row.id}: Table 2 grade ${row.grade}, text grade ${s.grade}`)
  // a later paragraph of the same subsection that is one italic sentence
  const nextHeading = headings.find((h) => h.index > s.index)
  const takeawayPara = mainParas.find((p) => p.start > s.para.start && (!nextHeading || p.start < nextHeading.index) &&
    /^\\textit\{[^{}]*(\{[^{}]*\}[^{}]*)*\}$/.test(p.text))
  const takeaway = takeawayPara ? tex(takeawayPara.text) : null
  return {
    ...row,
    statement: s.title,
    detail: s.detail,
    claim: s.claim,
    body: s.body,
    takeaway,
    section: s.section,
    subsection: s.subsection,
    figure: panelFor[row.id] || null,
  }
})
const finding = pcFinding && {
  statement: pcFinding.title, grade: pcFinding.grade, detail: pcFinding.detail,
  claim: pcFinding.claim, body: pcFinding.body, section: pcFinding.section, subsection: pcFinding.subsection,
}

// Evidence grades, from the sentence that defines them (§3.2).
const gradeLegend = []
let independence = null
{
  const p = mainParas.find((x) => x.text.includes('Each insight carries an evidence tag'))
  if (!p) fail('main.tex: evidence grade definitions not found')
  else {
    const s = p.text.slice(p.text.indexOf('Each insight carries an evidence tag'))
    const first = s.slice(0, s.indexOf('Sources count as independent'))
    for (const g of GRADES) {
      const m = new RegExp(`\\[\\\\textsc\\{${g}\\}\\] for (.+?)(?=, (?:and )?\\[\\\\textsc|\\.\\s*$)`, 's').exec(first.trim())
      if (!m) fail(`grade definition for ${g} not found`)
      else gradeLegend.push({ grade: g, text: tex(m[1].trim()) })
    }
    const ind = /Sources count as independent[^]*?reference points\./.exec(s)
    independence = ind ? tex(ind[0]) : null
    if (!independence) fail('independence sentence not found')
  }
}

// ── §6: challenges and the deployment recipe ─────────────────────────────────
const challengesSection = mainSections.find((s) => /Challenges/.test(s.title))
const items = []
{
  const env = findEnvs(main, 'itemize').find((e) => e.body.includes('\\textbf{C1:'))
  if (!env) fail('main.tex: challenge list not found')
  else {
    for (const part of env.body.split('\\item').slice(1)) {
      const m = /^\s*\\textbf\{(C\d):\s*([^}]+?)\.?\}\s*([^]*)$/.exec(part)
      if (!m) { fail(`challenge item did not parse: ${part.slice(0, 50)}`); continue }
      items.push({ id: m[1], title: plain(m[2]), body: tex(m[3].trim()) })
    }
  }
}
if (items.map((c) => c.id).join() !== 'C1,C2,C3,C4,C5,C6') fail('§6 does not list C1 to C6')
const challengesIntro = (() => {
  const p = paraStarting('Six open challenges')
  return p ? tex(p.text) : (fail('challenges intro not found'), [])
})()

// Sections and subsections that each insight and challenge belongs to.
const tags = {}
for (const i of insights) {
  const at = i.subsection?.num || i.section?.num
  if (at) (tags[at] ||= []).push(i.id)
}
for (const c of items) (tags[challengesSection.num] ||= []).push(c.id)

// ── other passages the site quotes ───────────────────────────────────────────
const question = (() => {
  const m = findCommands(main, 'textit').find((c) => /reliably serve as judges/.test(c.args[0]))
  return m ? tex(m.args[0]) : (fail('research question not found'), [])
})()
const definition = (() => {
  const p = mainParas.find((x) => x.text.includes('we broaden the operational definition'))
  const q = p && mainParas[mainParas.indexOf(p) + 1]
  return p && q ? [tex(p.text), tex(q.text)] : (fail('SLM definition not found'), [])
})()
const definitionWhere = (() => {
  const p = mainParas.find((x) => x.text.includes('we broaden the operational definition'))
  const h = p && headingAt(p.start)
  return h ? { num: h.num, title: h.title, href: pdfHref(h.dest) } : (fail('definition heading not found'), null)
})()
const definitionShort = (() => {
  const p = mainParas.find((x) => x.text.includes('we broaden the operational definition'))
  const m = p && /operational definition:\s*([^]*?):\s*at one byte/.exec(p.text)
  const moe = p && /(For mixture-of-experts[^]*?next to it\.)/.exec(p.text)
  return m && moe ? { clause: tex(m[1]), moe: tex(moe[1]) } : (fail('short SLM definition not found'), null)
})()
const threshold = /\$\\leq\$\s*(\d+)B/.exec(abstractTex)
if (!threshold) fail('parameter threshold not found in the abstract')
const conclusionPara = (() => {
  const c = headings.find((h) => h.cmd === 'section' && /Conclusion/.test(h.title))
  const p = c && mainParas.find((x) => x.start > c.index && !x.text.startsWith('\\section') && !x.text.startsWith('\\label'))
  return p ? p.text : (fail('conclusion not found'), '')
})()
const keyFinding = (() => {
  const m = findCommands(conclusionPara, 'textbf')[0]
  return m ? plain(m.args[0]) : null
})()

// ── Table 3 (selected judge systems) ─────────────────────────────────────────
const judgeSystems = (() => {
  const rows = tabularRows(tabularBody(t3))
  const head = rows[0].map(plain)
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const byName = papers.filter((p) => p.name)
  const out = rows.slice(1).map((r) => {
    const cells = r.map((c) => tex(c))
    const sys = norm(plain(r[0]))
    const hit = byName.find((p) => norm(p.name) === sys) || byName.find((p) => sys.startsWith(norm(p.name)) && norm(p.name).length >= 4)
    if (!hit) warn(`Table 3: no paper for system ${plain(r[0])}`)
    return { cells, key: hit ? hit.key : null }
  })
  return { head, rows: out, caption: tex(findCommands(t3, 'caption')[0].args[0]) }
})()

// ── App. M: search, criteria, selection ──────────────────────────────────────
const method = (() => {
  const clean = appM.replace(/\s+/g, ' ')
  const stages = []
  for (const m of clean.matchAll(/\\node\[(?:stage|final)[^\]]*\]\s*\(s\d\)\s*\{([^]*?)\};/g)) {
    const body = m[1]
    const v = /\\textbf\{([^}]*)\}\s*$/.exec(body) || /\\textbf\{([^}]*)\}/.exec(body)
    const label = body.replace(/\\\\\[[^\]]*\]/g, '').replace(/\\textbf\{[^}]*\}\s*$/, '').trim()
    stages.push(label ? { label: plain(label), value: plain(v[1]) } : { label: plain(v[1].split(':')[0]), value: plain(v[1].split(':')[1] || '') })
  }
  const search = /We searched [^:]+:/.exec(clean)
  const queries = []
  const en = findEnvs(appM, 'enumerate')[0]
  if (en) for (const part of en.body.split('\\item').slice(1)) {
    const m = /^\s*\\textbf\{([^}]+?):?\}\s*([^]*)$/.exec(part)
    if (m) queries.push({ name: plain(m[1]).replace(/:$/, ''), query: tex(m[2].trim().replace(/\.$/, '')) })
  }
  const lists = findEnvs(appM, 'itemize').map((e) => e.body.split('\\item').slice(1).map((x) => tex(x.trim())))
  const flowCaption = /\\caption\{(Literature selection flow[^]*?)\}\s*\\label\{fig:selection_flow\}/.exec(appM)
  if (stages.length < 4 || !search || queries.length < 3 || lists.length < 2) fail('App. M did not parse')
  return {
    figure: L['fig:selection_flow']?.num || null,
    stages,
    // the caption's sentences about the counts (its first sentences describe the drawing)
    stagesNote: flowCaption && flowCaption[1].includes('Only the final count')
      ? tex(flowCaption[1].slice(flowCaption[1].indexOf('Only the final count')))
      : (fail('App. M: selection caption changed'), null),
    search: search ? tex(search[0].replace(/ using the following query families:$/, '.')) : null,
    queries,
    inclusion: lists[0] || [],
    exclusion: lists[1] || [],
    scope: paragraphCmd('Scope and Methodology.'),
  }
})()

// ── figures ──────────────────────────────────────────────────────────────────
const figures = outline.figures.map((f) => {
  const svg = read(path.join(SITE, 'public', 'figures', 'light', `${f.stem}.svg`)).slice(0, 4000)
  const vb = /viewBox="([\d.\s-]+)"/.exec(svg)
  const [, , w, h] = vb ? vb[1].trim().split(/\s+/).map(Number) : [0, 0, 0, 0]
  if (!w || !h) fail(`${f.stem}.svg: no viewBox`)
  if (!fs.existsSync(path.join(SITE, 'public', 'figures', 'dark', `${f.stem}.svg`))) fail(`${f.stem}: dark render missing`)
  const noCite = (t) => nodesToText(texToNodes(t, warn).filter((n) => n.t !== 'cite')).replace(/\s+([.,;])/g, '$1').trim()
  const captionText = noCite(f.caption)
  const sub = f.subcaption ? noCite(f.subcaption) : null
  // first sentence, not fooled by "vs." or "e.g."
  const ABBR = /\b(vs|e\.g|i\.e|et al|cf)\.\s/g
  const firstSentence = (s) => {
    const kept = s.replace(ABBR, (m, a) => `${a}․ `)
    const m = /^(.+?\.)(\s|$)/.exec(kept)
    return (m ? m[1] : kept).replace(/․/g, '.')
  }
  const where = f.where
  return {
    id: f.id,
    stem: f.stem,
    number: f.number,
    panel: f.panel,
    title: (sub ? firstSentence(sub) : firstSentence(captionText)).replace(/\.$/, ''),
    caption: tex(f.caption),
    subcaption: f.subcaption ? tex(f.subcaption) : null,
    where: where && {
      label: where.appendix ? `App. ${where.section}` : `§${where.section}`,
      title: where.title,
      href: pdfHref(where.subsection ? `subsection.${where.subsection}` : where.dest),
      sub: where.subsection,
      subLabel: where.subsection ? (where.appendix ? `App. ${where.subsection}` : `§${where.subsection}`) : null,
      subTitle: where.subsection
        ? outline.sections.find((x) => x.num === where.section)?.subsections.find((x) => x.num === where.subsection)?.title || null
        : null,
    },
    width: Math.round(w * 100) / 100,
    height: Math.round(h * 100) / 100,
    alt: `Figure ${f.id}: ${(sub || captionText).replace(/\s+/g, ' ')}`,
  }
})
figures.sort((a, b) => Number(a.number) - Number(b.number) || (a.panel || '').localeCompare(b.panel || ''))
const figureById = Object.fromEntries(figures.map((f) => [f.id, f]))
for (const c of corpus.categories) if (c.figure && !figures.some((f) => f.stem === c.figure)) fail(`category ${c.id}: figure ${c.figure} not found`)

// ── consistency with README.md and CITATION.cff ──────────────────────────────
{
  const readme = read(path.join(ROOT, 'README.md'))
  const block = /```bibtex\n([^]*?)\n```/.exec(readme)
  if (!block) fail('README.md has no ```bibtex block')
  else if (block[1].trim() !== config.bibtex.trim()) fail('site.config.mjs bibtex differs from the README citation block')
  // the README's generated corpus table must show the same counts as the site
  const corpusBlock = /<!-- BEGIN GENERATED: corpus -->([^]*?)<!-- END GENERATED: corpus -->/.exec(readme)
  if (!corpusBlock) fail('README.md has no generated corpus table')
  else {
    for (const c of data.categories) {
      const row = corpusBlock[1].split('\n').find((l) => l.includes(`(#${c.id})`))
      const nums = row ? [...row.matchAll(/\|\s*\**(\d+)\**\s*(?=\|)/g)].map((m) => Number(m[1])) : []
      const want = [byCat[c.id], ...YEAR_BINS.map((b) => papersIn.filter((p) => p.category === c.id && yearBin(p.year) === b).length)]
      if (nums.join() !== want.join()) fail(`README corpus row for ${c.id} shows ${nums.join('/')}, the data gives ${want.join('/')}; run scripts/build_readme.py`)
    }
    const totalRow = corpusBlock[1].split('\n').find((l) => l.includes('All works'))
    const tnums = totalRow ? [...totalRow.matchAll(/\|\s*\**(\d+)\**\s*(?=\|)/g)].map((m) => Number(m[1])) : []
    if (tnums.join() !== [total, ...YEAR_BINS.map((b) => byYear[b])].join()) fail('README corpus total row differs from the data; run scripts/build_readme.py')
  }
  const cff = YAML.parse(read(path.join(ROOT, 'CITATION.cff')))
  const pc = cff['preferred-citation'] || {}
  if (String(pc.status || '').toLowerCase() !== config.status) fail(`CITATION.cff status "${pc.status}" differs from site.config.mjs "${config.status}"`)
  if (Number(pc.year) !== config.year) fail(`CITATION.cff year ${pc.year} differs from site.config.mjs ${config.year}`)
  if (cff.url !== config.url) fail(`CITATION.cff url ${cff.url} differs from site.config.mjs ${config.url}`)
  const cffNames = (pc.authors || []).map((a) => `${a['given-names']} ${a['family-names']}`)
  if (cffNames.join('|') !== authors.map((a) => a.name).join('|')) fail('CITATION.cff authors differ from the paper')
  for (const a of cff.authors || []) {
    const name = `${a['given-names']} ${a['family-names']}`
    const pa = authors.find((x) => x.name === name)
    if (pa && a.email && a.email !== pa.email) fail(`CITATION.cff email for ${name} differs from the paper`)
  }
  // dark figures on the site should be the README's dark figures
  const readmeFigs = path.join(ROOT, 'assets', 'figures')
  if (fs.existsSync(readmeFigs)) {
    for (const f of figures) {
      const a = path.join(readmeFigs, `${f.stem}.svg`)
      if (!fs.existsSync(a)) warn(`assets/figures/${f.stem}.svg is missing (README)`)
    }
  }
}

// ── outline for the site ─────────────────────────────────────────────────────
const sectionsOut = outline.sections.filter((s) => s.num).map((s) => ({
  num: s.num,
  title: s.title,
  appendix: s.appendix,
  href: pdfHref(s.dest),
  tags: tags[s.num] || [],
  subsections: s.subsections.map((ss) => ({ num: ss.num, title: ss.title, href: pdfHref(ss.dest), tags: tags[ss.num] || [] })),
}))
const taxonomyPara = paragraphCmd('Taxonomy.')
const contributions = paragraphCmd('Contributions.')

// ── write ────────────────────────────────────────────────────────────────────
const site = {
  config: {
    url: config.url, base: config.base, repo: config.repo, venue: config.venue, status: config.status,
    year: config.year, pdf: config.paper.pdf, arxiv: config.paper.arxiv, bibtex: config.bibtex,
  },
  paper: { title, authors, affiliations, website: paperWebsite, github: paperGithub, pdfBytes: sync.pdf.bytes },
  abstract,
  question,
  definition,
  definitionShort,
  definitionWhere,
  threshold: threshold ? `≤${threshold[1]}B` : null,
  refs: Object.fromEntries(Object.entries({
    insightsTable: 'tab:insights', judgeSystemsTable: 'tab:judge_systems', methodology: 'app:methodology',
    future: 'app:future', evidence: 'app:evidence', challenges: 'sec:challenges', conclusion: 'sec:conclusion',
    taxonomy: 'fig:taxonomy', trends: 'fig:individual_trends', flowchart: 'fig:flowchart', coverage: 'fig:coverage_gap',
    selection: 'fig:selection_flow', domains: 'app:domains', provenance: 'app:provenance',
  }).map(([k, label]) => {
    const l = L[label]
    if (!l) { fail(`label ${label} not found`); return [k, null] }
    return [k, { num: l.num, kind: l.kind, title: l.title || null, href: l.dest ? pdfHref(l.dest) : null }]
  })),
  keyFinding,
  conclusion: tex(conclusionPara),
  taxonomy: taxonomyPara,
  sections: sectionsOut.filter((s) => !s.appendix),
  appendices: sectionsOut.filter((s) => s.appendix),
  gradeLegend,
  independence,
  insights,
  insightsCaption: t2caption,
  finding,
  challenges: items,
  challengesIntro,
  challengesSection: { num: challengesSection.num, title: challengesSection.title, href: pdfHref(challengesSection.dest) },
  deployment: paragraphCmd('From insights to deployment.'),
  deploymentSteps: sentences(paragraphCmd('From insights to deployment.')),
  judgeSystems,
  corpus,
  figures,
  citeIndex,
  counts: {
    works: total,
    insights: insights.length,
    challenges: items.length,
    figureFiles: figures.length,
    figureNumbers: new Set(figures.map((f) => f.number)).size,
    appendices: sectionsOut.filter((s) => s.appendix).length,
    sections: sectionsOut.filter((s) => !s.appendix).length,
    withCode: corpus.withCode,
  },
}

if (warnings.length) for (const w of warnings) console.warn(`build-data: warning: ${w}`)
if (errors.length) {
  for (const e of errors) console.error(`build-data: error: ${e}`)
  console.error(`build-data: ${errors.length} error(s); nothing written`)
  process.exit(1)
}
const outDir = path.join(SITE, 'src', 'generated')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'site.json'), JSON.stringify(site))
fs.writeFileSync(path.join(outDir, 'papers.json'), JSON.stringify(papers))
console.log(`build-data: ${total} works (${data.categories.map((c) => `${c.id} ${byCat[c.id]}`).join(', ')}); ` +
  `years ${YEAR_BINS.map((b) => byYear[b]).join('/')}; ${insights.length} insights, ${items.length} challenges, ` +
  `${figures.length} figure files; counts match App. M and the abstract`)
void figureById
void splitAuthors
