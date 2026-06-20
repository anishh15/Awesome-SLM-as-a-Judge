import { CheckCircle, AlertCircle, HelpCircle, XCircle } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { verifiabilityTiers } from '../data/paperData'

const TIER_CONFIG = {
  high: { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
  good: { icon: CheckCircle, color: '#3db8a0', bg: 'rgba(61,184,160,0.08)', border: 'rgba(61,184,160,0.2)' },
  moderate: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  low: { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
}

export default function VerifiabilitySection() {
  return (
    <section className="section" id="verifiability">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">Insight I5</div>
          <h2 className="section-title">The Verifiability Gradient</h2>
          <p className="section-subtitle">
            SLM judge reliability follows the verifiability gradient of the evaluation domain. The more objectively verifiable a task is, the better SLMs perform as judges.
          </p>
        </ScrollReveal>

        {/* Gradient bar visualization */}
        <ScrollReveal delay={100}>
          <div style={{
            marginTop: 48, marginBottom: 48, height: 6, borderRadius: 3,
            background: 'linear-gradient(90deg, #22c55e, #3db8a0, #f59e0b, #ef4444)',
            position: 'relative', overflow: 'visible'
          }}>
            {[0, 33, 66, 100].map((pos, i) => (
              <div key={i} style={{
                position: 'absolute', left: `${pos}%`, top: -4,
                width: 14, height: 14, borderRadius: '50%',
                background: ['#22c55e', '#3db8a0', '#f59e0b', '#ef4444'][i],
                border: '2px solid var(--c-bg-deep)',
                transform: 'translateX(-50%)',
                boxShadow: `0 0 12px ${['#22c55e', '#3db8a0', '#f59e0b', '#ef4444'][i]}40`
              }} />
            ))}
          </div>
        </ScrollReveal>

        {/* Tier cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {verifiabilityTiers.map((t, i) => {
            const config = TIER_CONFIG[t.tier]
            const Icon = config.icon
            return (
              <ScrollReveal key={t.level} delay={i * 120}>
                <div className={`gradient-tier tier-${t.tier}`} style={{
                  border: `1px solid ${config.border}`,
                  height: '100%'
                }}>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <Icon size={20} style={{ color: config.color }} />
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-text)' }}>{t.level}</div>
                        <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: config.color, fontWeight: 600 }}>
                          Confidence: {t.confidence}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-text-muted)', marginBottom: 4 }}>Examples</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--c-text-secondary)' }}>{t.examples}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-text-muted)', marginBottom: 4 }}>Recommended Strategy</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--c-accent-bright)', fontWeight: 500 }}>{t.strategy}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Figure */}
        <ScrollReveal delay={200}>
          <div className="figure-container" style={{ marginTop: 48 }}>
            <img src="figures/panel_verifiability.svg" alt="Verifiability gradient" />
            <div className="figure-caption">SLM judge performance across the verifiability gradient</div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
