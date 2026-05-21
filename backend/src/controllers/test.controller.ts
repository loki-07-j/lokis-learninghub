import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// ── ADMIN: list all tests ─────────────────────────────────────────────────────
export const adminGetTests = async (_req: Request, res: Response) => {
  try {
    const tests = await prisma.test.findMany({
      include: { _count: { select: { questions: true, attempts: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json({ tests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
};

// ── ADMIN: get single test with questions ─────────────────────────────────────
export const adminGetTest = async (req: Request, res: Response) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.testId as string },
      include: { questions: { orderBy: { sort_order: 'asc' } } },
    });
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json({ test });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch test' });
  }
};

// ── ADMIN: create test ────────────────────────────────────────────────────────
export const adminCreateTest = async (req: Request, res: Response) => {
  const { title, description, category, duration_secs, passing_score, difficulty } = req.body;
  const userId = (req as any).userId;
  try {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const test = await prisma.test.create({
      data: { title, slug, description, category, duration_secs, passing_score, difficulty, created_by: userId },
    });
    res.status(201).json({ test });
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: 'Failed to create test' });
  }
};

// ── ADMIN: update test ────────────────────────────────────────────────────────
export const adminUpdateTest = async (req: Request, res: Response) => {
  const { title, description, category, duration_secs, passing_score, difficulty, is_published } = req.body;
  try {
    const updates: any = { description, category, duration_secs, passing_score, difficulty, is_published };
    if (title) {
      updates.title = title;
      updates.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const test = await prisma.test.update({ where: { id: req.params.testId as string }, data: updates });
    res.json({ test });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update test' });
  }
};

// ── ADMIN: delete test ────────────────────────────────────────────────────────
export const adminDeleteTest = async (req: Request, res: Response) => {
  try {
    await prisma.test.delete({ where: { id: req.params.testId as string } });
    res.json({ message: 'Test deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete test' });
  }
};

// ── ADMIN: add question to test ───────────────────────────────────────────────
export const adminAddQuestion = async (req: Request, res: Response) => {
  const { question_text, options_json, correct_answer, explanation, sort_order } = req.body;
  try {
    const question = await prisma.testQuestion.create({
      data: { test_id: req.params.testId as string, question_text, options_json, correct_answer, explanation, sort_order: sort_order ?? 0 },
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
    const question = await prisma.testQuestion.update({
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
    await prisma.testQuestion.delete({ where: { id: req.params.questionId as string } });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

// ── ADMIN: import test from JSON ──────────────────────────────────────────────
export const adminImportTest = async (req: Request, res: Response) => {
  const { test: testData } = req.body;
  const userId = (req as any).userId;
  try {
    const slug = testData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
    const created = await prisma.test.create({
      data: {
        title: testData.title, slug, description: testData.description,
        category: testData.category || 'General', duration_secs: testData.duration_secs || 120,
        passing_score: testData.passing_score || 75, difficulty: testData.difficulty || 'BEGINNER',
        created_by: userId,
        questions: {
          create: (testData.questions || []).map((q: any, i: number) => ({
            question_text: q.question_text, options_json: q.options_json,
            correct_answer: q.correct_answer, explanation: q.explanation || '', sort_order: i,
          })),
        },
      },
      include: { questions: true },
    });
    res.status(201).json({ test: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to import test' });
  }
};

// ── USER: list published tests ────────────────────────────────────────────────
export const getPublishedTests = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const difficulty = req.query.difficulty as string | undefined;
    const where: any = { is_published: true };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    const tests = await prisma.test.findMany({
      where,
      select: { id: true, title: true, slug: true, description: true, category: true,
        duration_secs: true, passing_score: true, difficulty: true, is_published: true,
        _count: { select: { questions: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json({ tests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
};

// ── USER: get test for attempting (without revealing correct answers) ──────────
export const getTestForAttempt = async (req: Request, res: Response) => {
  try {
    const test = await prisma.test.findFirst({
      where: { id: req.params.testId as string, is_published: true },
      include: {
        questions: {
          select: { id: true, question_text: true, options_json: true, sort_order: true },
          orderBy: { sort_order: 'asc' },
        },
      },
    });
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json({ test });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch test' });
  }
};

// ── USER: submit test attempt ─────────────────────────────────────────────────
export const submitTestAttempt = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { answers, time_taken } = req.body;
  try {
    const test = await prisma.test.findFirst({
      where: { id: req.params.testId as string, is_published: true },
      include: { questions: { orderBy: { sort_order: 'asc' } } },
    });
    if (!test) return res.status(404).json({ error: 'Test not found' });

    let correct = 0;
    const review = test.questions.map(q => {
      const selected: number = answers[q.id] ?? -1;
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) correct++;
      return { questionId: q.id, question_text: q.question_text, options: q.options_json,
        selected, correct_answer: q.correct_answer, is_correct: isCorrect, explanation: q.explanation };
    });

    const score = Math.round((correct / test.questions.length) * 100);
    const is_passed = score >= test.passing_score;

    const attempt = await prisma.testAttempt.create({
      data: { test_id: test.id, user_id: userId, answers_json: answers,
        score, is_passed, time_taken: time_taken || 0 },
    });

    res.json({ attempt: { ...attempt, review, total: test.questions.length, correct } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit attempt' });
  }
};

// ── USER: get my test history ─────────────────────────────────────────────────
export const getMyTestHistory = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  try {
    const attempts = await prisma.testAttempt.findMany({
      where: { user_id: userId },
      include: { test: { select: { title: true, category: true, passing_score: true } } },
      orderBy: { completed_at: 'desc' },
      take: 20,
    });
    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
