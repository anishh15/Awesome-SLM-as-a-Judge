import { FileText } from 'lucide-react'
import site, { asset } from '../lib/site.js'
import useTitle from '../lib/useTitle.js'
import { word } from '../lib/words.js'

import { Reveal } from '../lib/reveal.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { FigureCard } from '../components/Figure.jsx'

// Group the figures by where they appear in the paper (main text, then each appendix).
function groups() {
  const out = []
  for (const f of site.figures) {
    const key = f.where.label
    let g = out.find((x) => x.key === key)
    if (!g) { g = { key, title: f.where.title, href: f.where.href, appendix: key.startsWith('App.'), figs: [] }; out.push(g) }
    g.figs.push(f)
  }
  return out
}
const GROUPS = groups()
const wide = (f) => f.width / f.height > 2.6

export default function Figures() {
  useTitle('Figures')
  const nums = [...new Set(site.figures.map((f) => f.number))]
  const panels = site.figures.filter((f) => f.panel)
  const panelParent = panels[0]?.number
  const main = GROUPS.filter((g) => !g.appendix)
  const apps = GROUPS.filter((g) => g.appendix)

  return (
    <>
      <PageHeader eyebrow="Figures" title="The figures of the survey">
        <p>
          These are Figures {nums[0]} to {nums[nums.length - 1]} of the survey, with the {word(panels.length)} panels of Figure {panelParent} shown
          one by one. Each one follows the site’s light or dark theme.
        </p>
      </PageHeader>

      <section className="section section-tight">
        <div className="container">
          {main.map((g) => (
            <div key={g.key} className="fig-group">
              <GroupHead g={g} />
              <div className="fig-main-grid">
                {g.figs.filter((f) => !f.panel).map((f) => (
                  <Reveal key={f.id} className="fig-main-lead"><FigureCard fig={f} priority /></Reveal>
                ))}
                <div className="fig-panels">
                  {g.figs.filter((f) => f.panel).map((f, k) => (
                    <Reveal key={f.id} delay={k * 60}><FigureCard fig={f} priority /></Reveal>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {apps.map((g) => (
            <div key={g.key} className="fig-group">
              <GroupHead g={g} />
              <div className="fig-grid">
                {g.figs.map((f, k) => (
                  <Reveal key={f.id} delay={k * 60} className={wide(f) || g.figs.length === 1 ? 'span-2' : ''}>
                    <FigureCard fig={f} />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function GroupHead({ g }) {
  return (
    <div className="fig-group-head">
      <h2 className="fig-group-title"><span className="fig-group-key">{g.key}</span> {g.title}</h2>
      <a className="where-link" href={asset(g.href)} target="_blank" rel="noopener"><FileText size={13} aria-hidden="true" /> In the PDF</a>
    </div>
  )
}
