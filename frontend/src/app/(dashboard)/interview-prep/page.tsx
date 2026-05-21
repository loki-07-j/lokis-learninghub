'use client';

import React, { useState, useCallback } from 'react';
import {
  Terminal,
  Zap,
  Brain,
  Bug,
  Layers,
  ArrowLeft,
  ChevronRight,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Star,
  Play,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  practiceService,
  PracticeQuestion,
  InterviewMode,
  InterviewSession,
} from '@/services/practice';
import { PracticeFlow } from '@/components/practice/PracticeFlow';

// ============================================================
// Mode Metadata
// ============================================================

interface ModeMeta {
  mode: InterviewMode;
  label: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  accent: string;
  tips: string[];
  questionCount: number;
}

const MODES: ModeMeta[] = [
  {
    mode: 'RAPID_FIRE',
    label: 'Rapid Fire',
    subtitle: 'Speed & Recall',
    description: 'Fast-paced questions testing instant recall. Minimal feedback, maximum throughput.',
    icon: <Zap className="h-6 w-6" />,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    accent: 'from-yellow-500/20',
    tips: ['Answer quickly — speed bonus applies', 'Trust your first instinct', 'Keep reasoning brief'],
    questionCount: 10,
  },
  {
    mode: 'EXPLAIN_THINKING',
    label: 'Explain Your Thinking',
    subtitle: 'Deep Reasoning',
    description: 'Scenario and architecture questions where the depth of your explanation matters most.',
    icon: <Brain className="h-6 w-6" />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    accent: 'from-purple-500/20',
    tips: ['Write detailed reasoning (200+ chars)', 'Explain trade-offs explicitly', 'Think out loud'],
    questionCount: 5,
  },
  {
    mode: 'DEBUGGING_ROUND',
    label: 'Debugging Round',
    subtitle: 'Find the Bug',
    description: 'Identify errors in code snippets and explain the fix. Tests your debugging instincts.',
    icon: <Bug className="h-6 w-6" />,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    accent: 'from-red-500/20',
    tips: ['Read code line by line', 'Look for edge cases', 'Consider runtime vs compile errors'],
    questionCount: 5,
  },
  {
    mode: 'ARCHITECTURE_DISCUSSION',
    label: 'Architecture Discussion',
    subtitle: 'System Design',
    description: 'Design system architectures and justify decisions. Senior-level thinking required.',
    icon: <Layers className="h-6 w-6" />,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
    accent: 'from-indigo-500/20',
    tips: ['Consider scalability', 'Discuss trade-offs', 'Think about data flow and bottlenecks'],
    questionCount: 5,
  },
];

// ============================================================
// Types
// ============================================================

type PageView = 'select' | 'session' | 'results';

interface SessionState {
  session: InterviewSession;
  questions: PracticeQuestion[];
  currentIndex: number;
  answers: Array<{ questionId: string; isCorrect: boolean; thinkingScore: number; feedback: any }>;
  mode: ModeMeta;
}

// ============================================================
// Results Screen
// ============================================================

