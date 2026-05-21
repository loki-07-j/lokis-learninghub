import { Request, Response, NextFunction } from 'express';
import * as plannerService from '../services/planner';
import { TargetRole, PlannerSkillLevel } from '@prisma/client';

export const generatePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const { targetRole, skillLevel, hoursPerDay, durationWeeks, targetDate } = req.body;

    if (!targetRole || !skillLevel) {
      res.status(400).json({ success: false, message: 'targetRole and skillLevel are required' });
      return;
    }
    if (!Object.values(TargetRole).includes(targetRole)) {
      res.status(400).json({ success: false, message: 'Invalid targetRole' });
      return;
    }
    if (!Object.values(PlannerSkillLevel).includes(skillLevel)) {
      res.status(400).json({ success: false, message: 'Invalid skillLevel' });
      return;
    }

    const result = await plannerService.generatePlan(userId, {
      targetRole,
      skillLevel,
      hoursPerDay: Math.min(4, Math.max(1, parseInt(hoursPerDay, 10) || 2)),
      durationWeeks: [4, 8, 12].includes(parseInt(durationWeeks, 10))
        ? parseInt(durationWeeks, 10)
        : 8,
      targetDate,
    });

    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getUserPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const plan = await plannerService.getUserPlan(userId as string);
    res.json({ success: true, data: plan });
  } catch (error) { next(error); }
};

export const getTodaysTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const data = await plannerService.getTodaysTasks(userId as string);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const completeCheckpoint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { checkpointId } = req.params;
    const checkpoint = await plannerService.completeCheckpoint(checkpointId as string);
    res.json({ success: true, data: checkpoint });
  } catch (error) { next(error); }
};

export const getPlanProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const data = await plannerService.getPlanProgress(userId as string);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
