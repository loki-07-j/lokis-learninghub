'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { adminRevisionService, RevisionDeck, RevisionCard } from '@/services/revision';
import {
  Layers, Plus, Trash2, Eye, EyeOff, Loader2, X, Upload, Download,
  ChevronDown, ChevronRight, BookOpen, AlertCircle,
} from 'lucide-react';

const CATEGORIES = ['JavaScript', 'React', 'Node', 'Database', 'CSS', 'General'] as const;
const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;

const inputCls = 'w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/40 transition-colors';

export default function AdminRevisionPage() {
  const { user } = useAuth();
  const isAdmin = user?.role_code === 'SUPER_ADMIN' || user?.role_code === 'ADMIN';

  const [decks, setDecks]               = useState<(RevisionDeck & { _count: { cards: number } })[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<(RevisionDeck & { cards: RevisionCard[] }) | null>(null);

  // New deck form
  const [showNewDeck, setShowNewDeck]   = useState(false);
  const [newTitle, setNewTitle]         = useState('');
  const [newDesc, setNewDesc]           = useState('');
  const [newCategory, setNewCategory]   = useState<typeof CATEGORIES[number]>('JavaScript');
  const [saving, setSaving]             = useState(false);

  // New card form
  const [addingCard, setAddingCard]     = useState(false);
  const [cardQuestion, setCardQuestion] = useState('');
  const [cardAnswer, setCardAnswer]     = useState('');
  const [cardTip, setCardTip]           = useState('');
  const [cardDifficulty, setCardDifficulty] = useState<typeof DIFFICULTIES[number]>('INTERMEDIATE');
  const [savingCard, setSavingCard]     = useState(false);

  // Import/Export
  const [showImport, setShowImport]     = useState(false);
  const [importJson, setImportJson]     = useState('');
  const [importError, setImportError]   = useState('');
  const [importing, setImporting]       = useState(false);

  useEffect(() => { if (isAdmin) fetchDecks(); }, [isAdmin]);

  const fetchDecks = async () => {
    try { setLoading(true); setDecks(await adminRevisionService.getAll()); }
    catch { toast.error('Failed to load decks'); }
    finally { setLoading(false); }
  };

  const handleSelectDeck = async (d: RevisionDeck) => {
    if (selectedDeck?.id === d.id) { setSelectedDeck(null); return; }
    try {
      const full = await adminRevisionService.getOne(d.id);
      setSelectedDeck(full);
    } catch { toast.error('Failed to load deck'); }
  };

  const handleCreateDeck = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminRevisionService.create({ title: newTitle, description: newDesc, category: newCategory });
      toast.success('Deck created');
      setShowNewDeck(false); setNewTitle(''); setNewDesc('');
      await fetchDecks();
    } catch { toast.error('Failed to create deck'); }
    finally { setSaving(false); }
  };

  const handleTogglePublish = async (d: RevisionDeck) => {
    try {
      await adminRevisionService.update(d.id, { is_published: !d.is_published });
      toast.success(d.is_published ? 'Unpublished' : 'Published');
      await fetchDecks();
      if (selectedDeck?.id === d.id) setSelectedDeck(prev => prev ? { ...prev, is_published: !prev.is_published } : prev);
    } catch { toast.error('Failed to update'); }
  };

  const handleDeleteDeck = async (id: string) => {
    if (!confirm('Delete this deck and all its cards?')) return;
    try {
      await adminRevisionService.delete(id);
      toast.success('Deck deleted');
      if (selectedDeck?.id === id) setSelectedDeck(null);
      await fetchDecks();
    } catch { toast.error('Failed to delete'); }
  };

  const handleAddCard = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!selectedDeck) return;
    try {
      setSavingCard(true);
      await adminRevisionService.addCard(selectedDeck.id, {
        question: cardQuestion, answer: cardAnswer,
        tip: cardTip || undefined, difficulty: cardDifficulty,
      });
      toast.success('Card added');
      setAddingCard(false); setCardQuestion(''); setCardAnswer(''); setCardTip('');
      const fresh = await adminRevisionService.getOne(selectedDeck.id);
      setSelectedDeck(fresh);
      await fetchDecks();
    } catch { toast.error('Failed to add card'); }
    finally { setSavingCard(false); }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!selectedDeck || !confirm('Delete this card?')) return;
    try {
      await adminRevisionService.deleteCard(cardId);
      toast.success('Card deleted');
      const fresh = await adminRevisionService.getOne(selectedDeck.id);
      setSelectedDeck(fresh);
      await fetchDecks();
    } catch { toast.error('Failed to delete card'); }
  };

  const handleExport = async (d: RevisionDeck) => {
    try {
      const data = await adminRevisionService.getOne(d.id);
      const blob = new Blob([JSON.stringify({ deck: data }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `deck-${d.slug}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Failed to export'); }
  };

  const handleImport = async () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importJson);
      if (!parsed.deck?.title) { setImportError('JSON must have a deck.title field'); return; }
      setImporting(true);
      await adminRevisionService.importDeck(parsed.deck);
      toast.success('Deck imported!');
      setShowImport(false); setImportJson('');
      await fetchDecks();
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
          <Layers className="h-4 w-4 text-purple-400" /> Revision Deck Builder
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-white text-[11px] font-semibold transition-all cursor-pointer">
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <button onClick={() => setShowNewDeck(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all cursor-pointer border border-purple-400/30">
            <Plus className="h-3.5 w-3.5" /> New Deck
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: deck list */}
        <aside className="w-72 shrink-0 border-r border-white/[0.04] flex flex-col overflow-hidden bg-slate-950/30">
          <div className="px-3 py-2.5 border-b border-white/[0.04] flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Decks</span>
            <span className="text-[9px] text-slate-700 font-mono">{decks.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {loading ? <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-purple-500" /></div>
              : decks.map(d => (
              <button key={d.id} onClick={() => handleSelectDeck(d)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[11px] font-semibold transition-all cursor-pointer border ${
                  selectedDeck?.id === d.id
                    ? 'bg-purple-600/15 border-purple-500/20 text-purple-200'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}>
                {selectedDeck?.id === d.id
                  ? <ChevronDown className="h-3 w-3 text-purple-400 shrink-0" />
                  : <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />}
                <span className="truncate flex-1">{d.title}</span>
                <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${d.is_published ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="shrink-0 text-[9px] text-slate-600 font-mono">{d._count.cards}c</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Center: editor */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {!selectedDeck ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-slate-700">
              <Layers className="h-10 w-10" />
              <p className="text-sm font-semibold">Select a deck to edit</p>
              <p className="text-xs font-light">or create a new one from the top bar</p>
            </div>
          ) : (
            <>
              {/* Deck header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${selectedDeck.is_published ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border-amber-500/20'}`}>
                      {selectedDeck.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-[9px] text-slate-600">{selectedDeck.category}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{selectedDeck.title}</h2>
                  {selectedDeck.description && <p className="text-xs text-slate-500 mt-0.5">{selectedDeck.description}</p>}
                  <p className="text-[10px] text-slate-600 mt-1 font-mono">{selectedDeck.cards.length} cards</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleExport(selectedDeck)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/[0.06] text-slate-400 hover:text-white text-[10px] font-semibold cursor-pointer transition-colors">
                    <Download className="h-3 w-3" /> Export
                  </button>
                  <button onClick={() => handleTogglePublish(selectedDeck)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold cursor-pointer transition-all ${selectedDeck.is_published ? 'border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10' : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10'}`}>
                    {selectedDeck.is_published ? <><EyeOff className="h-3 w-3" /> Unpublish</> : <><Eye className="h-3 w-3" /> Publish</>}
                  </button>
                  <button onClick={() => handleDeleteDeck(selectedDeck.id)}
                    className="p-1.5 rounded-lg border border-rose-500/15 bg-rose-500/[0.03] hover:bg-rose-500/10 text-rose-400 cursor-pointer transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Cards ({selectedDeck.cards.length})
                  </p>
                  <button onClick={() => setAddingCard(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-purple-500/20 bg-purple-500/[0.05] hover:bg-purple-500/[0.1] text-purple-400 text-[10px] font-bold transition-all cursor-pointer">
                    <Plus className="h-3 w-3" /> Add Card
                  </button>
                </div>

                {selectedDeck.cards.map((c, i) => (
                  <div key={c.id} className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold text-slate-200">Card {i + 1}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          c.difficulty === 'EXPERT'       ? 'text-rose-400 border-rose-500/20 bg-rose-500/[0.05]' :
                          c.difficulty === 'ADVANCED'     ? 'text-amber-400 border-amber-500/20 bg-amber-500/[0.05]' :
                          c.difficulty === 'INTERMEDIATE' ? 'text-sky-400 border-sky-500/20 bg-sky-500/[0.05]' :
                                                            'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.05]'
                        }`}>{c.difficulty}</span>
                        <button onClick={() => handleDeleteCard(c.id)}
                          className="p-1 rounded hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 cursor-pointer">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="rounded-lg border border-white/[0.04] bg-slate-950/30 px-3 py-2">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">Question</p>
                        <p className="text-[11px] text-slate-300">{c.question}</p>
                      </div>
                      <div className="rounded-lg border border-indigo-500/10 bg-indigo-500/[0.03] px-3 py-2">
                        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">Answer</p>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{c.answer}</p>
                      </div>
                      {c.tip && (
                        <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.03] px-3 py-2">
                          <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider mb-0.5">Tip</p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{c.tip}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {selectedDeck.cards.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-white/[0.06] space-y-2">
                    <BookOpen className="h-7 w-7 text-slate-700" />
                    <p className="text-xs text-slate-600">No cards yet — add one above</p>
                  </div>
                )}
              </div>

              {/* Add card form */}
              {addingCard && (
                <div className="rounded-xl border border-purple-500/15 bg-purple-500/[0.03] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">New Card</p>
                    <button onClick={() => setAddingCard(false)} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
                  </div>
                  <form onSubmit={handleAddCard} className="space-y-3">
                    <textarea required rows={2} value={cardQuestion} onChange={e => setCardQuestion(e.target.value)}
                      placeholder="Question / front of card…" className={`${inputCls} resize-none`} />
                    <textarea required rows={3} value={cardAnswer} onChange={e => setCardAnswer(e.target.value)}
                      placeholder="Answer / back of card…" className={`${inputCls} resize-none`} />
                    <textarea rows={2} value={cardTip} onChange={e => setCardTip(e.target.value)}
                      placeholder="Tip (optional — shown on back)…" className={`${inputCls} resize-none`} />
                    <select value={cardDifficulty} onChange={e => setCardDifficulty(e.target.value as any)} className={inputCls}>
                      {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button type="submit" disabled={savingCard}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold cursor-pointer transition-all disabled:opacity-50">
                      {savingCard ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      Save Card
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* New Deck Modal */}
      {showNewDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-slate-950/95 backdrop-blur-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">New Revision Deck</h2>
              <button onClick={() => setShowNewDeck(false)} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleCreateDeck} className="space-y-3">
              <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Deck title" className={inputCls} autoFocus />
              <textarea rows={2} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" className={`${inputCls} resize-none`} />
              <select value={newCategory} onChange={e => setNewCategory(e.target.value as any)} className={inputCls}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition-all disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Deck'}
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
              <h2 className="text-sm font-bold text-white">Import Deck JSON</h2>
              <button onClick={() => { setShowImport(false); setImportJson(''); setImportError(''); }} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-[10px] text-slate-500">Paste a <code className="text-purple-400">{"{ deck: {...} }"}</code> JSON structure.</p>
            <textarea rows={8} value={importJson} onChange={e => { setImportJson(e.target.value); setImportError(''); }}
              placeholder='{ "deck": { "title": "...", "category": "JavaScript", "cards": [...] } }'
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
