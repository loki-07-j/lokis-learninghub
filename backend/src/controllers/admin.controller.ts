import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

// Extend Request interface to support parsed JWT user details
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    role_code: string;
  };
}

/**
 * Get all users with search, role, and block filters
 */
export async function getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, role, is_active } = req.query;

    const whereClause: any = {};

    // 1. Search Query (Name/Email Case Insensitive)
    if (search && typeof search === 'string') {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 2. Role Filtering
    if (role && typeof role === 'string') {
      whereClause.role = {
        role_code: role
      };
    }

    // 3. Active/Blocked Status Filtering
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
        created_at: true,
        role: {
          select: {
            id: true,
            role_name: true,
            role_code: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

/**
 * Get all database roles
 */
export async function getRoles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        role_name: true,
        role_code: true,
        description: true
      }
    });
    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
}

/**
 * Update user's role and write audit logs
 */
export async function updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { role_id } = req.body;

    if (!role_id) {
      res.status(400).json({ error: 'role_id is required' });
      return;
    }

    const targetUserId = id as string;
    const changerId = req.user?.id as string;

    if (!changerId) {
      res.status(401).json({ error: 'Unauthorized: Changer identity not found' });
      return;
    }

    // 1. Fetch current target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { role: true }
    });

    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // 2. Validate selected role exists
    const nextRole = await prisma.role.findUnique({
      where: { id: Number(role_id) }
    });

    if (!nextRole) {
      res.status(400).json({ error: 'Target role does not exist' });
      return;
    }

    // 3. If role is identical, complete request successfully
    if (targetUser.role_id === Number(role_id)) {
      res.status(200).json({ message: 'User role is already identical', user: targetUser });
      return;
    }

    // 4. Perform transaction updating user and creating audit entry
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update target user
      const user = await tx.user.update({
        where: { id: targetUserId },
        data: { role_id: Number(role_id) },
        select: {
          id: true,
          name: true,
          email: true,
          is_active: true,
          role: {
            select: {
              id: true,
              role_name: true,
              role_code: true
            }
          }
        }
      });

      // Write User Role change Audit History log
      await tx.userRoleHistory.create({
        data: {
          user_id: targetUserId,
          old_role_id: targetUser.role_id,
          new_role_id: Number(role_id),
          changed_by: changerId
        }
      });

      return user;
    });

    res.status(200).json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle user's block / active status
 */
export async function toggleUserBlock(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const targetUserId = id as string;

    const user = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent Super Admins from blocking themselves
    if (user.id === req.user?.id) {
      res.status(400).json({ error: 'You cannot block or deactivate your own account' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { is_active: !user.is_active },
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
        role: {
          select: {
            role_name: true
          }
        }
      }
    });

    res.status(200).json({
      message: `User account successfully ${updatedUser.is_active ? 'activated' : 'blocked'}`,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get User Role modification history log records
 */
export async function getRoleHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const logs = await prisma.userRoleHistory.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        old_role: {
          select: {
            role_name: true
          }
        },
        new_role: {
          select: {
            role_name: true
          }
        },
        changer: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { changed_at: 'desc' }
    });

    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
}
