'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Sparkles } from 'lucide-react';

const SHOWCASE_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  x: ((i * 41 + 17) % 95) + 2.5,
  y: ((i * 53 + 11) % 92) + 4,
  size: ((i * 7 + 3) % 3) + 1,
  dur: 3.5 + ((i * 11) % 4),
  delay: (i * 0.21) % 5,
  peak: 0.12 + ((i * 13) % 24) / 100,
}));

const SHOWCASE_WORDS = [
  { w: 'HTML',       left: '8%',  top: '18%', dur: 5.5, delay: 0   },
  { w: 'CSS',        left: '78%', top: '14%', dur: 6.4, delay: 0.9 },
  { w: 'JavaScript', left: '5%',  top: '72%', dur: 7.2, delay: 1.6 },
  { w: 'React',      left: '70%', top: '70%', dur: 5.8, delay: 0.5 },
  { w: 'APIs',       left: '15%', top: '88%', dur: 6.6, delay: 2.1 },
];

export interface AuthLayoutProps {
  /** Optional eyebrow above the brand quote (defaults to "Curiosity-Driven Learning"). */
  eyebrow?: string;
  /** Main quote shown on the left panel. */
  quote?: React.ReactNode;
  /** Subtitle beneath the quote. */
  subtitle?: string;
  /** Right-side form (page-specific). */
  children: React.ReactNode;
}

export function AuthLayout({
  eyebrow = 'Curiosity-Driven Learning',
  quote,
  subtitle = 'Beyond tutorials. Into real understanding.',
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#030014] text-white relative overflow-hidden flex">
      {/* Back to home — top left, above everything */}
      <Link
        href="/"
        className="absolute top-5 left-5 md:top-6 md:left-6 z-40 group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-white border border-white/[0.04] hover:border-white/[0.12] bg-white/[0.015] hover:bg-white/[0.05] backdrop-blur-sm transition-all"
      >
        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
        Back to Home
      </Link>

      {/* ─── Left brand panel — hidden on mobile ─── */}
      <aside className="hidden lg:flex relative flex-col w-1/2 max-w-[640px] overflow-hidden border-r border-white/[0.05]">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_30%_20%,rgba(110,55,195,0.22),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_85%,rgba(99,102,241,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.014)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_75%_70%_at_30%_30%,#000_45%,transparent_100%)]" />

        {/* Breathing orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-purple-600/8 blur-[110px] pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-indigo-600/8 blur-[100px] pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {SHOWCASE_PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-purple-300/80"
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
              animate={{ opacity: [0, p.peak, 0], y: [0, -20, 0] }}
              transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* Floating tech words */}
        {SHOWCASE_WORDS.map(({ w, left, top, dur, delay }) => (
          <motion.span
            key={w}
            className="absolute text-[10px] font-bold tracking-[0.26em] uppercase text-purple-400/16 pointer-events-none select-none"
            style={{ left, top }}
            animate={{ opacity: [0.1, 0.32, 0.1], y: [0, -10, 0] }}
            transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeInOut' }}
          >
            {w}
          </motion.span>
        ))}

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-14">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5"
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_18px_rgba(147,51,234,0.45)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-[14px] font-extrabold tracking-tight text-white">
              Loki's <span className="text-purple-400">Learning</span> Hub
            </span>
          </motion.div>

          {/* Centered quote */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/22 bg-purple-500/7 px-3.5 py-1.5 mb-7 text-[10px] font-bold tracking-[0.28em] uppercase text-purple-300"
            >
              <Brain className="h-3 w-3" />
              {eyebrow}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="text-[44px] xl:text-[56px] font-extrabold tracking-[-0.04em] leading-[0.95] mb-5"
            >
              {quote ?? (
                <>
                  <span className="text-white">Why don't</span><br />
                  <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                    we ask why?
                  </span>
                </>
              )}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-slate-400 text-base font-light tracking-tight"
            >
              {subtitle}
            </motion.p>

            {/* WHAT → WHY → HOW */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex items-center gap-2 mt-8"
            >
              {[
                { t: 'WHAT', active: false },
                { t: '→', sep: true },
                { t: 'WHY',  active: true  },
                { t: '→', sep: true },
                { t: 'HOW',  active: false },
              ].map((it, i) => (
                it.sep ? (
                  <span key={i} className="text-slate-700 text-[10px]">{it.t}</span>
                ) : (
                  <span key={i} className={`px-2.5 py-1 rounded-full text-[9.5px] font-bold tracking-[0.22em] border ${
                    it.active
                      ? 'bg-purple-500/15 border-purple-500/30 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                      : 'bg-white/[0.03] border-white/[0.07] text-slate-600'
                  }`}>{it.t}</span>
                )
              ))}
            </motion.div>
          </div>

          {/* Bottom signature */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-[11px] text-slate-700 font-light italic"
          >
            "Learning is not memorizing. Learning is understanding."
          </motion.p>
        </div>
      </aside>

      {/* ─── Right form panel ─── */}
      <main className="flex-1 flex items-center justify-center px-5 md:px-10 py-20 relative">
        {/* Mobile-only ambient background */}
        <div className="lg:hidden absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_15%,rgba(110,55,195,0.16),transparent)] pointer-events-none" />
        <div className="lg:hidden absolute top-1/4 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full bg-purple-600/6 blur-[110px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px] relative z-10"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
