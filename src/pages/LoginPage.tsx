import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, ArrowLeft, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, Thermometer, Droplets, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';

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

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-2 bg-[var(--bg-white)]">
      {/* ─────────────── LEFT · FORM PANEL ─────────────── */}
      <div className="relative flex flex-col px-6 sm:px-10 lg:px-16 py-8 min-h-screen lg:min-h-0">
        {/* Logo (top-left) + back link */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline" aria-label="HeatShield home">
            <span
              className="flex items-center justify-center rounded-xl"
              style={{ width: 36, height: 36, background: 'var(--brand-panel)', boxShadow: '0 6px 16px rgba(37,99,235,0.35)' }}
            >
              <Shield size={18} color="#fff" strokeWidth={2.25} />
            </span>
            <span className="font-serif font-bold tracking-[0.08em] text-[var(--text)]" style={{ fontSize: 'var(--text-base)' }}>
              HEATSHIELD
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand)] rounded-md px-1"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}
          >
            <ArrowLeft size={15} /> Back to site
          </Link>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-[420px] mx-auto py-10">
          <div className="text-left mb-8">
            <p
              className="mb-2.5 font-semibold uppercase text-[var(--brand)]"
              style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.16em' }}
            >
              Secure access
            </p>
            <h1 className="font-serif font-bold text-[var(--text)] leading-tight" style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em' }}>
              Welcome back
            </h1>
            <p className="mt-2 text-[var(--text-muted)]" style={{ fontSize: 'var(--text-sm)' }}>
              Sign in to your HeatShield safety dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              leftIcon={<Mail size={16} />}
            />

            <Input
              label="Password"
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="flex p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand)]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {/* Remember me + Forgot password (same row) */}
            <div className="flex items-center justify-between gap-3">
              <Checkbox label="Remember me" defaultChecked />
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={sendingReset}
                className="font-semibold text-[var(--brand)] hover:opacity-80 transition-opacity disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand)] rounded-md px-1"
                style={{ fontSize: 'var(--text-sm)', cursor: sendingReset ? 'wait' : 'pointer' }}
              >
                {sendingReset ? 'Sending…' : 'Forgot password?'}
              </button>
            </div>

            {error && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 font-medium animate-scale-up"
                style={{ background: 'var(--emergency-bg)', border: '1px solid rgba(220,38,38,0.22)', color: 'var(--emergency)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}
                role="alert"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {notice && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 font-medium animate-scale-up"
                style={{ background: 'var(--safe-bg)', border: '1px solid rgba(22,163,74,0.25)', color: 'var(--safe)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}
                role="status"
              >
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span>{notice}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full justify-center mt-1"
              style={{ padding: '0.8125rem 1.75rem', fontSize: 'var(--text-sm)' }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Signing in…</span>
              ) : (
                <span className="inline-flex items-center gap-2">Sign In <ArrowRight size={15} /></span>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-[var(--text-muted)]" style={{ fontSize: 'var(--text-sm)' }}>
            Accounts are created by your administrator.
          </p>
        </div>
      </div>

      {/* ─────────────── RIGHT · BRAND PANEL (desktop only) ─────────────── */}
      <div
        className="hidden lg:flex relative overflow-hidden items-center justify-center"
        style={{ background: 'var(--brand-panel)' }}
        aria-hidden="true"
      >
        {/* Ambient decorative orbs */}
        <div className="absolute rounded-full" style={{ width: 520, height: 520, top: '-12%', right: '-14%', background: 'radial-gradient(circle, rgba(255,255,255,0.16), transparent 68%)', filter: 'blur(8px)' }} />
        <div className="absolute rounded-full" style={{ width: 460, height: 460, bottom: '-16%', left: '-12%', background: 'radial-gradient(circle, rgba(234,88,12,0.22), transparent 66%)', filter: 'blur(10px)' }} />
        {/* Grid texture */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '46px 46px',
            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 40%, black 30%, transparent 78%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 40%, black 30%, transparent 78%)',
          }}
        />

        <div className="relative z-10 w-full max-w-xl px-16 py-12 text-left">
          <p className="font-semibold uppercase" style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.18em', color: 'var(--on-brand-muted)' }}>
            UN SDG 13 · Climate Action
          </p>
          <h2 className="mt-4 font-serif font-bold leading-[1.12]" style={{ fontSize: 'var(--text-4xl)', color: 'var(--brand-contrast)', letterSpacing: '-0.02em' }}>
            Keep every worker safe from <em className="italic" style={{ color: '#BFDBFE' }}>extreme heat</em>.
          </h2>
          <p className="mt-5 leading-relaxed" style={{ fontSize: 'var(--text-base)', color: 'var(--on-brand-muted)', maxWidth: 440 }}>
            Real-time heat monitoring, one-tap SOS response, and automated safety alerts — built for the people who work in the hottest conditions.
          </p>

          {/* Floating dashboard-preview card (social proof) */}
          <div
            className="mt-10 rounded-2xl bg-white p-5 w-full"
            style={{ maxWidth: 380, boxShadow: '0 30px 70px rgba(3,7,18,0.4)' }}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wide text-[var(--text-muted)]" style={{ fontSize: '0.65rem' }}>
                <span className="pulse-dot" style={{ background: 'var(--safe)', width: 6, height: 6 }} /> Live · Anekal Cluster
              </span>
              <span className="badge badge-danger">Danger</span>
            </div>

            <div className="mt-4 flex items-end gap-4">
              <div>
                <div className="font-serif font-bold text-[var(--text)] leading-none" style={{ fontSize: '2.75rem' }}>54°</div>
                <div className="mt-1.5 font-semibold uppercase tracking-wide text-[var(--text-muted)]" style={{ fontSize: '0.65rem' }}>Heat Index</div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="rounded-xl px-3 py-2" style={{ background: 'var(--high-bg)' }}>
                  <div className="flex items-center gap-1 text-[var(--high)]"><Thermometer size={12} /><span className="font-bold" style={{ fontSize: '0.9rem' }}>46°C</span></div>
                  <div className="text-[var(--text-muted)]" style={{ fontSize: '0.6rem' }}>Air temp</div>
                </div>
                <div className="rounded-xl px-3 py-2" style={{ background: 'var(--info-bg)' }}>
                  <div className="flex items-center gap-1 text-[var(--info)]"><Droplets size={12} /><span className="font-bold" style={{ fontSize: '0.9rem' }}>38%</span></div>
                  <div className="text-[var(--text-muted)]" style={{ fontSize: '0.6rem' }}>Humidity</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]" style={{ fontSize: 'var(--text-xs)' }}>
                <Users size={13} /> Workers on site
              </span>
              <span className="font-bold text-[var(--text)]" style={{ fontSize: 'var(--text-sm)' }}>24 protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
