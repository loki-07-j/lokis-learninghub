import { Router } from 'express';
import * as rapidFireController from '../controllers/rapidfire.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();

// ── ADMIN routes ──────────────────────────────────────────────────────────────
router.get('/admin',                    authMiddleware, checkPermission('practice.manage'), rapidFireController.adminGetPools);
router.post('/admin',                   authMiddleware, checkPermission('practice.manage'), rapidFireController.adminCreatePool);
router.post('/admin/import',            authMiddleware, checkPermission('practice.manage'), rapidFireController.adminImportPool);
router.get('/admin/:poolId',            authMiddleware, checkPermission('practice.manage'), rapidFireController.adminGetPool);
router.put('/admin/:poolId',            authMiddleware, checkPermission('practice.manage'), rapidFireController.adminUpdatePool);
router.delete('/admin/:poolId',         authMiddleware, checkPermission('practice.manage'), rapidFireController.adminDeletePool);
router.post('/admin/:poolId/questions', authMiddleware, checkPermission('practice.manage'), rapidFireController.adminAddQuestion);
router.put('/admin/questions/:questionId',    authMiddleware, checkPermission('practice.manage'), rapidFireController.adminUpdateQuestion);
router.delete('/admin/questions/:questionId', authMiddleware, checkPermission('practice.manage'), rapidFireController.adminDeleteQuestion);

// ── USER routes ───────────────────────────────────────────────────────────────
router.get('/',                         authMiddleware, rapidFireController.getPublishedPools);
router.get('/:poolId',                  authMiddleware, rapidFireController.getPoolQuestions);
router.get('/:poolId/leaderboard',      authMiddleware, rapidFireController.getLeaderboard);
router.post('/:poolId/submit',          authMiddleware, rapidFireController.submitSession);

export default router;
