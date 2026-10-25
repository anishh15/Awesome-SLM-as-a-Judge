// Small LaTeX helpers shared by sync-paper.mjs and build-data.mjs.
// They cover the subset of LaTeX the survey uses in the parts the site shows:
// comments, \input, brace groups, a few environments, and inline markup.

import fs from 'node:fs'
import path from 'node:path'

/** Remove % comments (an unescaped % to the end of the line). */
export function stripComments(src) {
  return src
    .split('\n')
    .map((line) => {
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '\\') { i++; continue }
        if (line[i] === '%') return line.slice(0, i).replace(/\s+$/, '')
      }
      return line
    })
    .join('\n')
}

/** Read a {...} group starting at src[i] === '{'. Returns [content, indexAfter]. */
export function readGroup(src, i, open = '{', close = '}') {
  if (src[i] !== open) throw new Error(`expected ${open} at ${i}: ${src.slice(i, i + 40)}`)
  let depth = 0
  for (let j = i; j < src.length; j++) {
    const c = src[j]
    if (c === '\\') { j++; continue }
    if (c === open) depth++
    else if (c === close) {
      depth--
      if (depth === 0) return [src.slice(i + 1, j), j + 1]
    }
  }
  throw new Error(`unbalanced group at ${i}: ${src.slice(i, i + 60)}`)
}

/** Skip spaces (not blank lines) from i. */
export function skipSpace(src, i) {
  while (i < src.length && (src[i] === ' ' || src[i] === '\t' || src[i] === '\n')) i++
  return i
}

/**
 * Find every occurrence of \name and return its arguments.
 * spec is a string of 'o' (optional [..]) and 'm' (mandatory {..}).
 */
export function findCommands(src, name, spec = 'm') {
  const out = []
  const re = new RegExp(`\\\\${name}(?![A-Za-z])`, 'g')
  let m
  while ((m = re.exec(src))) {
    if (m.index > 0 && src[m.index - 1] === '\\') continue
    let i = m.index + m[0].length
    const args = []
    let ok = true
    for (const s of spec) {
      const k = skipSpace(src, i)
      if (s === 'o') {
        if (src[k] === '[') { const [c, e] = readGroup(src, k, '[', ']'); args.push(c); i = e } else args.push(null)
      } else {
        if (src[k] !== '{') { ok = false; break }
        const [c, e] = readGroup(src, k); args.push(c); i = e
      }
    }
    if (ok) out.push({ index: m.index, end: i, args })
  }
  return out
}

/** Content of \begin{env}...\end{env} blocks, with their positions. */
export function findEnvs(src, env) {
  const out = []
  const open = `\\begin{${env}}`
  const close = `\\end{${env}}`
  let from = 0
  for (;;) {
    const a = src.indexOf(open, from)
    if (a < 0) break
    const b = src.indexOf(close, a)
    if (b < 0) throw new Error(`unclosed ${env}`)
    out.push({ index: a, end: b + close.length, body: src.slice(a + open.length, b) })
    from = b + close.length
  }
  return out
}

/** Replace \input{file} recursively, relative to root. Returns the expanded source. */
export function expandInputs(root, file, seen = new Set()) {
  const full = path.join(root, file.endsWith('.tex') ? file : `${file}.tex`)
  if (seen.has(full)) throw new Error(`recursive \\input: ${full}`)
  seen.add(full)
  const src = stripComments(fs.readFileSync(full, 'utf8'))
  return src.replace(/\\input\{([^}]+)\}/g, (_, f) => expandInputs(root, f, seen))
}

/** Split a tabular body into rows of raw cells (no rules, no \rowcolor). */
export function tabularRows(body) {
  const cleaned = body
    .replace(/\\(toprule|midrule|bottomrule|hline)(\[[^\]]*\])?/g, '')
    .replace(/\\cmidrule(\([^)]*\))?\{[^}]*\}/g, '')
    .replace(/\\rowcolor\{[^}]*\}/g, '')
  const rows = []
  let depth = 0
  let cell = ''
  let row = []
  for (let i = 0; i < cleaned.length; i++) {
    const c = cleaned[i]
    if (c === '\\' && cleaned[i + 1] === '\\' && depth === 0) {
      row.push(cell.trim()); rows.push(row); row = []; cell = ''; i++
      continue
    }
    if (c === '\\') { cell += c + (cleaned[i + 1] || ''); i++; continue }
    if (c === '{') depth++
    if (c === '}') depth--
    if (c === '&' && depth === 0) { row.push(cell.trim()); cell = ''; continue }
    cell += c
  }
  if (cell.trim()) { row.push(cell.trim()); rows.push(row) }
  return rows.filter((r) => r.some((x) => x !== ''))
}

/** Body of the tabular environment inside a table file (column spec removed). */
export function tabularBody(src) {
  const k = src.indexOf('\\begin{tabular')
  if (k < 0) throw new Error('no tabular')
  let i = src.indexOf('}', k) + 1          // after \begin{tabular...}
  if (src.startsWith('{', skipSpace(src, i))) {
    // tabularx has a width argument before the column spec
    if (src.slice(k, i).includes('tabularx')) { const [, e] = readGroup(src, skipSpace(src, i)); i = e }
    const [, e] = readGroup(src, skipSpace(src, i))
    i = e
  }
  const end = src.indexOf('\\end{tabular', i)
  return src.slice(i, end)
}
