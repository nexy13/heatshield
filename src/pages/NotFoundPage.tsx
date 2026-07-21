import { Link } from 'react-router-dom';
import { Shield, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-orb" />
        <div className="mesh-orb" />
      </div>

      <div className="text-center relative z-10 animate-fade-up">
        <div
          className="flex items-center justify-center mx-auto mb-6"
          style={{ width: 72, height: 72, borderRadius: 'var(--radius-xl)', background: 'var(--brand-panel)', boxShadow: '0 12px 30px rgba(37,99,235,0.35)' }}
        >
          <Shield size={34} color="#fff" strokeWidth={2.25} />
        </div>
        <h1
          className="font-serif font-bold mb-3"
          style={{ fontSize: 'clamp(4rem, 12vw, 6rem)', lineHeight: 1, letterSpacing: '-0.03em', background: 'linear-gradient(90deg, var(--accent-grad-from), var(--accent-grad-to))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
        >
          404
        </h1>
        <h2 className="font-serif font-bold mb-2 text-[var(--text)]" style={{ fontSize: 'var(--text-2xl)' }}>Page not found</h2>
        <p className="text-[var(--text-muted)] max-w-md mx-auto mb-8" style={{ fontSize: 'var(--text-base)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary justify-center px-6 py-3">
            <Home size={16} />
            Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary justify-center px-6 py-3">
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
