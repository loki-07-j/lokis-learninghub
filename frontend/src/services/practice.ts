import api from './api';

export type QuestionType =
  | 'MCQ'
  | 'MULTI_SELECT'
  | 'DEBUG_BASED'
  | 'OUTPUT_PREDICTION'
  | 'SCENARIO_ANALYSIS'
  | 'ARCHITECTURE_REASONING'
  | 'PROBLEM_SOLVING'
  | 'CODE_COMPLETION'
  | 'FLOW_SEQUENCING';

export type ThinkingType =
  | 'LOGIC'
  | 'DEBUGGING'
  | 'PERFORMANCE'
  | 'ARCHITECTURE'
  | 'SECURITY'
  | 'REAL_WORLD'
  | 'INTERVIEW';

export type DifficultyLevel =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'EXPERT';

export interface PracticeQuestion {
  id: string;
  topic_id: string;
  question_type: QuestionType;
  thinking_type: ThinkingType;
  title: string;
  question_text: string;
  scenario_context?: string;
  options_json?: any; // For MCQ, MULTI_SELECT, etc.
  correct_answer: any;
  expected_reasoning?: any;
  explanation: string;
  visual_reference?: string;
  complexity_score: number;
  estimated_time: number;
  difficulty_level: DifficultyLevel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  topic?: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface PracticeSession {
  id: string;
  user_id: string;
  question_id: string;
  thinking_type: ThinkingType;
  user_answer: any;
  reasoning_provided?: string;
  is_correct: boolean;
  thinking_score: number;
  correctness_score: number;
  reasoning_score: number;
  time_efficiency: number;
  time_taken: number;
  feedback?: {
    isCorrect: boolean;
    explanation: string;
    expectedReasoning?: any;
    userReasoning: string;
    tips: string[];
  };
  completed_at: string;
  created_at: string;
}

export interface ThinkingScore {
  id: string;
  user_id: string;
  thinking_type: ThinkingType;
  current_score: number;
  attempts_count: number;
  correct_count: number;
  weak_concepts?: string[];
  updated_at: string;
  created_at: string;
}

export interface PracticeProgress {
  id: string;
  user_id: string;
  topic_id?: string;
  total_questions: number;
  questions_completed: number;
  questions_correct: number;
  overall_mastery_score: number;
  thinking_type_breakdown?: Record<string, number>;
  last_practice_date?: string;
  current_streak: number;
  longest_streak: number;
  updated_at: string;
  created_at: string;
}

export interface WeakArea {
  thinkingType: ThinkingType;
  score: number;
  weakConcepts?: string[];
}

export type InterviewMode =
  | 'RAPID_FIRE'
  | 'EXPLAIN_THINKING'
  | 'DEBUGGING_ROUND'
  | 'ARCHITECTURE_DISCUSSION';

export interface InterviewAnswer {
  id: string;
  interview_session_id: string;
  question_id: string;
  user_answer: any;
  reasoning_provided?: string;
  is_correct: boolean;
  thinking_score: number;
  confidence_level: number;
  feedback?: any;
  time_taken: number;
  created_at: string;
  question_data?: {
    id: string;
    title: string;
    question_type: string;
    thinking_type: string;
    explanation: string;
    expected_reasoning?: any;
  };
}

export interface InterviewSession {
  id: string;
  user_id: string;
  mode: InterviewMode;
  questions_attempted: number;
  questions_correct: number;
  confidence_score: number;
  thinking_quality: number;
  areas_to_improve?: string[];
  completed_at: string;
  created_at: string;
  interview_answers?: InterviewAnswer[];
}

export const practiceService = {
  // Get practice questions with filters
  getPracticeQuestions: async (filters: {
    topicId?: string;
    thinkingType?: ThinkingType;
    questionType?: QuestionType;
    difficulty?: DifficultyLevel;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get<{
      success: boolean;
      data: PracticeQuestion[];
      count: number;
    }>('/practice', { params: filters });
    return response.data;
  },

  // Get single question
  getQuestionById: async (questionId: string) => {
    const response = await api.get<{
      success: boolean;
      data: PracticeQuestion;
    }>(`/practice/${questionId}`);
    return response.data.data;
  },

  // Submit answer
  submitAnswer: async (
    questionId: string,
    answer: any,
    reasoning: string,
    timeTaken: number
  ) => {
    const response = await api.post<{
      success: boolean;
      data: PracticeSession;
    }>(`/practice/${questionId}/submit`, {
      answer,
      reasoning,
      timeTaken,
    });
    return response.data.data;
  },

  // Get thinking scores for user
  getThinkingScores: async (userId: string) => {
    const response = await api.get<{
      success: boolean;
      data: ThinkingScore[];
    }>(`/practice/thinking-scores/${userId}`);
    return response.data.data;
  },

  // Get weak areas
  getWeakAreas: async (userId: string) => {
    const response = await api.get<{
      success: boolean;
      data: WeakArea[];
      count: number;
    }>(`/practice/weak-areas/${userId}`);
    return response.data.data;
  },

  // Get practice progress
  getPracticeProgress: async (userId: string) => {
    const response = await api.get<{
      success: boolean;
      data: PracticeProgress;
    }>(`/practice/progress/${userId}`);
    return response.data.data;
  },

  // Get practice history
  getPracticeHistory: async (userId: string, limit = 20, offset = 0) => {
    const response = await api.get<{
      success: boolean;
      data: PracticeSession[];
      count: number;
    }>(`/practice/history/${userId}`, {
      params: { limit, offset },
    });
    return response.data.data;
  },

  // ---- Interview ----

  startInterviewSession: async (mode: InterviewMode, questionCount = 5) => {
    const response = await api.post<{
      success: boolean;
      data: { session: InterviewSession; questions: PracticeQuestion[] };
    }>('/practice/interview/start', { mode, questionCount });
    return response.data.data;
  },

  submitInterviewAnswer: async (
    sessionId: string,
    questionId: string,
    answer: any,
    reasoning: string,
    timeTaken: number,
    confidenceLevel = 5
  ) => {
    const response = await api.post<{
      success: boolean;
      data: { answer: InterviewAnswer; isCorrect: boolean; thinkingScore: number; feedback: any };
    }>(`/practice/interview/${sessionId}/submit`, {
      questionId, answer, reasoning, timeTaken, confidenceLevel,
    });
    return response.data.data;
  },

  completeInterviewSession: async (sessionId: string) => {
    const response = await api.post<{
      success: boolean;
      data: InterviewSession;
    }>(`/practice/interview/${sessionId}/complete`);
    return response.data.data;
  },

  getInterviewSessions: async (userId: string) => {
    const response = await api.get<{
      success: boolean;
      data: InterviewSession[];
    }>(`/practice/interview/sessions/${userId}`);
    return response.data.data;
  },

  getInterviewSession: async (sessionId: string) => {
    const response = await api.get<{
      success: boolean;
      data: InterviewSession;
    }>(`/practice/interview/session/${sessionId}`);
    return response.data.data;
  },

  // ---- Admin CRUD ----

  adminGetQuestionsByTopic: async (topicId: string) => {
    const response = await api.get<{
      success: boolean;
      data: PracticeQuestion[];
      count: number;
    }>(`/practice/admin/questions/${topicId}`);
    return response.data.data;
  },

  adminCreateQuestion: async (data: Partial<PracticeQuestion>) => {
    const response = await api.post<{
      success: boolean;
      data: PracticeQuestion;
    }>('/practice/admin/questions', data);
    return response.data.data;
  },

  adminUpdateQuestion: async (questionId: string, data: Partial<PracticeQuestion>) => {
    const response = await api.put<{
      success: boolean;
      data: PracticeQuestion;
    }>(`/practice/admin/questions/${questionId}`, data);
    return response.data.data;
  },

  adminDeleteQuestion: async (questionId: string) => {
    await api.delete(`/practice/admin/questions/${questionId}`);
  },

  adminImportQuestions: async (topicId: string, questions: Array<Partial<PracticeQuestion>>) => {
    const response = await api.post<{
      success: boolean;
      data: PracticeQuestion[];
      count: number;
    }>('/practice/admin/import', { topic_id: topicId, questions });
    return response.data;
  },
};
