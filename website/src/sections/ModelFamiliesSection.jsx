import ScrollReveal from '../components/ScrollReveal'
import { modelFamilies } from '../data/paperData'

export default function ModelFamiliesSection() {
  return (
    <section className="section" id="families">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">Appendix B</div>
          <h2 className="section-title">Five SLM Model Families</h2>
          <p className="section-subtitle">
            No single family dominates every dimension. This complementarity is exactly what makes cross-family panels effective.
          </p>
        </ScrollReveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginTop: 48 }}>
          {modelFamilies.map((f, i) => (
            <ScrollReveal key={f.name} delay={i * 100}>
              <div className="glass-card" style={{ padding: 0, height: '100%', overflow: 'hidden' }}>
                {/* Color accent bar */}
                <div style={{ height: 3, background: f.color }} />
                <div style={{ padding: '24px 24px 28px' }}>
                  {/* Family name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: `${f.color}18`, border: `1px solid ${f.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem', fontWeight: 800, color: f.color,
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {f.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--c-text)' }}>{f.name}</div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-muted)' }}>{f.sizes}</div>
                    </div>
                  </div>

                  {/* Strength badge */}
                  <div style={{ marginBottom: 14 }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: 6,
                      fontSize: '0.7rem', fontWeight: 600, fontFamily: 'var(--font-mono)',
                      background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}25`
                    }}>
                      {f.strength}
                    </span>
                  </div>

                  {/* Feature */}
                  <p style={{ fontSize: '0.82rem', color: 'var(--c-text-secondary)', lineHeight: 1.6 }}>
                    {f.feature}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Figure */}
        <ScrollReveal delay={200}>
          <div className="figure-container" style={{ marginTop: 48 }}>
            <img src="figures/family_heatmap.svg" alt="SLM family capability heatmap" />
            <div className="figure-caption">Capability heatmap across the five SLM families</div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
