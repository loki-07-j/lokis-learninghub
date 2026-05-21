import api from './api';

export interface RadarPoint {
  type: string;
  score: number;
  attempts: number;
}

export interface InterviewReadiness {
  readinessScore: number;
  level: string;
  breakdown: Record<string, { score: number; weight: number; label: string }>;
}

export interface ConceptMasteryItem {
  topicId: string;
  topicTitle: string;
  moduleTitle: string;
  courseTitle: string;
  masteryScore: number;
  practiceAttempts: number;
  correctAttempts: number;
  lastActivityAt: string | null;
}

export interface WeakAreaItem {
  thinkingType: string;
  score: number;
  weakConcepts: string[];
}

export interface HeatmapDay {
  date: string;
  questions: number;
  correct: number;
  minutes: number;
  intensity: number; // 0-4
}

export interface WeeklyDay {
  date: string;
  label: string;
  questions: number;
  correct: number;
}

export interface RecentSession {
  id: string;
  isCorrect: boolean;
  thinkingScore: number;
  timeTaken: number;
  completedAt: string;
  questionTitle: string;
  questionType: string;
  thinkingType: string;
}

export interface ProgressDashboard {
  overview: {
    totalCompleted: number;
    totalCorrect: number;
    overallMastery: number;
    currentStreak: number;
    longestStreak: number;
    lastPracticeDate: string | null;
  };
  radarData: RadarPoint[];
  interviewReadiness: InterviewReadiness;
  weakAreas: WeakAreaItem[];
  conceptMasteries: ConceptMasteryItem[];
  recentSessions: RecentSession[];
}

export const progressService = {
  getDashboard: async (userId: string): Promise<ProgressDashboard> => {
    const res = await api.get<{ success: boolean; data: ProgressDashboard }>(
      `/progress/${userId}/dashboard`
    );
    return res.data.data;
  },

  getConceptMastery: async (userId: string): Promise<ConceptMasteryItem[]> => {
    const res = await api.get<{ success: boolean; data: ConceptMasteryItem[] }>(
      `/progress/${userId}/concept-mastery`
    );
    return res.data.data;
  },

  getHeatmap: async (userId: string, weeks = 16): Promise<HeatmapDay[]> => {
    const res = await api.get<{ success: boolean; data: HeatmapDay[] }>(
      `/progress/${userId}/heatmap`,
      { params: { weeks } }
    );
    return res.data.data;
  },

  getInterviewReadiness: async (userId: string): Promise<InterviewReadiness> => {
    const res = await api.get<{ success: boolean; data: InterviewReadiness }>(
      `/progress/${userId}/interview-readiness`
    );
    return res.data.data;
  },

  getWeeklyActivity: async (userId: string): Promise<WeeklyDay[]> => {
    const res = await api.get<{ success: boolean; data: WeeklyDay[] }>(
      `/progress/${userId}/weekly-activity`
    );
    return res.data.data;
  },
};
