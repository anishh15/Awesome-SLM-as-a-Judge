import { Users, MessageSquare, GitBranch } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { strategies } from '../data/paperData'

const ICONS = { Users, MessageSquare, GitBranch }

export default function StrategiesSection() {
  return (
    <section className="section" id="strategies">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">§4 Multi-Agent</div>
          <h2 className="section-title">Evaluation Strategies</h2>
          <p className="section-subtitle">
            Three approaches to combining multiple SLM judges: ensemble voting, multi-agent debate, and cascaded/speculative judging.
          </p>
        </ScrollReveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginTop: 48 }}>
          {strategies.map((s, i) => {
            const Icon = ICONS[s.icon]
            return (
              <ScrollReveal key={s.name} delay={i * 120}>
                <div className="glass-card" style={{ padding: 0, height: '100%', overflow: 'hidden' }}>
                  <div style={{ padding: '28px 28px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(61,184,160,0.1)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Icon size={20} style={{ color: 'var(--c-accent)' }} />
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--c-text)' }}>{s.name}</h3>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--c-text-secondary)', lineHeight: 1.65, marginBottom: 20 }}>
                      {s.description}
                    </p>
                  </div>

                  {/* Key finding highlight */}
                  <div style={{
                    margin: '0 16px', padding: '14px 16px', borderRadius: 10,
                    background: 'rgba(61,184,160,0.06)', border: '1px solid rgba(61,184,160,0.12)',
                    marginBottom: 20
                  }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-accent)', marginBottom: 6 }}>
                      Key Finding
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--c-text)', lineHeight: 1.5, fontWeight: 500 }}>
                      {s.keyFinding}
                    </div>
                  </div>

                  {/* Systems & Aggregation */}
                  <div style={{ padding: '0 28px 24px' }}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-text-muted)', marginBottom: 6 }}>Systems</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {s.systems.map(sys => (
                          <span key={sys} className="badge" style={{ fontSize: '0.68rem', padding: '3px 10px' }}>{sys}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-text-muted)', marginBottom: 6 }}>Aggregation</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--c-text-secondary)' }}>{s.aggregation}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Figures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 48 }}>
          <ScrollReveal delay={100}>
            <div className="figure-container">
              <img src="figures/strategy_taxonomy.svg" alt="Multi-agent strategy taxonomy" />
              <div className="figure-caption">Strategy taxonomy for multi-agent evaluation</div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="figure-container">
              <img src="figures/panel_ensemble.svg" alt="Ensemble cost-quality tradeoff" />
              <div className="figure-caption">Cost-quality plane: cheap diversity via cross-family panels</div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
