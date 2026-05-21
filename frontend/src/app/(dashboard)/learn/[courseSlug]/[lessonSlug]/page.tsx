'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  courseService, Course, Topic, FlowContent, FlowSection,
  ContentElement, TextElement, CodeElement, ImageElement, VideoElement,
  QuizElement, ChallengeElement, OutputPreviewElement, FlowDiagramElement, CalloutElement
} from '@/services/course';
import { toast } from 'sonner';
import {
  ChevronRight, ChevronDown, Loader2, BookmarkPlus, BookmarkCheck,
  StickyNote, Focus, CheckCircle2, Circle, ArrowLeft, ArrowRight,
  Copy, Check, X, AlertCircle, Info, AlertTriangle, Lightbulb,
  Menu, Clock, Sparkles, Eye, RotateCcw, ChevronsRight, Headphones,
} from 'lucide-react';
import { useSpeech } from '@/lib/speech/useSpeech';
import { extractSpeakable } from '@/lib/speech/extractSpeakable';
import SpeechPlayer from '@/components/learn/SpeechPlayer';

// ── storage helpers ─────────────────────────────────────────────────────────
const NOTES_KEY = (c: string, t: string) => `notes_${c}_${t}`;
const BM_KEY    = (c: string, t: string) => `bm_${c}_${t}`;
const DONE_KEY  = (c: string) => `done_${c}`;

const getCompleted = (slug: string): string[] => {
  try { return JSON.parse(localStorage.getItem(DONE_KEY(slug)) || '[]'); } catch { return []; }
};
const markCompleted = (c: string, t: string) => {
  const done = getCompleted(c);
  if (!done.includes(t)) localStorage.setItem(DONE_KEY(c), JSON.stringify([...done, t]));
};

// ── section metadata ────────────────────────────────────────────────────────
const SECTION_META: Record<FlowSection, { label: string; tagline: string; color: string; border: string; bg: string; dot: string; num: string }> = {
  what:     { label: 'What',     tagline: 'The concept',        color: 'text-sky-400',     border: 'border-sky-500/30',     bg: 'from-sky-500/[0.06]',     dot: 'bg-sky-400',     num: '01' },
  why:      { label: 'Why',      tagline: 'The motivation',     color: 'text-amber-400',   border: 'border-amber-500/30',   bg: 'from-amber-500/[0.06]',   dot: 'bg-amber-400',   num: '02' },
  how:      { label: 'How',      tagline: 'The implementation', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'from-emerald-500/[0.06]', dot: 'bg-emerald-400', num: '03' },
  practice: { label: 'Practice', tagline: 'Test yourself',      color: 'text-purple-400',  border: 'border-purple-500/30',  bg: 'from-purple-500/[0.06]',  dot: 'bg-purple-400',  num: '04' },
};
const FLOW_SECTIONS: FlowSection[] = ['what', 'why', 'how', 'practice'];

// ── reading time helpers ────────────────────────────────────────────────────
function countWords(flow: FlowContent): number {
  const wc = (s: string) => (s || '').trim().split(/\s+/).filter(Boolean).length;
  let n = 0;
  FLOW_SECTIONS.forEach(sec => {
    flow[sec].forEach(el => {
      if (el.type === 'TEXT')      n += wc(el.content);
      if (el.type === 'CALLOUT')   n += wc(el.content);
      if (el.type === 'QUIZ')      n += wc(el.question) + wc(el.explanation || '');
      if (el.type === 'CHALLENGE') n += wc(el.instructions);
      if (el.type === 'CODE')      n += wc(el.code) / 3;
    });
  });
  return Math.round(n);
}

