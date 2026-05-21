'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { adminRapidFireService, RapidFirePool, RapidFireQuestion } from '@/services/rapidfire';
import {
  Zap, Plus, Trash2, Eye, EyeOff, Loader2, X, Upload, Download,
  ChevronDown, ChevronRight, BookOpen, Check, AlertCircle,
} from 'lucide-react';

const CATEGORIES = ['JavaScript', 'React', 'Node', 'TypeScript', 'CSS', 'Database', 'General'] as const;

const inputCls = 'w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/40 transition-colors';

export default function AdminRapidFirePage() {
  const { user } = useAuth();
  const isAdmin = user?.role_code === 'SUPER_ADMIN' || user?.role_code === 'ADMIN';

  const [pools, setPools]               = useState<(RapidFirePool & { _count: { questions: number; sessions: number } })[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedPool, setSelectedPool] = useState<(RapidFirePool & { questions: RapidFireQuestion[] }) | null>(null);

  // New pool form
  const [showNewPool, setShowNewPool]   = useState(false);
  const [newTitle, setNewTitle]         = useState('');
  const [newDesc, setNewDesc]           = useState('');
  const [newCategory, setNewCategory]   = useState<typeof CATEGORIES[number]>('JavaScript');
  const [saving, setSaving]             = useState(false);

  // New question form
  const [addingQ, setAddingQ]           = useState(false);
  const [qText, setQText]               = useState('');
  const [qOptions, setQOptions]         = useState(['', '', '', '']);
  const [qCorrect, setQCorrect]         = useState(0);
  const [qExplanation, setQExplanation] = useState('');
  const [savingQ, setSavingQ]           = useState(false);

  // Import/Export
  const [showImport, setShowImport]     = useState(false);
  const [importJson, setImportJson]     = useState('');
  const [importError, setImportError]   = useState('');
  const [importing, setImporting]       = useState(false);

  useEffect(() => { if (isAdmin) fetchPools(); }, [isAdmin]);

  const fetchPools = async () => {
    try { setLoading(true); setPools(await adminRapidFireService.getAll()); }
    catch { toast.error('Failed to load pools'); }
    finally { setLoading(false); }
  };

  const handleSelectPool = async (p: RapidFirePool) => {
    if (selectedPool?.id === p.id) { setSelectedPool(null); return; }
    try {
      const full = await adminRapidFireService.getOne(p.id);
      setSelectedPool(full);
    } catch { toast.error('Failed to load pool'); }
  };

  const handleCreatePool = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminRapidFireService.create({ title: newTitle, description: newDesc, category: newCategory });
      toast.success('Pool created');
      setShowNewPool(false); setNewTitle(''); setNewDesc('');
      await fetchPools();
    } catch { toast.error('Failed to create pool'); }
    finally { setSaving(false); }
  };

  const handleTogglePublish = async (p: RapidFirePool) => {
    try {
      await adminRapidFireService.update(p.id, { is_published: !p.is_published });
      toast.success(p.is_published ? 'Unpublished' : 'Published');
      await fetchPools();
      if (selectedPool?.id === p.id) setSelectedPool(prev => prev ? { ...prev, is_published: !prev.is_published } : prev);
    } catch { toast.error('Failed to update'); }
  };

  const handleDeletePool = async (id: string) => {
    if (!confirm('Delete this pool and all its questions?')) return;
    try {
      await adminRapidFireService.delete(id);
      toast.success('Pool deleted');
      if (selectedPool?.id === id) setSelectedPool(null);
      await fetchPools();
    } catch { toast.error('Failed to delete'); }
  };

  const handleAddQuestion = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!selectedPool) return;
    if (qOptions.some(o => !o.trim())) { toast.error('Fill all 4 options'); return; }
    try {
      setSavingQ(true);
      await adminRapidFireService.addQuestion(selectedPool.id, {
        question_text: qText, options_json: qOptions,
        correct_answer: qCorrect, explanation: qExplanation,
      });
      toast.success('Question added');
      setAddingQ(false); setQText(''); setQOptions(['', '', '', '']); setQCorrect(0); setQExplanation('');
      const fresh = await adminRapidFireService.getOne(selectedPool.id);
      setSelectedPool(fresh);
      await fetchPools();
    } catch { toast.error('Failed to add question'); }
    finally { setSavingQ(false); }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedPool || !confirm('Delete this question?')) return;
    try {
      await adminRapidFireService.deleteQuestion(questionId);
      toast.success('Question deleted');
      const fresh = await adminRapidFireService.getOne(selectedPool.id);
      setSelectedPool(fresh);
      await fetchPools();
    } catch { toast.error('Failed to delete question'); }
  };

  const handleExport = async (p: RapidFirePool) => {
    try {
      const data = await adminRapidFireService.exportPool(p.id);
      const blob = new Blob([JSON.stringify({ pool: data }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `pool-${p.slug}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Failed to export'); }
  };

  const handleImport = async () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importJson);
      if (!parsed.pool?.title) { setImportError('JSON must have a pool.title field'); return; }
      setImporting(true);
      await adminRapidFireService.importPool(parsed.pool);
      toast.success('Pool imported!');
      setShowImport(false); setImportJson('');
      await fetchPools();
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
          <Zap className="h-4 w-4 text-amber-400" /> Rapid Fire Builder
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-white text-[11px] font-semibold transition-all cursor-pointer">
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <button onClick={() => setShowNewPool(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 border border-amber-500/30 hover:border-amber-400/30 text-amber-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> New Pool
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: pool list */}
        <aside className="w-72 shrink-0 border-r border-white/[0.04] flex flex-col overflow-hidden bg-slate-950/30">
          <div className="px-3 py-2.5 border-b border-white/[0.04] flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Pools</span>
            <span className="text-[9px] text-slate-700 font-mono">{pools.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {loading ? <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-amber-500" /></div>
              : pools.map(p => (
              <button key={p.id} onClick={() => handleSelectPool(p)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[11px] font-semibold transition-all cursor-pointer border ${
                  selectedPool?.id === p.id
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}>
                {selectedPool?.id === p.id
                  ? <ChevronDown className="h-3 w-3 text-amber-400 shrink-0" />
                  : <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />}
                <span className="truncate flex-1">{p.title}</span>
                <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${p.is_published ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="shrink-0 text-[9px] text-slate-600 font-mono">{p._count.questions}Q</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Center: editor */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {!selectedPool ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-slate-700">
              <Zap className="h-10 w-10" />
              <p className="text-sm font-semibold">Select a pool to edit</p>
              <p className="text-xs font-light">or create a new one from the top bar</p>
            </div>
          ) : (
            <>
              {/* Pool header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${selectedPool.is_published ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border-amber-500/20'}`}>
                      {selectedPool.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-[9px] text-slate-600">{selectedPool.category}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{selectedPool.title}</h2>
                  {selectedPool.description && <p className="text-xs text-slate-500 mt-0.5">{selectedPool.description}</p>}
                  <p className="text-[10px] text-slate-600 mt-1 font-mono">{selectedPool.questions.length} questions</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleExport(selectedPool)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/[0.06] text-slate-400 hover:text-white text-[10px] font-semibold cursor-pointer transition-colors">
                    <Download className="h-3 w-3" /> Export
                  </button>
                  <button onClick={() => handleTogglePublish(selectedPool)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold cursor-pointer transition-all ${selectedPool.is_published ? 'border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10' : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10'}`}>
                    {selectedPool.is_published ? <><EyeOff className="h-3 w-3" /> Unpublish</> : <><Eye className="h-3 w-3" /> Publish</>}
                  </button>
                  <button onClick={() => handleDeletePool(selectedPool.id)}
                    className="p-1.5 rounded-lg border border-rose-500/15 bg-rose-500/[0.03] hover:bg-rose-500/10 text-rose-400 cursor-pointer transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Questions ({selectedPool.questions.length})
                  </p>
                  <button onClick={() => setAddingQ(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] hover:bg-amber-500/[0.1] text-amber-400 text-[10px] font-bold transition-all cursor-pointer">
                    <Plus className="h-3 w-3" /> Add Question
                  </button>
                </div>

                {selectedPool.questions.map((q, i) => (
                  <div key={q.id} className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold text-slate-200">Q{i + 1}: {q.question_text}</p>
                      <button onClick={() => handleDeleteQuestion(q.id)}
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
                    {q.explanation && <p className="text-[10px] text-slate-600 leading-relaxed">{q.explanation}</p>}
                  </div>
                ))}

                {selectedPool.questions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-white/[0.06] space-y-2">
                    <BookOpen className="h-7 w-7 text-slate-700" />
                    <p className="text-xs text-slate-600">No questions yet — add one above</p>
                  </div>
                )}
              </div>

              {/* Add question form */}
              {addingQ && (
                <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.02] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">New Question</p>
                    <button onClick={() => setAddingQ(false)} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
                  </div>
                  <form onSubmit={handleAddQuestion} className="space-y-3">
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
                      placeholder="Explanation (optional — shown after answer)…" className={`${inputCls} resize-none`} />
                    <button type="submit" disabled={savingQ}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 border border-amber-500/30 text-amber-300 hover:text-white text-[11px] font-bold cursor-pointer transition-all disabled:opacity-50">
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

      {/* New Pool Modal */}
      {showNewPool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-slate-950/95 backdrop-blur-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">New Rapid Fire Pool</h2>
              <button onClick={() => setShowNewPool(false)} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleCreatePool} className="space-y-3">
              <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Pool title" className={inputCls} autoFocus />
              <textarea rows={2} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" className={`${inputCls} resize-none`} />
              <select value={newCategory} onChange={e => setNewCategory(e.target.value as any)} className={inputCls}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500 border border-amber-500/30 text-amber-300 hover:text-white text-xs font-bold cursor-pointer transition-all disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Pool'}
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
              <h2 className="text-sm font-bold text-white">Import Pool JSON</h2>
              <button onClick={() => { setShowImport(false); setImportJson(''); setImportError(''); }} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-[10px] text-slate-500">Paste a <code className="text-amber-400">{"{ pool: {...} }"}</code> JSON structure.</p>
            <textarea rows={8} value={importJson} onChange={e => { setImportJson(e.target.value); setImportError(''); }}
              placeholder='{ "pool": { "title": "...", "category": "JavaScript", "questions": [...] } }'
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
                className="flex-1 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500 border border-amber-500/30 text-amber-300 hover:text-white text-xs font-bold cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-3.5 w-3.5" /> Import</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
