'use client';

// Floating speech player — futuristic, glassmorphic, mobile-aware.
//
// Visual layers:
//   • Compact pill (minimised state, mobile default)
//   • Expanded card with controls + section pills
//   • Settings popover (rate / pitch / volume / voice)
//   • Waveform animation while playing
//
// Side-effects on host page:
//   • Adds class `tts-section-active` to the section element whose
//     `data-section` matches the currently-speaking item.
//   • Smoothly scrolls that section into view inside its scroll container.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play, Pause, Square, SkipBack, SkipForward, RotateCcw, Settings2,
  Volume2, Mic, X, ChevronUp, ChevronDown, Waves, Maximize2, Minimize2,
} from 'lucide-react';
import type { SpeakableItem, SpeechSectionId } from '@/lib/speech/types';
import type { useSpeech as UseSpeechHook } from '@/lib/speech/useSpeech';

type Speech = ReturnType<typeof UseSpeechHook>;

const SECTION_META: Record<SpeechSectionId, { label: string; color: string; ring: string; bg: string }> = {
  title:    { label: 'Intro',    color: 'text-slate-300',   ring: 'ring-slate-400/20',   bg: 'bg-slate-500/10' },
  what:     { label: 'What',     color: 'text-sky-300',     ring: 'ring-sky-400/30',     bg: 'bg-sky-500/10' },
  why:      { label: 'Why',      color: 'text-amber-300',   ring: 'ring-amber-400/30',   bg: 'bg-amber-500/10' },
  how:      { label: 'How',      color: 'text-emerald-300', ring: 'ring-emerald-400/30', bg: 'bg-emerald-500/10' },
  practice: { label: 'Practice', color: 'text-purple-300',  ring: 'ring-purple-400/30',  bg: 'bg-purple-500/10' },
};

interface Props {
  speech: Speech;
  /** Optional scroll container — the lesson page's <main>. */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /** Called when user closes the player (clears queue + hides UI). */
  onClose: () => void;
}

