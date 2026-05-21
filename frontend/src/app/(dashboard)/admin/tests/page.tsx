'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { adminTestService, Test, TestQuestion } from '@/services/tests';
import {
  Award, Plus, Trash2, Eye, EyeOff, Loader2, X, Upload, Download,
  ChevronDown, ChevronRight, BookOpen, Edit3, Check, AlertCircle,
} from 'lucide-react';

type SaveStatus = 'idle' | 'saving' | 'saved';

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;

const inputCls = 'w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/40 transition-colors';

export default function AdminTestsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role_code === 'SUPER_ADMIN' || user?.role_code === 'ADMIN';

  const [tests, setTests]                 = useState<(Test & { _count: { questions: number; attempts: number } })[]>([]);
  const [loading, setLoading]             = useState(true);
  const [selectedTest, setSelectedTest]   = useState<(Test & { questions: TestQuestion[] }) | null>(null);
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [saveStatus, setSaveStatus]       = useState<SaveStatus>('idle');

  // New test form
  const [showNewTest, setShowNewTest]     = useState(false);
  const [newTitle, setNewTitle]           = useState('');
  const [newDesc, setNewDesc]             = useState('');
  const [newCategory, setNewCategory]     = useState('');
  const [newDuration, setNewDuration]     = useState(120);
  const [newPassing, setNewPassing]       = useState(75);
  const [newDifficulty, setNewDifficulty] = useState<typeof DIFFICULTIES[number]>('BEGINNER');
  const [saving, setSaving]               = useState(false);

  // New question form
  const [addingQ, setAddingQ]             = useState<string | null>(null); // testId
  const [qText, setQText]                 = useState('');
  const [qOptions, setQOptions]           = useState(['', '', '', '']);
  const [qCorrect, setQCorrect]           = useState(0);
  const [qExplanation, setQExplanation]   = useState('');
  const [savingQ, setSavingQ]             = useState(false);

  // Import/Export
  const [showImport, setShowImport]       = useState(false);
  const [importJson, setImportJson]       = useState('');
  const [importError, setImportError]     = useState('');
  const [importing, setImporting]         = useState(false);

  useEffect(() => { if (isAdmin) fetchTests(); }, [isAdmin]);

  const fetchTests = async () => {
    try { setLoading(true); setTests(await adminTestService.getAll()); }
    catch { toast.error('Failed to load tests'); }
    finally { setLoading(false); }
  };

  const handleSelectTest = async (t: Test) => {
    if (selectedTest?.id === t.id) { setSelectedTest(null); return; }
    try {
      const full = await adminTestService.getOne(t.id);
      setSelectedTest(full);
      setExpandedId(t.id);
    } catch { toast.error('Failed to load test'); }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminTestService.create({ title: newTitle, description: newDesc, category: newCategory, duration_secs: newDuration, passing_score: newPassing, difficulty: newDifficulty });
      toast.success('Test created');
      setShowNewTest(false); setNewTitle(''); setNewDesc(''); setNewCategory('');
      await fetchTests();
    } catch { toast.error('Failed to create test'); }
    finally { setSaving(false); }
  };

  const handleTogglePublish = async (t: Test) => {
    try {
      await adminTestService.update(t.id, { is_published: !t.is_published });
      toast.success(t.is_published ? 'Unpublished' : 'Published');
      await fetchTests();
      if (selectedTest?.id === t.id) setSelectedTest(prev => prev ? { ...prev, is_published: !prev.is_published } : prev);
    } catch { toast.error('Failed to update'); }
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm('Delete this test and all its questions?')) return;
    try {
      await adminTestService.delete(id);
      toast.success('Test deleted');
      if (selectedTest?.id === id) setSelectedTest(null);
      await fetchTests();
    } catch { toast.error('Failed to delete'); }
  };

  const handleAddQuestion = async (e: React.FormEvent, testId: string) => {
    e.preventDefault();
    if (qOptions.some(o => !o.trim())) { toast.error('Fill all 4 options'); return; }
    try {
      setSavingQ(true);
      await adminTestService.addQuestion(testId, { question_text: qText, options_json: qOptions, correct_answer: qCorrect, explanation: qExplanation });
      toast.success('Question added');
      setAddingQ(null); setQText(''); setQOptions(['', '', '', '']); setQCorrect(0); setQExplanation('');
      const fresh = await adminTestService.getOne(testId);
      setSelectedTest(fresh);
      await fetchTests();
    } catch { toast.error('Failed to add question'); }
    finally { setSavingQ(false); }
  };

  const handleDeleteQuestion = async (testId: string, questionId: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      await adminTestService.deleteQuestion(questionId);
      toast.success('Question deleted');
      const fresh = await adminTestService.getOne(testId);
      setSelectedTest(fresh);
      await fetchTests();
    } catch { toast.error('Failed to delete question'); }
  };

  const handleExport = async (t: Test) => {
    try {
      const data = await adminTestService.exportTest(t.id);
      const blob = new Blob([JSON.stringify({ test: data }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `test-${t.slug}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Failed to export'); }
  };

  const handleImport = async () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importJson);
      if (!parsed.test?.title) { setImportError('JSON must have a test.title field'); return; }
      setImporting(true);
      await adminTestService.importTest(parsed.test);
      toast.success('Test imported!');
      setShowImport(false); setImportJson('');
      await fetchTests();
    } catch (err: any) {
      setImportError(err.message || 'Invalid JSON');
    } finally { setImporting(false); }
  };

  if (!isAdmin) return (
    <div className="flex h-64 items-center justify-center text-slate-500 text-sm">Access denied.</div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -mx-6 -my-6 overflow-hidden bg-[#030014]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-slate-950/60 backdrop-blur-xl shrink-0">
        <h1 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="h-4 w-4 text-purple-400" /> Assessment Builder
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-white text-[11px] font-semibold transition-all cursor-pointer">
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <button onClick={() => setShowNewTest(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all cursor-pointer border border-purple-400/30">
            <Plus className="h-3.5 w-3.5" /> New Test
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: test list */}
        <aside className="w-72 shrink-0 border-r border-white/[0.04] flex flex-col overflow-hidden bg-slate-950/30">
          <div className="px-3 py-2.5 border-b border-white/[0.04] flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tests</span>
            <span className="text-[9px] text-slate-700 font-mono">{tests.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {loading ? <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-purple-500" /></div>
              : tests.map(t => (
              <div key={t.id}>
                <button onClick={() => handleSelectTest(t)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[11px] font-semibold transition-all cursor-pointer border ${
                    selectedTest?.id === t.id
                      ? 'bg-purple-600/15 border-purple-500/20 text-purple-200'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'
                  }`}>
                  {selectedTest?.id === t.id
                    ? <ChevronDown className="h-3 w-3 text-purple-400 shrink-0" />
                    : <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />}
                  <span className="truncate flex-1">{t.title}</span>
                  <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${t.is_published ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="shrink-0 text-[9px] text-slate-600 font-mono">{t._count.questions}Q</span>
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: editor */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {!selectedTest ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-slate-700">
              <Award className="h-10 w-10" />
              <p className="text-sm font-semibold">Select a test to edit</p>
              <p className="text-xs font-light">or create a new one from the top bar</p>
            </div>
          ) : (
            <>
              {/* Test header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${selectedTest.is_published ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border-amber-500/20'}`}>
                      {selectedTest.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-[9px] text-slate-600">{selectedTest.category} · {selectedTest.difficulty}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{selectedTest.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedTest.description}</p>
                  <p className="text-[10px] text-slate-600 mt-1 font-mono">
                    {Math.ceil(selectedTest.duration_secs / 60)}m · Pass {selectedTest.passing_score}%
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleExport(selectedTest)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/[0.06] text-slate-400 hover:text-white text-[10px] font-semibold cursor-pointer transition-colors">
                    <Download className="h-3 w-3" /> Export
                  </button>
                  <button onClick={() => handleTogglePublish(selectedTest)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold cursor-pointer transition-all ${selectedTest.is_published ? 'border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10' : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10'}`}>
                    {selectedTest.is_published ? <><EyeOff className="h-3 w-3" /> Unpublish</> : <><Eye className="h-3 w-3" /> Publish</>}
                  </button>
                  <button onClick={() => handleDeleteTest(selectedTest.id)}
                    className="p-1.5 rounded-lg border border-rose-500/15 bg-rose-500/[0.03] hover:bg-rose-500/10 text-rose-400 cursor-pointer transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Questions ({selectedTest.questions.length})
                  </p>
                  <button onClick={() => setAddingQ(selectedTest.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-purple-500/20 bg-purple-500/[0.05] hover:bg-purple-500/[0.1] text-purple-400 text-[10px] font-bold transition-all cursor-pointer">
                    <Plus className="h-3 w-3" /> Add Question
                  </button>
                </div>

                {selectedTest.questions.map((q, i) => (
                  <div key={q.id} className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold text-slate-200">Q{i + 1}: {q.question_text}</p>
                      <button onClick={() => handleDeleteQuestion(selectedTest.id, q.id)}
                        className="shrink-0 p-1 rounded hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 cursor-pointer">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(q.options_json as string[]).map((opt, idx) => (
                        <div key={idx} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] border ${
                          idx === q.correct_answer
                            ? 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300'
                            : 'border-white/[0.04] text-slate-500'
                        }`}>
                          {idx === q.correct_answer && <Check className="h-2.5 w-2.5 shrink-0" />}
                          <span className="truncate">{String.fromCharCode(65 + idx)}. {opt}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-600 leading-relaxed">{q.explanation}</p>
                  </div>
                ))}

                {selectedTest.questions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-white/[0.06] space-y-2">
                    <BookOpen className="h-7 w-7 text-slate-700" />
                    <p className="text-xs text-slate-600">No questions yet — add one above</p>
                  </div>
                )}
              </div>

              {/* Add question form */}
              {addingQ === selectedTest.id && (
                <div className="rounded-xl border border-purple-500/15 bg-purple-500/[0.03] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">New Question</p>
                    <button onClick={() => setAddingQ(null)} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
                  </div>
                  <form onSubmit={e => handleAddQuestion(e, selectedTest.id)} className="space-y-3">
                    <textarea required rows={2} value={qText} onChange={e => setQText(e.target.value)}
                      placeholder="Question text…" className={`${inputCls} resize-none`} />
                    <div className="grid grid-cols-2 gap-2">
                      {qOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <button type="button" onClick={() => setQCorrect(i)}
                            className={`shrink-0 h-5 w-5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                              qCorrect === i ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 text-slate-600'
                            }`}>
                            {qCorrect === i && <Check className="h-3 w-3" />}
                          </button>
                          <input value={opt} required onChange={e => { const a = [...qOptions]; a[i] = e.target.value; setQOptions(a); }}
                            placeholder={`Option ${String.fromCharCode(65 + i)}`} className={inputCls} />
                        </div>
                      ))}
                    </div>
                    <textarea rows={2} value={qExplanation} onChange={e => setQExplanation(e.target.value)}
                      placeholder="Explanation (shown after submit)…" className={`${inputCls} resize-none`} />
                    <button type="submit" disabled={savingQ}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold cursor-pointer transition-all disabled:opacity-50">
                      {savingQ ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      Save Question
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* New Test Modal */}
      {showNewTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-slate-950/95 backdrop-blur-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">New Test</h2>
              <button onClick={() => setShowNewTest(false)} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleCreateTest} className="space-y-3">
              <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" className={inputCls} autoFocus />
              <textarea rows={2} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" className={`${inputCls} resize-none`} />
              <div className="grid grid-cols-2 gap-2">
                <input required value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Category (e.g. JavaScript)" className={inputCls} />
                <select value={newDifficulty} onChange={e => setNewDifficulty(e.target.value as any)} className={inputCls}>
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Duration (seconds)</label>
                  <input type="number" min={30} value={newDuration} onChange={e => setNewDuration(+e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Passing score (%)</label>
                  <input type="number" min={1} max={100} value={newPassing} onChange={e => setNewPassing(+e.target.value)} className={inputCls} />
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition-all disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Test'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.06] bg-slate-950/95 backdrop-blur-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Import Test JSON</h2>
              <button onClick={() => { setShowImport(false); setImportJson(''); setImportError(''); }} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-[10px] text-slate-500">Paste a <code className="text-purple-400">{"{ test: {...} }"}</code> JSON structure.</p>
            <textarea rows={8} value={importJson} onChange={e => { setImportJson(e.target.value); setImportError(''); }}
              placeholder='{ "test": { "title": "...", "category": "...", "questions": [...] } }'
              className={`${inputCls} resize-none font-mono text-[11px]`} />
            {importError && (
              <div className="flex items-center gap-2 text-rose-400 text-[11px]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {importError}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setShowImport(false); setImportJson(''); setImportError(''); }}
                className="flex-1 py-2 rounded-lg border border-white/[0.06] text-slate-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors">Cancel</button>
              <button onClick={handleImport} disabled={!importJson.trim() || importing}
                className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-3.5 w-3.5" /> Import</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
