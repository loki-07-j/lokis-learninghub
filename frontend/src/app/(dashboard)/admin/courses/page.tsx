'use client';

import React, { useState, useEffect, useRef, DragEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  courseService, Course, Topic,
  FlowContent, FlowSection, ContentElement, ContentElementType, EMPTY_FLOW
} from '@/services/course';
import { toast } from 'sonner';
import {
  BookOpen, Plus, Trash2, ChevronDown, ChevronRight, Loader2,
  X, Upload, Download, Sparkles, FileText, Image as ImageIcon,
  Video, HelpCircle, Zap, Monitor, GitBranch, AlertCircle, Settings,
  LayoutGrid, Layers, Eye, EyeOff, Check, Info, AlertTriangle, Lightbulb,
  Type, Code2, GripVertical, Search, Edit3, CheckCircle2,
  Package, Archive, Copy, FileJson, CloudUpload, Cpu,
} from 'lucide-react';

const uid = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

// ── Element type metadata ──────────────────────────────────────────────────
const ELEM_META: Record<ContentElementType, { label: string; icon: any; color: string; ring: string; bg: string; sections: FlowSection[] }> = {
  TEXT:           { label: 'Text',     icon: Type,        color: 'text-slate-300',   ring: 'ring-slate-400/20',   bg: 'bg-slate-500/[0.04]',   sections: ['what','why','how','practice'] },
  CODE:           { label: 'Code',     icon: Code2,       color: 'text-emerald-400', ring: 'ring-emerald-500/20', bg: 'bg-emerald-500/[0.04]', sections: ['what','why','how','practice'] },
  IMAGE:          { label: 'Image',    icon: ImageIcon,   color: 'text-sky-400',     ring: 'ring-sky-500/20',     bg: 'bg-sky-500/[0.04]',     sections: ['what','why','how'] },
  VIDEO:          { label: 'Video',    icon: Video,       color: 'text-red-400',     ring: 'ring-red-500/20',     bg: 'bg-red-500/[0.04]',     sections: ['what','why','how'] },
  QUIZ:           { label: 'Quiz',     icon: HelpCircle,  color: 'text-amber-400',   ring: 'ring-amber-500/20',   bg: 'bg-amber-500/[0.04]',   sections: ['practice'] },
  CHALLENGE:      { label: 'Challenge',icon: Zap,         color: 'text-purple-400',  ring: 'ring-purple-500/20',  bg: 'bg-purple-500/[0.04]',  sections: ['practice'] },
  OUTPUT_PREVIEW: { label: 'Output',   icon: Monitor,     color: 'text-cyan-400',    ring: 'ring-cyan-500/20',    bg: 'bg-cyan-500/[0.04]',    sections: ['how'] },
  FLOW_DIAGRAM:   { label: 'Diagram',  icon: GitBranch,   color: 'text-indigo-400',  ring: 'ring-indigo-500/20',  bg: 'bg-indigo-500/[0.04]',  sections: ['what','why','how'] },
  CALLOUT:        { label: 'Callout',  icon: AlertCircle, color: 'text-yellow-400',  ring: 'ring-yellow-500/20',  bg: 'bg-yellow-500/[0.04]',  sections: ['what','why','how','practice'] },
};

const SECTION_META: Record<FlowSection, { label: string; tagline: string; color: string; border: string; bg: string; bar: string }> = {
  what:     { label: 'WHAT',     tagline: 'The concept',        color: 'text-sky-400',     border: 'border-sky-500/20',    bg: 'bg-sky-500/[0.03]',    bar: 'bg-sky-500' },
  why:      { label: 'WHY',      tagline: 'The motivation',     color: 'text-amber-400',   border: 'border-amber-500/20',  bg: 'bg-amber-500/[0.03]',  bar: 'bg-amber-500' },
  how:      { label: 'HOW',      tagline: 'The implementation', color: 'text-emerald-400', border: 'border-emerald-500/20',bg: 'bg-emerald-500/[0.03]',bar: 'bg-emerald-500' },
  practice: { label: 'PRACTICE', tagline: 'Test yourself',      color: 'text-purple-400',  border: 'border-purple-500/20', bg: 'bg-purple-500/[0.03]', bar: 'bg-purple-500' },
};

const FLOW_SECTIONS: FlowSection[] = ['what', 'why', 'how', 'practice'];

function createDefaultElement(type: ContentElementType): ContentElement {
  const id = uid();
  switch (type) {
    case 'TEXT':           return { id, type, content: '' };
    case 'CODE':           return { id, type, language: 'javascript', title: '', code: '', editable: false, runnable: false, showLineNumbers: true };
    case 'IMAGE':          return { id, type, url: '', caption: '', alt: '' };
    case 'VIDEO':          return { id, type, url: '', title: '' };
    case 'QUIZ':           return { id, type, question: '', options: ['', '', '', ''], correct: 0, explanation: '' };
    case 'CHALLENGE':      return { id, type, instructions: '', hints: [''], expectedOutput: '' };
    case 'OUTPUT_PREVIEW': return { id, type, html: '' };
    case 'FLOW_DIAGRAM':   return { id, type, nodes: [{ label: '', detail: '' }] };
    case 'CALLOUT':        return { id, type, variant: 'info', content: '' };
  }
}

function elementPreview(el: ContentElement): string {
  switch (el.type) {
    case 'TEXT':           return (el.content || '').slice(0, 60) || 'Empty text…';
    case 'CODE':           return el.title || `${el.language} • ${(el.code || '').split('\n').length} lines`;
    case 'IMAGE':          return el.caption || el.url || 'No URL';
    case 'VIDEO':          return el.title || el.url || 'No URL';
    case 'QUIZ':           return (el.question || '').slice(0, 60) || 'No question';
    case 'CHALLENGE':      return (el.instructions || '').slice(0, 60) || 'No instructions';
    case 'OUTPUT_PREVIEW': return el.html ? 'HTML preview' : 'Empty';
    case 'FLOW_DIAGRAM':   return `${el.nodes.length} node${el.nodes.length !== 1 ? 's' : ''}`;
    case 'CALLOUT':        return el.content.slice(0, 60) || `${el.variant} callout`;
  }
}

// ── Import types ───────────────────────────────────────────────────────────
interface ImportedTopic { title: string; slug?: string; description?: string; flow?: FlowContent }
interface ImportedModule { title: string; slug?: string; description?: string; topics?: ImportedTopic[] }
interface ImportedCourse { title: string; slug?: string; description?: string; modules?: ImportedModule[] }
interface ParsedImport {
  type: 'course' | 'flow';
  course?: ImportedCourse;
  flow?: FlowContent;
  stats: { modules: number; topics: number; elements: number };
}

function parseImportJSON(raw: string): ParsedImport | null {
  try {
    const data = JSON.parse(raw);
    if (data.course) {
      const c = data.course as ImportedCourse;
      const mods = c.modules || [];
      let topics = 0, elements = 0;
      mods.forEach(m => {
        const t = m.topics || [];
        topics += t.length;
        t.forEach(top => {
          const f = top.flow;
          if (f) elements += (f.what?.length||0)+(f.why?.length||0)+(f.how?.length||0)+(f.practice?.length||0);
        });
      });
      return { type: 'course', course: c, stats: { modules: mods.length, topics, elements } };
    }
    if (data.flow) {
      const f = data.flow as FlowContent;
      const elements = (f.what?.length||0)+(f.why?.length||0)+(f.how?.length||0)+(f.practice?.length||0);
      return { type: 'flow', flow: f, stats: { modules: 0, topics: 0, elements } };
    }
    return null;
  } catch { return null; }
}

type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved';

