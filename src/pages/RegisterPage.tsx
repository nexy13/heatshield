import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, Phone, Calendar, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/database';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('worker');
  const [siteId, setSiteId] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');

  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from('sites')
      .select('id, name')
      .order('name', { ascending: true })
      .then(({ data, error: err }) => {
        setLoadingSites(false);
        if (!err && data) {
          setSites(data);
          if (data.length > 0) {
            setSiteId(data[0].id);
          }
        } else if (err) {
          console.error('Error fetching sites:', err.message);
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, {
        name,
        role: role === 'admin' ? 'admin' : 'worker',
        site_id: siteId || null,
        age: age ? parseInt(age, 10) : null,
        phone: phone || null,
      });
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
          maxWidth: '480px',
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
          marginBottom: '1.5rem',
          lineHeight: 1.2,
        }}>
          Register
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Name & Email Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={13} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vikram Sharma"
                  required
                  className="input-field"
                  style={{ paddingLeft: '2.2rem', borderRadius: '4px', background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(27, 77, 62, 0.15)', fontSize: '0.8rem' }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={13} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="input-field"
                  style={{ paddingLeft: '2.2rem', borderRadius: '4px', background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(27, 77, 62, 0.15)', fontSize: '0.8rem' }}
                />
              </div>
            </div>
          </div>

          {/* Password & Phone Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="input-field"
                  style={{ paddingLeft: '2.2rem', borderRadius: '4px', background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(27, 77, 62, 0.15)', fontSize: '0.8rem' }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={13} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="input-field"
                  style={{ paddingLeft: '2.2rem', borderRadius: '4px', background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(27, 77, 62, 0.15)', fontSize: '0.8rem' }}
                />
              </div>
            </div>
          </div>

          {/* Age & Site ID Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Age
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={13} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="35"
                  className="input-field"
                  style={{ paddingLeft: '2.2rem', borderRadius: '4px', background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(27, 77, 62, 0.15)', fontSize: '0.8rem' }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Kiln Site Selection
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={13} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <select
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  required
                  className="input-field"
                  style={{ paddingLeft: '2.2rem', borderRadius: '4px', background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(27, 77, 62, 0.15)', fontSize: '0.8rem', height: '36px' }}
                >
                  {loadingSites ? (
                    <option value="">Loading sites...</option>
                  ) : sites.length === 0 ? (
                    <option value="">No sites available</option>
                  ) : (
                    sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              Select Platform Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setRole('worker')}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: role === 'worker' ? 'var(--accent-teal)' : 'var(--border)',
                  background: role === 'worker' ? 'var(--accent-teal-light)' : 'rgba(255,255,255,0.7)',
                  color: role === 'worker' ? 'var(--accent)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  fontWeight: role === 'worker' ? 500 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Worker profile
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: role === 'admin' ? 'var(--accent-teal)' : 'var(--border)',
                  background: role === 'admin' ? 'var(--accent-teal-light)' : 'rgba(255,255,255,0.7)',
                  color: role === 'admin' ? 'var(--accent)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  fontWeight: role === 'admin' ? 500 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Site Administrator
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '0.6rem 0.8rem',
              borderRadius: '4px',
              background: 'rgba(185, 28, 28, 0.06)',
              border: '1px solid rgba(185, 28, 28, 0.2)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.75rem',
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
              <><Loader2 size={16} className="animate-spin" /> Creating Account...</>
            ) : (
              <>Create Account <ArrowRight size={15} /></>
            )}
          </button>
        </form>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          marginTop: '1.5rem',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.375rem',
        }}>
          <span>Already have an account?</span>
          <Link
            to="/login"
            className="hero-cta-link"
            style={{ fontWeight: 500 }}
          >
            <span>Sign in</span>
            <ArrowRight size={14} />
          </Link>
        </p>
      </div>
    </div>
  );
}
