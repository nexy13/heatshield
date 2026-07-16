import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Thermometer, Droplets, Siren, BarChart3, Users, Zap } from 'lucide-react';

const features = [
  {
    number: '01',
    icon: Thermometer,
    title: 'Real-Time Heat Monitoring',
    description:
      'Continuous temperature and heat index tracking for every kiln site. Automated risk assessment keeps supervisors ahead of danger.',
  },
  {
    number: '02',
    icon: Droplets,
    title: 'Smart Hydration Reminders',
    description:
      'Personalized water break schedules adapt to current heat conditions and work intensity — delivered via push, SMS, or WhatsApp.',
  },
  {
    number: '03',
    icon: Siren,
    title: 'Emergency SOS',
    description:
      'One-tap emergency alerts share GPS location instantly with supervisors and emergency contacts. Response under 2 minutes.',
  },
  {
    number: '04',
    icon: BarChart3,
    title: 'Compliance Analytics',
    description:
      'Daily site safety grades, trend analysis, and automated compliance reporting built for NGO audit requirements.',
  },
  {
    number: '05',
    icon: Users,
    title: 'Worker Safety Dashboard',
    description:
      "Real-time visibility into every worker's shift status, hydration levels, and health vitals — all in one view.",
  },
  {
    number: '06',
    icon: Zap,
    title: 'Automated Workflows',
    description:
      'n8n-powered automation triggers tiered alerts and escalation paths without any manual intervention required.',
  },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Navigation ── */}
      <nav className={`landing-nav ${scrolled ? 'landing-nav-solid' : 'landing-nav-transparent'}`}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div style={{
            width: 30, height: 30,
            borderRadius: 6,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={15} color="#fff" />
          </div>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.04em',
            color: 'var(--text)',
          }}>
            HEATSHIELD AI
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <Link to="/login" className="btn-ghost" style={{ fontSize: '0.8125rem', letterSpacing: '0.01em' }}>
            Sign In
          </Link>
          <Link to="/register" className="btn-primary" style={{ borderRadius: 4 }}>
            Get Started <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <img
          src="/hero.jpg"
          alt="Brick kiln landscape at golden hour"
          className="hero-image"
        />
        <div className="hero-overlay" />

        {/* Content bottom-left */}
        <div className="hero-content animate-fade-up">
          <p className="hero-eyebrow">UN SDG 13 — Climate Action</p>
          <h1 className="hero-title">
            Safety for those who<br />
            work in <em>extreme heat</em>
          </h1>
          <p className="hero-tagline">
            HeatShield AI monitors brick kiln workers in real-time,
            delivers personalized safety alerts, and enables instant
            emergency response.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.75rem 1.75rem', borderRadius: 4 }}>
              Start Protecting Workers
            </Link>
            <Link to="/login" className="hero-cta-link">
              Sign in to dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hero-scroll-hint">Scroll to discover</div>
      </section>

      {/* ── Stats Strip ── */}
      <div className="stats-strip">
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3rem' }}>
          {[
            { value: '50°C+', label: 'Peak kiln temperatures recorded' },
            { value: '2.5 L', label: 'Recommended hydration per hour' },
            { value: '<2 min', label: 'SOS emergency response target' },
            { value: 'SDG 13', label: 'Climate Action Goal alignment' },
          ].map((s, i) => (
            <div key={i} className={`animate-fade-up`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="stat-item-value">{s.value}</div>
              <div className="stat-item-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mission Section ── */}
      <section className="section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', maxWidth: 1200, margin: '0 auto' }}>
        <div className="animate-fade-up">
          <p className="section-label">The Mission</p>
          <h2 className="section-title">
            No worker should risk their life for a <em>livelihood</em>
          </h2>
        </div>
        <div className="animate-fade-up animate-fade-up-delay-2" style={{ paddingTop: '0.5rem' }}>
          <p className="section-body">
            Brick kiln workers in South Asia face extreme heat exposure
            with little protection or recourse. HeatShield AI brings
            enterprise-grade safety monitoring to the field — accessible
            from any phone, in any language, at any time.
          </p>
          <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/register" className="btn-primary" style={{ borderRadius: 4 }}>
              Deploy at your site
            </Link>
            <a href="#features" className="hero-cta-link" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              See how it works <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ background: 'var(--bg-muted)', padding: '8rem 5vw' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: '5rem' }}>
            <p className="section-label">Platform Features</p>
            <h2 className="section-title">Everything workers<br />need to <em>stay safe</em></h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem',
          }}>
            {features.map((f, i) => (
              <div
                key={f.title}
                className="feature-card animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="feature-number">{f.number}</div>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: 8,
                  background: 'var(--accent-teal-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <f.icon size={17} color="var(--accent-teal)" />
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: 'var(--text)',
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.01em',
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8375rem',
                  fontWeight: 300,
                  color: 'var(--text-muted)',
                  lineHeight: 1.7,
                }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="section" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p className="section-label" style={{ marginBottom: '4rem' }}>How it works</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>
          {[
            { step: '1', title: 'Deploy', desc: 'Install the platform at your kiln site in under 30 minutes. No hardware required — works on any Android device.' },
            { step: '2', title: 'Monitor', desc: 'Real-time weather data streams in every 15 minutes. Workers receive automated hydration and heat alerts.' },
            { step: '3', title: 'Respond', desc: 'SOS alerts reach supervisors in seconds. Compliance reports generate automatically for NGO oversight.' },
          ].map((item, i) => (
            <div
              key={item.step}
              className="animate-fade-up"
              style={{
                animationDelay: `${i * 0.12}s`,
                padding: '3rem',
                borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '4rem',
                fontWeight: 400,
                color: 'var(--border-strong)',
                lineHeight: 1,
                marginBottom: '2rem',
                letterSpacing: '-0.03em',
              }}>
                {item.step}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                fontWeight: 400,
                color: 'var(--text)',
                marginBottom: '1rem',
              }}>
                {item.title}
              </h3>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: 300,
                color: 'var(--text-muted)',
                lineHeight: 1.75,
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem' }}>
              Get started today
            </p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3vw, 2.75rem)', fontWeight: 400, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              Every worker deserves<br />
              <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>to go home safe</em>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'flex-start' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', fontWeight: 300, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, maxWidth: 380 }}>
              Join the mission to protect brick kiln workers from
              heat-related illness. Deploy HeatShield AI at your site today.
            </p>
            <Link
              to="/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: '#fff', color: 'var(--accent)',
                fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 500,
                padding: '0.75rem 1.75rem', borderRadius: 4, textDecoration: 'none',
                transition: 'opacity 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.opacity = '0.9'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '1'; }}
            >
              Get Started Free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer-clean">
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 24, height: 24, borderRadius: 5, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={12} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              HeatShield AI — SDG 13 Climate Action
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--text-light)' }}>
            © {new Date().getFullYear()} HeatShield AI
          </p>
        </div>
      </footer>
    </div>
  );
}
