'use client';

import { useState, useEffect } from 'react';
import { Layers, HelpCircle, CheckCircle2, RefreshCw, RotateCcw, Zap, Loader2,
  LayoutGrid, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { revisionService, RevisionDeck, RevisionDeckWithCards, RevisionCard, RevisionRating } from '@/services/revision';

type View = 'catalog' | 'deck';

const CATEGORY_COLOR: Record<string, string> = {
  JavaScript:    'text-amber-400 bg-amber-500/[0.08] border-amber-500/20',
  React:         'text-sky-400 bg-sky-500/[0.08] border-sky-500/20',
  Node:          'text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/20',
  Database:      'text-violet-400 bg-violet-500/[0.08] border-violet-500/20',
  CSS:           'text-pink-400 bg-pink-500/[0.08] border-pink-500/20',
  General:       'text-slate-300 bg-white/[0.03] border-white/[0.08]',
};
const categoryColor = (cat: string) => CATEGORY_COLOR[cat] ?? CATEGORY_COLOR.General;

export default function RevisionPage() {
  const [view, setView]               = useState<View>('catalog');
  const [decks, setDecks]             = useState<RevisionDeck[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeDeck, setActiveDeck]   = useState<RevisionDeckWithCards | null>(null);
  const [loadingDeck, setLoadingDeck] = useState(false);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [isFlipped, setIsFlipped]     = useState(false);
  const [completed, setCompleted]     = useState(false);
  const [search, setSearch]           = useState('');

  useEffect(() => {
    revisionService.getDecks()
      .then(setDecks)
      .catch(() => toast.error('Failed to load revision decks'))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenDeck = async (deck: RevisionDeck) => {
    try {
      setLoadingDeck(true);
      const full = await revisionService.getDeckCards(deck.id);
      setActiveDeck(full);
      setCurrentIdx(0);
      setIsFlipped(false);
      setCompleted(false);
      setView('deck');
    } catch { toast.error('Failed to load deck'); }
    finally { setLoadingDeck(false); }
  };

  const handleRate = async (rating: RevisionRating) => {
    if (!activeDeck) return;
    const card = activeDeck.cards[currentIdx];
    try {
      await revisionService.rateCard(card.id, rating);
      // Optimistically update local state
      setActiveDeck(prev => prev ? {
        ...prev,
        cards: prev.cards.map(c => c.id === card.id ? { ...c, user_rating: rating } : c),
      } : prev);
      toast.success(`Marked as ${rating}`);
    } catch { toast.error('Failed to save rating'); }

    setIsFlipped(false);
    setTimeout(() => {
      if (currentIdx < activeDeck.cards.length - 1) setCurrentIdx(p => p + 1);
      else setCompleted(true);
    }, 260);
  };

  const handleReset = () => { setCurrentIdx(0); setIsFlipped(false); setCompleted(false); };

  const filtered = decks.filter(d =>
    !search.trim() ||
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  // ── CATALOG ───────────────────────────────────────────────────────────────
  if (view === 'catalog') return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-400" /> Revision Decks
          </h1>
          <p className="text-[11px] text-slate-500 font-light mt-0.5">
            Spaced-repetition flashcards — database-driven, always up to date.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search decks…"
            className="pl-8 pr-3 py-1.5 w-52 text-xs rounded-lg bg-white/[0.02] border border-white/[0.05] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/30 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-purple-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-white/[0.06] space-y-3">
          <LayoutGrid className="h-10 w-10 text-slate-700" />
          <p className="text-sm text-slate-500 font-semibold">{search ? 'No decks match your search' : 'No revision decks published yet'}</p>
          <p className="text-[11px] text-slate-600 font-light">Admins can create decks in the Revision Builder.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(deck => (
            <div key={deck.id}
              className="flex flex-col gap-3 p-4 rounded-2xl border border-white/[0.05] bg-slate-950/30 backdrop-blur-xl hover:border-purple-500/20 hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${categoryColor(deck.category)}`}>
                  {deck.category}
                </span>
                <span className="text-[10px] text-slate-600 font-mono">{deck._count?.cards ?? 0} cards</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">{deck.title}</h3>
                {deck.description && <p className="text-[11px] text-slate-500 mt-1 font-light line-clamp-2">{deck.description}</p>}
              </div>
              <Button onClick={() => handleOpenDeck(deck)} disabled={loadingDeck}
                className="w-full bg-purple-600/10 hover:bg-purple-600 border border-purple-500/20 hover:border-purple-400/30 text-purple-300 hover:text-white text-xs font-bold h-9 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                {loadingDeck ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Layers className="h-3.5 w-3.5" /> Study Deck</>}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── DECK STUDY ────────────────────────────────────────────────────────────
  if (view === 'deck' && activeDeck) {
    const card: RevisionCard | undefined = activeDeck.cards[currentIdx];

    return (
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setView('catalog')}
              className="text-[10px] text-slate-500 hover:text-purple-400 font-semibold cursor-pointer transition-colors flex items-center gap-1">
              <ChevronRight className="h-3 w-3 rotate-180" /> Decks
            </button>
            <span className="text-slate-700">/</span>
            <span className="text-[10px] font-bold text-slate-300">{activeDeck.title}</span>
          </div>
          {!completed && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.05] text-[10px] uppercase font-bold tracking-wider text-slate-400">
              <Zap className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
              {currentIdx + 1} / {activeDeck.cards.length}
            </div>
          )}
        </div>

        {/* Completion screen */}
        {completed ? (
          <div className="max-w-md mx-auto rounded-2xl border border-white/[0.05] bg-slate-950/40 backdrop-blur-xl p-8 text-center space-y-5">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Deck Complete!</h2>
              <p className="text-[11px] text-slate-400 mt-1 font-light">All {activeDeck.cards.length} cards reviewed.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleReset}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-xs font-bold h-9 rounded-xl border border-purple-400/20 cursor-pointer flex items-center justify-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Restart
              </Button>
              <Button onClick={() => setView('catalog')} variant="ghost"
                className="flex-1 h-9 rounded-xl border border-white/[0.04] text-xs font-semibold text-slate-400 hover:text-white cursor-pointer">
                Back to Catalog
              </Button>
            </div>
          </div>
        ) : card ? (
          /* Flashcard */
          <div className="max-w-xl mx-auto flex flex-col items-center gap-6 select-none">
            {/* 3-D flip card */}
            <div className="w-full min-h-[280px] cursor-pointer" style={{ perspective: '1000px' }}
              onClick={() => setIsFlipped(f => !f)}>
              <div className="w-full h-full relative transition-transform duration-500"
                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', minHeight: 280 }}>

                {/* Front */}
                <div className="absolute inset-0 rounded-2xl border border-white/[0.06] bg-slate-950/60 backdrop-blur-xl p-6 flex flex-col justify-between"
                  style={{ backfaceVisibility: 'hidden' }}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${categoryColor(activeDeck.category)}`}>
                      {activeDeck.category}
                    </span>
                    <HelpCircle className="h-4 w-4 text-slate-600" />
                  </div>
                  <h2 className="text-sm font-bold text-white leading-relaxed text-center py-6">{card.question}</h2>
                  <p className="text-[10px] text-slate-600 text-center font-medium uppercase tracking-wider flex items-center justify-center gap-1.5 animate-pulse">
                    <RefreshCw className="h-3 w-3" /> Tap to reveal answer
                  </p>
                </div>

                {/* Back */}
                <div className="absolute inset-0 rounded-2xl border border-indigo-500/15 bg-slate-950/70 backdrop-blur-xl p-6 flex flex-col justify-between text-left"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', minHeight: 280 }}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${categoryColor(activeDeck.category)}`}>
                      {activeDeck.category}
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 py-4 space-y-3">
                    <p className="text-xs text-slate-200 leading-relaxed select-text">{card.answer}</p>
                    {card.tip && (
                      <div className="bg-indigo-500/[0.06] border border-indigo-500/15 rounded-xl p-2.5 text-[10px] text-indigo-300 leading-relaxed">
                        <span className="font-bold text-indigo-400 uppercase text-[8px] tracking-wider block mb-0.5">Tip</span>
                        {card.tip}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-600 text-center font-medium uppercase tracking-wider">Tap to return</p>
                </div>
              </div>
            </div>

            {/* Rating buttons */}
            {isFlipped && (
              <div className="w-full flex items-center justify-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {(['HARD', 'MEDIUM', 'EASY'] as RevisionRating[]).map(r => (
                  <Button key={r} onClick={e => { e.stopPropagation(); handleRate(r); }}
                    className={`flex-1 text-[10px] font-bold uppercase tracking-wider px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      r === 'HARD'   ? 'bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-400' :
                      r === 'MEDIUM' ? 'bg-indigo-950/40 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-400' :
                                       'bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400'
                    }`}>
                    {r === 'HARD' ? 'Hard' : r === 'MEDIUM' ? 'Medium' : 'Easy'}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return null;
}
