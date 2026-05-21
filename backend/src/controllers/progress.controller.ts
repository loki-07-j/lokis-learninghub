import { Request, Response, NextFunction } from 'express';
import * as progressService from '../services/progress';

export const getProgressDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const data = await progressService.getProgressDashboard(userId as string);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const getConceptMastery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const data = await progressService.getConceptMastery(userId as string);
    res.json({ success: true, data, count: data.length });
  } catch (error) { next(error); }
};

export const getDailyHeatmap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const weeks = parseInt((req.query.weeks as string) || '16', 10);
    const data = await progressService.getDailyHeatmap(userId as string, weeks);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const getInterviewReadiness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const data = await progressService.getInterviewReadiness(userId as string);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const getWeeklyActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const data = await progressService.getWeeklyActivity(userId as string);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
