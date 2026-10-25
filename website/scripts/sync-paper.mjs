#!/usr/bin/env node
// Refresh the website's copy of the paper from the paper folder.
//
//   npm run sync -- --paper-dir PATH [--figures-dir PATH]
//
// The paper folder (the one with main.tex, appendix/, tables/ and the built
// main.pdf) comes from --paper-dir, else the PAPER_DIR environment variable,
// else the first line of website/.paper-dir (a local, git-ignored file).
// The figure folder defaults to ../../figure_source (the folder with light/
// and dark/ renders from render_all.py).
//
// What it writes (all committed, so the site builds without the paper folder):
//   paper/main.tex, paper/tables/*.tex, paper/appendix/M_methodology.tex
//       comment-free copies of the files whose text the site shows
//   paper/outline.json
//       the paper's numbering, computed from the full source: sections and
//       appendices, every \label with its printed number, every figure with
//       its caption and location
//   paper/SYNC.json        file hashes and the date of the sync
//   public/paper.pdf       the built paper (main.pdf)
//   public/figures/light/*.svg, public/figures/dark/*.svg
//       the 17 figures rendered by figure_source (render_all.py --fmt svg,png
//       for light, --theme dark for dark)
//
// The paper list itself is not here: it lives in ../data/papers.yaml and
// ../data/references.bib, which ../scripts/sync_bib.py refreshes.

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { expandInputs, stripComments } from './lib/tex.mjs'
import { walkPaper } from './lib/outline.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.resolve(HERE, '..')
const args = process.argv.slice(2)
const opt = (name, def) => { const k = args.indexOf(name); return k >= 0 ? args[k + 1] : def }
const localDir = (() => {
  try { return fs.readFileSync(path.join(SITE, '.paper-dir'), 'utf8').split('\n')[0].trim() } catch { return '' }
})()
const paperArg = opt('--paper-dir', process.env.PAPER_DIR || localDir)
if (!paperArg) {
  console.error('sync-paper: give the paper folder with --paper-dir PATH, PAPER_DIR=PATH, or a website/.paper-dir file')
  process.exit(1)
}
const PAPER = path.resolve(SITE, paperArg)
const FIGS = path.resolve(SITE, opt('--figures-dir', process.env.FIGURES_DIR || '../../figure_source'))

// Files whose text the site shows. Everything else is only read for numbering.
const COPY = [
  'main.tex',
  'tables/2_insight_summary.tex',
  'tables/3_judge_systems.tex',
  'appendix/M_methodology.tex',
]

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16)
const die = (msg) => { console.error(`sync-paper: ${msg}`); process.exit(1) }
const write = (rel, data) => {
  const out = path.join(SITE, rel)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, data)
}

if (!fs.existsSync(path.join(PAPER, 'main.tex'))) die(`no main.tex in ${PAPER} (use --paper-dir)`)
if (!fs.existsSync(path.join(PAPER, 'main.pdf'))) die(`no main.pdf in ${PAPER}; build the paper first`)
for (const theme of ['light', 'dark']) {
  if (!fs.existsSync(path.join(FIGS, theme))) die(`no ${theme}/ in ${FIGS}; run render_all.py there first`)
}

// 1. Text sources, without comments.
const files = {}
fs.rmSync(path.join(SITE, 'paper'), { recursive: true, force: true })
for (const rel of COPY) {
  const src = stripComments(fs.readFileSync(path.join(PAPER, rel), 'utf8'))
  write(path.join('paper', rel), src.replace(/\n{3,}/g, '\n\n'))
  files[rel] = sha(src)
}

// 2. Numbering from the full source.
const full = expandInputs(PAPER, 'main.tex')
const body = full.slice(full.indexOf('\\begin{document}'))
const { sections, labels, figures, tables } = walkPaper(body)

