// Minimal BibTeX reader: entries with their raw text, field values and
// author names, plus the natbib author-year labels that acl_natbib.bst prints
// (for example "Li et al., 2024b").

import { readGroup } from './tex.mjs'
import { texToText } from './inline.mjs'

export function parseBib(src) {
  const entries = []
  const re = /@([A-Za-z]+)\s*\{/g
  let m
  while ((m = re.exec(src))) {
    const type = m[1].toLowerCase()
    if (type === 'comment' || type === 'preamble' || type === 'string') continue
    const open = m.index + m[0].length - 1
    const [body, end] = readGroup(src, open)
    const comma = body.indexOf(',')
    const key = body.slice(0, comma).trim()
    const fields = {}
    let i = comma + 1
    while (i < body.length) {
      const fm = /^\s*([A-Za-z_-]+)\s*=\s*/.exec(body.slice(i))
      if (!fm) break
      const name = fm[1].toLowerCase()
      i += fm[0].length
      let value
      if (body[i] === '{') { const [v, e] = readGroup(body, i); value = v; i = e }
      else if (body[i] === '"') { const e = body.indexOf('"', i + 1); value = body.slice(i + 1, e); i = e + 1 }
      else { const vm = /^[^,\s}]+/.exec(body.slice(i)); value = vm[0]; i += vm[0].length }
      fields[name] = value.replace(/\s+/g, ' ').trim()
      const cm = /^\s*,?/.exec(body.slice(i)); i += cm[0].length
    }
    entries.push({ type, key, fields, raw: src.slice(m.index, end).trim() })
    re.lastIndex = end
  }
  return entries
}

/** Split a bib author field into names; "others" marks a truncated list. */
export function splitAuthors(field) {
  const parts = []
  let depth = 0
  let cur = ''
  const s = field.replace(/\s+/g, ' ')
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '{') depth++
    if (c === '}') depth--
    if (depth === 0 && s.slice(i, i + 5).toLowerCase() === ' and ') { parts.push(cur.trim()); cur = ''; i += 4; continue }
    cur += c
  }
  if (cur.trim()) parts.push(cur.trim())
  return parts.map(parseName)
}

/** BibTeX name parts: "First von Last" or "von Last, Jr, First". */
export function parseName(raw) {
  if (raw.toLowerCase() === 'others') return { others: true, raw }
  const words = (s) => {
    const out = []; let depth = 0; let cur = ''
    for (const c of s.trim()) {
      if (c === '{') depth++
      if (c === '}') depth--
      if (c === ' ' && depth === 0) { if (cur) out.push(cur); cur = ''; continue }
      cur += c
    }
    if (cur) out.push(cur)
    return out
  }
  const isLower = (w) => !w.startsWith('{') && /^[a-z]/.test(w.replace(/^\\[^A-Za-z]/, ''))
  const commas = splitTop(raw, ',')
  let first = [], von = [], last = []
  if (commas.length === 1) {
    const w = words(raw)
    let k = 0
    while (k < w.length - 1 && !isLower(w[k])) first.push(w[k++])
    while (k < w.length - 1 && isLower(w[k])) von.push(w[k++])
    last = w.slice(k)
    if (!last.length) { last = first.slice(-1); first = first.slice(0, -1) }
  } else {
    const w = words(commas[0])
    let k = 0
    while (k < w.length - 1 && isLower(w[k])) von.push(w[k++])
    last = w.slice(k)
    first = words(commas[commas.length - 1])
  }
  const txt = (a) => texToText(a.join(' '))
  return { first: txt(first), von: txt(von), last: txt(last), raw }
}

function splitTop(s, sep) {
  const out = []; let depth = 0; let cur = ''
  for (const c of s) {
    if (c === '{') depth++
    if (c === '}') depth--
    if (c === sep && depth === 0) { out.push(cur); cur = ''; continue }
    cur += c
  }
  out.push(cur)
  return out.map((x) => x.trim())
}

/** natbib's short author string: "Last", "Last and Last", or "Last et al.". */
export function authorLabel(names) {
  const real = names.filter((n) => !n.others)
  const sur = (n) => [n.von, n.last].filter(Boolean).join(' ')
  if (real.length === 1 && real.length === names.length) return sur(real[0])
  if (real.length === 2 && names.length === 2) return `${sur(real[0])} and ${sur(real[1])}`
  return `${sur(real[0])} et al.`
}

/**
 * Author-year labels with the a/b/c suffixes natbib adds when two works share
 * the same short label and year. The suffix order follows the bibliography
 * order of acl_natbib.bst: authors (last then first names), then year, then title.
 */
export function natbibLabels(entries) {
  const purify = (s) => texToText(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
  const rows = entries.map((e) => {
    const names = splitAuthors(e.fields.author || e.fields.editor || '')
    const sortNames = names.map((n) => n.others ? 'et al' : `${n.von} ${n.last} ${n.first}`).join('   ')
    return {
      key: e.key,
      names,
      label: authorLabel(names),
      year: (e.fields.year || '').trim(),
      sort: `${purify(sortNames)}    ${e.fields.year}    ${purify(e.fields.title)}`,
    }
  })
  rows.sort((a, b) => (a.sort < b.sort ? -1 : a.sort > b.sort ? 1 : 0))
  const groups = new Map()
  for (const r of rows) {
    const g = `${r.label}|${r.year}`
    if (!groups.has(g)) groups.set(g, [])
    groups.get(g).push(r)
  }
  const out = {}
  for (const list of groups.values()) {
    list.forEach((r, idx) => {
      const suffix = list.length > 1 ? String.fromCharCode(97 + idx) : ''
      out[r.key] = { author: r.label, year: r.year + suffix, order: rows.indexOf(r) }
    })
  }
  return out
}
