'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Award,
  BrainCircuit,
  ArrowRight,
  Code2,
  Terminal,
  Workflow,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: <BrainCircuit className="h-5 w-5 text-purple-400" />,
      title: "AI-Assisted Learning",
      description: "Generate highly targeted study plans and technical lessons instantly."
    },
    {
      icon: <Code2 className="h-5 w-5 text-indigo-400" />,
      title: "Interactive Practice",
      description: "Solve multiple choice and coding questions with real-time feedback."
    },
    {
      icon: <Award className="h-5 w-5 text-pink-400" />,
      title: "Adaptive Testing",
      description: "Challenge yourself with timed, technology-specific assessments."
    },
    {
      icon: <Terminal className="h-5 w-5 text-emerald-400" />,
      title: "Interview Prep",
      description: "Quick rapid-fire Q&As to ace your next fullstack job interview."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#030014] text-white overflow-hidden relative">
      
      {/* Premium background mesh grids & animated orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Flowing atmospheric nebula blobs */}
      <div className="absolute top-[-10%] left-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse" style={{ animationDuration: '12s' }} />

      {/* Header / Navbar */}
      <header className="flex h-16 w-full items-center justify-between px-6 md:px-12 border-b border-white/[0.05] bg-slate-950/40 backdrop-blur-2xl z-20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Loki's Learning Hub
          </span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button className="bg-purple-600 hover:bg-purple-500 text-xs font-bold px-4 py-2 rounded-xl border border-purple-400/20 shadow-[0_0_15px_rgba(147,51,234,0.25)] transition-all duration-300">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-slate-400 hover:text-white transition-colors text-xs font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl border border-purple-400/10 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center max-w-5xl mx-auto z-10 relative">

        {/* Shimmering Tech banner */}
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1 text-[10px] font-semibold text-purple-300 mb-8 animate-fade-in tracking-wider uppercase">
          <Workflow className="h-3 w-3 text-purple-400" />
          <span>Technical Syllabus Platform</span>
        </div>

        {/* Hero Title with tracking-tighter and tight hierarchy */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.05] bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent max-w-3xl mb-6">
          Master Modern Architecture <br className="hidden md:inline" />
          with <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-500 bg-clip-text text-transparent">AI-Assisted Drills</span>
        </h1>

        {/* Responsive, modern typography text spacing */}
        <p className="text-slate-400 text-xs md:text-sm max-w-xl mb-10 leading-relaxed font-light">
          Accelerate your trajectory from developer to systems architect. Solve real-world PostgreSQL, React, and Fullstack problems equipped with localized, interactive sandboxes.
        </p>

        {/* Premium Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-24 w-full sm:w-auto">
          <Link href={user ? "/dashboard" : "/register"} className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold py-6 px-8 rounded-xl border border-purple-400/20 shadow-[0_0_30px_rgba(147,51,234,0.15)] transform active:scale-98 transition-all duration-300">
              Start Practicing Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full border-white/[0.05] bg-white/[0.01] text-slate-300 hover:bg-white/[0.05] hover:text-white text-xs font-semibold py-6 px-8 rounded-xl transition-all duration-300">
              Explore Core Topics
            </Button>
          </Link>
        </div>

        {/* Premium features layout using Vercel-style glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent hover:from-purple-500/20 hover:to-indigo-500/20 shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="bg-slate-950/40 backdrop-blur-2xl p-6 rounded-2xl h-full flex flex-col justify-between border border-transparent">
                <div className="space-y-4">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.05] group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all">
                    {feat.icon}
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{feat.title}</h3>
                  <p className="text-slate-400 text-[11px] leading-relaxed font-light">{feat.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.02] flex items-center text-[10px] font-bold text-purple-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  <span>Learn more</span>
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-[10px] text-slate-600 border-t border-white/[0.03] mt-auto bg-slate-950/20 z-10">
        <p>© 2026 Loki's Learning Hub. Engineering a premium future.</p>
      </footer>
    </div>
  );
}
