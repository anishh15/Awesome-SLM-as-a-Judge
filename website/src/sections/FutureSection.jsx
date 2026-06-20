import ScrollReveal from '../components/ScrollReveal'
import { challenges, futureDirections, benchmarks } from '../data/paperData'

export default function FutureSection() {
  return (
    <section className="section" id="future">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">§6 Challenges</div>
          <h2 className="section-title">Challenges & Future Directions</h2>
          <p className="section-subtitle">
            Six open challenges and ten research directions that chart the path forward for SLM-as-a-Judge.
          </p>
        </ScrollReveal>

        {/* Challenges C1-C6 */}
        <ScrollReveal delay={100}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--c-text)', marginTop: 48, marginBottom: 24 }}>
            Six Open Challenges
          </h3>
        </ScrollReveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 56 }}>
          {challenges.map((c, i) => (
            <ScrollReveal key={c.id} delay={i * 80}>
              <div className="glass-card-subtle" style={{ padding: '20px 24px', height: '100%' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700,
                    color: 'var(--c-accent)', padding: '3px 8px', borderRadius: 6,
                    background: 'rgba(61,184,160,0.1)', border: '1px solid rgba(61,184,160,0.2)',
                    whiteSpace: 'nowrap', flexShrink: 0
                  }}>
                    {c.id}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--c-text)', marginBottom: 6 }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--c-text-secondary)', lineHeight: 1.55 }}>{c.status}</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* 10-Direction Research Agenda */}
        <ScrollReveal delay={100}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: 24 }}>
            10-Direction Research Agenda
          </h3>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="glass-card neon-border" style={{ overflow: 'hidden', marginBottom: 48 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>#</th>
                  <th>Research Direction</th>
                  <th style={{ textAlign: 'center' }}>Horizon</th>
                  <th>Key Intervention</th>
                </tr>
              </thead>
              <tbody>
                {futureDirections.map(d => (
                  <tr key={d.id}>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--c-text-dim)' }}>{d.id}</td>
                    <td className="cell-name">{d.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 6,
                        fontSize: '0.7rem', fontWeight: 600, fontFamily: 'var(--font-mono)',
                        background: d.horizon === 'Near' ? 'rgba(34,197,94,0.1)' :
                                   d.horizon === 'Medium' ? 'rgba(245,158,11,0.1)' :
                                   'rgba(239,68,68,0.1)',
                        color: d.horizon === 'Near' ? '#22c55e' :
                              d.horizon === 'Medium' ? '#f59e0b' :
                              '#ef4444',
                        border: `1px solid ${d.horizon === 'Near' ? 'rgba(34,197,94,0.2)' :
                                            d.horizon === 'Medium' ? 'rgba(245,158,11,0.2)' :
                                            'rgba(239,68,68,0.2)'}`
                      }}>
                        {d.horizon}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{d.intervention}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        {/* Benchmarks */}
        <ScrollReveal delay={100}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: 24 }}>
            Key Benchmarks
          </h3>
        </ScrollReveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
          {benchmarks.map((b, i) => (
            <ScrollReveal key={b.name} delay={i * 80}>
              <div className="glass-card-subtle" style={{ padding: '20px', height: '100%' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>{b.name}</div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--c-accent)', marginBottom: 10 }}>{b.venue}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--c-text-secondary)', marginBottom: 6 }}>
                  <strong style={{ color: 'var(--c-text-muted)' }}>Metric:</strong> {b.metric}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--c-text-secondary)' }}>{b.strength}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Figure */}
        <ScrollReveal delay={100}>
          <div className="figure-container">
            <img src="figures/benchmark_coverage.svg" alt="Benchmark dimension coverage matrix" />
            <div className="figure-caption">Benchmark dimension coverage matrix across evaluation dimensions</div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
