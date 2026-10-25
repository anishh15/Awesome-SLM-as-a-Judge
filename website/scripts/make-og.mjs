#!/usr/bin/env node
// Draw the social preview image (the picture in link cards on Slack, X,
// LinkedIn) from an SVG built here, in the layout of the README banner
// (assets/banner.svg) and the site's dark palette.
//
//   npm run og                          # public/og.png, 1200 x 630
//   npm run og -- --github OUT.png      # also a 1280 x 640 copy for GitHub's
//                                        # repository social preview (or set
//                                        # OG_GITHUB_OUT=OUT.png)
//   npm run og -- --svg OUT.svg         # also keep the SVG source
//
// The counts and author names come from src/generated/site.json (run
// `npm run data` first). The PNG is drawn by headless Chrome; set CHROME to
// its path if it is not in the usual place.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.resolve(HERE, '..')
const site = JSON.parse(fs.readFileSync(path.join(SITE, 'src/generated/site.json'), 'utf8'))
const args = process.argv.slice(2)
const opt = (name) => { const k = args.indexOf(name); return k >= 0 ? args[k + 1] : null }

// Palette: the site's dark theme (src/styles/tokens.css) and the banner's chips.
const C = {
  bgTop: '#06120f', bgBottom: '#0a1b17', primary: '#1f4d47', mid: '#1b7a64', accent: '#3db8a0',
  bright: '#5ce0c5', pale: '#a8f0de', text: '#e8f5f0', text2: '#b4cec6', card: '#0a1b17',
  gold: '#b8860b', goldLine: '#e0b43e', goldText: '#e9c46a', slate: '#3b6ea5', slateLine: '#6e9bd0', slateText: '#a9c4e6',
}

