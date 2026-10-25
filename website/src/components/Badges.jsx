// Small labels used across the site. Insight tags are gold (the paper's
// insightgold) and challenge tags slate blue, as in the survey's Fig. 1.

export function InsightTag({ id, size = 'md' }) {
  return <span className={`tag tag-insight tag-${size}`}>{id}</span>
}

export function ChallengeTag({ id, size = 'md' }) {
  return <span className={`tag tag-challenge tag-${size}`}>{id}</span>
}

export function Tag({ id, size }) {
  return id.startsWith('I') ? <InsightTag id={id} size={size} /> : <ChallengeTag id={id} size={size} />
}

const GRADE_LEVEL = { Consensus: 3, Replicated: 2, Preliminary: 1 }

/** Evidence grade, drawn as three bars filled by strength. */
export function GradeBadge({ grade, detail = null, compact = false }) {
  const level = GRADE_LEVEL[grade] || 0
  return (
    <span className={`grade grade-${grade.toLowerCase()}${compact ? ' grade-compact' : ''}`}>
      <span className="grade-bars" aria-hidden="true">
        {[1, 2, 3].map((k) => <i key={k} className={k <= level ? 'on' : ''} />)}
      </span>
      <span className="grade-name">{grade}</span>
      {detail && <span className="grade-detail">{detail}</span>}
    </span>
  )
}

export function CategoryDot({ id }) {
  return <span className={`cat-dot cat-${id}`} aria-hidden="true" />
}
