'use client';

// useSpeech — thin React wrapper around the browser SpeechSynthesis API.
//
// Goals:
//   • Encapsulate every quirk (Chrome 15s bug, async voice loading,
//     cancel-vs-end races) behind a clean imperative API.
//   • Persist user voice settings to localStorage.
//   • Be the *only* file that talks to window.speechSynthesis — so when we
//     swap to an AI provider, only this file changes.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SpeakableItem,
  SpeechSettings,
  SpeechState,
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
} from './types';

interface UseSpeechReturn {
  /** Browser supports SpeechSynthesis (false on SSR, very old browsers, etc.) */
  supported: boolean;
  /** All voices the browser offers (after async load). */
  voices: SpeechSynthesisVoice[];
  /** idle = nothing queued; loading = queued, awaiting first utterance start. */
  state: SpeechState;

  queue: SpeakableItem[];
  currentIndex: number;
  currentItem: SpeakableItem | null;

  settings: SpeechSettings;
  setSettings: (next: Partial<SpeechSettings>) => void;

  /** Load a new queue. `start` defaults to true → autoplay from index 0. */
  setQueue: (items: SpeakableItem[], options?: { autoplay?: boolean; startIndex?: number }) => void;

  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  replayCurrent: () => void;
  jumpTo: (index: number) => void;
}

