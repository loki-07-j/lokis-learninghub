import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import prisma from '../utils/prisma';

export const checkPermission = (requiredPermission: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: {
              role_permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      if (!user.is_active) {
        res.status(403).json({ message: 'Your account is deactivated' });
        return;
      }

      const hasPermission = user.role.role_permissions.some(
        (rp) => rp.permission.permission_key === requiredPermission
      );

      if (!hasPermission) {
        res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
