'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Brain, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { practiceService } from '@/services/practice';
import { WeakAreas } from '@/components/practice/WeakAreas';

export default function WeakAreasPage() {
  const { user } = useAuth();
  const [weakAreas, setWeakAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeakAreas = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await practiceService.getWeakAreas(user.id);
      setWeakAreas(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWeakAreas();
  }, [fetchWeakAreas]);

  const handleSelectArea = (_thinkingType: string) => {
    // handled by individual WeakAreas buttons — user goes to Practice Hub
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Practice Hub
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-orange-400" />
          Weak Areas
        </h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">
          Thinking skills that need focused practice to reach mastery.
        </p>
      </div>

      {/* Content */}
      <div className="rounded-3xl p-[1px] bg-gradient-to-br from-orange-500/10 via-white/[0.02] to-red-500/10">
        <div className="bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <WeakAreas weakAreas={weakAreas} onSelectArea={handleSelectArea} />
          )}
        </div>
      </div>

      {/* Go Practice CTA */}
      {!loading && weakAreas.length > 0 && (
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/10 via-white/[0.02] to-indigo-500/10">
          <div className="bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm font-bold text-white">Ready to improve?</p>
                <p className="text-xs text-slate-400">Start with your highest-priority weak area.</p>
              </div>
            </div>
            <Link href="/practice">
              <Button className="bg-purple-600 hover:bg-purple-500 text-xs font-bold px-5 py-2.5 rounded-xl border border-purple-400/20 shadow-[0_0_15px_rgba(147,51,234,0.2)] transition-all cursor-pointer flex items-center gap-2">
                <Play className="h-3.5 w-3.5 fill-current" />
                Go to Practice Hub
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
