'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
  Play,
  ArrowLeft,
  Filter,
  Zap,
  Shield,
  Globe,
  Cpu,
  Bug,
  Layers,
  Flame,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { practiceService, PracticeQuestion, ThinkingType, DifficultyLevel } from '@/services/practice';
import { progressService } from '@/services/progress';
import { PracticeFlow } from '@/components/practice/PracticeFlow';
import { ProgressDashboard, ThinkingSkillsRadar } from '@/components/practice/ProgressDashboard';
import { WeakAreas } from '@/components/practice/WeakAreas';

// ============================================================
// Constants
// ============================================================

const THINKING_TYPE_META: Record<ThinkingType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  LOGIC:        { label: 'Logic',        icon: <Brain className="h-4 w-4" />,    color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  DEBUGGING:    { label: 'Debugging',    icon: <Bug className="h-4 w-4" />,      color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  PERFORMANCE:  { label: 'Performance',  icon: <Zap className="h-4 w-4" />,      color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  ARCHITECTURE: { label: 'Architecture', icon: <Layers className="h-4 w-4" />,   color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  SECURITY:     { label: 'Security',     icon: <Shield className="h-4 w-4" />,   color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
  REAL_WORLD:   { label: 'Real World',   icon: <Globe className="h-4 w-4" />,    color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  INTERVIEW:    { label: 'Interview',    icon: <Cpu className="h-4 w-4" />,      color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
};

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  BEGINNER:     'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  INTERMEDIATE: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  ADVANCED:     'text-orange-400 bg-orange-500/10 border-orange-500/20',
  EXPERT:       'text-red-400 bg-red-500/10 border-red-500/20',
};

type PageView = 'hub' | 'practicing';
type ActiveTab = 'practice' | 'progress' | 'weak-areas';

// ============================================================
// Main Page
// ============================================================

export default function PracticePage() {
  const { user } = useAuth();

  // View state
  const [view, setView] = useState<PageView>('hub');
  const [activeTab, setActiveTab] = useState<ActiveTab>('practice');

  // Filter state
  const [selectedThinkingType, setSelectedThinkingType] = useState<ThinkingType | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | ''>('');

  // Questions state
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Session state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  // Progress & weak areas
  const [progress, setProgress] = useState<any>(null);
  const [thinkingScores, setThinkingScores] = useState<any[]>([]);
  const [weakAreas, setWeakAreas] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);

  // ---- Data fetching ----

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    setLoadingProgress(true);
    try {
      const [prog, scores, weak] = await Promise.all([
        practiceService.getPracticeProgress(user.id),
        practiceService.getThinkingScores(user.id),
        practiceService.getWeakAreas(user.id),
      ]);
      setProgress(prog);
      setThinkingScores(scores);
      setWeakAreas(weak);
    } catch {
      // silent — user may have no data yet
    } finally {
      setLoadingProgress(false);
    }
    progressService.getDashboard(user.id)
      .then(d => setStreak(d.overview.currentStreak))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // ---- Practice flow ----

  const startPractice = async (
    overrideThinking?: ThinkingType | '',
    overrideDifficulty?: DifficultyLevel | ''
  ) => {
    const thinking = overrideThinking !== undefined ? overrideThinking : selectedThinkingType;
    const difficulty = overrideDifficulty !== undefined ? overrideDifficulty : selectedDifficulty;

    setLoadingQuestions(true);
    try {
      const res = await practiceService.getPracticeQuestions({
        thinkingType: thinking || undefined,
        difficulty: difficulty || undefined,
        limit: 10,
      });
      setQuestions(res.data);
      setCurrentIndex(0);
    } catch {
      toast.error('Failed to load questions. Please try again.');
      setLoadingQuestions(false);
      return;
    } finally {
      setLoadingQuestions(false);
    }

    setShowFeedback(false);
    setFeedback(null);
    setSessionCorrect(0);
    setSessionTotal(0);
    setView('practicing');
  };

  const handleSubmit = async (answer: any, reasoning: string, timeTaken: number) => {
    if (!user || !questions[currentIndex]) return;
    setIsSubmitting(true);
    try {
      const session = await practiceService.submitAnswer(
        questions[currentIndex].id,
        answer,
        reasoning,
        timeTaken
      );
      setFeedback(session.feedback);
      setShowFeedback(true);
      setSessionTotal((t) => t + 1);
      if (session.is_correct) setSessionCorrect((c) => c + 1);
      // Refresh progress in background
      fetchProgress();
    } catch {
      toast.error('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setShowFeedback(false);
      setFeedback(null);
    } else {
      // Session complete
      toast.success(`Session complete! ${sessionCorrect} / ${sessionTotal} correct.`);
      setView('hub');
      setActiveTab('progress');
      fetchProgress();
    }
  };

  const handleSelectWeakArea = (thinkingType: string) => {
    setSelectedThinkingType(thinkingType as ThinkingType);
    setActiveTab('practice');
  };

  if (!user) return null;

  // ============================================================
  // Practicing View
  // ============================================================

  if (view === 'practicing') {
    const question = questions[currentIndex];
    const meta = question ? THINKING_TYPE_META[question.thinking_type] : null;

    if (loadingQuestions) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Loading questions...</p>
          </div>
        </div>
      );
    }

    if (!question) {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center py-20">
            <Brain className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-semibold mb-2">No questions found</p>
            <p className="text-slate-500 text-sm mb-6">Try different filters or check back later.</p>
            <Button
              onClick={() => setView('hub')}
              className="bg-purple-600 hover:bg-purple-500 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
            >
              Back to Hub
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setView('hub')}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Hub
          </button>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs">
              {currentIndex + 1} / {questions.length}
            </span>
            <div className="w-32 bg-slate-800 rounded-full h-1.5">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            {sessionTotal > 0 && (
              <span className="text-xs text-slate-400">
                <span className="text-green-400 font-semibold">{sessionCorrect}</span>/{sessionTotal} correct
              </span>
            )}
          </div>
        </div>

        {/* Question type badge */}
        {meta && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${meta.color} ${meta.bg}`}>
            {meta.icon}
            {meta.label} Thinking
          </div>
        )}

        {/* Practice Flow */}
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/20 via-white/[0.03] to-indigo-500/20">
          <div className="bg-slate-950/80 backdrop-blur-2xl rounded-3xl p-6">
            <PracticeFlow
              question={question}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              showFeedback={showFeedback}
              feedback={feedback}
            />

            {/* Next Question Button */}
            {showFeedback && (
              <button
                onClick={handleNextQuestion}
                className="mt-6 w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                {currentIndex + 1 < questions.length ? (
                  <>Next Question <ChevronRight className="h-4 w-4" /></>
                ) : (
                  <>Finish Session <Target className="h-4 w-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // Hub View
  // ============================================================

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Streak banner */}
      {streak !== null && streak > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <Flame className="h-5 w-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="text-sm font-bold text-amber-300">{streak}-day streak!</span>
            <span className="text-xs text-amber-500/80 ml-2">Keep it going — practice at least once today.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400" />
            Practice Hub
          </h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Validate your thinking across 7 skill dimensions and 9 question types.
          </p>
        </div>

        {progress && (
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-slate-300 font-semibold">{progress.overall_mastery_score}%</span>
              <span>mastery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-slate-300 font-semibold">{progress.questions_completed}</span>
              <span>completed</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/60 border border-white/[0.05] w-fit">
        {(['practice', 'progress', 'weak-areas'] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === tab ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'weak-areas' ? 'Weak Areas' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ---- PRACTICE TAB ---- */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/10 via-white/[0.02] to-indigo-500/10">
            <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-5">
              <CardHeader className="p-0 pb-4 border-b border-white/[0.04]">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Filter className="h-4 w-4 text-purple-400" />
                  Session Filters
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-500">
                  Narrow your practice focus or leave blank to practice everything.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-4 space-y-4">
                {/* Thinking Type */}
                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-3">Thinking Type</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedThinkingType('')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        selectedThinkingType === ''
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-slate-900/40 border-white/[0.05] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All Types
                    </button>
                    {(Object.keys(THINKING_TYPE_META) as ThinkingType[]).map((t) => {
                      const m = THINKING_TYPE_META[t];
                      const isSelected = selectedThinkingType === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setSelectedThinkingType(isSelected ? '' : t)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected ? `${m.color} ${m.bg}` : 'bg-slate-900/40 border-white/[0.05] text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {m.icon}
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-3">Difficulty</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedDifficulty('')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        selectedDifficulty === ''
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-slate-900/40 border-white/[0.05] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All Levels
                    </button>
                    {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as DifficultyLevel[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDifficulty(selectedDifficulty === d ? '' : d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          selectedDifficulty === d
                            ? DIFFICULTY_COLORS[d]
                            : 'bg-slate-900/40 border-white/[0.05] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {d.charAt(0) + d.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                  <Button
                    onClick={() => startPractice()}
                    disabled={loadingQuestions}
                    className="bg-purple-600 hover:bg-purple-500 text-xs font-bold px-6 py-2.5 rounded-xl border border-purple-400/20 shadow-[0_0_15px_rgba(147,51,234,0.25)] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {loadingQuestions ? (
                      <div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    )}
                    Start Practice Session
                  </Button>
                  {(selectedThinkingType || selectedDifficulty) && (
                    <button
                      onClick={() => { setSelectedThinkingType(''); setSelectedDifficulty(''); }}
                      className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Clear filters
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Launch — Thinking Types Grid */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Launch by Thinking Type</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.entries(THINKING_TYPE_META) as [ThinkingType, (typeof THINKING_TYPE_META)[ThinkingType]][]).map(([type, meta]) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedThinkingType(type);
                    startPractice(type);
                  }}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${meta.bg} hover:brightness-110`}
                >
                  <span className={meta.color}>{meta.icon}</span>
                  <span className={`text-xs font-bold ${meta.color}`}>{meta.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Weak Areas Quick View */}
          {weakAreas.length > 0 && (
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-orange-500/10 via-white/[0.02] to-red-500/10">
              <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-5">
                <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    <CardTitle className="text-sm font-bold text-white">Priority Focus Areas</CardTitle>
                  </div>
                  <Link
                    href="/practice/weak-areas"
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    View All <ChevronRight className="h-3 w-3" />
                  </Link>
                </CardHeader>
                <CardContent className="p-0 pt-3 space-y-2">
                  {weakAreas.slice(0, 3).map((area, i) => {
                    const meta = THINKING_TYPE_META[area.thinkingType as ThinkingType];
                    return (
                      <div key={area.thinkingType} className="flex items-center gap-3">
                        <div className="text-sm">{i === 0 ? '🔴' : i === 1 ? '🟠' : '🟡'}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-slate-300">{meta?.label || area.thinkingType}</span>
                            <span className="text-xs text-slate-400">{area.score}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1">
                            <div
                              className="bg-orange-400 h-1 rounded-full"
                              style={{ width: `${area.score}%` }}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedThinkingType(area.thinkingType as ThinkingType);
                            startPractice(area.thinkingType as ThinkingType);
                          }}
                          className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer transition-colors whitespace-nowrap"
                        >
                          Practice →
                        </button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ---- PROGRESS TAB ---- */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          {loadingProgress ? (
            <div className="flex items-center justify-center h-32">
              <div className="h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : progress ? (
            <>
              <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/10 via-white/[0.02] to-indigo-500/10">
                <div className="bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-6">
                  <ProgressDashboard progress={progress} thinkingScores={thinkingScores} />
                </div>
              </div>
              {thinkingScores.length > 0 && (
                <div className="rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500/10 via-white/[0.02] to-purple-500/10">
                  <div className="bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-6">
                    <ThinkingSkillsRadar thinkingScores={thinkingScores} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <TrendingUp className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-semibold mb-2">No progress data yet</p>
              <p className="text-slate-500 text-sm mb-6">Complete some practice sessions to see your progress.</p>
              <Button
                onClick={() => setActiveTab('practice')}
                className="bg-purple-600 hover:bg-purple-500 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Start Practicing
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ---- WEAK AREAS TAB ---- */}
      {activeTab === 'weak-areas' && (
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-orange-500/10 via-white/[0.02] to-red-500/10">
          <div className="bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-6">
            {loadingProgress ? (
              <div className="flex items-center justify-center h-32">
                <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <WeakAreas weakAreas={weakAreas} onSelectArea={handleSelectWeakArea} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
