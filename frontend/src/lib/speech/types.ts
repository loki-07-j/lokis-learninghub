// Speech engine — shared types
//
// Designed to outlive the current SpeechSynthesis implementation. When we
// swap to an AI / cloud voice provider, only the engine impl changes; queue
// items, settings, and player UI stay the same.

export type SpeechSectionId = 'title' | 'what' | 'why' | 'how' | 'practice';

export interface SpeakableItem {
  /** Stable id for React keys + jumpTo */
  id: string;
  /** Text to be spoken — already sanitised (no code, ids, raw json) */
  text: string;
  /** Which lesson section this item belongs to, for UI highlight / scroll */
  sectionId: SpeechSectionId;
  /** Short human label, e.g. "What — paragraph 1" */
  label: string;
}

export interface SpeechSettings {
  /** 0.5 – 2.0 */
  rate: number;
  /** 0.5 – 2.0 */
  pitch: number;
  /** 0 – 1 */
  volume: number;
  /** Selected voice URI, or null for browser default */
  voiceURI: string | null;
}

export type SpeechState = 'idle' | 'loading' | 'playing' | 'paused';

export const DEFAULT_SETTINGS: SpeechSettings = {
  rate: 1,
  pitch: 1,
  volume: 1,
  voiceURI: null,
};

export const SETTINGS_STORAGE_KEY = 'lh.speech.settings.v1';
