'use client';

import React from 'react';

const inputClass = 'w-full bg-slate-900/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/40 transition-colors resize-none';

// ---- MCQ ----

interface MCQOption { id: string; text: string }

interface MCQRendererProps {
  question: string;
  options: MCQOption[];
  selectedAnswer: string | null;
  onSelectAnswer: (optionId: string) => void;
  disabled?: boolean;
}

export const MCQRenderer: React.FC<MCQRendererProps> = ({ question, options, selectedAnswer, onSelectAnswer, disabled = false }) => (
  <div className="space-y-4">
    <p className="text-sm font-semibold text-slate-100 leading-relaxed">{question}</p>
    <div className="space-y-2">
      {options.map((option) => {
        const selected = selectedAnswer === option.id;
        return (
          <label
            key={option.id}
            className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              selected
                ? 'border-purple-500/60 bg-purple-500/10 text-white'
                : 'border-white/[0.06] bg-slate-900/40 text-slate-300 hover:border-white/[0.15]'
            }`}
          >
            <input
              type="radio"
              name="mcq-option"
              value={option.id}
              checked={selected}
              onChange={() => onSelectAnswer(option.id)}
              disabled={disabled}
              className="accent-purple-500 w-4 h-4 shrink-0"
            />
            <span className="text-xs">{option.text}</span>
          </label>
        );
      })}
    </div>
  </div>
);

// ---- Multi-Select ----

interface MultiSelectRendererProps {
  question: string;
  options: MCQOption[];
  selectedAnswers: string[];
  onToggleAnswer: (optionId: string) => void;
  disabled?: boolean;
}

export const MultiSelectRenderer: React.FC<MultiSelectRendererProps> = ({ question, options, selectedAnswers, onToggleAnswer, disabled = false }) => (
  <div className="space-y-4">
    <p className="text-sm font-semibold text-slate-100 leading-relaxed">{question}</p>
    <p className="text-[10px] text-slate-500">Select all that apply</p>
    <div className="space-y-2">
      {options.map((option) => {
        const selected = selectedAnswers.includes(option.id);
        return (
          <label
            key={option.id}
            className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              selected
                ? 'border-purple-500/60 bg-purple-500/10 text-white'
                : 'border-white/[0.06] bg-slate-900/40 text-slate-300 hover:border-white/[0.15]'
            }`}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleAnswer(option.id)}
              disabled={disabled}
              className="accent-purple-500 w-4 h-4 shrink-0"
            />
            <span className="text-xs">{option.text}</span>
          </label>
        );
      })}
    </div>
  </div>
);

// ---- Output Prediction ----

interface OutputPredictionRendererProps {
  question: string;
  hint?: string;
  userInput: string;
  onInputChange: (value: string) => void;
  disabled?: boolean;
}

export const OutputPredictionRenderer: React.FC<OutputPredictionRendererProps> = ({ question, hint, userInput, onInputChange, disabled = false }) => (
  <div className="space-y-4">
    <p className="text-sm font-semibold text-slate-100 leading-relaxed">{question}</p>
    {hint && (
      <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-xl">
        <p className="text-xs text-blue-300">{hint}</p>
      </div>
    )}
    <textarea
      value={userInput}
      onChange={(e) => onInputChange(e.target.value)}
      disabled={disabled}
      placeholder="Enter the expected output..."
      className={`${inputClass} min-h-24 font-mono`}
    />
  </div>
);

// ---- Scenario Analysis ----

interface ScenarioAnalysisRendererProps {
  scenario: string;
  question: string;
  userReasoning: string;
  onReasoningChange: (value: string) => void;
  disabled?: boolean;
}

export const ScenarioAnalysisRenderer: React.FC<ScenarioAnalysisRendererProps> = ({ scenario, question, userReasoning, onReasoningChange, disabled = false }) => (
  <div className="space-y-4">
    <div className="bg-yellow-500/5 border-l-4 border-yellow-500/50 p-4 rounded-r-xl">
      <p className="text-[10px] font-bold text-yellow-400 mb-1.5">Scenario</p>
      <p className="text-xs text-slate-300 leading-relaxed">{scenario}</p>
    </div>
    <p className="text-sm font-semibold text-slate-100 leading-relaxed">{question}</p>
    <textarea
      value={userReasoning}
      onChange={(e) => onReasoningChange(e.target.value)}
      disabled={disabled}
      placeholder="Explain your thinking and analysis..."
      className={`${inputClass} min-h-32`}
    />
    <p className="text-[10px] text-slate-600">Provide detailed reasoning to demonstrate scenario understanding.</p>
  </div>
);

// ---- Debug Based ----

interface DebugBasedRendererProps {
  scenario: string;
  question: string;
  userAnswer: string;
  onAnswerChange: (value: string) => void;
  disabled?: boolean;
}

