'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  motion, useInView, useScroll, useSpring,
  AnimatePresence,
} from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
  Sparkles, Brain, Code2, Target, MessageSquare,
  BookOpen, FileText, Calendar, Mic, BarChart3,
  ArrowRight, ChevronRight, Menu, X,
} from 'lucide-react';

// ─── Deterministic particles & keywords ────────────────────────────────────
const PARTICLES = Array.from({ length: 56 }, (_, i) => ({
  x: ((i * 37 + 13) % 97) + 1.5,
  y: ((i * 47 + 7) % 94) + 3,
  size: ((i * 7 + 3) % 3) + 1,
  dur: 3 + ((i * 11) % 5),
  delay: (i * 0.19) % 5,
  peak: 0.12 + ((i * 13) % 28) / 100,
}));

const KEYWORDS = [
  { w: 'HTML',       left: '5%',  top: '24%', dur: 5.2, delay: 0   },
  { w: 'CSS',        left: '89%', top: '20%', dur: 6.4, delay: 0.9 },
  { w: 'JavaScript', left: '2%',  top: '68%', dur: 7.1, delay: 1.6 },
  { w: 'React',      left: '86%', top: '64%', dur: 5.6, delay: 0.5 },
  { w: 'SQL',        left: '16%', top: '86%', dur: 6.8, delay: 2.1 },
  { w: 'APIs',       left: '77%', top: '84%', dur: 4.9, delay: 1.3 },
];

// ─── Animation variants ────────────────────────────────────────────────────
const up = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = (d = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: d } },
});

// ─── Gradient text helper ──────────────────────────────────────────────────
function G({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
      {children}
    </span>
  );
}

// ─── Scroll progress bar ───────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 110, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
    />
  );
}

