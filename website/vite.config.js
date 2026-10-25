import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import config from './site.config.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// Fill the <head> of index.html from the generated data, so the title, the
// description and the Google Scholar tags carry the same numbers as the pages.
function headFromData() {
  const load = () => JSON.parse(fs.readFileSync(path.join(HERE, 'src/generated/site.json'), 'utf8'))
  return {
    name: 'head-from-data',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const site = load()
        const { paper, counts, config: c } = site
        const description =
          `${paper.title} (${c.venue}). ${counts.works} works on small language models ` +
          `(${site.threshold} parameters) as automated judges: ${words[counts.insights] || counts.insights} evidence-graded insights, ` +
          `${words[counts.challenges] || counts.challenges} open challenges, the paper list and the figures.`
        const authorTags = paper.authors.map((a) => {
          const parts = a.name.split(' ')
          return `<meta name="citation_author" content="${esc(`${parts.slice(-1)[0]}, ${parts.slice(0, -1).join(' ')}`)}" />`
        }).join('\n    ')
        const ld = {
          '@context': 'https://schema.org',
          '@type': 'ScholarlyArticle',
          headline: paper.title,
          name: paper.title,
          author: paper.authors.map((a) => ({
            '@type': 'Person',
            name: a.name,
            affiliation: paper.affiliations.filter((x) => a.affiliations.includes(x.id)).map((x) => x.name).join('; '),
          })),
          datePublished: String(c.year),
          url: c.url,
          encoding: { '@type': 'MediaObject', contentUrl: `${c.url}${c.pdf}`, encodingFormat: 'application/pdf' },
          isAccessibleForFree: true,
        }
        return html
          .replaceAll('%TITLE%', esc(paper.title))
          .replaceAll('%DESCRIPTION%', esc(description))
          .replaceAll('%URL%', esc(c.url))
          .replaceAll('%PDF_URL%', esc(`${c.url}${c.pdf}`))
          .replaceAll('%YEAR%', esc(c.year))
          .replaceAll('%REPO%', esc(c.repo))
          .replaceAll('%OG_IMAGE%', esc(`${c.url}og.png`))
          .replaceAll('%OG_ALT%', esc(`Banner for ${paper.title} by ${paper.authors.map((a) => a.name).join(', ').replace(/, ([^,]*)$/, ' and $1')}, ` +
            `with ${counts.works} works, ${site.threshold} parameters, ${words[counts.insights] || counts.insights} insights ` +
            `and ${words[counts.challenges] || counts.challenges} challenges`))
          .replace('<!--%CITATION_AUTHORS%-->', authorTags)
          .replace('<!--%JSON_LD%-->', `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`)
      },
    },
  }
}

// Preload the latin Inter file the first paint needs, so text does not
// reflow when the web font arrives.
function preloadFont() {
  return {
    name: 'preload-font',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const asset = Object.keys(ctx.bundle || {}).find((f) => /inter-latin-opsz-normal.*\.woff2$/.test(f))
        if (!asset) return html
        return html.replace('</title>', `</title>\n    <link rel="preload" href="${config.base}${asset}" as="font" type="font/woff2" crossorigin />`)
      },
    },
  }
}

// GitHub Pages serves 404.html for unknown paths; send those visitors to the
// matching hash route (…/insights becomes …/#/insights).
function notFoundPage() {
  return {
    name: 'not-found-page',
    apply: 'build',
    generateBundle() {
      const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Redirecting</title>
<meta name="robots" content="noindex">
<script>
  var base = ${JSON.stringify(config.base)};
  var rest = location.pathname.indexOf(base) === 0 ? location.pathname.slice(base.length) : '';
  location.replace(base + '#/' + rest.replace(/^\\/+|\\/+$/g, '') + location.search);
</script>
</head><body><p><a href="${config.base}">Small Language Models as Judges: A Survey</a></p></body></html>
`
      this.emitFile({ type: 'asset', fileName: '404.html', source: html })
    },
  }
}

export default defineConfig({
  base: config.base,
  plugins: [react(), headFromData(), preloadFont(), notFoundPage()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-router')) return 'router'
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
  server: { port: 5173 },
  preview: { port: 4173 },
})
