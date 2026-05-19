'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Award, Timer, CheckCircle, XCircle, ArrowRight, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Which of the following describes JavaScript closures accurately?",
    options: [
      "A mechanism to close standard web browser pages after execution",
      "The combination of a function bundled together with references to its surrounding state (lexical environment)",
      "A feature that automatically clears isolated variables inside database tables",
      "An asynchronous event loop method designed to close active websocket connections"
    ],
    correctAnswer: 1,
    explanation: "A closure gives you access to an outer function's scope from an inner function. In JavaScript, closures are created every time a function is created, at function creation time."
  },
  {
    id: 2,
    text: "In React, what is the primary benefit of utilizing key properties inside dynamic list renders?",
    options: [
      "Keys allow React to verify and encrypt list elements using standard hashes",
      "Keys assist React in identifying which items have changed, are added, or are removed, ensuring virtual DOM stability",
      "Keys automatically assign background styling templates to all list components",
      "Keys force the component state to clear completely during pagination events"
    ],
    correctAnswer: 1,
    explanation: "Keys help React identify which items have changed, been added, or been removed. They should be given to the elements inside the array to give the elements a stable identity."
  },
  {
    id: 3,
    text: "Which HTTP status code corresponds to 'Unauthorized access validation issues'?",
    options: [
      "400 Bad Request",
      "401 Unauthorized",
      "403 Forbidden",
      "404 Not Found"
    ],
    correctAnswer: 1,
    explanation: "401 Unauthorized is used when authentication is required and has failed or has not yet been provided. (403 Forbidden is used when credentials are correct but lack authorization)."
  },
  {
    id: 4,
    text: "What is the primary difference between standard SQL database primary keys and foreign keys?",
    options: [
      "Primary keys are only utilized in cloud instances, while foreign keys operate on local clusters",
      "A primary key uniquely identifies each record in a table, while a foreign key links records between two tables",
      "Primary keys allow null properties, whereas foreign keys enforce strict integer limits",
      "Primary keys only support strings, while foreign keys allow dynamic arrays"
    ],
    correctAnswer: 1,
    explanation: "A primary key is a unique identifier for a table row, preventing duplicates and nulls. A foreign key is a column or group of columns that provides a link between data in two tables, representing a relationship."
  }
];

