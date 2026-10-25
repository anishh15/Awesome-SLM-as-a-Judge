import { Reveal } from '../lib/reveal.jsx'

export default function SectionHeading({ eyebrow, title, lead, id, align = 'left', action = null, as: H = 'h2' }) {
  return (
    <Reveal className={`section-heading align-${align}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div className="section-heading-row">
        <H id={id} className="section-title">{title}</H>
        {action}
      </div>
      {lead && <div className="section-lead">{lead}</div>}
    </Reveal>
  )
}
