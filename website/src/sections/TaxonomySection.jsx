import { useState } from 'react'
import ScrollReveal from '../components/ScrollReveal'
import { trainingParadigms } from '../data/paperData'

export default function TaxonomySection() {
  const [activeParadigm, setActiveParadigm] = useState(null)

  return (
    <section className="section" id="taxonomy">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">Paper Structure</div>
          <h2 className="section-title">Five-Dimension Taxonomy</h2>
          <p className="section-subtitle">
            The survey organizes 60+ works into a unified taxonomy across five dimensions, from individual judge design to future research directions.
          </p>
        </ScrollReveal>

        {/* Taxonomy flow */}
        <ScrollReveal delay={100}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 48, marginBottom: 56 }}>
            {[
              { label: '§2 Background', desc: 'LLM-as-a-Judge paradigm' },
              { label: '§3 Individual Judges', desc: 'Training, scale, reasoning' },
              { label: '§4 Multi-Agent', desc: 'Ensemble, debate, cascade' },
              { label: '§5 Reliability', desc: 'Biases, attacks, validity' },
              { label: '§6 Future', desc: '6 challenges, 10 directions' },
            ].map((dim, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="glass-card-subtle" style={{
                  padding: '16px 20px', textAlign: 'center', minWidth: 160,
                  cursor: 'default', position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: 'linear-gradient(90deg, var(--c-accent), var(--c-accent-bright))',
                    opacity: 0.6
                  }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>{dim.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--c-text-muted)' }}>{dim.desc}</div>
                </div>
                {i < 4 && (
                  <span style={{ color: 'var(--c-accent)', fontSize: '1.2rem', opacity: 0.4 }}>→</span>
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Training paradigms */}
        <ScrollReveal delay={200}>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: 8 }}>
              Training Paradigm Progression
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--c-text-secondary)' }}>
              From off-the-shelf prompting to representation probing: a decreasing supervision gradient.
            </p>
          </div>
        </ScrollReveal>

        <div className="timeline" style={{ marginTop: 32 }}>
          {trainingParadigms.map((p, i) => (
            <ScrollReveal key={p.name} delay={i * 80}>
              <div
                className="timeline-item"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveParadigm(activeParadigm === i ? null : i)}
              >
                <div className="glass-card-subtle" style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>{p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)' }}>
                        Signal: <span style={{ color: 'var(--c-text-secondary)' }}>{p.signal}</span>
                      </div>
                    </div>
                    <span className="badge" style={{ fontSize: '0.65rem' }}>
                      Supervision: {p.supervision}
                    </span>
                  </div>

                  {activeParadigm === i && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--c-border)', animation: 'slideInUp 0.3s ease' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-text-muted)', marginBottom: 6 }}>Key Systems</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--c-accent-bright)', fontWeight: 600 }}>{p.systems}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-text-muted)', marginBottom: 6 }}>Key Insight</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--c-text-secondary)' }}>{p.insight}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Figure */}
        <ScrollReveal delay={100}>
          <div className="figure-container" style={{ marginTop: 48 }}>
            <img src="figures/paradigm_supervision.svg" alt="Training paradigm supervision gradient" />
            <div className="figure-caption">Training paradigms arranged by decreasing supervision requirement</div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
