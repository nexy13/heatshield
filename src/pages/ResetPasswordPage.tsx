import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

/**
 * Landing page for the password-recovery email link.
 * Supabase redirects here with a recovery token; supabase-js exchanges it
 * automatically (detectSessionInUrl), giving the visitor a session that
 * allows setting a new password.
 */
export default function ResetPasswordPage() {
  const { authUser, role, updatePassword, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    try {
      setSaving(true);
      await updatePassword(password);
      setDone(true);
      setTimeout(() => {
        navigate(role === 'admin' ? '/admin' : '/supervisor');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      className="flex p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand)]"
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6 py-10"
      style={{
        background:
          'radial-gradient(900px 520px at 50% -10%, var(--brand-tint), transparent 60%), var(--bg)',
      }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl p-8 animate-fade-up"
          style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2.5 no-underline" aria-label="HeatShield home">
              <span
                className="flex items-center justify-center rounded-xl"
                style={{ width: 34, height: 34, background: 'var(--brand-panel)', boxShadow: '0 6px 16px rgba(37,99,235,0.35)' }}
              >
                <Shield size={17} color="#fff" strokeWidth={2.25} />
              </span>
              <span className="font-serif font-bold tracking-[0.08em] text-[var(--text)]" style={{ fontSize: 'var(--text-base)' }}>
                HEATSHIELD
              </span>
            </Link>
          </div>

          <h1
            className="font-serif font-bold text-[var(--text)] text-center leading-tight"
            style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em' }}
          >
            Set a new password
          </h1>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={22} className="animate-spin text-[var(--text-muted)]" />
            </div>
          ) : !authUser ? (
            <div className="text-center mt-4">
              <p className="text-[var(--text-muted)] leading-relaxed mb-6" style={{ fontSize: 'var(--text-sm)' }}>
                This page only works when opened from a password-reset email link,
                and links expire after a short time. Request a fresh link from the login page.
              </p>
              <Link to="/login" className="btn-primary w-full justify-center" style={{ padding: '0.75rem 1.75rem' }}>
                <ArrowLeft size={15} /> Back to Login
              </Link>
            </div>
          ) : done ? (
            <div className="text-center py-4 mt-2 animate-scale-up">
              <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: 'var(--safe)' }} />
              <p className="text-[var(--text-secondary)]" style={{ fontSize: 'var(--text-base)' }}>
                Password updated. Taking you to your dashboard…
              </p>
            </div>
          ) : (
            <>
              <p className="text-center text-[var(--text-muted)] mt-2 mb-6" style={{ fontSize: 'var(--text-sm)' }}>
                Resetting password for <strong className="text-[var(--text-secondary)]">{authUser.email}</strong>
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="New password"
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  leftIcon={<Lock size={16} />}
                  trailing={passwordToggle}
                />

                <Input
                  label="Confirm new password"
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  leftIcon={<Lock size={16} />}
                  trailing={passwordToggle}
                />

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

                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  className="w-full justify-center mt-1"
                  style={{ padding: '0.8125rem 1.75rem', fontSize: 'var(--text-sm)' }}
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving…</span>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        {authUser && !done && (
          <p className="text-center mt-5">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand)] rounded-md px-1"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}
            >
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
