'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Brain, Sparkles } from 'lucide-react';

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  x: ((i * 41 + 17) % 95) + 2.5,
  y: ((i * 53 + 11) % 92) + 4,
  size: ((i * 7 + 3) % 3) + 1,
  dur: 3.5 + ((i * 11) % 4),
  delay: (i * 0.21) % 5,
  peak: 0.12 + ((i * 13) % 24) / 100,
}));

const WORDS = [
  { w: 'HTML',       left: '8%',  top: '18%', dur: 5.5, delay: 0   },
  { w: 'CSS',        left: '78%', top: '14%', dur: 6.4, delay: 0.9 },
  { w: 'JavaScript', left: '5%',  top: '72%', dur: 7.2, delay: 1.6 },
  { w: 'React',      left: '70%', top: '70%', dur: 5.8, delay: 0.5 },
  { w: 'APIs',       left: '15%', top: '88%', dur: 6.6, delay: 2.1 },
];

const G = 'bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent';

const PANEL: Record<string, { quote: React.ReactNode; sub: string }> = {
  '/login': {
    quote: (<><span className="text-white">Why don't</span><br /><span className={G}>we ask why?</span></>),
    sub: 'Beyond tutorials. Into real understanding.',
  },
  '/register': {
    quote: (<><span className="text-white">Start your</span><br /><span className={G}>journey from why.</span></>),
    sub: 'Join curious minds who learn through understanding.',
  },
  '/forgot-password': {
    quote: (<><span className="text-white">Forgot it?</span><br /><span className={G}>That's okay.</span></>),
    sub: 'Reset your access. Resume the journey of understanding.',
  },
};

export default function AuthRouteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const panel = PANEL[pathname] ?? PANEL['/login'];

  return (
    <div className="h-screen w-full bg-[#030014] text-white overflow-hidden flex">

      {/* ─── Left brand panel (desktop) ─── */}
      <aside className="hidden lg:flex relative flex-col w-[46%] max-w-[580px] shrink-0 overflow-hidden border-r border-white/[0.05]">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_30%_20%,rgba(110,55,195,0.22),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_85%,rgba(99,102,241,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.014)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_75%_70%_at_30%_30%,#000_45%,transparent_100%)]" />

        {/* Orbs */}
        <motion.div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-purple-600/8 blur-[110px] pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-indigo-600/8 blur-[100px] pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }} />

        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {PARTICLES.map((p, i) => (
            <motion.div key={i}
              className="absolute rounded-full bg-purple-300/80"
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
              animate={{ opacity: [0, p.peak, 0], y: [0, -20, 0] }}
              transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* Floating words */}
        {WORDS.map(({ w, left, top, dur, delay }) => (
          <motion.span key={w}
            className="absolute text-[10px] font-bold tracking-[0.26em] uppercase text-purple-400/16 pointer-events-none select-none"
            style={{ left, top }}
            animate={{ opacity: [0.1, 0.32, 0.1], y: [0, -10, 0] }}
            transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeInOut' }}
          >{w}</motion.span>
        ))}

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo row + back button */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_18px_rgba(147,51,234,0.45)] group-hover:shadow-[0_0_26px_rgba(147,51,234,0.6)] transition-shadow">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-[14px] font-extrabold tracking-tight text-white">
                Loki's <span className="text-purple-400">Learning</span> Hub
              </span>
            </Link>
            <Link href="/"
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-white border border-white/[0.04] hover:border-white/[0.12] bg-white/[0.01] hover:bg-white/[0.05] transition-all">
              <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
              Home
            </Link>
          </div>

          {/* Centered quote — changes per route */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/22 bg-purple-500/7 px-3.5 py-1.5 mb-7 text-[10px] font-bold tracking-[0.28em] uppercase text-purple-300"
            >
              <Brain className="h-3 w-3" />
              Curiosity-Driven Learning
            </motion.div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="text-[44px] xl:text-[52px] font-extrabold tracking-[-0.04em] leading-[0.95] mb-5">
                  {panel.quote}
                </h2>
                <p className="text-slate-400 text-base font-light tracking-tight">{panel.sub}</p>
              </motion.div>
            </AnimatePresence>

            {/* WHAT → WHY → HOW */}
            <div className="flex items-center gap-2 mt-8">
              {[
                { t: 'WHAT', active: false },
                { t: '→', sep: true },
                { t: 'WHY', active: true },
                { t: '→', sep: true },
                { t: 'HOW', active: false },
              ].map((it, i) => (
                it.sep ? (
                  <span key={i} className="text-slate-700 text-[10px]">{it.t}</span>
                ) : (
                  <span key={i} className={`px-2.5 py-1 rounded-full text-[9.5px] font-bold tracking-[0.22em] border ${
                    it.active
                      ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                      : 'bg-white/[0.03] border-white/[0.07] text-slate-600'
                  }`}>{it.t}</span>
                )
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <p className="text-[11px] text-slate-700 font-light italic">
            "Learning is not memorizing. Learning is understanding."
          </p>
        </div>
      </aside>

      {/* ─── Right form panel ─── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] bg-white/[0.01] backdrop-blur-sm shrink-0">
          <Link href="/" className="group inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
            Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-[12px] font-bold text-white">
              Loki's <span className="text-purple-400">Learning</span> Hub
            </span>
          </div>
        </div>

        {/* Mobile ambient */}
        <div className="lg:hidden absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_15%,rgba(110,55,195,0.16),transparent)] pointer-events-none" />

        {/* Form area — scrollable only if content overflows */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center px-5 md:px-10 py-8 relative z-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -22 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[400px]"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
