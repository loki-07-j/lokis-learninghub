import api from './api';

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface TestQuestion {
  id: string;
  test_id: string;
  question_text: string;
  options_json: string[];
  correct_answer: number;
  explanation: string;
  sort_order: number;
}

export interface TestQuestionForAttempt {
  id: string;
  question_text: string;
  options_json: string[];
  sort_order: number;
}

export interface Test {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  duration_secs: number;
  passing_score: number;
  difficulty: DifficultyLevel;
  is_published: boolean;
  _count?: { questions: number };
}

export interface TestForAttempt extends Test {
  questions: TestQuestionForAttempt[];
}

export interface ReviewItem {
  questionId: string;
  question_text: string;
  options: string[];
  selected: number;
  correct_answer: number;
  is_correct: boolean;
  explanation: string;
}

export interface TestAttemptResult {
  id: string;
  test_id: string;
  score: number;
  is_passed: boolean;
  time_taken: number;
  review: ReviewItem[];
  total: number;
  correct: number;
}

export interface TestHistory {
  id: string;
  score: number;
  is_passed: boolean;
  time_taken: number;
  completed_at: string;
  test: { title: string; category: string; passing_score: number };
}

// ── User API ──────────────────────────────────────────────────────────────────
export const testService = {
  getTests: async (params?: { category?: string; difficulty?: string }): Promise<Test[]> => {
    const { data } = await api.get('/tests', { params });
    return data.tests;
  },

  getTestForAttempt: async (testId: string): Promise<TestForAttempt> => {
    const { data } = await api.get(`/tests/${testId}`);
    return data.test;
  },

  submitAttempt: async (
    testId: string,
    answers: Record<string, number>,
    time_taken: number
  ): Promise<TestAttemptResult> => {
    const { data } = await api.post(`/tests/${testId}/attempt`, { answers, time_taken });
    return data.attempt;
  },

  getHistory: async (): Promise<TestHistory[]> => {
    const { data } = await api.get('/tests/history');
    return data.attempts;
  },
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminTestService = {
  getAll: async (): Promise<(Test & { _count: { questions: number; attempts: number } })[]> => {
    const { data } = await api.get('/tests/admin');
    return data.tests;
  },

  getOne: async (testId: string): Promise<Test & { questions: TestQuestion[] }> => {
    const { data } = await api.get(`/tests/admin/${testId}`);
    return data.test;
  },

  create: async (payload: {
    title: string; description?: string; category: string;
    duration_secs: number; passing_score: number; difficulty: DifficultyLevel;
  }): Promise<Test> => {
    const { data } = await api.post('/tests/admin', payload);
    return data.test;
  },

  update: async (testId: string, payload: Partial<Test>): Promise<Test> => {
    const { data } = await api.put(`/tests/admin/${testId}`, payload);
    return data.test;
  },

  delete: async (testId: string): Promise<void> => {
    await api.delete(`/tests/admin/${testId}`);
  },

  addQuestion: async (testId: string, payload: {
    question_text: string; options_json: string[];
    correct_answer: number; explanation: string; sort_order?: number;
  }): Promise<TestQuestion> => {
    const { data } = await api.post(`/tests/admin/${testId}/questions`, payload);
    return data.question;
  },

  updateQuestion: async (questionId: string, payload: Partial<TestQuestion>): Promise<TestQuestion> => {
    const { data } = await api.put(`/tests/admin/questions/${questionId}`, payload);
    return data.question;
  },

  deleteQuestion: async (questionId: string): Promise<void> => {
    await api.delete(`/tests/admin/questions/${questionId}`);
  },

  importTest: async (testData: object): Promise<Test> => {
    const { data } = await api.post('/tests/admin/import', { test: testData });
    return data.test;
  },

  exportTest: async (testId: string): Promise<object> => {
    const { data } = await api.get(`/tests/admin/${testId}`);
    return data.test;
  },
};
