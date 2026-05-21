import prisma from '../utils/prisma';

// ========== DAILY ACTIVITY + STREAK ==========

export const recordDailyActivity = async (
  userId: string,
  questionsAnswered: number,
  correctCount: number,
  minutesActive: number = 5
) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await prisma.dailyActivity.upsert({
    where: { user_id_activity_date: { user_id: userId, activity_date: today } },
    update: {
      questions_answered: { increment: questionsAnswered },
      correct_count: { increment: correctCount },
      minutes_active: { increment: minutesActive },
    },
    create: {
      user_id: userId,
      activity_date: today,
      questions_answered: questionsAnswered,
      correct_count: correctCount,
      minutes_active: minutesActive,
    },
  });

  // Update streak in practice_progress
  await refreshStreak(userId);
};

const refreshStreak = async (userId: string) => {
  const progress = await prisma.practiceProgress.findUnique({ where: { user_id: userId } });
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  if (!progress) return;

  const lastDate = progress.last_practice_date
    ? new Date(progress.last_practice_date)
    : null;
  if (lastDate) lastDate.setUTCHours(0, 0, 0, 0);

  const isToday = lastDate?.getTime() === today.getTime();
  const isYesterday = lastDate?.getTime() === yesterday.getTime();

  let newStreak = progress.current_streak;
  if (!lastDate || (!isToday && !isYesterday)) {
    newStreak = 1;
  } else if (isYesterday) {
    newStreak = progress.current_streak + 1;
  }

  await prisma.practiceProgress.update({
    where: { user_id: userId },
    data: {
      last_practice_date: new Date(),
      current_streak: newStreak,
      longest_streak: Math.max(progress.longest_streak, newStreak),
    },
  });
};

// ========== ACTIVITY HEATMAP ==========

export const getDailyHeatmap = async (userId: string, weeks: number = 16) => {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - weeks * 7);

  const rows = await prisma.dailyActivity.findMany({
    where: { user_id: userId, activity_date: { gte: since } },
    orderBy: { activity_date: 'asc' },
    select: { activity_date: true, questions_answered: true, correct_count: true, minutes_active: true },
  });

  return rows.map((r) => ({
    date: r.activity_date.toISOString().split('T')[0],
    questions: r.questions_answered,
    correct: r.correct_count,
    minutes: r.minutes_active,
    intensity: Math.min(4, Math.floor(r.questions_answered / 3)), // 0-4 for heatmap shading
  }));
};

// ========== CONCEPT MASTERY ==========

export const updateConceptMastery = async (
  userId: string,
  topicId: string,
  isCorrect: boolean
) => {
  const existing = await prisma.conceptMastery.findUnique({
    where: { user_id_topic_id: { user_id: userId, topic_id: topicId } },
  });

  if (existing) {
    const attempts = existing.practice_attempts + 1;
    const correct = existing.correct_attempts + (isCorrect ? 1 : 0);
    const score = Math.round((correct / attempts) * 100);

    await prisma.conceptMastery.update({
      where: { user_id_topic_id: { user_id: userId, topic_id: topicId } },
      data: {
        practice_attempts: attempts,
        correct_attempts: correct,
        mastery_score: score,
        last_activity_at: new Date(),
      },
    });
  } else {
    await prisma.conceptMastery.create({
      data: {
        user_id: userId,
        topic_id: topicId,
        practice_attempts: 1,
        correct_attempts: isCorrect ? 1 : 0,
        mastery_score: isCorrect ? 100 : 0,
        last_activity_at: new Date(),
      },
    });
  }
};

export const getConceptMastery = async (userId: string) => {
  const masteries = await prisma.conceptMastery.findMany({
    where: { user_id: userId },
    include: {
      topic: {
        select: {
          id: true,
          title: true,
          slug: true,
          module: { select: { title: true, course: { select: { title: true } } } },
        },
      },
    },
    orderBy: { mastery_score: 'asc' },
  });

  return masteries.map((m) => ({
    topicId: m.topic_id,
    topicTitle: m.topic.title,
    moduleTitle: m.topic.module.title,
    courseTitle: m.topic.module.course.title,
    masteryScore: m.mastery_score,
    practiceAttempts: m.practice_attempts,
    correctAttempts: m.correct_attempts,
    lastActivityAt: m.last_activity_at,
  }));
};

// ========== INTERVIEW READINESS ==========

