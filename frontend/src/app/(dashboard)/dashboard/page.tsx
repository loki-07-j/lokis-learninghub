'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, Flame, Target, TrendingUp, ArrowRight, BookOpen, Brain,
  Award, RotateCcw, Terminal, Map as MapIcon, NotebookPen, Wand2, Clock,
  CheckCircle2, Circle, Calendar, AlertTriangle, Star, Mic, RefreshCcw,
  PlayCircle, ChevronRight, Loader2, Activity, ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { progressService, ProgressDashboard, HeatmapDay } from '@/services/progress';
import { plannerService, TodaysTasks, PlanCheckpoint } from '@/services/planner';
import { courseService, Course } from '@/services/course';
import { toast } from 'sonner';

// ─── Motivational content ─────────────────────────────────────────────────────

const SUBTITLES = [
  'The real learning starts with WHY.',
  'Build understanding, not memorization.',
  'Continue your learning journey.',
  'Beyond tutorials. Into real understanding.',
  'Today’s thinking compounds into tomorrow’s mastery.',
];

const PHILOSOPHY = [
  { quote: 'Don’t collect answers. Build thinking.', tag: 'Mental models' },
  { quote: 'Why matters more than what.',                tag: 'First principles' },
  { quote: 'Beyond tutorials. Into real understanding.', tag: 'Depth over speed' },
  { quote: 'Consistency compounds. Cramming evaporates.',tag: 'Habits' },
  { quote: 'Code is the side effect. Thinking is the craft.', tag: 'Craftsmanship' },
];

// Stable per-day pick so the subtitle doesn't flicker on re-render
function pickByDate<T>(items: T[]): T {
  const day = Math.floor(Date.now() / 86_400_000);
  return items[day % items.length];
}

// ─── Tiny visual primitives ───────────────────────────────────────────────────

