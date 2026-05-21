import api from './api';

export type TargetRole = 'BACKEND' | 'FRONTEND' | 'FULLSTACK' | 'DEVOPS' | 'DATA_ENGINEER';
export type PlannerSkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface PlanCheckpoint {
  id: string;
  plan_id: string;
  week_number: number;
  day_number: number;
  title: string;
  description: string;
  type: 'LESSON' | 'PRACTICE' | 'REVISION' | 'INTERVIEW';
  reference_id?: string;
  estimated_minutes: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface LearningPlan {
  id: string;
  user_id: string;
  target_role: TargetRole;
  skill_level: PlannerSkillLevel;
  hours_per_day: number;
  duration_weeks: number;
  target_date: string | null;
  roadmap_json: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  checkpoints: PlanCheckpoint[];
}

export interface TodaysTasks {
  isWeekend: boolean;
  weekNumber: number;
  dayNumber?: number;
  weekTheme?: string;
  tasks: PlanCheckpoint[];
  progress?: { completed: number; total: number };
}

export interface WeekProgress {
  weekNumber: number;
  total: number;
  completed: number;
  percentage: number;
}

export interface PlanProgress {
  planId: string;
  targetRole: TargetRole;
  skillLevel: PlannerSkillLevel;
  durationWeeks: number;
  targetDate: string | null;
  totalCheckpoints: number;
  completedCheckpoints: number;
  overallPercentage: number;
  weekProgress: WeekProgress[];
}

export interface PlanGoals {
  targetRole: TargetRole;
  skillLevel: PlannerSkillLevel;
  hoursPerDay: number;
  durationWeeks: number;
  targetDate?: string;
}

export const plannerService = {
  generatePlan: async (goals: PlanGoals) => {
    const res = await api.post<{ success: boolean; data: { plan: LearningPlan; roadmap: any } }>(
      '/planner/generate',
      goals
    );
    return res.data.data;
  },

  getUserPlan: async (userId: string): Promise<LearningPlan | null> => {
    const res = await api.get<{ success: boolean; data: LearningPlan | null }>(
      `/planner/${userId}`
    );
    return res.data.data;
  },

  getTodaysTasks: async (userId: string): Promise<TodaysTasks | null> => {
    const res = await api.get<{ success: boolean; data: TodaysTasks | null }>(
      `/planner/${userId}/today`
    );
    return res.data.data;
  },

  getPlanProgress: async (userId: string): Promise<PlanProgress | null> => {
    const res = await api.get<{ success: boolean; data: PlanProgress | null }>(
      `/planner/${userId}/plan-progress`
    );
    return res.data.data;
  },

  completeCheckpoint: async (checkpointId: string): Promise<PlanCheckpoint> => {
    const res = await api.put<{ success: boolean; data: PlanCheckpoint }>(
      `/planner/checkpoint/${checkpointId}/complete`
    );
    return res.data.data;
  },
};
