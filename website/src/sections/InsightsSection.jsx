import { Lightbulb } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { insights } from '../data/paperData'

export default function InsightsSection() {
  return (
    <section className="section" id="insights">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">Key Findings</div>
          <h2 className="section-title">Five Cross-Cutting Insights</h2>
          <p className="section-subtitle">
            Five insights with multi-paper evidence that emerge from synthesizing 60+ works across the SLM-as-a-Judge landscape.
          </p>
        </ScrollReveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 48 }}>
          {insights.map((ins, i) => (
            <ScrollReveal key={ins.id} delay={i * 80}>
              <div className="glass-card insight-card" style={{ display: 'grid', gridTemplateColumns: ins.figure ? '1fr 340px' : '1fr', gap: 32, alignItems: 'center' }}>
                <div>
                  <span className="insight-id">{ins.id}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--c-accent)', fontWeight: 600 }}>
                      {ins.subtitle}
                    </span>
                  </div>
                  <h3 className="insight-title">{ins.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--c-text-secondary)', lineHeight: 1.65, marginBottom: 16 }}>
                    {ins.explanation}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ins.evidence.map((e, j) => (
                      <div key={j} className="insight-evidence" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--c-accent)', fontSize: '0.7rem', marginTop: 3 }}>▸</span>
                        <span dangerouslySetInnerHTML={{ __html: e.replace(/(GPT-4o?(-mini)?|DeepSeek-R1|GLIDER|Prometheus 2|Selene Mini|JudgeLRM|JudgeLM|PoLL|COSMosFL|INSPECTOR)/g, '<strong>$1</strong>') }} />
                      </div>
                    ))}
                  </div>
                </div>
                {ins.figure && (
                  <div className="figure-container" style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
                    <img
                      src={`figures/${ins.figure}`}
                      alt={ins.subtitle}
                      style={{ flex: 1, objectFit: 'contain', borderRadius: 8, background: 'rgba(255,255,255,0.03)', padding: 8 }}
                    />
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
