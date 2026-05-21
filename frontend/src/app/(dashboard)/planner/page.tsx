'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Map, CheckCircle2, Circle, Loader2, ChevronRight, ChevronLeft,
  Rocket, Code2, Globe, Server, Database, Cpu,
  Calendar, Clock, Target, Trophy, RotateCcw, Zap, BookOpen,
  Brain, Mic, RefreshCcw, CheckCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  plannerService, LearningPlan, TodaysTasks, PlanProgress,
  TargetRole, PlannerSkillLevel,
} from '@/services/planner';

// ─── constants ───────────────────────────────────────────────────────────────

const ROLES: { value: TargetRole; label: string; desc: string; icon: React.ElementType }[] = [
  { value: 'BACKEND',      label: 'Backend Engineer',   desc: 'APIs, databases, system design', icon: Server },
  { value: 'FRONTEND',     label: 'Frontend Engineer',  desc: 'React, UI/UX, performance',      icon: Globe },
  { value: 'FULLSTACK',    label: 'Full Stack',         desc: 'End-to-end product engineering', icon: Code2 },
  { value: 'DEVOPS',       label: 'DevOps / SRE',       desc: 'CI/CD, infra, reliability',      icon: Cpu },
  { value: 'DATA_ENGINEER',label: 'Data Engineer',      desc: 'Pipelines, analytics, ML infra', icon: Database },
];

const SKILL_LEVELS: { value: PlannerSkillLevel; label: string; desc: string }[] = [
  { value: 'BEGINNER',     label: 'Beginner',      desc: 'Learning core fundamentals' },
  { value: 'INTERMEDIATE', label: 'Intermediate',  desc: 'Building real-world projects' },
  { value: 'ADVANCED',     label: 'Advanced',      desc: 'Targeting senior / staff roles' },
];

const HOURS_OPTIONS = [1, 2, 3, 4];
const DURATION_OPTIONS = [4, 8, 12, 16];

const CHECKPOINT_TYPE_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  LESSON:    { label: 'Lesson',    color: 'text-blue-400',   icon: BookOpen },
  PRACTICE:  { label: 'Practice',  color: 'text-purple-400', icon: Brain },
  REVISION:  { label: 'Revision',  color: 'text-amber-400',  icon: RefreshCcw },
  INTERVIEW: { label: 'Interview', color: 'text-emerald-400',icon: Mic },
};

// ─── Goal Setup Wizard ───────────────────────────────────────────────────────

interface Goals {
  targetRole: TargetRole | null;
  skillLevel: PlannerSkillLevel | null;
  hoursPerDay: number;
  durationWeeks: number;
}

function WizardStep({ step, label }: { step: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-300">{step}</div>
      <span className="text-[10px] text-slate-500 hidden sm:block">{label}</span>
    </div>
  );
}