function RadialProgress({ value, size = 64, stroke = 5, accent = '#a855f7', trail = 'rgba(255,255,255,0.06)' }: {
  value: number; size?: number; stroke?: number; accent?: string; trail?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.min(Math.max(value, 0), 100) / 100 * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trail} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={accent} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash.toFixed(1)} ${c.toFixed(1)}`}
        style={{ transition: 'stroke-dasharray 600ms cubic-bezier(.22,.61,.36,1)' }}
      />
    </svg>
  );
}

function MiniHeatmap({ days }: { days: HeatmapDay[] }) {
  // Show the last 12 weeks, organised as columns of 7
  const trimmed = days.slice(-84);
  const cols: HeatmapDay[][] = [];
  let cur: HeatmapDay[] = [];
  trimmed.forEach((d) => {
    cur.push(d);
    if (cur.length === 7) { cols.push(cur); cur = []; }
  });
  if (cur.length) cols.push(cur);

  const colors = [
    'bg-white/[0.03]',
    'bg-purple-900/50',
    'bg-purple-700/70',
    'bg-purple-500/80',
    'bg-purple-400',
  ];

  if (cols.length === 0) return (
    <p className="text-[10px] text-slate-600">Start practicing to light up your activity grid.</p>
  );

  return (
    <div className="flex gap-[3px]">
      {cols.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((d) => (
            <div
              key={d.date}
              title={`${d.date} · ${d.questions} questions, ${d.correct} correct`}
              className={`w-2.5 h-2.5 rounded-[3px] ${colors[d.intensity]} transition-colors`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();

  const [dash, setDash]               = useState<ProgressDashboard | null>(null);
  const [heatmap, setHeatmap]         = useState<HeatmapDay[]>([]);
  const [todaysTasks, setTodaysTasks] = useState<TodaysTasks | null>(null);
  const [hasPlan, setHasPlan]         = useState(false);
  const [courses, setCourses]         = useState<Course[]>([]);
  const [loading, setLoading]         = useState(true);
  const [completing, setCompleting]   = useState<string | null>(null);

  const subtitle  = useMemo(() => pickByDate(SUBTITLES),  []);
  const philosophy = useMemo(() => pickByDate(PHILOSOPHY), []);

  // ── Parallel data fetch ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const settled = await Promise.allSettled([
        progressService.getDashboard(user.id),
        progressService.getHeatmap(user.id, 12),
        plannerService.getUserPlan(user.id),
        courseService.getCourses(),
      ]);
      if (cancelled) return;

      const [d, h, plan, cs] = settled;
      if (d.status === 'fulfilled') setDash(d.value);
      if (h.status === 'fulfilled') setHeatmap(h.value);
      if (cs.status === 'fulfilled') setCourses(cs.value);

      if (plan.status === 'fulfilled' && plan.value) {
        setHasPlan(true);
        try {
          const tt = await plannerService.getTodaysTasks(user.id);
          if (!cancelled) setTodaysTasks(tt);
        } catch { /* silent */ }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const overview   = dash?.overview;
  const readiness  = dash?.interviewReadiness;
  const recents    = dash?.recentSessions ?? [];
  const weakAreas  = dash?.weakAreas ?? [];
  const masteries  = dash?.conceptMasteries ?? [];

  const todayDone  = todaysTasks?.tasks.filter((t) => t.is_completed).length ?? 0;
  const todayTotal = todaysTasks?.tasks.length ?? 0;
  const todayPct   = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  const strongest = useMemo(() => {
    if (!dash?.radarData?.length) return null;
    return [...dash.radarData].sort((a, b) => b.score - a.score)[0];
  }, [dash]);

  // Rough per-course progress derived from concept masteries
  const courseProgress = useMemo(() => {
    const map = new Map<string, { sum: number; count: number; lastAt: number; lastTopic: string }>();
    for (const m of masteries) {
      const k = m.courseTitle;
      const prev = map.get(k) ?? { sum: 0, count: 0, lastAt: 0, lastTopic: '' };
      prev.sum += m.masteryScore;
      prev.count += 1;
      const t = m.lastActivityAt ? new Date(m.lastActivityAt).getTime() : 0;
      if (t > prev.lastAt) { prev.lastAt = t; prev.lastTopic = m.topicTitle; }
      map.set(k, prev);
    }
    return map;
  }, [masteries]);

  // Continue Learning: pick up to 4 courses, prioritising ones with activity
  const continueLearning = useMemo(() => {
    const enriched = courses.map((c) => {
      const p = courseProgress.get(c.title);
      return {
        course: c,
        progress: p ? Math.round(p.sum / p.count) : 0,
        topics: p?.count ?? 0,
        lastAt: p?.lastAt ?? 0,
        lastTopic: p?.lastTopic ?? '',
      };
    });
    enriched.sort((a, b) => b.lastAt - a.lastAt || b.progress - a.progress);
    return enriched.slice(0, 6);
  }, [courses, courseProgress]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleQuickComplete = async (cp: PlanCheckpoint) => {
    if (cp.is_completed) return;
    setCompleting(cp.id);
    try {
      await plannerService.completeCheckpoint(cp.id);
      setTodaysTasks((t) => t ? {
        ...t,
        tasks: t.tasks.map((x) => x.id === cp.id ? { ...x, is_completed: true, completed_at: new Date().toISOString() } : x),
      } : t);
    } catch {
      toast.error('Couldn’t mark as done. Try again.');
    } finally {
      setCompleting(null);
    }
  };

  if (!user) return null;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 select-none">

      {/* =============== 1. WELCOME HERO =============== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.05] bg-gradient-to-br from-purple-600/[0.08] via-slate-950/40 to-indigo-600/[0.06] backdrop-blur-2xl"
      >
        {/* Animated mesh background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl"
               style={{ animation: 'pulse 6s ease-in-out infinite' }} />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative p-6 sm:p-8 flex flex-col lg:flex-row gap-6 lg:items-center">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-purple-300/70">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Personal learning OS
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, {user.name?.split(' ')[0] ?? 'Seeker'} <span className="inline-block animate-wave origin-bottom-right">👋</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 font-light max-w-xl">{subtitle}</p>

            <div className="mt-5 flex items-center gap-3">
              <Link href="/learn">
                <button className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold border border-purple-400/30 shadow-[0_0_20px_rgba(147,51,234,0.25)] hover:shadow-[0_0_30px_rgba(147,51,234,0.45)] transition-all cursor-pointer">
                  <PlayCircle className="h-4 w-4" />
                  Resume learning
                  <ArrowRight className="h-3.5 w-3.5 -ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link href="/planner" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                {hasPlan ? 'Open roadmap' : 'Build a roadmap'} <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Hero stat chips */}
          <div className="grid grid-cols-3 gap-3 lg:w-[440px] shrink-0">
            <HeroStat
              icon={<Flame className="h-4 w-4" />}
              accent="text-amber-300"
              ring="ring-amber-400/20"
              glow="from-amber-500/15"
              label="Streak"
              value={`${overview?.currentStreak ?? 0}d`}
              hint={`Best ${overview?.longestStreak ?? 0}d`}
            />
            <HeroStat
              icon={<Target className="h-4 w-4" />}
              accent="text-emerald-300"
              ring="ring-emerald-400/20"
              glow="from-emerald-500/15"
              label="Today"
              value={todayTotal > 0 ? `${todayDone}/${todayTotal}` : '0'}
              hint={todayTotal > 0 ? `${todayPct}% done` : 'No tasks'}
            />
            <HeroStat
              icon={<TrendingUp className="h-4 w-4" />}
              accent="text-purple-300"
              ring="ring-purple-400/25"
              glow="from-purple-500/15"
              label="Mastery"
              value={`${overview?.overallMastery ?? 0}%`}
              hint={readiness ? readiness.level : 'Just getting started'}
            />
          </div>
        </div>
      </motion.section>

      {/* =============== 2. CONTINUE LEARNING =============== */}
      <SectionFrame
        title="Continue learning"
        subtitle="Pick up where you left off"
        action={<Link href="/learn" className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center gap-1 transition-colors">All courses <ChevronRight className="h-3 w-3" /></Link>}
      >
        {loading ? (
          <LoadingStrip />
        ) : continueLearning.length === 0 ? (
          <EmptyTile
            icon={<BookOpen className="h-7 w-7" />}
            title="No courses available yet"
            hint="Once courses are published, your in-progress modules will appear here."
            cta={{ label: 'Browse Learn Hub', href: '/learn' }}
          />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-thin">
            {continueLearning.map(({ course, progress, topics, lastTopic }, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="snap-start shrink-0 w-[280px] sm:w-[300px]"
              >
                <Link href={`/learn/${course.slug}`} className="block group">
                  <div className="relative h-full rounded-2xl border border-white/[0.06] bg-slate-950/50 backdrop-blur-xl overflow-hidden hover:border-purple-400/30 hover:-translate-y-0.5 hover:shadow-[0_0_40px_-12px_rgba(147,51,234,0.5)] transition-all duration-300">
                    {/* Banner */}
                    <div className="relative h-24 bg-gradient-to-br from-purple-600/20 via-indigo-600/15 to-slate-950 overflow-hidden">
                      <div className="absolute inset-0 opacity-40"
                           style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(168,85,247,0.3), transparent 70%)' }} />
                      <div className="absolute bottom-2 left-3 text-[9px] font-bold uppercase tracking-wider text-purple-200/80">
                        {topics > 0 ? `${topics} topic${topics !== 1 ? 's' : ''} touched` : 'New course'}
                      </div>
                      <div className="absolute top-2 right-2 h-7 w-7 rounded-full border border-white/10 bg-slate-950/60 backdrop-blur flex items-center justify-center text-purple-300 group-hover:rotate-12 transition-transform">
                        <BookOpen className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors line-clamp-1">{course.title}</h3>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {lastTopic ? <>Last: <span className="text-slate-400">{lastTopic}</span></> : (course.description || 'Start your first topic')}
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Progress</span>
                          <span className="text-[10px] font-bold text-purple-300">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-700"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> ~{Math.max(5, (100 - progress) * 2)}m left
                        </span>
                        <span className="text-[10px] text-purple-300 font-semibold flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          Continue <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </SectionFrame>

      {/* =============== 3. QUICK ACTIONS =============== */}
      <SectionFrame title="Quick actions" subtitle="Jump straight into a workspace">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((a, i) => (
            <QuickActionCard key={a.label} action={a} index={i} />
          ))}
        </div>
      </SectionFrame>

      {/* =============== 4 + 5. INSIGHTS  +  PLANNER (2-up grid) =============== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Insights */}
        <SectionFrame className="lg:col-span-3" title="Learning insights" subtitle="Signal, not noise">
          {loading ? (
            <LoadingStrip />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Total questions / mastery radial */}
              <InsightTile
                label="Mastery"
                value={`${overview?.overallMastery ?? 0}%`}
                visual={
                  <div className="relative">
                    <RadialProgress value={overview?.overallMastery ?? 0} size={72} stroke={6} accent="#a855f7" />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-purple-300">
                      {overview?.totalCompleted ?? 0}
                    </span>
                  </div>
                }
                hint={`${overview?.totalCorrect ?? 0} correct of ${overview?.totalCompleted ?? 0}`}
              />

              <InsightTile
                label="Interview ready"
                value={`${readiness?.readinessScore ?? 0}%`}
                visual={
                  <RadialProgress value={readiness?.readinessScore ?? 0} size={72} stroke={6} accent="#34d399" />
                }
                hint={readiness?.level ?? 'Get started'}
              />

              <InsightTile
                label="Strongest"
                value={strongest ? `${strongest.score}%` : '—'}
                visual={
                  <div className="h-[72px] w-[72px] rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center">
                    <Star className="h-7 w-7 text-emerald-300" />
                  </div>
                }
                hint={strongest ? prettifyType(strongest.type) : 'Take a few sessions to see your edge'}
              />

              {/* Activity heatmap full-width */}
              <div className="col-span-2 md:col-span-3 rounded-2xl border border-white/[0.05] bg-slate-950/40 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-purple-300" />
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Activity — last 12 weeks</p>
                  </div>
                  <Link href="/progress" className="text-[10px] text-slate-500 hover:text-purple-300 flex items-center gap-0.5 transition-colors">
                    Detailed view <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
                <MiniHeatmap days={heatmap} />
              </div>

              {/* Weak areas */}
              <div className="col-span-2 md:col-span-3 rounded-2xl border border-white/[0.05] bg-slate-950/40 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-orange-300" />
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Focus next</p>
                  </div>
                  <Link href="/practice/weak-areas" className="text-[10px] text-slate-500 hover:text-orange-300 flex items-center gap-0.5 transition-colors">
                    Practice <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
                {weakAreas.length === 0 ? (
                  <p className="text-[11px] text-emerald-300/80">All thinking dimensions look balanced. 🎉</p>
                ) : (
                  <div className="space-y-2">
                    {weakAreas.slice(0, 3).map((wa) => (
                      <div key={wa.thinkingType} className="flex items-center gap-2.5">
                        <span className="text-[10px] font-semibold text-slate-300 min-w-[88px]">{prettifyType(wa.thinkingType)}</span>
                        <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400" style={{ width: `${wa.score}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-orange-300 w-8 text-right">{wa.score}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SectionFrame>

        {/* Today's Planner */}
        <SectionFrame
          className="lg:col-span-2"
          title="Today’s focus"
          subtitle={hasPlan ? (todaysTasks?.weekTheme ?? 'Your scheduled checkpoints') : 'Generate a plan to see tasks'}
          action={
            hasPlan ? (
              <Link href="/planner" className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                Planner <ChevronRight className="h-3 w-3" />
              </Link>
            ) : null
          }
        >
          {!hasPlan ? (
            <EmptyTile
              icon={<MapIcon className="h-7 w-7" />}
              title="No roadmap yet"
              hint="Generate a personalised learning plan tailored to your target role."
              cta={{ label: 'Build my roadmap', href: '/planner' }}
            />
          ) : todaysTasks?.isWeekend ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">It’s the weekend</p>
                <p className="text-[11px] text-slate-400">Rest or revisit a tough concept — momentum beats burnout.</p>
              </div>
            </div>
          ) : (todaysTasks?.tasks.length ?? 0) === 0 ? (
            <EmptyTile
              icon={<CheckCircle2 className="h-7 w-7" />}
              title="All clear for today"
              hint="Get a head start — try a quick practice or a revision deck."
              cta={{ label: 'Open practice hub', href: '/practice' }}
            />
          ) : (
            <div className="space-y-3">
              {/* Compact progress bar */}
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Week {todaysTasks!.weekNumber} · Day {todaysTasks!.dayNumber ?? '–'}
                  </span>
                  <span className="text-[10px] font-bold text-purple-300">{todayDone}/{todayTotal} · {todayPct}%</span>
                </div>
                <div className="h-1 w-full bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 transition-all duration-700"
                    style={{ width: `${todayPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                {todaysTasks!.tasks.map((task) => {
                  const meta = CHECKPOINT_META[task.type] ?? CHECKPOINT_META.LESSON;
                  const Icon = meta.icon;
                  const busy = completing === task.id;
                  return (
                    <button
                      key={task.id}
                      onClick={() => handleQuickComplete(task)}
                      disabled={task.is_completed || busy}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        task.is_completed
                          ? 'border-white/[0.03] bg-white/[0.01] opacity-50'
                          : 'border-white/[0.06] bg-slate-950/40 hover:border-purple-500/30 hover:bg-slate-900/60'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {busy ? (
                          <Loader2 className="h-4 w-4 text-purple-300 animate-spin" />
                        ) : task.is_completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-600 group-hover:text-purple-300 transition-colors" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${task.is_completed ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                          <span className={`inline-flex items-center gap-1 ${meta.color}`}>
                            <Icon className="h-3 w-3" />{meta.label}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{task.estimated_minutes}m</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </SectionFrame>
      </div>

      {/* =============== 6. RECENT ACTIVITY =============== */}
      <SectionFrame
        title="Recent activity"
        subtitle="Your last few sessions, at a glance"
        action={<Link href="/progress" className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center gap-1 transition-colors">All sessions <ChevronRight className="h-3 w-3" /></Link>}
      >
        {loading ? (
          <LoadingStrip />
        ) : recents.length === 0 ? (
          <EmptyTile
            icon={<Activity className="h-7 w-7" />}
            title="Nothing here yet"
            hint="Run your first practice session and we’ll keep a live log here."
            cta={{ label: 'Start a session', href: '/practice' }}
          />
        ) : (
          <div className="relative pl-4">
            <span className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-purple-500/40 via-white/[0.06] to-transparent" />
            <ul className="space-y-2.5">
              {recents.slice(0, 6).map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="relative"
                >
                  <span className={`absolute -left-[10px] top-3 h-2 w-2 rounded-full ring-4 ring-slate-950 ${s.isCorrect ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <div className="ml-4 flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] bg-slate-950/40 backdrop-blur-xl hover:border-white/10 transition-colors">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      s.isCorrect ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20'
                                  : 'bg-rose-500/10 text-rose-300 border border-rose-400/20'
                    }`}>
                      {s.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{s.questionTitle}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {prettifyType(s.thinkingType)} · {formatTimeAgo(s.completedAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${s.isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>{s.thinkingScore}</p>
                      <p className="text-[9px] text-slate-600">{Math.floor(s.timeTaken / 60)}m{s.timeTaken % 60}s</p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </SectionFrame>

      {/* =============== 7. PHILOSOPHY =============== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.05] bg-gradient-to-r from-slate-950/60 via-purple-950/30 to-slate-950/60 backdrop-blur-2xl p-6 sm:p-8"
      >
        <div aria-hidden className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-16 left-1/3 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="h-12 w-12 rounded-2xl bg-purple-500/15 border border-purple-400/25 flex items-center justify-center shrink-0">
            <Brain className="h-6 w-6 text-purple-300" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-purple-300/70">{philosophy.tag}</p>
            <blockquote className="mt-1 text-lg sm:text-xl font-bold text-white leading-snug">
              “{philosophy.quote}”
            </blockquote>
            <p className="mt-2 text-[11px] text-slate-500">A daily nudge from Loki’s thinking engine.</p>
          </div>
        </div>
      </motion.section>

      {/* Local wave animation keyframe */}
      <style jsx global>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          15%      { transform: rotate(14deg); }
          30%      { transform: rotate(-8deg); }
          45%      { transform: rotate(14deg); }
          60%      { transform: rotate(-4deg); }
          75%      { transform: rotate(10deg); }
        }
        .animate-wave { animation: wave 2.4s ease-in-out 1; display: inline-block; }
        .scrollbar-thin::-webkit-scrollbar { height: 6px; width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.25); border-radius: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function HeroStat({ icon, accent, ring, glow, label, value, hint }: {
  icon: React.ReactNode; accent: string; ring: string; glow: string;
  label: string; value: string; hint: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-950/40 backdrop-blur-xl p-3.5 ring-1 ${ring} transition-all hover:-translate-y-0.5`}>
      <div aria-hidden className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl`} />
      <div className={`relative flex items-center gap-1.5 ${accent}`}>
        {icon}
        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">{label}</span>
      </div>
      <p className={`relative mt-1.5 text-2xl font-extrabold ${accent}`}>{value}</p>
      <p className="relative text-[10px] text-slate-500 mt-0.5 truncate">{hint}</p>
    </div>
  );
}

function SectionFrame({
  title, subtitle, action, children, className = '',
}: {
  title: string; subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="flex items-end justify-between mb-3 gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500 font-light mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function InsightTile({ label, value, visual, hint }: {
  label: string; value: string; visual: React.ReactNode; hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-slate-950/40 backdrop-blur-xl p-4 flex flex-col items-start gap-2">
      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
      <div className="w-full flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl font-extrabold text-white truncate">{value}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{hint}</p>
        </div>
        <div className="shrink-0">{visual}</div>
      </div>
    </div>
  );
}

function EmptyTile({ icon, title, hint, cta }: {
  icon: React.ReactNode; title: string; hint: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.01] p-8 text-center space-y-3">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-400/20 text-purple-300 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">{hint}</p>
      </div>
      {cta && (
        <Link href={cta.href}>
          <button className="mt-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold border border-purple-400/30 transition-all cursor-pointer">
            {cta.label}
          </button>
        </Link>
      )}
    </div>
  );
}

function LoadingStrip() {
  return (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
    </div>
  );
}

// ─── Quick actions config ────────────────────────────────────────────────────

interface QuickAction {
  label: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
  accent: string;   // text color
  glow: string;     // gradient stop color (e.g. 'from-purple-500/15')
  ring: string;     // ring color
  badge?: string;   // optional label e.g. 'Soon'
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Continue Learning',  desc: 'Resume your last topic',     href: '/learn',           icon: <BookOpen className="h-5 w-5" />,    accent: 'text-purple-300',  glow: 'from-purple-500/20',  ring: 'ring-purple-400/15' },
  { label: 'Practice Hub',       desc: 'Validate your thinking',     href: '/practice',        icon: <Brain className="h-5 w-5" />,       accent: 'text-indigo-300',  glow: 'from-indigo-500/20',  ring: 'ring-indigo-400/15' },
  { label: 'Revision',           desc: 'Spaced-repetition decks',    href: '/revision',        icon: <RotateCcw className="h-5 w-5" />,   accent: 'text-amber-300',   glow: 'from-amber-500/20',   ring: 'ring-amber-400/15' },
  { label: 'Interview Prep',     desc: 'Rapid fire · mock rounds',href: '/interview-prep',  icon: <Terminal className="h-5 w-5" />,    accent: 'text-emerald-300', glow: 'from-emerald-500/20', ring: 'ring-emerald-400/15' },
  { label: 'Planner',            desc: 'Personalised roadmap',       href: '/planner',         icon: <MapIcon className="h-5 w-5" />,         accent: 'text-blue-300',    glow: 'from-blue-500/20',    ring: 'ring-blue-400/15' },
  { label: 'Tests',              desc: 'Timed assessments',          href: '/tests',           icon: <Award className="h-5 w-5" />,       accent: 'text-rose-300',    glow: 'from-rose-500/20',    ring: 'ring-rose-400/15' },
  { label: 'Notes',              desc: 'Capture your thinking',      href: '/dashboard',       icon: <NotebookPen className="h-5 w-5" />, accent: 'text-cyan-300',    glow: 'from-cyan-500/20',    ring: 'ring-cyan-400/15',   badge: 'Soon' },
  { label: 'AI Assistant',       desc: 'Ask, explore, understand',   href: '/dashboard',       icon: <Wand2 className="h-5 w-5" />,       accent: 'text-fuchsia-300', glow: 'from-fuchsia-500/20', ring: 'ring-fuchsia-400/15', badge: 'Soon' },
];

function QuickActionCard({ action, index }: { action: QuickAction; index: number }) {
  const disabled = !!action.badge;
  const Inner = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`group relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-950/40 backdrop-blur-xl p-4 ring-1 ${action.ring} transition-all duration-300 ${
        disabled ? 'cursor-not-allowed opacity-70' : 'hover:-translate-y-0.5 hover:border-white/15 hover:shadow-[0_8px_40px_-12px_rgba(168,85,247,0.35)]'
      }`}
    >
      <div aria-hidden className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${action.glow} to-transparent blur-2xl opacity-70 group-hover:opacity-100 transition-opacity`} />
      <div className="relative flex items-start justify-between">
        <div className={`h-9 w-9 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center ${action.accent} group-hover:scale-110 transition-transform`}>
          {action.icon}
        </div>
        {action.badge && (
          <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.06] text-slate-400">{action.badge}</span>
        )}
      </div>
      <div className="relative mt-4">
        <p className="text-sm font-bold text-white">{action.label}</p>
        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{action.desc}</p>
      </div>
      {!disabled && (
        <div className={`relative mt-3 flex items-center gap-1 text-[10px] font-bold ${action.accent} opacity-60 group-hover:opacity-100 transition-opacity`}>
          Open <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}
    </motion.div>
  );

  if (disabled) return Inner;
  return <Link href={action.href} className="block h-full">{Inner}</Link>;
}

// ─── Checkpoint meta ─────────────────────────────────────────────────────────

const CHECKPOINT_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  LESSON:    { label: 'Lesson',    color: 'text-blue-300',    icon: BookOpen },
  PRACTICE:  { label: 'Practice',  color: 'text-purple-300',  icon: Brain },
  REVISION:  { label: 'Revision',  color: 'text-amber-300',   icon: RefreshCcw },
  INTERVIEW: { label: 'Interview', color: 'text-emerald-300', icon: Mic },
};

// ─── Utilities ───────────────────────────────────────────────────────────────

function prettifyType(s: string) {
  return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTimeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60)        return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)        return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)        return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)         return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
