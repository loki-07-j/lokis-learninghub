import { Request, Response, NextFunction } from 'express';
import * as practiceService from '../services/practice';
import { ThinkingType, QuestionType, DifficultyLevel, InterviewMode } from '@prisma/client';

// ========== PRACTICE QUESTIONS ENDPOINTS ==========

/**
 * GET /api/practice
 * Get practice questions with filters
 */
export const getPracticeQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      topicId,
      thinkingType,
      questionType,
      difficulty,
      limit = '20',
      offset = '0',
    } = req.query as { [key: string]: string };

    const questions = await practiceService.getPracticeQuestions({
      topicId: topicId || undefined,
      thinkingType: (thinkingType || undefined) as ThinkingType | undefined,
      questionType: (questionType || undefined) as QuestionType | undefined,
      difficulty: (difficulty || undefined) as DifficultyLevel | undefined,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    res.json({
      success: true,
      data: questions,
      count: questions.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/practice/:questionId
 * Get single question by ID
 */
export const getQuestionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { questionId } = req.params;

    const question = await practiceService.getQuestionById(questionId as string);

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// ========== PRACTICE SUBMISSION ENDPOINTS ==========

/**
 * POST /api/practice/:questionId/submit
 * Submit answer to a practice question
 */
export const submitAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { questionId } = req.params;
    const { answer, reasoning, timeTaken } = req.body;
    const userId = (req as any).userId; // From auth middleware

    // Validate input
    if (!answer || typeof timeTaken !== 'number') {
      res.status(400).json({
        success: false,
        message: 'Answer and timeTaken are required',
      });
      return;
    }

    const session = await practiceService.submitAnswer(
      userId as string,
      questionId as string,
      answer,
      reasoning || '',
      timeTaken
    );

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// ========== THINKING SCORES ENDPOINTS ==========

/**
 * GET /api/practice/thinking-scores/:userId
 * Get all thinking scores for user
 */
export const getThinkingScores = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).userId;

    if (userId !== currentUserId) {
      const userRole = (req as any).userRole;
      if (userRole !== 'ADMIN' && userRole !== 'INSTRUCTOR') {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view other user\'s scores',
        });
        return;
      }
    }

    const scores = await practiceService.getThinkingScores(userId as string);

    res.json({
      success: true,
      data: scores,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/practice/weak-areas/:userId
 * Get weak areas for user - prioritized areas to focus on
 */
export const getWeakAreas = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).userId;

    if (userId !== currentUserId) {
      const userRole = (req as any).userRole;
      if (userRole !== 'ADMIN' && userRole !== 'INSTRUCTOR') {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view other user\'s data',
        });
        return;
      }
    }

    const weakAreas = await practiceService.getWeakAreas(userId as string, 10);

    res.json({
      success: true,
      data: weakAreas,
      count: weakAreas.length,
    });
  } catch (error) {
    next(error);
  }
};

// ========== PRACTICE PROGRESS ENDPOINTS ==========

/**
 * GET /api/practice/progress/:userId
 * Get practice progress for user
 */
export const getPracticeProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).userId;

    if (userId !== currentUserId) {
      const userRole = (req as any).userRole;
      if (userRole !== 'ADMIN' && userRole !== 'INSTRUCTOR') {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view other user\'s progress',
        });
        return;
      }
    }

    const progress = await practiceService.getPracticeProgress(userId as string);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/practice/history/:userId
 * Get practice session history
 */
export const getPracticeHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { limit = '20', offset = '0' } = req.query as { [key: string]: string };
    const currentUserId = (req as any).userId;

    if (userId !== currentUserId) {
      const userRole = (req as any).userRole;
      if (userRole !== 'ADMIN' && userRole !== 'INSTRUCTOR') {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view other user\'s history',
        });
        return;
      }
    }

    const history = await practiceService.getPracticeHistory(
      userId as string,
      parseInt(limit, 10),
      parseInt(offset, 10)
    );

    res.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    next(error);
  }
};

// ========== INTERVIEW SESSION ENDPOINTS ==========

/**
 * POST /api/practice/interview/start
 * Start a new interview session
 */
export const startInterviewSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { mode, questionCount = 5 } = req.body;

    if (!mode || !Object.values(InterviewMode).includes(mode)) {
      res.status(400).json({ success: false, message: 'Valid interview mode is required' });
      return;
    }

    const result = await practiceService.startInterviewSession(userId, mode as InterviewMode, questionCount);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/practice/interview/:sessionId/submit
 * Submit an answer within an interview session
 */
export const submitInterviewAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { questionId, answer, reasoning, timeTaken, confidenceLevel } = req.body;

    if (!questionId || !answer || typeof timeTaken !== 'number') {
      res.status(400).json({ success: false, message: 'questionId, answer, and timeTaken are required' });
      return;
    }

    const result = await practiceService.submitInterviewAnswer(
      sessionId as string,
      questionId as string,
      answer,
      reasoning || '',
      timeTaken,
      confidenceLevel || 5
    );

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/practice/interview/:sessionId/complete
 * Complete an interview session
 */
export const completeInterviewSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const session = await practiceService.completeInterviewSession(sessionId as string);
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/practice/interview/sessions/:userId
 * Get all interview sessions for user
 */
export const getInterviewSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const sessions = await practiceService.getInterviewSessions(userId as string);
    res.json({ success: true, data: sessions, count: sessions.length });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/practice/interview/session/:sessionId
 * Get a single interview session
 */
export const getInterviewSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const session = await practiceService.getInterviewSession(sessionId as string);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

// ========== ADMIN PRACTICE QUESTION CRUD ==========

/**
 * POST /api/practice/admin/questions
 * Create a new practice question (admin only)
 */
export const createPracticeQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const question = await practiceService.createPracticeQuestion({
      ...req.body,
      created_by: userId,
    });
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/practice/admin/questions/:questionId
 * Update a practice question (admin only)
 */
export const updatePracticeQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { questionId } = req.params;
    const userId = (req as any).userId;
    const question = await practiceService.updatePracticeQuestion(questionId as string, {
      ...req.body,
      updated_by: userId,
    });
    res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/practice/admin/questions/:questionId
 * Delete a practice question (admin only)
 */
export const deletePracticeQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { questionId } = req.params;
    await practiceService.deletePracticeQuestion(questionId as string);
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/practice/admin/questions/:topicId
 * Get all questions for a topic (admin only)
 */
export const getQuestionsByTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { topicId } = req.params;
    const questions = await practiceService.getPracticeQuestionsByTopic(topicId as string);
    res.json({ success: true, data: questions, count: questions.length });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/practice/admin/import
 * Bulk-import practice questions for a topic from a JSON payload.
 * Body: { topic_id: string, questions: [...] }
 */
export const importQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { topic_id, questions } = req.body;
    if (!topic_id || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ success: false, message: 'topic_id and non-empty questions array are required' });
      return;
    }
    const created = await practiceService.importPracticeQuestions({
      topic_id,
      created_by: userId,
      questions,
    });
    res.status(201).json({ success: true, data: created, count: created.length });
  } catch (error) {
    next(error);
  }
};
