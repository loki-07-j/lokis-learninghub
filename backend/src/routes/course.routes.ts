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
  deleteLesson,
  createModule,
  updateModule,
  deleteModule,
  createTopic,
  updateTopic,
  deleteTopic,
  createLessonBlock,
  updateLessonBlock,
  deleteLessonBlock,
  reorderLessonBlocks,
  updateTopicFlow,
  getTopicContent
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

// Middleware guarding administrative endpoints
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
router.get('/:courseSlug/topics/:topicSlug', getTopicContent);

// Admin controls mapping

// 1. Courses CRUD
router.post('/', adminOnly, createCourse);
router.put('/:id', adminOnly, updateCourse);
router.delete('/:id', adminOnly, deleteCourse);

// 2. Modules CRUD
router.post('/modules', adminOnly, createModule);
router.put('/modules/:id', adminOnly, updateModule);
router.delete('/modules/:id', adminOnly, deleteModule);

// 3. Topics CRUD
router.post('/topics', adminOnly, createTopic);
router.put('/topics/:id', adminOnly, updateTopic);
router.delete('/topics/:id', adminOnly, deleteTopic);
router.put('/topics/:id/flow', adminOnly, updateTopicFlow);

// 4. Lessons CRUD (under topic ID context inside body)
router.post('/lessons', adminOnly, createLesson);
router.put('/lessons/:id', adminOnly, updateLesson);
router.delete('/lessons/:id', adminOnly, deleteLesson);

// 5. LessonBlocks CRUD
router.post('/lessons/blocks', adminOnly, createLessonBlock);
router.put('/lessons/blocks/:id', adminOnly, updateLessonBlock);
router.delete('/lessons/blocks/:id', adminOnly, deleteLessonBlock);
router.post('/lessons/:lessonId/blocks/reorder', adminOnly, reorderLessonBlocks);

export default router;
