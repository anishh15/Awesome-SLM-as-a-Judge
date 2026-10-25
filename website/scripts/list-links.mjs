#!/usr/bin/env node
// List every external link the site shows, from the generated data
// (run `npm run data` first). Pages do not hard-code URLs; they all come from
// site.config.mjs, the paper's author block and data/papers.yaml.
//
//   npm run links                      # tab-separated: url, kind, where
//   npm run links -- --urls-only       # bare URLs
//   npm run links -- --check [out.tsv] # fetch each URL and report the status
//   npm run links -- --pdf-dests       # internal paper.pdf#... targets, one per line
//
// --check uses plain HTTP requests, so sites that block scripts (some return
// 403 or 429 to non-browsers) show up as "check in a browser".

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import config from '../site.config.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const GEN = path.resolve(HERE, '..', 'src', 'generated')
const site = JSON.parse(fs.readFileSync(path.join(GEN, 'site.json'), 'utf8'))
const papers = JSON.parse(fs.readFileSync(path.join(GEN, 'papers.json'), 'utf8'))
const args = process.argv.slice(2)

const links = new Map()
const add = (url, kind, where) => {
  if (!url) return
  if (!links.has(url)) links.set(url, { url, kind, where: [] })
  const e = links.get(url)
  if (!e.where.includes(where)) e.where.push(where)
}
const pdfDests = new Set()
const walk = (nodes, where) => {
  if (!Array.isArray(nodes)) return
  for (const n of nodes) {
    if (!n || typeof n !== 'object') continue
    if (n.t === 'a') add(n.href, 'text', where)
    if (n.t === 'ref' && n.href) pdfDests.add(n.href.split('#')[1])
    if (n.c) walk(n.c, where)
  }
}

// site-wide
add(config.url, 'site', 'canonical, og:url, BibTeX, plain citation')
add(`${config.url}${config.paper.pdf}`, 'site', 'citation_pdf_url meta tag')
add(config.repo, 'repo', 'header, footer, hero, cite page')
add(`${config.repo}/issues`, 'repo', 'footer, cite page')
for (const f of ['data/papers.yaml', 'CITATION.cff', 'CONTRIBUTING.md']) add(`${config.repo}/blob/main/${f}`, 'repo', 'footer, papers page, cite page')
if (config.paper.arxiv) add(config.paper.arxiv, 'paper', 'paper links')
for (const a of site.paper.authors) {
  if (a.url) add(a.url, 'author', 'hero, cite page')
  if (a.email) add(`mailto:${a.email}`, 'email', 'footer, cite page')
}

// paper text shown on the site
for (const [k, v] of Object.entries(site)) {
  if (Array.isArray(v)) {
    walk(v, k)
    for (const item of v) if (item && typeof item === 'object') for (const [f, x] of Object.entries(item)) walk(x, `${k}.${item.id || item.num || f}`)
  } else if (v && typeof v === 'object') {
    for (const [f, x] of Object.entries(v)) walk(x, `${k}.${f}`)
  }
}
for (const s of [...site.sections, ...site.appendices]) {
  pdfDests.add(s.href.split('#')[1])
  for (const ss of s.subsections) pdfDests.add(ss.href.split('#')[1])
}
for (const f of site.figures) pdfDests.add(f.where.href.split('#')[1])
for (const r of Object.values(site.refs)) if (r?.href) pdfDests.add(r.href.split('#')[1])

// the paper list
for (const p of papers) {
  for (const [kind, url] of Object.entries(p.links)) add(url, kind, p.key)
  for (const s of p.sections) {
    if (s.startsWith('§')) pdfDests.add(`section.${s.slice(1)}`)
    const m = /^App\. ([A-Z])/.exec(s)
    if (m) pdfDests.add(`appendix.${m[1]}`)
  }
}

const rows = [...links.values()].sort((a, b) => a.url.localeCompare(b.url))

if (args.includes('--pdf-dests')) {
  console.log([...pdfDests].sort().join('\n'))
} else if (args.includes('--check')) {
  const out = args[args.indexOf('--check') + 1]
  const results = await check(rows)
  const tsv = ['url\tkind\twhere\tstatus\tfinal_url\tnote', ...results.map((r) => [r.url, r.kind, r.where.join(','), r.status, r.final || '', r.note || ''].join('\t'))].join('\n') + '\n'
  if (out && !out.startsWith('--')) fs.writeFileSync(out, tsv)
  else process.stdout.write(tsv)
  const bad = results.filter((r) => !r.ok)
  console.error(`list-links: ${results.length} URLs checked, ${results.length - bad.length} ok, ${bad.length} to check by hand`)
} else if (args.includes('--urls-only')) {
  console.log(rows.map((r) => r.url).join('\n'))
} else {
  console.log(rows.map((r) => `${r.url}\t${r.kind}\t${r.where.join(',')}`).join('\n'))
  console.error(`list-links: ${rows.length} external URLs, ${pdfDests.size} PDF destinations`)
}

async function check(list) {
  const results = []
  let i = 0
  const worker = async () => {
    while (i < list.length) {
      const r = list[i++]
      if (r.url.startsWith('mailto:')) { results.push({ ...r, ok: true, status: 'mailto' }); continue }
      try {
        const res = await fetch(r.url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (link check for the SLM-as-a-Judge survey site)' } })
        const final = res.url !== r.url ? res.url : ''
        let note = ''
        if (res.ok && /arxiv\.org\/abs|aclanthology\.org|openreview\.net\/forum/.test(r.url)) {
          const html = await res.text()
          const t = /<meta name="citation_title" content="([^"]*)"/.exec(html)?.[1]
          note = t ? `title: ${t.replace(/\s+/g, ' ')}` : ''
        } else {
          res.body?.cancel()
        }
        results.push({ ...r, ok: res.ok, status: res.status, final, note: res.ok ? note : 'check in a browser' })
      } catch (e) {
        results.push({ ...r, ok: false, status: 'error', note: `${e.cause?.code || e.message}; check in a browser` })
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))
  return results.sort((a, b) => a.url.localeCompare(b.url))
}
