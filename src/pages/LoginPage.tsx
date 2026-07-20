import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { signInWithEmail, resetPassword, authUser, role } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Type your email address above first, then click "Forgot Password?".');
      return;
    }
    try {
      setSendingReset(true);
      setError(null);
      setNotice(null);
      await resetPassword(email);
      setNotice(`Password reset link sent to ${email}. Check your inbox (and spam folder).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email');
    } finally {
      setSendingReset(false);
    }
  };

  useEffect(() => {
    if (authUser && role) {
      const roleRedirects: Record<string, string> = {
        supervisor: '/supervisor',
        admin: '/admin',
      };
      navigate(roleRedirects[role] ?? '/supervisor');
    }
  }, [authUser, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const profile = await signInWithEmail(email, password);
      if (profile) {
        const roleRedirects: Record<string, string> = {
          supervisor: '/supervisor',
          admin: '/admin',
        };
        navigate(roleRedirects[profile.role] ?? '/supervisor');
      } else {
        setError(
          'Signed in, but no profile was found for this account. Please contact your administrator.'
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const fieldLabel: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'rgba(203, 213, 225, 0.85)',
    letterSpacing: '0.04em',
    display: 'block',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
  };

  const fieldInput: React.CSSProperties = {
    paddingLeft: '2.625rem',
    borderRadius: '12px',
    background: 'rgba(148, 163, 184, 0.07)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    color: '#F1F5F9',
    boxShadow: 'none',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '2rem 1.5rem',
        background:
          'radial-gradient(1100px 650px at 80% -10%, rgba(37, 99, 235, 0.16), transparent 60%), radial-gradient(900px 550px at -10% 110%, rgba(234, 88, 12, 0.1), transparent 55%), linear-gradient(160deg, #060D1F 0%, #0A1428 55%, #0D1A33 100%)',
      }}
    >
      {/* Ambient aurora orbs */}
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-orb" />
        <div className="mesh-orb" />
      </div>

      {/* Subtle grid texture */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 75%)',
        }}
      />

      {/* Centered glass card */}
      <div
        className="animate-fade-up"
        style={{
          width: '100%',
          maxWidth: '430px',
          background: 'rgba(15, 26, 48, 0.62)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(148, 163, 184, 0.16)',
          borderRadius: '24px',
          boxShadow: '0 32px 80px rgba(3, 7, 18, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          padding: '2.75rem 2.5rem',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #2563EB, #1B2E52)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
              }}
            >
              <Shield size={20} color="#fff" strokeWidth={2.25} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#F8FAFC',
              }}
            >
              HEATSHIELD
            </span>
          </Link>
        </div>

        {/* Eyebrow */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#60A5FA',
            textAlign: 'center',
            marginBottom: '0.625rem',
          }}
        >
          Secure Access — Worker Safety Platform
        </p>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#F8FAFC',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            marginBottom: '2rem',
            lineHeight: 1.2,
          }}
        >
          Welcome back
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={fieldLabel}>Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={15}
                style={{
                  position: 'absolute',
                  left: '0.9375rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(148, 163, 184, 0.7)',
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-field"
                style={fieldInput}
              />
            </div>
          </div>

          <div>
            <label style={fieldLabel}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={15}
                style={{
                  position: 'absolute',
                  left: '0.9375rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(148, 163, 184, 0.7)',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field"
                style={{ ...fieldInput, paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.625rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  color: 'rgba(148, 163, 184, 0.7)',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                color: 'rgba(203, 213, 225, 0.75)',
              }}
            >
              <input type="checkbox" style={{ accentColor: '#2563EB', cursor: 'pointer' }} />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={sendingReset}
              style={{
                color: '#60A5FA',
                background: 'none',
                border: 'none',
                cursor: sendingReset ? 'wait' : 'pointer',
                fontWeight: 600,
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-sans)',
                padding: 0,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.8'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
            >
              {sendingReset ? 'Sending…' : 'Forgot Password?'}
            </button>
          </div>

          {error && (
            <div
              className="animate-scale-up"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                padding: '0.8125rem 1rem',
                borderRadius: '12px',
                background: 'rgba(220, 38, 38, 0.12)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8125rem',
                color: '#FCA5A5',
                lineHeight: 1.5,
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div
              className="animate-scale-up"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                padding: '0.8125rem 1rem',
                borderRadius: '12px',
                background: 'rgba(22, 163, 74, 0.12)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8125rem',
                color: '#86EFAC',
                lineHeight: 1.5,
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{notice}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              marginTop: '0.5rem',
              padding: '0.8125rem 1.75rem',
              fontSize: '0.875rem',
              borderRadius: '12px',
              width: '100%',
              background: 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8125rem',
            color: 'rgba(148, 163, 184, 0.75)',
            marginTop: '2rem',
            textAlign: 'center',
          }}
        >
          Accounts are created by your administrator.
        </p>
      </div>
    </div>
  );
}
