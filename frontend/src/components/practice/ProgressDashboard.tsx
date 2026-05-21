'use client';

import React from 'react';
import { PracticeProgress, ThinkingScore } from '@/services/practice';
import { TrendingUp, Target, Zap, Flame } from 'lucide-react';

interface ProgressDashboardProps {
  progress: PracticeProgress;
  thinkingScores: ThinkingScore[];
}

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

const scoreBg = (score: number) => {
  if (score >= 80) return 'bg-green-400';
  if (score >= 60) return 'bg-yellow-400';
  return 'bg-red-400';
};

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ progress, thinkingScores }) => {
  return (
    <div className="space-y-6">
      {/* Mastery + Streak */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Mastery Score',
            value: `${progress.overall_mastery_score}%`,
            icon: <TrendingUp className="h-4 w-4" />,
            color: scoreColor(progress.overall_mastery_score),
          },
          {
            label: 'Completed',
            value: progress.questions_completed,
            icon: <Target className="h-4 w-4" />,
            color: 'text-blue-400',
          },
          {
            label: 'Current Streak',
            value: progress.current_streak,
            icon: <Flame className="h-4 w-4" />,
            color: 'text-orange-400',
          },
          {
            label: 'Best Streak',
            value: progress.longest_streak,
            icon: <Zap className="h-4 w-4" />,
            color: 'text-yellow-400',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900/40 rounded-2xl border border-white/[0.05] p-4 text-center">
            <div className={`flex justify-center mb-2 ${stat.color}`}>{stat.icon}</div>
            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Accuracy bar */}
      <div className="bg-slate-900/40 rounded-2xl border border-white/[0.05] p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-semibold text-slate-300">Accuracy</p>
          <p className="text-xs text-slate-400">
            {progress.questions_correct} / {progress.questions_completed} correct
          </p>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${scoreBg(progress.overall_mastery_score)}`}
            style={{
              width: progress.questions_completed > 0
                ? `${(progress.questions_correct / progress.questions_completed) * 100}%`
                : '0%',
            }}
          />
        </div>
      </div>

      {/* Thinking Type Breakdown */}
      {thinkingScores.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thinking Skills Breakdown</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {thinkingScores.map((score) => (
              <div key={score.thinking_type} className="bg-slate-900/40 rounded-2xl border border-white/[0.05] p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold text-slate-300">{score.thinking_type}</p>
                  <p className={`text-sm font-bold ${scoreColor(score.current_score)}`}>
                    {score.current_score}%
                  </p>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${scoreBg(score.current_score)}`}
                    style={{ width: `${score.current_score}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-600">
                  {score.correct_count} of {score.attempts_count} attempts
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {progress.last_practice_date && (
        <p className="text-center text-[11px] text-slate-600">
          Last practiced: {new Date(progress.last_practice_date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

// SVG Radar Chart
export const ThinkingSkillsRadar: React.FC<{ thinkingScores: ThinkingScore[] }> = ({ thinkingScores }) => {
  if (thinkingScores.length === 0) return null;

  const size = 260;
  const center = size / 2;
  const maxRadius = size / 2 - 28;
  const levels = 5;
  const angles = thinkingScores.map((_, i) => (i / thinkingScores.length) * 2 * Math.PI);

  const coords = (index: number, score: number) => {
    const angle = angles[index] - Math.PI / 2;
    const radius = (score / 100) * maxRadius;
    return [center + radius * Math.cos(angle), center + radius * Math.sin(angle)];
  };

  const polygonPoints = thinkingScores
    .map((s, i) => coords(i, s.current_score).join(','))
    .join(' ');

  const gridPoints = (level: number) =>
    thinkingScores
      .map((_, i) => coords(i, (level / levels) * 100).join(','))
      .join(' ');

  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Thinking Skills Radar</p>
      <svg width={size} height={size} className="mx-auto">
        {Array.from({ length: levels + 1 }).map((_, level) => (
          <polygon key={level} points={gridPoints(level)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        {thinkingScores.map((_, i) => {
          const [x2, y2] = coords(i, 100);
          return <line key={i} x1={center} y1={center} x2={x2} y2={y2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
        })}
        <polygon points={polygonPoints} fill="rgba(147,51,234,0.15)" stroke="#9333ea" strokeWidth="1.5" />
        {thinkingScores.map((s, i) => {
          const [cx, cy] = coords(i, s.current_score);
          return <circle key={i} cx={cx} cy={cy} r="3" fill="#9333ea" stroke="white" strokeWidth="1.5" />;
        })}
        {thinkingScores.map((s, i) => {
          const labelDist = maxRadius + 18;
          const angle = angles[i] - Math.PI / 2;
          const x = center + labelDist * Math.cos(angle);
          const y = center + labelDist * Math.sin(angle);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600">
              {s.thinking_type}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