export const getInterviewReadiness = async (userId: string) => {
  const scores = await prisma.thinkingScore.findMany({ where: { user_id: userId } });
  const progress = await prisma.practiceProgress.findUnique({ where: { user_id: userId } });

  const get = (type: string) => scores.find((s) => s.thinking_type === type)?.current_score ?? 0;

  const interviewScore = get('INTERVIEW');
  const debugScore = get('DEBUGGING');
  const archScore = get('ARCHITECTURE');
  const masteryScore = progress?.overall_mastery_score ?? 0;
  const streakDays = Math.min(progress?.current_streak ?? 0, 10);

  const readinessScore = Math.round(
    interviewScore * 0.30 +
    debugScore * 0.20 +
    archScore * 0.20 +
    masteryScore * 0.20 +
    streakDays * 1.0
  );

  return {
    readinessScore,
    breakdown: {
      interview: { score: interviewScore, weight: 30, label: 'Interview Thinking' },
      debugging: { score: debugScore, weight: 20, label: 'Debugging Skill' },
      architecture: { score: archScore, weight: 20, label: 'Architecture Reasoning' },
      mastery: { score: masteryScore, weight: 20, label: 'Overall Mastery' },
      consistency: { score: streakDays * 10, weight: 10, label: 'Practice Consistency' },
    },
    level:
      readinessScore >= 80 ? 'Interview Ready' :
      readinessScore >= 60 ? 'Nearly Ready' :
      readinessScore >= 40 ? 'Building Up' :
      'Just Starting',
  };
};

// ========== FULL PROGRESS DASHBOARD ==========

export const getProgressDashboard = async (userId: string) => {
  const [progress, thinkingScores, interviewReadiness, recentSessions, conceptMasteries] =
    await Promise.all([
      prisma.practiceProgress.findUnique({ where: { user_id: userId } }),
      prisma.thinkingScore.findMany({ where: { user_id: userId }, orderBy: { thinking_type: 'asc' } }),
      getInterviewReadiness(userId),
      prisma.practiceSession.findMany({
        where: { user_id: userId },
        take: 10,
        orderBy: { completed_at: 'desc' },
        include: {
          question_data: { select: { title: true, question_type: true, thinking_type: true } },
        },
      }),
      getConceptMastery(userId),
    ]);

  const allThinkingTypes = ['LOGIC', 'DEBUGGING', 'PERFORMANCE', 'ARCHITECTURE', 'SECURITY', 'REAL_WORLD', 'INTERVIEW'];
  const radarData = allThinkingTypes.map((type) => ({
    type,
    score: thinkingScores.find((s) => s.thinking_type === type)?.current_score ?? 0,
    attempts: thinkingScores.find((s) => s.thinking_type === type)?.attempts_count ?? 0,
  }));

  const weakAreas = thinkingScores
    .filter((s) => s.current_score < 70)
    .sort((a, b) => a.current_score - b.current_score)
    .slice(0, 5)
    .map((s) => ({
      thinkingType: s.thinking_type,
      score: s.current_score,
      weakConcepts: (s.weak_concepts as string[]) ?? [],
    }));

  return {
    overview: {
      totalCompleted: progress?.questions_completed ?? 0,
      totalCorrect: progress?.questions_correct ?? 0,
      overallMastery: progress?.overall_mastery_score ?? 0,
      currentStreak: progress?.current_streak ?? 0,
      longestStreak: progress?.longest_streak ?? 0,
      lastPracticeDate: progress?.last_practice_date ?? null,
    },
    radarData,
    interviewReadiness,
    weakAreas,
    conceptMasteries,
    recentSessions: recentSessions.map((s) => ({
      id: s.id,
      isCorrect: s.is_correct,
      thinkingScore: s.thinking_score,
      timeTaken: s.time_taken,
      completedAt: s.completed_at,
      questionTitle: s.question_data?.title ?? '',
      questionType: s.question_data?.question_type ?? '',
      thinkingType: s.question_data?.thinking_type ?? '',
    })),
  };
};

// ========== WEEKLY ACTIVITY SUMMARY ==========

export const getWeeklyActivity = async (userId: string) => {
  const days: { date: string; label: string; questions: number; correct: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    days.push({
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      questions: 0,
      correct: 0,
    });
  }

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 6);

  const rows = await prisma.dailyActivity.findMany({
    where: { user_id: userId, activity_date: { gte: since } },
  });

  for (const row of rows) {
    const key = row.activity_date.toISOString().split('T')[0];
    const day = days.find((d) => d.date === key);
    if (day) {
      day.questions = row.questions_answered;
      day.correct = row.correct_count;
    }
  }

  return days;
};
