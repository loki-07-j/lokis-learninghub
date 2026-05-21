'use client';

import React from 'react';
import { WeakArea } from '@/services/practice';
import { AlertTriangle, Brain } from 'lucide-react';

interface WeakAreasProps {
  weakAreas: WeakArea[];
  onSelectArea?: (thinkingType: string) => void;
}

export const WeakAreas: React.FC<WeakAreasProps> = ({ weakAreas, onSelectArea }) => {
  if (weakAreas.length === 0) {
    return (
      <div className="text-center py-10">
        <Brain className="h-10 w-10 text-green-400/40 mx-auto mb-3" />
        <p className="text-green-400 font-semibold text-sm mb-1">All Skills Strong</p>
        <p className="text-slate-500 text-xs">
          You're performing well across all thinking skills. Keep practicing to maintain your progress!
        </p>
      </div>
    );
  }

  const priorityColors = [
    { border: 'border-red-500/30',    bg: 'bg-red-500/5',    text: 'text-red-400',    bar: 'bg-red-400',    badge: '🔴', label: 'High' },
    { border: 'border-orange-500/30', bg: 'bg-orange-500/5', text: 'text-orange-400', bar: 'bg-orange-400', badge: '🟠', label: 'Medium' },
    { border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', text: 'text-yellow-400', bar: 'bg-yellow-400', badge: '🟡', label: 'Low' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
        <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
        <p className="text-xs text-orange-300 font-semibold">
          {weakAreas.length} skill{weakAreas.length !== 1 ? 's' : ''} need focused practice
        </p>
      </div>

      <div className="space-y-3">
        {weakAreas.map((area, index) => {
          const colors = priorityColors[Math.min(index, priorityColors.length - 1)];
          return (
            <div
              key={area.thinkingType}
              className={`p-4 rounded-2xl border ${colors.border} ${colors.bg} cursor-pointer hover:brightness-110 transition-all`}
              onClick={() => onSelectArea?.(area.thinkingType)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{colors.badge}</span>
                  <div>
                    <p className={`text-sm font-bold ${colors.text}`}>{area.thinkingType}</p>
                    <p className="text-[10px] text-slate-500">Priority: {colors.label}</p>
                  </div>
                </div>
                <p className={`text-lg font-extrabold ${colors.text}`}>{area.score}%</p>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${colors.bar}`}
                  style={{ width: `${area.score}%` }}
                />
              </div>

              {area.weakConcepts && area.weakConcepts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {area.weakConcepts.slice(0, 3).map((concept) => (
                    <span key={concept} className="text-[9px] bg-slate-800 text-slate-400 border border-white/[0.05] px-2 py-0.5 rounded-full">
                      {concept}
                    </span>
                  ))}
                  {area.weakConcepts.length > 3 && (
                    <span className="text-[9px] bg-slate-800 text-slate-500 border border-white/[0.05] px-2 py-0.5 rounded-full">
                      +{area.weakConcepts.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); onSelectArea?.(area.thinkingType); }}
                className={`w-full py-2 rounded-xl text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border} hover:brightness-125 transition-all cursor-pointer`}
              >
                Practice {area.thinkingType}
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-1">
        <p className="text-[10px] font-bold text-blue-400">Tips for Improvement</p>
        {[
          'Focus on one thinking type at a time to build confidence',
          'Review explanations carefully to understand your mistakes',
          'Practice regularly — consistency beats intensity',
        ].map((tip, i) => (
          <p key={i} className="text-[10px] text-slate-500">• {tip}</p>
        ))}
      </div>
    </div>
  );
};

interface PracticeHistoryProps {
  sessions: Array<{
    id: string;
    question_id: string;
    is_correct: boolean;
    thinking_score: number;
    time_taken: number;
    completed_at: string;
    question_data?: {
      id: string;
      title: string;
      question_type: string;
      thinking_type: string;
    };
  }>;
}

export const PracticeHistory: React.FC<PracticeHistoryProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500 text-xs">No practice history yet. Start practicing to build your profile!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Sessions</p>
      {sessions.map((session) => (
        <div
          key={session.id}
          className={`p-3 rounded-2xl border flex items-center gap-3 ${
            session.is_correct ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
          }`}
        >
          <span className={`text-lg ${session.is_correct ? 'text-green-400' : 'text-red-400'}`}>
            {session.is_correct ? '✓' : '✗'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {session.question_data?.title || 'Question'}
            </p>
            <div className="flex gap-2 mt-0.5">
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                {session.question_data?.thinking_type}
              </span>
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                {session.question_data?.question_type}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-sm font-bold ${session.is_correct ? 'text-green-400' : 'text-red-400'}`}>
              {session.thinking_score}
            </p>
            <p className="text-[9px] text-slate-600">
              {Math.floor(session.time_taken / 60)}m {session.time_taken % 60}s
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
