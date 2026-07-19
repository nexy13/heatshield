import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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

  const inputStyle: React.CSSProperties = {
    paddingLeft: '2.5rem',
    paddingRight: '2.75rem',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.7)',
    borderColor: 'rgba(27, 77, 62, 0.15)',
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      background: 'var(--bg)',
    }}>
      <div
        className="animate-fade-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-white)',
          border: '1px solid var(--border)',
          borderRadius: '18px',
          boxShadow: 'var(--shadow-lg)',
          padding: '2.5rem 2.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: 24, height: 24, borderRadius: 5, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={12} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.06em', color: 'var(--text)' }}>
              HEATSHIELD
            </span>
          </Link>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.875rem',
          fontWeight: 400,
          color: 'var(--text)',
          textAlign: 'center',
          letterSpacing: '-0.015em',
          marginBottom: '0.75rem',
          lineHeight: 1.2,
        }}>
          Set a new password
        </h2>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
            <Loader2 size={22} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : !authUser ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              This page only works when opened from a password-reset email link,
              and links expire after a short time. Request a fresh link from the
              login page.
            </p>
            <Link to="/login" className="btn-primary" style={{ justifyContent: 'center' }}>
              Back to Login
            </Link>
          </div>
        ) : done ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={36} style={{ color: 'var(--accent-teal)', margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              Password updated. Taking you to your dashboard…
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.75rem' }}>
              Resetting password for <strong style={{ color: 'var(--text-secondary)' }}>{authUser.email}</strong>
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { label: 'New password', value: password, set: setPassword },
                { label: 'Confirm new password', value: confirm, set: setConfirm },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                    {label}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="input-field"
                      style={inputStyle}
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
                        color: 'var(--text-muted)',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}

              {error && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '4px',
                  background: 'rgba(185, 28, 28, 0.06)',
                  border: '1px solid rgba(185, 28, 28, 0.2)',
                  fontSize: '0.8125rem',
                  color: '#B91C1C',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ justifyContent: 'center', width: '100%', padding: '0.75rem 1.75rem', fontSize: '0.875rem' }}
              >
                {saving ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving…</>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