// ════════════════════════════════════════════════════════════════════════════
// ── Main ───────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
export default function AdminCoursesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role_code === 'SUPER_ADMIN' || user?.role_code === 'ADMIN';

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [flow, setFlow] = useState<FlowContent>(EMPTY_FLOW);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<FlowSection | null>(null);
  const [loading, setLoading] = useState(true);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');
  const topicIdRef = useRef<string | null>(null);
  topicIdRef.current = selectedTopicId;

  const [treeSearch, setTreeSearch] = useState('');
  const [dragData, setDragData] = useState<{ section: FlowSection; id: string } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState<string | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [saving2, setSaving2] = useState(false);

  // Root-level structure modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const selectedTopic: Topic | null = selectedCourse?.modules
    ?.flatMap(m => m.topics || [])
    .find(t => t.id === selectedTopicId) ?? null;

  const selectedElement: ContentElement | null = selectedElementId && selectedSection
    ? (flow[selectedSection] as ContentElement[]).find(e => e.id === selectedElementId) ?? null
    : null;

  // ── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => { if (isAdmin) fetchCourses(); /* eslint-disable-line */ }, [isAdmin]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setCourses(await courseService.getCourses());
    } catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  };

  const handleSelectCourse = async (course: Course) => {
    try {
      setLoading(true);
      const data = await courseService.getCourseDetails(course.slug);
      setSelectedCourse(data);
      setSelectedTopicId(null);
      setFlow(EMPTY_FLOW);
      lastSavedRef.current = JSON.stringify(EMPTY_FLOW);
      setSaveStatus('idle');
      if (data.modules?.[0]) setExpandedModules({ [data.modules[0].id]: true });
    } catch { toast.error('Failed to load course'); }
    finally { setLoading(false); }
  };

  const refreshCourse = async () => {
    if (!selectedCourse) return;
    const data = await courseService.getCourseDetails(selectedCourse.slug);
    setSelectedCourse(data);
    return data;
  };

  const handleSelectTopic = (topic: Topic) => {
    if (saveStatus === 'dirty') {
      if (!confirm('Discard unsaved changes?')) return;
    }
    setSelectedTopicId(topic.id);
    const fc = topic.flow_content as FlowContent | null;
    const newFlow = fc ? {
      what:     Array.isArray(fc.what)     ? fc.what     : [],
      why:      Array.isArray(fc.why)      ? fc.why      : [],
      how:      Array.isArray(fc.how)      ? fc.how      : [],
      practice: Array.isArray(fc.practice) ? fc.practice : [],
    } : EMPTY_FLOW;
    setFlow(newFlow);
    lastSavedRef.current = JSON.stringify(newFlow);
    setSaveStatus('idle');
    setSelectedElementId(null);
    setSelectedSection(null);
  };

  // ── Auto-save ─────────────────────────────────────────────────────────────
  const triggerSave = async (flowToSave: FlowContent) => {
    const tid = topicIdRef.current;
    if (!tid) return;
    try {
      setSaveStatus('saving');
      await courseService.updateTopicFlow(tid, flowToSave);
      lastSavedRef.current = JSON.stringify(flowToSave);
      setSaveStatus('saved');
      setSelectedCourse(prev => prev ? {
        ...prev,
        modules: prev.modules?.map(m => ({
          ...m,
          topics: m.topics?.map(t => t.id === tid ? { ...t, flow_content: flowToSave } : t)
        }))
      } : prev);
      setTimeout(() => setSaveStatus(s => s === 'saved' ? 'idle' : s), 1800);
    } catch {
      toast.error('Auto-save failed');
      setSaveStatus('dirty');
    }
  };

  const mutateFlow = (updater: (prev: FlowContent) => FlowContent) => {
    setFlow(prev => {
      const next = updater(prev);
      const ns = JSON.stringify(next);
      if (ns !== lastSavedRef.current) {
        setSaveStatus('dirty');
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => triggerSave(next), 1200);
      }
      return next;
    });
  };

  const handleSaveNow = () => {
    if (autoSaveTimerRef.current) { clearTimeout(autoSaveTimerRef.current); autoSaveTimerRef.current = null; }
    if (selectedTopicId) triggerSave(flow);
  };

  // ── Element actions ───────────────────────────────────────────────────────
  const addElement = (section: FlowSection, type: ContentElementType) => {
    const el = createDefaultElement(type);
    mutateFlow(prev => ({ ...prev, [section]: [...prev[section], el] }));
    setSelectedElementId(el.id);
    setSelectedSection(section);
  };

  const removeElement = (section: FlowSection, id: string) => {
    mutateFlow(prev => ({ ...prev, [section]: prev[section].filter(e => e.id !== id) }));
    if (selectedElementId === id) { setSelectedElementId(null); setSelectedSection(null); }
  };

  const updateElement = (section: FlowSection, id: string, updates: Partial<ContentElement>) => {
    mutateFlow(prev => ({
      ...prev,
      [section]: prev[section].map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const reorderElement = (section: FlowSection, fromId: string, toId: string) => {
    mutateFlow(prev => {
      const arr = [...prev[section]];
      const fromIdx = arr.findIndex(e => e.id === fromId);
      const toIdx = arr.findIndex(e => e.id === toId);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return prev;
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return { ...prev, [section]: arr };
    });
  };

  // ── Import handlers (flow-level, called from ImportModal) ─────────────────
  const handleFlowImport = (importedFlow: FlowContent) => {
    setFlow(importedFlow);
    setSaveStatus('dirty');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => triggerSave(importedFlow), 1000);
    setShowImportModal(false);
    toast.success('Flow imported into topic');
  };

  const handleCourseImportComplete = async () => {
    await fetchCourses();
    setShowImportModal(false);
    toast.success('Course structure imported successfully');
  };

  // ── Course / Module / Topic CRUD ──────────────────────────────────────────
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving2(true);
      const { course } = await courseService.createCourse({ title: newCourseTitle, description: newCourseDesc });
      toast.success('Course created');
      setCourses(prev => [course, ...prev]);
      setShowCourseModal(false);
      setNewCourseTitle(''); setNewCourseDesc('');
    } catch { toast.error('Failed to create course'); }
    finally { setSaving2(false); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Delete this course and ALL its content?')) return;
    try {
      await courseService.deleteCourse(id);
      toast.success('Course deleted');
      setCourses(prev => prev.filter(c => c.id !== id));
      if (selectedCourse?.id === id) { setSelectedCourse(null); setSelectedTopicId(null); }
    } catch { toast.error('Failed to delete course'); }
  };

  const handleTogglePublish = async () => {
    if (!selectedCourse) return;
    try {
      const { course } = await courseService.updateCourse(selectedCourse.id, { is_published: !selectedCourse.is_published });
      toast.success(course.is_published ? 'Published' : 'Unpublished');
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_published: course.is_published } : c));
      setSelectedCourse(prev => prev ? { ...prev, is_published: course.is_published } : prev);
    } catch { toast.error('Failed to update course'); }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      setSaving2(true);
      const sortOrder = (selectedCourse.modules?.length || 0) * 10 + 10;
      await courseService.createModule({ course_id: selectedCourse.id, title: newModuleTitle, sort_order: sortOrder, is_published: true });
      toast.success('Module created');
      setShowModuleModal(false); setNewModuleTitle('');
      const data = await refreshCourse();
      if (data?.modules) {
        const last = data.modules[data.modules.length - 1];
        if (last) setExpandedModules(prev => ({ ...prev, [last.id]: true }));
      }
    } catch { toast.error('Failed to create module'); }
    finally { setSaving2(false); }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Delete this module and all topics?')) return;
    try {
      await courseService.deleteModule(id);
      toast.success('Module deleted');
      await refreshCourse();
    } catch { toast.error('Failed to delete module'); }
  };

  const handleCreateTopic = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    const mod = selectedCourse?.modules?.find(m => m.id === moduleId);
    const sortOrder = (mod?.topics?.length || 0) * 10 + 10;
    try {
      setSaving2(true);
      await courseService.createTopic({ module_id: moduleId, title: newTopicTitle, sort_order: sortOrder, is_published: true });
      toast.success('Topic created');
      setShowTopicModal(null); setNewTopicTitle('');
      await refreshCourse();
    } catch { toast.error('Failed to create topic'); }
    finally { setSaving2(false); }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Delete topic and its flow?')) return;
    try {
      await courseService.deleteTopic(id);
      toast.success('Topic deleted');
      if (selectedTopicId === id) { setSelectedTopicId(null); setFlow(EMPTY_FLOW); }
      await refreshCourse();
    } catch { toast.error('Failed to delete topic'); }
  };

  // ── Access guard ──────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
        <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <BookOpen className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-400 font-light">Administrative privileges required.</p>
      </div>
    );
  }

  // ── Filter tree ───────────────────────────────────────────────────────────
  const filteredModules = selectedCourse?.modules?.filter(m => {
    if (!treeSearch.trim()) return true;
    const q = treeSearch.toLowerCase();
    if (m.title.toLowerCase().includes(q)) return true;
    return m.topics?.some(t => t.title.toLowerCase().includes(q));
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -mx-6 -my-6 overflow-hidden bg-[#030014]">

      {/* ══ TOP BAR ══════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-slate-950/60 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Brand — click to go back to root */}
          <button
            onClick={() => {
              if (saveStatus === 'dirty' && !confirm('Discard unsaved changes?')) return;
              setSelectedCourse(null);
              setSelectedTopicId(null);
              setFlow(EMPTY_FLOW);
              setSaveStatus('idle');
            }}
            className="flex items-center gap-2 shrink-0 group cursor-pointer"
            title="Back to Course Builder root"
          >
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center group-hover:border-purple-400/40 transition-colors">
              <Cpu className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight group-hover:text-purple-200 transition-colors">Course Builder</span>
          </button>

          {/* Breadcrumb */}
          {selectedCourse && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-700 shrink-0" />
              <button
                onClick={() => { setSelectedTopicId(null); setFlow(EMPTY_FLOW); setSaveStatus('idle'); }}
                className="text-xs text-purple-300 font-semibold truncate max-w-[160px] hover:text-purple-200 transition-colors cursor-pointer"
              >
                {selectedCourse.title}
              </button>
              {selectedTopic && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-700 shrink-0" />
                  <span className="text-xs text-slate-400 font-medium truncate max-w-[160px]">{selectedTopic.title}</span>
                </>
              )}
            </>
          )}

          {/* Auto-save indicator */}
          {selectedTopic && (
            <div className="ml-2 shrink-0 flex items-center gap-2">
              <SaveIndicator status={saveStatus} />
              {(saveStatus === 'dirty' || saveStatus === 'saving') && (
                <button
                  onClick={handleSaveNow}
                  disabled={saveStatus === 'saving'}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-[10px] font-bold text-purple-300 cursor-pointer transition-all disabled:opacity-50"
                >
                  Save now
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Root-level structure actions — always visible ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ToolBtn icon={<Upload className="h-3.5 w-3.5" />} label="Import" onClick={() => setShowImportModal(true)} />
          <ToolBtn icon={<Download className="h-3.5 w-3.5" />} label="Export" onClick={() => setShowExportModal(true)} />
          <ToolBtn
            icon={<Sparkles className="h-3.5 w-3.5" />} label="AI Generate"
            cls="border-purple-500/20 bg-purple-500/5 text-purple-400 opacity-60" title="Coming soon"
          />
          <ToolBtn
            icon={<Package className="h-3.5 w-3.5" />} label="Templates"
            cls="border-indigo-500/20 bg-indigo-500/5 text-indigo-400 opacity-60" title="Coming soon"
          />

          <div className="w-px h-4 bg-white/[0.06] mx-0.5" />

          {selectedCourse && (
            <>
              <button
                onClick={handleTogglePublish}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedCourse.is_published
                    ? 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400'
                    : 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {selectedCourse.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{selectedCourse.is_published ? 'Unpublish' : 'Publish'}</span>
              </button>
              <button
                onClick={() => handleDeleteCourse(selectedCourse.id)}
                className="p-1.5 rounded-lg border border-rose-500/15 bg-rose-500/[0.03] hover:bg-rose-500/10 text-rose-400 cursor-pointer transition-all"
                title="Delete course"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          <button
            onClick={() => setShowCourseModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-b from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white text-[11px] font-bold transition-all cursor-pointer border border-purple-400/30 shadow-md"
          >
            <Plus className="h-3.5 w-3.5" /> New Course
          </button>
        </div>
      </div>

      {/* ══ THREE PANELS ════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: STRUCTURE TREE ─────────────────────────────────────────── */}
        <aside className="w-64 shrink-0 border-r border-white/[0.04] flex flex-col overflow-hidden bg-slate-950/30">

          {/* Header */}
          <div className="px-3 py-2.5 border-b border-white/[0.04] shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <LayoutGrid className="h-3 w-3" /> Courses
              </span>
              <span className="text-[9px] text-slate-700 font-mono">{courses.length}</span>
            </div>
            {/* Search — only when a course is expanded */}
            {selectedCourse && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-600" />
                <input
                  value={treeSearch}
                  onChange={e => setTreeSearch(e.target.value)}
                  placeholder="Search topics…"
                  className="w-full pl-7 pr-2 py-1.5 text-[11px] rounded-lg bg-white/[0.02] border border-white/[0.05] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/30"
                />
              </div>
            )}
          </div>

          {/* Unified collapsible tree */}
          <div className="flex-1 overflow-y-auto px-2 py-2 scroll-thin">
            {loading && !courses.length ? (
              <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-purple-500" /></div>
            ) : (
              <div className="space-y-0.5">
                {courses.map(c => {
                  const isOpen = selectedCourse?.id === c.id;
                  return (
                    <div key={c.id}>
                      {/* ── Course row ── */}
                      <button
                          onClick={() => {
                          if (isOpen) {
                            setSelectedCourse(null);
                            setSelectedTopicId(null);
                            setFlow(EMPTY_FLOW);
                            setSaveStatus('idle');
                          } else {
                            handleSelectCourse(c);
                          }
                        }}
                        className={`w-full flex items-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          isOpen
                            ? 'bg-gradient-to-r from-purple-600/20 to-purple-600/5 text-purple-200 border border-purple-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                        }`}
                      >
                        {isOpen
                          ? <ChevronDown className="h-3 w-3 text-purple-400 shrink-0" />
                          : <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />}
                        <span className="truncate flex-1 text-left">{c.title}</span>
                        <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${c.is_published ? 'bg-emerald-400 shadow-[0_0_6px_currentColor]' : 'bg-amber-400'}`} />
                      </button>

                      {/* ── Modules + topics (expanded course) ── */}
                      {isOpen && selectedCourse && (
                        <div className="ml-3 border-l border-white/[0.04] pl-1.5 mt-0.5 mb-1 space-y-0.5">
                          {/* Add module */}
                          <div className="flex items-center justify-between px-1.5 py-1">
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                              <Layers className="h-2.5 w-2.5" /> Modules
                            </span>
                            <button
                              onClick={() => { setShowModuleModal(true); setNewModuleTitle(''); }}
                              className="p-0.5 rounded hover:bg-purple-500/10 text-slate-600 hover:text-purple-400 cursor-pointer transition-colors"
                              title="Add Module"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {!filteredModules?.length ? (
                            <p className="text-[10px] text-slate-600 italic text-center py-3">No modules</p>
                          ) : filteredModules.map((mod, mi) => {
                            const modOpen = expandedModules[mod.id] || !!treeSearch.trim();
                            const matched = treeSearch.trim()
                              ? mod.topics?.filter(t => t.title.toLowerCase().includes(treeSearch.toLowerCase())) || []
                              : mod.topics || [];
                            return (
                              <div key={mod.id}>
                                {/* Module row */}
                                <div
                                  className="flex items-center justify-between px-1.5 py-1.5 rounded-lg cursor-pointer hover:bg-white/[0.02] group"
                                  onClick={() => setExpandedModules(p => ({ ...p, [mod.id]: !p[mod.id] }))}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    {modOpen
                                      ? <ChevronDown className="h-3 w-3 text-purple-400 shrink-0" />
                                      : <ChevronRight className="h-3 w-3 text-slate-500 shrink-0" />}
                                    <span className="text-[9px] font-bold text-purple-400 shrink-0">M{mi + 1}</span>
                                    <span className="text-[11px] font-semibold text-slate-300 truncate">{mod.title}</span>
                                  </div>
                                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                                    <button
                                      onClick={e => { e.stopPropagation(); setShowTopicModal(mod.id); setNewTopicTitle(''); }}
                                      className="p-0.5 rounded hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-400 cursor-pointer"
                                      title="Add Topic"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={e => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                                      className="p-0.5 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 cursor-pointer"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Topics */}
                                {modOpen && (
                                  <div className="ml-3.5 border-l border-white/[0.04] pl-1.5 space-y-0.5 mb-0.5">
                                    {!matched.length ? (
                                      <p className="text-[9px] text-slate-600 italic py-1 px-1">No topics</p>
                                    ) : matched.map(topic => {
                                      const sel = selectedTopicId === topic.id;
                                      const hasFlow = !!(topic.flow_content as FlowContent | null);
                                      return (
                                        <div
                                          key={topic.id}
                                          onClick={() => handleSelectTopic(topic)}
                                          className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-all group ${
                                            sel
                                              ? 'bg-gradient-to-r from-purple-600/20 to-purple-600/5 text-purple-200 border border-purple-500/20'
                                              : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                                          }`}
                                        >
                                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hasFlow ? 'bg-emerald-400 shadow-[0_0_4px_currentColor]' : 'bg-slate-700'}`} />
                                            <span className="text-[11px] font-medium truncate">{topic.title}</span>
                                          </div>
                                          <button
                                            onClick={e => { e.stopPropagation(); handleDeleteTopic(topic.id); }}
                                            className="p-0.5 rounded hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <Trash2 className="h-2.5 w-2.5" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ── CENTER: MAIN CONTENT ─────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto scroll-thin">
          {!selectedCourse ? (
            <RootLanding
              courses={courses}
              onNewCourse={() => setShowCourseModal(true)}
              onImport={() => setShowImportModal(true)}
            />
          ) : !selectedTopic ? (
            <CourseDashboard course={selectedCourse} />
          ) : (
            <div className="p-6 space-y-5 max-w-3xl mx-auto">
              {/* Topic header — inline editable */}
              <InlineTopicHeader
                key={selectedTopic.id}
                topic={selectedTopic}
                onUpdated={refreshCourse}
              />

              {/* 4 sections */}
              {FLOW_SECTIONS.map(section => {
                const sm = SECTION_META[section];
                const elements = flow[section] as ContentElement[];
                const allowed = (Object.keys(ELEM_META) as ContentElementType[]).filter(t => ELEM_META[t].sections.includes(section));
                return (
                  <div key={section} className={`rounded-2xl border ${sm.border} ${sm.bg} overflow-hidden flex`}>
                    <div className={`w-1 shrink-0 ${sm.bar} opacity-70`} />
                    <div className="flex-1">
                      <div className={`flex items-center justify-between px-4 py-3 border-b ${sm.border}`}>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-xs font-extrabold uppercase tracking-[0.2em] ${sm.color}`}>{sm.label}</span>
                          <span className="text-[10px] text-slate-500 font-light italic">— {sm.tagline}</span>
                        </div>
                        <span className="text-[10px] text-slate-600 font-mono">{elements.length} element{elements.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {elements.map((el, idx) => (
                          <ElementCard
                            key={el.id}
                            element={el}
                            section={section}
                            index={idx}
                            isSelected={selectedElementId === el.id}
                            isDragging={dragData?.id === el.id}
                            isDragOver={dragOverId === el.id && dragData?.id !== el.id}
                            onSelect={() => {
                              const same = selectedElementId === el.id;
                              setSelectedElementId(same ? null : el.id);
                              setSelectedSection(same ? null : section);
                            }}
                            onUpdate={(updates) => updateElement(section, el.id, updates)}
                            onRemove={() => removeElement(section, el.id)}
                            onDragStart={() => setDragData({ section, id: el.id })}
                            onDragOver={() => setDragOverId(el.id)}
                            onDragEnd={() => { setDragData(null); setDragOverId(null); }}
                            onDrop={() => {
                              if (dragData && dragData.section === section && dragData.id !== el.id) {
                                reorderElement(section, dragData.id, el.id);
                              }
                              setDragData(null); setDragOverId(null);
                            }}
                          />
                        ))}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {allowed.map(type => {
                            const meta = ELEM_META[type];
                            const Icon = meta.icon;
                            return (
                              <button
                                key={type}
                                onClick={() => addElement(section, type)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.05] ${meta.color} text-[10px] font-semibold transition-all cursor-pointer hover:scale-[1.02]`}
                              >
                                <Plus className="h-3 w-3" /><Icon className="h-3 w-3" />{meta.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 pb-6 text-center">
                <p className="text-[10px] text-slate-700 font-light">Changes auto-save 1.2s after you stop editing</p>
              </div>
            </div>
          )}
        </main>

        {/* ── RIGHT: PROPERTIES PANEL ──────────────────────────────────────── */}
        <aside className="w-72 shrink-0 border-l border-white/[0.04] overflow-y-auto bg-slate-950/30 scroll-thin">
          {selectedElement && selectedSection ? (
            <PropertiesPanel
              element={selectedElement}
              onUpdate={(u) => updateElement(selectedSection, selectedElement.id, u)}
            />
          ) : selectedTopic ? (
            <div className="p-5">
              <p className="text-[10px] text-slate-500 font-medium mb-3 uppercase tracking-wider">Quick info</p>
              <div className="space-y-3 text-[11px]">
                <Stat label="Total elements" value={(flow.what.length + flow.why.length + flow.how.length + flow.practice.length).toString()} />
                <Stat label="WHAT"     value={flow.what.length.toString()}     color="text-sky-400" />
                <Stat label="WHY"      value={flow.why.length.toString()}      color="text-amber-400" />
                <Stat label="HOW"      value={flow.how.length.toString()}      color="text-emerald-400" />
                <Stat label="PRACTICE" value={flow.practice.length.toString()} color="text-purple-400" />
              </div>
              <div className="mt-5 pt-5 border-t border-white/[0.05]">
                <p className="text-[10px] text-slate-600 font-light leading-relaxed">
                  Click any element to edit its properties here. Drag the grip handle to reorder within a section.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-slate-700 p-6">
              <Settings className="h-8 w-8" />
              <p className="text-xs font-medium">Element settings<br />appear here</p>
            </div>
          )}
        </aside>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════════════════ */}
      {showCourseModal && (
        <Modal title="New Course" onClose={() => setShowCourseModal(false)}>
          <form onSubmit={handleCreateCourse} className="space-y-3">
            <Field label="Title" required>
              <input required value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)} className={inputCls} placeholder="e.g. HTML Fundamentals" autoFocus />
            </Field>
            <Field label="Description" required>
              <textarea required rows={3} value={newCourseDesc} onChange={e => setNewCourseDesc(e.target.value)} className={`${inputCls} resize-none`} placeholder="What does this course cover?" />
            </Field>
            <Submit saving={saving2}>Create Course</Submit>
          </form>
        </Modal>
      )}

      {showModuleModal && (
        <Modal title="Add Module" onClose={() => setShowModuleModal(false)}>
          <form onSubmit={handleCreateModule} className="space-y-3">
            <Field label="Module Title" required>
              <input required value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} className={inputCls} placeholder="e.g. HTML Images" autoFocus />
            </Field>
            <Submit saving={saving2}>Create Module</Submit>
          </form>
        </Modal>
      )}

      {showTopicModal && (
        <Modal title="Add Topic" onClose={() => setShowTopicModal(null)}>
          <form onSubmit={(e) => handleCreateTopic(e, showTopicModal)} className="space-y-3">
            <Field label="Topic Title" required>
              <input required value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)} className={inputCls} placeholder="e.g. IMG Tag" autoFocus />
            </Field>
            <Submit saving={saving2}>Create Topic</Submit>
          </form>
        </Modal>
      )}

      {showImportModal && (
        <ImportModal
          selectedTopic={selectedTopic}
          onClose={() => setShowImportModal(false)}
          onFlowImport={handleFlowImport}
          onCourseImport={handleCourseImportComplete}
        />
      )}

      {showExportModal && (
        <ExportModal
          selectedCourse={selectedCourse}
          selectedTopic={selectedTopic}
          flow={flow}
          onClose={() => setShowExportModal(false)}
        />
      )}

      <style jsx>{`
        :global(.scroll-thin)::-webkit-scrollbar { width: 4px; }
        :global(.scroll-thin)::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 4px; }
        :global(.scroll-thin)::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Root Landing (no course selected) ──────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function RootLanding({
  courses, onNewCourse, onImport
}: {
  courses: Course[];
  onNewCourse: () => void;
  onImport: () => void;
}) {
  const published = courses.filter(c => c.is_published).length;
  const drafts = courses.length - published;

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-12 max-w-2xl mx-auto space-y-8">

      {/* Stats strip */}
      {courses.length > 0 && (
        <div className="w-full flex gap-3">
          {[
            { label: 'Total Courses', value: courses.length, color: 'text-purple-400', bg: 'bg-purple-500/[0.06]', border: 'border-purple-500/15' },
            { label: 'Published',     value: published,      color: 'text-emerald-400', bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/15' },
            { label: 'Drafts',        value: drafts,         color: 'text-amber-400',   bg: 'bg-amber-500/[0.06]',  border: 'border-amber-500/15' },
          ].map(s => (
            <div key={s.label} className={`flex-1 rounded-2xl border ${s.border} ${s.bg} px-4 py-3 text-center`}>
              <div className={`text-xl font-extrabold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Call to action */}
      <div className="w-full text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-2">
          <ChevronRight className="h-3 w-3 text-purple-400 rotate-180" />
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Pick a course from the sidebar</span>
        </div>
        <p className="text-slate-600 text-xs font-light">or start something new below</p>
      </div>

      {/* Actions */}
      <div className="w-full grid grid-cols-2 gap-3">
        <button
          onClick={onNewCourse}
          className="flex items-center gap-3 p-4 rounded-2xl border border-purple-500/20 bg-purple-500/[0.05] hover:bg-purple-500/[0.1] transition-all cursor-pointer text-left group"
        >
          <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Plus className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">New Course</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Create from scratch</div>
          </div>
        </button>
        <button
          onClick={onImport}
          className="flex items-center gap-3 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.05] hover:bg-indigo-500/[0.1] transition-all cursor-pointer text-left group"
        >
          <div className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Upload className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Import JSON</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Full course structure</div>
          </div>
        </button>
      </div>

      {/* Hierarchy hint */}
      <div className="w-full rounded-2xl border border-white/[0.04] bg-white/[0.01] p-5">
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-3">Content hierarchy</p>
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          {[
            { label: 'Course', color: 'text-purple-400 border-purple-500/25 bg-purple-500/[0.06]' },
            { label: 'Module', color: 'text-indigo-400 border-indigo-500/25 bg-indigo-500/[0.06]' },
            { label: 'Topic',  color: 'text-sky-400    border-sky-500/25    bg-sky-500/[0.06]' },
            { label: 'WHAT',   color: 'text-sky-400    border-sky-500/20    bg-sky-500/[0.04]' },
            { label: 'WHY',    color: 'text-amber-400  border-amber-500/20  bg-amber-500/[0.04]' },
            { label: 'HOW',    color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.04]' },
            { label: 'PRACTICE', color: 'text-purple-400 border-purple-500/20 bg-purple-500/[0.04]' },
          ].map((n, i, arr) => (
            <React.Fragment key={n.label}>
              <span className={`px-2 py-0.5 rounded-lg border font-semibold ${n.color}`}>{n.label}</span>
              {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-slate-700 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Course Dashboard (course selected, no topic) ────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function CourseDashboard({ course }: { course: Course }) {
  const modules = course.modules || [];
  const totalTopics = modules.reduce((a, m) => a + (m.topics?.length || 0), 0);
  const topicsWithFlow = modules.flatMap(m => m.topics || []).filter(t => !!t.flow_content).length;
  const coveragePct = totalTopics > 0 ? Math.round((topicsWithFlow / totalTopics) * 100) : 0;

  return (
    <div className="p-7 max-w-2xl mx-auto space-y-6">

      {/* Course header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
            course.is_published
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
          }`}>
            {course.is_published ? 'Published' : 'Draft'}
          </span>
          <span className="text-[9px] text-slate-600 font-mono">{course.slug}</span>
        </div>
        <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">{course.title}</h1>
        <p className="text-xs text-slate-500 font-light leading-relaxed">{course.description}</p>
      </div>

      {/* Stats + coverage */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Modules',  value: modules.length,             color: 'text-purple-400' },
            { label: 'Topics',   value: totalTopics,                color: 'text-sky-400'    },
            { label: 'With content', value: topicsWithFlow,         color: 'text-emerald-400'},
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className={`text-2xl font-extrabold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[9px] text-slate-600 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Content coverage bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Content coverage</span>
            <span className={`font-bold font-mono ${coveragePct === 100 ? 'text-emerald-400' : coveragePct > 50 ? 'text-sky-400' : 'text-amber-400'}`}>
              {coveragePct}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                coveragePct === 100 ? 'bg-emerald-500' : coveragePct > 50 ? 'bg-sky-500' : 'bg-amber-500'
              }`}
              style={{ width: `${coveragePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Module summary — read-only overview, sidebar is for navigation */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Modules</p>

        {modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-white/[0.06] space-y-2">
            <Layers className="h-7 w-7 text-slate-700" />
            <p className="text-xs text-slate-600">No modules yet — use Import or add via sidebar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {modules.map((mod, mi) => {
              const modTopics = mod.topics || [];
              const modWithFlow = modTopics.filter(t => !!t.flow_content).length;
              const modPct = modTopics.length > 0 ? Math.round((modWithFlow / modTopics.length) * 100) : 0;
              return (
                <div key={mod.id} className="rounded-xl border border-white/[0.05] bg-white/[0.01] px-4 py-3 flex items-center gap-4">
                  {/* Index badge */}
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/15 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-extrabold text-purple-400">M{mi + 1}</span>
                  </div>

                  {/* Name + topic count */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{mod.title}</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">{modTopics.length} topic{modTopics.length !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Mini coverage bar */}
                  {modTopics.length > 0 && (
                    <div className="flex items-center gap-2 shrink-0 w-24">
                      <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className="h-full bg-emerald-500/70 rounded-full transition-all" style={{ width: `${modPct}%` }} />
                      </div>
                      <span className="text-[9px] text-slate-600 font-mono w-7 text-right">{modPct}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sidebar hint */}
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-white/[0.04] bg-white/[0.01]">
        <ChevronRight className="h-3.5 w-3.5 text-slate-600 rotate-180 shrink-0" />
        <p className="text-[10px] text-slate-600 leading-relaxed">
          Select a topic from the <span className="text-slate-400 font-semibold">sidebar</span> to open the content editor.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Import Modal ────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function ImportModal({
  selectedTopic,
  onClose,
  onFlowImport,
  onCourseImport,
}: {
  selectedTopic: Topic | null;
  onClose: () => void;
  onFlowImport: (flow: FlowContent) => void;
  onCourseImport: () => Promise<void>;
}) {
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [rawJson, setRawJson] = useState('');
  const [parsed, setParsed] = useState<ParsedImport | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleParse = (raw: string) => {
    if (!raw.trim()) { setParsed(null); setParseError(null); return; }
    const result = parseImportJSON(raw);
    if (result) { setParsed(result); setParseError(null); }
    else { setParsed(null); setParseError('Invalid format. Expected { course: {...} } or { flow: {...} }'); }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setRawJson(text);
      handleParse(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  };

  const handleImport = async () => {
    if (!parsed) return;
    setImporting(true);
    try {
      if (parsed.type === 'flow') {
        const f = parsed.flow!;
        onFlowImport({
          what:     Array.isArray(f.what)     ? f.what     : [],
          why:      Array.isArray(f.why)      ? f.why      : [],
          how:      Array.isArray(f.how)      ? f.how      : [],
          practice: Array.isArray(f.practice) ? f.practice : [],
        });
        return;
      }

      // Full course import
      const c = parsed.course!;
      setImportProgress(10);
      const { course: newCourse } = await courseService.createCourse({
        title: c.title,
        description: c.description || '',
      });
      setImportProgress(20);

      const mods = c.modules || [];
      for (let mi = 0; mi < mods.length; mi++) {
        const mod = mods[mi];
        const { module: newMod } = await courseService.createModule({
          course_id: newCourse.id,
          title: mod.title,
          sort_order: (mi + 1) * 10,
          is_published: true,
        });
        const topics = mod.topics || [];
        for (let ti = 0; ti < topics.length; ti++) {
          const top = topics[ti];
          const { topic: newTopic } = await courseService.createTopic({
            module_id: newMod.id,
            title: top.title,
            description: top.description,
            sort_order: (ti + 1) * 10,
            is_published: true,
          });
          if (top.flow) {
            await courseService.updateTopicFlow(newTopic.id, {
              what:     Array.isArray(top.flow.what)     ? top.flow.what     : [],
              why:      Array.isArray(top.flow.why)      ? top.flow.why      : [],
              how:      Array.isArray(top.flow.how)      ? top.flow.how      : [],
              practice: Array.isArray(top.flow.practice) ? top.flow.practice : [],
            });
          }
        }
        setImportProgress(20 + Math.round(((mi + 1) / mods.length) * 75));
      }
      setImportProgress(100);
      await onCourseImport();
    } catch {
      toast.error('Import failed. Check JSON structure and try again.');
      setImporting(false);
    }
  };

  const canImport = !!parsed && !importing && (parsed.type === 'course' || !!selectedTopic);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl p-[1px] bg-gradient-to-b from-purple-500/20 via-white/[0.03] to-indigo-500/20 shadow-2xl">
        <div className="flex flex-col min-h-0 bg-[#030014]/96 backdrop-blur-2xl rounded-3xl overflow-hidden">

          {/* Header — always visible */}
          <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Upload className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Import Structure</h3>
                <p className="text-[10px] text-slate-500">Course hierarchy or topic flow content</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white cursor-pointer transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-5 scroll-thin">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.04]">
              {[
                { id: 'upload', label: 'Upload File', icon: CloudUpload },
                { id: 'paste',  label: 'Paste JSON',  icon: FileJson },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    tab === t.id ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" />{t.label}
                </button>
              ))}
            </div>

            {/* Upload zone */}
            {tab === 'upload' && (
              <div
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragOver ? 'border-purple-500/60 bg-purple-500/10' : 'border-white/[0.08] hover:border-purple-500/30 hover:bg-white/[0.01]'
                }`}
              >
                <CloudUpload className={`h-8 w-8 transition-colors ${isDragOver ? 'text-purple-400' : 'text-slate-600'}`} />
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-400">Drop JSON file here</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">or click to browse</p>
                </div>
                {rawJson && <p className="text-[10px] text-emerald-400 font-semibold">File loaded ✓</p>}
                <input
                  ref={fileRef} type="file" accept=".json" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ''; }}
                />
              </div>
            )}

            {/* Paste zone */}
            {tab === 'paste' && (
              <textarea
                value={rawJson}
                onChange={e => { setRawJson(e.target.value); handleParse(e.target.value); }}
                className="w-full h-36 px-3 py-2.5 text-[11px] font-mono rounded-2xl bg-slate-900/60 border border-white/[0.06] text-slate-200 focus:outline-none focus:border-purple-500/30 resize-none placeholder-slate-700"
                placeholder={'{ "course": { "title": "My Course", "description": "...", "modules": [{ "title": "Module 1", "topics": [{ "title": "Topic 1", "flow": { "what": [], "why": [], "how": [], "practice": [] } }] }] } }'}
              />
            )}

            {/* Validation error */}
            {parseError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/[0.08] border border-rose-500/20">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-400">{parseError}</p>
              </div>
            )}

            {/* Preview */}
            {parsed && !parseError && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Valid JSON — Preview
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    parsed.type === 'course'
                      ? 'bg-purple-500/15 text-purple-400 border-purple-500/20'
                      : 'bg-sky-500/15 text-sky-400 border-sky-500/20'
                  }`}>
                    {parsed.type === 'course' ? 'Full Course Import' : 'Topic Flow Import'}
                  </span>
                </div>

                {/* Course preview tree */}
                {parsed.type === 'course' && parsed.course && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 space-y-2 max-h-48 overflow-y-auto scroll-thin">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span className="text-xs font-bold text-white">{parsed.course.title}</span>
                    </div>
                    {parsed.course.modules?.slice(0, 6).map((mod, mi) => (
                      <div key={mi} className="ml-4 border-l border-white/[0.06] pl-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <Layers className="h-3 w-3 text-indigo-400 shrink-0" />
                          <span className="text-[11px] font-semibold text-slate-300">{mod.title}</span>
                          <span className="text-[9px] text-slate-600 font-mono">{mod.topics?.length || 0} topics</span>
                        </div>
                        {mod.topics?.slice(0, 4).map((top, ti) => (
                          <div key={ti} className="ml-4 border-l border-white/[0.04] pl-3 flex items-center gap-2">
                            <FileText className="h-2.5 w-2.5 text-slate-600 shrink-0" />
                            <span className="text-[10px] text-slate-500">{top.title}</span>
                            {top.flow && <span className="text-[9px] text-emerald-500 shrink-0">• content</span>}
                          </div>
                        ))}
                        {(mod.topics?.length || 0) > 4 && (
                          <p className="ml-4 pl-3 text-[9px] text-slate-600">+{(mod.topics?.length || 0) - 4} more</p>
                        )}
                      </div>
                    ))}
                    {(parsed.course.modules?.length || 0) > 6 && (
                      <p className="ml-4 text-[9px] text-slate-600">+{(parsed.course.modules?.length || 0) - 6} more modules</p>
                    )}
                  </div>
                )}

                {/* Flow preview */}
                {parsed.type === 'flow' && parsed.flow && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                      {(Object.keys(SECTION_META) as FlowSection[]).map(s => {
                        const sm = SECTION_META[s];
                        const count = (parsed.flow?.[s] as any[])?.length || 0;
                        return (
                          <div key={s} className="text-center">
                            <div className={`text-[10px] font-bold ${sm.color}`}>{sm.label}</div>
                            <div className="text-xl font-mono font-extrabold text-white mt-0.5">{count}</div>
                            <div className="text-[9px] text-slate-600">elements</div>
                          </div>
                        );
                      })}
                    </div>
                    {!selectedTopic && (
                      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.05]">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <p className="text-[11px] text-amber-400">Select a topic in the sidebar first to import this flow.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-5 text-[10px] text-slate-500">
                  {parsed.type === 'course' && (
                    <>
                      <span><span className="text-white font-bold">{parsed.stats.modules}</span> modules</span>
                      <span><span className="text-white font-bold">{parsed.stats.topics}</span> topics</span>
                    </>
                  )}
                  <span><span className="text-white font-bold">{parsed.stats.elements}</span> content elements</span>
                </div>
              </div>
            )}

            {/* Import progress */}
            {importing && (
              <div className="space-y-2">
                <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 text-center">Building course structure… {importProgress}%</p>
              </div>
            )}

          </div>

          {/* Footer — always visible, never scrolls away */}
          <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-white/[0.05] bg-[#030014]/60">
            <button onClick={onClose} className="px-4 py-2 text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer transition-colors">
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!canImport}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-b from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white text-[11px] font-bold transition-all cursor-pointer border border-purple-400/30 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {importing ? 'Importing…' : parsed?.type === 'flow' ? 'Import Flow' : 'Import Course'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Export Modal ────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
const EXPORT_OPTIONS = [
  { id: 'full',     label: 'Full Course',         desc: 'All modules, topics, and content',         icon: BookOpen,  color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20'  },
  { id: 'template', label: 'Structure Template',  desc: 'Course skeleton without content (reuse)',   icon: Copy,      color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20'  },
  { id: 'topic',    label: 'Topic Flow',          desc: 'Current topic WHAT / WHY / HOW / PRACTICE', icon: FileText,  color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20'     },
  { id: 'backup',   label: 'Backup Export',       desc: 'Full export with metadata & timestamp',     icon: Archive,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
] as const;

type ExportType = typeof EXPORT_OPTIONS[number]['id'];

function ExportModal({
  selectedCourse, selectedTopic, flow, onClose,
}: {
  selectedCourse: Course | null;
  selectedTopic: Topic | null;
  flow: FlowContent;
  onClose: () => void;
}) {
  const [exportType, setExportType] = useState<ExportType>('full');

  const handleExport = () => {
    if (!selectedCourse && exportType !== 'topic') return;

    let data: object;
    let filename: string;

    if (exportType === 'full' || exportType === 'backup') {
      data = {
        course: {
          title: selectedCourse!.title,
          slug: selectedCourse!.slug,
          description: selectedCourse!.description,
          modules: selectedCourse!.modules?.map(m => ({
            title: m.title, slug: m.slug, description: m.description,
            topics: m.topics?.map(t => ({
              title: t.title, slug: t.slug, description: t.description,
              flow: (t.flow_content as FlowContent) || EMPTY_FLOW,
            })),
          })),
        },
        ...(exportType === 'backup' ? { _meta: { exportedAt: new Date().toISOString(), version: '2.0' } } : {}),
      };
      filename = `${selectedCourse!.slug}-${exportType}.json`;
    } else if (exportType === 'template') {
      data = {
        course: {
          title: selectedCourse!.title,
          description: selectedCourse!.description,
          modules: selectedCourse!.modules?.map(m => ({
            title: m.title,
            topics: m.topics?.map(t => ({ title: t.title, description: t.description })),
          })),
        },
      };
      filename = `${selectedCourse!.slug}-template.json`;
    } else {
      data = { flow: { what: flow.what, why: flow.why, how: flow.how, practice: flow.practice } };
      filename = `${selectedTopic?.slug || 'topic'}-flow.json`;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success('Export downloaded');
    onClose();
  };

  const canExport = exportType === 'topic' ? !!selectedTopic : !!selectedCourse;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-3xl p-[1px] bg-gradient-to-b from-emerald-500/20 via-white/[0.03] to-indigo-500/20 shadow-2xl">
        <div className="bg-[#030014]/96 backdrop-blur-2xl rounded-3xl overflow-hidden">

          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Download className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Export Structure</h3>
                <p className="text-[10px] text-slate-500">{selectedCourse?.title || 'Select a course to export'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white cursor-pointer transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Export Type</p>

            <div className="space-y-2">
              {EXPORT_OPTIONS.map(opt => {
                const disabled = opt.id === 'topic' ? !selectedTopic : !selectedCourse;
                return (
                  <button
                    key={opt.id}
                    onClick={() => !disabled && setExportType(opt.id)}
                    disabled={disabled}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      exportType === opt.id ? `${opt.bg} ${opt.border}` : 'border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.01]'
                    } ${disabled ? 'opacity-35 cursor-not-allowed' : ''}`}
                  >
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${exportType === opt.id ? `${opt.bg} ${opt.border}` : 'bg-white/[0.02] border-white/[0.04]'}`}>
                      <opt.icon className={`h-4 w-4 ${exportType === opt.id ? opt.color : 'text-slate-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${exportType === opt.id ? 'text-white' : 'text-slate-400'}`}>{opt.label}</p>
                      <p className={`text-[10px] ${exportType === opt.id ? 'text-slate-400' : 'text-slate-600'}`}>{opt.desc}</p>
                    </div>
                    {exportType === opt.id && <CheckCircle2 className={`h-4 w-4 ${opt.color} shrink-0`} />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
              <button onClick={onClose} className="px-4 py-2 text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer transition-colors">
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={!canExport}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-[11px] font-bold transition-all cursor-pointer border border-emerald-400/30 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="h-3.5 w-3.5" /> Download JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Save indicator ──────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle')   return null;
  if (status === 'dirty')  return <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> Unsaved</span>;
  if (status === 'saving') return <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold"><Loader2 className="h-2.5 w-2.5 animate-spin" /> Saving…</span>;
  if (status === 'saved')  return <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold"><CheckCircle2 className="h-2.5 w-2.5" /> Saved</span>;
  return null;
}

// ── Inline-editable topic header ───────────────────────────────────────────
function InlineTopicHeader({ topic, onUpdated }: { topic: Topic; onUpdated: () => Promise<any> }) {
  const [title, setTitle] = useState(topic.title);
  const [desc, setDesc]   = useState(topic.description || '');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc]   = useState(false);
  const [pub, setPub] = useState(topic.is_published);

  useEffect(() => {
    setTitle(topic.title);
    setDesc(topic.description || '');
    setPub(topic.is_published);
  }, [topic.id, topic.title, topic.description, topic.is_published]);

  const saveTitle = async () => {
    setEditingTitle(false);
    if (title === topic.title) return;
    try { await courseService.updateTopic(topic.id, { title }); await onUpdated(); toast.success('Title updated'); }
    catch { toast.error('Failed to update title'); setTitle(topic.title); }
  };

  const saveDesc = async () => {
    setEditingDesc(false);
    if (desc === (topic.description || '')) return;
    try { await courseService.updateTopic(topic.id, { description: desc }); await onUpdated(); toast.success('Description updated'); }
    catch { toast.error('Failed to update'); setDesc(topic.description || ''); }
  };

  const togglePub = async () => {
    const next = !pub;
    setPub(next);
    try { await courseService.updateTopic(topic.id, { is_published: next }); await onUpdated(); toast.success(next ? 'Published' : 'Unpublished'); }
    catch { toast.error('Failed to update'); setPub(!next); }
  };

  return (
    <div className="space-y-3 pb-3 border-b border-white/[0.05]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitle(topic.title); setEditingTitle(false); } }}
              className="w-full text-xl font-extrabold text-white tracking-tight bg-white/[0.02] border border-purple-500/30 rounded-lg px-2 py-1 -ml-2 focus:outline-none"
            />
          ) : (
            <h2 onClick={() => setEditingTitle(true)}
              className="group text-xl font-extrabold text-white tracking-tight cursor-text hover:bg-white/[0.02] -ml-2 px-2 py-1 rounded-lg transition-colors flex items-center gap-2">
              {topic.title}
              <Edit3 className="h-3 w-3 text-slate-700 group-hover:text-slate-400 transition-colors" />
            </h2>
          )}
          <p className="text-[10px] text-slate-600 font-mono ml-0 mt-0.5">slug: {topic.slug}</p>
        </div>
        <button onClick={togglePub}
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
            pub ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/25 bg-amber-500/10 text-amber-400'
          }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${pub ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          {pub ? 'Published' : 'Draft'}
        </button>
      </div>
      {editingDesc ? (
        <textarea autoFocus rows={2} value={desc} onChange={e => setDesc(e.target.value)}
          onBlur={saveDesc}
          onKeyDown={e => { if (e.key === 'Escape') { setDesc(topic.description || ''); setEditingDesc(false); } }}
          className="w-full text-xs text-slate-300 font-light leading-relaxed bg-white/[0.02] border border-purple-500/30 rounded-lg px-2.5 py-2 focus:outline-none resize-none"
          placeholder="Optional description…"
        />
      ) : (
        <p onClick={() => setEditingDesc(true)}
          className="text-xs text-slate-400 font-light leading-relaxed cursor-text hover:bg-white/[0.02] -mx-2 px-2 py-1.5 rounded-lg transition-colors">
          {desc || <span className="text-slate-700 italic">Click to add description…</span>}
        </p>
      )}
    </div>
  );
}

// ── Stat ────────────────────────────────────────────────────────────────────
function Stat({ label, value, color = 'text-slate-300' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}

// ── Modal helpers ───────────────────────────────────────────────────────────
const inputCls = 'w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/[0.05] text-white focus:outline-none focus:border-purple-500/40 transition-all';
const labelCls = 'text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl p-[1px] bg-gradient-to-b from-purple-500/20 via-white/[0.03] to-indigo-500/20 shadow-2xl">
        <div className="bg-[#030014]/90 backdrop-blur-2xl rounded-3xl p-5">
          <div className="flex justify-between items-center pb-3 border-b border-white/[0.05] mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}{required && <span className="text-rose-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

function Submit({ saving, children }: { saving: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={saving}
      className="w-full h-9 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl border border-purple-400/20 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5">
      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : children}
    </button>
  );
}

function ToolBtn({ icon, label, onClick, cls = '', title }: { icon: React.ReactNode; label: string; onClick?: () => void; cls?: string; title?: string }) {
  return (
    <button onClick={onClick} title={title}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
        cls || 'border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.05] text-slate-400 hover:text-white'
      }`}>
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Element card ────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
interface ElementCardProps {
  element: ContentElement; section: FlowSection; index: number;
  isSelected: boolean; isDragging: boolean; isDragOver: boolean;
  onSelect: () => void; onUpdate: (u: Partial<ContentElement>) => void; onRemove: () => void;
  onDragStart: () => void; onDragOver: () => void; onDragEnd: () => void; onDrop: () => void;
}

function ElementCard({ element, isSelected, isDragging, isDragOver, onSelect, onUpdate, onRemove, onDragStart, onDragOver, onDragEnd, onDrop }: ElementCardProps) {
  const meta = ELEM_META[element.type];
  const Icon = meta.icon;
  const preview = elementPreview(element);

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(); }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; onDragOver(); }}
      onDragLeave={() => {}}
      onDragEnd={onDragEnd}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
      className={`rounded-xl border transition-all overflow-hidden bg-slate-950/30 ${
        isDragging ? 'opacity-30 scale-[0.98]' : ''
      } ${
        isDragOver ? 'border-purple-500/50 ring-2 ring-purple-500/20 -translate-y-0.5' : ''
      } ${
        isSelected ? `border-purple-500/30 ring-1 ${meta.ring}` : 'border-white/[0.04] hover:border-white/[0.08]'
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white/[0.01]" onClick={onSelect}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="cursor-grab active:cursor-grabbing text-slate-700 hover:text-slate-400 shrink-0" onClick={e => e.stopPropagation()}>
            <GripVertical className="h-3.5 w-3.5" />
          </span>
          <div className={`h-6 w-6 rounded-lg ${meta.bg} border border-white/[0.05] flex items-center justify-center shrink-0`}>
            <Icon className={`h-3 w-3 ${meta.color}`} />
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wide ${meta.color} shrink-0`}>{meta.label}</span>
          {preview && <span className="text-[10px] text-slate-600 truncate font-light max-w-[200px]">— {preview}</span>}
        </div>
        <button onClick={e => { e.stopPropagation(); onRemove(); }}
          className="p-1 rounded hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 cursor-pointer">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      {isSelected && (
        <div className="border-t border-white/[0.04] p-3">
          <ElementEditor element={element} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Element editor ──────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function ElementEditor({ element, onUpdate }: { element: ContentElement; onUpdate: (u: Partial<ContentElement>) => void }) {
  const ta = `${inputCls} resize-none font-mono text-[11px] leading-relaxed`;

  switch (element.type) {
    case 'TEXT':
      return <textarea rows={5} className={ta} value={element.content}
        onChange={e => onUpdate({ content: e.target.value } as any)} placeholder="Write your explanation here…" />;

    case 'CODE':
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelCls}>Title</label>
              <input className={inputCls} value={element.title}
                onChange={e => onUpdate({ title: e.target.value } as any)} placeholder="e.g. Basic IMG syntax" />
            </div>
            <div className="w-28">
              <label className={labelCls}>Language</label>
              <select className={inputCls} value={element.language}
                onChange={e => onUpdate({ language: e.target.value } as any)}>
                {['html','css','javascript','typescript','python','sql','bash','json','xml'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <textarea rows={6} className={ta} value={element.code}
            onChange={e => onUpdate({ code: e.target.value } as any)} placeholder="// code here…" />
        </div>
      );

    case 'IMAGE':
      return (
        <div className="space-y-2">
          <div><label className={labelCls}>URL</label><input className={inputCls} value={element.url} onChange={e => onUpdate({ url: e.target.value } as any)} placeholder="https://…" /></div>
          <div><label className={labelCls}>Caption</label><input className={inputCls} value={element.caption || ''} onChange={e => onUpdate({ caption: e.target.value } as any)} /></div>
          <div><label className={labelCls}>Alt text</label><input className={inputCls} value={element.alt || ''} onChange={e => onUpdate({ alt: e.target.value } as any)} /></div>
        </div>
      );

    case 'VIDEO':
      return (
        <div className="space-y-2">
          <div><label className={labelCls}>URL</label><input className={inputCls} value={element.url} onChange={e => onUpdate({ url: e.target.value } as any)} placeholder="https://youtube.com/…" /></div>
          <div><label className={labelCls}>Title</label><input className={inputCls} value={element.title || ''} onChange={e => onUpdate({ title: e.target.value } as any)} /></div>
        </div>
      );

    case 'QUIZ':
      return (
        <div className="space-y-2">
          <div><label className={labelCls}>Question</label><textarea rows={2} className={ta} value={element.question} onChange={e => onUpdate({ question: e.target.value } as any)} /></div>
          <div>
            <label className={labelCls}>Options (click ○ to mark correct)</label>
            {element.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <button onClick={() => onUpdate({ correct: i } as any)}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                    element.correct === i ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-white/[0.08] text-slate-600 hover:border-emerald-500/20'
                  }`}>
                  {element.correct === i && <Check className="h-2.5 w-2.5" />}
                </button>
                <input className={inputCls} value={opt}
                  onChange={e => { const opts = [...element.options]; opts[i] = e.target.value; onUpdate({ options: opts } as any); }}
                  placeholder={`Option ${i + 1}`} />
                <button onClick={() => {
                  const opts = element.options.filter((_, j) => j !== i);
                  onUpdate({ options: opts, correct: Math.min(element.correct, opts.length - 1) } as any);
                }} className="p-0.5 text-slate-600 hover:text-rose-400 cursor-pointer"><X className="h-3 w-3" /></button>
              </div>
            ))}
            <button onClick={() => onUpdate({ options: [...element.options, ''] } as any)}
              className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer flex items-center gap-1">
              <Plus className="h-3 w-3" /> Add option
            </button>
          </div>
          <div><label className={labelCls}>Explanation</label><textarea rows={2} className={ta} value={element.explanation || ''} onChange={e => onUpdate({ explanation: e.target.value } as any)} /></div>
        </div>
      );

    case 'CHALLENGE':
      return (
        <div className="space-y-2">
          <div><label className={labelCls}>Instructions</label><textarea rows={3} className={ta} value={element.instructions} onChange={e => onUpdate({ instructions: e.target.value } as any)} /></div>
          <div>
            <label className={labelCls}>Hints</label>
            {element.hints.map((hint, i) => (
              <div key={i} className="flex gap-2 mb-1.5">
                <input className={inputCls} value={hint}
                  onChange={e => { const hints = [...element.hints]; hints[i] = e.target.value; onUpdate({ hints } as any); }}
                  placeholder={`Hint ${i + 1}`} />
                <button onClick={() => onUpdate({ hints: element.hints.filter((_, j) => j !== i) } as any)}
                  className="p-0.5 text-slate-600 hover:text-rose-400 cursor-pointer"><X className="h-3 w-3" /></button>
              </div>
            ))}
            <button onClick={() => onUpdate({ hints: [...element.hints, ''] } as any)}
              className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer flex items-center gap-1">
              <Plus className="h-3 w-3" /> Add hint
            </button>
          </div>
          <div><label className={labelCls}>Expected Output / Solution</label><textarea rows={3} className={`${ta} text-[10px]`} value={element.expectedOutput || ''} onChange={e => onUpdate({ expectedOutput: e.target.value } as any)} /></div>
        </div>
      );

    case 'OUTPUT_PREVIEW':
      return <div><label className={labelCls}>HTML</label><textarea rows={5} className={ta} value={element.html} onChange={e => onUpdate({ html: e.target.value } as any)} placeholder="<div>preview html</div>" /></div>;

    case 'FLOW_DIAGRAM':
      return (
        <div className="space-y-2">
          <label className={labelCls}>Nodes</label>
          {element.nodes.map((node, i) => (
            <div key={i} className="flex gap-2 mb-1.5 items-start">
              <div className="flex-1 space-y-1">
                <input className={inputCls} value={node.label}
                  onChange={e => { const nodes = [...element.nodes]; nodes[i] = { ...nodes[i], label: e.target.value }; onUpdate({ nodes } as any); }}
                  placeholder="Node label" />
                <input className={inputCls} value={node.detail || ''}
                  onChange={e => { const nodes = [...element.nodes]; nodes[i] = { ...nodes[i], detail: e.target.value }; onUpdate({ nodes } as any); }}
                  placeholder="Detail (optional)" />
              </div>
              <button onClick={() => onUpdate({ nodes: element.nodes.filter((_, j) => j !== i) } as any)}
                className="p-0.5 text-slate-600 hover:text-rose-400 cursor-pointer mt-1"><X className="h-3 w-3" /></button>
            </div>
          ))}
          <button onClick={() => onUpdate({ nodes: [...element.nodes, { label: '', detail: '' }] } as any)}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1">
            <Plus className="h-3 w-3" /> Add node
          </button>
        </div>
      );

    case 'CALLOUT':
      return (
        <div className="space-y-2">
          <div>
            <label className={labelCls}>Variant</label>
            <div className="flex gap-2">
              {(['info','warning','tip','danger'] as const).map(v => (
                <button key={v} onClick={() => onUpdate({ variant: v } as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize cursor-pointer border transition-all ${
                    element.variant === v
                      ? v === 'info'    ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                      : v === 'warning' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : v === 'tip'     ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      : 'border-white/[0.05] text-slate-500 hover:border-white/[0.1]'
                  }`}>{v}</button>
              ))}
            </div>
          </div>
          <div><label className={labelCls}>Content</label><textarea rows={3} className={ta} value={element.content} onChange={e => onUpdate({ content: e.target.value } as any)} /></div>
        </div>
      );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ── Properties Panel ────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function PropertiesPanel({ element, onUpdate }: { element: ContentElement; onUpdate: (u: Partial<ContentElement>) => void }) {
  const meta = ELEM_META[element.type];
  const Icon = meta.icon;

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-white/[0.05]">
        <div className={`h-7 w-7 rounded-lg ${meta.bg} border border-white/[0.05] flex items-center justify-center`}>
          <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
        </div>
        <div>
          <span className={`text-xs font-bold ${meta.color}`}>{meta.label}</span>
          <p className="text-[9px] text-slate-700 font-mono mt-0.5">{element.id}</p>
        </div>
      </div>

      {element.type === 'CODE' && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Code Settings</p>
          <div>
            <label className={labelCls}>Language</label>
            <select className={inputCls} value={element.language}
              onChange={e => onUpdate({ language: e.target.value } as any)}>
              {['html','css','javascript','typescript','python','sql','bash','json','xml'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          {(['editable','runnable','showLineNumbers'] as const).map(key => (
            <label key={key} className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
              <span className="capitalize text-[11px] text-slate-300">{key.replace(/([A-Z])/g, ' $1')}</span>
              <input type="checkbox" checked={!!(element as any)[key]}
                onChange={e => onUpdate({ [key]: e.target.checked } as any)}
                className="h-3.5 w-3.5 rounded border-white/[0.1] bg-slate-900 text-purple-600 cursor-pointer" />
            </label>
          ))}
        </div>
      )}

      {element.type === 'CALLOUT' && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Callout Variant</p>
          <div className="grid grid-cols-2 gap-1.5">
            {([
              { v: 'info' as const,    icon: Info,          cls: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
              { v: 'warning' as const, icon: AlertTriangle, cls: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
              { v: 'tip' as const,     icon: Lightbulb,     cls: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
              { v: 'danger' as const,  icon: AlertCircle,   cls: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
            ]).map(({ v, icon: VIcon, cls }) => (
              <button key={v} onClick={() => onUpdate({ variant: v } as any)}
                className={`flex items-center justify-center gap-1 p-2 rounded-xl border text-[10px] font-bold cursor-pointer capitalize transition-all ${
                  element.variant === v ? cls : 'border-white/[0.05] text-slate-600 hover:border-white/[0.1]'
                }`}>
                <VIcon className="h-3 w-3" />{v}
              </button>
            ))}
          </div>
        </div>
      )}

      {!['CODE', 'CALLOUT'].includes(element.type) && (
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Edit content directly in the center panel. This element has no extra settings.
          </p>
        </div>
      )}
    </div>
  );
}
