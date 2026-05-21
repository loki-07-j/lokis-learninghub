import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// ── ADMIN: list all pools ─────────────────────────────────────────────────────
export const adminGetPools = async (_req: Request, res: Response) => {
  try {
    const pools = await prisma.rapidFirePool.findMany({
      include: { _count: { select: { questions: true, sessions: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json({ pools });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pools' });
  }
};

// ── ADMIN: get pool with questions ────────────────────────────────────────────
export const adminGetPool = async (req: Request, res: Response) => {
  try {
    const pool = await prisma.rapidFirePool.findUnique({
      where: { id: req.params.poolId as string },
      include: { questions: { orderBy: { sort_order: 'asc' } } },
    });
    if (!pool) return res.status(404).json({ error: 'Pool not found' });
    res.json({ pool });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pool' });
  }
};

// ── ADMIN: create pool ────────────────────────────────────────────────────────
export const adminCreatePool = async (req: Request, res: Response) => {
  const { title, category, description } = req.body;
  const userId = (req as any).userId;
  try {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
    const pool = await prisma.rapidFirePool.create({
      data: { title, slug, category, description, created_by: userId },
    });
    res.status(201).json({ pool });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create pool' });
  }
};

// ── ADMIN: update pool ────────────────────────────────────────────────────────
export const adminUpdatePool = async (req: Request, res: Response) => {
  const { title, category, description, is_published } = req.body;
  try {
    const pool = await prisma.rapidFirePool.update({
      where: { id: req.params.poolId as string },
      data: { title, category, description, is_published },
    });
    res.json({ pool });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update pool' });
  }
};

// ── ADMIN: delete pool ────────────────────────────────────────────────────────
export const adminDeletePool = async (req: Request, res: Response) => {
  try {
    await prisma.rapidFirePool.delete({ where: { id: req.params.poolId as string } });
    res.json({ message: 'Pool deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete pool' });
  }
};

// ── ADMIN: add question to pool ───────────────────────────────────────────────
export const adminAddQuestion = async (req: Request, res: Response) => {
  const { question_text, options_json, correct_answer, explanation, sort_order } = req.body;
  try {
    const question = await prisma.rapidFireQuestion.create({
      data: { pool_id: req.params.poolId as string, question_text, options_json,
        correct_answer, explanation, sort_order: sort_order ?? 0 },
    });
    res.status(201).json({ question });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add question' });
  }
};

// ── ADMIN: update question ────────────────────────────────────────────────────
export const adminUpdateQuestion = async (req: Request, res: Response) => {
  const { question_text, options_json, correct_answer, explanation, sort_order } = req.body;
  try {
    const question = await prisma.rapidFireQuestion.update({
      where: { id: req.params.questionId as string },
      data: { question_text, options_json, correct_answer, explanation, sort_order },
    });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update question' });
  }
};

// ── ADMIN: delete question ────────────────────────────────────────────────────
export const adminDeleteQuestion = async (req: Request, res: Response) => {
  try {
    await prisma.rapidFireQuestion.delete({ where: { id: req.params.questionId as string } });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

// ── ADMIN: import pool from JSON ──────────────────────────────────────────────
export const adminImportPool = async (req: Request, res: Response) => {
  const { pool: poolData } = req.body;
  const userId = (req as any).userId;
  try {
    const slug = poolData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
    const created = await prisma.rapidFirePool.create({
      data: {
        title: poolData.title, slug, category: poolData.category || 'General',
        description: poolData.description, created_by: userId,
        questions: {
          create: (poolData.questions || []).map((q: any, i: number) => ({
            question_text: q.question_text, options_json: q.options_json,
            correct_answer: q.correct_answer, explanation: q.explanation, sort_order: i,
          })),
        },
      },
      include: { questions: true },
    });
    res.status(201).json({ pool: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to import pool' });
  }
};

// ── USER: list published pools ────────────────────────────────────────────────
export const getPublishedPools = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const where: any = { is_published: true };
    if (category) where.category = category;
    const pools = await prisma.rapidFirePool.findMany({
      where,
      select: { id: true, title: true, slug: true, category: true, description: true,
        is_published: true, _count: { select: { questions: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json({ pools });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pools' });
  }
};

// ── USER: get pool questions (shuffled) ───────────────────────────────────────
export const getPoolQuestions = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string || '10', 10);
    const pool = await prisma.rapidFirePool.findFirst({
      where: { id: req.params.poolId as string, is_published: true },
      include: { questions: true },
    });
    if (!pool) return res.status(404).json({ error: 'Pool not found' });

    const shuffled = pool.questions
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)
      .map(q => ({ id: q.id, question_text: q.question_text, options_json: q.options_json, correct_answer: q.correct_answer, sort_order: q.sort_order }));

    res.json({ pool: { ...pool, questions: shuffled } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pool' });
  }
};

// ── USER: submit rapid fire session ──────────────────────────────────────────
export const submitSession = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { answers, time_taken } = req.body;
  try {
    const pool = await prisma.rapidFirePool.findFirst({
      where: { id: req.params.poolId as string, is_published: true },
      include: { questions: true },
    });
    if (!pool) return res.status(404).json({ error: 'Pool not found' });

    let correct = 0;
    let streak = 0;
    let maxStreak = 0;

    const review = pool.questions
      .filter(q => answers[q.id] !== undefined)
      .map(q => {
        const selected: number = answers[q.id];
        const isCorrect = selected === q.correct_answer;
        if (isCorrect) { correct++; streak++; maxStreak = Math.max(maxStreak, streak); }
        else streak = 0;
        return { questionId: q.id, question_text: q.question_text,
          selected, correct_answer: q.correct_answer, is_correct: isCorrect, explanation: q.explanation };
      });

    const total = review.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    const session = await prisma.rapidFireSession.create({
      data: { pool_id: pool.id, user_id: userId, score, total_questions: total,
        correct_count: correct, streak: maxStreak, time_taken: time_taken || 0 },
    });

    res.json({ session: { ...session, review, maxStreak } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit session' });
  }
};

// ── USER: leaderboard for a pool ──────────────────────────────────────────────
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const entries = await prisma.rapidFireSession.findMany({
      where: { pool_id: req.params.poolId as string },
      orderBy: [{ score: 'desc' }, { time_taken: 'asc' }],
      take: 10,
      select: { user_id: true, score: true, correct_count: true, total_questions: true, streak: true, time_taken: true, completed_at: true },
    });
    res.json({ leaderboard: entries });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