export default function SpeechPlayer({ speech, scrollContainerRef, onClose }: Props) {
  const [expanded, setExpanded]       = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const { state, queue, currentIndex, currentItem, settings, setSettings, voices,
          play, pause, resume, stop, next, prev, replayCurrent, jumpTo } = speech;

  // ── Section highlight + auto-scroll on active section change ────────────
  const lastSectionRef = useRef<SpeechSectionId | null>(null);
  useEffect(() => {
    const section = currentItem?.sectionId;
    if (!section || section === lastSectionRef.current) return;
    lastSectionRef.current = section;

    if (typeof document === 'undefined') return;
    document.querySelectorAll('.tts-section-active').forEach((el) => {
      el.classList.remove('tts-section-active');
    });

    if (section === 'title') return;
    const node = document.querySelector(`[data-section="${section}"]`) as HTMLElement | null;
    if (!node) return;
    node.classList.add('tts-section-active');

    const sc = scrollContainerRef?.current;
    if (sc) {
      sc.scrollTo({ top: Math.max(0, node.offsetTop - 80), behavior: 'smooth' });
    } else {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentItem, scrollContainerRef]);

  // Clear the highlight when the player unmounts.
  useEffect(() => {
    return () => {
      if (typeof document === 'undefined') return;
      document.querySelectorAll('.tts-section-active').forEach((el) => {
        el.classList.remove('tts-section-active');
      });
    };
  }, []);

  // ── Section jump (play from first item in section) ──────────────────────
  const sectionStarts = useMemo(() => {
    const map = new Map<SpeechSectionId, number>();
    queue.forEach((item, idx) => {
      if (!map.has(item.sectionId)) map.set(item.sectionId, idx);
    });
    return map;
  }, [queue]);

  const presentSections = useMemo(() => {
    const set = new Set<SpeechSectionId>(queue.map((q) => q.sectionId));
    return (['what', 'why', 'how', 'practice'] as SpeechSectionId[]).filter((s) => set.has(s));
  }, [queue]);

  if (!speech.supported) {
    return (
      <div className="fixed bottom-6 right-6 z-40 max-w-xs rounded-2xl border border-rose-500/20 bg-slate-950/80 backdrop-blur-xl p-3 text-[11px] text-rose-300 shadow-xl">
        Speech is not supported in this browser. Try Chrome, Edge, or Safari.
      </div>
    );
  }

  const isPlaying = state === 'playing';
  const isPaused  = state === 'paused';
  const meta      = currentItem ? SECTION_META[currentItem.sectionId] : SECTION_META.title;
  const total     = queue.length;
  const queuePct  = total > 0 ? Math.min(100, Math.max(0, ((currentIndex + 1) / total) * 100)) : 0;

  // ── Mini pill ───────────────────────────────────────────────────────────
  if (!expanded) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 animate-tts-rise">
        <button
          onClick={() => setExpanded(true)}
          className={`group flex items-center gap-2 pl-3 pr-3.5 py-2.5 rounded-full border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-[0_8px_40px_-8px_rgba(168,85,247,0.5)] hover:border-purple-400/40 hover:bg-slate-900/90 cursor-pointer transition-all`}
        >
          <Waveform active={isPlaying} accent="text-purple-400" />
          <span className="text-[11px] font-bold text-white truncate max-w-[140px]">
            {currentItem ? meta.label : 'Listen'}
          </span>
          <span className="h-3.5 w-3.5 rounded-full bg-purple-600 group-hover:bg-purple-500 flex items-center justify-center">
            <Maximize2 className="h-2 w-2 text-white" />
          </span>
        </button>
      </div>
    );
  }

  // ── Expanded card ───────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop on mobile only — taps to close settings */}
      {showSettings && (
        <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setShowSettings(false)} />
      )}

      <div
        role="region"
        aria-label="Lesson speech player"
        className="fixed bottom-3 right-3 left-3 sm:left-auto sm:bottom-6 sm:right-6 z-40 sm:w-[420px] animate-tts-rise"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-slate-950/85 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
          {/* Glow halo */}
          <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-purple-500/25 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-indigo-500/15 blur-3xl" />

          {/* Header */}
          <div className="relative flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-xl bg-purple-500/15 border border-purple-400/25 flex items-center justify-center shrink-0">
                <Mic className="h-3.5 w-3.5 text-purple-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-purple-300/80">Now reading</p>
                <p className="text-[11px] font-semibold text-white truncate">
                  {currentItem ? currentItem.label : 'Press play to start'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <IconBtn
                title="Settings"
                active={showSettings}
                onClick={() => setShowSettings((s) => !s)}
              >
                <Settings2 className="h-3.5 w-3.5" />
              </IconBtn>
              <IconBtn title="Minimise" onClick={() => setExpanded(false)}>
                <Minimize2 className="h-3.5 w-3.5" />
              </IconBtn>
              <IconBtn title="Close" onClick={() => { stop(); onClose(); }}>
                <X className="h-3.5 w-3.5" />
              </IconBtn>
            </div>
          </div>

          {/* Waveform + section + progress */}
          <div className="relative px-4 pt-3 pb-2">
            <div className="flex items-center gap-3">
              <Waveform active={isPlaying} accent={meta.color} large />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${meta.bg} ${meta.color} ${meta.ring} ring-1`}>
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {total > 0 ? `${currentIndex + 1 || 0}/${total}` : '—'}
                  </span>
                </div>
                <div className="mt-1.5 h-1 w-full rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-400 to-sky-400 transition-all duration-300"
                    style={{ width: `${queuePct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="relative px-4 pb-3">
            <div className="flex items-center justify-center gap-2">
              <CtrlBtn title="Previous" onClick={prev} disabled={currentIndex <= 0}>
                <SkipBack className="h-4 w-4" />
              </CtrlBtn>
              <CtrlBtn title="Replay current" onClick={replayCurrent} disabled={!currentItem}>
                <RotateCcw className="h-4 w-4" />
              </CtrlBtn>

              {/* Primary play/pause */}
              <button
                onClick={() => {
                  if (isPlaying) pause();
                  else if (isPaused) resume();
                  else play();
                }}
                title={isPlaying ? 'Pause' : 'Play'}
                className={`group h-12 w-12 rounded-full flex items-center justify-center cursor-pointer transition-all border ${
                  isPlaying
                    ? 'bg-purple-600 border-purple-400/30 shadow-[0_0_30px_rgba(168,85,247,0.5)] text-white'
                    : 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-400/30 hover:scale-105 shadow-[0_0_24px_rgba(168,85,247,0.45)] text-white'
                }`}
              >
                {isPlaying
                  ? <Pause className="h-5 w-5" />
                  : <Play  className="h-5 w-5 ml-0.5" />}
              </button>

              <CtrlBtn title="Next" onClick={next} disabled={currentIndex >= queue.length - 1}>
                <SkipForward className="h-4 w-4" />
              </CtrlBtn>
              <CtrlBtn title="Stop" onClick={stop} disabled={state === 'idle'}>
                <Square className="h-4 w-4" />
              </CtrlBtn>
            </div>
          </div>

          {/* Section pills */}
          {presentSections.length > 0 && (
            <div className="relative px-4 pb-3 border-t border-white/[0.04] pt-3">
              <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                <Waves className="h-3 w-3" /> Jump to section
              </p>
              <div className="flex flex-wrap gap-1.5">
                {presentSections.map((s) => {
                  const m = SECTION_META[s];
                  const isActive = currentItem?.sectionId === s;
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        const start = sectionStarts.get(s);
                        if (start !== undefined) jumpTo(start);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        isActive
                          ? `${m.bg} ${m.color} ${m.ring} ring-1`
                          : 'border-white/[0.05] bg-white/[0.02] text-slate-400 hover:text-white hover:border-white/15'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Settings panel */}
          {showSettings && (
            <div className="relative border-t border-white/[0.05] px-4 py-3 space-y-3 animate-tts-fade-in">
              <SliderRow
                label="Speed"
                value={settings.rate}
                min={0.5} max={2} step={0.1}
                onChange={(v) => setSettings({ rate: v })}
                format={(v) => `${v.toFixed(1)}×`}
                accent="from-purple-500 to-indigo-400"
              />
              <SliderRow
                label="Pitch"
                value={settings.pitch}
                min={0.5} max={2} step={0.1}
                onChange={(v) => setSettings({ pitch: v })}
                format={(v) => v.toFixed(2)}
                accent="from-sky-500 to-cyan-400"
              />
              <SliderRow
                label="Volume"
                value={settings.volume}
                min={0} max={1} step={0.05}
                onChange={(v) => setSettings({ volume: v })}
                format={(v) => `${Math.round(v * 100)}%`}
                accent="from-emerald-500 to-teal-400"
                icon={<Volume2 className="h-3 w-3" />}
              />

              {/* Voice picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] uppercase tracking-[0.18em] font-bold text-slate-500">Voice</label>
                  <span className="text-[10px] text-slate-600 truncate max-w-[160px]">
                    {voices.length > 0 ? `${voices.length} available` : 'Loading…'}
                  </span>
                </div>
                <select
                  value={settings.voiceURI ?? ''}
                  onChange={(e) => setSettings({ voiceURI: e.target.value || null })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-200 focus:outline-none focus:border-purple-500/40 transition-colors"
                >
                  <option value="">System default</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} {v.lang ? `· ${v.lang}` : ''}{v.default ? ' (default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[9px] text-slate-600 leading-relaxed pt-1">
                Settings are saved on this device. AI-quality voices are coming soon.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Global animations + active-section highlight */}
      <style jsx global>{`
        @keyframes tts-rise {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tts-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes tts-bar {
          0%, 100% { transform: scaleY(0.35); }
          50%      { transform: scaleY(1); }
        }
        .animate-tts-rise    { animation: tts-rise 0.32s cubic-bezier(.22,.61,.36,1) both; }
        .animate-tts-fade-in { animation: tts-fade-in 0.25s ease-out both; }
        .tts-bar { transform-origin: bottom center; animation: tts-bar 1.1s ease-in-out infinite; }
        .tts-bar.idle { animation: none; transform: scaleY(0.35); opacity: 0.5; }

        /* Active section highlight on the lesson page */
        [data-section].tts-section-active {
          position: relative;
        }
        [data-section].tts-section-active::before {
          content: '';
          position: absolute;
          left: -16px; top: -8px; bottom: -8px;
          width: 3px; border-radius: 4px;
          background: linear-gradient(180deg, #a855f7, #6366f1 60%, transparent);
          box-shadow: 0 0 16px rgba(168,85,247,0.45);
          animation: tts-fade-in 0.4s ease-out;
        }
      `}</style>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────

function IconBtn({
  children, onClick, title, active = false,
}: { children: React.ReactNode; onClick: () => void; title: string; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-7 w-7 rounded-lg flex items-center justify-center cursor-pointer transition-all border ${
        active
          ? 'bg-purple-500/15 border-purple-400/30 text-purple-200'
          : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-white hover:border-white/15'
      }`}
    >
      {children}
    </button>
  );
}

function CtrlBtn({
  children, onClick, disabled, title,
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean; title: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-9 w-9 rounded-xl flex items-center justify-center cursor-pointer transition-all border border-white/[0.05] bg-white/[0.02] text-slate-300 hover:text-white hover:border-white/15 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function SliderRow({
  label, value, min, max, step, onChange, format, accent, icon,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string;
  accent: string; icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[9px] uppercase tracking-[0.18em] font-bold text-slate-500 flex items-center gap-1">
          {icon}{label}
        </label>
        <span className="text-[10px] font-mono text-slate-300">{format(value)}</span>
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${accent}`}
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

function Waveform({ active, accent, large }: { active: boolean; accent: string; large?: boolean }) {
  const bars = large ? 5 : 4;
  return (
    <div className={`flex items-end gap-[3px] ${large ? 'h-7' : 'h-4'} ${accent}`} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`tts-bar w-[3px] bg-current rounded-full ${active ? '' : 'idle'}`}
          style={{ height: '100%', animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

// Re-export icons that callers might want
export { ChevronUp, ChevronDown };