export const DebugBasedRenderer: React.FC<DebugBasedRendererProps> = ({ scenario, question, userAnswer, onAnswerChange, disabled = false }) => (
  <div className="space-y-4">
    <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
      <p className="text-[10px] font-bold text-red-400 mb-2">Buggy Code</p>
      <pre className="font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">{scenario}</pre>
    </div>
    <p className="text-sm font-semibold text-slate-100 leading-relaxed">{question}</p>
    <textarea
      value={userAnswer}
      onChange={(e) => onAnswerChange(e.target.value)}
      disabled={disabled}
      placeholder="Identify the issues and explain how to fix them..."
      className={`${inputClass} min-h-32`}
    />
  </div>
);

// ---- Flow Sequencing ----

interface FlowSequencingRendererProps {
  question: string;
  items: Array<{ id: string; text: string }>;
  sequence: string[];
  onReorder: (newSequence: string[]) => void;
  disabled?: boolean;
}

export const FlowSequencingRenderer: React.FC<FlowSequencingRendererProps> = ({ question, items, sequence, onReorder, disabled = false }) => {
  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (disabled) return;
    const newSeq = [...sequence];
    if (direction === 'up' && index > 0) {
      [newSeq[index - 1], newSeq[index]] = [newSeq[index], newSeq[index - 1]];
    } else if (direction === 'down' && index < newSeq.length - 1) {
      [newSeq[index], newSeq[index + 1]] = [newSeq[index + 1], newSeq[index]];
    }
    onReorder(newSeq);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-100 leading-relaxed">{question}</p>
      <p className="text-[10px] text-slate-500">Use arrows to arrange in the correct order</p>
      <div className="space-y-2">
        {sequence.map((itemId, index) => {
          const item = items.find((i) => i.id === itemId);
          return (
            <div key={itemId} className="flex items-center gap-3 p-3 bg-slate-900/40 border border-white/[0.05] rounded-xl">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => handleMove(index, 'up')} disabled={disabled || index === 0}
                  className="text-slate-500 hover:text-slate-200 disabled:opacity-30 text-xs leading-none cursor-pointer">▲</button>
                <button onClick={() => handleMove(index, 'down')} disabled={disabled || index === sequence.length - 1}
                  className="text-slate-500 hover:text-slate-200 disabled:opacity-30 text-xs leading-none cursor-pointer">▼</button>
              </div>
              <span className="font-bold text-purple-400 text-sm min-w-fit">{index + 1}.</span>
              <span className="text-xs text-slate-300">{item?.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Code Completion ----

interface CodeCompletionRendererProps {
  question: string;
  codeTemplate: string;
  userCode: string;
  onCodeChange: (value: string) => void;
  disabled?: boolean;
}

export const CodeCompletionRenderer: React.FC<CodeCompletionRendererProps> = ({ question, codeTemplate, userCode, onCodeChange, disabled = false }) => (
  <div className="space-y-4">
    <p className="text-sm font-semibold text-slate-100 leading-relaxed">{question}</p>
    {codeTemplate && (
      <div className="bg-slate-950/80 border border-white/[0.06] rounded-xl p-4">
        <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Template / Context</p>
        <pre className="font-mono text-xs text-slate-300 overflow-x-auto">{codeTemplate}</pre>
      </div>
    )}
    <textarea
      value={userCode}
      onChange={(e) => onCodeChange(e.target.value)}
      disabled={disabled}
      placeholder="Write your code here..."
      className={`${inputClass} min-h-32 font-mono`}
    />
  </div>
);

// ---- Architecture Reasoning ----

interface ArchitectureReasoningRendererProps {
  question: string;
  context?: string;
  userAnswer: string;
  onAnswerChange: (value: string) => void;
  disabled?: boolean;
}

export const ArchitectureReasoningRenderer: React.FC<ArchitectureReasoningRendererProps> = ({ question, context, userAnswer, onAnswerChange, disabled = false }) => (
  <div className="space-y-4">
    {context && (
      <div className="bg-purple-500/5 border-l-4 border-purple-500/50 p-4 rounded-r-xl">
        <p className="text-[10px] font-bold text-purple-400 mb-1.5">Context</p>
        <p className="text-xs text-slate-300 leading-relaxed">{context}</p>
      </div>
    )}
    <p className="text-sm font-semibold text-slate-100 leading-relaxed">{question}</p>
    <textarea
      value={userAnswer}
      onChange={(e) => onAnswerChange(e.target.value)}
      disabled={disabled}
      placeholder="Explain your architectural design decisions..."
      className={`${inputClass} min-h-40`}
    />
    <p className="text-[10px] text-slate-600">Consider scalability, maintainability, performance, and best practices.</p>
  </div>
);
