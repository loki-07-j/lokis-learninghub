'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { courseService, Course, Module, Topic } from '@/services/course';
import { practiceService, PracticeQuestion, QuestionType, ThinkingType, DifficultyLevel } from '@/services/practice';
import { toast } from 'sonner';
import {
  Brain,
  Plus,
  Trash2,
  Edit3,
  ChevronRight,
  ChevronDown,
  Save,
  X,
  BookOpen,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Upload,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ============================================================
// Constants
// ============================================================

const QUESTION_TYPES: QuestionType[] = [
  'MCQ', 'MULTI_SELECT', 'DEBUG_BASED', 'OUTPUT_PREDICTION',
  'SCENARIO_ANALYSIS', 'ARCHITECTURE_REASONING', 'PROBLEM_SOLVING',
  'CODE_COMPLETION', 'FLOW_SEQUENCING',
];

const THINKING_TYPES: ThinkingType[] = [
  'LOGIC', 'DEBUGGING', 'PERFORMANCE', 'ARCHITECTURE', 'SECURITY', 'REAL_WORLD', 'INTERVIEW',
];

const DIFFICULTY_LEVELS: DifficultyLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

const BLANK_FORM = {
  question_type: 'MCQ' as QuestionType,
  thinking_type: 'LOGIC' as ThinkingType,
  difficulty_level: 'BEGINNER' as DifficultyLevel,
  title: '',
  question_text: '',
  scenario_context: '',
  explanation: '',
  visual_reference: '',
  complexity_score: 2,
  estimated_time: 300,
  correct_answer_raw: '',   // JSON string for correct_answer
  options_raw: '',          // JSON string for options_json
  expected_reasoning_raw: '',
};

type FormState = typeof BLANK_FORM;

// ============================================================
// Options hint text per question type
// ============================================================

function optionsHint(type: QuestionType): string {
  switch (type) {
    case 'MCQ':
    case 'MULTI_SELECT':
      return '{"options":[{"id":"a","text":"Option A"},{"id":"b","text":"Option B"}]}';
    case 'FLOW_SEQUENCING':
      return '{"items":[{"id":"1","text":"Step 1"},{"id":"2","text":"Step 2"}]}';
    case 'CODE_COMPLETION':
      return '{"template":"function greet(name) { // complete here }"}';
    case 'DEBUG_BASED':
      return '{"scenario":"const x = []\\nx[0].name // bug here"}';
    case 'OUTPUT_PREDICTION':
      return '{"hint":"Think about scope and closures"}';
    default:
      return 'Leave blank if not applicable';
  }
}

function correctAnswerHint(type: QuestionType): string {
  switch (type) {
    case 'MCQ':            return '"a"  (option id string)';
    case 'MULTI_SELECT':   return '["a","c"]  (array of option ids)';
    case 'FLOW_SEQUENCING': return '["1","3","2"]  (ordered ids)';
    default:               return '"expected answer text or explanation"';
  }
}

// ============================================================
// Question Form Modal
// ============================================================

function QuestionFormModal({
  topicId,
  editing,
  onSave,
  onClose,
}: {
  topicId: string;
  editing: PracticeQuestion | null;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => {
    if (editing) {
      return {
        question_type: editing.question_type,
        thinking_type: editing.thinking_type,
        difficulty_level: editing.difficulty_level,
        title: editing.title,
        question_text: editing.question_text,
        scenario_context: editing.scenario_context || '',
        explanation: editing.explanation,
        visual_reference: editing.visual_reference || '',
        complexity_score: editing.complexity_score,
        estimated_time: editing.estimated_time,
        correct_answer_raw: JSON.stringify(editing.correct_answer),
        options_raw: editing.options_json ? JSON.stringify(editing.options_json) : '',
        expected_reasoning_raw: editing.expected_reasoning ? JSON.stringify(editing.expected_reasoning) : '',
      };
    }
    return { ...BLANK_FORM };
  });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof FormState, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.question_text.trim() || !form.explanation.trim() || !form.correct_answer_raw.trim()) {
      toast.error('Title, question text, explanation, and correct answer are required');
      return;
    }

    let correct_answer: any;
    let options_json: any = undefined;
    let expected_reasoning: any = undefined;

    try {
      correct_answer = JSON.parse(form.correct_answer_raw);
    } catch {
      toast.error('Correct Answer must be valid JSON');
      return;
    }
    if (form.options_raw.trim()) {
      try {
        options_json = JSON.parse(form.options_raw);
      } catch {
        toast.error('Options JSON must be valid JSON');
        return;
      }
    }
    if (form.expected_reasoning_raw.trim()) {
      try {
        expected_reasoning = JSON.parse(form.expected_reasoning_raw);
      } catch {
        toast.error('Expected Reasoning must be valid JSON');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Partial<PracticeQuestion> = {
        topic_id: topicId,
        question_type: form.question_type,
        thinking_type: form.thinking_type,
        difficulty_level: form.difficulty_level,
        title: form.title.trim(),
        question_text: form.question_text.trim(),
        scenario_context: form.scenario_context.trim() || undefined,
        explanation: form.explanation.trim(),
        visual_reference: form.visual_reference.trim() || undefined,
        complexity_score: form.complexity_score,
        estimated_time: form.estimated_time,
        correct_answer,
        options_json: options_json || undefined,
        expected_reasoning: expected_reasoning || undefined,
      } as any;

      if (editing) {
        await practiceService.adminUpdateQuestion(editing.id, payload);
        toast.success('Question updated');
      } else {
        await practiceService.adminCreateQuestion(payload);
        toast.success('Question created');
      }
      onSave();
      onClose();
    } catch {
      toast.error('Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full bg-slate-900/60 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors';
  const labelClass = 'block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-[1px] bg-gradient-to-b from-purple-500/20 via-white/[0.03] to-indigo-500/20 shadow-2xl">
        <Card className="border-none bg-[#030014]/95 backdrop-blur-2xl rounded-3xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-white/[0.05] mb-5">
            <div>
              <h3 className="text-sm font-bold text-white">{editing ? 'Edit Question' : 'New Practice Question'}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Fill all required fields. Correct Answer & Options use JSON format.</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Row 1: type selectors */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Question Type</label>
                <select value={form.question_type} onChange={(e) => set('question_type', e.target.value)} className={inputClass}>
                  {QUESTION_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Thinking Type</label>
                <select value={form.thinking_type} onChange={(e) => set('thinking_type', e.target.value)} className={inputClass}>
                  {THINKING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Difficulty</label>
                <select value={form.difficulty_level} onChange={(e) => set('difficulty_level', e.target.value)} className={inputClass}>
                  {DIFFICULTY_LEVELS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className={labelClass}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Short descriptive title"
                className={inputClass}
              />
            </div>

            {/* Question Text */}
            <div>
              <label className={labelClass}>Question Text *</label>
              <textarea
                value={form.question_text}
                onChange={(e) => set('question_text', e.target.value)}
                placeholder="The full question or prompt shown to the student..."
                className={`${inputClass} min-h-20`}
              />
            </div>

            {/* Scenario Context */}
            <div>
              <label className={labelClass}>Scenario Context (optional)</label>
              <textarea
                value={form.scenario_context}
                onChange={(e) => set('scenario_context', e.target.value)}
                placeholder="Real-world setup or context for scenario/architecture questions..."
                className={`${inputClass} min-h-16`}
              />
            </div>

            {/* Options JSON */}
            <div>
              <label className={labelClass}>
                Options JSON <span className="text-slate-600 normal-case font-normal">(for MCQ / Multi-Select / Flow / etc.)</span>
              </label>
              <textarea
                value={form.options_raw}
                onChange={(e) => set('options_raw', e.target.value)}
                placeholder={optionsHint(form.question_type)}
                className={`${inputClass} min-h-16 font-mono`}
              />
            </div>

            {/* Correct Answer */}
            <div>
              <label className={labelClass}>
                Correct Answer * <span className="text-slate-600 normal-case font-normal">— {correctAnswerHint(form.question_type)}</span>
              </label>
              <textarea
                value={form.correct_answer_raw}
                onChange={(e) => set('correct_answer_raw', e.target.value)}
                placeholder='Enter valid JSON e.g. "a" or ["a","c"] or "expected output"'
                className={`${inputClass} min-h-12 font-mono`}
              />
            </div>

            {/* Expected Reasoning */}
            <div>
              <label className={labelClass}>Expected Reasoning JSON (optional)</label>
              <textarea
                value={form.expected_reasoning_raw}
                onChange={(e) => set('expected_reasoning_raw', e.target.value)}
                placeholder='"Walk through X then Y, checking edge case Z..."'
                className={`${inputClass} min-h-12 font-mono`}
              />
            </div>

            {/* Explanation */}
            <div>
              <label className={labelClass}>Explanation (shown after answer) *</label>
              <textarea
                value={form.explanation}
                onChange={(e) => set('explanation', e.target.value)}
                placeholder="Full explanation of the correct answer and reasoning..."
                className={`${inputClass} min-h-20`}
              />
            </div>

            {/* Row: meta */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Complexity (1-5)</label>
                <input type="number" min={1} max={5} value={form.complexity_score}
                  onChange={(e) => set('complexity_score', parseInt(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Est. Time (secs)</label>
                <input type="number" min={30} value={form.estimated_time}
                  onChange={(e) => set('estimated_time', parseInt(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Visual Reference URL</label>
                <input type="text" value={form.visual_reference}
                  onChange={(e) => set('visual_reference', e.target.value)}
                  placeholder="https://..." className={inputClass} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-white/[0.05]">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-xs font-bold py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {editing ? 'Save Changes' : 'Create Question'}
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="px-5 py-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Main Admin Practice Page
// ============================================================

export default function AdminPracticePage() {
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PracticeQuestion | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Import / Export
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);

  // ---- Load courses ----
  useEffect(() => {
    const load = async () => {
      setLoadingCourses(true);
      try {
        const data = await courseService.getCourses();
        setCourses(data);
      } catch {
        toast.error('Failed to load courses');
      } finally {
        setLoadingCourses(false);
      }
    };
    load();
  }, []);

  // ---- Load questions for selected topic ----
  const loadQuestions = useCallback(async (topicId: string) => {
    setLoadingQuestions(true);
    try {
      const data = await practiceService.adminGetQuestionsByTopic(topicId);
      setQuestions(data);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    loadQuestions(topic.id);
    setShowForm(false);
    setEditingQuestion(null);
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Delete this question? This cannot be undone.')) return;
    setDeleting(questionId);
    try {
      await practiceService.adminDeleteQuestion(questionId);
      toast.success('Question deleted');
      if (selectedTopic) loadQuestions(selectedTopic.id);
    } catch {
      toast.error('Failed to delete question');
    } finally {
      setDeleting(null);
    }
  };

  const handleFormSave = () => {
    if (selectedTopic) loadQuestions(selectedTopic.id);
  };

  const handleImport = async () => {
    if (!selectedTopic) { toast.error('Select a topic first'); return; }
    setImportError('');
    let parsed: any;
    try { parsed = JSON.parse(importJson); }
    catch (err: any) { setImportError(err.message || 'Invalid JSON'); return; }

    const list = Array.isArray(parsed) ? parsed : parsed.questions;
    if (!Array.isArray(list) || list.length === 0) {
      setImportError('JSON must be an array of questions, or { "questions": [...] }');
      return;
    }

    setImporting(true);
    try {
      const res = await practiceService.adminImportQuestions(selectedTopic.id, list);
      toast.success(`Imported ${res.count} question${res.count !== 1 ? 's' : ''}`);
      setShowImport(false);
      setImportJson('');
      loadQuestions(selectedTopic.id);
    } catch {
      setImportError('Import failed — check JSON shape matches the question schema.');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = () => {
    if (!selectedTopic) return;
    const payload = {
      topic_id: selectedTopic.id,
      topic_title: selectedTopic.title,
      questions: questions.map(q => ({
        question_type: q.question_type,
        thinking_type: q.thinking_type,
        difficulty_level: q.difficulty_level,
        title: q.title,
        question_text: q.question_text,
        scenario_context: q.scenario_context,
        options_json: q.options_json,
        correct_answer: q.correct_answer,
        expected_reasoning: q.expected_reasoning,
        explanation: q.explanation,
        visual_reference: q.visual_reference,
        complexity_score: q.complexity_score,
        estimated_time: q.estimated_time,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `practice-${selectedTopic.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleCourse = (id: string) =>
    setExpandedCourses((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const toggleModule = (id: string) =>
    setExpandedModules((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  if (!user) return null;

  const typeColorMap: Record<QuestionType, string> = {
    MCQ: 'text-blue-400',
    MULTI_SELECT: 'text-indigo-400',
    DEBUG_BASED: 'text-red-400',
    OUTPUT_PREDICTION: 'text-yellow-400',
    SCENARIO_ANALYSIS: 'text-orange-400',
    ARCHITECTURE_REASONING: 'text-purple-400',
    PROBLEM_SOLVING: 'text-green-400',
    CODE_COMPLETION: 'text-emerald-400',
    FLOW_SEQUENCING: 'text-cyan-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-400" />
          Practice Question Manager
        </h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">
          Create and manage thinking validation questions per topic.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Topic Browser */}
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/10 via-white/[0.02] to-indigo-500/10">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-4">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-purple-400" />
              Course Tree
            </p>

            {loadingCourses ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
              </div>
            ) : courses.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No courses found. Create courses first.</p>
            ) : (
              <div className="space-y-1">
                {courses.map((course) => (
                  <div key={course.id}>
                    <button
                      onClick={() => toggleCourse(course.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] text-left cursor-pointer transition-colors group"
                    >
                      {expandedCourses.has(course.id) ? (
                        <ChevronDown className="h-3 w-3 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-slate-500 shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-slate-300 truncate">{course.title}</span>
                    </button>

                    {expandedCourses.has(course.id) && course.modules?.map((module) => (
                      <div key={module.id} className="ml-3">
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] text-left cursor-pointer transition-colors"
                        >
                          {expandedModules.has(module.id) ? (
                            <ChevronDown className="h-3 w-3 text-slate-600 shrink-0" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />
                          )}
                          <span className="text-[11px] text-slate-400 truncate">{module.title}</span>
                        </button>

                        {expandedModules.has(module.id) && module.topics?.map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => handleSelectTopic(topic)}
                            className={`w-full text-left ml-3 px-2 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-2 ${
                              selectedTopic?.id === topic.id
                                ? 'bg-purple-600/20 text-purple-300'
                                : 'hover:bg-white/[0.02] text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            <span className="text-[10px] truncate">{topic.title}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Questions Panel */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedTopic ? (
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
              <Card className="border-none bg-slate-950/40 backdrop-blur-2xl rounded-3xl p-10 text-center">
                <Brain className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 font-semibold text-sm mb-1">Select a Topic</p>
                <p className="text-slate-600 text-xs">Choose a topic from the course tree to manage its practice questions.</p>
              </Card>
            </div>
          ) : (
            <>
              {/* Topic header + Add button */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-bold text-white">{selectedTopic.title}</p>
                  <p className="text-[10px] text-slate-500">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExport}
                    disabled={questions.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-white text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="h-3.5 w-3.5" /> Export
                  </button>
                  <button
                    onClick={() => setShowImport(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-white text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" /> Import JSON
                  </button>
                  <Button
                    onClick={() => { setEditingQuestion(null); setShowForm(true); }}
                    className="bg-purple-600 hover:bg-purple-500 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Question
                  </Button>
                </div>
              </div>

              {/* Questions list */}
              <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/10 via-white/[0.02] to-indigo-500/10">
                <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-4">
                  {loadingQuestions ? (
                    <div className="flex items-center justify-center h-24">
                      <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="text-center py-10">
                      <AlertTriangle className="h-8 w-8 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm font-semibold mb-1">No questions yet</p>
                      <p className="text-slate-600 text-xs">Click "Add Question" to create the first question for this topic.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {questions.map((q) => (
                        <div
                          key={q.id}
                          className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/40 border border-white/[0.04] hover:border-white/[0.08] transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${typeColorMap[q.question_type]}`}>
                                {q.question_type.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[9px] text-slate-600">•</span>
                              <span className="text-[9px] text-slate-500 uppercase">{q.thinking_type}</span>
                              <span className="text-[9px] text-slate-600">•</span>
                              <span className="text-[9px] text-slate-500">{q.difficulty_level}</span>
                              {!q.is_active && (
                                <span className="text-[9px] text-red-400 flex items-center gap-0.5">
                                  <EyeOff className="h-2.5 w-2.5" /> Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-200 truncate">{q.title}</p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{q.question_text}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setEditingQuestion(q); setShowForm(true); }}
                              className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-blue-400 cursor-pointer transition-colors"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(q.id)}
                              disabled={deleting === q.id}
                              className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-red-400 cursor-pointer transition-colors disabled:opacity-50"
                            >
                              {deleting === q.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Question Form Modal */}
      {showForm && selectedTopic && (
        <QuestionFormModal
          topicId={selectedTopic.id}
          editing={editingQuestion}
          onSave={handleFormSave}
          onClose={() => { setShowForm(false); setEditingQuestion(null); }}
        />
      )}

      {/* JSON Import Modal */}
      {showImport && selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.06] bg-slate-950/95 backdrop-blur-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Import Practice Questions</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Topic: <span className="text-purple-400">{selectedTopic.title}</span>
                </p>
              </div>
              <button
                onClick={() => { setShowImport(false); setImportJson(''); setImportError(''); }}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Paste an array of questions, or an object with a <code className="text-purple-400">questions</code> field.
              Each item needs <code className="text-purple-400">question_type</code>, <code className="text-purple-400">thinking_type</code>,
              <code className="text-purple-400">title</code>, <code className="text-purple-400">question_text</code>,
              <code className="text-purple-400">correct_answer</code>, and <code className="text-purple-400">explanation</code>.
            </p>
            <textarea
              rows={10}
              value={importJson}
              onChange={(e) => { setImportJson(e.target.value); setImportError(''); }}
              placeholder='{ "questions": [ { "question_type": "MCQ", "thinking_type": "LOGIC", "title": "...", "question_text": "...", "options_json": {"options":[{"id":"a","text":"A"}]}, "correct_answer": "a", "explanation": "...", "difficulty_level": "BEGINNER" } ] }'
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/40 transition-colors resize-none font-mono"
            />
            {importError && (
              <div className="flex items-center gap-2 text-rose-400 text-[11px]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {importError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowImport(false); setImportJson(''); setImportError(''); }}
                className="flex-1 py-2 rounded-lg border border-white/[0.06] text-slate-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importJson.trim() || importing}
                className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-3.5 w-3.5" /> Import</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
