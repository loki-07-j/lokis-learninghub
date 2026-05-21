import { Router } from 'express';
import * as practiceController from '../controllers/practice.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();

// ========== ADMIN ROUTES (must be before dynamic params) ==========

router.get('/admin/questions/:topicId',   authMiddleware, checkPermission('practice.manage'), practiceController.getQuestionsByTopic);
router.post('/admin/questions',           authMiddleware, checkPermission('practice.manage'), practiceController.createPracticeQuestion);
router.put('/admin/questions/:questionId', authMiddleware, checkPermission('practice.manage'), practiceController.updatePracticeQuestion);
router.delete('/admin/questions/:questionId', authMiddleware, checkPermission('practice.manage'), practiceController.deletePracticeQuestion);
router.post('/admin/import',              authMiddleware, checkPermission('practice.manage'), practiceController.importQuestions);

// ========== INTERVIEW ROUTES ==========

router.post('/interview/start',                     authMiddleware, practiceController.startInterviewSession);
router.post('/interview/:sessionId/submit',         authMiddleware, practiceController.submitInterviewAnswer);
router.post('/interview/:sessionId/complete',       authMiddleware, practiceController.completeInterviewSession);
router.get('/interview/sessions/:userId',           authMiddleware, practiceController.getInterviewSessions);
router.get('/interview/session/:sessionId',         authMiddleware, practiceController.getInterviewSession);

// ========== NAMED USER ROUTES (before /:questionId) ==========

router.get('/',                         authMiddleware, practiceController.getPracticeQuestions);
router.get('/thinking-scores/:userId',  authMiddleware, practiceController.getThinkingScores);
router.get('/weak-areas/:userId',       authMiddleware, practiceController.getWeakAreas);
router.get('/progress/:userId',         authMiddleware, practiceController.getPracticeProgress);
router.get('/history/:userId',          authMiddleware, practiceController.getPracticeHistory);

// ========== DYNAMIC QUESTION ROUTES (last — after all named routes) ==========

router.get('/:questionId',             authMiddleware, practiceController.getQuestionById);
router.post('/:questionId/submit',     authMiddleware, practiceController.submitAnswer);

export default router;
