'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Flame, Target, Brain, Zap, Bug, Layers, Shield, Globe, Cpu,
  CheckCircle2, XCircle, Clock, ChevronRight, AlertTriangle, Star,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { progressService, ProgressDashboard, HeatmapDay, WeeklyDay } from '@/services/progress';

// ─── constants ───────────────────────────────────────────────────────────────

const THINKING_META: Record<string, { label: string; color: string }> = {
  LOGIC:        { label: 'Logic',        color: '#60a5fa' },
  DEBUGGING:    { label: 'Debugging',    color: '#f87171' },
  PERFORMANCE:  { label: 'Performance',  color: '#facc15' },
  ARCHITECTURE: { label: 'Architecture', color: '#c084fc' },
  SECURITY:     { label: 'Security',     color: '#4ade80' },
  REAL_WORLD:   { label: 'Real World',   color: '#fb923c' },
  INTERVIEW:    { label: 'Interview',    color: '#818cf8' },
};

const HEATMAP_COLORS = [
  'bg-slate-800/60',
  'bg-purple-900/60',
  'bg-purple-700/70',
  'bg-purple-500/80',
  'bg-purple-400',
];

// ─── Radar Chart ─────────────────────────────────────────────────────────────

function RadarChart({ data }: { data: { type: string; score: number }[] }) {
  const cx = 100; const cy = 100; const r = 75;
  const n = data.length;
  const step = (2 * Math.PI) / n;
  const offset = -Math.PI / 2;
  const pt = (i: number, rad: number) => ({
    x: cx + rad * Math.cos(i * step + offset),
    y: cy + rad * Math.sin(i * step + offset),
  });
  const dataPath = data.map((d, i) => {
    const p = pt(i, (d.score / 100) * r);
    return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }).join(' ') + ' Z';

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[200px] mx-auto">
      {[25, 50, 75, 100].map((pct) => (
        <polygon key={pct}
          points={data.map((_, i) => { const p = pt(i, (pct / 100) * r); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      {data.map((_, i) => { const p = pt(i, r); return <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />; })}
      <path d={dataPath} fill="rgba(147,51,234,0.2)" stroke="#a855f7" strokeWidth="1.5" />
      {data.map((d, i) => { const p = pt(i, (d.score / 100) * r); return <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#a855f7" />; })}
      {data.map((d, i) => {
        const p = pt(i, r + 14);
        return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="7.5" fill={THINKING_META[d.type]?.color ?? '#94a3b8'} fontWeight="600">{THINKING_META[d.type]?.label ?? d.type}</text>;
      })}
    </svg>
  );
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

function ActivityHeatmap({ data }: { data: HeatmapDay[] }) {
  if (!data.length) return <p className="text-xs text-slate-600 py-4 text-center">No activity yet — start practicing to see your heatmap.</p>;
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const weeks: HeatmapDay[][] = [];
  let wk: HeatmapDay[] = [];
  sorted.forEach((d) => { wk.push(d); if (wk.length === 7) { weeks.push(wk); wk = []; } });
  if (wk.length) weeks.push(wk);
  return (
    <div className="space-y-2">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-1 shrink-0">
            {w.map((day) => (
              <div key={day.date} title={`${day.date}: ${day.questions}q, ${day.correct} correct`}
                className={`w-3.5 h-3.5 rounded-sm ${HEATMAP_COLORS[day.intensity]}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 justify-end">
        <span className="text-[9px] text-slate-600">Less</span>
        {HEATMAP_COLORS.map((c, i) => <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />)}
        <span className="text-[9px] text-slate-600">More</span>
      </div>
    </div>
  );
}

// ─── Weekly Bars ──────────────────────────────────────────────────────────────

function WeeklyBars({ data }: { data: WeeklyDay[] }) {
  const max = Math.max(...data.map((d) => d.questions), 1);
  return (
    <div className="flex items-end gap-2 h-20">
      {data.map((day) => (
        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex flex-col justify-end" style={{ height: 64 }}>
            <div className="w-full bg-purple-500/60 rounded-t-sm"
              style={{ height: `${(day.questions / max) * 64}px`, minHeight: day.questions > 0 ? 3 : 0 }} />
          </div>
          <span className="text-[9px] text-slate-500">{day.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Readiness Dial ───────────────────────────────────────────────────────────

function ReadinessDial({ score, level }: { score: number; level: string }) {
  const angle = (score / 100) * 180 - 90;
  const levelColor = level === 'Interview Ready' ? 'text-green-400' : level === 'Nearly Ready' ? 'text-yellow-400' : level === 'Building Up' ? 'text-orange-400' : 'text-red-400';
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 120 70" className="w-32">
        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="#7c3aed" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(score / 100) * 157} 157`} />
        <line x1="60" y1="60" x2="60" y2="18" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" transform={`rotate(${angle},60,60)`} />
        <circle cx="60" cy="60" r="3.5" fill="#a855f7" />
        <text x="60" y="74" textAnchor="middle" fontSize="13" fill="white" fontWeight="800">{score}</text>
      </svg>
      <span className={`text-xs font-bold ${levelColor}`}>{level}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<ProgressDashboard | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [weekly, setWeekly] = useState<WeeklyDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const [dash, heat, wk] = await Promise.all([
          progressService.getDashboard(user.id),
          progressService.getHeatmap(user.id, 16),
          progressService.getWeeklyActivity(user.id),
        ]);
        setDashboard(dash); setHeatmap(heat); setWeekly(wk);
      } catch { /* silent */ } finally { setLoading(false); }
    })();
  }, [user]);

  if (!user) return null;
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const ov = dashboard?.overview;
  const readiness = dashboard?.interviewReadiness;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-purple-400" /> Skill Progress
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Your thinking intelligence, tracked over time.</p>
        </div>
        <Link href="/planner" className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors">
          My Planner <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Questions Done',  value: ov?.totalCompleted ?? 0,            icon: <Target className="h-4 w-4" />,  col: 'text-blue-400',   bg: 'from-blue-500/10' },
          { label: 'Current Streak',  value: `${ov?.currentStreak ?? 0}d`,       icon: <Flame className="h-4 w-4" />,   col: 'text-orange-400', bg: 'from-orange-500/10' },
          { label: 'Overall Mastery', value: `${ov?.overallMastery ?? 0}%`,      icon: <Star className="h-4 w-4" />,    col: 'text-yellow-400', bg: 'from-yellow-500/10' },
          { label: 'Interview Ready', value: `${readiness?.readinessScore ?? 0}%`, icon: <Brain className="h-4 w-4" />, col: 'text-purple-400', bg: 'from-purple-500/10' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-[1px] bg-gradient-to-br ${s.bg} to-white/[0.02]`}>
            <div className="bg-slate-950/60 backdrop-blur rounded-2xl p-4">
              <div className={`flex items-center gap-1.5 mb-1.5 ${s.col}`}>{s.icon}<span className="text-[10px] font-semibold text-slate-500">{s.label}</span></div>
              <p className={`text-2xl font-extrabold ${s.col}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Radar + Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/10 to-white/[0.02]">
          <div className="bg-slate-950/60 backdrop-blur-2xl rounded-3xl p-5">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Thinking Skills Radar</p>
            {dashboard?.radarData?.some((d) => d.score > 0) ? (
              <>
                <RadarChart data={dashboard.radarData} />
                <div className="grid grid-cols-2 gap-1 mt-3">
                  {dashboard.radarData.map((d) => (
                    <div key={d.type} className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: THINKING_META[d.type]?.color }} />
                      <span className="text-[9px] text-slate-400">{THINKING_META[d.type]?.label}</span>
                      <span className="text-[9px] font-bold ml-auto" style={{ color: THINKING_META[d.type]?.color }}>{d.score}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-600 text-xs py-10">Answer practice questions to see your radar chart.</div>
            )}
          </div>
        </div>

        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500/10 to-white/[0.02]">
          <div className="bg-slate-950/60 backdrop-blur-2xl rounded-3xl p-5">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Interview Readiness</p>
            {readiness ? (
              <div className="space-y-4">
                <ReadinessDial score={readiness.readinessScore} level={readiness.level} />
                <div className="space-y-2">
                  {Object.entries(readiness.breakdown).map(([k, b]) => (
                    <div key={k}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-slate-400">{b.label}</span>
                        <span className="font-bold text-slate-300">{b.score}% <span className="text-slate-600">×{b.weight}%</span></span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1">
                        <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${b.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="text-center text-slate-600 text-xs py-10">No data yet.</div>}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-3xl p-[1px] bg-gradient-to-br from-green-500/8 to-white/[0.02]">
        <div className="bg-slate-950/60 backdrop-blur-2xl rounded-3xl p-5">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Activity Heatmap</p>
            <span className="text-[10px] text-slate-500">Last 16 weeks</span>
          </div>
          <ActivityHeatmap data={heatmap} />
        </div>
      </div>

      {/* Weekly + Concept Mastery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-blue-500/8 to-white/[0.02]">
          <div className="bg-slate-950/60 backdrop-blur-2xl rounded-3xl p-5">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">This Week</p>
            <WeeklyBars data={weekly} />
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-slate-600">Total: <span className="text-slate-300 font-bold">{weekly.reduce((s, d) => s + d.questions, 0)}</span></span>
              <span className="text-[10px] text-slate-600">Correct: <span className="text-green-400 font-bold">{weekly.reduce((s, d) => s + d.correct, 0)}</span></span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-yellow-500/8 to-white/[0.02]">
          <div className="bg-slate-950/60 backdrop-blur-2xl rounded-3xl p-5">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Concept Mastery</p>
            {dashboard?.conceptMasteries?.length ? (
              <div className="space-y-2.5">
                {dashboard.conceptMasteries.slice(0, 5).map((cm) => (
                  <div key={cm.topicId}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-300 truncate max-w-[70%]">{cm.topicTitle}</span>
                      <span className={`font-bold ${cm.masteryScore >= 70 ? 'text-green-400' : cm.masteryScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{cm.masteryScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${cm.masteryScore >= 70 ? 'bg-green-500' : cm.masteryScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${cm.masteryScore}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-600 text-xs">Answer practice questions to track concept mastery.</div>
            )}
          </div>
        </div>
      </div>

      {/* Weak Areas + Recent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-red-500/8 to-white/[0.02]">
          <div className="bg-slate-950/60 backdrop-blur-2xl rounded-3xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-orange-400" />Weak Areas</p>
              <Link href="/practice" className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold">Practice →</Link>
            </div>
            {dashboard?.weakAreas?.length ? (
              <div className="space-y-2.5">
                {dashboard.weakAreas.map((wa, i) => (
                  <div key={wa.thinkingType} className="flex items-center gap-2">
                    <span className="text-sm">{i === 0 ? '🔴' : i === 1 ? '🟠' : '🟡'}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[10px] font-semibold text-slate-300">{THINKING_META[wa.thinkingType]?.label}</span>
                        <span className="text-[10px] text-red-400 font-bold">{wa.score}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1">
                        <div className="bg-red-500 h-1 rounded-full" style={{ width: `${wa.score}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-green-400 text-xs font-semibold">All thinking skills strong! 🎉</div>
            )}
          </div>
        </div>

        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-slate-500/8 to-white/[0.02]">
          <div className="bg-slate-950/60 backdrop-blur-2xl rounded-3xl p-5">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Recent Sessions</p>
            {dashboard?.recentSessions?.length ? (
              <div className="space-y-1.5">
                {dashboard.recentSessions.slice(0, 6).map((s) => (
                  <div key={s.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${s.isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                    <span className={s.isCorrect ? 'text-green-400' : 'text-red-400'}>
                      {s.isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    </span>
                    <p className="flex-1 text-[10px] text-slate-300 truncate">{s.questionTitle}</p>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-bold ${s.isCorrect ? 'text-green-400' : 'text-red-400'}`}>{s.thinkingScore}</p>
                      <p className="text-[9px] text-slate-600">{Math.floor(s.timeTaken / 60)}m{s.timeTaken % 60}s</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-600 text-xs">
                No sessions yet. <Link href="/practice" className="text-purple-400 underline">Start practicing</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Streak banner */}
      {(ov?.currentStreak ?? 0) > 0 && (
        <div className="rounded-2xl p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/5 border border-orange-500/20 flex items-center gap-4">
          <Flame className="h-8 w-8 text-orange-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-white">{ov!.currentStreak}-day streak! {ov!.currentStreak >= 7 ? '🏆' : '🔥'}</p>
            <p className="text-[11px] text-slate-400">Longest streak: <span className="text-orange-300 font-semibold">{ov!.longestStreak} days</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
