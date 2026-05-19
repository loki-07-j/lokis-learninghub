'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Terminal,
  Award,
  BrainCircuit,
  ArrowRight,
  Code2,
  Database,
  Layout,
  Workflow
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: <BrainCircuit className="h-6 w-6 text-purple-400" />,
      title: "AI-Assisted Learning",
      description: "Generate highly targeted study plans and technical lessons instantly."
    },
    {
      icon: <Code2 className="h-6 w-6 text-indigo-400" />,
      title: "Interactive Practice",
      description: "Solve multiple choice and coding questions with real-time feedback."
    },
    {
      icon: <Award className="h-6 w-6 text-pink-400" />,
      title: "Adaptive Testing",
      description: "Challenge yourself with timed, technology-specific assessments."
    },
    {
      icon: <Terminal className="h-6 w-6 text-emerald-400" />,
      title: "Interview Prep",
      description: "Quick rapid-fire Q&As to ace your next fullstack job interview."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-950 via-slate-900 to-black text-white overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-3xl" />

      {/* Header / Navbar */}
      <header className="flex h-16 w-full items-center justify-between px-6 md:px-12 border-b border-white/5 bg-slate-950/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 shadow-md">
            <span className="text-base font-bold text-white">L</span>
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Loki's Learning Hub
          </span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button className="bg-purple-600 hover:bg-purple-500 shadow-md text-sm">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md text-sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center max-w-6xl mx-auto z-10">

        {/* Tech badges banner */}
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs text-purple-300 mb-8 animate-fade-in">
          <Workflow className="h-3 w-3" />
          <span>Complete Fullstack & Database Learning Platform</span>
        </div>

        {/* Hero title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent max-w-4xl mb-6">
          Master Modern Tech Stacks <br className="hidden md:inline" />
          with <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">AI-Assisted Guidance</span>
        </h1>

        {/* Hero description */}
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mb-10 leading-relaxed">
          Accelerate your growth from student to elite engineer. Loki's Learning Hub covers Frontend, Backend, Databases, DevOps, Systems, and more, using targeted interactive training.
        </p>

        {/* Hero Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link href={user ? "/dashboard" : "/register"}>
            <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 text-base py-6 px-8 rounded-xl font-semibold transform active:scale-95 transition-all">
              Start Learning Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-900 hover:text-white text-base py-6 px-8 rounded-xl">
              Explore Topics
            </Button>
          </Link>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="border border-white/5 bg-slate-950/45 backdrop-blur-xl p-6 rounded-2xl shadow-md hover:border-purple-500/30 hover:shadow-purple-500/5 transition-all duration-300 group"
            >
              <div className="mb-4 inline-block p-3 bg-white/5 rounded-xl group-hover:bg-purple-500/10 transition-colors">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-xs text-slate-500 border-t border-white/5 mt-auto">
        <p>© 2026 Loki's Learning Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}