function ResultsScreen({
  sessionState,
  onRestart,
  onNewMode,
}: {
  sessionState: SessionState;
  onRestart: () => void;
  onNewMode: () => void;
}) {
  const { session, answers, mode } = sessionState;
  const correct = answers.filter((a) => a.isCorrect).length;
  const total = answers.length;
  const avgScore = total > 0 ? Math.round(answers.reduce((s, a) => s + a.thinkingScore, 0) / total) : 0;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const getGrade = () => {
    if (accuracy >= 80) return { label: 'Excellent', color: 'text-green-400' };
    if (accuracy >= 60) return { label: 'Good', color: 'text-yellow-400' };
    if (accuracy >= 40) return { label: 'Keep Practicing', color: 'text-orange-400' };
    return { label: 'Needs Work', color: 'text-red-400' };
  };

  const grade = getGrade();

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div className="text-center space-y-2">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${mode.bg} ${mode.color}`}>
          {mode.icon}
          {mode.label} — Complete
        </div>
        <p className={`text-3xl font-extrabold ${grade.color}`}>{grade.label}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Accuracy', value: `${accuracy}%`, icon: <Target className="h-4 w-4" />, color: accuracy >= 60 ? 'text-green-400' : 'text-red-400' },
          { label: 'Avg Score', value: avgScore, icon: <Star className="h-4 w-4" />, color: avgScore >= 60 ? 'text-yellow-400' : 'text-orange-400' },
          { label: 'Correct', value: `${correct}/${total}`, icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-blue-400' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl p-[1px] bg-gradient-to-br from-white/[0.05] to-white/[0.02]">
            <div className="bg-slate-950/60 backdrop-blur rounded-2xl p-4 text-center">
              <div className={`flex justify-center mb-2 ${stat.color}`}>{stat.icon}</div>
              <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-slate-500 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Answer breakdown */}
      <div className="rounded-3xl p-[1px] bg-gradient-to-br from-white/[0.05] to-white/[0.02]">
        <div className="bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-5 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Answer Breakdown</p>
          {answers.map((ans, i) => {
            const q = sessionState.questions[i];
            return (
              <div key={ans.questionId} className="flex items-center gap-3">
                <div className={ans.isCorrect ? 'text-green-400' : 'text-red-400'}>
                  {ans.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </div>
                <p className="flex-1 text-xs text-slate-300 truncate">{q?.title || `Q${i + 1}`}</p>
                <span className={`text-xs font-bold ${ans.thinkingScore >= 60 ? 'text-green-400' : 'text-orange-400'}`}>
                  {ans.thinkingScore}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onRestart}
          className="flex-1 bg-purple-600 hover:bg-purple-500 text-xs font-bold py-3 rounded-xl cursor-pointer"
        >
          Retry This Mode
        </Button>
        <Button
          onClick={onNewMode}
          variant="ghost"
          className="flex-1 border border-white/[0.08] text-slate-300 hover:text-white text-xs font-bold py-3 rounded-xl cursor-pointer"
        >
          Choose Another Mode
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Mode Card
// ============================================================

function ModeCard({ meta, onStart, loading }: { meta: ModeMeta; onStart: () => void; loading: boolean }) {
  return (
    <div className={`rounded-3xl p-[1px] bg-gradient-to-br ${meta.accent} via-white/[0.02] to-white/[0.01]`}>
      <Card className="border-none bg-slate-950/60 backdrop-blur-2xl rounded-3xl p-5 h-full flex flex-col">
        <CardHeader className="p-0 pb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border w-fit text-xs font-bold ${meta.bg} ${meta.color} mb-3`}>
            {meta.icon}
            {meta.label}
          </div>
          <CardTitle className="text-sm font-bold text-white">{meta.subtitle}</CardTitle>
          <CardDescription className="text-[11px] text-slate-400 leading-relaxed mt-1">
            {meta.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col justify-between gap-4">
          <ul className="space-y-1.5">
            {meta.tips.map((tip, i) => (
              <li key={i} className="text-[10px] text-slate-500 flex items-start gap-1.5">
                <span className={`mt-0.5 text-[8px] ${meta.color}`}>▸</span>
                {tip}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {meta.questionCount} questions
            </span>
            <Button
              onClick={onStart}
              disabled={loading}
              className={`text-xs font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all ${meta.bg} ${meta.color} hover:brightness-125 border ${meta.bg.split(' ')[1]}`}
            >
              {loading ? (
                <div className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="h-3 w-3 fill-current" />
              )}
              Start
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function InterviewPrepPage() {
  const { user } = useAuth();
  const [view, setView] = useState<PageView>('select');
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [loadingMode, setLoadingMode] = useState<InterviewMode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const handleStartMode = useCallback(
    async (meta: ModeMeta) => {
      if (!user) return;
      setLoadingMode(meta.mode);
      try {
        const { session, questions } = await practiceService.startInterviewSession(
          meta.mode,
          meta.questionCount
        );
        setSessionState({
          session,
          questions,
          currentIndex: 0,
          answers: [],
          mode: meta,
        });
        setShowFeedback(false);
        setFeedback(null);
        setView('session');
      } catch {
        toast.error('Failed to start interview session. Please try again.');
      } finally {
        setLoadingMode(null);
      }
    },
    [user]
  );

  const handleSubmitAnswer = async (answer: any, reasoning: string, timeTaken: number) => {
    if (!sessionState) return;
    const question = sessionState.questions[sessionState.currentIndex];
    setIsSubmitting(true);
    try {
      const result = await practiceService.submitInterviewAnswer(
        sessionState.session.id,
        question.id,
        answer,
        reasoning,
        timeTaken
      );
      setFeedback(result.feedback);
      setShowFeedback(true);
      setSessionState((prev) =>
        prev
          ? {
              ...prev,
              answers: [
                ...prev.answers,
                {
                  questionId: question.id,
                  isCorrect: result.isCorrect,
                  thinkingScore: result.thinkingScore,
                  feedback: result.feedback,
                },
              ],
            }
          : prev
      );
    } catch {
      toast.error('Failed to submit answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!sessionState) return;
    const nextIndex = sessionState.currentIndex + 1;

    if (nextIndex >= sessionState.questions.length) {
      // Complete session
      try {
        await practiceService.completeInterviewSession(sessionState.session.id);
      } catch {
        // Non-fatal
      }
      setView('results');
    } else {
      setSessionState((prev) => prev ? { ...prev, currentIndex: nextIndex } : prev);
      setShowFeedback(false);
      setFeedback(null);
    }
  };

  const handleRestartMode = () => {
    if (sessionState) handleStartMode(sessionState.mode);
  };

  const handleNewMode = () => {
    setView('select');
    setSessionState(null);
    setShowFeedback(false);
    setFeedback(null);
  };

  if (!user) return null;

  // ---- Results ----
  if (view === 'results' && sessionState) {
    return (
      <div className="animate-fade-in">
        <ResultsScreen
          sessionState={sessionState}
          onRestart={handleRestartMode}
          onNewMode={handleNewMode}
        />
      </div>
    );
  }

  // ---- Active Session ----
  if (view === 'session' && sessionState) {
    const { questions, currentIndex, mode } = sessionState;
    const question = questions[currentIndex];

    return (
      <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleNewMode}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit Session
          </button>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${mode.color}`}>
              {mode.icon}
              <span>{mode.label}</span>
            </div>
            <span className="text-slate-500 text-xs">{currentIndex + 1}/{questions.length}</span>
            <div className="w-28 bg-slate-800 rounded-full h-1.5">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {question ? (
          <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/20 via-white/[0.03] to-indigo-500/20">
            <div className="bg-slate-950/80 backdrop-blur-2xl rounded-3xl p-6">
              <PracticeFlow
                question={question}
                onSubmit={handleSubmitAnswer}
                isSubmitting={isSubmitting}
                showFeedback={showFeedback}
                feedback={feedback}
              />
              {showFeedback && (
                <button
                  onClick={handleNext}
                  className="mt-6 w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  {currentIndex + 1 < questions.length ? (
                    <>Next Question <ChevronRight className="h-4 w-4" /></>
                  ) : (
                    <>See Results <TrendingUp className="h-4 w-4" /></>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="font-semibold mb-2">No questions available for this mode</p>
            <p className="text-sm text-slate-500 mb-6">
              An admin needs to add questions with matching types and thinking categories.
            </p>
            <Button onClick={handleNewMode} className="bg-purple-600 hover:bg-purple-500 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer">
              Back to Modes
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ---- Mode Selection ----
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Terminal className="h-6 w-6 text-purple-400" />
          Interview Prep
        </h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">
          4 specialised modes to simulate real interview scenarios and validate your thinking depth.
        </p>
      </div>

      {/* Mode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MODES.map((meta) => (
          <ModeCard
            key={meta.mode}
            meta={meta}
            onStart={() => handleStartMode(meta)}
            loading={loadingMode === meta.mode}
          />
        ))}
      </div>

      {/* Tips Banner */}
      <div className="rounded-2xl p-4 bg-slate-900/40 border border-white/[0.04] flex items-start gap-3">
        <Star className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-slate-300">Pro Tip</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Start with <span className="text-yellow-400 font-semibold">Rapid Fire</span> to benchmark recall speed,
            then move to <span className="text-purple-400 font-semibold">Explain Your Thinking</span> to deepen reasoning.
            Track your scores over multiple sessions to see real improvement.
          </p>
        </div>
      </div>
    </div>
  );
}
