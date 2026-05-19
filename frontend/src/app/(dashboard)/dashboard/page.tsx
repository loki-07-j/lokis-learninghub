'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Shield, User, BookOpen, Sparkles, ArrowRight, Code2, Terminal } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in select-none">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
          Developer Workspace
        </h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">Accelerate your trajectory from student to senior architect.</p>
      </div>

      {/* Profile and Welcome grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Welcome message card */}
        <div className="md:col-span-2 rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/20 via-white/[0.03] to-indigo-500/20 shadow-[0_0_30px_rgba(147,51,234,0.05)]">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-6 h-full flex flex-col justify-between">
            <CardHeader className="p-0 pb-3">
              <CardDescription className="text-purple-400 text-[10px] font-bold uppercase tracking-wider">Welcome Back</CardDescription>
              <CardTitle className="text-2xl font-extrabold text-white tracking-tight">Hi, {user.name}!</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 my-2">
              <p className="text-slate-400 text-xs font-light leading-relaxed">
                Ready to level up your engineering skills today? Explore custom structured tech syllabi, complete technical sandboxes, or test your readiness against comprehensive production metrics.
              </p>
             </CardContent>
            <div className="pt-4 border-t border-white/[0.04] mt-4 flex items-center justify-start">
              <Link href="/learn">
                <Button className="bg-purple-600 hover:bg-purple-500 text-xs font-bold px-5 py-2.5 rounded-xl border border-purple-400/20 shadow-[0_0_15px_rgba(147,51,234,0.25)] hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-300 cursor-pointer flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Resume Learning Track
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* System Profile Details */}
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500/20 via-white/[0.03] to-purple-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)]">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-6 h-full flex flex-col justify-between">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-indigo-400" />
                Developer Node Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 space-y-4 text-xs font-light">
              <div className="flex justify-between border-b border-white/[0.04] pb-2">
                <span className="text-slate-500">Email spec</span>
                <span className="text-slate-300 font-semibold truncate max-w-[150px]">{user.email}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.04] pb-2 items-center">
                <span className="text-slate-500">Privilege Clearance</span>
                <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-semibold text-indigo-400 border border-indigo-500/20">
                  <Shield className="mr-1 h-3 w-3" />
                  {user.role}
                </span>
              </div>
            </CardContent>
            <div className="pt-4 border-t border-white/[0.04] mt-4 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Security Clearance</span>
              <span className="text-emerald-400 font-semibold animate-pulse flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Active Node
              </span>
            </div>
          </Card>
        </div>

      </div>

      {/* Unified Platform Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module 1: Learn Catalog (Live!) */}
        <Link href="/learn" className="block group">
          <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent hover:from-purple-500/20 hover:to-indigo-500/20 transition-all duration-300">
            <div className="bg-slate-950/45 backdrop-blur-2xl p-6 rounded-2xl flex flex-col justify-between h-40 border border-transparent">
              <div>
                <h3 className="text-white font-bold text-sm tracking-tight flex items-center justify-between">
                  Learn Core Syllabus
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-purple-400" />
                </h3>
                <p className="text-[10px] text-slate-500 font-light mt-1.5 leading-relaxed">Browse interactive, AI-structured technical articles and documentation catalogs.</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full w-fit">
                Module Live
              </span>
            </div>
          </div>
        </Link>

        {/* Module 2: Practice (Phase 9 placeholder) */}
        <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/[0.03] to-transparent">
          <div className="bg-slate-950/20 p-6 rounded-2xl flex flex-col justify-between h-40 border border-transparent">
            <div>
              <h3 className="text-white font-bold text-sm tracking-tight flex items-center gap-1.5">
                <Code2 className="h-4.5 w-4.5 text-indigo-400/80" />
                Practice Modules
              </h3>
              <p className="text-[10px] text-slate-500 font-light mt-1.5 leading-relaxed">MCQs and custom logic tests to challenge and reinforce backend engineering practices.</p>
            </div>
            <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full w-fit">
              Ready in Phase 9
            </span>
          </div>
        </div>

        {/* Module 3: Interview Q&A (Phase 12 placeholder) */}
        <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/[0.03] to-transparent">
          <div className="bg-slate-950/20 p-6 rounded-2xl flex flex-col justify-between h-40 border border-transparent">
            <div>
              <h3 className="text-white font-bold text-sm tracking-tight flex items-center gap-1.5">
                <Terminal className="h-4.5 w-4.5 text-emerald-400/80" />
                Interview Prepping
              </h3>
              <p className="text-[10px] text-slate-500 font-light mt-1.5 leading-relaxed">Rapid-fire questions and tech quizzes optimized for aceing elite engineering interviews.</p>
            </div>
            <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full w-fit">
              Ready in Phase 12
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
