import api from './api';

export interface RapidFireQuestion {
  id: string;
  pool_id: string;
  question_text: string;
  options_json: string[];
  correct_answer: number;
  explanation: string | null;
  sort_order: number;
}

export interface RapidFireQuestionForPlay {
  id: string;
  question_text: string;
  options_json: string[];
  correct_answer: number;
  sort_order: number;
}

export interface RapidFirePool {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  is_published: boolean;
  _count?: { questions: number };
}

export interface RapidFirePoolWithQuestions extends RapidFirePool {
  questions: RapidFireQuestionForPlay[];
}

export interface RapidFireReviewItem {
  questionId: string;
  question_text: string;
  selected: number;
  correct_answer: number;
  is_correct: boolean;
  explanation: string | null;
}

export interface RapidFireSessionResult {
  id: string;
  pool_id: string;
  score: number;
  total_questions: number;
  correct_count: number;
  streak: number;
  maxStreak: number;
  time_taken: number;
  review: RapidFireReviewItem[];
}

export interface LeaderboardEntry {
  user_id: string;
  score: number;
  correct_count: number;
  total_questions: number;
  streak: number;
  time_taken: number;
  completed_at: string;
}

// ── User API ──────────────────────────────────────────────────────────────────
export const rapidFireService = {
  getPools: async (params?: { category?: string }): Promise<RapidFirePool[]> => {
    const { data } = await api.get('/rapid-fire', { params });
    return data.pools;
  },

  getPoolQuestions: async (poolId: string, limit = 10): Promise<RapidFirePoolWithQuestions> => {
    const { data } = await api.get(`/rapid-fire/${poolId}`, { params: { limit } });
    return data.pool;
  },

  submitSession: async (
    poolId: string,
    answers: Record<string, number>,
    time_taken: number
  ): Promise<RapidFireSessionResult> => {
    const { data } = await api.post(`/rapid-fire/${poolId}/submit`, { answers, time_taken });
    return data.session;
  },

  getLeaderboard: async (poolId: string): Promise<LeaderboardEntry[]> => {
    const { data } = await api.get(`/rapid-fire/${poolId}/leaderboard`);
    return data.leaderboard;
  },
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminRapidFireService = {
  getAll: async (): Promise<(RapidFirePool & { _count: { questions: number; sessions: number } })[]> => {
    const { data } = await api.get('/rapid-fire/admin');
    return data.pools;
  },

  getOne: async (poolId: string): Promise<RapidFirePool & { questions: RapidFireQuestion[] }> => {
    const { data } = await api.get(`/rapid-fire/admin/${poolId}`);
    return data.pool;
  },

  create: async (payload: { title: string; category: string; description?: string }): Promise<RapidFirePool> => {
    const { data } = await api.post('/rapid-fire/admin', payload);
    return data.pool;
  },

  update: async (poolId: string, payload: Partial<RapidFirePool>): Promise<RapidFirePool> => {
    const { data } = await api.put(`/rapid-fire/admin/${poolId}`, payload);
    return data.pool;
  },

  delete: async (poolId: string): Promise<void> => {
    await api.delete(`/rapid-fire/admin/${poolId}`);
  },

  addQuestion: async (poolId: string, payload: {
    question_text: string; options_json: string[];
    correct_answer: number; explanation?: string; sort_order?: number;
  }): Promise<RapidFireQuestion> => {
    const { data } = await api.post(`/rapid-fire/admin/${poolId}/questions`, payload);
    return data.question;
  },

  updateQuestion: async (questionId: string, payload: Partial<RapidFireQuestion>): Promise<RapidFireQuestion> => {
    const { data } = await api.put(`/rapid-fire/admin/questions/${questionId}`, payload);
    return data.question;
  },

  deleteQuestion: async (questionId: string): Promise<void> => {
    await api.delete(`/rapid-fire/admin/questions/${questionId}`);
  },

  importPool: async (poolData: object): Promise<RapidFirePool> => {
    const { data } = await api.post('/rapid-fire/admin/import', { pool: poolData });
    return data.pool;
  },

  exportPool: async (poolId: string): Promise<object> => {
    const { data } = await api.get(`/rapid-fire/admin/${poolId}`);
    return data.pool;
  },
};
