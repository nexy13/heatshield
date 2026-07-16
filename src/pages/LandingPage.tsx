import { Link } from 'react-router-dom';
import {
  Shield,
  Thermometer,
  Droplets,
  Siren,
  BarChart3,
  Users,
  ArrowRight,
  Zap,
  Globe,
  Heart,
} from 'lucide-react';

const features = [
  {
    icon: Thermometer,
    title: 'Real-Time Heat Monitoring',
    description: 'Continuous weather & heat index tracking for every kiln site with automated risk assessment.',
    color: '#f97316',
  },
  {
    icon: Droplets,
    title: 'Smart Hydration Reminders',
    description: 'Personalized water break schedules based on current heat conditions and work intensity.',
    color: '#3b82f6',
  },
  {
    icon: Siren,
    title: 'Emergency SOS',
    description: 'One-tap emergency alerts with GPS location sharing to supervisors and emergency contacts.',
    color: '#ef4444',
  },
  {
    icon: BarChart3,
    title: 'Compliance Analytics',
    description: 'Daily site safety grades, trend analysis, and automated compliance reporting for NGO audits.',
    color: '#22c55e',
  },
  {
    icon: Users,
    title: 'Worker Safety Dashboard',
    description: 'Real-time visibility into every worker\'s shift status, hydration, and health vitals.',
    color: '#a855f7',
  },
  {
    icon: Zap,
    title: 'Automated Alerts',
    description: 'n8n-powered workflows trigger tiered alerts via SMS, WhatsApp, and push notifications.',
    color: '#eab308',
  },
];

const stats = [
  { value: '50°C+', label: 'Peak kiln temperatures', icon: Thermometer },
  { value: '2.5L/hr', label: 'Recommended hydration', icon: Droplets },
  { value: '<2min', label: 'SOS response target', icon: Siren },
  { value: 'SDG 13', label: 'Climate Action Goal', icon: Globe },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-orb" />
        <div className="mesh-orb" />
        <div className="mesh-orb" />
      </div>

      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">HeatShield AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost px-4 py-2 rounded-lg text-sm font-medium">
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
            >
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-medium text-orange-300 mb-6">
              <Globe size={14} />
              <span>UN Sustainable Development Goal 13: Climate Action</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Protecting lives from{' '}
              <span className="gradient-text">extreme heat</span>
            </h1>
            <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mb-8 leading-relaxed">
              HeatShield AI monitors heat exposure for brick kiln workers in real-time,
              delivers personalized safety alerts, and enables instant emergency response —
              because no one should risk their life for a livelihood.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="btn-primary px-8 py-3.5 rounded-xl text-base font-semibold flex items-center gap-2"
              >
                <Shield size={18} />
                Start Protecting Workers
              </Link>
              <a
                href="#features"
                className="btn-secondary px-8 py-3.5 rounded-xl text-base font-medium flex items-center gap-2"
              >
                Learn More <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 px-6 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`glass rounded-xl p-5 card-hover animate-fade-up`}
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <stat.icon size={24} className="text-orange-400 mb-3" />
              <p className="text-2xl font-bold mb-0.5">{stat.value}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything workers need to{' '}
              <span className="gradient-text">stay safe</span>
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
              A comprehensive platform built specifically for extreme-heat work environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="glass rounded-2xl p-6 card-hover gradient-border animate-fade-up"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}20` }}
                >
                  <feature.icon size={24} style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto glass rounded-3xl p-12 text-center animate-fade-up overflow-hidden relative">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at 30% 50%, #f97316 0%, transparent 60%), radial-gradient(circle at 70% 50%, #ef4444 0%, transparent 60%)',
            }}
          />
          <div className="relative z-10">
            <Heart size={40} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Every worker deserves to go home safe
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-lg mx-auto mb-8">
              Join the mission to protect brick kiln workers from heat-related illness.
              Deploy HeatShield AI at your site today.
            </p>
            <Link
              to="/register"
              className="btn-primary px-10 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-2"
            >
              Get Started Free <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-orange-400" />
            <span className="text-sm text-[var(--color-text-muted)]">
              HeatShield AI — SDG 13 Climate Action Project
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} HeatShield AI. Protecting lives from extreme heat.
          </p>
        </div>
      </footer>
    </div>
  );
}
