import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, ArrowRight, Menu, X, Play, Thermometer, Droplets, Siren, BarChart3,
  Sparkles, FileCheck, ShieldCheck, UserRound, Activity, BellRing, Flame,
  Ambulance, Globe2, Mail, MessageSquare,
  Plus, Minus, MapPin, CheckCircle2, Cpu, Users, Languages, ChevronDown, Check,
} from 'lucide-react';
import { LANGUAGES, LANDING_TRANSLATIONS, type LanguageCode } from '@/lib/i18n/landing';

/* ── gradient text helpers ── */
const brandGrad: CSSProperties = { background: 'linear-gradient(90deg,#2563EB,#22D3EE)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' };
const heatGrad: CSSProperties = { background: 'linear-gradient(90deg,#F97316,#EF4444)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' };

const LANG_STORAGE_KEY = 'heatshield_landing_lang';

/* ── persisted language preference (landing page only) ── */
function useLandingLanguage(): [LanguageCode, (l: LanguageCode) => void] {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved && saved in LANDING_TRANSLATIONS) return saved as LanguageCode;
    } catch {
      /* localStorage unavailable — fall back to English */
    }
    return 'en';
  });

  useEffect(() => {
    const prevLang = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = prevLang;
    };
  }, [lang]);

  const setLang = (l: LanguageCode) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, l);
    } catch {
      /* ignore persistence failure */
    }
  };

  return [lang, setLang];
}

