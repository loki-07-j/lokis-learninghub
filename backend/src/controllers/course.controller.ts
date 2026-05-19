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
 * Generate a clean, URL-safe slug
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
}

/**
 * Get all courses
 * - Admins get all courses
 * - Students get only published courses
 */
export async function getCourses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const roleCode = req.user?.role_code;
    const isAdmin = roleCode === 'SUPER_ADMIN' || roleCode === 'ADMIN';

    const whereClause: any = {};
    if (!isAdmin) {
      whereClause.is_published = true;
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { lessons: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
}

/**
 * Get dynamic course outline and lessons
 */
export async function getCourseDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const roleCode = req.user?.role_code;
    const isAdmin = roleCode === 'SUPER_ADMIN' || roleCode === 'ADMIN';

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        lessons: {
          where: isAdmin ? {} : { is_published: true },
          orderBy: { sort_order: 'asc' }
        }
      }
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (!course.is_published && !isAdmin) {
      res.status(403).json({ error: 'Access Denied: Course is not published' });
      return;
    }

    res.status(200).json(course);
  } catch (error) {
    next(error);
  }
}

/**
 * Fetch a specific lesson content
 */
export async function getLesson(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const courseSlug = req.params.courseSlug as string;
    const lessonSlug = req.params.lessonSlug as string;
    const roleCode = req.user?.role_code;
    const isAdmin = roleCode === 'SUPER_ADMIN' || roleCode === 'ADMIN';

    const course = await prisma.course.findUnique({
      where: { slug: courseSlug }
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (!course.is_published && !isAdmin) {
      res.status(403).json({ error: 'Access Denied' });
      return;
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        course_id: course.id,
        slug: lessonSlug,
        ...(isAdmin ? {} : { is_published: true })
      }
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    res.status(200).json(lesson);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new Course (Admin only)
 */
export async function createCourse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description } = req.body;
    const creatorId = req.user?.id as string;

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    let slug = generateSlug(title);
    
    // De-duplicate slug
    const existing = await prisma.course.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        created_by: creatorId
      }
    });

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing Course metadata (Admin only)
 */
export async function updateCourse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { title, description, is_published } = req.body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const updateData: any = {};
    if (title !== undefined) {
      updateData.title = title;
      // Re-generate slug if title has changed
      if (title !== course.title) {
        let slug = generateSlug(title);
        const existing = await prisma.course.findUnique({ where: { slug } });
        if (existing) {
          slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        updateData.slug = slug;
      }
    }
    if (description !== undefined) updateData.description = description;
    if (is_published !== undefined) updateData.is_published = is_published;

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ message: 'Course updated successfully', course: updatedCourse });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a course cascadingly (Admin only)
 */
export async function deleteCourse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    await prisma.course.delete({ where: { id } });

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new Lesson in a course (Admin only)
 */
export async function createLesson(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { course_id, title, content, sort_order, is_published } = req.body;

    if (!course_id || !title || !content) {
      res.status(400).json({ error: 'course_id, title, and content are required' });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id: course_id as string } });
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    let slug = generateSlug(title);
    
    // Check if slug inside this course is unique
    const existing = await prisma.lesson.findUnique({
      where: {
        course_id_slug: { course_id: course_id as string, slug }
      }
    });

    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const lesson = await prisma.lesson.create({
      data: {
        course_id: course_id as string,
        title,
        slug,
        content,
        sort_order: sort_order !== undefined ? Number(sort_order) : 0,
        is_published: is_published !== undefined ? is_published : false
      }
    });

    res.status(201).json({ message: 'Lesson added successfully', lesson });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing Lesson (Admin only)
 */
export async function updateLesson(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { title, content, sort_order, is_published } = req.body;

    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    const updateData: any = {};
    if (title !== undefined) {
      updateData.title = title;
      if (title !== lesson.title) {
        let slug = generateSlug(title);
        const existing = await prisma.lesson.findUnique({
          where: {
            course_id_slug: { course_id: lesson.course_id, slug }
          }
        });
        if (existing) {
          slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        updateData.slug = slug;
      }
    }
    if (content !== undefined) updateData.content = content;
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order);
    if (is_published !== undefined) updateData.is_published = is_published;

    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ message: 'Lesson updated successfully', lesson: updatedLesson });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a lesson (Admin only)
 */
export async function deleteLesson(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    await prisma.lesson.delete({ where: { id } });

    res.status(200).json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    next(error);
  }
}
