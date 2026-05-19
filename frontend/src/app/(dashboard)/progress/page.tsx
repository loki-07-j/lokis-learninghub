'use client';

import React from 'react';
import { TrendingUp, BookOpen, Clock, ShieldCheck, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface Milestone {
  id: number;
  title: string;
  category: 'lesson' | 'exam' | 'sandbox' | 'system';
  time: string;
  description: string;
}

const MILESTONES: Milestone[] = [
  {
    id: 1,
    title: "Completed 'JavaScript Lexical Scopes' Lesson",
    category: 'lesson',
    time: "2 Hours ago",
    description: "Successfully read all outline items and verified code fences."
  },
  {
    id: 2,
    title: "Passed 'Level 1 Node Clearance Exam'",
    category: 'exam',
    time: "1 Day ago",
    description: "Talled 100% score on initial clearance assessment check."
  },
  {
    id: 3,
    title: "Executed telemetry data inside Coding Sandbox",
    category: 'sandbox',
    time: "2 Days ago",
    description: "Ran custom JSON cluster parsing template in practice playground."
  },
  {
    id: 4,
    title: "Node Privilege Configured Successfully",
    category: 'system',
    time: "3 Days ago",
    description: "Profile registered and database node credentials established."
  }
];

const WEEKLY_DATA = [
  { day: 'Mon', hours: 4.2 },
  { day: 'Tue', hours: 5.6 },
  { day: 'Wed', hours: 8.4 },
  { day: 'Thu', hours: 3.1 },
  { day: 'Fri', hours: 6.8 },
  { day: 'Sat', hours: 10.2, peak: true },
  { day: 'Sun', hours: 2.5 }
];

export default function ProgressPage() {
  const totalHours = WEEKLY_DATA.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-purple-400" />
          Analytics & Metrics
        </h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">
          Track weekly workspace throughput, monitor completed milestones, and review authorization credentials.
        </p>
      </div>

      {/* Glow Parameter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Completed lessons */}
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/20 to-white/[0.02]">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-2xl p-4.5 text-left relative overflow-hidden flex flex-col justify-between h-full min-h-[110px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Lesson Progress</span>
              <BookOpen className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-white font-mono">84%</span>
              <span className="text-[10px] text-emerald-400 block font-semibold mt-1">✓ 12/15 Completed</span>
            </div>
          </Card>
        </div>

        {/* Card 2: Avg test correctness */}
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-indigo-500/20 to-white/[0.02]">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-2xl p-4.5 text-left relative overflow-hidden flex flex-col justify-between h-full min-h-[110px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Exam Correctness</span>
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-white font-mono">92%</span>
              <span className="text-[10px] text-indigo-400 block font-semibold mt-1">✓ Target Clear: &gt;75%</span>
            </div>
          </Card>
        </div>

        {/* Card 3: Study sandbox hours */}
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/20 to-white/[0.02]">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-2xl p-4.5 text-left relative overflow-hidden flex flex-col justify-between h-full min-h-[110px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sandbox Time</span>
              <Clock className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-white font-mono">{totalHours} hrs</span>
              <span className="text-[10px] text-slate-500 block font-semibold mt-1">Active compiler duration</span>
            </div>
          </Card>
        </div>

        {/* Card 4: Clearance Rank */}
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-indigo-500/20 to-white/[0.02]">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-2xl p-4.5 text-left relative overflow-hidden flex flex-col justify-between h-full min-h-[110px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Clearance Status</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="mt-3">
              <span className="text-sm font-extrabold text-emerald-400 block">Level 1 Active</span>
              <span className="text-[10px] text-slate-500 block font-semibold mt-1">Developer Node clearance</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Charts & History Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column: Pure CSS Chart Card */}
        <div className="lg:col-span-2 rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/20 via-white/[0.03] to-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)] flex flex-col">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-5 md:p-6 flex-1 flex flex-col justify-between">
            <CardHeader className="p-0 pb-4 border-b border-white/[0.04] flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="h-4.5 w-4.5 text-purple-400" />
                  Weekly Learning Throughput
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-500 font-light">
                  Active study and compiling logs (measured in hours).
                </CardDescription>
              </div>
            </CardHeader>

            {/* Pure CSS Visual Bar Chart */}
            <CardContent className="p-0 flex-1 flex flex-col justify-end mt-12 pb-2">
              <div className="grid grid-cols-7 gap-3 items-end h-[180px] border-b border-white/[0.05] pb-2 relative">
                {/* Horizontal guide grids lines */}
                <div className="absolute left-0 right-0 top-0 border-t border-dashed border-white/[0.02]" />
                <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-white/[0.02]" />

                {WEEKLY_DATA.map((d, index) => {
                  const percent = Math.min(100, Math.round((d.hours / 12) * 100));
                  return (
                    <div key={index} className="flex flex-col items-center gap-2 group cursor-pointer relative h-full justify-end">
                      {/* Hours overlay tooltip on hover */}
                      <span className="absolute -top-7 text-[9px] font-bold font-mono text-purple-300 bg-[#0c0a21] px-1.5 py-0.5 rounded border border-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {d.hours}h
                      </span>

                      {/* Glowing vertical bar */}
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          d.peak 
                            ? "bg-gradient-to-t from-purple-600 to-indigo-500 shadow-[0_0_15px_rgba(147,51,234,0.3)] animate-pulse" 
                            : "bg-white/[0.04] group-hover:bg-purple-600/30"
                        }`}
                        style={{ height: `${percent}%` }}
                      />

                      {/* Day Label */}
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider font-mono">
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Milestones Audit list */}
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500/20 via-white/[0.03] to-purple-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)] flex flex-col">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-5 md:p-6 flex-1 flex flex-col justify-between">
            <CardHeader className="p-0 pb-4 border-b border-white/[0.04]">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400" />
                Clearance Chronology
              </CardTitle>
              <CardDescription className="text-[10px] text-slate-500 font-light">
                Milestone audit timeline logs.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-y-auto mt-4 space-y-4 text-left">
              {MILESTONES.map((m) => (
                <div key={m.id} className="relative pl-5 border-l border-white/[0.08] last:border-transparent space-y-1">
                  {/* Circle dot marker */}
                  <span className={`absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border border-slate-950 flex items-center justify-center ${
                    m.category === 'exam' 
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                      : m.category === 'lesson' 
                      ? 'bg-purple-500' 
                      : 'bg-slate-700'
                  }`} />
                  
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] font-bold text-white leading-tight">{m.title}</span>
                    <span className="text-[9px] font-semibold text-slate-500 shrink-0 font-mono">{m.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                    {m.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
