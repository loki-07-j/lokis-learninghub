import prisma from '../utils/prisma';
import { TargetRole, PlannerSkillLevel } from '@prisma/client';

// ========== PLAN GENERATION (RULE-BASED) ==========

interface PlanGoals {
  targetRole: TargetRole;
  skillLevel: PlannerSkillLevel;
  hoursPerDay: number;   // 1–4
  durationWeeks: number; // 4, 8, 12
  targetDate?: string;
}

interface DayTask {
  title: string;
  description: string;
  type: 'LESSON' | 'PRACTICE' | 'REVISION' | 'INTERVIEW';
  referenceId?: string;
  estimatedMinutes: number;
}

interface RoadmapDay {
  dayNumber: number;
  theme: string;
  tasks: DayTask[];
}

interface RoadmapWeek {
  weekNumber: number;
  theme: string;
  focus: string;
  days: RoadmapDay[];
}

// Task budget per hours-per-day tier
const DAILY_BUDGET = {
  1: { lessons: 1, practiceQ: 3,  hasRevision: false, hasInterview: false },
  2: { lessons: 2, practiceQ: 5,  hasRevision: true,  hasInterview: false },
  3: { lessons: 2, practiceQ: 8,  hasRevision: true,  hasInterview: true  },
  4: { lessons: 3, practiceQ: 10, hasRevision: true,  hasInterview: true  },
};

const ROLE_FOCUS: Record<TargetRole, string[]> = {
  BACKEND:       ['Database', 'API', 'Performance', 'Security', 'Architecture'],
  FRONTEND:      ['UI Logic', 'Performance', 'Architecture', 'Real-World'],
  FULLSTACK:     ['Database', 'API', 'UI Logic', 'Architecture', 'Performance'],
  DEVOPS:        ['Performance', 'Architecture', 'Security', 'Debugging'],
  DATA_ENGINEER: ['Database', 'Performance', 'Architecture', 'Debugging'],
};

const WEEK_THEMES = [
  'Foundation & Core Concepts',
  'Deep Internals & Mechanics',
  'Performance & Optimization',
  'Debugging & Problem Solving',
  'Architecture & System Design',
  'Real-World Scenarios',
  'Security & Best Practices',
  'Interview Readiness',
];

const THINKING_TYPES = ['LOGIC', 'DEBUGGING', 'PERFORMANCE', 'ARCHITECTURE', 'REAL_WORLD', 'SECURITY', 'INTERVIEW'];

