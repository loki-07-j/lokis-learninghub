import { Router, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import prisma from '../utils/prisma';
import {
  getUsers,
  getRoles,
  updateUserRole,
  toggleUserBlock,
  getRoleHistory
} from '../controllers/admin.controller';

const router = Router();

// Middleware to secure administration endpoints
const adminGuard = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User session not found' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ error: 'Access denied: Account is deactivated' });
      return;
    }

    const roleCode = user.role.role_code;
    if (roleCode !== 'SUPER_ADMIN' && roleCode !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied: Administrative privileges required' });
      return;
    }

    // Populate req.user downstream
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.role_name,
      role_code: user.role.role_code
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Protect all routes in this router
router.use(authMiddleware);
router.use(adminGuard);

// Route Mappings
router.get('/users', getUsers);
router.get('/roles', getRoles);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-block', toggleUserBlock);
router.get('/role-history', getRoleHistory);

export default router;
