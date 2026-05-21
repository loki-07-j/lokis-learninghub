import prisma from '../utils/prisma';
import {
  QuestionType,
  ThinkingType,
  DifficultyLevel,
  InterviewMode,
} from '@prisma/client';
import { recordDailyActivity, updateConceptMastery } from './progress';

// ========== PRACTICE QUESTIONS SERVICE ==========

/**
 * Get practice questions with filters
 */
export const getPracticeQuestions = async (filters: {
  topicId?: string;
  thinkingType?: ThinkingType;
  questionType?: QuestionType;
  difficulty?: DifficultyLevel;
  limit?: number;
  offset?: number;
}) => {
  const {
    topicId,
    thinkingType,
    questionType,
    difficulty,
    limit = 20,
    offset = 0,
  } = filters;

  const questions = await prisma.practiceQuestion.findMany({
    where: {
      ...(topicId && { topic_id: topicId }),
      ...(thinkingType && { thinking_type: thinkingType }),
      ...(questionType && { question_type: questionType }),
      ...(difficulty && { difficulty_level: difficulty }),
      is_active: true,
    },
    take: limit,
    skip: offset,
    include: {
      topic: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return questions;
};

/**
 * Get single question by ID
 */
export const getQuestionById = async (questionId: string) => {
  const question = await prisma.practiceQuestion.findUnique({
    where: { id: questionId },
    include: {
      topic: {
        select: {
          id: true,
          title: true,
          slug: true,
          module: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!question) {
    throw new Error(`Question not found: ${questionId}`);
  }

  return question;
};

/**
 * Get weak areas for a user - concepts they struggle with
 */
export const getWeakAreas = async (userId: string, limit: number = 10) => {
  // Get practice sessions grouped by thinking type
  const weakSessions = await prisma.practiceSession.groupBy({
    by: ['thinking_type'],
    where: {
      user_id: userId,
    },
    _avg: {
      thinking_score: true,
    },
    _count: {
      id: true,
    },
  });

  // Get thinking scores
  const thinkingScores = await prisma.thinkingScore.findMany({
    where: { user_id: userId },
  });

  const weakAreas = thinkingScores
    .filter((score) => score.current_score < 70) // Below 70% is weak
    .sort((a, b) => a.current_score - b.current_score)
    .slice(0, limit)
    .map((score) => ({
      thinkingType: score.thinking_type,
      score: score.current_score,
      weakConcepts: score.weak_concepts as string[],
    }));

  return weakAreas;
};

/**
 * Get all thinking scores for a user
 */
export const getThinkingScores = async (userId: string) => {
  const scores = await prisma.thinkingScore.findMany({
    where: { user_id: userId },
    orderBy: {
      current_score: 'desc',
    },
  });

  return scores;
};

/**
 * Get thinking score for specific type
 */
export const getThinkingScore = async (
  userId: string,
  thinkingType: ThinkingType
) => {
  const score = await prisma.thinkingScore.findUnique({
    where: {
      user_id_thinking_type: {
        user_id: userId,
        thinking_type: thinkingType,
      },
    },
  });

  if (!score) {
    // Create default score if not exists
    return await prisma.thinkingScore.create({
      data: {
        user_id: userId,
        thinking_type: thinkingType,
        current_score: 0,
      },
    });
  }

  return score;
};

// ========== PRACTICE SESSION SERVICE ==========

/**
 * Submit an answer to a practice question
 */
export const submitAnswer = async (
  userId: string,
  questionId: string,
  userAnswer: unknown,
  reasoning: string,
  timeTaken: number
) => {
  const question = await getQuestionById(questionId);

  const { isCorrect, correctnessScore, reasoningScore } = validateAnswer(
    question.question_type,
    question.correct_answer,
    userAnswer,
    reasoning
  );

  const timeEfficiency = calculateTimeEfficiency(timeTaken, question.estimated_time);
  const thinkingScore = Math.round(
    correctnessScore * 0.5 + reasoningScore * 0.3 + timeEfficiency * 0.1
  );

  const session = await prisma.practiceSession.create({
    data: {
      user_id: userId,
      question_id: questionId,
      thinking_type: question.thinking_type,
      user_answer: userAnswer as object,
      reasoning_provided: reasoning,
      is_correct: isCorrect,
      thinking_score: thinkingScore,
      correctness_score: correctnessScore,
      reasoning_score: reasoningScore,
      time_efficiency: timeEfficiency,
      time_taken: timeTaken,
      feedback: generateFeedback(question, userAnswer, reasoning, isCorrect),
    },
  });

  await updateThinkingScore(
    userId,
    question.thinking_type,
    isCorrect,
    thinkingScore
  );

  await updatePracticeProgress(userId, question.topic_id, isCorrect);

  // Phase C: record activity for heatmap + streak, update per-topic mastery
  await recordDailyActivity(userId, 1, isCorrect ? 1 : 0, Math.ceil(timeTaken / 60));
  await updateConceptMastery(userId, question.topic_id, isCorrect);

  return session;
};

/**
 * Validate answer based on question type
 */
const validateAnswer = (
  questionType: QuestionType,
  correctAnswer: unknown,
  userAnswer: unknown,
  reasoning: string
): {
  isCorrect: boolean;
  correctnessScore: number;
  reasoningScore: number;
} => {
  let isCorrect = false;
  let correctnessScore = 0;
  let reasoningScore = 0;

  switch (questionType) {
    case QuestionType.MCQ:
      isCorrect = userAnswer === correctAnswer;
      correctnessScore = isCorrect ? 50 : 0;
      break;

    case QuestionType.MULTI_SELECT:
      isCorrect = arraysEqual(
        (userAnswer as string[]).sort(),
        (correctAnswer as string[]).sort()
      );
      correctnessScore = isCorrect ? 50 : 0;
      break;

    case QuestionType.DEBUG_BASED:
      // Validate if identified issues match expected
      isCorrect = validateDebugIdentification(userAnswer, correctAnswer);
      correctnessScore = isCorrect ? 50 : 25;
      break;

    case QuestionType.OUTPUT_PREDICTION:
      isCorrect = userAnswer === correctAnswer;
      correctnessScore = isCorrect ? 50 : 0;
      break;

    case QuestionType.SCENARIO_ANALYSIS:
      // Complex validation based on reasoning quality
      isCorrect = reasoning.length > 50; // Basic check
      correctnessScore = isCorrect ? 40 : 20;
      break;

    case QuestionType.ARCHITECTURE_REASONING:
      // Validate design pattern recognition
      isCorrect = reasoning.length > 100;
      correctnessScore = isCorrect ? 40 : 15;
      break;

    case QuestionType.PROBLEM_SOLVING:
      isCorrect = validateProblemSolving(userAnswer, correctAnswer);
      correctnessScore = isCorrect ? 50 : 20;
      break;

    case QuestionType.CODE_COMPLETION:
      isCorrect = validateCodeCompletion(userAnswer, correctAnswer);
      correctnessScore = isCorrect ? 50 : 15;
      break;

    case QuestionType.FLOW_SEQUENCING:
      isCorrect = arraysEqual(
        userAnswer as string[],
        correctAnswer as string[]
      );
      correctnessScore = isCorrect ? 50 : 20;
      break;

    default:
      correctnessScore = 0;
  }

  // Reasoning quality score (0-30)
  reasoningScore = calculateReasoningScore(reasoning, isCorrect);

  return {
    isCorrect,
    correctnessScore,
    reasoningScore,
  };
};

/**
 * Validate debug-based question
 */
const validateDebugIdentification = (
  userAnswer: unknown,
  correctAnswer: unknown
): boolean => {
  // Compare identified issues
  const userIssues = (userAnswer as string[])?.sort() || [];
  const expectedIssues = (correctAnswer as string[])?.sort() || [];
  return arraysEqual(userIssues, expectedIssues);
};

/**
 * Validate problem-solving answer
 */
const validateProblemSolving = (
  userAnswer: unknown,
  correctAnswer: unknown
): boolean => {
  const userSteps = userAnswer as string[];
  const expectedSteps = correctAnswer as string[];
  return arraysEqual(userSteps, expectedSteps);
};

/**
 * Validate code completion
 */
const validateCodeCompletion = (
  userAnswer: unknown,
  correctAnswer: unknown
): boolean => {
  // Check if code is functionally equivalent
  const userCode = userAnswer as string;
  const expectedCode = correctAnswer as string;
  // Simplified - in real world, would run tests
  return userCode.trim() === expectedCode.trim();
};

/**
 * Calculate reasoning quality score (0-30)
 */
const calculateReasoningScore = (reasoning: string, isCorrect: boolean): number => {
  let score = 0;

  if (reasoning.length > 200) score += 15;
  else if (reasoning.length > 100) score += 10;
  else if (reasoning.length > 50) score += 5;

  const sentences = reasoning.split('.').length;
  if (sentences > 3) score += 10;
  else if (sentences > 1) score += 5;

  if (isCorrect) score += 5;

  return Math.min(score, 30);
};

/**
 * Calculate time efficiency score (0-10)
 */
const calculateTimeEfficiency = (
  timeTaken: number,
  estimatedTime: number
): number => {
  const ratio = timeTaken / estimatedTime;

  if (ratio <= 0.5) return 10;
  if (ratio <= 0.75) return 8;
  if (ratio <= 1.0) return 6;
  if (ratio <= 1.5) return 4;
  if (ratio <= 2.0) return 2;
  return 0;
};

/**
 * Generate feedback for the user
 */
const generateFeedback = (
  question: any,
  userAnswer: unknown,
  reasoning: string,
  isCorrect: boolean
) => {
  return {
    isCorrect,
    explanation: question.explanation,
    expectedReasoning: question.expected_reasoning,
    userReasoning: reasoning,
    tips: generateTips(isCorrect, reasoning),
  };
};

/**
 * Generate improvement tips
 */
const generateTips = (isCorrect: boolean, reasoning: string): string[] => {
  const tips: string[] = [];

  if (!isCorrect) {
    tips.push('Review the concept and try again');
  }

  if (reasoning.length < 50) {
    tips.push('Provide more detailed reasoning to understand your thinking process');
  }

  if (reasoning.length > 1000) {
    tips.push('Try to be more concise in your reasoning');
  }

  return tips;
};

/**
 * Update thinking score for user
 */
const updateThinkingScore = async (
  userId: string,
  thinkingType: ThinkingType,
  isCorrect: boolean,
  thinkingScore: number
) => {
  const existing = await prisma.thinkingScore.findUnique({
    where: {
      user_id_thinking_type: {
        user_id: userId,
        thinking_type: thinkingType,
      },
    },
  });

  if (existing) {
    const totalAttempts = existing.attempts_count + 1;
    const totalCorrect = existing.correct_count + (isCorrect ? 1 : 0);
    const newScore = Math.round((totalCorrect / totalAttempts) * 100);

    await prisma.thinkingScore.update({
      where: {
        user_id_thinking_type: {
          user_id: userId,
          thinking_type: thinkingType,
        },
      },
      data: {
        current_score: newScore,
        attempts_count: totalAttempts,
        correct_count: totalCorrect,
      },
    });
  } else {
    await prisma.thinkingScore.create({
      data: {
        user_id: userId,
        thinking_type: thinkingType,
        current_score: isCorrect ? 100 : 0,
        attempts_count: 1,
        correct_count: isCorrect ? 1 : 0,
      },
    });
  }
};

/**
 * Update practice progress for user
 */
const updatePracticeProgress = async (
  userId: string,
  topicId: string,
  isCorrect: boolean
) => {
  const existing = await prisma.practiceProgress.findUnique({
    where: { user_id: userId },
  });

  if (existing) {
    const completed = existing.questions_completed + 1;
    const correct = existing.questions_correct + (isCorrect ? 1 : 0);
    const masteryScore = Math.round((correct / completed) * 100);

    const thinkingScores = await prisma.thinkingScore.findMany({
      where: { user_id: userId },
    });

    const breakdown: Record<string, number> = {};
    for (const score of thinkingScores) {
      breakdown[score.thinking_type] = score.current_score;
    }

    await prisma.practiceProgress.update({
      where: { user_id: userId },
      data: {
        questions_completed: completed,
        questions_correct: correct,
        overall_mastery_score: masteryScore,
        thinking_type_breakdown: breakdown,
        last_practice_date: new Date(),
      },
    });
  } else {
    await prisma.practiceProgress.create({
      data: {
        user_id: userId,
        topic_id: topicId,
        questions_completed: 1,
        questions_correct: isCorrect ? 1 : 0,
        overall_mastery_score: isCorrect ? 100 : 0,
        last_practice_date: new Date(),
      },
    });
  }
};

// ========== PRACTICE PROGRESS SERVICE ==========

/**
 * Get practice progress for a user
 */
export const getPracticeProgress = async (userId: string) => {
  let progress = await prisma.practiceProgress.findUnique({
    where: { user_id: userId },
  });

  if (!progress) {
    progress = await prisma.practiceProgress.create({
      data: {
        user_id: userId,
      },
    });
  }

  return progress;
};

/**
 * Get practice session history
 */
export const getPracticeHistory = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
) => {
  const sessions = await prisma.practiceSession.findMany({
    where: { user_id: userId },
    take: limit,
    skip: offset,
    include: {
      question_data: {
        select: {
          id: true,
          title: true,
          question_type: true,
          thinking_type: true,
        },
      },
    },
    orderBy: {
      completed_at: 'desc',
    },
  });

  return sessions;
};

// ========== ADMIN PRACTICE QUESTION CRUD ==========

export const createPracticeQuestion = async (data: {
  topic_id: string;
  question_type: QuestionType;
  thinking_type: ThinkingType;
  title: string;
  question_text: string;
  scenario_context?: string;
  options_json?: object;
  correct_answer: unknown;
  expected_reasoning?: object;
  explanation: string;
  visual_reference?: string;
  complexity_score?: number;
  estimated_time?: number;
  difficulty_level?: DifficultyLevel;
  created_by: string;
}) => {
  return await prisma.practiceQuestion.create({ data: data as any });
};

export const updatePracticeQuestion = async (
  questionId: string,
  data: Partial<{
    topic_id: string;
    question_type: QuestionType;
    thinking_type: ThinkingType;
    title: string;
    question_text: string;
    scenario_context: string;
    options_json: object;
    correct_answer: unknown;
    expected_reasoning: object;
    explanation: string;
    visual_reference: string;
    complexity_score: number;
    estimated_time: number;
    difficulty_level: DifficultyLevel;
    is_active: boolean;
    updated_by: string;
  }>
) => {
  return await prisma.practiceQuestion.update({
    where: { id: questionId },
    data: data as any,
  });
};

export const deletePracticeQuestion = async (questionId: string) => {
  await prisma.practiceQuestion.delete({ where: { id: questionId } });
};

export const getPracticeQuestionsByTopic = async (topicId: string) => {
  return await prisma.practiceQuestion.findMany({
    where: { topic_id: topicId },
    orderBy: { created_at: 'desc' },
  });
};

/**
 * Bulk-import practice questions for a topic from a JSON payload.
 * Accepts an array of question objects matching the PracticeQuestion shape
 * (minus topic_id, created_by, id which are set by the server).
 */
export const importPracticeQuestions = async (params: {
  topic_id: string;
  created_by: string;
  questions: Array<{
    question_type: QuestionType;
    thinking_type: ThinkingType;
    title: string;
    question_text: string;
    scenario_context?: string | null;
    options_json?: unknown;
    correct_answer: unknown;
    expected_reasoning?: unknown;
    explanation: string;
    visual_reference?: string | null;
    complexity_score?: number;
    estimated_time?: number;
    difficulty_level?: DifficultyLevel;
  }>;
}) => {
  const { topic_id, created_by, questions } = params;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('questions array is required and must be non-empty');
  }
  const created = await prisma.$transaction(
    questions.map((q) =>
      prisma.practiceQuestion.create({
        data: {
          topic_id,
          created_by,
          question_type: q.question_type,
          thinking_type: q.thinking_type,
          title: q.title,
          question_text: q.question_text,
          scenario_context: q.scenario_context ?? null,
          options_json: (q.options_json as any) ?? undefined,
          correct_answer: q.correct_answer as any,
          expected_reasoning: (q.expected_reasoning as any) ?? undefined,
          explanation: q.explanation,
          visual_reference: q.visual_reference ?? null,
          complexity_score: q.complexity_score ?? 2,
          estimated_time: q.estimated_time ?? 300,
          difficulty_level: q.difficulty_level ?? 'BEGINNER',
          is_active: true,
        },
      })
    )
  );
  return created;
};

// ========== INTERVIEW SESSION SERVICE ==========

export const startInterviewSession = async (
  userId: string,
  mode: InterviewMode,
  questionCount: number = 5
) => {
  // Map interview mode to question filters
  const modeFilters: Record<string, { thinkingType?: ThinkingType; questionTypes?: QuestionType[] }> = {
    RAPID_FIRE:               { thinkingType: ThinkingType.INTERVIEW },
    EXPLAIN_THINKING:         { questionTypes: [QuestionType.SCENARIO_ANALYSIS, QuestionType.ARCHITECTURE_REASONING] },
    DEBUGGING_ROUND:          { thinkingType: ThinkingType.DEBUGGING, questionTypes: [QuestionType.DEBUG_BASED] },
    ARCHITECTURE_DISCUSSION:  { thinkingType: ThinkingType.ARCHITECTURE },
  };

  const filters = modeFilters[mode] || {};

  const questions = await prisma.practiceQuestion.findMany({
    where: {
      ...(filters.thinkingType && { thinking_type: filters.thinkingType }),
      ...(filters.questionTypes && { question_type: { in: filters.questionTypes } }),
      is_active: true,
    },
    take: questionCount,
    orderBy: { created_at: 'desc' },
    include: {
      topic: { select: { id: true, title: true, slug: true } },
    },
  });

  const session = await prisma.interviewSession.create({
    data: {
      user_id: userId,
      mode,
    },
  });

  return { session, questions };
};

export const submitInterviewAnswer = async (
  sessionId: string,
  questionId: string,
  userAnswer: unknown,
  reasoning: string,
  timeTaken: number,
  confidenceLevel: number = 5
) => {
  const question = await getQuestionById(questionId);

  const { isCorrect, correctnessScore, reasoningScore } = validateAnswer(
    question.question_type,
    question.correct_answer,
    userAnswer,
    reasoning
  );

  const timeEfficiency = calculateTimeEfficiency(timeTaken, question.estimated_time);
  const thinkingScore = Math.round(correctnessScore * 0.5 + reasoningScore * 0.3 + timeEfficiency * 0.1);

  const answer = await prisma.interviewAnswer.create({
    data: {
      interview_session_id: sessionId,
      question_id: questionId,
      user_answer: userAnswer as object,
      reasoning_provided: reasoning,
      is_correct: isCorrect,
      thinking_score: thinkingScore,
      confidence_level: Math.min(10, Math.max(1, confidenceLevel)),
      time_taken: timeTaken,
      feedback: generateFeedback(question, userAnswer, reasoning, isCorrect),
    },
  });

  // Update session aggregate stats
  const allAnswers = await prisma.interviewAnswer.findMany({
    where: { interview_session_id: sessionId },
  });

  const totalAnswered = allAnswers.length;
  const totalCorrect = allAnswers.filter((a) => a.is_correct).length;
  const avgThinkingQuality = Math.round(
    allAnswers.reduce((sum, a) => sum + a.thinking_score, 0) / totalAnswered
  );
  const avgConfidence = Math.round(
    allAnswers.reduce((sum, a) => sum + a.confidence_level, 0) / totalAnswered * 10
  );

  await prisma.interviewSession.update({
    where: { id: sessionId },
    data: {
      questions_attempted: totalAnswered,
      questions_correct: totalCorrect,
      thinking_quality: avgThinkingQuality,
      confidence_score: avgConfidence,
    },
  });

  return { answer, isCorrect, thinkingScore, feedback: answer.feedback };
};

export const completeInterviewSession = async (sessionId: string) => {
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      interview_answers: {
        include: {
          question_data: {
            select: { thinking_type: true, question_type: true },
          },
        },
      },
    },
  });

  if (!session) throw new Error('Session not found');

  // Identify areas to improve (thinking types with low scores)
  const typeScores: Record<string, number[]> = {};
  for (const answer of session.interview_answers) {
    const type = answer.question_data.thinking_type;
    if (!typeScores[type]) typeScores[type] = [];
    typeScores[type].push(answer.thinking_score);
  }

  const areasToImprove = Object.entries(typeScores)
    .map(([type, scores]) => ({
      type,
      avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    }))
    .filter((a) => a.avg < 60)
    .map((a) => a.type);

  const updated = await prisma.interviewSession.update({
    where: { id: sessionId },
    data: {
      areas_to_improve: areasToImprove,
      completed_at: new Date(),
    },
    include: { interview_answers: true },
  });

  return updated;
};

export const getInterviewSessions = async (userId: string) => {
  return await prisma.interviewSession.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    include: {
      interview_answers: {
        select: { is_correct: true, thinking_score: true },
      },
    },
  });
};

export const getInterviewSession = async (sessionId: string) => {
  return await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      interview_answers: {
        include: {
          question_data: {
            select: {
              id: true,
              title: true,
              question_type: true,
              thinking_type: true,
              explanation: true,
              expected_reasoning: true,
            },
          },
        },
        orderBy: { created_at: 'asc' },
      },
    },
  });
};

// ========== HELPER FUNCTIONS ==========

/**
 * Compare two arrays for equality
 */
const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}
