'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, HelpCircle, Code, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface InterviewQuestion {
  id: number;
  question: string;
  keywords: string[];
  expectedTopics: string;
}

const QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    question: "Explain the difference between SQL and NoSQL database scaling.",
    keywords: ["relational", "horizontal", "vertical", "schema", "table", "document", "scale"],
    expectedTopics: "Relational constraints vs dynamic document scaling. Horizontal vs vertical resources."
  },
  {
    id: 2,
    question: "What is the JavaScript event loop and how does it prevent call stack blocking?",
    keywords: ["asynchronous", "call stack", "callback queue", "microtask", "single thread", "web api", "non-blocking"],
    expectedTopics: "Single-threaded async processing, delegating Web APIs, pushing to callback queues."
  },
  {
    id: 3,
    question: "Explain the difference between client-side rendering (CSR) and server-side rendering (SSR).",
    keywords: ["client", "server", "seo", "render", "hydration", "performance", "initial load"],
    expectedTopics: "Prerendering static HTML on servers vs execution bootstrap loops in browser shells."
  }
];

export default function InterviewPrepPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "==================================================",
    "  LOKI'S ADMINISTRATIVE MOCK INTERVIEW TERMINAL    ",
    "  SYSTEM VERIFICATION INITIALIZED... STATUS: ACTIVE",
    "==================================================",
    "\n[AI Interviewer] Greetings candidate. I am the Node System Evaluator.",
    "I will test your core software engineering and architectural capacities.",
    "Type 'help' to review shell utilities. Press 'Begin' or type 'next' to start.",
    "\nhub-terminal:~$ "
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTestActive, setIsTestActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const addLog = (message: string) => {
    setTerminalLogs(prev => [...prev, message]);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const command = inputValue.trim();
    setInputValue('');

    // Echo command into console logs
    addLog(`\nhub-terminal:~$ ${command}`);

    const parts = command.split(' ');
    const baseCommand = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    // 1. HELP command
    if (baseCommand === 'help') {
      addLog("\nAvailable CLI Telemetry Utilities:\n" +
             "  help             - Render this support manual.\n" +
             "  clear            - Wipe the terminal output buffer.\n" +
             "  status           - Print candidate node credentials.\n" +
             "  next             - Load the active interview question prompt.\n" +
             "  answer <text>    - Submit your explanation for evaluation.\n" +
             "  reset            - Reset the entire interview sequence.");
    }
    
    // 2. CLEAR command
    else if (baseCommand === 'clear') {
      setTerminalLogs(["// Terminal screen buffer cleared.", "hub-terminal:~$ "]);
    }
    
    // 3. STATUS command
    else if (baseCommand === 'status') {
      addLog(`\n--- NODE TELEMETRY SYSTEM ---` +
             `\nCandidate Clearance: Level 1 Node` +
             `\nCurrent Question ID: ${isTestActive ? currentIdx + 1 : 'None active'}` +
             `\nEvaluation Score  : ${completed ? '100% Certified' : 'In Progress'}` +
             `\nStatus Code       : SECURITY_OK`);
    }

    // 4. RESET command
    else if (baseCommand === 'reset') {
      setCurrentIdx(0);
      setIsTestActive(false);
      setCompleted(false);
      setTerminalLogs([
        "==================================================",
        "  MOCK INTERVIEW TERMINAL RESET COMPLETED         ",
        "==================================================",
        "\nhub-terminal:~$ "
      ]);
      toast.success("Interview prep terminal reset successfully!");
    }

    // 5. NEXT command
    else if (baseCommand === 'next') {
      if (completed) {
        addLog("\n[System] All modules verified! No further questions in buffer.");
        return;
      }

      setIsTestActive(true);
      const activeQ = QUESTIONS[currentIdx];
      addLog(`\n[System] Loaded Evaluation Prompt ${activeQ.id} of ${QUESTIONS.length}:\n` +
             `--------------------------------------------------\n` +
             `QUESTION: ${activeQ.question}\n` +
             `--------------------------------------------------\n` +
             `To submit, type: answer <your detailed explanation here>`);
    }

    // 6. ANSWER command
    else if (baseCommand === 'answer') {
      if (!isTestActive) {
        addLog("\n[System] Error: No evaluation prompt active. Type 'next' to begin.");
        return;
      }
      if (!args) {
        addLog("\n[System] Error: Missing answer arguments. Usage: answer <your explanation>");
        return;
      }

      const activeQ = QUESTIONS[currentIdx];
      const answerLower = args.toLowerCase();
      
      // Analyze answer via keywords matching
      const matches = activeQ.keywords.filter(keyword => answerLower.includes(keyword));
      const matchRatio = matches.length / activeQ.keywords.length;

      addLog(`\nAnalyzing clearance response packet...`);
      
      setTimeout(() => {
        if (matchRatio >= 0.3) {
          addLog(`\n[AI Interviewer] Verification Successful!` +
                 `\nMatched Key Concepts: [${matches.join(', ')}]` +
                 `\nScore Assessment    : HIGH CLEARANCE` +
                 `\nTopic Explanation   : Approved. Correctly verified ${activeQ.expectedTopics}`);

          if (currentIdx < QUESTIONS.length - 1) {
            setCurrentIdx(prev => prev + 1);
            addLog(`\n[System] Question ${activeQ.id} complete. Type 'next' to advance.`);
            toast.success("Correct answer submitted!");
          } else {
            setCompleted(true);
            setIsTestActive(false);
            addLog(`\n==================================================` +
                   `\n  CONGRATULATIONS! ALL VERIFICATIONS COMPLETED!  ` +
                   `\n  NODE PRIVILEGES CERTIFIED WITH HIGH SCORES!     ` +
                   `\n==================================================`);
            toast.success("Mock Interview completed with honors!");
          }
        } else {
          addLog(`\n[AI Interviewer] Verification Terminated. insufficient parameters.` +
                 `\nKey Technical Concepts Missing. (We expected concepts like: ${activeQ.keywords.slice(0, 3).join(', ')})` +
                 `\nRetry Recommendation: Analyze the topic focus details and run: answer <revised text>`);
          toast.error("Answer lacks technical depth. Please retry!");
        }
      }, 500);
    }
    
    // 7. Unknown command fallback
    else {
      addLog(`\nhub-terminal: Command not recognized: '${baseCommand}'. Type 'help' for manual.`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Terminal className="h-6 w-6 text-purple-400" />
          Mock Interview Shell
        </h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">
          Demonstrate verbal conceptual depth by responding to Loki's simulated node technical evaluator prompt.
        </p>
      </div>

      {/* Retro CRT Terminal Frame */}
      <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/20 via-white/[0.03] to-indigo-500/20 shadow-[0_0_40px_rgba(139,92,246,0.1)] max-w-3xl mx-auto">
        <Card className="border-none bg-slate-950/85 backdrop-blur-2xl rounded-3xl overflow-hidden flex flex-col h-[500px]">
          {/* Header Controls Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider ml-1">LOKI_CLI_INTERPRETER v1.2</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[9px] font-bold text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="h-3 w-3" />
                Clearance Valid
              </span>
            </div>
          </div>

          {/* Glowing CRT output screen */}
          <div className="flex-1 p-5 overflow-y-auto font-mono text-[11px] text-emerald-400 leading-relaxed text-left bg-slate-950/95 shadow-[inset_0_0_30px_rgba(0,0,0,0.95)] relative space-y-1 select-text">
            {/* Scanline CRT overlay filter */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.005] to-transparent pointer-events-none bg-[length:100%_4px] opacity-30" />

            {terminalLogs.map((log, idx) => (
              <div key={idx} className="whitespace-pre-wrap">
                {log}
              </div>
            ))}
            <div ref={consoleBottomRef} />
          </div>

          {/* Interactive Shell Input panel */}
          <form onSubmit={handleCommandSubmit} className="p-3.5 bg-slate-950 border-t border-white/[0.04] flex items-center gap-3 shrink-0">
            <span className="text-slate-500 font-bold font-mono text-xs select-none">hub-terminal:~$</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type commands here... (e.g. 'help', 'next')"
              className="flex-1 bg-transparent border-none text-emerald-400 font-mono text-xs focus:outline-none focus:ring-0 placeholder-slate-700 leading-none h-6"
              spellCheck="false"
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              className="h-7 w-7 p-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer flex items-center justify-center"
            >
              <Send className="h-3 w-3" />
            </Button>
          </form>
        </Card>
      </div>

      <div className="max-w-md mx-auto text-center text-[10px] text-slate-500 leading-relaxed font-light flex items-center gap-1.5 justify-center">
        <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
        Need a hint? Type 'help' to print the commands guidelines. Use 'answer &lt;text&gt;' to verify prompts!
      </div>
    </div>
  );
}