/* ── language dropdown (desktop nav + mobile drawer) ── */
function LanguageSwitcher({
  lang,
  onChange,
  label,
  compact = false,
}: {
  lang: LanguageCode;
  onChange: (l: LanguageCode) => void;
  label: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="inline-flex items-center gap-1.5 font-semibold rounded-lg transition-colors"
        style={
          compact
            ? { fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0.5rem 0.25rem' }
            : { fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0.5rem 0.6rem' }
        }
      >
        <Languages size={16} />
        {!compact && <span>{current.native}</span>}
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute right-0 mt-2 py-1.5 rounded-2xl bg-white z-10"
          style={{ minWidth: 168, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
        >
          {LANGUAGES.map((l) => {
            const selected = l.code === lang;
            return (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(l.code);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between gap-3 text-left px-3.5 py-2 transition-colors"
                style={{ fontSize: '0.875rem', color: selected ? 'var(--brand-strong)' : 'var(--text)', fontWeight: selected ? 700 : 500 }}
              >
                <span className="flex items-baseline gap-2">
                  <span>{l.native}</span>
                  {l.native !== l.english && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.english}</span>}
                </span>
                {selected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── scroll-reveal wrapper (IntersectionObserver, inline transitions) ── */
function Reveal({ children, className = '', delay = 0, y = 24 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(${y}px)`,
        transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

/* ── animated counter (fires when in view) ── */
function Counter({ to, suffix = '', duration = 1500 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── static per-item visuals (icons/tints); text comes from translations, zipped by index ── */
const NAV_HREFS = ['#top', '#features', '#how', '#impact', '#contact'] as const;
const TRUST_ICONS = [Flame, ShieldCheck, Activity, Siren, Sparkles];
const FEATURES_META = [
  { icon: Thermometer, tint: '#EA580C' },
  { icon: Droplets, tint: '#2563EB' },
  { icon: Siren, tint: '#DC2626' },
  { icon: BarChart3, tint: '#7C3AED' },
  { icon: Sparkles, tint: '#0891B2' },
  { icon: FileCheck, tint: '#16A34A' },
];
const STEPS_ICONS = [UserRound, Thermometer, Droplets, Siren, BellRing, ShieldCheck];
const WHY_META = [
  { icon: Flame, tint: '#EA580C' },
  { icon: ShieldCheck, tint: '#2563EB' },
  { icon: Cpu, tint: '#0891B2' },
  { icon: Ambulance, tint: '#DC2626' },
];
const PREVIEW_META = [
  { icon: Thermometer, tint: '#F87171', v: '54°C' },
  { icon: Siren, tint: '#4ADE80', v: '0' },
  { icon: BarChart3, tint: '#60A5FA', v: '98%' },
];
const IMPACT_NODES: ReactNode[] = [
  <Counter key="workers" to={500} suffix="+" />,
  <Counter key="success" to={99} suffix="%" />,
  '24/7',
  <Counter key="sites" to={5} />,
];
const FOOTER_LINK_META = [
  { colKey: 'product', links: [['features', '#features'], ['howItWorks', '#how'], ['liveDashboard', '#preview']] },
  { colKey: 'company', links: [['impact', '#impact'], ['contact', '#contact'], ['signIn', '/login']] },
  { colKey: 'legal', links: [['privacy', '#contact'], ['terms', '#contact'], ['github', '#contact']] },
] as const;

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [lang, setLang] = useLandingLanguage();
  const t = LANDING_TRANSLATIONS[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLabels = [t.nav.home, t.nav.features, t.nav.how, t.nav.impact, t.nav.contact];
  const footerLinkLabels: Record<string, string> = {
    features: t.footer.links.features, howItWorks: t.footer.links.howItWorks, liveDashboard: t.footer.links.liveDashboard,
    impact: t.footer.links.impact, contact: t.footer.links.contact, signIn: t.footer.links.signIn,
    privacy: t.footer.links.privacy, terms: t.footer.links.terms, github: t.footer.links.github,
  };
  const footerColLabels: Record<string, string> = { product: t.footer.columns.product, company: t.footer.columns.company, legal: t.footer.columns.legal };

  return (
    <div id="top" style={{ background: 'var(--bg-white)', color: 'var(--text)', overflowX: 'hidden' }}>
      {/* ═══════════ NAV ═══════════ */}
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.72)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px) saturate(140%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(140%)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          boxShadow: scrolled ? '0 6px 24px rgba(11,21,38,0.06)' : 'none',
        }}
      >
        <nav className="mx-auto flex items-center justify-between h-16 px-5 sm:px-8" style={{ maxWidth: 1240 }}>
          <a href="#top" className="flex items-center gap-2.5 no-underline shrink-0">
            <span className="flex items-center justify-center rounded-xl" style={{ width: 34, height: 34, background: 'var(--brand-panel)', boxShadow: '0 6px 16px rgba(37,99,235,0.35)' }}>
              <Shield size={17} color="#fff" strokeWidth={2.25} />
            </span>
            <span className="font-serif font-bold tracking-[0.08em]" style={{ fontSize: '0.95rem', color: 'var(--text)' }}>HEATSHIELD</span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {NAV_HREFS.map((href, i) => (
              <a key={href} href={href} className="lp-navlink no-underline font-medium transition-colors" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {navLabels[i]}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <LanguageSwitcher lang={lang} onChange={setLang} label={t.languageLabel} />
            <Link to="/login" className="no-underline font-semibold px-3 py-2 rounded-lg transition-colors" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {t.actions.login}
            </Link>
            <Link to="/login" className="lp-shine btn-primary no-underline" style={{ fontSize: '0.875rem', padding: '0.6rem 1.15rem', borderRadius: 10 }}>
              {t.actions.getStarted} <ArrowRight size={15} />
            </Link>
          </div>

          <button className="lg:hidden flex items-center justify-center rounded-lg p-2" onClick={() => setMenuOpen(true)} aria-label="Open menu" style={{ color: 'var(--text)' }}>
            <Menu size={22} />
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 animate-fade-in" style={{ background: 'rgba(6,13,31,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 p-6 flex flex-col animate-fade-in" style={{ background: 'var(--bg-white)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-8">
              <span className="font-serif font-bold tracking-[0.06em]" style={{ fontSize: '0.9rem' }}>HEATSHIELD</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="btn-icon"><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-1">
              {NAV_HREFS.map((href, i) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="no-underline font-medium py-3 px-2 rounded-lg" style={{ color: 'var(--text-secondary)' }}>{navLabels[i]}</a>
              ))}
            </div>
            <div className="mt-6 mb-2 pt-5 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="font-semibold uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>{t.languageLabel}</span>
              <LanguageSwitcher lang={lang} onChange={setLang} label={t.languageLabel} compact />
            </div>
            <div className="mt-auto flex flex-col gap-3">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary justify-center no-underline">{t.actions.login}</Link>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-primary justify-center no-underline">{t.actions.getStarted} <ArrowRight size={15} /></Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ HERO ═══════════ */}
      <section className="lp-aurora relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="lp-blob lp-blob-1" style={{ width: 460, height: 460, top: '-8%', right: '4%', background: 'radial-gradient(circle, rgba(37,99,235,0.32), transparent 68%)' }} aria-hidden="true" />
        <div className="lp-blob lp-blob-2" style={{ width: 420, height: 420, bottom: '-14%', left: '-6%', background: 'radial-gradient(circle, rgba(249,115,22,0.24), transparent 66%)' }} aria-hidden="true" />
        <div className="lp-grid absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto grid lg:grid-cols-2 gap-14 lg:gap-10 items-center px-5 sm:px-8" style={{ maxWidth: 1240 }}>
          {/* Copy */}
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-6" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
                <span className="pulse-dot" style={{ background: 'var(--brand)', width: 6, height: 6 }} />
                <span className="font-semibold uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.14em', color: 'var(--brand-strong)' }}>{t.hero.badge}</span>
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="font-serif font-bold leading-[1.04]" style={{ fontSize: 'clamp(2.5rem, 5.4vw, 4rem)', letterSpacing: '-0.03em' }}>
                {t.hero.titlePrefix} <span style={heatGrad}>{t.hero.titleHighlight}</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 leading-relaxed" style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', maxWidth: 540 }}>
                {t.hero.subtitle}
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <Link to="/login" className="lp-shine btn-primary justify-center no-underline" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem', borderRadius: 12 }}>
                  {t.actions.getStarted} <ArrowRight size={16} />
                </Link>
                <a href="#preview" className="btn-secondary justify-center no-underline" style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem', borderRadius: 12 }}>
                  <Play size={15} /> {t.actions.watchDemo}
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex items-center gap-6" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} style={{ color: 'var(--safe)' }} /> {t.hero.liveInProduction}</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} style={{ color: 'var(--safe)' }} /> {t.hero.multiSiteReady}</span>
              </div>
            </Reveal>
          </div>

          {/* Floating dashboard mockup */}
          <Reveal delay={0.15} y={30}>
            <div className="relative mx-auto lg:mr-0" style={{ maxWidth: 520 }}>
              <div className="lp-float rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(160deg,#0A1428,#0D1A33)', border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 40px 90px rgba(3,7,18,0.35)' }}>
                <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#F87171' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FBBF24' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#4ADE80' }} />
                  <span className="ml-2 font-semibold uppercase tracking-wide" style={{ fontSize: '0.6rem', color: '#93C5FD' }}>{t.mockup.cluster}</span>
                  <span className="ml-auto inline-flex items-center gap-1 font-bold uppercase" style={{ fontSize: '0.55rem', color: '#4ADE80' }}><span className="pulse-dot" style={{ background: '#4ADE80', width: 5, height: 5 }} /> {t.mockup.live}</span>
                </div>
                <div className="p-5 grid grid-cols-3 gap-3">
                  <div className="col-span-2 rounded-2xl p-4" style={{ background: 'rgba(220,38,38,0.14)', border: '1px solid rgba(248,113,113,0.28)' }}>
                    <div className="font-semibold uppercase tracking-wide" style={{ fontSize: '0.58rem', color: '#FCA5A5' }}>{t.mockup.liveHeatIndex}</div>
                    <div className="font-serif font-bold mt-1" style={{ fontSize: '2.6rem', color: '#F87171', lineHeight: 1 }}>54°<span style={{ fontSize: '1rem' }}>C</span></div>
                    <span className="inline-flex items-center gap-1.5 mt-2 rounded-full px-2.5 py-1 font-bold uppercase" style={{ fontSize: '0.55rem', background: 'rgba(220,38,38,0.2)', color: '#FCA5A5' }}><span className="pulse-dot" style={{ background: '#F87171', width: 5, height: 5 }} /> {t.mockup.dangerStopWork}</span>
                  </div>
                  <div className="rounded-2xl p-3 flex flex-col justify-between" style={{ background: 'rgba(148,163,184,0.08)' }}>
                    <Users size={15} style={{ color: '#60A5FA' }} />
                    <div><div className="font-bold text-white" style={{ fontSize: '1.15rem' }}>24</div><div style={{ fontSize: '0.52rem', color: '#94A3B8' }}>{t.mockup.onSite}</div></div>
                  </div>
                  <div className="rounded-2xl p-3" style={{ background: 'rgba(148,163,184,0.08)' }}>
                    <div className="flex items-center gap-1" style={{ color: '#FB923C' }}><Thermometer size={12} /><span className="font-bold text-white" style={{ fontSize: '0.85rem' }}>46°C</span></div>
                    <div style={{ fontSize: '0.52rem', color: '#94A3B8' }}>{t.mockup.airTemp}</div>
                  </div>
                  <div className="rounded-2xl p-3" style={{ background: 'rgba(148,163,184,0.08)' }}>
                    <div className="flex items-center gap-1" style={{ color: '#60A5FA' }}><Droplets size={12} /><span className="font-bold text-white" style={{ fontSize: '0.85rem' }}>38%</span></div>
                    <div style={{ fontSize: '0.52rem', color: '#94A3B8' }}>{t.mockup.humidity}</div>
                  </div>
                  <div className="rounded-2xl p-3 flex items-center gap-2" style={{ background: 'rgba(74,222,128,0.1)' }}>
                    <ShieldCheck size={14} style={{ color: '#4ADE80' }} /><span style={{ fontSize: '0.58rem', color: '#86EFAC', fontWeight: 700 }}>{t.mockup.responseReady}</span>
                  </div>
                </div>
              </div>
              {/* floating chips */}
              <div className="lp-float-2 hidden sm:flex items-center gap-2 absolute -left-5 top-16 rounded-2xl px-3.5 py-2.5 bg-white" style={{ boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
                <span className="flex items-center justify-center rounded-lg" style={{ width: 30, height: 30, background: 'var(--safe-bg)' }}><Siren size={15} style={{ color: 'var(--safe)' }} /></span>
                <div><div className="font-bold" style={{ fontSize: '0.8rem' }}>{t.mockup.sosDelivered}</div><div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{t.mockup.supervisorSec}</div></div>
              </div>
              <div className="lp-float hidden sm:flex items-center gap-2 absolute -right-4 -bottom-4 rounded-2xl px-3.5 py-2.5 bg-white" style={{ boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
                <span className="flex items-center justify-center rounded-lg" style={{ width: 30, height: 30, background: 'rgba(124,58,237,0.12)' }}><Sparkles size={15} style={{ color: '#7C3AED' }} /></span>
                <div><div className="font-bold" style={{ fontSize: '0.8rem' }}>{t.mockup.aiForecast}</div><div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{t.mockup.peakRisk}</div></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ TRUST ═══════════ */}
      <section className="border-y" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <div className="mx-auto px-5 sm:px-8 py-10" style={{ maxWidth: 1240 }}>
          <Reveal>
            <p className="text-center font-semibold uppercase mb-6" style={{ fontSize: '0.72rem', letterSpacing: '0.16em', color: 'var(--text-muted)' }}>{t.trust.eyebrow}</p>
          </Reveal>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {TRUST_ICONS.map((Icon, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 bg-white lp-card" style={{ border: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Icon size={15} style={{ color: 'var(--brand)' }} /> {t.trust.items[i]}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="mx-auto px-5 sm:px-8 py-20 lg:py-28" style={{ maxWidth: 1240 }}>
        <Reveal>
          <div className="max-w-2xl mb-14">
            <p className="font-semibold uppercase mb-3" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', color: 'var(--brand)' }}>{t.features.eyebrow}</p>
            <h2 className="font-serif font-bold leading-tight" style={{ fontSize: 'clamp(2rem,4vw,2.75rem)', letterSpacing: '-0.02em' }}>{t.features.titlePrefix} <span style={brandGrad}>{t.features.titleHighlight}</span></h2>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES_META.map((meta, i) => {
            const f = t.features.items[i];
            return (
              <Reveal key={f.title} delay={(i % 3) * 0.08}>
                <div className="lp-card rounded-2xl p-7 h-full bg-white" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <span className="inline-flex items-center justify-center rounded-2xl mb-5" style={{ width: 48, height: 48, background: `color-mix(in srgb, ${meta.tint} 12%, transparent)`, color: meta.tint }}>
                    <meta.icon size={22} />
                  </span>
                  <h3 className="font-serif font-bold mb-3" style={{ fontSize: '1.2rem' }}>{f.title}</h3>
                  <ul className="space-y-2">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-center gap-2.5" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        <CheckCircle2 size={15} style={{ color: meta.tint }} /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how" className="py-20 lg:py-28" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto px-5 sm:px-8" style={{ maxWidth: 1240 }}>
          <Reveal>
            <div className="max-w-2xl mb-14">
              <p className="font-semibold uppercase mb-3" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', color: 'var(--brand)' }}>{t.how.eyebrow}</p>
              <h2 className="font-serif font-bold leading-tight" style={{ fontSize: 'clamp(2rem,4vw,2.75rem)', letterSpacing: '-0.02em' }}>{t.how.title}</h2>
            </div>
          </Reveal>
          <div className="relative grid gap-6 md:grid-cols-3 lg:grid-cols-6">
            {/* connecting line (desktop) */}
            <div className="hidden lg:block absolute left-0 right-0 top-7 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-strong), transparent)' }} aria-hidden="true" />
            {STEPS_ICONS.map((Icon, i) => {
              const s = t.how.items[i];
              return (
                <Reveal key={s.title} delay={i * 0.07}>
                  <div className="relative text-center lg:text-left">
                    <span className="relative z-10 inline-flex items-center justify-center rounded-2xl mb-4 mx-auto lg:mx-0" style={{ width: 56, height: 56, background: 'var(--brand-panel)', color: '#fff', boxShadow: '0 10px 24px rgba(37,99,235,0.3)' }}>
                      <Icon size={24} />
                    </span>
                    <div className="font-mono font-bold mb-1" style={{ fontSize: '0.7rem', color: 'var(--brand)' }}>{t.how.step} {i + 1}</div>
                    <h3 className="font-semibold mb-1" style={{ fontSize: '0.95rem' }}>{s.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{s.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ WHY HEATSHIELD (alternating) ═══════════ */}
      <section className="mx-auto px-5 sm:px-8 py-20 lg:py-28 space-y-20 lg:space-y-28" style={{ maxWidth: 1240 }}>
        {WHY_META.map((meta, i) => {
          const w = t.why.items[i];
          const reversed = i % 2 === 1;
          return (
            <Reveal key={w.title}>
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div className={reversed ? 'lg:order-2' : ''}>
                  <span className="inline-flex items-center justify-center rounded-2xl mb-5" style={{ width: 46, height: 46, background: `color-mix(in srgb, ${meta.tint} 12%, transparent)`, color: meta.tint }}>
                    <meta.icon size={22} />
                  </span>
                  <p className="font-semibold uppercase mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: meta.tint }}>{w.eyebrow}</p>
                  <h3 className="font-serif font-bold leading-tight" style={{ fontSize: 'clamp(1.5rem,3vw,2.1rem)', letterSpacing: '-0.02em' }}>{w.title}</h3>
                  <p className="mt-4 leading-relaxed" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{w.body}</p>
                </div>
                <div className={reversed ? 'lg:order-1' : ''}>
                  <div className="relative rounded-3xl flex items-center justify-center overflow-hidden" style={{ aspectRatio: '5 / 4', background: `linear-gradient(155deg, color-mix(in srgb, ${meta.tint} 12%, var(--bg)), var(--bg))`, border: '1px solid var(--border)' }}>
                    <div className="lp-grid absolute inset-0" aria-hidden="true" />
                    <span className="lp-float relative flex items-center justify-center rounded-3xl" style={{ width: 130, height: 130, background: `color-mix(in srgb, ${meta.tint} 16%, #fff)`, color: meta.tint, boxShadow: `0 24px 50px color-mix(in srgb, ${meta.tint} 25%, transparent)` }}>
                      <meta.icon size={60} strokeWidth={1.4} />
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </section>

      {/* ═══════════ LIVE DASHBOARD PREVIEW ═══════════ */}
      <section id="preview" className="relative overflow-hidden py-20 lg:py-28" style={{ background: 'linear-gradient(165deg, var(--navy-950), var(--navy-850))' }}>
        <div className="lp-blob lp-blob-1" style={{ width: 520, height: 520, top: '-20%', left: '55%', background: 'radial-gradient(circle, rgba(37,99,235,0.28), transparent 66%)' }} aria-hidden="true" />
        <div className="relative mx-auto px-5 sm:px-8" style={{ maxWidth: 1240 }}>
          <Reveal>
            <div className="max-w-2xl mb-12">
              <p className="font-semibold uppercase mb-3" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', color: '#93C5FD' }}>{t.preview.eyebrow}</p>
              <h2 className="font-serif font-bold leading-tight text-white" style={{ fontSize: 'clamp(2rem,4vw,2.75rem)', letterSpacing: '-0.02em' }}>{t.preview.title}</h2>
              <p className="mt-4" style={{ fontSize: '1rem', color: 'rgba(226,232,240,0.72)' }}>{t.preview.subtitle}</p>
            </div>
          </Reveal>
          <Reveal delay={0.1} y={30}>
            <div className="grid lg:grid-cols-3 gap-5">
              {PREVIEW_META.map((meta, i) => {
                const c = t.preview.cards[i];
                return (
                  <div key={c.k} className="rounded-2xl p-6" style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.14)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: `color-mix(in srgb, ${meta.tint} 16%, transparent)`, color: meta.tint }}><meta.icon size={19} /></span>
                      <span className="font-bold uppercase tracking-wide" style={{ fontSize: '0.58rem', color: '#93C5FD' }}>{t.preview.live}</span>
                    </div>
                    <div className="font-serif font-bold text-white" style={{ fontSize: '2rem', lineHeight: 1 }}>{meta.v}</div>
                    <div className="mt-1.5 font-semibold" style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>{c.k}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2 }}>{c.sub}</div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ IMPACT (counters) ═══════════ */}
      <section id="impact" className="mx-auto px-5 sm:px-8 py-20 lg:py-24" style={{ maxWidth: 1240 }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {IMPACT_NODES.map((node, i) => (
            <Reveal key={i} delay={i * 0.08} className="text-center lg:text-left">
              <div className="font-serif font-bold" style={{ fontSize: 'clamp(2.25rem,5vw,3.25rem)', ...brandGrad, letterSpacing: '-0.02em', lineHeight: 1 }}>{node}</div>
              <div className="mt-2" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t.impact.items[i]}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-20 lg:py-28" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto px-5 sm:px-8" style={{ maxWidth: 820 }}>
          <Reveal>
            <div className="text-center mb-12">
              <p className="font-semibold uppercase mb-3" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', color: 'var(--brand)' }}>{t.faq.eyebrow}</p>
              <h2 className="font-serif font-bold leading-tight" style={{ fontSize: 'clamp(1.875rem,4vw,2.5rem)', letterSpacing: '-0.02em' }}>{t.faq.title}</h2>
            </div>
          </Reveal>
          <div className="space-y-3">
            {t.faq.items.map((f, i) => {
              const open = openFaq === i;
              return (
                <Reveal key={f.q} delay={i * 0.04}>
                  <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                    >
                      <span className="font-semibold" style={{ fontSize: '1rem' }}>{f.q}</span>
                      <span className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 28, height: 28, background: open ? 'var(--brand)' : 'var(--bg-muted)', color: open ? '#fff' : 'var(--text-muted)', transition: 'all .2s' }}>
                        {open ? <Minus size={15} /> : <Plus size={15} />}
                      </span>
                    </button>
                    <div style={{ maxHeight: open ? 240 : 0, overflow: 'hidden', transition: 'max-height .35s var(--ease)' }}>
                      <p className="px-6 pb-5 leading-relaxed" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{f.a}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="lp-aurora" style={{ background: 'linear-gradient(120deg,#1D4ED8,#2563EB 45%,#1E3A8A)', backgroundSize: '200% 200%' }}>
          <div className="lp-blob lp-blob-2" style={{ width: 460, height: 460, top: '-30%', right: '6%', background: 'radial-gradient(circle, rgba(249,115,22,0.3), transparent 66%)' }} aria-hidden="true" />
          <div className="relative mx-auto px-5 sm:px-8 py-20 lg:py-28 text-center" style={{ maxWidth: 900 }}>
            <Reveal>
              <h2 className="font-serif font-bold leading-tight text-white" style={{ fontSize: 'clamp(2.25rem,5vw,3.25rem)', letterSpacing: '-0.02em' }}>{t.cta.title}</h2>
              <p className="mt-5 mx-auto" style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.82)', maxWidth: 560 }}>{t.cta.subtitle}</p>
              <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login" className="lp-shine no-underline inline-flex items-center justify-center gap-2 font-semibold rounded-xl" style={{ background: '#fff', color: 'var(--brand-strong)', padding: '0.9rem 2rem', fontSize: '0.95rem' }}>
                  {t.actions.getStarted} <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="no-underline inline-flex items-center justify-center gap-2 font-semibold rounded-xl" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', padding: '0.9rem 2rem', fontSize: '0.95rem' }}>
                  {t.actions.viewDashboard}
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer id="contact" style={{ background: 'var(--navy-950)', color: '#E2E8F0' }}>
        <div className="mx-auto px-5 sm:px-8 py-16" style={{ maxWidth: 1240 }}>
          <div className="grid gap-10 lg:grid-cols-2 pb-12 mb-10" style={{ borderBottom: '1px solid rgba(148,163,184,0.14)' }}>
            <div className="max-w-md">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex items-center justify-center rounded-xl" style={{ width: 32, height: 32, background: 'var(--brand-panel)' }}><Shield size={16} color="#fff" /></span>
                <span className="font-serif font-bold tracking-[0.06em] text-white" style={{ fontSize: '0.9rem' }}>HEATSHIELD</span>
              </div>
              <p className="leading-relaxed mb-5" style={{ fontSize: '0.9rem', color: '#94A3B8' }}>{t.footer.tagline}</p>
              {subscribed ? (
                <p className="inline-flex items-center gap-2 font-semibold" style={{ color: '#4ADE80', fontSize: '0.875rem' }}><CheckCircle2 size={16} /> {t.footer.subscribed}</p>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSubscribed(true); }} className="flex flex-col sm:flex-row gap-2.5" style={{ maxWidth: 380 }}>
                  <label htmlFor="lp-news" className="sr-only">{t.footer.emailLabel}</label>
                  <input id="lp-news" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.footer.emailPlaceholder}
                    className="flex-1 rounded-xl px-4"
                    style={{ minHeight: 44, background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', color: '#fff', fontSize: '0.875rem', outline: 'none' }} />
                  <button type="submit" className="rounded-xl font-semibold" style={{ background: 'var(--brand)', color: '#fff', padding: '0 1.25rem', minHeight: 44, fontSize: '0.875rem' }}>{t.actions.subscribe}</button>
                </form>
              )}
            </div>
            <div className="grid grid-cols-3 gap-6">
              {FOOTER_LINK_META.map((col) => (
                <div key={col.colKey}>
                  <p className="font-semibold text-white mb-3 uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>{footerColLabels[col.colKey]}</p>
                  <ul className="space-y-2.5">
                    {col.links.map(([linkKey, href]) => (
                      <li key={linkKey}>{href.startsWith('/') ? (
                        <Link to={href} className="no-underline transition-colors hover:text-white" style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{footerLinkLabels[linkKey]}</Link>
                      ) : (
                        <a href={href} className="no-underline transition-colors hover:text-white" style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{footerLinkLabels[linkKey]}</a>
                      )}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="inline-flex items-center gap-1.5" style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              <MapPin size={13} /> {t.footer.madeWith}
            </p>
            <div className="flex items-center gap-3">
              {[Globe2, Mail, MessageSquare].map((Icon, i) => (
                <a key={i} href="#contact" aria-label="Social link" className="flex items-center justify-center rounded-lg transition-colors" style={{ width: 34, height: 34, background: 'rgba(148,163,184,0.1)', color: '#94A3B8' }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
