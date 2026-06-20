import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HeroSection from './sections/HeroSection'
import MotivationSection from './sections/MotivationSection'
import InsightsSection from './sections/InsightsSection'
import TaxonomySection from './sections/TaxonomySection'
import JudgeSystemsSection from './sections/JudgeSystemsSection'
import ModelFamiliesSection from './sections/ModelFamiliesSection'
import StrategiesSection from './sections/StrategiesSection'
import ReliabilitySection from './sections/ReliabilitySection'
import VerifiabilitySection from './sections/VerifiabilitySection'
import FutureSection from './sections/FutureSection'

export default function App() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Background atmosphere */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="orb" style={{ width: 600, height: 600, top: -200, left: -200, background: 'var(--c-primary)' }} />
        <div className="orb" style={{ width: 400, height: 400, top: '40%', right: -150, background: 'var(--c-accent)' }} />
        <div className="orb" style={{ width: 300, height: 300, bottom: '20%', left: '30%', background: 'var(--c-primary-dark)' }} />
        <div className="scanline" style={{ position: 'absolute', inset: 0 }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        <main>
          <HeroSection />
          <div className="section-divider" />
          <MotivationSection />
          <div className="section-divider" />
          <InsightsSection />
          <div className="section-divider" />
          <TaxonomySection />
          <div className="section-divider" />
          <JudgeSystemsSection />
          <div className="section-divider" />
          <ModelFamiliesSection />
          <div className="section-divider" />
          <StrategiesSection />
          <div className="section-divider" />
          <ReliabilitySection />
          <div className="section-divider" />
          <VerifiabilitySection />
          <div className="section-divider" />
          <FutureSection />
        </main>

        <Footer />
      </div>
    </div>
  )
}
