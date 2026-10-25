// Convert inline LaTeX (the markup used in the survey's running text, table
// cells and captions) into a small JSON tree the site renders with React.
//
// Node types: plain strings, and objects
//   { t: 'b' | 'i' | 'sc' | 'tt' | 'sup' | 'sub' | 'math', c: [...] }
//   { t: 'cite', keys: [...], mode: 'p' | 't' }       \citep / \citet
//   { t: 'ref', label, sub: bool }                       \ref / \subref
//   { t: 'a', href, c: [...] }                           \href / \url
// Unknown macros are reported through `warn` and their arguments are kept.

import { readGroup } from './tex.mjs'

const SYMBOLS = {
  S: '§', ldots: '…', dots: '…', textendash: '–', textemdash: '—', textbar: '|',
  checkmark: '✓', dag: '†', dagger: '†', ddag: '‡', textasciitilde: '~', copyright: '©',
  textquoteright: '’', textquoteleft: '‘', textbullet: '•', ae: 'æ', o: 'ø', ss: 'ß',
  i: 'ı', l: 'ł', L: 'Ł', AA: 'Å', aa: 'å', LaTeX: 'LaTeX', TeX: 'TeX',
}
const MATH = {
  leq: '≤', le: '≤', geq: '≥', ge: '≥', times: '×', sim: '~', approx: '≈', gg: '≫', ll: '≪',
  star: '*', theta: 'θ', nu: 'ν', pi: 'π', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ',
  epsilon: 'ε', varepsilon: 'ε', kappa: 'κ', lambda: 'λ', mu: 'μ', sigma: 'σ', tau: 'τ', phi: 'φ', rho: 'ρ',
  rightarrow: '→', to: '→', leftarrow: '←', Rightarrow: '⇒', infty: '∞', cdot: '·', pm: '±',
  neq: '≠', ne: '≠', in: '∈', mid: '|', sum: '∑', prod: '∏', dagger: '†', ldots: '…', cdots: '⋯',
  argmax: 'argmax', argmin: 'argmin', log: 'log', exp: 'exp', max: 'max', min: 'min',
  uparrow: '↑', downarrow: '↓', circ: '∘', bullet: '•', prime: '′', percent: '%',
}
const IGNORE = new Set([
  'xspace', 'noindent', 'centering', 'small', 'footnotesize', 'normalsize', 'scriptsize', 'large',
  'Large', 'raggedright', 'par', 'left', 'right', 'big', 'Big', 'bigl', 'bigr', 'displaystyle',
  'textstyle', 'nobreak', 'allowbreak', 'hfill', 'quad', 'qquad', 'newline', 'linebreak', 'bfseries',
  'itshape', 'protect', 'relax', 'smallskip', 'medskip', 'bigskip', 'vfill',
])
const WRAP = { textbf: 'b', bf: 'b', textit: 'i', emph: 'i', it: 'i', textsc: 'sc', texttt: 'tt',
  textsuperscript: 'sup', textsubscript: 'sub', mathbf: 'b', boldsymbol: 'b' }
const PASS = new Set(['text', 'mbox', 'textrm', 'textnormal', 'mathrm', 'mathcal', 'mathbb', 'mathit',
  'operatorname', 'underline', 'textsf', 'makecell', 'hbox', 'ensuremath'])
const SKIP_ARG = new Set(['label', 'vspace', 'hspace', 'footnotemark', 'index', 'phantom', 'hypertarget'])
const ACCENT = { '"': '̈', "'": '́', '`': '̀', '^': '̂', '~': '̃',
  '=': '̄', '.': '̇', u: '̆', v: '̌', c: '̧', H: '̋', k: '̨', r: '̊' }

export function texToNodes(tex, warn = () => {}) {
  const nodes = parse(tex, false, warn)
  return normalize(nodes)
}

/** Plain text of a node list (used for search, titles and alt text). */
export function nodesToText(nodes) {
  if (typeof nodes === 'string') return nodes
  if (!Array.isArray(nodes)) nodes = [nodes]
  return nodes.map((n) => {
    if (typeof n === 'string') return n
    if (n.t === 'cite') return `[${n.keys.join(', ')}]`
    if (n.t === 'ref') return n.text ?? `?${n.label}`
    return nodesToText(n.c || [])
  }).join('').replace(/\s+/g, ' ')
}

