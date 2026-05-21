'use client';

import { useState, useEffect, useRef } from 'react';
import { Zap, Timer, CheckCircle, XCircle, Trophy, RotateCcw, Loader2,
  LayoutGrid, ChevronRight, Flame, Target, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { rapidFireService, RapidFirePool, RapidFirePoolWithQuestions, RapidFireSessionResult } from '@/services/rapidfire';

type View = 'catalog' | 'playing' | 'result';

const TIMER_PER_Q = 15; // seconds per question

export default function RapidFirePage() {
  const [view, setView]             = useState<View>('catalog');
  const [pools, setPools]           = useState<RapidFirePool[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activePool, setActivePool] = useState<RapidFirePoolWithQuestions | null>(null);
  const [loadingPool, setLoadingPool] = useState(false);

  // Playing state
  const [currentIdx, setCurrentIdx]         = useState(0);
  const [selected, setSelected]             = useState<number | null>(null);
  const [answered, setAnswered]             = useState(false);
  const [answers, setAnswers]               = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft]             = useState(TIMER_PER_Q);
  const [streak, setStreak]                 = useState(0);
  const [score, setScore]                   = useState(0);

  const [result, setResult]                 = useState<RapidFireSessionResult | null>(null);
  const timerRef                            = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef                        = useRef(0);

  useEffect(() => {
    rapidFireService.getPools()
      .then(setPools)
      .catch(() => toast.error('Failed to load pools'))
      .finally(() => setLoading(false));
  }, []);

  // Per-question timer
  useEffect(() => {
    if (view !== 'playing' || answered) return;
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    } else {
      autoAdvance();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [view, timeLeft, answered]);

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  const autoAdvance = () => {
    if (!activePool) return;
    const q = activePool.questions[currentIdx];
    const newAnswers = { ...answers, [q.id]: -1 }; // -1 = timed out
    setAnswers(newAnswers);
    setAnswered(true);
    setStreak(0);
    setTimeout(() => advance(newAnswers), 1200);
  };

  const handleSelect = (idx: number) => {
    if (answered) return;
    clearTimer();
    if (!activePool) return;
    const q = activePool.questions[currentIdx];
    const isCorrect = idx === q.correct_answer;
    const newAnswers = { ...answers, [q.id]: idx };
    setAnswers(newAnswers);
    setSelected(idx);
    setAnswered(true);
    if (isCorrect) { setStreak(p => p + 1); setScore(p => p + 1); }
    else setStreak(0);
    setTimeout(() => advance(newAnswers), 900);
  };

  const advance = (finalAnswers: Record<string, number>) => {
    if (!activePool) return;
    if (currentIdx < activePool.questions.length - 1) {
      setCurrentIdx(p => p + 1);
      setSelected(null);
      setAnswered(false);
      setTimeLeft(TIMER_PER_Q);
    } else {
      submitSession(finalAnswers);
    }
  };

  const submitSession = async (finalAnswers: Record<string, number>) => {
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    try {
      const res = await rapidFireService.submitSession(activePool!.id, finalAnswers, timeTaken);
      setResult(res);
      setView('result');
    } catch { toast.error('Failed to save session'); }
  };

  const handleStart = async (pool: RapidFirePool) => {
    try {
      setLoadingPool(true);
      const full = await rapidFireService.getPoolQuestions(pool.id, 10);
      setActivePool(full);
      setCurrentIdx(0);
      setSelected(null);
      setAnswered(false);
      setAnswers({});
      setTimeLeft(TIMER_PER_Q);
      setStreak(0);
      setScore(0);
      startTimeRef.current = Date.now();
      setView('playing');
    } catch { toast.error('Failed to load pool'); }
    finally { setLoadingPool(false); }
  };

  const handleRetry = () => { setView('catalog'); setResult(null); setActivePool(null); };

  // ── CATALOG ───────────────────────────────────────────────────────────────
  if (view === 'catalog') return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" /> Rapid Fire
          </h1>
          <p className="text-[11px] text-slate-500 font-light mt-0.5">
            Timed MCQ blitz — dynamic question pools, real-time scoring.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-amber-400" /></div>
      ) : pools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-white/[0.06] space-y-3">
          <LayoutGrid className="h-10 w-10 text-slate-700" />
          <p className="text-sm text-slate-500 font-semibold">No Rapid Fire pools published yet</p>
          <p className="text-[11px] text-slate-600 font-light">Admins can create pools in the Rapid Fire Builder.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pools.map(pool => (
            <div key={pool.id}
              className="flex flex-col gap-3 p-4 rounded-2xl border border-white/[0.05] bg-slate-950/30 backdrop-blur-xl hover:border-amber-500/20 hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border text-amber-400 bg-amber-500/[0.08] border-amber-500/20">
                  {pool.category}
                </span>
                <span className="text-[10px] text-slate-600 font-mono">{pool._count?.questions ?? 0} Qs</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">{pool.title}</h3>
                {pool.description && <p className="text-[11px] text-slate-500 mt-1 font-light line-clamp-2">{pool.description}</p>}
              </div>
              <div className="text-[10px] text-slate-600 flex items-center gap-1">
                <Timer className="h-3 w-3" /> {TIMER_PER_Q}s per question
              </div>
              <Button onClick={() => handleStart(pool)} disabled={loadingPool}
                className="w-full bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-400/30 text-amber-300 hover:text-white text-xs font-bold h-9 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                {loadingPool ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Zap className="h-3.5 w-3.5" /> Start Blitz</>}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── PLAYING ───────────────────────────────────────────────────────────────
  if (view === 'playing' && activePool) {
    const q = activePool.questions[currentIdx];
    const timerPct = (timeLeft / TIMER_PER_Q) * 100;

    return (
      <div className="space-y-4 animate-fade-in max-w-xl mx-auto">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1 text-amber-400">
              <Flame className="h-3.5 w-3.5" /> {streak}
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Target className="h-3.5 w-3.5" /> {score}/{currentIdx + (answered ? 1 : 0)}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold font-mono text-xs ${
            timeLeft <= 5 ? 'text-rose-400 border border-rose-500/30 bg-rose-500/10' : 'text-slate-300 border border-white/[0.05] bg-slate-900'
          }`}>
            <Timer className="h-3.5 w-3.5" /> {timeLeft}s
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${
            timerPct > 50 ? 'bg-emerald-500' : timerPct > 25 ? 'bg-amber-500' : 'bg-rose-500'
          }`} style={{ width: `${timerPct}%` }} />
        </div>

        {/* Question */}
        <div className="rounded-2xl border border-white/[0.05] bg-slate-950/40 backdrop-blur-xl p-5 space-y-4">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>{activePool.title}</span>
            <span>Q{currentIdx + 1}/{activePool.questions.length}</span>
          </div>
          <h2 className="text-sm font-bold text-white leading-relaxed">{q.question_text}</h2>
          <div className="space-y-2">
            {(q.options_json as string[]).map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrect  = idx === q.correct_answer;
              const show = answered;
              return (
                <button key={idx} onClick={() => handleSelect(idx)} disabled={answered}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                    show && isCorrect   ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 font-semibold' :
                    show && isSelected  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
                    isSelected          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' :
                                          'bg-white/[0.02] border-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.04] disabled:cursor-not-allowed'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 text-[9px] font-bold text-slate-600">{String.fromCharCode(65 + idx)}</span>
                    <span className="flex-1">{opt}</span>
                    {show && isCorrect  && <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                    {show && isSelected && !isCorrect && <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (view === 'result' && result) {
    const pct = result.total_questions > 0 ? Math.round((result.correct_count / result.total_questions) * 100) : 0;
    return (
      <div className="space-y-5 animate-fade-in max-w-xl mx-auto">
        <div className="rounded-2xl border border-white/[0.05] bg-slate-950/40 backdrop-blur-xl p-6 text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Trophy className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-white">Session Complete!</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Score', value: `${pct}%`, color: 'text-amber-400' },
              { label: 'Correct', value: `${result.correct_count}/${result.total_questions}`, color: 'text-emerald-400' },
              { label: 'Best Streak', value: result.maxStreak.toString(), color: 'text-purple-400' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 text-center">
                <div className={`text-xl font-extrabold font-mono ${s.color}`}>{s.value}</div>
                <div className="text-[9px] text-slate-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Review */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Review</p>
          {result.review.map((r, i) => (
            <div key={r.questionId}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs ${
                r.is_correct ? 'border-emerald-500/15 bg-emerald-500/[0.04]' : 'border-rose-500/15 bg-rose-500/[0.04]'
              }`}>
              {r.is_correct
                ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                : <XCircle    className="h-3.5 w-3.5 text-rose-400 shrink-0" />}
              <span className="flex-1 text-slate-300 truncate">Q{i + 1}: {r.question_text}</span>
              {!r.is_correct && r.explanation && (
                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{r.explanation}</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={() => activePool && handleStart(activePool as unknown as RapidFirePool)}
            className="flex-1 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 text-amber-300 hover:text-white text-xs font-bold h-9 rounded-xl cursor-pointer flex items-center justify-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </Button>
          <Button onClick={handleRetry} variant="ghost"
            className="flex-1 h-9 rounded-xl border border-white/[0.04] text-xs font-semibold text-slate-400 hover:text-white cursor-pointer">
            <ChevronRight className="h-3.5 w-3.5 rotate-180 mr-1" /> Pools
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
