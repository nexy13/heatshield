import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmail(email, password);
      navigate('/worker');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '2rem 1.5rem',
      background: 'var(--bg)',
    }}>
      {/* Full-bleed background image */}
      <img
        src="/hero.jpg"
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.92) contrast(0.9) saturate(0.7) blur(2px)',
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      />
      {/* Warm-beige / dust tone faded overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(247, 246, 243, 0.85) 0%, rgba(234, 229, 218, 0.8) 100%)',
        zIndex: 1,
      }} />

      {/* Centered glassmorphic card */}
      <div
        className="animate-fade-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(45, 122, 101, 0.12)',
          borderRadius: '18px',
          boxShadow: 'var(--shadow-lg)',
          padding: '2.5rem 2.25rem',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: 24, height: 24, borderRadius: 5, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={12} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.06em', color: 'var(--text)' }}>
              HEATSHIELD AI
            </span>
          </Link>
        </div>

        {/* Small caps eyebrow */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.65rem',
          fontWeight: 500,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          marginBottom: '0.5rem',
        }}>
          SECURE ACCESS — WORKER SAFETY PLATFORM
        </p>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2.25rem',
          fontWeight: 400,
          color: 'var(--text)',
          textAlign: 'center',
          letterSpacing: '-0.015em',
          marginBottom: '2rem',
          lineHeight: 1.2,
        }}>
          Login
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.02em', display: 'block', marginBottom: '0.5rem' }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-field"
                style={{ paddingLeft: '2.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(27, 77, 62, 0.15)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.02em', display: 'block', marginBottom: '0.5rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field"
                style={{ paddingLeft: '2.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(27, 77, 62, 0.15)' }}
              />
            </div>
          </div>

          {/* Remember me & Forgot password row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', fontFamily: 'var(--font-sans)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                style={{ accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
              />
              <span>Remember me</span>
            </label>
            <Link
              to="#"
              style={{ color: 'var(--accent-teal)', textDecoration: 'none', fontWeight: 500, transition: 'opacity 0.2s' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.opacity = '0.8'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '1'; }}
            >
              Forgot Password?
            </Link>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '4px',
              background: 'rgba(185, 28, 28, 0.06)',
              border: '1px solid rgba(185, 28, 28, 0.2)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8125rem',
              color: '#B91C1C',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem 1.75rem',
              fontSize: '0.875rem',
              justifyContent: 'center',
              borderRadius: '4px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Signing in...</>
            ) : (
              <>Sign In <ArrowRight size={15} /></>
            )}
          </button>
        </form>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          marginTop: '2rem',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.375rem',
        }}>
          <span>Don't have an account?</span>
          <Link
            to="/register"
            className="hero-cta-link"
            style={{ fontWeight: 500 }}
          >
            <span>Sign up</span>
            <ArrowRight size={14} />
          </Link>
        </p>
      </div>
    </div>
  );
}
