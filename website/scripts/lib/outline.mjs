// Walk the expanded paper source the way LaTeX numbers it, and return the
// outline (sections, appendices), every \label with its printed number, and
// every figure with its caption. Used by sync-paper.mjs.

import { readGroup, skipSpace } from './tex.mjs'
import { texToText } from './inline.mjs'

const TOKEN = /\\(appendix|section|subsection|subsubsection|paragraph|label|caption|includegraphics|begin|end|bibliography)(?![A-Za-z])(\*?)/g

export function walkPaper(src) {
  const sections = []
  const labels = {}
  const figures = []
  const tables = []
  let inAppendix = false
  let sec = 0, appendix = 0, sub = 0, subsub = 0
  let fig = 0, tab = 0, eq = 0
  let last = null                 // the object the next \label attaches to
  let current = null              // current section (for figure locations)
  let currentSub = null
  const envStack = []
  let figEnv = null               // { num, captions:[], subfigs:[], images:[] }
  let subfig = null
  const letter = (n) => String.fromCharCode(64 + n)

  let m
  TOKEN.lastIndex = 0
  while ((m = TOKEN.exec(src))) {
    if (m.index > 0 && src[m.index - 1] === '\\') continue
    const [, cmd, star] = m
    let i = m.index + m[0].length
    const arg = () => {
      let k = skipSpace(src, i)
      if (src[k] === '[') { const [, e] = readGroup(src, k, '[', ']'); k = skipSpace(src, e) }
      if (src[k] !== '{') return null
      const [a, e] = readGroup(src, k)
      i = e
      TOKEN.lastIndex = e
      return a
    }
    if (cmd === 'bibliography') { last = null; continue }
    if (cmd === 'appendix') { inAppendix = true; continue }
    if (cmd === 'section' || cmd === 'subsection' || cmd === 'subsubsection' || cmd === 'paragraph') {
      const title = arg()
      if (title === null) continue
      if (cmd === 'paragraph') continue
      if (star) {
        if (cmd === 'section') {
          current = { num: null, title: texToText(title), starred: true, subsections: [], appendix: inAppendix }
          sections.push(current)
          currentSub = null
          last = null
        }
        continue
      }
      if (cmd === 'section') {
        sub = 0; subsub = 0
        let num, dest
        if (inAppendix) { appendix++; num = letter(appendix); dest = `appendix.${num}` }
        else { sec++; num = String(sec); dest = `section.${num}` }
        current = { num, title: texToText(title), titleTex: title, dest, appendix: inAppendix, subsections: [] }
        sections.push(current)
        currentSub = null
        last = { kind: inAppendix ? 'appendix' : 'section', num, dest, title: current.title }
      } else if (cmd === 'subsection') {
        sub++; subsub = 0
        const num = `${current.num}.${sub}`
        currentSub = { num, title: texToText(title), dest: `subsection.${num}` }
        current.subsections.push(currentSub)
        last = { kind: 'subsection', num, dest: currentSub.dest, title: currentSub.title }
      } else {
        subsub++
        const num = `${current.num}.${sub}.${subsub}`
        last = { kind: 'subsubsection', num, title: texToText(title), dest: `subsubsection.${num}` }
      }
      continue
    }
    if (cmd === 'begin' || cmd === 'end') {
      const env = arg()
      if (env === null) continue
      if (cmd === 'begin') {
        envStack.push(env)
        if (env === 'figure' || env === 'figure*') {
          figEnv = { images: [], subfigs: [], caption: null, label: null, where: whereOf(current, currentSub) }
        } else if (env === 'subfigure') {
          subfig = { images: [], caption: null, label: null }
        } else if (env === 'table' || env === 'table*') {
          figEnv = null
        } else if (env === 'equation' || env === 'align') {
          eq++; last = { kind: 'equation', num: String(eq) }
        }
      } else {
        envStack.pop()
        if (env === 'subfigure' && figEnv && subfig) { figEnv.subfigs.push(subfig); subfig = null }
        if ((env === 'figure' || env === 'figure*') && figEnv) { figures.push(figEnv); figEnv = null }
      }
      continue
    }
    if (cmd === 'includegraphics') {
      const file = arg()
      if (file && (subfig || figEnv)) (subfig || figEnv).images.push(file.replace(/^figures\//, '').replace(/\.pdf$/, ''))
      continue
    }
    if (cmd === 'caption') {
      const cap = arg()
      if (cap === null) continue
      const inTable = envStack.some((e) => e === 'table' || e === 'table*')
      if (subfig && figEnv) {
        const idx = figEnv.subfigs.length
        subfig.caption = cap
        subfig.panel = String.fromCharCode(97 + idx)
        last = { kind: 'subfigure', num: `${fig + 1}${subfig.panel}`, panel: subfig.panel, target: subfig }
      } else if (figEnv && !inTable) {
        fig++
        figEnv.num = String(fig)
        figEnv.caption = cap
        for (const s of figEnv.subfigs) if (s.labelRef) s.labelRef.num = `${fig}${s.panel}`
        last = { kind: 'figure', num: String(fig), target: figEnv }
      } else if (inTable) {
        tab++
        const t = { num: String(tab), caption: cap, label: null }
        tables.push(t)
        last = { kind: 'table', num: String(tab), target: t }
      }
      continue
    }
    if (cmd === 'label') {
      const name = arg()
      if (name === null || !last) continue
      const entry = { kind: last.kind, num: last.num }
      if (last.dest) entry.dest = last.dest
      if (last.title) entry.title = last.title
      if (last.panel) entry.panel = last.panel
      labels[name] = entry
      if (last.target) last.target.label = name
      if (last.kind === 'subfigure') last.target.labelRef = entry
      continue
    }
  }

  // Subfigure numbers are only known once the parent caption is read.
  for (const f of figures) {
    for (const s of f.subfigs) {
      if (s.label && labels[s.label]) labels[s.label].num = `${f.num}${s.panel}`
      delete s.labelRef
    }
  }
  return { sections, labels, figures, tables }
}

function whereOf(sec, sub) {
  if (!sec) return null
  return {
    section: sec.num,
    title: sec.title,
    appendix: !!sec.appendix,
    dest: sec.dest,
    subsection: sub ? sub.num : null,
  }
}
