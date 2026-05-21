import { Router } from 'express';
import * as plannerController from '../controllers/planner.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/generate',                          authMiddleware, plannerController.generatePlan);
router.get('/:userId',                            authMiddleware, plannerController.getUserPlan);
router.get('/:userId/today',                      authMiddleware, plannerController.getTodaysTasks);
router.get('/:userId/plan-progress',              authMiddleware, plannerController.getPlanProgress);
router.put('/checkpoint/:checkpointId/complete',  authMiddleware, plannerController.completeCheckpoint);

export default router;
