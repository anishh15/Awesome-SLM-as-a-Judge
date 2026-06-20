import { FileText, BookOpen } from 'lucide-react'
import GithubIcon from '../components/GithubIcon'
import ParticleField from '../components/ParticleField'
import TypingEffect from '../components/TypingEffect'
import AnimatedCounter from '../components/AnimatedCounter'
import { heroStats, typingPhrases, paperMeta } from '../data/paperData'

export default function HeroSection() {
  return (
    <section className="hero grid-bg">
      <ParticleField count={90} />

      {/* Orbs */}
      <div className="orb" style={{ width: 500, height: 500, top: -200, left: -150, background: 'var(--c-primary)' }} />
      <div className="orb" style={{ width: 350, height: 350, bottom: -100, right: -100, background: 'var(--c-accent)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 900 }}>
        {/* Survey badge */}
        <div style={{ marginBottom: 24, animation: 'slideInUp 0.8s var(--ease-out-expo)' }}>
          <span className="badge badge-accent">
            <BookOpen size={12} /> Survey Paper · 2026
          </span>
        </div>

        {/* Title */}
        <h1 className="hero-title" style={{ animation: 'slideInUp 0.8s var(--ease-out-expo) 0.1s both' }}>
          <span style={{ display: 'block', color: 'var(--c-text)' }}>Small Language Models</span>
          <span className="gradient-text" style={{ display: 'block' }}>as Judges</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle" style={{ animation: 'slideInUp 0.8s var(--ease-out-expo) 0.2s both' }}>
          A comprehensive survey of <strong style={{ color: 'var(--c-accent-bright)' }}>≤14B parameter models</strong> serving as
          automated evaluators, covering training paradigms, multi-agent strategies, reliability, and deployment.
        </p>

        {/* Authors */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 24px',
          marginBottom: 28, animation: 'slideInUp 0.8s var(--ease-out-expo) 0.25s both'
        }}>
          {paperMeta.authors.map((a, i) => (
            <div key={a.name} style={{ textAlign: 'center' }}>
              <span style={{
                fontSize: '0.95rem', fontWeight: 600, color: 'var(--c-accent-bright)',
                letterSpacing: '0.01em'
              }}>{a.name}</span>
              <span style={{
                fontSize: '0.78rem', color: 'var(--c-text-muted)', display: 'block',
                fontFamily: 'var(--font-sans)', marginTop: 2
              }}>{a.affiliation}</span>
            </div>
          ))}
        </div>

        {/* Typing effect */}
        <div style={{ marginBottom: 40, minHeight: 28, fontSize: '1rem', animation: 'slideInUp 0.8s var(--ease-out-expo) 0.3s both' }}>
          <TypingEffect phrases={typingPhrases} />
        </div>

        {/* Stats */}
        <div className="hero-stats" style={{ animation: 'slideInUp 0.8s var(--ease-out-expo) 0.4s both' }}>
          {heroStats.map((s, i) => (
            <div key={i} className="badge" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--c-accent-bright)' }}>
                <AnimatedCounter value={s.value} prefix={s.prefix || ''} suffix={s.suffix} duration={1800} />
              </span>
              <span style={{ color: 'var(--c-text-muted)', fontFamily: 'var(--font-sans)', fontSize: '0.75rem' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="hero-ctas" style={{ animation: 'slideInUp 0.8s var(--ease-out-expo) 0.5s both' }}>
          <a href="paper.pdf" target="_blank" rel="noopener" className="btn btn-primary">
            <FileText size={16} /> Read Paper
          </a>
          <a href="https://github.com/anishh15/Awesome-SLM-as-a-Judge" target="_blank" rel="noopener" className="btn btn-outline">
            <GithubIcon size={16} /> GitHub Repo
          </a>
          <a href="#citation" className="btn btn-outline">
            <BookOpen size={16} /> Cite
          </a>
        </div>
      </div>

      <div className="hero-grid-fade" />
    </section>
  )
}
