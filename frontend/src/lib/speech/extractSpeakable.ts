// Pure extractor: turn topic content into a clean speech queue.
//
// Strict allow-list per element type. Code, JSON, raw HTML, ids, and any
// "technical metadata" are NEVER read out.

import type { FlowContent, FlowSection } from '@/services/course';
import type { SpeakableItem, SpeechSectionId } from './types';

const SECTION_LABEL: Record<FlowSection, string> = {
  what: 'What',
  why: 'Why',
  how: 'How',
  practice: 'Practice',
};

const SECTION_PROLOGUE: Record<FlowSection, string> = {
  what:     'What. The concept.',
  why:      'Why. The motivation.',
  how:      'How. The implementation.',
  practice: 'Practice. Test yourself.',
};

const ORDER: FlowSection[] = ['what', 'why', 'how', 'practice'];

/** Strip residual markdown / inline code so screen reader doesn't say "back-tick". */
function cleanText(input: string): string {
  if (!input) return '';
  return input
    // strip ``` fenced code (rare in TEXT, but defensive)
    .replace(/```[\s\S]*?```/g, '')
    // strip inline `code`
    .replace(/`[^`\n]*`/g, '')
    // strip markdown bold/italic markers but keep words
    .replace(/[*_]{1,3}([^*_\n]+)[*_]{1,3}/g, '$1')
    // turn markdown links [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // collapse whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Split long paragraphs so the player can step through them with prev/next. */
function chunkParagraph(text: string, maxLen = 320): string[] {
  const cleaned = cleanText(text);
  if (!cleaned) return [];
  if (cleaned.length <= maxLen) return [cleaned];

  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const out: string[] = [];
  let buf = '';
  for (const s of sentences) {
    if ((buf + ' ' + s).trim().length > maxLen && buf) {
      out.push(buf.trim());
      buf = s;
    } else {
      buf = (buf ? buf + ' ' : '') + s;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

/** Cumulative paragraph counter per section, exposed as a closure. */
function makeCounter() {
  const counts: Partial<Record<SpeechSectionId, number>> = {};
  return (sectionId: SpeechSectionId) => {
    counts[sectionId] = (counts[sectionId] ?? 0) + 1;
    return counts[sectionId]!;
  };
}

export interface ExtractInput {
  topicTitle: string;
  topicDescription?: string | null;
  flow: FlowContent;
}

export function extractSpeakable({ topicTitle, topicDescription, flow }: ExtractInput): SpeakableItem[] {
  const items: SpeakableItem[] = [];
  const counter = makeCounter();

  // ── 1. Topic title + description ────────────────────────────────────────
  if (topicTitle) {
    items.push({
      id: 'title:main',
      text: cleanText(topicTitle),
      sectionId: 'title',
      label: 'Topic title',
    });
  }
  if (topicDescription) {
    items.push({
      id: 'title:desc',
      text: cleanText(topicDescription),
      sectionId: 'title',
      label: 'Topic intro',
    });
  }

  // ── 2. Flow sections in fixed order ─────────────────────────────────────
  for (const section of ORDER) {
    const elements = flow[section];
    if (!elements?.length) continue;

    // Section prologue — short, sets context for the listener.
    items.push({
      id: `prologue:${section}`,
      text: SECTION_PROLOGUE[section],
      sectionId: section,
      label: `${SECTION_LABEL[section]} — intro`,
    });

    for (const el of elements) {
      switch (el.type) {
        case 'TEXT': {
          const chunks = chunkParagraph(el.content);
          for (const c of chunks) {
            const n = counter(section);
            items.push({
              id: `text:${el.id}:${n}`,
              text: c,
              sectionId: section,
              label: `${SECTION_LABEL[section]} — paragraph ${n}`,
            });
          }
          break;
        }
        case 'CALLOUT': {
          const text = cleanText(el.content);
          if (text) {
            const n = counter(section);
            const prefix =
              el.variant === 'warning' ? 'Heads up: '
            : el.variant === 'danger'  ? 'Important: '
            : el.variant === 'tip'     ? 'Tip: '
            : 'Note: ';
            items.push({
              id: `callout:${el.id}`,
              text: prefix + text,
              sectionId: section,
              label: `${SECTION_LABEL[section]} — callout ${n}`,
            });
          }
          break;
        }
        case 'QUIZ': {
          const q = cleanText(el.question);
          if (q) {
            const n = counter(section);
            items.push({
              id: `quiz:${el.id}:q`,
              text: 'Quick check. ' + q,
              sectionId: section,
              label: `${SECTION_LABEL[section]} — quiz ${n}`,
            });
          }
          const expl = cleanText(el.explanation || '');
          if (expl) {
            items.push({
              id: `quiz:${el.id}:explanation`,
              text: 'Explanation. ' + expl,
              sectionId: section,
              label: `${SECTION_LABEL[section]} — quiz explanation`,
            });
          }
          break;
        }
        case 'CHALLENGE': {
          const inst = cleanText(el.instructions);
          if (inst) {
            const n = counter(section);
            items.push({
              id: `challenge:${el.id}`,
              text: 'Challenge. ' + inst,
              sectionId: section,
              label: `${SECTION_LABEL[section]} — challenge ${n}`,
            });
          }
          break;
        }
        case 'FLOW_DIAGRAM': {
          // Read node labels only — keeps the flow narrative without diving into ids.
          const labels = (el.nodes || [])
            .map((n) => cleanText(n.label))
            .filter(Boolean);
          if (labels.length) {
            const n = counter(section);
            items.push({
              id: `flow:${el.id}`,
              text: `Flow diagram with ${labels.length} steps. ` + labels.join('. ') + '.',
              sectionId: section,
              label: `${SECTION_LABEL[section]} — flow diagram ${n}`,
            });
          }
          break;
        }
        case 'IMAGE': {
          const cap = cleanText(el.caption || el.alt || '');
          if (cap) {
            const n = counter(section);
            items.push({
              id: `image:${el.id}`,
              text: 'Image. ' + cap,
              sectionId: section,
              label: `${SECTION_LABEL[section]} — image ${n}`,
            });
          }
          break;
        }
        case 'VIDEO': {
          const t = cleanText(el.title || '');
          if (t) {
            const n = counter(section);
            items.push({
              id: `video:${el.id}`,
              text: 'Video. ' + t,
              sectionId: section,
              label: `${SECTION_LABEL[section]} — video ${n}`,
            });
          }
          break;
        }
        // CODE, OUTPUT_PREVIEW: intentionally never read.
        case 'CODE':
        case 'OUTPUT_PREVIEW':
        default:
          break;
      }
    }
  }

  return items;
}
