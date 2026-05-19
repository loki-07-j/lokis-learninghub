'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, HelpCircle } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white px-4 relative overflow-hidden select-none">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-purple-500/10 blur-[128px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_60%)] pointer-events-none" />
      
      <div className="relative text-center space-y-6 max-w-md w-full p-8 rounded-3xl border border-white/5 bg-slate-900/20 backdrop-blur-2xl shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <HelpCircle className="h-8 w-8 animate-bounce text-purple-400" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold tracking-tighter bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-500 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl font-bold text-white tracking-tight">Module Under Construction</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            This module is currently being built in a future development phase. Please check back later!
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 hover:bg-white/5 hover:text-white text-slate-300 px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer w-full sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.history.back();
              } else {
                router.back();
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer shadow-lg shadow-purple-500/25 border-none w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