/** Convert a short LaTeX string (a bib field, a section title) to plain text. */
export function texToText(tex, warn) {
  return nodesToText(texToNodes(tex, warn)).trim()
}

function parse(src, math, warn) {
  const out = []
  let i = 0
  const push = (x) => out.push(x)
  while (i < src.length) {
    const c = src[i]
    if (c === '\\') {
      const m = /^\\([A-Za-z]+)\*?/.exec(src.slice(i))
      if (!m) {
        const nx = src[i + 1]
        if (nx === undefined) { i++; continue }
        if (ACCENT[nx] && !math && /[^A-Za-z]/.test(nx)) {
          const [base, end] = accentArg(src, i + 2)
          push((base + ACCENT[nx]).normalize('NFC')); i = end; continue
        }
        if (nx === '\\') { push(' '); i += 2; continue }
        if (nx === ',' ) { push(' '); i += 2; continue }
        if (nx === ' ' || nx === '\n') { push(' '); i += 2; continue }
        if (nx === '-' || nx === '!' || nx === '/' || nx === ';' || nx === ':' || nx === '@') {
          if (nx === ';' || nx === ':') push(' ')
          i += 2; continue
        }
        push(nx); i += 2; continue           // \% \& \_ \# \$ \{ \}
      }
      const name = m[1]
      i += m[0].length
      if (ACCENT[name] && name.length === 1 && !math) {
        const [base, end] = accentArg(src, i)
        push((base + ACCENT[name]).normalize('NFC')); i = end; continue
      }
      if (math && MATH[name] !== undefined) { push(MATH[name]); continue }
      if (!math && (name === 'leq' || name === 'geq' || name === 'times' || name === 'sim' || name === 'approx')) { push(MATH[name]); continue }
      if (SYMBOLS[name] !== undefined) { push(SYMBOLS[name]); if (src[i] === '{' && src[i + 1] === '}') i += 2; continue }
      if (IGNORE.has(name)) { if (name === 'left' || name === 'right') i = skipDelim(src, i); continue }
      if (name === 'ding') { const [a, e] = readGroup(src, skipWs(src, i)); push({ 51: '✓', 55: '✗', 108: '●' }[a.trim()] || ''); i = e; continue }
      if (name === 'textcolor' || name === 'colorbox') { const [, e1] = readGroup(src, skipWs(src, i)); const [a, e2] = readGroup(src, skipWs(src, e1)); out.push(...parse(a, math, warn)); i = e2; continue }
      if (name === 'color') { const [, e] = readGroup(src, skipWs(src, i)); i = e; continue }
      if (SKIP_ARG.has(name)) { i = skipWs(src, i); if (src[i] === '{') i = readGroup(src, i)[1]; continue }
      if (name === 'footnote') { i = skipWs(src, i); if (src[i] === '{') i = readGroup(src, i)[1]; continue }
      if (WRAP[name]) {
        i = skipWs(src, i)
        if (src[i] === '{') { const [a, e] = readGroup(src, i); push({ t: WRAP[name], c: parse(a, math, warn) }); i = e }
        continue
      }
      if (PASS.has(name)) {
        i = skipWs(src, i)
        if (src[i] === '{') { const [a, e] = readGroup(src, i); out.push(...parse(a, name.startsWith('math') || name === 'operatorname' ? math : false, warn)); i = e }
        continue
      }
      if (/^cite[pt]?$|^citealp$|^citeauthor$|^citeyear$/.test(name)) {
        i = skipWs(src, i)
        while (src[i] === '[') i = readGroup(src, i, '[', ']')[1]
        const [a, e] = readGroup(src, skipWs(src, i))
        push({ t: 'cite', keys: a.split(',').map((k) => k.trim()).filter(Boolean), mode: name === 'citet' ? 't' : 'p' })
        i = e; continue
      }
      if (name === 'ref' || name === 'autoref' || name === 'subref' || name === 'eqref' || name === 'pageref') {
        const [a, e] = readGroup(src, skipWs(src, i))
        push({ t: 'ref', label: a.trim(), sub: name === 'subref', kind: name })
        i = e; continue
      }
      if (name === 'href') {
        const [u, e1] = readGroup(src, skipWs(src, i)); const [a, e2] = readGroup(src, skipWs(src, e1))
        push({ t: 'a', href: u, c: parse(a, false, warn) }); i = e2; continue
      }
      if (name === 'url') { const [u, e] = readGroup(src, skipWs(src, i)); push({ t: 'a', href: u, c: [u] }); i = e; continue }
      if (name === 'frac' || name === 'tfrac' || name === 'dfrac') {
        let a, b, e
        if (src[i] === '{') { [a, e] = readGroup(src, i); [b, e] = readGroup(src, skipWs(src, e)) } else { a = src[i]; b = src[i + 1]; e = i + 2 }
        if (a === '1' && b === '2') push('½')
        else { out.push(...parse(a, true, warn)); push('/'); out.push(...parse(b, true, warn)) }
        i = e; continue
      }
      if (name === 'binom') {
        const [a, e1] = readGroup(src, skipWs(src, i)); const [b, e2] = readGroup(src, skipWs(src, e1))
        push('C('); out.push(...parse(a, true, warn)); push(','); out.push(...parse(b, true, warn)); push(')'); i = e2; continue
      }
      if (name === 'natexlab') { const [a, e] = readGroup(src, skipWs(src, i)); push(a); i = e; continue }
      if (name === 'faGlobe' || name === 'faGithub' || name === 'textsuperscript') { continue }
      warn(`unknown macro \\${name}`)
      continue
    }
    if (c === '$') {
      const j = src.indexOf('$', i + 1)
      if (j < 0) { push('$'); i++; continue }
      push({ t: 'math', c: parse(src.slice(i + 1, j), true, warn) })
      i = j + 1; continue
    }
    if (math && (c === '^' || c === '_')) {
      let a, e
      if (src[i + 1] === '{') [a, e] = readGroup(src, i + 1)
      else if (src[i + 1] === '\\') { const m2 = /^\\[A-Za-z]+/.exec(src.slice(i + 1)); a = m2[0]; e = i + 1 + a.length }
      else { a = src[i + 1]; e = i + 2 }
      push({ t: c === '^' ? 'sup' : 'sub', c: parse(a, true, warn) }); i = e; continue
    }
    if (c === '{') { const [a, e] = readGroup(src, i); out.push(...parse(a, math, warn)); i = e; continue }
    if (c === '}') { i++; continue }
    if (c === '~') { push(math ? ' ' : ' '); i++; continue }
    if (!math && c === '-' && src[i + 1] === '-') {
      if (src[i + 2] === '-') { push('—'); i += 3 } else { push('–'); i += 2 }
      continue
    }
    if (!math && c === '`' && src[i + 1] === '`') { push('“'); i += 2; continue }
    if (!math && c === "'" && src[i + 1] === "'") { push('”'); i += 2; continue }
    if (!math && c === '`') { push('‘'); i++; continue }
    if (math && c === ' ') { i++; continue }
    if (c === '&') { push(' '); i++; continue }
    push(c); i++
  }
  return out
}

