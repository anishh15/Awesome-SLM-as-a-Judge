import { DollarSign, Shield, RefreshCw, Zap } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { motivations } from '../data/paperData'

const ICONS = { DollarSign, Shield, RefreshCw, Zap }

export default function MotivationSection() {
  return (
    <section className="section" id="motivation">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">The Core Question</div>
          <h2 className="section-title">Can small language models reliably serve as judges?</h2>
          <p className="section-subtitle">
            The transition from proprietary to SLM judges is driven by <strong style={{ color: 'var(--c-accent-bright)' }}>operational constraints</strong>, not accuracy deficits.
          </p>
        </ScrollReveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginTop: 48 }}>
          {motivations.map((m, i) => {
            const Icon = ICONS[m.icon]
            return (
              <ScrollReveal key={m.title} delay={i * 100}>
                <div className="glass-card" style={{ padding: 28, height: '100%' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(61,184,160,0.1)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 16
                  }}>
                    <Icon size={20} style={{ color: 'var(--c-accent)' }} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: 8 }}>{m.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--c-text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                    {m.description}
                  </p>
                  <div className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                    {m.stat}
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
