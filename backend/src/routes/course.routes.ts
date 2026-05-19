import { Router, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import prisma from '../utils/prisma';
import {
  getCourses,
  getCourseDetails,
  getLesson,
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson
} from '../controllers/course.controller';

const router = Router();

// Middleware to resolve full user roles dynamically from DB
const attachUserInfo = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
      });
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role.role_name,
          role_code: user.role.role_code
        };
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware guarding administrative write endpoints
const adminOnly = (req: any, res: Response, next: NextFunction) => {
  const roleCode = req.user?.role_code;
  if (roleCode !== 'SUPER_ADMIN' && roleCode !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied: Administrative privileges required' });
    return;
  }
  next();
};

// Protect all routes under courses API
router.use(authMiddleware);
router.use(attachUserInfo);

// Student read access endpoints
router.get('/', getCourses);
router.get('/:slug', getCourseDetails);
router.get('/:courseSlug/lessons/:lessonSlug', getLesson);

// Admin controls mapping
router.post('/', adminOnly, createCourse);
router.put('/:id', adminOnly, updateCourse);
router.delete('/:id', adminOnly, deleteCourse);

router.post('/lessons', adminOnly, createLesson);
router.put('/lessons/:id', adminOnly, updateLesson);
router.delete('/lessons/:id', adminOnly, deleteLesson);

export default router;
