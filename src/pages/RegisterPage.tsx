import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/database';
import { ROLE_LABELS } from '@/lib/utils/constants';

const availableRoles: { value: UserRole; label: string; description: string }[] = [
  { value: 'worker', label: ROLE_LABELS.worker, description: 'Brick kiln worker on the field' },
  { value: 'supervisor', label: ROLE_LABELS.supervisor, description: 'On-site worker manager' },
  { value: 'admin', label: ROLE_LABELS.admin, description: 'Platform administrator' },
];

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('worker');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signUp(email, password, { name, role });
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-orb" />
        <div className="mesh-orb" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">HeatShield AI</span>
          </Link>
          <h2 className="text-2xl font-bold mb-1">Create your account</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Join the worker safety platform
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-text-muted)] mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-text-muted)] mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-text-muted)] mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-text-muted)] mb-1.5 block">Role</label>
              <div className="space-y-2">
                {availableRoles.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      role === r.value
                        ? 'bg-indigo-500/10 border border-indigo-500/30'
                        : 'bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-indigo-500/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={role === r.value}
                      onChange={() => setRole(r.value)}
                      className="accent-indigo-500"
                    />
                    <div>
                      <p className="text-sm font-medium">{r.label}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{r.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