function GoalWizard({ onGenerate }: { onGenerate: (goals: Goals) => void }) {
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<Goals>({ targetRole: null, skillLevel: null, hoursPerDay: 2, durationWeeks: 8 });
  const [generating, setGenerating] = useState(false);

  const canNext = () => {
    if (step === 1) return goals.targetRole !== null;
    if (step === 2) return goals.skillLevel !== null;
    return true;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    onGenerate(goals);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4">
            <Rocket className="h-7 w-7 text-purple-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Build Your Learning Roadmap</h1>
          <p className="text-slate-400 text-sm mt-1">Answer 4 quick questions — we'll generate a personalised plan.</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {['Target Role', 'Skill Level', 'Hours / Day', 'Duration'].map((label, i) => (
            <React.Fragment key={i}>
              <div className={`flex flex-col items-center gap-1 ${step === i + 1 ? 'opacity-100' : step > i + 1 ? 'opacity-60' : 'opacity-30'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${step > i + 1 ? 'bg-purple-500 border-purple-400 text-white' : step === i + 1 ? 'bg-purple-500/20 border-purple-400/60 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {step > i + 1 ? <CheckCheck className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className="text-[10px] text-slate-500 hidden sm:block">{label}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-px max-w-[40px] transition-all ${step > i + 1 ? 'bg-purple-500/50' : 'bg-slate-700'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] backdrop-blur-xl p-6 mb-6">
          {step === 1 && (
            <div>
              <h2 className="text-sm font-bold text-white mb-4">What role are you targeting?</h2>
              <div className="grid grid-cols-1 gap-2.5">
                {ROLES.map(({ value, label, desc, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setGoals(g => ({ ...g, targetRole: value }))}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${goals.targetRole === value ? 'border-purple-500/60 bg-purple-500/10' : 'border-white/[0.06] bg-slate-800/40 hover:border-white/10 hover:bg-slate-800/60'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${goals.targetRole === value ? 'bg-purple-500/20' : 'bg-slate-700/60'}`}>
                      <Icon className={`h-4 w-4 ${goals.targetRole === value ? 'text-purple-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${goals.targetRole === value ? 'text-purple-300' : 'text-white'}`}>{label}</div>
                      <div className="text-xs text-slate-500">{desc}</div>
                    </div>
                    {goals.targetRole === value && <CheckCircle2 className="h-4 w-4 text-purple-400 ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-sm font-bold text-white mb-4">What's your current experience level?</h2>
              <div className="grid grid-cols-1 gap-2.5">
                {SKILL_LEVELS.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => setGoals(g => ({ ...g, skillLevel: value }))}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${goals.skillLevel === value ? 'border-purple-500/60 bg-purple-500/10' : 'border-white/[0.06] bg-slate-800/40 hover:border-white/10 hover:bg-slate-800/60'}`}
                  >
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${goals.skillLevel === value ? 'text-purple-300' : 'text-white'}`}>{label}</div>
                      <div className="text-xs text-slate-500">{desc}</div>
                    </div>
                    {goals.skillLevel === value && <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-sm font-bold text-white mb-2">How many hours can you study per day?</h2>
              <p className="text-xs text-slate-500 mb-5">Be realistic — consistency beats cramming.</p>
              <div className="grid grid-cols-4 gap-3">
                {HOURS_OPTIONS.map(h => (
                  <button
                    key={h}
                    onClick={() => setGoals(g => ({ ...g, hoursPerDay: h }))}
                    className={`flex flex-col items-center justify-center py-5 rounded-xl border font-bold text-lg transition-all cursor-pointer ${goals.hoursPerDay === h ? 'border-purple-500/60 bg-purple-500/10 text-purple-300' : 'border-white/[0.06] bg-slate-800/40 text-white hover:border-white/10'}`}
                  >
                    {h}
                    <span className="text-[10px] font-normal text-slate-500 mt-0.5">hr{h > 1 ? 's' : ''}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-sm font-bold text-white mb-2">How many weeks do you have?</h2>
              <p className="text-xs text-slate-500 mb-5">Longer plans include more depth and interview sprints.</p>
              <div className="grid grid-cols-4 gap-3">
                {DURATION_OPTIONS.map(w => (
                  <button
                    key={w}
                    onClick={() => setGoals(g => ({ ...g, durationWeeks: w }))}
                    className={`flex flex-col items-center justify-center py-5 rounded-xl border font-bold text-lg transition-all cursor-pointer ${goals.durationWeeks === w ? 'border-purple-500/60 bg-purple-500/10 text-purple-300' : 'border-white/[0.06] bg-slate-800/40 text-white hover:border-white/10'}`}
                  >
                    {w}
                    <span className="text-[10px] font-normal text-slate-500 mt-0.5">wks</span>
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-5 rounded-xl bg-slate-800/50 border border-white/[0.05] p-4">
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-2">Your plan summary</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-500">Role: </span><span className="text-white font-medium">{ROLES.find(r => r.value === goals.targetRole)?.label}</span></div>
                  <div><span className="text-slate-500">Level: </span><span className="text-white font-medium">{goals.skillLevel}</span></div>
                  <div><span className="text-slate-500">Daily: </span><span className="text-white font-medium">{goals.hoursPerDay}h/day</span></div>
                  <div><span className="text-slate-500">Duration: </span><span className="text-white font-medium">{goals.durationWeeks} weeks</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white border border-white/[0.06] hover:border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/20 shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Rocket className="h-4 w-4" /> Generate My Roadmap</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 44 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#a855f7" strokeWidth="3"
        strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`} strokeLinecap="round" />
    </svg>
  );
}

// ─── Roadmap View ─────────────────────────────────────────────────────────────

function RoadmapView({
  plan, todaysTasks, progress,
  onCheckpointToggle, onReset, loadingCheckpoint,
}: {
  plan: LearningPlan;
  todaysTasks: TodaysTasks | null;
  progress: PlanProgress | null;
  onCheckpointToggle: (id: string, done: boolean) => void;
  onReset: () => void;
  loadingCheckpoint: string | null;
}) {
  const overallPct = progress?.overallPercentage ?? 0;
  const totalDone = progress?.completedCheckpoints ?? 0;
  const totalAll  = progress?.totalCheckpoints ?? 0;

  const roleLabel = ROLES.find(r => r.value === plan.target_role)?.label ?? plan.target_role;

  // Group checkpoints by week
  const byWeek: Record<number, typeof plan.checkpoints> = {};
  for (const cp of plan.checkpoints) {
    (byWeek[cp.week_number] ??= []).push(cp);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Map className="h-6 w-6 text-purple-400" />
            Learning Roadmap
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{roleLabel} · {plan.skill_level} · {plan.hours_per_day}h/day · {plan.duration_weeks} weeks</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white border border-white/[0.06] hover:border-white/10 transition-all cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" /> New Plan
        </button>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Overall Progress', value: `${overallPct}%`, icon: Target,   color: 'text-purple-400' },
          { label: 'Tasks Done',       value: `${totalDone}/${totalAll}`, icon: CheckCheck, color: 'text-emerald-400' },
          { label: 'Duration',         value: `${plan.duration_weeks}w`,  icon: Calendar,   color: 'text-blue-400' },
          { label: 'Daily Goal',       value: `${plan.hours_per_day}h`,   icon: Clock,      color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl bg-slate-900/50 border border-white/[0.05] p-4">
            <div className={`${color} mb-2`}><Icon className="h-4 w-4" /></div>
            <div className="text-xl font-extrabold text-white">{value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="rounded-2xl bg-slate-900/50 border border-white/[0.05] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white">Plan Completion</span>
          <span className="text-xs text-purple-400 font-bold">{overallPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500" style={{ width: `${overallPct}%` }} />
        </div>
        {progress?.weekProgress && (
          <div className="flex gap-1 mt-3">
            {progress.weekProgress.map(w => (
              <div key={w.weekNumber} className="flex-1 relative group">
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${w.percentage === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`} style={{ width: `${w.percentage}%` }} />
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  W{w.weekNumber}: {w.completed}/{w.total}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's tasks */}
      {todaysTasks && !todaysTasks.isWeekend && todaysTasks.tasks.length > 0 && (
        <div className="rounded-2xl bg-slate-900/50 border border-purple-500/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white">Today's Tasks</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 font-medium">
                Week {todaysTasks.weekNumber} · Day {todaysTasks.dayNumber}
              </span>
            </div>
            {todaysTasks.progress && (
              <span className="text-xs text-slate-400">{todaysTasks.progress.completed}/{todaysTasks.progress.total} done</span>
            )}
          </div>
          <div className="space-y-2.5">
            {todaysTasks.tasks.map(task => {
              const meta = CHECKPOINT_TYPE_META[task.type] ?? CHECKPOINT_TYPE_META['LESSON'];
              const Icon = meta.icon;
              const isLoading = loadingCheckpoint === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => !isLoading && !task.is_completed && onCheckpointToggle(task.id, task.is_completed)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${task.is_completed ? 'border-white/[0.04] bg-slate-800/20 opacity-60' : 'border-white/[0.06] bg-slate-800/40 hover:border-purple-500/30 hover:bg-slate-800/60 cursor-pointer'}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                    ) : task.is_completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${task.is_completed ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</div>
                    {task.description && <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</div>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-semibold ${meta.color} flex items-center gap-1`}>
                      <Icon className="h-3 w-3" />{meta.label}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5"><Clock className="h-3 w-3" />{task.estimated_minutes}m</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {todaysTasks?.isWeekend && (
        <div className="rounded-2xl bg-slate-900/50 border border-amber-500/20 p-5 flex items-center gap-3">
          <Trophy className="h-6 w-6 text-amber-400 flex-shrink-0" />
          <div>
            <div className="text-sm font-bold text-white">It's the weekend!</div>
            <div className="text-xs text-slate-400 mt-0.5">Take a break or review previous topics. You've earned it.</div>
          </div>
        </div>
      )}

      {/* Weekly roadmap */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" /> Weekly Roadmap
        </h2>
        <div className="space-y-3">
          {Object.entries(byWeek).map(([weekNum, tasks]) => {
            const wn = Number(weekNum);
            const weekData = progress?.weekProgress.find(w => w.weekNumber === wn);
            const pct = weekData?.percentage ?? 0;
            const done = weekData?.completed ?? 0;
            const total = weekData?.total ?? tasks.length;
            const isComplete = pct === 100;
            const weekTheme = (plan.roadmap_json as any)?.weeks?.[wn - 1]?.theme ?? `Week ${wn}`;

            return (
              <details key={wn} className="rounded-2xl bg-slate-900/50 border border-white/[0.05] overflow-hidden group">
                <summary className="flex items-center gap-3 p-4 cursor-pointer list-none select-none hover:bg-white/[0.02] transition-colors">
                  <ProgressRing pct={pct} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Week {wn}</span>
                      {isComplete && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">Complete</span>}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{weekTheme}</div>
                  </div>
                  <div className="text-xs text-slate-400 flex-shrink-0">{done}/{total}</div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-4 pb-4 space-y-2 border-t border-white/[0.04] pt-3">
                  {tasks.map(task => {
                    const meta = CHECKPOINT_TYPE_META[task.type] ?? CHECKPOINT_TYPE_META['LESSON'];
                    const Icon = meta.icon;
                    const isLoading = loadingCheckpoint === task.id;
                    return (
                      <div
                        key={task.id}
                        onClick={() => !isLoading && !task.is_completed && onCheckpointToggle(task.id, task.is_completed)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${task.is_completed ? 'border-white/[0.03] bg-slate-800/10 opacity-50' : 'border-white/[0.05] bg-slate-800/30 hover:border-purple-500/20 cursor-pointer'}`}
                      >
                        <div className="flex-shrink-0">
                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 text-purple-400 animate-spin" />
                          ) : task.is_completed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-slate-700" />
                          )}
                        </div>
                        <span className={`text-xs flex-1 min-w-0 ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>{task.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] font-medium ${meta.color} flex items-center gap-1`}>
                            <Icon className="h-3 w-3" />{meta.label}
                          </span>
                          <span className="text-[10px] text-slate-600">{task.estimated_minutes}m</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlannerPage() {
  const { user } = useAuth();

  const [plan, setPlan]               = useState<LearningPlan | null>(null);
  const [todaysTasks, setTodaysTasks] = useState<TodaysTasks | null>(null);
  const [progress, setProgress]       = useState<PlanProgress | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [loadingCheckpoint, setLoadingCheckpoint] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [p, tt, prog] = await Promise.all([
        plannerService.getUserPlan(user.id),
        plannerService.getTodaysTasks(user.id),
        plannerService.getPlanProgress(user.id),
      ]);
      setPlan(p);
      setTodaysTasks(tt);
      setProgress(prog);
    } catch {
      setError('Failed to load your plan. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  const handleGenerate = async (goals: Goals) => {
    if (!user || !goals.targetRole || !goals.skillLevel) return;
    try {
      const result = await plannerService.generatePlan({
        targetRole: goals.targetRole,
        skillLevel: goals.skillLevel,
        hoursPerDay: goals.hoursPerDay,
        durationWeeks: goals.durationWeeks,
      });
      setPlan(result.plan);
      await loadPlan();
    } catch {
      setError('Failed to generate plan. Please try again.');
    }
  };

  const handleCheckpointToggle = async (id: string, done: boolean) => {
    if (done) return;
    setLoadingCheckpoint(id);
    try {
      await plannerService.completeCheckpoint(id);
      // Update local state optimistically
      setPlan(p => p ? { ...p, checkpoints: p.checkpoints.map(c => c.id === id ? { ...c, is_completed: true, completed_at: new Date().toISOString() } : c) } : p);
      setTodaysTasks(t => t ? { ...t, tasks: t.tasks.map(c => c.id === id ? { ...c, is_completed: true, completed_at: new Date().toISOString() } : c) } : t);
      // Refresh progress
      if (user) {
        const prog = await plannerService.getPlanProgress(user.id);
        setProgress(prog);
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setLoadingCheckpoint(null);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setTodaysTasks(null);
    setProgress(null);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={loadPlan} className="text-xs text-purple-400 hover:text-purple-300 underline cursor-pointer">Retry</button>
      </div>
    );
  }

  if (!plan) {
    return <GoalWizard onGenerate={handleGenerate} />;
  }

  return (
    <RoadmapView
      plan={plan}
      todaysTasks={todaysTasks}
      progress={progress}
      onCheckpointToggle={handleCheckpointToggle}
      onReset={handleReset}
      loadingCheckpoint={loadingCheckpoint}
    />
  );
}
