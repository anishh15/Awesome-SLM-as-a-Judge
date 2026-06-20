import { AlertTriangle } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { biases } from '../data/paperData'

export default function ReliabilitySection() {
  return (
    <section className="section" id="reliability">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">§5 Reliability</div>
          <h2 className="section-title">Biases & Robustness</h2>
          <p className="section-subtitle">
            Structural biases, adversarial vulnerabilities, and benchmark validity: three axes of SLM judge reliability. Bias interactions are <strong style={{ color: 'var(--c-accent-bright)' }}>multiplicative</strong>, not additive.
          </p>
        </ScrollReveal>

        {/* Bias taxonomy */}
        <ScrollReveal delay={100}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--c-text)', marginTop: 48, marginBottom: 24 }}>
            Six-Category Bias Taxonomy
          </h3>
        </ScrollReveal>

        <div className="glass-card neon-border" style={{ overflow: 'hidden', marginBottom: 40 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bias</th>
                <th>Definition</th>
                <th style={{ textAlign: 'center' }}>SLM vs LLM</th>
              </tr>
            </thead>
            <tbody>
              {biases.map((b, i) => (
                <ScrollReveal key={b.name} animation="reveal" delay={i * 60}>
                  <tr>
                    <td className="cell-name" style={{ whiteSpace: 'nowrap' }}>{b.name}</td>
                    <td style={{ maxWidth: 400 }}>{b.definition}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`bias-indicator ${b.slmVsLlm === 'stronger' ? 'bias-stronger' : b.slmVsLlm === 'weaker' ? 'bias-weaker' : 'bias-comparable'}`}>
                        {b.slmVsLlm === 'stronger' ? '▲' : b.slmVsLlm === 'weaker' ? '▼' : '≈'}
                        {' '}{b.note}
                      </span>
                    </td>
                  </tr>
                </ScrollReveal>
              ))}
            </tbody>
          </table>
        </div>

        {/* Adversarial + PC-Acc */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
          <ScrollReveal delay={100}>
            <div className="glass-card" style={{ padding: 28, height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-text)' }}>Adversarial Vulnerabilities</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem', color: 'var(--c-text-secondary)', lineHeight: 1.6 }}>
                <div>
                  <strong style={{ color: 'var(--c-accent-bright)' }}>Null model attack:</strong> constant, content-free responses achieve disproportionately high win rates against SLM judges.
                </div>
                <div>
                  <strong style={{ color: 'var(--c-accent-bright)' }}>Single-token "master key":</strong> a colon or generic opener can elicit false-positive rewards from reward models.
                </div>
                <div>
                  SLMs are more vulnerable due to <strong style={{ color: '#ef4444' }}>simpler decision boundaries</strong> and weaker instruction hierarchy.
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="glass-card" style={{ padding: 28, height: '100%' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: 16 }}>Position-Consistent Accuracy</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-text-secondary)', lineHeight: 1.6 }}>
                <p style={{ marginBottom: 12 }}>
                  Under <strong style={{ color: 'var(--c-accent-bright)' }}>PC-Acc protocols</strong>, even frontier judges degrade sharply on hard evaluation pairs, approaching random-choice baselines.
                </p>
                <p>
                  This reframes progress: gains on human-agreement benchmarks may reflect better alignment with <em>stylistic preferences</em> rather than better reasoning evaluation.
                </p>
                <div className="badge badge-accent" style={{ marginTop: 16, fontSize: '0.72rem' }}>
                  Always report PC-Acc alongside naive accuracy
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Figures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <ScrollReveal delay={100}>
            <div className="figure-container">
              <img src="figures/bias_heatmap.svg" alt="Bias severity heatmap: SLM vs LLM" />
              <div className="figure-caption">Bias severity comparison: SLM vs LLM judges</div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="figure-container">
              <img src="figures/defense_heatmap.svg" alt="Defense layering robustness" />
              <div className="figure-caption">Defense layering effectiveness across bias types</div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