const FONT = fs.readFileSync(path.join(SITE, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')).toString('base64')

// Deterministic star field.
function stars(W, H, n, seed) {
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  return Array.from({ length: n }, () => ({ x: rnd() * W, y: rnd() * H * 0.48, r: 0.45 + rnd() * 0.9, o: 0.15 + rnd() * 0.6 }))
}

function svg(W, H) {
  const cx = W / 2
  const y = (v) => Math.round((v * H) / 630)
  const hz = y(318) // horizon of the perspective grid
  const works = site.counts.works
  const judges = site.corpus.categories.find((c) => c.id === 'judge-systems').count
  const chips = [
    { t: `📑 ${works} Works`, fill: C.mid, fo: 0.3, line: C.accent, col: C.text, w: 700 },
    { t: `🎯 ${site.threshold} Params`, fill: C.mid, fo: 0.16, line: C.accent, col: C.bright, w: 600 },
    { t: `⚖️ ${judges} Judge Systems`, fill: C.mid, fo: 0.16, line: C.accent, col: C.bright, w: 600 },
    { t: `💡 ${site.counts.insights} Insights`, fill: C.gold, fo: 0.18, line: C.goldLine, col: C.goldText, w: 600 },
    { t: `🧩 ${site.counts.challenges} Challenges`, fill: C.slate, fo: 0.2, line: C.slateLine, col: C.slateText, w: 600 },
  ]
  const chipFont = 20
  const chipH = y(40)
  const widths = chips.map((c) => Math.round([...c.t].length * chipFont * 0.56 + 40))
  const gap = 14
  let x0 = cx - (widths.reduce((a, b) => a + b, 0) + gap * (chips.length - 1)) / 2
  const chipY = y(420)
  const chipSvg = chips.map((c, k) => {
    const w = widths[k]
    const out = `<rect x="${x0}" y="${chipY}" width="${w}" height="${chipH}" rx="${chipH / 2}" fill="${c.fill}" fill-opacity="${c.fo}" stroke="${c.line}" stroke-width="1.2" stroke-opacity=".85"/>
    <text x="${x0 + w / 2}" y="${chipY + chipH / 2 + 7}" text-anchor="middle" font-size="${chipFont}" font-weight="${c.w}" fill="${c.col}">${c.t}</text>`
    x0 += w + gap
    return out
  }).join('\n    ')

  const fan = []
  for (let k = -9; k <= 9; k++) fan.push(`<line x1="${cx}" y1="${hz}" x2="${cx + k * W * 0.075}" y2="${H}" stroke="url(#gV)" stroke-width=".8"/>`)
  const rows = [0.06, 0.15, 0.27, 0.43, 0.66, 1].map((f) => {
    const yy = hz + (H - hz) * f
    const half = (W / 2) * (0.12 + f * 1.05)
    return `<line x1="${cx - half}" y1="${yy}" x2="${cx + half}" y2="${yy}" stroke="url(#gH)" stroke-width="${0.5 + f * 0.6}"/>`
  })
  const starSvg = stars(W, H, 46, 7).map((s) => `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${s.r.toFixed(2)}" fill="#fff" opacity="${s.o.toFixed(2)}"/>`).join('')

  const orbY = y(232)
  const titleY = y(305)
  const cardW = 70, cardH = y(50), cardY = y(178)
  const ax = 128, bx = W - 128
  const authors = site.paper.authors.map((a) => a.name.toUpperCase()).join(' · ')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>
      @font-face { font-family: 'Inter OG'; font-weight: 100 900; src: url(data:font/woff2;base64,${FONT}) format('woff2'); }
      text { font-family: 'Inter OG', Inter, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; }
    </style>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.bgTop}"/><stop offset="1" stop-color="${C.bgBottom}"/></linearGradient>
    <radialGradient id="neb0" cx="50%" cy="42%" r="42%"><stop offset="0" stop-color="${C.primary}" stop-opacity=".34"/><stop offset=".5" stop-color="${C.primary}" stop-opacity=".1"/><stop offset="1" stop-color="${C.primary}" stop-opacity="0"/></radialGradient>
    <radialGradient id="neb1" cx="50%" cy="44%" r="26%"><stop offset="0" stop-color="${C.accent}" stop-opacity=".14"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
    <radialGradient id="nebL" cx="8%" cy="58%" r="26%"><stop offset="0" stop-color="${C.mid}" stop-opacity=".12"/><stop offset="1" stop-color="${C.mid}" stop-opacity="0"/></radialGradient>
    <radialGradient id="nebR" cx="92%" cy="54%" r="24%"><stop offset="0" stop-color="${C.accent}" stop-opacity=".1"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
    <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.accent}" stop-opacity="0"/><stop offset=".6" stop-color="${C.accent}" stop-opacity=".1"/><stop offset="1" stop-color="${C.accent}" stop-opacity=".3"/></linearGradient>
    <linearGradient id="gH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.accent}" stop-opacity="0"/><stop offset=".5" stop-color="${C.accent}" stop-opacity=".22"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></linearGradient>
    <linearGradient id="horiz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.accent}" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.primary}" stop-opacity="0"/><stop offset=".5" stop-color="${C.accent}" stop-opacity=".8"/><stop offset="1" stop-color="${C.primary}" stop-opacity="0"/></linearGradient>
    <radialGradient id="orbFill" cx="46%" cy="40%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".16" stop-color="${C.pale}"/><stop offset=".38" stop-color="${C.accent}"/><stop offset=".62" stop-color="${C.primary}" stop-opacity=".75"/><stop offset="1" stop-color="${C.bgTop}" stop-opacity="0"/></radialGradient>
    <radialGradient id="orbAtmo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.accent}" stop-opacity=".35"/><stop offset=".45" stop-color="${C.accent}" stop-opacity=".08"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
    <linearGradient id="awesome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.goldText}"/><stop offset="1" stop-color="${C.goldLine}"/></linearGradient>
    <linearGradient id="slm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${C.text}"/></linearGradient>
    <linearGradient id="judge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.bright}"/><stop offset="1" stop-color="${C.accent}"/></linearGradient>
    <linearGradient id="traceA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.accent}" stop-opacity=".45"/><stop offset="1" stop-color="${C.accent}" stop-opacity=".08"/></linearGradient>
    <linearGradient id="traceB" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${C.accent}" stop-opacity=".45"/><stop offset="1" stop-color="${C.accent}" stop-opacity=".08"/></linearGradient>
    <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="glow" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="6" result="b"/><feFlood flood-color="${C.primary}" flood-opacity=".6" result="c"/><feComposite in="c" in2="b" operator="in" result="s"/><feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="dot" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#neb0)"/>
  <rect width="${W}" height="${H}" fill="url(#neb1)"/>
  <rect width="${W}" height="${H}" fill="url(#nebL)"/>
  <rect width="${W}" height="${H}" fill="url(#nebR)"/>
  <g>${starSvg}</g>

  <g>${fan.join('')}${rows.join('')}</g>
  <rect x="0" y="${hz - 4}" width="${W}" height="8" fill="url(#horiz)" opacity=".6"/>

  <!-- circuit traces and the two responses under judgement -->
  <path d="M${cx - 260},${y(250)} L${cx - 330},${y(250)} L${cx - 330},${cardY + cardH / 2} L${ax + cardW / 2},${cardY + cardH / 2}" fill="none" stroke="url(#traceB)" stroke-width="1.1"/>
  <path d="M${cx - 330},${y(330)} L${cx - 420},${y(330)} L${cx - 420},${y(390)} L${70},${y(390)}" fill="none" stroke="url(#traceB)" stroke-width=".9"/>
  <path d="M${cx + 260},${y(250)} L${cx + 330},${y(250)} L${cx + 330},${cardY + cardH / 2} L${bx - cardW / 2},${cardY + cardH / 2}" fill="none" stroke="url(#traceA)" stroke-width="1.1"/>
  <path d="M${cx + 330},${y(330)} L${cx + 420},${y(330)} L${cx + 420},${y(390)} L${W - 70},${y(390)}" fill="none" stroke="url(#traceA)" stroke-width=".9"/>
  <circle cx="70" cy="${y(390)}" r="2.4" fill="${C.accent}" opacity=".7"/>
  <circle cx="${W - 70}" cy="${y(390)}" r="2.4" fill="${C.accent}" opacity=".7"/>
  <circle cx="${cx - 330}" cy="${y(330)}" r="3" fill="${C.bright}" filter="url(#dot)" opacity=".8"/>
  <circle cx="${cx + 330}" cy="${y(330)}" r="3" fill="${C.bright}" filter="url(#dot)" opacity=".8"/>
  ${[['A', ax], ['B', bx]].map(([l, x]) => `<rect x="${x - cardW / 2}" y="${cardY}" width="${cardW}" height="${cardH}" rx="11" fill="${C.card}" fill-opacity=".9" stroke="${C.accent}" stroke-width="1.1"/>
  <text x="${x}" y="${cardY + cardH / 2 + 9}" text-anchor="middle" font-size="25" font-weight="700" fill="${C.text}">${l}</text>
  <text x="${x}" y="${cardY + cardH + 24}" text-anchor="middle" font-size="12.5" font-weight="600" letter-spacing="2" fill="${C.bright}" opacity=".6">RESPONSE</text>`).join('\n  ')}

  <!-- orb with the balance scale -->
  <circle cx="${cx}" cy="${orbY}" r="88" fill="url(#orbAtmo)" filter="url(#bloom)" opacity=".75"/>
  <circle cx="${cx}" cy="${orbY}" r="38" fill="url(#orbFill)"/>
  <circle cx="${cx}" cy="${orbY}" r="38" fill="none" stroke="${C.accent}" stroke-width=".6" opacity=".25"/>
  <g transform="translate(${cx},${orbY + 1}) scale(1.05)" fill="none" stroke-linecap="round">
    <line x1="0" y1="-13" x2="0" y2="13" stroke="#fff" stroke-width="1.8" opacity=".85"/>
    <line x1="-8" y1="13" x2="8" y2="13" stroke="#fff" stroke-width="1.8" opacity=".85"/>
    <line x1="-16" y1="-9" x2="16" y2="-9" stroke="#fff" stroke-width="1.8" opacity=".85"/>
    <circle cx="0" cy="-13" r="1.8" fill="${C.text}" stroke="none"/>
    <path d="M-16,-9 L-21,2 M-16,-9 L-11,2 M16,-9 L11,2 M16,-9 L21,2" stroke="${C.pale}" stroke-width=".9" opacity=".85"/>
    <path d="M-23,2 Q-16,9 -9,2 Z M9,2 Q16,9 23,2 Z" fill="${C.bright}" fill-opacity=".35" stroke="${C.text}" stroke-width="1.2" opacity=".9"/>
  </g>

  <!-- title -->
  <text x="${cx}" y="${y(160)}" text-anchor="middle" font-size="28" font-weight="650" letter-spacing="8" fill="url(#awesome)">AWESOME</text>
  <text x="${cx}" y="${titleY}" text-anchor="middle" font-size="100" letter-spacing="-1.5" fill="${C.primary}" opacity=".45" filter="url(#bloom)"><tspan font-weight="800">SLM</tspan><tspan font-weight="300" dx="9">-as-a-</tspan><tspan font-weight="800" dx="9">Judge</tspan></text>
  <text x="${cx}" y="${titleY}" text-anchor="middle" font-size="100" letter-spacing="-1.5" filter="url(#glow)"><tspan font-weight="800" fill="url(#slm)">SLM</tspan><tspan font-weight="300" dx="9" fill="${C.bright}" fill-opacity=".92">-as-a-</tspan><tspan font-weight="800" dx="9" fill="url(#judge)">Judge</tspan></text>

  <text x="${cx}" y="${y(372)}" text-anchor="middle" font-size="29" font-weight="400" letter-spacing="2.5" fill="${C.text2}">Small Language Models as Judges: A Survey</text>

  <g>
    ${chipSvg}
  </g>

  <text x="${cx}" y="${y(530)}" text-anchor="middle" font-size="18" font-weight="600" letter-spacing="3" fill="${C.text2}" opacity=".8">${authors}</text>

  <line x1="0" y1="${H - 0.6}" x2="${W}" y2="${H - 0.6}" stroke="url(#edge)" stroke-width="1.2" opacity=".7"/>
  <line x1="0" y1="0.6" x2="${W}" y2="0.6" stroke="url(#edge)" stroke-width="1" opacity=".4"/>
</svg>
`
}

function chrome() {
  const candidates = [
    process.env.CHROME,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ].filter(Boolean)
  const found = candidates.find((p) => fs.existsSync(p))
  if (!found) { console.error('make-og: Chrome not found; set CHROME to its path'); process.exit(1) }
  return found
}

function render(W, H, out) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'))
  const html = path.join(tmp, 'og.html')
  fs.writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:${C.bgTop}}svg{display:block}</style></head><body>${svg(W, H)}</body></html>`)
  execFileSync(chrome(), [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--window-size=${W},${H}`, '--virtual-time-budget=2000', `--screenshot=${out}`, `file://${html}`,
  ], { stdio: 'ignore' })
  fs.rmSync(tmp, { recursive: true, force: true })
  console.log(`make-og: wrote ${path.relative(process.cwd(), out) || out} (${W} x ${H})`)
}

render(1200, 630, path.join(SITE, 'public', 'og.png'))
const gh = opt('--github') || process.env.OG_GITHUB_OUT
if (gh) render(1280, 640, path.resolve(gh))
const svgOut = opt('--svg')
if (svgOut) fs.writeFileSync(path.resolve(svgOut), svg(1200, 630))
