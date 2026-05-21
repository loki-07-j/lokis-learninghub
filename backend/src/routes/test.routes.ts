import { Router } from 'express';
import * as testController from '../controllers/test.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();

// ── ADMIN routes ──────────────────────────────────────────────────────────────
router.get('/admin',                    authMiddleware, checkPermission('practice.manage'), testController.adminGetTests);
router.post('/admin',                   authMiddleware, checkPermission('practice.manage'), testController.adminCreateTest);
router.post('/admin/import',            authMiddleware, checkPermission('practice.manage'), testController.adminImportTest);
router.get('/admin/:testId',            authMiddleware, checkPermission('practice.manage'), testController.adminGetTest);
router.put('/admin/:testId',            authMiddleware, checkPermission('practice.manage'), testController.adminUpdateTest);
router.delete('/admin/:testId',         authMiddleware, checkPermission('practice.manage'), testController.adminDeleteTest);
router.post('/admin/:testId/questions', authMiddleware, checkPermission('practice.manage'), testController.adminAddQuestion);
router.put('/admin/questions/:questionId',    authMiddleware, checkPermission('practice.manage'), testController.adminUpdateQuestion);
router.delete('/admin/questions/:questionId', authMiddleware, checkPermission('practice.manage'), testController.adminDeleteQuestion);

// ── USER routes ───────────────────────────────────────────────────────────────
router.get('/',                         authMiddleware, testController.getPublishedTests);
router.get('/history',                  authMiddleware, testController.getMyTestHistory);
router.get('/:testId',                  authMiddleware, testController.getTestForAttempt);
router.post('/:testId/attempt',         authMiddleware, testController.submitTestAttempt);

export default router;
