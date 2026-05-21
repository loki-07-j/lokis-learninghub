'use client';

import { useState, useEffect, useRef } from 'react';
import { Award, Timer, CheckCircle, XCircle, ArrowRight, ShieldAlert, CheckCircle2,
  RotateCcw, Loader2, LayoutGrid, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { testService, Test, TestForAttempt, TestAttemptResult } from '@/services/tests';

type View = 'catalog' | 'taking' | 'result';

const DIFFICULTY_STYLE: Record<string, string> = {
  BEGINNER:     'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  INTERMEDIATE: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  ADVANCED:     'text-amber-400 bg-amber-500/10 border-amber-500/20',
  EXPERT:       'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export default function TestsPage() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [view, setView]                       = useState<View>('catalog');
  const [tests, setTests]                     = useState<Test[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [activeTest, setActiveTest]           = useState<TestForAttempt | null>(null);
  const [loadingTest, setLoadingTest]         = useState(false);
  const [result, setResult]                   = useState<TestAttemptResult | null>(null);
  const [search, setSearch]                   = useState('');

  const [currentIdx, setCurrentIdx]           = useState(0);
  const [selectedOption, setSelectedOption]   = useState<number | null>(null);
  const [answers, setAnswers]                 = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft]               = useState(0);
  const timerRef                              = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef                          = useRef<number>(0);

  // ── Load catalog ──────────────────────────────────────────────────────────
  useEffect(() => {
    testService.getTests().then(setTests).catch(() => toast.error('Failed to load tests')).finally(() => setLoading(false));
  }, []);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (view === 'taking' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    } else if (view === 'taking' && timeLeft === 0 && activeTest) {
      handleFinish(true);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [view, timeLeft]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── Start test ────────────────────────────────────────────────────────────
  const handleStart = async (test: Test) => {
    try {
      setLoadingTest(true);
      const full = await testService.getTestForAttempt(test.id);
      setActiveTest(full);
      setCurrentIdx(0);
      setSelectedOption(null);
      setAnswers({});
      setTimeLeft(full.duration_secs);
      startTimeRef.current = Date.now();
      setView('taking');
      toast.success(`${full.title} — Exam started!`);
    } catch { toast.error('Failed to load test'); }
    finally { setLoadingTest(false); }
  };

  // ── Next / Finish ─────────────────────────────────────────────────────────
  const handleNext = () => {
    if (selectedOption === null) { toast.error('Select an answer first'); return; }
    const q = activeTest!.questions[currentIdx];
    const updated = { ...answers, [q.id]: selectedOption };
    setAnswers(updated);

    if (currentIdx < activeTest!.questions.length - 1) {
      setCurrentIdx(p => p + 1);
      setSelectedOption(null);
    } else {
      handleFinish(false, updated);
    }
  };

  const handleFinish = async (timedOut = false, finalAnswers = answers) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (timedOut) toast.error('Time expired — auto-submitting…');
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    try {
      const res = await testService.submitAttempt(activeTest!.id, finalAnswers, timeTaken);
      setResult(res);
      setView('result');
      setTests(prev => prev); // keep catalog intact
      if (res.is_passed) toast.success(`Passed with ${res.score}%!`);
      else toast.error(`Failed with ${res.score}%. Review and retry.`);
    } catch { toast.error('Failed to submit test'); }
  };

  const handleRetry = () => {
    setView('catalog');
    setResult(null);
    setActiveTest(null);
    setCurrentIdx(0);
    setAnswers({});
    setSelectedOption(null);
  };

  const filtered = tests.filter(t =>
    !search.trim() ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  // ── CATALOG ───────────────────────────────────────────────────────────────
  if (view === 'catalog') return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-400" /> Assessment Center
          </h1>
          <p className="text-[11px] text-slate-500 font-light mt-0.5">
            Structured exams drawn from the live content engine — no hardcoded questions.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tests…"
            className="pl-8 pr-3 py-1.5 w-56 text-xs rounded-lg bg-white/[0.02] border border-white/[0.05] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/30 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-purple-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-white/[0.06] space-y-3">
          <LayoutGrid className="h-10 w-10 text-slate-700" />
          <p className="text-sm text-slate-500 font-semibold">{search ? 'No tests match your search' : 'No tests published yet'}</p>
          <p className="text-[11px] text-slate-600 font-light">Admins can create tests in the Assessment Builder.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(t => (
            <div key={t.id}
              className="flex flex-col gap-3 p-4 rounded-2xl border border-white/[0.05] bg-slate-950/30 backdrop-blur-xl hover:border-purple-500/20 hover:-translate-y-0.5 transition-all group">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${DIFFICULTY_STYLE[t.difficulty]}`}>
                  {t.difficulty}
                </span>
                <span className="text-[10px] text-slate-600 font-mono">{t._count?.questions ?? 0}Q</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">{t.title}</h3>
                {t.description && <p className="text-[11px] text-slate-500 mt-1 font-light line-clamp-2">{t.description}</p>}
              </div>
              <div className="mt-auto pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-500">
                <span>{Math.ceil(t.duration_secs / 60)} min · Pass {t.passing_score}%</span>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">{t.category}</span>
              </div>
              <Button onClick={() => handleStart(t)} disabled={loadingTest}
                className="w-full bg-purple-600 hover:bg-purple-500 text-xs font-bold h-9 rounded-xl border border-purple-400/20 shadow-[0_0_15px_rgba(147,51,234,0.2)] transition-all cursor-pointer flex items-center justify-center gap-1.5">
                {loadingTest ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><ShieldAlert className="h-3.5 w-3.5" /> Start Exam</>}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── TAKING ────────────────────────────────────────────────────────────────
  if (view === 'taking' && activeTest) {
    const q = activeTest.questions[currentIdx];
    return (
      <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white">{activeTest.title}</h1>
            <p className="text-[10px] text-slate-500">Question {currentIdx + 1} of {activeTest.questions.length}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.05] text-xs font-bold font-mono ${timeLeft < 30 ? 'text-rose-400' : 'text-slate-300'}`}>
            <Timer className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / activeTest.questions.length) * 100}%` }} />
        </div>

        {/* Question */}
        <div className="rounded-2xl border border-white/[0.05] bg-slate-950/40 backdrop-blur-xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-white leading-relaxed">{q.question_text}</h2>
          <div className="space-y-2.5">
            {q.options_json.map((opt, idx) => (
              <button key={idx} onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer ${
                  selectedOption === idx
                    ? 'bg-purple-600/10 border-purple-500/40 text-purple-200 font-semibold'
                    : 'bg-slate-950/20 border-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 h-5 w-5 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                    selectedOption === idx ? 'border-purple-400 text-purple-400 bg-purple-500/10' : 'border-slate-700 text-slate-600'
                  }`}>{String.fromCharCode(65 + idx)}</span>
                  {opt}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setView('catalog')}
            className="h-9 px-4 rounded-xl border border-white/[0.04] text-slate-400 hover:text-white text-xs font-semibold cursor-pointer">
            Quit
          </Button>
          <Button onClick={handleNext} disabled={selectedOption === null}
            className="bg-purple-600 hover:bg-purple-500 text-xs font-bold px-5 h-9 rounded-xl border border-purple-400/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50">
            {currentIdx === activeTest.questions.length - 1 ? 'Submit' : 'Next'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (view === 'result' && result && activeTest) return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      <div className="rounded-2xl border border-white/[0.05] bg-slate-950/40 backdrop-blur-xl p-6 text-center space-y-4">
        <div className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center ${
          result.is_passed ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
        }`}>
          {result.is_passed ? <CheckCircle2 className="h-7 w-7" /> : <ShieldAlert className="h-7 w-7" />}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{result.is_passed ? 'Exam Passed!' : 'Exam Failed'}</h2>
          <p className="text-[11px] text-slate-400 mt-1 font-light">
            {result.correct} / {result.total} correct · {Math.ceil(result.time_taken / 60)}m taken
          </p>
        </div>
        <div className={`text-4xl font-extrabold font-mono ${result.is_passed ? 'text-emerald-400' : 'text-rose-400'}`}>
          {result.score}%
        </div>
      </div>

      {/* Review */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Review</p>
        {result.review.map((r, i) => (
          <div key={r.questionId} className="rounded-xl border border-white/[0.04] bg-slate-950/20 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-start justify-between gap-3">
              <span className="text-white font-semibold">Q{i + 1}: {r.question_text}</span>
              {r.is_correct ? <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" /> : <XCircle className="h-4 w-4 text-rose-400 shrink-0" />}
            </div>
            {!r.is_correct && (
              <p className="text-[10px] text-slate-500">
                <span className="text-slate-400 font-semibold">Correct: </span>{r.options[r.correct_answer]}
              </p>
            )}
            <p className="text-[10px] text-slate-600 leading-relaxed">{r.explanation}</p>
          </div>
        ))}
      </div>

      <Button onClick={handleRetry}
        className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-bold h-10 rounded-xl border border-white/[0.05] text-white cursor-pointer flex items-center justify-center gap-1.5">
        <RotateCcw className="h-4 w-4" /> Back to Catalog
      </Button>
    </div>
  );

  return null;
}
