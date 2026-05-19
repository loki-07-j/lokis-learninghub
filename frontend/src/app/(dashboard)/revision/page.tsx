'use client';

import React, { useState } from 'react';
import { RotateCcw, HelpCircle, Layers, CheckCircle2, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Flashcard {
  id: number;
  category: string;
  question: string;
  answer: string;
  tip: string;
}

const REVISION_CARDS: Flashcard[] = [
  {
    id: 1,
    category: "React Architecture",
    question: "What exactly is DOM Hydration in modern JS web frameworks?",
    answer: "Hydration is the client-side process where React/Next.js executes in the browser to read static pre-rendered HTML (compiled from Server-Side Rendering) and attach active event listeners, binding the markup into a live dynamic application.",
    tip: "It is basically marrying static HTML structures with active JavaScript interactive states."
  },
  {
    id: 2,
    category: "Performance Optimization",
    question: "What is database normalization and what are its primary targets?",
    answer: "Normalization is the process of structuring relational database tables to minimize data redundancy and dependency. It divides large tables into smaller entities and defines relationships, targeting primary anomalies (Insert, Update, Delete).",
    tip: "Enforces integrity, saves disk space, and avoids data sync issues."
  },
  {
    id: 3,
    category: "Core JavaScript",
    question: "What is the key functional difference between .call(), .apply(), and .bind()?",
    answer: "Both .call() and .apply() execute a function immediately with a specified 'this' scope (call takes comma-separated arguments, apply takes an array). .bind() does not execute immediately; it returns a new bound function with the scope preset for future calls.",
    tip: "Remember: 'C'all for Comma, 'A'pply for Array, 'B'ind for Bound function."
  },
  {
    id: 4,
    category: "Network Engineering",
    question: "What are the primary targets of WebSockets vs standard HTTP polling?",
    answer: "WebSockets establish a single persistent, bidirectional TCP connection for real-time duplex data transfer. Standard HTTP polling requires opening separate HTTP request-response cycles repeatedly, creating substantial latency and packet overhead.",
    tip: "Choose WebSockets for live chat, streams, or low-latency notifications."
  }
];

export default function RevisionPage() {
  const [cards, setCards] = useState<Flashcard[]>(REVISION_CARDS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  const activeCard = cards[currentIdx];

  const handleFlagCard = (difficulty: 'easy' | 'medium' | 'hard') => {
    toast.success(`Flagged as ${difficulty.toUpperCase()}! Spaced repetition index modified.`);
    
    setIsFlipped(false);
    // Add small delay to allow flip-back animation before changing content
    setTimeout(() => {
      if (currentIdx < cards.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        setCompleted(true);
      }
    }, 250);
  };

  const handleResetDeck = () => {
    setCurrentIdx(0);
    setIsFlipped(false);
    setCompleted(false);
    toast.success("Revision Deck Reset Successfully!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-purple-400" />
            Revision Deck
          </h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Strengthen your conceptual coding memory using spaced repetition flashcards.
          </p>
        </div>

        {!completed && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.05] text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <Zap className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
            Deck Progress: {currentIdx + 1} / {cards.length}
          </div>
        )}
      </div>

      {/* Main Sandbox Frame */}
      {completed ? (
        /* Completion View Card */
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/20 via-white/[0.03] to-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)] max-w-md mx-auto mt-8">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-6 md:p-8 text-center space-y-6">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Revision Complete!</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Excellent work! All cards in the active spaced repetition stack have been analyzed and rated. Your knowledge registers have been synchronized.
              </p>
            </div>

            <Button
              onClick={handleResetDeck}
              className="w-full bg-purple-600 hover:bg-purple-500 text-xs font-bold h-11 rounded-xl border border-purple-400/20 shadow-[0_0_20px_rgba(147,51,234,0.25)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Active Deck
            </Button>
          </Card>
        </div>
      ) : (
        /* Active Flashcard Viewer Panel */
        <div className="max-w-xl mx-auto flex flex-col items-center gap-8 mt-4 select-none">
          
          {/* Perspective Container for 3D Flip */}
          <div className="w-full min-h-[280px] cursor-pointer" style={{ perspective: '1000px' }} onClick={() => setIsFlipped(!isFlipped)}>
            <div 
              className="w-full h-full relative transition-transform duration-500" 
              style={{ 
                transformStyle: 'preserve-3d', 
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                minHeight: '280px'
              }}
            >
              {/* FRONT OF THE CARD */}
              <div 
                className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/20 via-white/[0.02] to-indigo-500/20"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <Card className="border-none bg-slate-950/85 backdrop-blur-2xl rounded-3xl p-6 h-full flex flex-col justify-between items-stretch min-h-[280px]">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                    <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-0.5 text-[9px] font-bold text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                      {activeCard.category}
                    </span>
                    <HelpCircle className="h-4 w-4 text-slate-500" />
                  </div>

                  <div className="flex-1 flex items-center justify-center py-6 text-center">
                    <h2 className="text-sm font-extrabold text-white leading-relaxed max-w-sm">
                      {activeCard.question}
                    </h2>
                  </div>

                  <div className="border-t border-white/[0.04] pt-3 text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 animate-pulse">
                    <RefreshCw className="h-3 w-3" />
                    Click Card to Flip & Reveal Answer
                  </div>
                </Card>
              </div>

              {/* BACK OF THE CARD */}
              <div 
                className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500/20 via-white/[0.02] to-purple-500/20"
                style={{ 
                  backfaceVisibility: 'hidden', 
                  transform: 'rotateY(180deg)',
                  minHeight: '280px'
                }}
              >
                <Card className="border-none bg-slate-950/85 backdrop-blur-2xl rounded-3xl p-6 h-full flex flex-col justify-between items-stretch min-h-[280px] text-left">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                    <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                      {activeCard.category}
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>

                  <div className="flex-1 py-4 space-y-3">
                    <p className="text-xs text-slate-300 leading-relaxed font-light select-text">
                      {activeCard.answer}
                    </p>
                    <div className="bg-slate-900/40 border border-white/[0.03] rounded-xl p-2.5 text-[10px] text-indigo-300 leading-relaxed font-light">
                      <span className="font-bold text-indigo-400 uppercase text-[8px] tracking-wider block mb-0.5">Admin Tip</span>
                      {activeCard.tip}
                    </div>
                  </div>

                  <div className="border-t border-white/[0.04] pt-3 text-[10px] text-slate-500 font-semibold uppercase tracking-wider text-center">
                    Click Card to return to Question
                  </div>
                </Card>
              </div>

            </div>
          </div>

          {/* Difficulty Rating Flags at Bottom */}
          {isFlipped && (
            <div className="w-full flex items-center justify-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Button
                onClick={(e) => { e.stopPropagation(); handleFlagCard('hard'); }}
                className="bg-rose-950/45 hover:bg-rose-900 border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all"
              >
                Hard (Again)
              </Button>
              <Button
                onClick={(e) => { e.stopPropagation(); handleFlagCard('medium'); }}
                className="bg-indigo-950/45 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all"
              >
                Medium (Review)
              </Button>
              <Button
                onClick={(e) => { e.stopPropagation(); handleFlagCard('easy'); }}
                className="bg-emerald-950/45 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all"
              >
                Easy (Clear)
              </Button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