// Table files are named after their table number; check the walk agrees.
for (const f of fs.readdirSync(path.join(PAPER, 'tables'))) {
  const n = /^(\d+)_/.exec(f)?.[1]
  const src = stripComments(fs.readFileSync(path.join(PAPER, 'tables', f), 'utf8'))
  const lab = /\\label\{([^}]+)\}/.exec(src)?.[1]
  if (n && lab && labels[lab] && labels[lab].num !== n) die(`table ${f}: numbered ${labels[lab].num} by the walk`)
}

// 3. Figures: the rendered SVGs, matched to the paper's \includegraphics.
const stems = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)).sort()
const light = stems(path.join(FIGS, 'light'))
const dark = stems(path.join(FIGS, 'dark'))
if (light.join() !== dark.join()) die(`light and dark renders differ: ${light} vs ${dark}`)
const used = new Map()
for (const f of figures) {
  for (const img of f.images) used.set(img, { fig: f, panel: null })
  for (const s of f.subfigs) for (const img of s.images) used.set(img, { fig: f, panel: s })
}
const figOut = []
for (const stem of light) {
  const u = used.get(stem)
  if (!u) die(`figure ${stem}.svg is not used in the paper`)
  const prefix = /^(\d+)([a-z]?)_/.exec(stem)
  const num = u.panel ? `${u.fig.num}${u.panel.panel}` : u.fig.num
  if (!prefix || `${prefix[1]}${prefix[2]}` !== num) die(`figure ${stem}: the paper numbers it ${num}`)
  figOut.push({
    stem,
    id: num,
    number: u.fig.num,
    panel: u.panel ? u.panel.panel : null,
    label: u.panel ? u.panel.label : u.fig.label,
    parentLabel: u.fig.label,
    caption: u.fig.caption,
    subcaption: u.panel ? u.panel.caption : null,
    where: u.fig.where,
  })
}
const missing = [...used.keys()].filter((s) => !light.includes(s))
if (missing.length) console.warn(`sync-paper: figures in the paper without a render: ${missing.join(', ')}`)

const outline = {
  note: 'Generated by scripts/sync-paper.mjs from the paper source. Do not edit.',
  sections: sections.map(({ titleTex, ...s }) => s),
  labels,
  figures: figOut,
  tables: tables.map((t) => ({ num: t.num, label: t.label })),
}
write('paper/outline.json', JSON.stringify(outline, null, 2) + '\n')

// 4. PDF and figure files.
const pdf = fs.readFileSync(path.join(PAPER, 'main.pdf'))
write('public/paper.pdf', pdf)
const figHashes = {}
for (const theme of ['light', 'dark']) {
  const outDir = path.join(SITE, 'public', 'figures', theme)
  fs.rmSync(outDir, { recursive: true, force: true })
  fs.mkdirSync(outDir, { recursive: true })
  for (const stem of light) {
    const buf = fs.readFileSync(path.join(FIGS, theme, `${stem}.svg`))
    fs.writeFileSync(path.join(outDir, `${stem}.svg`), buf)
    figHashes[stem] = { ...(figHashes[stem] || {}), [theme]: sha(buf) }
  }
}

write('paper/SYNC.json', JSON.stringify({
  note: 'Written by scripts/sync-paper.mjs. Hashes are the first 16 hex digits of SHA-256.',
  syncedAt: new Date().toISOString().slice(0, 10),
  pdf: { bytes: pdf.length, sha256: sha(pdf) },
  files,
  figures: figHashes,
}, null, 2) + '\n')

const nApp = sections.filter((s) => s.appendix && s.num).length
const nSec = sections.filter((s) => !s.appendix && s.num).length
console.log(`sync-paper: ${nSec} sections, ${nApp} appendices, ${Object.keys(labels).length} labels, ` +
  `${figOut.length} figure files (${new Set(figOut.map((f) => f.number)).size} figures), ` +
  `paper.pdf ${(pdf.length / 1e6).toFixed(2)} MB`)