export default function TestsPage() {
  const [testActive, setTestActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (testActive && timeLeft > 0 && score === null) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && testActive && score === null) {
      handleFinishTest(true);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [testActive, timeLeft, score]);

  const handleStartTest = () => {
    setTestActive(true);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setAnswers([]);
    setScore(null);
    setTimeLeft(120);
    toast.success("Privilege Clearance Exam Initialized!");
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) {
      toast.error("Please select an answer to advance!");
      return;
    }

    const updatedAnswers = [...answers, selectedOption];
    setAnswers(updatedAnswers);

    if (currentQuestionIdx < QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // Last question submitted, tally score
      handleFinishTest(false, updatedAnswers);
    }
  };

  const handleFinishTest = (timeOut = false, finalAnswers = answers) => {
    if (timeOut) {
      toast.error("Exam time expired! Auto-submitting answers...");
    }

    let correctCount = 0;
    QUESTIONS.forEach((q, idx) => {
      const ans = finalAnswers[idx];
      if (ans !== undefined && ans === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / QUESTIONS.length) * 100);
    setScore(finalScore);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (finalScore >= 75) {
      toast.success(`Exam Passed with ${finalScore}%! Node privilege clearance upgraded!`);
    } else {
      toast.error(`Exam Failed with ${finalScore}%. Please review revision modules.`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeQuestion = QUESTIONS[currentQuestionIdx];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-purple-400" />
            Assessment Center
          </h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Test your clearance level by taking structured engineering exams. Pass with 75% or higher to upgrade Node ranks.
          </p>
        </div>

        {testActive && score === null && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.05] text-xs font-bold font-mono">
            <Timer className="h-4 w-4 text-purple-400 animate-pulse" />
            <span className={timeLeft < 30 ? "text-rose-400" : "text-slate-300"}>
              Time Left: {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Main Panel */}
      {!testActive ? (
        /* Landing View: Start Test Card */
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/20 via-white/[0.03] to-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)] max-w-xl mx-auto mt-6">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-6 md:p-8 text-center space-y-6">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShieldAlert className="h-7 w-7 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Privilege Clearance Exam: Level 1 Node Check</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                This verification test is compiled of 4 core multiple-choice technical questions covering JavaScript execution, virtual rendering loops, API security protocols, and relational indexes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left border-y border-white/[0.04] py-4 my-2 text-xs font-light space-y-0.5">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Duration Limit</span>
                <span className="text-slate-300 font-semibold font-mono">120 Seconds</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Clearance Goal</span>
                <span className="text-emerald-400 font-semibold">75% Score (3/4 Correct)</span>
              </div>
            </div>

            <Button
              onClick={handleStartTest}
              className="w-full bg-purple-600 hover:bg-purple-500 text-xs font-bold h-11 rounded-xl border border-purple-400/20 shadow-[0_0_20px_rgba(147,51,234,0.25)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Begin Clearance Verification <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </div>
      ) : score !== null ? (
        /* Result View Card */
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500/20 via-white/[0.03] to-purple-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)] max-w-xl mx-auto mt-6">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-6 md:p-8 text-center space-y-6">
            <div className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center border">
              {score >= 75 ? (
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="h-7 w-7" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {score >= 75 ? "Clearance Verified!" : "Verification Terminated"}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {score >= 75 
                  ? "Congratulations! You have completed Level 1 privilege clearance. Active Node privileges have been successfully deployed."
                  : "We regret to inform you that your evaluation did not meet the 75% target threshold. Review revision content and try again."}
              </p>
            </div>

            {/* Score Ring */}
            <div className="inline-block p-6 rounded-full bg-slate-900/60 border border-white/[0.04] text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1">Final Score</span>
              <span className={`text-3xl font-extrabold font-mono ${score >= 75 ? "text-emerald-400" : "text-rose-400"}`}>
                {score}%
              </span>
            </div>

            {/* Questions breakdown review */}
            <div className="border-t border-white/[0.04] pt-4 text-left space-y-3.5 mt-2">
              <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Security Audit Review</h3>
              {QUESTIONS.map((q, idx) => {
                const ans = answers[idx];
                const isCorrect = ans === q.correctAnswer;
                return (
                  <div key={q.id} className="p-3.5 rounded-xl border border-white/[0.04] bg-slate-950/20 space-y-1.5 text-xs font-light">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-white font-semibold">Q{q.id}: {q.text}</span>
                      {isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">Admin Explanation</span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={handleStartTest}
              className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-bold h-11 rounded-xl border border-white/[0.05] text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Clearance Exam
            </Button>
          </Card>
        </div>
      ) : (
        /* Active Test Question View */
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/20 via-white/[0.03] to-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)] max-w-2xl mx-auto mt-4">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-5 md:p-6 space-y-6">
            {/* Question Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                <span>Verification Exam Progress</span>
                <span>Question {currentQuestionIdx + 1} of {QUESTIONS.length}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/[0.04]">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Body */}
            <div className="space-y-4">
              <h2 className="text-sm font-extrabold text-white leading-relaxed text-left">
                {activeQuestion.text}
              </h2>

              {/* Options Grid */}
              <div className="flex flex-col gap-2.5">
                {activeQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs leading-relaxed transition-all duration-200 cursor-pointer select-none ${
                        isSelected 
                          ? 'bg-purple-600/10 border-purple-500/40 text-purple-200 shadow-[0_0_15px_rgba(147,51,234,0.1)] font-semibold' 
                          : 'bg-slate-950/20 border-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 border text-[9px] font-bold ${
                          isSelected ? 'border-purple-400 text-purple-400 bg-purple-500/10' : 'border-slate-800 text-slate-600'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setTestActive(false)}
                className="h-9 px-4 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.05] text-slate-400 hover:text-white transition-all cursor-pointer text-xs font-semibold"
              >
                Quit Check
              </Button>
              
              <Button
                onClick={handleNextQuestion}
                disabled={selectedOption === null}
                className="bg-purple-600 hover:bg-purple-500 text-xs font-bold px-5 py-2.5 rounded-xl border border-purple-400/20 shadow-[0_0_15px_rgba(147,51,234,0.25)] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestionIdx === QUESTIONS.length - 1 ? "Complete Verification" : "Next Question"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