// ══════════════════════════════════════════════════════════════════════
// NAVBAR
// ══════════════════════════════════════════════════════════════════════
function Navbar({ user }: { user: unknown }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 22);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navLinks = [
    { label: 'Aware',    href: '#why'      },
    { label: 'Features', href: '#features' },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#030014]/88 backdrop-blur-2xl border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-[58px] flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-2.5 group shrink-0">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_14px_rgba(147,51,234,0.4)] group-hover:shadow-[0_0_22px_rgba(147,51,234,0.55)] transition-shadow">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-[13px] font-extrabold tracking-tight text-white">
            Loki's <span className="text-purple-400">Learning</span> Hub
          </span>
        </a>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href}
              className="text-[12px] font-medium text-slate-400 hover:text-white transition-colors duration-200">
              {l.label}
            </a>
          ))}
          <div className="w-px h-4 bg-white/[0.08]" />
          {user ? (
            <Link href="/dashboard"
              className="px-4 py-1.5 text-[12px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg border border-purple-400/20 shadow-[0_0_12px_rgba(147,51,234,0.2)] hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login"
                className="text-[12px] font-medium text-slate-400 hover:text-white transition-colors duration-200">
                Login
              </Link>
              <Link href="/register"
                className="px-4 py-1.5 text-[12px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg border border-purple-400/20 shadow-[0_0_12px_rgba(147,51,234,0.2)] hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-[#030014]/96 backdrop-blur-2xl border-b border-white/[0.06]"
          >
            <div className="flex flex-col px-6 py-4 gap-0.5">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                  className="py-3 text-sm font-medium text-slate-400 hover:text-white border-b border-white/[0.04] last:border-0 transition-colors">
                  {l.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                {user ? (
                  <Link href="/dashboard" onClick={() => setOpen(false)}
                    className="py-2.5 text-center text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setOpen(false)}
                      className="py-2.5 text-center text-sm font-medium text-slate-300 border border-white/[0.08] rounded-xl">
                      Login
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)}
                      className="py-2.5 text-center text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MAGNETIC CTA BUTTON — leans toward cursor on hover
// ══════════════════════════════════════════════════════════════════════
function MagneticButton({
  children,
  href,
  className = '',
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    setOffset({ x: (e.clientX - cx) * 0.22, y: (e.clientY - cy) * 0.22 });
  };

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      className={className}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {children}
    </Link>
  );
}

// ══════════════════════════════════════════════════════════════════════
// HERO ANIMATED UI — right-side interactive panel
// ══════════════════════════════════════════════════════════════════════
const WHY_QS = [
  {
    q: 'Why does HTML exist?',
    a: 'Browsers needed a standard way to define document structure before rendering it visually.',
    tag: 'HTML',
    tc: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    barColor: 'from-orange-500 to-amber-400',
    prog: 72,
  },
  {
    q: 'Why does CSS exist?',
    a: 'Separating content from presentation lets design evolve without ever touching markup.',
    tag: 'CSS',
    tc: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    barColor: 'from-blue-500 to-cyan-400',
    prog: 58,
  },
  {
    q: 'Why does JavaScript exist?',
    a: 'HTML and CSS are static — the web needed runtime behaviour and real user interaction.',
    tag: 'JS',
    tc: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    barColor: 'from-yellow-500 to-amber-300',
    prog: 85,
  },
];

function HeroAnimatedUI() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % WHY_QS.length), 3800);
    return () => clearInterval(t);
  }, []);

  const cur = WHY_QS[idx];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[400px] select-none"
    >
      {/* Ambient glow shifts with active question */}
      <motion.div
        className="absolute -inset-16 pointer-events-none rounded-full blur-[80px]"
        animate={{ background: `radial-gradient(50% 45% at 50% 50%, ${
          idx === 0 ? 'rgba(249,115,22,0.08)' :
          idx === 1 ? 'rgba(59,130,246,0.08)' :
                      'rgba(234,179,8,0.08)'
        }, transparent)` }}
        transition={{ duration: 0.8 }}
      />

      {/* Main card */}
      <motion.div
        className="relative bg-[#070118]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)' }}
        whileHover={{ borderColor: 'rgba(168,85,247,0.18)' }}
        transition={{ duration: 0.3 }}
      >
        {/* Window chrome */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/55" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/55" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/55" />
          </div>
          <div className="flex items-center gap-1.5">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-purple-400"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[9px] font-bold tracking-[0.24em] uppercase text-purple-400/50">
              Thinking
            </span>
          </div>
        </div>

        {/* Animated question / answer content */}
        <div className="p-5 min-h-[180px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              {/* Tech tag */}
              <div className={`inline-flex items-center px-2.5 py-1 rounded-lg ${cur.bg} border ${cur.border} mb-4`}>
                <span className={`text-[9px] font-black tracking-[0.22em] uppercase ${cur.tc}`}>
                  {cur.tag}
                </span>
              </div>

              {/* Question */}
              <p className="text-white text-[15px] font-bold leading-snug mb-3">{cur.q}</p>

              {/* Answer */}
              <p className="text-slate-500 text-[11px] leading-relaxed mb-5">{cur.a}</p>

              {/* Understanding bar */}
              <div>
                <div className="flex justify-between text-[10px] mb-1.5">
                  <span className="text-slate-600">Understanding built</span>
                  <span className={cur.tc}>{cur.prog}%</span>
                </div>
                <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${cur.barColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${cur.prog}%` }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tab row — click to switch */}
        <div className="grid grid-cols-3 border-t border-white/[0.05]">
          {WHY_QS.map((q, i) => (
            <motion.button
              key={q.tag}
              onClick={() => setIdx(i)}
              className={`relative py-3 text-[10px] font-bold transition-colors duration-300 cursor-pointer ${
                i === idx ? q.tc : 'text-slate-700 hover:text-slate-500'
              } ${i < 2 ? 'border-r border-white/[0.05]' : ''}`}
              animate={{ backgroundColor: i === idx ? 'rgba(255,255,255,0.03)' : 'transparent' }}
            >
              {q.tag}
              {i === idx && (
                <motion.span
                  layoutId="activeTabIndicator"
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-gradient-to-r ${q.barColor}`}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {[
          { val: '24', label: 'Lessons',   c: 'text-purple-400' },
          { val: '12', label: 'Concepts',  c: 'text-indigo-400' },
          { val: '8h', label: 'Learning',  c: 'text-pink-400'   },
        ].map(({ val, label, c }) => (
          <motion.div
            key={label}
            className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-center"
            whileHover={{ borderColor: 'rgba(168,85,247,0.15)', backgroundColor: 'rgba(168,85,247,0.03)' }}
            transition={{ duration: 0.2 }}
          >
            <p className={`text-[18px] font-extrabold leading-none ${c}`}>{val}</p>
            <p className="text-[9px] text-slate-600 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Decoration orbs */}
      <motion.div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-purple-600/6 blur-[50px] pointer-events-none"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-indigo-600/6 blur-[45px] pointer-events-none"
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
      />
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SECTION 1 — HERO
// ══════════════════════════════════════════════════════════════════════
function Hero({ user }: { user: unknown }) {
  const heroRef = useRef<HTMLElement>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      onMouseMove={onMouseMove}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ ['--mx' as string]: '50%', ['--my' as string]: '30%' }}
    >
      {/* Layered background */}
      <div className="absolute inset-0 bg-[#030014]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-5%,rgba(110,55,195,0.22),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_30%_at_78%_88%,rgba(99,102,241,0.09),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.016)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.016)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_80%_65%_at_50%_0%,#000_50%,transparent_100%)]" />

      {/* Mouse spotlight */}
      <div
        className="absolute inset-0 pointer-events-none hidden md:block"
        style={{ background: 'radial-gradient(500px circle at var(--mx) var(--my), rgba(168,85,247,0.09), transparent 45%)' }}
      />

      {/* Breathing orbs */}
      <motion.div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-purple-600/7 blur-[130px] pointer-events-none"
        animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.75, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-indigo-600/7 blur-[110px] pointer-events-none"
        animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }} />

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map((p, i) => (
          <motion.div key={i}
            className="absolute rounded-full bg-purple-300/80"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ opacity: [0, p.peak, 0], y: [0, -22, 0] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Floating keywords */}
      {KEYWORDS.map(({ w, left, top, dur, delay }) => (
        <motion.span key={w}
          className="absolute text-[10px] font-bold tracking-[0.26em] uppercase text-purple-400/18 pointer-events-none select-none hidden sm:block"
          style={{ left, top }}
          animate={{ opacity: [0.1, 0.3, 0.1], y: [0, -10, 0] }}
          transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeInOut' }}>
          {w}
        </motion.span>
      ))}

      {/* Two-column content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center pt-24 pb-12">

          {/* LEFT — text, left-aligned */}
          <div className="flex flex-col items-start text-left">

            {/* Badge with rotating conic ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="relative inline-flex items-center justify-center mb-8 p-px rounded-full overflow-hidden">
              <motion.span
                className="absolute inset-[-2px] rounded-full opacity-80"
                style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(168,85,247,0.6) 80deg, rgba(99,102,241,0.4) 120deg, transparent 200deg)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
              <span className="relative inline-flex items-center gap-2 rounded-full bg-[#0a0218] border border-purple-500/22 px-4 py-1.5 text-[10px] font-bold tracking-[0.28em] uppercase text-purple-300">
                <Brain className="h-3 w-3" />
                Curiosity-Driven Learning
              </span>
            </motion.div>

            {/* Headline — no underline */}
            <motion.h1
              initial={{ opacity: 0, y: 44 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.88, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-[48px] sm:text-[62px] md:text-[76px] font-extrabold tracking-[-0.04em] leading-[0.92] mb-5">
              <span className="text-white">Why don't</span><br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                we ask why?
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.38 }}
              className="text-lg md:text-xl font-light text-slate-300 tracking-tight mb-5">
              Beyond tutorials. Into real understanding.
            </motion.p>

            {/* WHAT → WHY → HOW */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.52 }}
              className="flex items-center gap-2 mb-7">
              {[
                { t: 'WHAT', active: false },
                { t: '→',    sep: true },
                { t: 'WHY',  active: true  },
                { t: '→',    sep: true },
                { t: 'HOW',  active: false },
              ].map((item, i) => (
                item.sep ? (
                  <motion.span
                    key={i}
                    className="text-slate-700 text-[10px]"
                    animate={{ x: [0, 2, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                  >{item.t}</motion.span>
                ) : (
                  <span key={i} className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded border ${
                    item.active
                      ? 'text-purple-300 border-purple-500/30 bg-purple-500/10'
                      : 'text-slate-600 border-white/[0.04] bg-white/[0.01]'
                  }`}>{item.t}</span>
                )
              ))}
            </motion.div>

            {/* Supporting copy */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.62 }}
              className="text-slate-500 text-sm max-w-[420px] mb-10 leading-relaxed font-light">
              Most platforms teach <em className="text-slate-400 not-italic">what</em>. This platform
              teaches <em className="text-white not-italic font-medium">why it exists</em> — then
              the how follows naturally.
            </motion.p>

            {/* Single magnetic CTA */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.72 }}>
              <MagneticButton
                href={user ? '/dashboard' : '/register'}
                className="relative inline-flex items-center gap-2.5 px-8 py-3.5 text-[13px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl border border-purple-400/25 shadow-[0_0_32px_rgba(147,51,234,0.32)] hover:shadow-[0_0_48px_rgba(147,51,234,0.5)] transition-shadow duration-300 group overflow-hidden"
              >
                <span className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-20deg]" />
                <span className="relative z-10 flex items-center gap-2.5">
                  Start Learning <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </MagneticButton>
            </motion.div>
          </div>

          {/* RIGHT — animated UI panel (desktop only) */}
          <div className="hidden lg:flex items-center justify-center">
            <HeroAnimatedUI />
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <div className="w-5 h-8 rounded-full border border-slate-700 flex items-start justify-center p-1.5">
          <motion.div
            className="w-0.5 h-1.5 bg-purple-400 rounded-full"
            animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SECTION 2 — WHY THIS PLATFORM EXISTS
// ══════════════════════════════════════════════════════════════════════
const WHY_CARDS = [
  {
    num: '01',
    title: 'Why HTML?',
    desc: 'The semantic skeleton of the web — structure before style.',
    grad: 'from-orange-500/12 to-red-500/10',
    border: 'hover:border-orange-500/28',
    dot: 'bg-orange-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(249,115,22,0.12)]',
  },
  {
    num: '02',
    title: 'Why CSS?',
    desc: 'Bridging raw structure and human perception — meaning through design.',
    grad: 'from-blue-500/12 to-cyan-500/10',
    border: 'hover:border-blue-500/28',
    dot: 'bg-blue-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]',
  },
  {
    num: '03',
    title: 'Why JavaScript?',
    desc: 'The web needed thought — runtime behaviour and user interaction.',
    grad: 'from-yellow-500/12 to-amber-500/10',
    border: 'hover:border-yellow-500/28',
    dot: 'bg-yellow-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(234,179,8,0.12)]',
  },
  {
    num: '04',
    title: 'Why Web Dev?',
    desc: 'Building digital experiences that connect humans to information.',
    grad: 'from-purple-500/12 to-indigo-500/10',
    border: 'hover:border-purple-500/28',
    dot: 'bg-purple-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.12)]',
  },
];

function WhySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-55px' });

  return (
    <section id="why" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#04011a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_45%_at_50%_50%,rgba(99,102,241,0.07),transparent)]" />

      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — philosophy + problem */}
          <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger(0.1)}>
            <motion.p variants={up} className="text-[10px] font-bold tracking-[0.32em] uppercase text-red-400/60 mb-4">
              The Problem
            </motion.p>
            <motion.h2 variants={up} className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-white mb-5 leading-tight">
              Nobody taught us<br />
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                to ask why.
              </span>
            </motion.h2>
            <motion.p variants={up} className="text-slate-500 text-sm leading-relaxed font-light mb-8 max-w-sm">
              Modern education optimizes for completion, not comprehension.
              You learn the <em className="not-italic text-slate-400">what</em> and
              skip the <em className="not-italic text-white">why</em> — then forget
              everything in a week.
            </motion.p>

            <motion.div variants={stagger(0.08)} className="space-y-3">
              <motion.div variants={up}
                className="relative pl-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-purple-500/0 via-purple-500/60 to-purple-500/0" />
                <span className="block text-[13px] font-semibold text-white">"Don't learn technology names."</span>
                <span className="block text-[12px] font-light text-slate-500">Understand why they exist.</span>
              </motion.div>
              <motion.div variants={up}
                className="relative pl-4 p-4 rounded-xl border border-indigo-500/15 bg-indigo-500/5 overflow-hidden">
                <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-indigo-500/0 via-indigo-400/70 to-indigo-500/0" />
                <span className="block text-[13px] font-semibold text-indigo-300">"Don't collect answers."</span>
                <span className="block text-[12px] font-light text-slate-500">Build thinking.</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right — WHY cards with numbered indicators */}
          <motion.div
            initial="hidden" animate={inView ? 'visible' : 'hidden'}
            variants={stagger(0.09)}
            className="grid grid-cols-2 gap-3">
            {WHY_CARDS.map((c) => (
              <motion.div key={c.title} variants={up}
                whileHover={{ y: -5, scale: 1.015 }}
                className={`group relative p-5 rounded-xl bg-gradient-to-br ${c.grad} border border-white/[0.07] ${c.border} ${c.glow} transition-all duration-300 cursor-default overflow-hidden`}>
                {/* Big background number */}
                <span className="absolute top-2 right-3 text-[28px] font-black text-white/[0.04] leading-none select-none">
                  {c.num}
                </span>
                <div className={`h-1.5 w-1.5 rounded-full ${c.dot} mb-3 relative`} />
                <div className="text-[13px] font-bold text-white mb-1.5 tracking-tight leading-snug relative">
                  {c.title}
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-light relative">{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SECTION 3 — PLATFORM EXPERIENCE (with card spotlights)
// ══════════════════════════════════════════════════════════════════════
const FEATURES = [
  { icon: <Code2 className="h-4 w-4" />,        title: 'Interactive Learning',    c: 'text-purple-400', bg: 'bg-purple-500/8',  border: 'border-purple-500/14', glow: 'rgba(168,85,247,0.12)' },
  { icon: <Target className="h-4 w-4" />,        title: 'Practice Tests',          c: 'text-indigo-400', bg: 'bg-indigo-500/8',  border: 'border-indigo-500/14', glow: 'rgba(99,102,241,0.12)' },
  { icon: <MessageSquare className="h-4 w-4" />, title: 'Interview Prep',          c: 'text-sky-400',    bg: 'bg-sky-500/8',     border: 'border-sky-500/14',    glow: 'rgba(56,189,248,0.12)' },
  { icon: <BookOpen className="h-4 w-4" />,      title: 'Revision System',         c: 'text-green-400',  bg: 'bg-green-500/8',   border: 'border-green-500/14',  glow: 'rgba(34,197,94,0.12)' },
  { icon: <FileText className="h-4 w-4" />,      title: 'Notes & Knowledge Hub',   c: 'text-amber-400',  bg: 'bg-amber-500/8',   border: 'border-amber-500/14',  glow: 'rgba(245,158,11,0.12)' },
  { icon: <Calendar className="h-4 w-4" />,      title: 'Planner & Reminders',     c: 'text-cyan-400',   bg: 'bg-cyan-500/8',    border: 'border-cyan-500/14',   glow: 'rgba(34,211,238,0.12)' },
  { icon: <Mic className="h-4 w-4" />,           title: 'Voice Learning',          c: 'text-rose-400',   bg: 'bg-rose-500/8',    border: 'border-rose-500/14',   glow: 'rgba(244,63,94,0.12)' },
  { icon: <BarChart3 className="h-4 w-4" />,     title: 'Progress Tracking',       c: 'text-teal-400',   bg: 'bg-teal-500/8',    border: 'border-teal-500/14',   glow: 'rgba(45,212,191,0.12)' },
];

function FeatureCard({ f }: { f: typeof FEATURES[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--cx', `${e.clientX - r.left}px`);
    el.style.setProperty('--cy', `${e.clientY - r.top}px`);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      variants={up}
      whileHover={{ y: -5 }}
      className="group relative p-5 rounded-xl bg-white/[0.025] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-default overflow-hidden"
    >
      {/* Mouse-tracked spotlight */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(220px circle at var(--cx, 50%) var(--cy, 50%), ${f.glow}, transparent 60%)` }}
      />
      <div className={`relative w-8 h-8 rounded-lg ${f.bg} border ${f.border} flex items-center justify-center ${f.c} mb-3 group-hover:scale-110 transition-transform duration-300`}>
        {f.icon}
      </div>
      <p className="relative text-[12px] font-bold text-white tracking-tight leading-snug">
        {f.title}
      </p>
    </motion.div>
  );
}

function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-55px' });

  return (
    <section id="features" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#030014]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_50%,rgba(120,60,200,0.09),transparent)]" />

      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        <motion.div
          initial="hidden" animate={inView ? 'visible' : 'hidden'}
          variants={stagger(0.1)}
          className="text-center mb-12">
          <motion.p variants={up} className="text-[10px] font-bold tracking-[0.32em] uppercase text-purple-400/60 mb-4">
            Platform Experience
          </motion.p>
          <motion.h2 variants={up} className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-white mb-2 leading-tight">
            This is not just a course platform.
          </motion.h2>
          <motion.p variants={up} className="text-lg font-light text-slate-400">
            It's your personal <G>learning ecosystem.</G>
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden" animate={inView ? 'visible' : 'hidden'}
          variants={stagger(0.055)}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} f={f} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SECTION 4 — FINAL CTA + INTEGRATED FOOTER
// ══════════════════════════════════════════════════════════════════════
const FOOTER_LINKS: Array<{ label: string; href: string; external?: boolean }> = [
  { label: 'Features', href: '#features' },
  { label: 'Courses',  href: '#why'      },
  { label: 'Login',    href: '/login',    external: true },
  { label: 'Register', href: '/register', external: true },
];

function CTASection({ user }: { user: unknown }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-55px' });

  return (
    <section className="relative overflow-hidden pt-28 pb-14">
      <div className="absolute inset-0 bg-[#04011a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_30%,rgba(112,50,195,0.15),transparent)]" />

      {/* Rotating conic-gradient backdrop */}
      <motion.div
        className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full opacity-40 blur-[100px] pointer-events-none"
        style={{ background: 'conic-gradient(from 0deg, rgba(168,85,247,0.18), rgba(99,102,241,0.15), rgba(236,72,153,0.12), rgba(168,85,247,0.18))' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[650px] h-[380px] rounded-full bg-purple-600/6 blur-[150px] pointer-events-none"
        animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger(0.12)}>
          <motion.p variants={up} className="text-[10px] font-bold tracking-[0.32em] uppercase text-purple-400/60 mb-6">
            Start Your Journey
          </motion.p>
          <motion.h2 variants={up} className="text-5xl md:text-7xl font-extrabold tracking-[-0.04em] leading-[0.94] text-white mb-2">
            The real learning
          </motion.h2>
          <motion.h2 variants={up} className="text-5xl md:text-7xl font-extrabold tracking-[-0.04em] leading-[0.94] mb-8">
            <G>starts with WHY.</G>
          </motion.h2>
          <motion.p variants={up} className="text-slate-400 text-base max-w-md mx-auto mb-10 font-light leading-relaxed">
            Start learning with understanding instead of memorization.
            Ask why before you ask how.
          </motion.p>

          <motion.div variants={up} className="flex flex-col sm:flex-row gap-3 justify-center mb-20">
            <Link href={user ? '/dashboard' : '/login'}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="group relative flex items-center gap-2 px-8 py-3.5 text-[13px] font-medium text-slate-300 hover:text-white rounded-xl border border-white/[0.08] hover:border-white/[0.18] bg-white/[0.02] hover:bg-white/[0.06] transition-all overflow-hidden">
                <span className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/8 to-transparent skew-x-[-20deg]" />
                <span className="relative z-10 flex items-center gap-2">
                  Begin Your Journey <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Integrated footer */}
        <motion.div
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="border-t border-white/[0.05] pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-4">
            <div className="flex items-center gap-2 group">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center group-hover:shadow-[0_0_14px_rgba(147,51,234,0.4)] transition-shadow">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-[12px] font-bold text-white">
                Loki's <span className="text-purple-400">Learning</span> Hub
              </span>
            </div>
            <nav className="flex gap-6">
              {FOOTER_LINKS.map(({ label, href, external }) =>
                external ? (
                  <Link key={label} href={href}
                    className="text-[11px] text-slate-600 hover:text-white transition-colors">
                    {label}
                  </Link>
                ) : (
                  <a key={label} href={href}
                    className="text-[11px] text-slate-600 hover:text-white transition-colors">
                    {label}
                  </a>
                )
              )}
            </nav>
          </div>
          <p className="text-[11px] text-slate-700 font-light">
            © 2026 Loki's Learning Hub —{' '}
            <span className="italic">"Learning is not memorizing. Learning is understanding."</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════
export default function Home() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
      <ScrollProgress />
      <Navbar user={user} />
      <Hero user={user} />
      <WhySection />
      <FeaturesSection />
      <CTASection user={user} />
    </div>
  );
}
