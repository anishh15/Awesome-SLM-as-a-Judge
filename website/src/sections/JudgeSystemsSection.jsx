import { useState } from 'react'
import { Search, ArrowUpRight } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { judgeSystems } from '../data/paperData'

export default function JudgeSystemsSection() {
  const [filter, setFilter] = useState('')
  const [sortKey, setSortKey] = useState(null)

  const filtered = judgeSystems.filter(s =>
    !filter || s.name.toLowerCase().includes(filter.toLowerCase()) ||
    s.train.toLowerCase().includes(filter.toLowerCase()) ||
    s.size.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <section className="section" id="systems">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">Comparison</div>
          <h2 className="section-title">15+ Judge Systems</h2>
          <p className="section-subtitle">
            A comparison of key SLM judge systems across training paradigm, model size, and headline results: from 1.7B representation probes to 14B RL-trained judges.
          </p>
        </ScrollReveal>

        {/* Filter */}
        <ScrollReveal delay={100}>
          <div style={{ marginTop: 36, marginBottom: 24, position: 'relative', maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-muted)' }} />
            <input
              type="text"
              placeholder="Filter by name, size, or training..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{
                width: '100%', padding: '10px 16px 10px 40px', borderRadius: 10,
                background: 'var(--c-bg-card)', border: '1px solid var(--c-border)',
                color: 'var(--c-text)', fontSize: '0.85rem', fontFamily: 'var(--font-sans)',
                outline: 'none', transition: 'border-color 0.2s ease'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--c-accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--c-border)'}
            />
          </div>
        </ScrollReveal>

        {/* Table */}
        <ScrollReveal delay={150}>
          <div className="glass-card neon-border" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: 'center' }}>#</th>
                    <th>System</th>
                    <th>Base Model</th>
                    <th>Size</th>
                    <th>Training</th>
                    <th>Headline Result</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.name}>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--c-text-dim)' }}>
                        {i + 1}
                      </td>
                      <td className="cell-name" style={{ whiteSpace: 'nowrap' }}>{s.name}</td>
                      <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{s.base}</td>
                      <td>
                        <span className="badge" style={{ fontSize: '0.7rem', padding: '3px 10px' }}>{s.size}</span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 6,
                          fontSize: '0.7rem', fontWeight: 600, fontFamily: 'var(--font-mono)',
                          background: s.train.includes('GRPO') ? 'rgba(139,92,246,0.12)' :
                                     s.train.includes('Probe') ? 'rgba(245,158,11,0.12)' :
                                     'rgba(61,184,160,0.1)',
                          color: s.train.includes('GRPO') ? '#a78bfa' :
                                s.train.includes('Probe') ? '#fbbf24' :
                                'var(--c-accent)',
                          border: `1px solid ${s.train.includes('GRPO') ? 'rgba(139,92,246,0.25)' :
                                              s.train.includes('Probe') ? 'rgba(245,158,11,0.25)' :
                                              'rgba(61,184,160,0.2)'}`
                        }}>
                          {s.train}
                        </span>
                      </td>
                      <td className="cell-accent" style={{ fontSize: '0.82rem' }}>{s.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--c-border)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--c-text-dim)' }}>
              {filtered.length} of {judgeSystems.length} systems shown · † FLAMe size exceeds 14B but is included for comparison context
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