function accentArg(src, i) {
  if (src[i] === '{') {
    const [a, e] = readGroup(src, i)
    const base = a.replace(/^\\i$/, 'i').replace(/^\\j$/, 'j')
    return [base, e]
  }
  if (src[i] === '\\' && (src[i + 1] === 'i' || src[i + 1] === 'j')) return [src[i + 1], i + 2]
  return [src[i] || '', i + 1]
}

function skipWs(src, i) { while (src[i] === ' ' || src[i] === '\n') i++; return i }
function skipDelim(src, i) { if (src[i] === '\\') return i + 2; return i + 1 }

function normalize(nodes) {
  const out = []
  for (const n of nodes) {
    if (typeof n === 'string') {
      if (typeof out[out.length - 1] === 'string') out[out.length - 1] += n
      else out.push(n)
    } else {
      if (n.c) n.c = normalize(n.c)
      out.push(n)
    }
  }
  for (let k = 0; k < out.length; k++) {
    if (typeof out[k] === 'string') out[k] = out[k].replace(/[ \t\n]+/g, ' ')
  }
  // trim the ends
  if (typeof out[0] === 'string') out[0] = out[0].replace(/^\s+/, '')
  const last = out.length - 1
  if (typeof out[last] === 'string') out[last] = out[last].replace(/\s+$/, '')
  return out.filter((n) => n !== '')
}
