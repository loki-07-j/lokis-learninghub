'use client';

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Copy, Code2, Terminal, HelpCircle, FileCode, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const TEMPLATES = {
  js: `// Loki's JS Sandbox - Write, test, and run code here!
const userClearance = "Active Node";
const systemCore = {
  name: "Loki's Learning Hub",
  version: "6.0.0-Beta",
  modules: ["Sandbox", "Assessments", "Revision"]
};

function verifySystem(core) {
  console.log("Initializing clearance protocols...");
  console.log(\`System Clear: \${core.name} v\${core.version}\`);
  console.log("Assigned status: " + userClearance);
  return "Clearance Granted";
}

verifySystem(systemCore);`,
  algo: `// Algorithm Sandbox - Sum of Array Elements
function sumPrimes(limit) {
  console.log("Finding all primes up to: " + limit);
  let primes = [];
  for (let i = 2; i <= limit; i++) {
    let isPrime = true;
    for (let j = 2; j <= Math.sqrt(i); j++) {
      if (i % j === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(i);
  }
  
  console.log("Primes found: " + primes.join(", "));
  const sum = primes.reduce((acc, curr) => acc + curr, 0);
  return "Sum of Primes: " + sum;
}

sumPrimes(30);`,
  json: `// JSON manipulation templates
const databaseNodes = [
  { id: "NODE_01", status: "Active", throughput: "1.2 GB/s" },
  { id: "NODE_02", status: "Maintenance", throughput: "0.0 GB/s" },
  { id: "NODE_03", status: "Active", throughput: "920 MB/s" }
];

console.log("Analyzing cluster telemetry...");
const activeOnly = databaseNodes.filter(n => n.status === "Active");
console.log("Active Nodes detected: " + activeOnly.length);
activeOnly;`
};

export default function PracticePage() {
  const [code, setCode] = useState(TEMPLATES.js);
  const [output, setOutput] = useState<string[]>([
    "// Welcome to Loki's Sandbox console.",
    "// Press 'Run Sandbox' to execute your code.",
    "// Execution output and system logs will render below."
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<'js' | 'algo' | 'json'>('js');

  const handleTemplateChange = (templateKey: 'js' | 'algo' | 'json') => {
    setSelectedTemplate(templateKey);
    setCode(TEMPLATES[templateKey]);
    toast.success(`Loaded ${templateKey.toUpperCase()} template`);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Editor code copied to clipboard!");
  };

  const runCode = () => {
    setOutput([]);
    const logs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;
    
    // Capture console.log outputs
    console.log = (...args) => {
      logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
    };

    // Capture console.error outputs
    console.error = (...args) => {
      logs.push(`❌ ${args.map(arg => String(arg)).join(' ')}`);
    };

    const startTime = performance.now();
    try {
      // Execute the JavaScript code dynamically
      const result = new Function(code)();
      const endTime = performance.now();
      
      if (result !== undefined) {
        logs.push(`\n=> Returned: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}`);
      }
      logs.push(`\n[Execution complete in ${(endTime - startTime).toFixed(2)}ms]`);
    } catch (err: any) {
      logs.push(`\n❌ Compilation/Runtime Error: ${err.message}`);
    } finally {
      // Restore standard console logs
      console.log = originalLog;
      console.error = originalError;
    }

    setOutput(logs);
    toast.success("Execution complete!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Code2 className="h-6 w-6 text-purple-400" />
            Sandbox Playground
          </h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Write production-grade code, test logic variables, and examine client-side outputs instantly.
          </p>
        </div>

        {/* Template Selectors */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-white/[0.05]">
          <button
            onClick={() => handleTemplateChange('js')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              selectedTemplate === 'js' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Core JS
          </button>
          <button
            onClick={() => handleTemplateChange('algo')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              selectedTemplate === 'algo' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Algorithms
          </button>
          <button
            onClick={() => handleTemplateChange('json')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              selectedTemplate === 'json' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Telemetry JSON
          </button>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Side: Code Editor Card */}
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/20 via-white/[0.03] to-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)] flex flex-col">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-5 md:p-6 flex-1 flex flex-col">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between border-b border-white/[0.04]">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode className="h-4.5 w-4.5 text-purple-400" />
                  Editor Interface
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-500 font-light">
                  Direct code execution frame buffer.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCopyCode}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.05] text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={() => handleTemplateChange(selectedTemplate)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.05] text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col mt-4">
              <div className="relative flex-1 rounded-2xl border border-white/[0.05] bg-black/40 overflow-hidden flex min-h-[350px]">
                {/* Simulated Line Numbers */}
                <div className="w-10 bg-black/60 border-r border-white/[0.04] p-3 text-right font-mono text-[10px] text-slate-600 select-none space-y-1">
                  {Array.from({ length: Math.max(15, code.split('\n').length) }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                {/* Editor Textarea */}
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 bg-transparent p-3 text-xs text-purple-200 font-mono focus:outline-none resize-none leading-relaxed overflow-y-auto min-h-full"
                  spellCheck="false"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-light flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Javascript Compiler Active
                </span>
                <Button
                  onClick={runCode}
                  className="bg-purple-600 hover:bg-purple-500 text-xs font-bold px-5 py-2.5 rounded-xl border border-purple-400/20 shadow-[0_0_15px_rgba(147,51,234,0.25)] hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-300 cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Run Sandbox
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Output Terminal Card */}
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500/20 via-white/[0.03] to-purple-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)] flex flex-col">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-5 md:p-6 flex-1 flex flex-col">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between border-b border-white/[0.04]">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                  Glow Terminal Output
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-500 font-light">
                  Simulated telemetry logs screen.
                </CardDescription>
              </div>

              <Button
                onClick={() => setOutput(["// Output screen cleared."])}
                variant="ghost"
                size="sm"
                className="h-8 px-3 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.05] text-slate-400 hover:text-white transition-all cursor-pointer text-[10px] font-bold uppercase tracking-wider"
              >
                Clear
              </Button>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col mt-4">
              <div className="flex-1 rounded-2xl border border-indigo-500/20 bg-slate-950/90 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] p-4 font-mono text-xs text-emerald-400 overflow-y-auto min-h-[350px] space-y-1 text-left relative flex flex-col justify-start">
                {/* Terminal Scanline effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.005] to-transparent pointer-events-none bg-[length:100%_4px] opacity-40" />
                
                {output.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap leading-relaxed select-text">
                    {line}
                  </div>
                ))}
                
                {/* Prompt blinker */}
                <div className="flex items-center gap-1.5 pt-2 text-slate-600 font-bold select-none">
                  <span>hub-node:~ loki$</span>
                  <span className="h-3 w-1.5 bg-emerald-400 animate-pulse shrink-0" />
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center gap-1.5 text-[10px] text-slate-500 font-light justify-start">
                <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
                Standard output stream is isolated. Global state mutations will not persist.
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
