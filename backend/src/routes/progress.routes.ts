import { Router } from 'express';
import * as progressController from '../controllers/progress.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:userId/dashboard',          authMiddleware, progressController.getProgressDashboard);
router.get('/:userId/concept-mastery',    authMiddleware, progressController.getConceptMastery);
router.get('/:userId/heatmap',            authMiddleware, progressController.getDailyHeatmap);
router.get('/:userId/interview-readiness', authMiddleware, progressController.getInterviewReadiness);
router.get('/:userId/weekly-activity',    authMiddleware, progressController.getWeeklyActivity);

export default router;