function loadSettings(): SpeechSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SpeechSettings>;
    return {
      rate:   typeof parsed.rate   === 'number' ? clamp(parsed.rate, 0.5, 2)   : DEFAULT_SETTINGS.rate,
      pitch:  typeof parsed.pitch  === 'number' ? clamp(parsed.pitch, 0.5, 2)  : DEFAULT_SETTINGS.pitch,
      volume: typeof parsed.volume === 'number' ? clamp(parsed.volume, 0, 1)   : DEFAULT_SETTINGS.volume,
      voiceURI: typeof parsed.voiceURI === 'string' ? parsed.voiceURI : null,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function useSpeech(): UseSpeechReturn {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const [voices, setVoices]       = useState<SpeechSynthesisVoice[]>([]);
  const [queue, setQueueState]    = useState<SpeakableItem[]>([]);
  const [currentIndex, setIndex]  = useState<number>(-1);
  const [state, setState]         = useState<SpeechState>('idle');
  const [settings, setSettingsSt] = useState<SpeechSettings>(() => loadSettings());

  // Refs used by speak() so handlers never see stale state.
  const settingsRef = useRef<SpeechSettings>(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const queueRef = useRef<SpeakableItem[]>(queue);
  useEffect(() => { queueRef.current = queue; }, [queue]);

  const indexRef = useRef<number>(currentIndex);
  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);

  /** Flag we flip when *we* call cancel(), so onend doesn't auto-advance. */
  const cancellingRef = useRef(false);
  /** Tracks the most recent utterance so we can ignore stale events. */
  const currentUttRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ── 1. Load voices (async on Chrome) ────────────────────────────────────
  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;

    const pull = () => {
      const v = synth.getVoices();
      if (v.length) setVoices(v);
    };
    pull();
    synth.addEventListener('voiceschanged', pull);
    return () => synth.removeEventListener('voiceschanged', pull);
  }, [supported]);

  // ── 2. Chrome 15-second cutoff workaround ───────────────────────────────
  useEffect(() => {
    if (!supported || state !== 'playing') return;
    const id = setInterval(() => {
      const synth = window.speechSynthesis;
      // Calling pause()+resume() resets Chrome's internal timer.
      if (synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
      }
    }, 12_000);
    return () => clearInterval(id);
  }, [supported, state]);

  // ── 3. Hard cleanup on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (typeof window === 'undefined') return;
      cancellingRef.current = true;
      try { window.speechSynthesis.cancel(); } catch { /* */ }
    };
  }, []);

  // ── 4. Speak a specific queue index ─────────────────────────────────────
  const speakIndex = useCallback((idx: number) => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const items = queueRef.current;
    if (idx < 0 || idx >= items.length) {
      cancellingRef.current = true;
      synth.cancel();
      setState('idle');
      setIndex(-1);
      return;
    }

    // Cancel anything currently spoken; flag it so onend doesn't chain twice.
    cancellingRef.current = true;
    try { synth.cancel(); } catch { /* */ }

    const item = items[idx];
    const utt = new SpeechSynthesisUtterance(item.text);
    const s = settingsRef.current;
    utt.rate   = s.rate;
    utt.pitch  = s.pitch;
    utt.volume = s.volume;

    const voice = s.voiceURI
      ? window.speechSynthesis.getVoices().find((v) => v.voiceURI === s.voiceURI)
      : null;
    if (voice) utt.voice = voice;

    utt.onstart = () => {
      if (currentUttRef.current !== utt) return;
      setState('playing');
    };
    utt.onpause = () => {
      if (currentUttRef.current !== utt) return;
      setState('paused');
    };
    utt.onresume = () => {
      if (currentUttRef.current !== utt) return;
      setState('playing');
    };
    utt.onend = () => {
      if (currentUttRef.current !== utt) return;     // stale
      if (cancellingRef.current) { cancellingRef.current = false; return; }
      // Natural end → advance.
      const nextIdx = indexRef.current + 1;
      if (nextIdx >= queueRef.current.length) {
        setState('idle');
        setIndex(-1);
        currentUttRef.current = null;
      } else {
        setIndex(nextIdx);
        // Re-enter; the effect below will pick it up.
        // We don't call speakIndex directly here to avoid deep recursion in
        // some browsers — instead we rely on the index-watching effect.
      }
    };
    utt.onerror = () => {
      if (currentUttRef.current !== utt) return;
      cancellingRef.current = false;
      setState('idle');
    };

    currentUttRef.current = utt;
    setIndex(idx);
    setState('loading');

    // Tiny delay so cancel() finishes flushing before we enqueue.
    setTimeout(() => {
      // Bail if a newer index has been set since.
      if (currentUttRef.current !== utt) return;
      cancellingRef.current = false;
      try { synth.speak(utt); } catch { setState('idle'); }
    }, 30);
  }, [supported]);

  // Effect that picks up an externally-set index and starts speaking it.
  // This decouples "where the queue head is" from "are we currently uttering".
  // Triggered by onend → setIndex(next).
  useEffect(() => {
    if (currentIndex < 0) return;
    if (state === 'paused') return;
    // If we're loading or playing the matching index, do nothing.
    if (currentUttRef.current && state !== 'idle') {
      // Compare the utterance text vs the queue text — cheap heuristic.
      const expected = queueRef.current[currentIndex]?.text;
      if (currentUttRef.current.text === expected) return;
    }
    speakIndex(currentIndex);
    // We intentionally don't depend on `state` or speakIndex to avoid loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // ── 5. Public API ───────────────────────────────────────────────────────
  const setQueue = useCallback((items: SpeakableItem[], options?: { autoplay?: boolean; startIndex?: number }) => {
    cancellingRef.current = true;
    try { window.speechSynthesis.cancel(); } catch { /* */ }
    setQueueState(items);
    if (!items.length) {
      setIndex(-1);
      setState('idle');
      return;
    }
    const start = options?.startIndex ?? 0;
    const autoplay = options?.autoplay ?? true;
    if (autoplay) {
      setIndex(start);
    } else {
      setIndex(-1);
      setState('idle');
    }
  }, []);

  const play = useCallback(() => {
    if (!supported) return;
    if (queueRef.current.length === 0) return;
    if (state === 'paused') {
      window.speechSynthesis.resume();
      return;
    }
    const idx = indexRef.current >= 0 ? indexRef.current : 0;
    setIndex(idx);
    if (currentUttRef.current && state === 'playing') return;
    speakIndex(idx);
  }, [supported, state, speakIndex]);

  const pause = useCallback(() => {
    if (!supported) return;
    try { window.speechSynthesis.pause(); setState('paused'); } catch { /* */ }
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    try { window.speechSynthesis.resume(); setState('playing'); } catch { /* */ }
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    cancellingRef.current = true;
    try { window.speechSynthesis.cancel(); } catch { /* */ }
    currentUttRef.current = null;
    setState('idle');
    setIndex(-1);
  }, [supported]);

  const next = useCallback(() => {
    const idx = indexRef.current + 1;
    if (idx >= queueRef.current.length) { stop(); return; }
    speakIndex(idx);
  }, [speakIndex, stop]);

  const prev = useCallback(() => {
    const idx = Math.max(0, indexRef.current - 1);
    speakIndex(idx);
  }, [speakIndex]);

  const replayCurrent = useCallback(() => {
    const idx = indexRef.current >= 0 ? indexRef.current : 0;
    speakIndex(idx);
  }, [speakIndex]);

  const jumpTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= queueRef.current.length) return;
    speakIndex(idx);
  }, [speakIndex]);

  const setSettings = useCallback((next: Partial<SpeechSettings>) => {
    setSettingsSt((prev) => {
      const merged: SpeechSettings = {
        rate:     next.rate     !== undefined ? clamp(next.rate,   0.5, 2) : prev.rate,
        pitch:    next.pitch    !== undefined ? clamp(next.pitch,  0.5, 2) : prev.pitch,
        volume:   next.volume   !== undefined ? clamp(next.volume, 0,   1) : prev.volume,
        voiceURI: next.voiceURI !== undefined ? next.voiceURI               : prev.voiceURI,
      };
      try { window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged)); } catch { /* */ }
      return merged;
    });
    // If currently speaking, re-utter the current item with new params.
    if (indexRef.current >= 0 && state !== 'idle') {
      // tiny defer so settingsRef updates first
      setTimeout(() => speakIndex(indexRef.current), 0);
    }
  }, [state, speakIndex]);

  const currentItem = useMemo(
    () => (currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null),
    [currentIndex, queue]
  );

  return {
    supported,
    voices,
    state,
    queue,
    currentIndex,
    currentItem,
    settings,
    setSettings,
    setQueue,
    play,
    pause,
    resume,
    stop,
    next,
    prev,
    replayCurrent,
    jumpTo,
  };
}
