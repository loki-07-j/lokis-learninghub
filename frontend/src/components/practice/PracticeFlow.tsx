'use client';

import React, { useState, useEffect } from 'react';
import { PracticeQuestion } from '@/services/practice';
import {
  MCQRenderer,
  MultiSelectRenderer,
  OutputPredictionRenderer,
  ScenarioAnalysisRenderer,
  DebugBasedRenderer,
  FlowSequencingRenderer,
  CodeCompletionRenderer,
  ArchitectureReasoningRenderer,
} from './QuestionRenderers';

interface PracticeFlowProps {
  question: PracticeQuestion;
  onSubmit: (answer: any, reasoning: string, timeTaken: number) => Promise<void>;
  isSubmitting?: boolean;
  showFeedback?: boolean;
  feedback?: any;
}

export const PracticeFlow: React.FC<PracticeFlowProps> = ({
  question,
  onSubmit,
  isSubmitting = false,
  showFeedback = false,
  feedback,
}) => {
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [userReasoning, setUserReasoning] = useState('');
  const [startTime] = useState(Date.now());
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsLocalSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    try {
      await onSubmit(userAnswer, userReasoning, timeTaken);
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const renderQuestionContent = () => {
    const options = question.options_json as any;

    switch (question.question_type) {
      case 'MCQ':
        return (
          <MCQRenderer
            question={question.question_text}
            options={options?.options || []}
            selectedAnswer={userAnswer}
            onSelectAnswer={setUserAnswer}
            disabled={showFeedback}
          />
        );

      case 'MULTI_SELECT':
        return (
          <MultiSelectRenderer
            question={question.question_text}
            options={options?.options || []}
            selectedAnswers={userAnswer || []}
            onToggleAnswer={(optionId) => {
              const current = userAnswer || [];
              if (current.includes(optionId)) {
                setUserAnswer(current.filter((id: string) => id !== optionId));
              } else {
                setUserAnswer([...current, optionId]);
              }
            }}
            disabled={showFeedback}
          />
        );

      case 'OUTPUT_PREDICTION':
        return (
          <OutputPredictionRenderer
            question={question.question_text}
            hint={options?.hint}
            userInput={userAnswer || ''}
            onInputChange={setUserAnswer}
            disabled={showFeedback}
          />
        );

      case 'SCENARIO_ANALYSIS':
        return (
          <ScenarioAnalysisRenderer
            scenario={question.scenario_context || ''}
            question={question.question_text}
            userReasoning={userReasoning}
            onReasoningChange={setUserReasoning}
            disabled={showFeedback}
          />
        );

      case 'DEBUG_BASED':
        return (
          <DebugBasedRenderer
            scenario={options?.scenario || question.scenario_context || ''}
            question={question.question_text}
            userAnswer={userAnswer || ''}
            onAnswerChange={setUserAnswer}
            disabled={showFeedback}
          />
        );

      case 'FLOW_SEQUENCING':
        return (
          <FlowSequencingRenderer
            question={question.question_text}
            items={options?.items || []}
            sequence={userAnswer || []}
            onReorder={setUserAnswer}
            disabled={showFeedback}
          />
        );

      case 'CODE_COMPLETION':
        return (
          <CodeCompletionRenderer
            question={question.question_text}
            codeTemplate={options?.template || ''}
            userCode={userAnswer || ''}
            onCodeChange={setUserAnswer}
            disabled={showFeedback}
          />
        );

      case 'ARCHITECTURE_REASONING':
        return (
          <ArchitectureReasoningRenderer
            question={question.question_text}
            context={question.scenario_context}
            userAnswer={userAnswer || ''}
            onAnswerChange={setUserAnswer}
            disabled={showFeedback}
          />
        );

      default:
        return <p className="text-slate-500 text-sm">Unknown question type</p>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Question Header */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <h2 className="text-lg font-bold text-white leading-tight flex-1">{question.title}</h2>
        <div className="flex gap-2 shrink-0">
          <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
            {question.thinking_type}
          </span>
          <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
            {question.difficulty_level}
          </span>
        </div>
      </div>

      {/* Visual Reference */}
      {question.visual_reference && (
        <div className="bg-slate-900/40 p-3 rounded-xl border border-white/[0.05]">
          <img src={question.visual_reference} alt="Visual reference" className="max-w-full h-auto rounded-lg" />
        </div>
      )}

      {/* Question Content */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/[0.05]">
        {renderQuestionContent()}
      </div>

      {/* Reasoning Input */}
      {question.question_type !== 'SCENARIO_ANALYSIS' &&
       question.question_type !== 'ARCHITECTURE_REASONING' &&
       question.question_type !== 'DEBUG_BASED' && (
        <div className="bg-slate-900/30 p-4 rounded-2xl border border-white/[0.04]">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Explain Your Thinking <span className="text-slate-600 font-normal">(optional but boosts score)</span>
          </label>
          <textarea
            value={userReasoning}
            onChange={(e) => setUserReasoning(e.target.value)}
            disabled={showFeedback}
            placeholder="Share your thought process and reasoning..."
            className="w-full bg-slate-900/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/40 min-h-20 resize-none transition-colors"
          />
          <p className="text-[10px] text-slate-600 mt-1.5">Detailed reasoning improves your thinking score by up to 30 points.</p>
        </div>
      )}

      {/* Feedback Display */}
      {showFeedback && feedback && (
        <div className="space-y-3">
          <div className={`p-4 rounded-2xl border-2 ${feedback.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <p className={`font-bold text-base ${feedback.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
          </div>
          <div className="bg-blue-500/5 border-l-4 border-blue-500/50 p-4 rounded-r-xl">
            <p className="text-xs font-bold text-blue-400 mb-1.5">Explanation</p>
            <p className="text-xs text-slate-300 leading-relaxed">{feedback.explanation}</p>
          </div>
          {feedback.expectedReasoning && (
            <div className="bg-purple-500/5 border-l-4 border-purple-500/50 p-4 rounded-r-xl">
              <p className="text-xs font-bold text-purple-400 mb-1.5">Expected Thinking</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {typeof feedback.expectedReasoning === 'string'
                  ? feedback.expectedReasoning
                  : JSON.stringify(feedback.expectedReasoning)}
              </p>
            </div>
          )}
          {feedback.userReasoning && (
            <div className="bg-slate-900/40 border-l-4 border-slate-600/50 p-4 rounded-r-xl">
              <p className="text-xs font-bold text-slate-400 mb-1.5">Your Reasoning</p>
              <p className="text-xs text-slate-400 leading-relaxed">{feedback.userReasoning}</p>
            </div>
          )}
          {feedback.tips && feedback.tips.length > 0 && (
            <div className="bg-yellow-500/5 border-l-4 border-yellow-500/40 p-4 rounded-r-xl">
              <p className="text-xs font-bold text-yellow-400 mb-1.5">Tips for Improvement</p>
              <ul className="space-y-1">
                {feedback.tips.map((tip: string, index: number) => (
                  <li key={index} className="text-xs text-slate-400">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      {!showFeedback && (
        <button
          onClick={handleSubmit}
          disabled={isLocalSubmitting || isSubmitting || userAnswer === null}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
        >
          {isLocalSubmitting || isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      )}
    </div>
  );
};