// ════════════════════════════════════════════════════════════════════════════
// ── Main page ──────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
export default function TopicLearnPage() {
  const params     = useParams();
  const router     = useRouter();
  const courseSlug = params.courseSlug as string;
  const topicSlug  = params.lessonSlug as string;

  const [course, setCourse]     = useState<Course | null>(null);
  const [topic, setTopic]       = useState<Topic | null>(null);
  const [flow, setFlow]         = useState<FlowContent | null>(null);
  const [loading, setLoading]   = useState(true);
  const [completed, setCompleted] = useState<string[]>([]);

  // Sidebar / utilities
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [bookmarked, setBookmarked] = useState(false);
  const [showNotes, setShowNotes]   = useState(false);
  const [focusMode, setFocusMode]   = useState(false);
  const [notes, setNotes]           = useState('');
  const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll progress + active section
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs        = useRef<Partial<Record<FlowSection, HTMLDivElement | null>>>({});
  const [scrollPct, setScrollPct]     = useState(0);
  const [activeSection, setActiveSection] = useState<FlowSection>('what');

  // ── Text-to-speech ──────────────────────────────────────────────────────
  const speech = useSpeech();
  const [listening, setListening] = useState(false);

  const speakable = useMemo(() => {
    if (!topic || !flow) return [];
    return extractSpeakable({
      topicTitle: topic.title,
      topicDescription: topic.description,
      flow,
    });
  }, [topic, flow]);

  // Reset listener when navigating to a new topic
  useEffect(() => {
    speech.stop();
    setListening(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug, topicSlug]);

  const handleToggleListen = () => {
    if (listening) {
      speech.stop();
      setListening(false);
    } else {
      if (speakable.length === 0) {
        toast.error('Nothing readable in this topic yet.');
        return;
      }
      speech.setQueue(speakable, { autoplay: true, startIndex: 0 });
      setListening(true);
    }
  };

  // ── load ────────────────────────────────────────────────────────────────
  useEffect(() => { if (courseSlug && topicSlug) load(); /* eslint-disable-line */ }, [courseSlug, topicSlug]);

  const load = async () => {
    try {
      setLoading(true);
      const [c, t] = await Promise.all([
        courseService.getCourseDetails(courseSlug),
        courseService.getTopicContent(courseSlug, topicSlug),
      ]);
      setCourse(c);
      setTopic(t);
      const fc = t.flow_content as FlowContent | null;
      setFlow(fc ?? { what: [], why: [], how: [], practice: [] });

      setCompleted(getCompleted(courseSlug));
      setBookmarked(localStorage.getItem(BM_KEY(courseSlug, topicSlug)) === '1');
      setNotes(localStorage.getItem(NOTES_KEY(courseSlug, topicSlug)) || '');

      c.modules?.forEach(m => {
        if (m.topics?.some(t => t.slug === topicSlug)) {
          setExpandedModules(p => ({ ...p, [m.id]: true }));
        }
      });
      setScrollPct(0);
      setActiveSection('what');
    } catch {
      toast.error('Failed to load topic');
      router.push(`/learn/${courseSlug}`);
    } finally {
      setLoading(false);
    }
  };

  // ── scroll progress ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setScrollPct(max > 0 ? (el.scrollTop / max) * 100 : 0);

      // section detection
      let current: FlowSection = 'what';
      for (const sec of FLOW_SECTIONS) {
        const node = sectionRefs.current[sec];
        if (node && node.offsetTop - el.scrollTop < 200) current = sec;
      }
      setActiveSection(current);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [flow, loading]);

  // ── nav helpers ──────────────────────────────────────────────────────────
  const allTopics = useMemo(() => {
    const out: { slug: string; title: string }[] = [];
    course?.modules?.forEach(m => m.topics?.forEach(t => out.push({ slug: t.slug, title: t.title })));
    return out;
  }, [course]);

  const currentIdx = allTopics.findIndex(t => t.slug === topicSlug);
  const prevTopic  = currentIdx > 0 ? allTopics[currentIdx - 1] : null;
  const nextTopic  = currentIdx >= 0 && currentIdx < allTopics.length - 1 ? allTopics[currentIdx + 1] : null;

  // ── reading time ─────────────────────────────────────────────────────────
  const readingMin = useMemo(() => {
    if (!flow) return 0;
    return Math.max(1, Math.round(countWords(flow) / 200));
  }, [flow]);

  // ── actions ──────────────────────────────────────────────────────────────
  const toggleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    localStorage.setItem(BM_KEY(courseSlug, topicSlug), next ? '1' : '0');
    toast.success(next ? 'Bookmarked' : 'Bookmark removed');
  };
  const handleMarkDone = () => {
    markCompleted(courseSlug, topicSlug);
    setCompleted(getCompleted(courseSlug));
    toast.success('Topic completed', { description: nextTopic ? `Next up: ${nextTopic.title}` : 'Course complete!' });
    if (nextTopic) setTimeout(() => router.push(`/learn/${courseSlug}/${nextTopic.slug}`), 700);
  };
  const handleNotesChange = (v: string) => {
    setNotes(v);
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(() => localStorage.setItem(NOTES_KEY(courseSlug, topicSlug), v), 700);
  };

  const scrollToSection = (sec: FlowSection) => {
    const node = sectionRefs.current[sec];
    const sc   = scrollContainerRef.current;
    if (node && sc) sc.scrollTo({ top: node.offsetTop - 80, behavior: 'smooth' });
  };

  // ── states ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-purple-500" />
          <span className="text-[11px] text-slate-500 font-light">Loading topic…</span>
        </div>
      </div>
    );
  }
  if (!topic || !flow) return null;

  const isDone   = completed.includes(topicSlug);
  const hasAny   = FLOW_SECTIONS.some(s => flow[s].length > 0);
  const sectionsWithContent = FLOW_SECTIONS.filter(s => flow[s].length > 0);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col -mx-6 -my-6 h-[calc(100vh-5rem)] overflow-hidden relative bg-[#030014]">

      {/* Reading progress bar (very top) */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-50 bg-white/[0.02]">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-sky-400 transition-[width] duration-150 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          style={{ width: `${scrollPct}%` }}
        />
      </div>

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-slate-950/60 backdrop-blur-xl shrink-0 mt-0.5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] min-w-0 flex-1">
          <button onClick={() => setSidebarOpen(p => !p)}
            className="p-1.5 -ml-1 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-white cursor-pointer transition-colors">
            <Menu className="h-4 w-4" />
          </button>
          <Link href="/learn" className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 font-medium">Learn</Link>
          <ChevronRight className="h-3 w-3 text-slate-700 shrink-0" />
          <Link href={`/learn/${courseSlug}`} className="text-slate-500 hover:text-slate-300 transition-colors truncate max-w-[140px] font-medium">{course?.title}</Link>
          <ChevronRight className="h-3 w-3 text-slate-700 shrink-0" />
          <span className="text-slate-200 font-semibold truncate max-w-[200px]">{topic.title}</span>
        </div>

        {/* Utilities */}
        <div className="flex items-center gap-1.5 shrink-0">
          <UtilBtn icon={<Headphones className="h-3.5 w-3.5" />}
            label={listening ? 'Listening' : 'Listen'} onClick={handleToggleListen} active={listening}
            activeCls="text-purple-300 border-purple-500/30 bg-purple-500/10" />
          <UtilBtn icon={isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
            label={isDone ? 'Done' : 'Complete'} onClick={handleMarkDone} active={isDone}
            activeCls="text-emerald-400 border-emerald-500/30 bg-emerald-500/10" />
          <UtilBtn icon={bookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <BookmarkPlus className="h-3.5 w-3.5" />}
            label="Save" onClick={toggleBookmark} active={bookmarked}
            activeCls="text-amber-400 border-amber-500/30 bg-amber-500/10" />
          <UtilBtn icon={<StickyNote className="h-3.5 w-3.5" />} label="Notes"
            onClick={() => setShowNotes(p => !p)} active={showNotes}
            activeCls="text-sky-400 border-sky-500/30 bg-sky-500/10" />
          <UtilBtn icon={<Focus className="h-3.5 w-3.5" />} label={focusMode ? 'Exit Focus' : 'Focus'}
            onClick={() => setFocusMode(p => !p)} active={focusMode}
            activeCls="text-purple-400 border-purple-500/30 bg-purple-500/10" />
        </div>
      </header>

      {/* ── FLOATING SPEECH PLAYER ─────────────────────────────────────── */}
      {listening && (
        <SpeechPlayer
          speech={speech}
          scrollContainerRef={scrollContainerRef}
          onClose={() => setListening(false)}
        />
      )}

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── LEFT SIDEBAR ────────────────────────────────────────────── */}
        {sidebarOpen && !focusMode && (
          <aside className="w-56 shrink-0 border-r border-white/[0.04] overflow-y-auto bg-slate-950/30 py-3 scroll-thin">
            {course?.modules?.map(mod => {
              const exp = expandedModules[mod.id];
              const modTopics = mod.topics || [];
              const modDone = modTopics.filter(t => completed.includes(t.slug)).length;
              return (
                <div key={mod.id} className="mb-0.5">
                  <button onClick={() => setExpandedModules(p => ({ ...p, [mod.id]: !p[mod.id] }))}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-white/[0.02] transition-colors cursor-pointer group">
                    {exp ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                    <span className="truncate flex-1 text-left">{mod.title}</span>
                    {modTopics.length > 0 && (
                      <span className="text-[9px] text-slate-600 group-hover:text-slate-400 font-mono shrink-0">{modDone}/{modTopics.length}</span>
                    )}
                  </button>
                  {exp && (
                    <div className="ml-4 border-l border-white/[0.04] pl-2 mb-2">
                      {modTopics.map(t => {
                        const active  = t.slug === topicSlug;
                        const doneT   = completed.includes(t.slug);
                        return (
                          <Link key={t.id} href={`/learn/${courseSlug}/${t.slug}`}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer mb-0.5 ${
                              active
                                ? 'bg-gradient-to-r from-purple-600/20 to-purple-600/5 text-purple-200 font-semibold border border-purple-500/20'
                                : 'text-slate-500 hover:text-white hover:bg-white/[0.02] border border-transparent'
                            }`}>
                            {doneT
                              ? <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                              : <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-purple-400 ring-2 ring-purple-400/20' : 'border border-slate-700'}`} />
                            }
                            <span className="truncate">{t.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </aside>
        )}

        {/* ── CENTER CONTENT ──────────────────────────────────────────── */}
        <main ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          <article className={`mx-auto py-10 px-6 lg:px-10 transition-all duration-300 ${focusMode ? 'max-w-[680px]' : 'max-w-[760px]'}`}>

            {/* Topic header */}
            <header className="mb-12 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span>{topic.module_id && course?.modules?.find(m => m.id === topic.module_id)?.title}</span>
                <span className="h-1 w-1 rounded-full bg-slate-700" />
                <Clock className="h-3 w-3" />
                <span>{readingMin} min read</span>
                {isDone && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Completed
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-[34px] font-extrabold text-white tracking-tight leading-[1.15]">
                {topic.title}
              </h1>

              {topic.description && (
                <p className="text-base text-slate-400 leading-[1.7] font-light max-w-[600px]">{topic.description}</p>
              )}
            </header>

            {/* Empty state */}
            {!hasAny && (
              <div className="text-center py-24 border border-dashed border-white/[0.06] rounded-3xl">
                <Sparkles className="h-10 w-10 mx-auto text-slate-700 mb-4" />
                <p className="text-base text-slate-400 font-light">This topic doesn't have content yet.</p>
                <p className="text-xs text-slate-600 mt-1">Check back soon or explore other topics.</p>
              </div>
            )}

            {/* Flow sections */}
            {FLOW_SECTIONS.map(section => {
              const elements = flow[section];
              if (!elements?.length) return null;
              const sm = SECTION_META[section];
              return (
                <section
                  key={section}
                  data-section={section}
                  ref={(el) => { sectionRefs.current[section] = el; }}
                  className="mb-16 scroll-mt-20"
                >
                  {/* Section heading */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-[10px] font-bold text-slate-700 font-mono">{sm.num}</span>
                      <h2 className={`text-xs font-extrabold uppercase tracking-[0.25em] ${sm.color}`}>{sm.label}</h2>
                      <span className="text-[10px] text-slate-600 font-light italic">— {sm.tagline}</span>
                    </div>
                    <div className={`h-px bg-gradient-to-r ${sm.bg.replace('from-', 'from-')} via-transparent to-transparent w-full`} />
                  </div>

                  {/* Elements */}
                  <div className="space-y-6">
                    {elements.map((el, i) => (
                      <div key={el.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                        <ContentRenderer element={el} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Mark done & bottom nav */}
            {hasAny && (
              <div className="mt-16 pt-8 border-t border-white/[0.05] space-y-6">
                <button onClick={handleMarkDone} disabled={isDone}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all border ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-default'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-purple-400/20 text-white shadow-[0_8px_30px_rgba(147,51,234,0.25)] cursor-pointer hover:scale-[1.01]'
                  }`}>
                  {isDone ? <><CheckCircle2 className="h-5 w-5" /> Topic Completed</> : <><CheckCircle2 className="h-5 w-5" /> Mark as Done</>}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  {prevTopic ? (
                    <Link href={`/learn/${courseSlug}/${prevTopic.slug}`}
                      className="group p-4 rounded-2xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer text-left">
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1.5">
                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
                        Previous
                      </div>
                      <div className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors line-clamp-2 leading-snug">{prevTopic.title}</div>
                    </Link>
                  ) : <div />}

                  {nextTopic ? (
                    <Link href={`/learn/${courseSlug}/${nextTopic.slug}`}
                      className="group p-4 rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/[0.05] to-transparent hover:border-purple-500/30 hover:from-purple-500/[0.1] transition-all cursor-pointer text-right">
                      <div className="flex items-center justify-end gap-1.5 text-[9px] text-purple-400 font-bold uppercase tracking-wider mb-1.5">
                        Next
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-2 leading-snug">{nextTopic.title}</div>
                    </Link>
                  ) : <div />}
                </div>
              </div>
            )}
          </article>
        </main>

        {/* ── RIGHT FLOATING SECTION NAV ──────────────────────────────── */}
        {!focusMode && hasAny && sectionsWithContent.length > 1 && (
          <nav className="hidden xl:flex flex-col gap-2 absolute right-6 top-1/2 -translate-y-1/2 z-20">
            {sectionsWithContent.map(s => {
              const sm = SECTION_META[s];
              const active = activeSection === s;
              return (
                <button key={s} onClick={() => scrollToSection(s)}
                  className="group flex items-center gap-2 cursor-pointer"
                  title={`Jump to ${sm.label}`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    active ? `${sm.color} opacity-100 translate-x-0` : 'opacity-0 -translate-x-2 text-slate-500 group-hover:opacity-60 group-hover:translate-x-0'
                  }`}>
                    {sm.label}
                  </span>
                  <span className={`h-1 rounded-full transition-all duration-300 ${
                    active ? `w-8 ${sm.dot} shadow-[0_0_10px_currentColor]` : 'w-4 bg-slate-700 group-hover:bg-slate-500 group-hover:w-6'
                  }`} />
                </button>
              );
            })}
          </nav>
        )}

        {/* ── NOTES DRAWER ────────────────────────────────────────────── */}
        {showNotes && (
          <aside className="w-72 shrink-0 border-l border-white/[0.04] flex flex-col bg-slate-950/50 backdrop-blur-xl animate-slide-in-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] shrink-0">
              <div className="flex items-center gap-2">
                <StickyNote className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-bold text-white">Personal Notes</span>
              </div>
              <button onClick={() => setShowNotes(false)} className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <textarea
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
              placeholder={`Notes for "${topic.title}"…\n\nTip: autosaves as you type.`}
              className="flex-1 p-4 resize-none bg-transparent text-[13px] text-slate-200 placeholder-slate-600 focus:outline-none leading-[1.7] font-light"
            />
            <div className="px-4 py-2.5 border-t border-white/[0.04] flex items-center gap-1.5 text-[9px] text-slate-700 shrink-0">
              <Check className="h-2.5 w-2.5" /> Autosaved to this device
            </div>
          </aside>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        :global(.animate-slide-up) { animation: slideUp 0.4s ease-out both; }
        :global(.animate-slide-in-right) { animation: slideInRight 0.25s ease-out both; }
        :global(.animate-fade-in) { animation: fadeIn 0.5s ease-out both; }
        :global(.scroll-thin)::-webkit-scrollbar { width: 4px; }
        :global(.scroll-thin)::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 4px; }
        :global(.scroll-thin)::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Utility button ─────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function UtilBtn({ icon, label, onClick, active, activeCls }: {
  icon: React.ReactNode; label: string; onClick: () => void; active?: boolean; activeCls?: string;
}) {
  return (
    <button onClick={onClick} title={label}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
        active && activeCls ? activeCls : 'border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.05] text-slate-400 hover:text-white'
      }`}>
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Content renderer ───────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function ContentRenderer({ element }: { element: ContentElement }) {
  switch (element.type) {
    case 'TEXT':           return <TextRenderer el={element} />;
    case 'CODE':           return <CodeRenderer el={element} />;
    case 'IMAGE':          return <ImageRenderer el={element} />;
    case 'VIDEO':          return <VideoRenderer el={element} />;
    case 'QUIZ':           return <QuizRenderer el={element} />;
    case 'CHALLENGE':      return <ChallengeRenderer el={element} />;
    case 'OUTPUT_PREVIEW': return <OutputPreviewRenderer el={element} />;
    case 'FLOW_DIAGRAM':   return <FlowDiagramRenderer el={element} />;
    case 'CALLOUT':        return <CalloutRenderer el={element} />;
    default:               return null;
  }
}

// ── TEXT ───────────────────────────────────────────────────────────────────
function TextRenderer({ el }: { el: TextElement }) {
  if (!el.content) return null;
  return (
    <div className="text-[15.5px] text-slate-200 leading-[1.85] font-light tracking-[-0.005em]"
      style={{ whiteSpace: 'pre-wrap', fontFamily: '"Inter", system-ui, sans-serif' }}>
      {el.content}
    </div>
  );
}

// ── CODE (macOS-style window) ──────────────────────────────────────────────
function CodeRenderer({ el }: { el: CodeElement }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(el.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const lines = (el.code || '').split('\n');

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a13] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </div>
          {el.title && <span className="text-[11px] text-slate-400 font-medium ml-2">{el.title}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/5 border border-emerald-500/15">
            {el.language}
          </span>
          <button onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/[0.05] text-slate-500 hover:text-white text-[10px] font-semibold transition-all cursor-pointer">
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className="overflow-x-auto">
        <pre className="text-[12.5px] text-slate-200 font-mono leading-[1.7] text-left p-4">
          {el.showLineNumbers ? (
            <code>
              {lines.map((ln, i) => (
                <div key={i} className="flex">
                  <span className="select-none w-8 text-right pr-4 text-slate-700 shrink-0">{i + 1}</span>
                  <span className="flex-1">{ln || ' '}</span>
                </div>
              ))}
            </code>
          ) : (
            <code>{el.code}</code>
          )}
        </pre>
      </div>
    </div>
  );
}

// ── IMAGE ──────────────────────────────────────────────────────────────────
function ImageRenderer({ el }: { el: ImageElement }) {
  if (!el.url) return null;
  return (
    <figure className="space-y-2.5">
      <img src={el.url} alt={el.alt || el.caption || ''}
        className="w-full rounded-2xl border border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]" />
      {el.caption && (
        <figcaption className="text-[12px] text-slate-500 text-center font-light italic">{el.caption}</figcaption>
      )}
    </figure>
  );
}

// ── VIDEO ──────────────────────────────────────────────────────────────────
function VideoRenderer({ el }: { el: VideoElement }) {
  if (!el.url) return null;
  const isYT = el.url.includes('youtube.com') || el.url.includes('youtu.be');
  if (isYT) {
    const id = el.url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
    if (id) return (
      <div className="space-y-2">
        {el.title && <p className="text-sm font-semibold text-slate-300">{el.title}</p>}
        <div className="relative pb-[56.25%] rounded-2xl overflow-hidden border border-white/[0.06] shadow-lg">
          <iframe src={`https://www.youtube.com/embed/${id}`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {el.title && <p className="text-sm font-semibold text-slate-300">{el.title}</p>}
      <video controls className="w-full rounded-2xl border border-white/[0.06]" src={el.url} />
    </div>
  );
}

// ── QUIZ (animated, immediate feedback) ────────────────────────────────────
function QuizRenderer({ el }: { el: QuizElement }) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = answered && selected === el.correct;

  return (
    <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.04] to-transparent p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">Quick Check</p>
        </div>
        {answered && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
            isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          } animate-fade-in`}>
            {isCorrect ? <><Check className="h-3 w-3" /> Correct!</> : <><X className="h-3 w-3" /> Not quite</>}
          </div>
        )}
      </div>

      <p className="text-[15px] font-semibold text-white leading-snug">{el.question}</p>

      <div className="space-y-2">
        {el.options.map((opt, i) => {
          const isThisCorrect = i === el.correct;
          const isSel = selected === i;
          let cls = 'border-white/[0.06] bg-white/[0.01] text-slate-300 hover:border-amber-500/30 hover:bg-amber-500/[0.03]';
          if (answered) {
            if (isThisCorrect) cls = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200 font-semibold scale-[1.01]';
            else if (isSel)    cls = 'border-rose-500/40 bg-rose-500/10 text-rose-300';
            else               cls = 'border-white/[0.03] bg-transparent text-slate-600';
          }
          return (
            <button key={i} disabled={answered} onClick={() => setSelected(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-[13px] transition-all cursor-pointer flex items-center justify-between ${cls}`}>
              <div className="flex items-center gap-3">
                <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold shrink-0 ${
                  answered
                    ? isThisCorrect ? 'bg-emerald-500/20 text-emerald-400'
                    : isSel ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-white/[0.02] text-slate-700'
                    : 'bg-white/[0.04] text-slate-400'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </div>
              {answered && isThisCorrect && <Check className="h-4 w-4 text-emerald-400 animate-fade-in" />}
              {answered && isSel && !isThisCorrect && <X className="h-4 w-4 text-rose-400 animate-fade-in" />}
            </button>
          );
        })}
      </div>

      {answered && el.explanation && (
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 animate-slide-up">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Lightbulb className="h-3 w-3 text-amber-400" /> Why
          </p>
          <p className="text-[13px] text-slate-300 leading-[1.7] font-light">{el.explanation}</p>
        </div>
      )}

      {answered && (
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-300 font-semibold cursor-pointer transition-colors">
          <RotateCcw className="h-3 w-3" /> Try again
        </button>
      )}
    </div>
  );
}

// ── CHALLENGE (progressive hint reveal) ────────────────────────────────────
function ChallengeRenderer({ el }: { el: ChallengeElement }) {
  const [showSolution, setShowSolution] = useState(false);
  const [revealed, setRevealed] = useState(0);

  return (
    <div className="rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/[0.04] to-transparent p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <ChevronsRight className="h-3.5 w-3.5 text-purple-400" />
        </div>
        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">Challenge</p>
      </div>

      <p className="text-[14px] text-slate-300 leading-[1.7] font-light" style={{ whiteSpace: 'pre-wrap' }}>
        {el.instructions}
      </p>

      {el.hints.length > 0 && (
        <div className="space-y-2 pt-1">
          {el.hints.slice(0, revealed).map((hint, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/15 animate-slide-up">
              <div className="h-5 w-5 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-amber-400">{i + 1}</span>
              </div>
              <p className="text-[13px] text-slate-300 leading-[1.6] font-light flex-1">{hint}</p>
            </div>
          ))}
          {revealed < el.hints.length && (
            <button onClick={() => setRevealed(p => p + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] hover:bg-amber-500/10 text-amber-400 text-[11px] font-semibold cursor-pointer transition-all">
              <Lightbulb className="h-3 w-3" /> Reveal hint <span className="text-amber-300/60">({revealed + 1}/{el.hints.length})</span>
            </button>
          )}
        </div>
      )}

      {el.expectedOutput && (
        <div className="pt-1">
          {showSolution ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-500/15">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="h-3 w-3" /> Solution
                </span>
                <button onClick={() => setShowSolution(false)} className="text-[10px] text-slate-500 hover:text-white cursor-pointer">Hide</button>
              </div>
              <pre className="p-4 text-[12px] text-slate-200 font-mono leading-relaxed overflow-x-auto text-left">{el.expectedOutput}</pre>
            </div>
          ) : (
            <button onClick={() => setShowSolution(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] hover:bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold cursor-pointer transition-all">
              <Eye className="h-3 w-3" /> Show solution
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── OUTPUT PREVIEW (split code/preview) ────────────────────────────────────
function OutputPreviewRenderer({ el }: { el: OutputPreviewElement }) {
  if (!el.html) return null;
  return (
    <div className="rounded-2xl border border-cyan-500/20 overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-cyan-500/15 bg-gradient-to-r from-cyan-500/[0.06] to-transparent">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_currentColor]" />
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em]">Live Output</span>
        </div>
        <span className="text-[9px] text-slate-500 font-mono">Rendered HTML</span>
      </div>
      <iframe srcDoc={el.html}
        className="w-full min-h-[160px] bg-white"
        sandbox="allow-scripts" title="Output preview" />
    </div>
  );
}

// ── FLOW DIAGRAM ───────────────────────────────────────────────────────────
function FlowDiagramRenderer({ el }: { el: FlowDiagramElement }) {
  if (!el.nodes.length) return null;
  return (
    <div className="rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/[0.04] to-transparent p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <ChevronsRight className="h-3.5 w-3.5 text-indigo-400" />
        </div>
        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Visual Flow</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {el.nodes.map((node, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
              <div className="px-3.5 py-2.5 rounded-xl border border-indigo-500/25 bg-gradient-to-b from-indigo-500/[0.08] to-indigo-500/[0.02] text-[12px] font-semibold text-indigo-200 text-center shadow-sm">
                {node.label}
              </div>
              {node.detail && (
                <span className="text-[10px] text-slate-500 text-center font-light leading-tight max-w-[110px]">{node.detail}</span>
              )}
            </div>
            {i < el.nodes.length - 1 && (
              <ChevronRight className="h-4 w-4 text-indigo-500/60 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── CALLOUT ────────────────────────────────────────────────────────────────
function CalloutRenderer({ el }: { el: CalloutElement }) {
  if (!el.content) return null;
  const variants = {
    info:    { icon: Info,          cls: 'border-sky-500/25 from-sky-500/[0.06]',         text: 'text-sky-400',     label: 'Note' },
    warning: { icon: AlertTriangle, cls: 'border-amber-500/25 from-amber-500/[0.06]',     text: 'text-amber-400',   label: 'Warning' },
    tip:     { icon: Lightbulb,     cls: 'border-emerald-500/25 from-emerald-500/[0.06]', text: 'text-emerald-400', label: 'Pro Tip' },
    danger:  { icon: AlertCircle,   cls: 'border-rose-500/25 from-rose-500/[0.06]',       text: 'text-rose-400',    label: 'Important' },
  };
  const v = variants[el.variant] || variants.info;
  const Icon = v.icon;
  return (
    <div className={`rounded-2xl border bg-gradient-to-br to-transparent p-5 flex gap-4 ${v.cls}`}>
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${v.text} bg-white/[0.02] border border-white/[0.04]`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-1.5 flex-1">
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${v.text}`}>{v.label}</p>
        <p className="text-[14px] text-slate-200 leading-[1.7] font-light" style={{ whiteSpace: 'pre-wrap' }}>{el.content}</p>
      </div>
    </div>
  );
}