export const generatePlan = async (userId: string, goals: PlanGoals) => {
  // Fetch all published topics for content material
  const topics = await prisma.topic.findMany({
    where: { is_published: true },
    include: {
      lessons: { where: { is_published: true }, select: { id: true, title: true } },
      module: { select: { title: true, course: { select: { title: true } } } },
    },
    orderBy: { sort_order: 'asc' },
  });

  const budget = DAILY_BUDGET[Math.min(4, Math.max(1, goals.hoursPerDay)) as keyof typeof DAILY_BUDGET];
  const roleFoci = ROLE_FOCUS[goals.targetRole];
  const weeks: RoadmapWeek[] = [];
  const workDaysPerWeek = 5;

  // Determine how many weeks are deep-learning vs interview-prep
  const interviewPrepWeeks = Math.max(1, Math.round(goals.durationWeeks * 0.2));
  const learningWeeks = goals.durationWeeks - interviewPrepWeeks;

  // Build topic pool cycling through available topics
  const topicPool = [...topics];
  let topicIndex = 0;
  let lessonIndexPerTopic: Record<string, number> = {};

  for (let w = 1; w <= goals.durationWeeks; w++) {
    const isInterviewWeek = w > learningWeeks;
    const weekThemeIndex = Math.min(w - 1, WEEK_THEMES.length - 1);
    const weekTheme = isInterviewWeek ? 'Interview Readiness Sprint' : WEEK_THEMES[weekThemeIndex];
    const weekFocus = isInterviewWeek ? 'INTERVIEW' : roleFoci[(w - 1) % roleFoci.length];

    const days: RoadmapDay[] = [];

    for (let d = 1; d <= workDaysPerWeek; d++) {
      const tasks: DayTask[] = [];

      if (isInterviewWeek) {
        // Interview week: rapid-fire practice + thinking explanation
        tasks.push({
          title: 'Rapid Fire Practice',
          description: `Answer ${budget.practiceQ} INTERVIEW questions to sharpen recall speed.`,
          type: 'PRACTICE',
          estimatedMinutes: budget.practiceQ * 2,
        });
        if (budget.hasRevision) {
          tasks.push({
            title: 'Concept Revision',
            description: 'Review your weakest thinking area using the Weak Areas panel.',
            type: 'REVISION',
            estimatedMinutes: 15,
          });
        }
        tasks.push({
          title: 'Interview Thinking Session',
          description: 'Complete one Architecture or Scenario question with full reasoning.',
          type: 'INTERVIEW',
          estimatedMinutes: 20,
        });
      } else {
        // Learning week: lessons + practice + optional revision
        for (let l = 0; l < budget.lessons; l++) {
          const topic = topicPool[topicIndex % topicPool.length];
          if (!lessonIndexPerTopic[topic.id]) lessonIndexPerTopic[topic.id] = 0;

          const lesson = topic.lessons[lessonIndexPerTopic[topic.id] % Math.max(topic.lessons.length, 1)];
          lessonIndexPerTopic[topic.id]++;

          tasks.push({
            title: lesson ? lesson.title : `Study ${topic.title}`,
            description: `${topic.module.course.title} → ${topic.module.title} → ${topic.title}`,
            type: 'LESSON',
            referenceId: lesson?.id ?? topic.id,
            estimatedMinutes: 20,
          });

          if (l === budget.lessons - 1) topicIndex++;
        }

        // Practice session aligned to week focus thinking type
        const thinkingType = THINKING_TYPES[(w - 1) % THINKING_TYPES.length];
        tasks.push({
          title: `${thinkingType.charAt(0) + thinkingType.slice(1).toLowerCase()} Practice`,
          description: `Answer ${budget.practiceQ} questions focused on ${thinkingType} thinking.`,
          type: 'PRACTICE',
          estimatedMinutes: budget.practiceQ * 2,
        });

        if (budget.hasRevision && d % 2 === 0) {
          tasks.push({
            title: 'Daily Revision',
            description: 'Quick recall of the last 2 concepts studied.',
            type: 'REVISION',
            estimatedMinutes: 10,
          });
        }

        if (budget.hasInterview && d === workDaysPerWeek) {
          tasks.push({
            title: 'Weekly Interview Question',
            description: 'Tackle one scenario or architecture question end-to-end.',
            type: 'INTERVIEW',
            estimatedMinutes: 20,
          });
        }
      }

      const totalMins = tasks.reduce((s, t) => s + t.estimatedMinutes, 0);
      days.push({
        dayNumber: d,
        theme: isInterviewWeek ? `Interview Day ${d}` : `Day ${d} — ${weekFocus}`,
        tasks,
      });
    }

    weeks.push({ weekNumber: w, theme: weekTheme, focus: weekFocus, days });
  }

  const roadmapJson = { weeks, generatedAt: new Date().toISOString(), goals };

  // Upsert the plan
  const targetDate = goals.targetDate
    ? new Date(goals.targetDate)
    : (() => {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() + goals.durationWeeks * 7);
        return d;
      })();

  const plan = await prisma.learningPlan.upsert({
    where: { user_id: userId },
    update: {
      target_role: goals.targetRole,
      skill_level: goals.skillLevel,
      hours_per_day: goals.hoursPerDay,
      duration_weeks: goals.durationWeeks,
      target_date: targetDate,
      roadmap_json: roadmapJson as any,
      is_active: true,
      checkpoints: { deleteMany: {} },
    },
    create: {
      user_id: userId,
      target_role: goals.targetRole,
      skill_level: goals.skillLevel,
      hours_per_day: goals.hoursPerDay,
      duration_weeks: goals.durationWeeks,
      target_date: targetDate,
      roadmap_json: roadmapJson as any,
    },
  });

  // Create checkpoint rows (flattened tasks)
  const checkpointData: {
    plan_id: string; week_number: number; day_number: number;
    title: string; description: string; type: string;
    reference_id?: string; estimated_minutes: number;
  }[] = [];

  for (const week of weeks) {
    for (const day of week.days) {
      for (const task of day.tasks) {
        checkpointData.push({
          plan_id: plan.id,
          week_number: week.weekNumber,
          day_number: day.dayNumber,
          title: task.title,
          description: task.description ?? '',
          type: task.type,
          reference_id: task.referenceId,
          estimated_minutes: task.estimatedMinutes,
        });
      }
    }
  }

  await prisma.planCheckpoint.createMany({ data: checkpointData });

  return { plan, roadmap: roadmapJson };
};

// ========== GET PLAN + CHECKPOINTS ==========

export const getUserPlan = async (userId: string) => {
  const plan = await prisma.learningPlan.findUnique({
    where: { user_id: userId },
    include: {
      checkpoints: { orderBy: [{ week_number: 'asc' }, { day_number: 'asc' }] },
    },
  });
  return plan;
};

// ========== TODAY'S TASKS ==========

export const getTodaysTasks = async (userId: string) => {
  const plan = await prisma.learningPlan.findUnique({ where: { user_id: userId } });
  if (!plan) return null;

  // Calculate which week and day we're on based on plan creation date
  const createdAt = new Date(plan.created_at);
  createdAt.setUTCHours(0, 0, 0, 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const daysElapsed = Math.floor((today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const workDaysPerWeek = 5;
  const weekNumber = Math.floor(daysElapsed / 7) + 1;
  const dayOfWeek = daysElapsed % 7; // 0-6
  const dayNumber = dayOfWeek < workDaysPerWeek ? dayOfWeek + 1 : null; // null = weekend

  const clampedWeek = Math.min(weekNumber, plan.duration_weeks);

  if (!dayNumber) {
    return { isWeekend: true, weekNumber: clampedWeek, tasks: [] };
  }

  const tasks = await prisma.planCheckpoint.findMany({
    where: { plan_id: plan.id, week_number: clampedWeek, day_number: dayNumber },
    orderBy: { created_at: 'asc' },
  });

  const completedToday = tasks.filter((t) => t.is_completed).length;
  const totalToday = tasks.length;

  return {
    isWeekend: false,
    weekNumber: clampedWeek,
    dayNumber,
    weekTheme: (plan.roadmap_json as any)?.weeks?.[clampedWeek - 1]?.theme ?? '',
    tasks,
    progress: { completed: completedToday, total: totalToday },
  };
};

// ========== COMPLETE CHECKPOINT ==========

export const completeCheckpoint = async (checkpointId: string) => {
  return await prisma.planCheckpoint.update({
    where: { id: checkpointId },
    data: { is_completed: true, completed_at: new Date() },
  });
};

// ========== PLAN PROGRESS SUMMARY ==========

export const getPlanProgress = async (userId: string) => {
  const plan = await prisma.learningPlan.findUnique({
    where: { user_id: userId },
    include: { checkpoints: { select: { week_number: true, is_completed: true } } },
  });

  if (!plan) return null;

  const totalCheckpoints = plan.checkpoints.length;
  const completedCheckpoints = plan.checkpoints.filter((c) => c.is_completed).length;

  // Per-week progress
  const weekMap: Record<number, { total: number; completed: number }> = {};
  for (const cp of plan.checkpoints) {
    if (!weekMap[cp.week_number]) weekMap[cp.week_number] = { total: 0, completed: 0 };
    weekMap[cp.week_number].total++;
    if (cp.is_completed) weekMap[cp.week_number].completed++;
  }

  const weekProgress = Object.entries(weekMap).map(([week, stats]) => ({
    weekNumber: Number(week),
    total: stats.total,
    completed: stats.completed,
    percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
  }));

  return {
    planId: plan.id,
    targetRole: plan.target_role,
    skillLevel: plan.skill_level,
    durationWeeks: plan.duration_weeks,
    targetDate: plan.target_date,
    totalCheckpoints,
    completedCheckpoints,
    overallPercentage:
      totalCheckpoints > 0 ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 0,
    weekProgress,
  };
};
