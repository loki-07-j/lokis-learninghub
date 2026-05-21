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
        modules: {
          where: isAdmin ? {} : { is_published: true },
          include: {
            topics: {
              where: isAdmin ? {} : { is_published: true },
              include: {
                lessons: {
                  where: isAdmin ? {} : { is_published: true },
                  select: { id: true }
                }
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Format output: count content units for the catalog overview.
    // New flow architecture uses Topics as content units (flow_content on Topic).
    // Legacy architecture used Lesson records. Support both: prefer legacy lesson
    // count when lessons exist, otherwise count topics themselves.
    const formattedCourses = courses.map(course => {
      let lessonCount = 0;
      course.modules.forEach(m => {
        m.topics.forEach(t => {
          if (t.lessons.length > 0) {
            lessonCount += t.lessons.length;   // legacy lesson-based content
          } else {
            lessonCount += 1;                  // flow-based: topic is the content unit
          }
        });
      });

      const { modules, ...rest } = course;
      return {
        ...rest,
        _count: {
          lessons: lessonCount
        }
      };
    });

    res.status(200).json(formattedCourses);
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
        modules: {
          where: isAdmin ? {} : { is_published: true },
          orderBy: { sort_order: 'asc' },
          include: {
            topics: {
              where: isAdmin ? {} : { is_published: true },
              orderBy: { sort_order: 'asc' },
              include: {
                lessons: {
                  where: isAdmin ? {} : { is_published: true },
                  orderBy: { sort_order: 'asc' },
                  include: {
                    blocks: {
                      orderBy: { sort_order: 'asc' }
                    }
                  }
                }
              }
            }
          }
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

    // Flatten lessons into a single course.lessons list for backward compatibility
    const flatLessons: any[] = [];
    course.modules.forEach(m => {
      m.topics.forEach(t => {
        t.lessons.forEach(l => {
          flatLessons.push({
            ...l,
            course_id: course.id // Mock course_id to satisfy old interface
          });
        });
      });
    });

    const responseObj = {
      ...course,
      lessons: flatLessons
    };

    res.status(200).json(responseObj);
  } catch (error) {
    next(error);
  }
}

/**
 * Fetch a specific lesson content with its dynamic learning blocks
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

    // Find the lesson belonging to a topic within this course
    const lesson = await prisma.lesson.findFirst({
      where: {
        slug: lessonSlug,
        topic: {
          module: {
            course_id: course.id
          }
        },
        ...(isAdmin ? {} : { is_published: true })
      },
      include: {
        blocks: {
          orderBy: { sort_order: 'asc' }
        }
      }
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    // Supply expected default fallback for backward compatibility
    const responseObj = {
      ...lesson,
      course_id: course.id,
      content: lesson.blocks.length > 0 
        ? lesson.blocks.map(b => `### ${b.title}\n${b.subtitle || ''}\n${JSON.stringify(b.content_json)}`).join('\n\n')
        : '# Lesson content\nEmpty blocks.'
    };

    res.status(200).json(responseObj);
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

/* ==========================================
   MODULES CONTROLLERS (ADMIN ONLY)
   ========================================== */

export async function createModule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { course_id, title, description, sort_order, is_published } = req.body;
    if (!course_id || !title) {
      res.status(400).json({ error: 'course_id and title are required' });
      return;
    }

    let slug = generateSlug(title);
    const existing = await prisma.module.findFirst({ where: { course_id, slug } });
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const moduleRecord = await prisma.module.create({
      data: {
        course_id,
        title,
        slug,
        description: description || '',
        sort_order: sort_order !== undefined ? Number(sort_order) : 0,
        is_published: is_published !== undefined ? is_published : false
      }
    });

    res.status(201).json({ message: 'Module created successfully', module: moduleRecord });
  } catch (error) {
    next(error);
  }
}

export async function updateModule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { title, description, sort_order, is_published } = req.body;

    const moduleRecord = await prisma.module.findUnique({ where: { id } });
    if (!moduleRecord) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    const updateData: any = {};
    if (title !== undefined) {
      updateData.title = title;
      if (title !== moduleRecord.title) {
        let slug = generateSlug(title);
        const existing = await prisma.module.findFirst({ where: { course_id: moduleRecord.course_id, slug } });
        if (existing) slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
        updateData.slug = slug;
      }
    }
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order);
    if (is_published !== undefined) updateData.is_published = is_published;

    const updated = await prisma.module.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ message: 'Module updated successfully', module: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteModule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const moduleRecord = await prisma.module.findUnique({ where: { id } });
    if (!moduleRecord) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    await prisma.module.delete({ where: { id } });
    res.status(200).json({ message: 'Module deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/* ==========================================
   TOPICS CONTROLLERS (ADMIN ONLY)
   ========================================== */

export async function createTopic(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { module_id, title, description, sort_order, is_published } = req.body;
    if (!module_id || !title) {
      res.status(400).json({ error: 'module_id and title are required' });
      return;
    }

    let slug = generateSlug(title);
    const existing = await prisma.topic.findFirst({ where: { module_id, slug } });
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const topic = await prisma.topic.create({
      data: {
        module_id,
        title,
        slug,
        description: description || '',
        sort_order: sort_order !== undefined ? Number(sort_order) : 0,
        is_published: is_published !== undefined ? is_published : false
      }
    });

    res.status(201).json({ message: 'Topic created successfully', topic });
  } catch (error) {
    next(error);
  }
}

export async function updateTopic(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { title, description, sort_order, is_published } = req.body;

    const topic = await prisma.topic.findUnique({ where: { id } });
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    const updateData: any = {};
    if (title !== undefined) {
      updateData.title = title;
      if (title !== topic.title) {
        let slug = generateSlug(title);
        const existing = await prisma.topic.findFirst({ where: { module_id: topic.module_id, slug } });
        if (existing) slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
        updateData.slug = slug;
      }
    }
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order);
    if (is_published !== undefined) updateData.is_published = is_published;

    const updated = await prisma.topic.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ message: 'Topic updated successfully', topic: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteTopic(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const topic = await prisma.topic.findUnique({ where: { id } });
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    await prisma.topic.delete({ where: { id } });
    res.status(200).json({ message: 'Topic deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/* ==========================================
   LESSONS CONTROLLERS (ADMIN OVERRIDES)
   ========================================== */

/**
 * Create a new Lesson in a Topic (Admin only)
 */
export async function createLesson(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { topic_id, title, sort_order, is_published } = req.body;

    if (!topic_id || !title) {
      res.status(400).json({ error: 'topic_id and title are required' });
      return;
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topic_id as string },
      include: { module: true }
    });
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    let slug = generateSlug(title);
    
    // Check if slug inside this topic is unique
    const existing = await prisma.lesson.findUnique({
      where: {
        topic_id_slug: { topic_id: topic_id as string, slug }
      }
    });

    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const lesson = await prisma.lesson.create({
      data: {
        topic_id: topic_id as string,
        title,
        slug,
        sort_order: sort_order !== undefined ? Number(sort_order) : 0,
        is_published: is_published !== undefined ? is_published : false
      }
    });

    // Attach mock fallback elements for legacy compatibility
    const responseObj = {
      ...lesson,
      course_id: topic.module.course_id, // Set the correct course_id from parent module
      content: ''
    };

    res.status(201).json({ message: 'Lesson added successfully', lesson: responseObj });
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
    const { title, sort_order, is_published } = req.body;

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
            topic_id_slug: { topic_id: lesson.topic_id, slug }
          }
        });
        if (existing) {
          slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        updateData.slug = slug;
      }
    }
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

/* ==========================================
   LESSON BLOCKS CONTROLLERS (ADMIN ONLY)
   ========================================== */

export async function createLessonBlock(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { lesson_id, block_type, title, subtitle, content_json, sort_order, difficulty_level, estimated_time, is_interactive, is_required } = req.body;
    if (!lesson_id || !block_type || !title) {
      res.status(400).json({ error: 'lesson_id, block_type, and title are required' });
      return;
    }

    const block = await prisma.lessonBlock.create({
      data: {
        lesson_id,
        block_type,
        title,
        subtitle: subtitle || '',
        content_json: content_json || {},
        sort_order: sort_order !== undefined ? Number(sort_order) : 0,
        difficulty_level: difficulty_level || 'BEGINNER',
        estimated_time: estimated_time !== undefined ? Number(estimated_time) : 5,
        is_interactive: is_interactive !== undefined ? Boolean(is_interactive) : false,
        is_required: is_required !== undefined ? Boolean(is_required) : true,
        created_by: req.user?.id
      }
    });

    res.status(201).json({ message: 'Lesson block created successfully', block });
  } catch (error) {
    next(error);
  }
}

export async function updateLessonBlock(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { title, subtitle, content_json, sort_order, difficulty_level, estimated_time, is_interactive, is_required } = req.body;

    const block = await prisma.lessonBlock.findUnique({ where: { id } });
    if (!block) {
      res.status(404).json({ error: 'Lesson block not found' });
      return;
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (content_json !== undefined) updateData.content_json = content_json;
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order);
    if (difficulty_level !== undefined) updateData.difficulty_level = difficulty_level;
    if (estimated_time !== undefined) updateData.estimated_time = Number(estimated_time);
    if (is_interactive !== undefined) updateData.is_interactive = Boolean(is_interactive);
    if (is_required !== undefined) updateData.is_required = Boolean(is_required);
    updateData.updated_by = req.user?.id;

    const updated = await prisma.lessonBlock.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ message: 'Lesson block updated successfully', block: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteLessonBlock(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const block = await prisma.lessonBlock.findUnique({ where: { id } });
    if (!block) {
      res.status(404).json({ error: 'Lesson block not found' });
      return;
    }

    await prisma.lessonBlock.delete({ where: { id } });
    res.status(200).json({ message: 'Lesson block deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/* ==========================================
   TOPIC FLOW CONTENT (NEW ARCHITECTURE)
   ========================================== */

/**
 * Update a topic's flow_content (WHAT/WHY/HOW/PRACTICE JSON)
 */
export async function updateTopicFlow(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { flow_content } = req.body;

    const topic = await prisma.topic.findUnique({ where: { id } });
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    const updated = await prisma.topic.update({
      where: { id },
      data: { flow_content: flow_content ?? {} }
    });

    res.status(200).json({ message: 'Topic flow updated successfully', topic: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a topic with its flow_content by course slug + topic slug
 */
export async function getTopicContent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const courseSlug = req.params.courseSlug as string;
    const topicSlug = req.params.topicSlug as string;
    const roleCode = req.user?.role_code;
    const isAdmin = roleCode === 'SUPER_ADMIN' || roleCode === 'ADMIN';

    const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (!course.is_published && !isAdmin) {
      res.status(403).json({ error: 'Access Denied' });
      return;
    }

    const topic = await prisma.topic.findFirst({
      where: {
        slug: topicSlug,
        module: { course_id: course.id },
        ...(isAdmin ? {} : { is_published: true })
      },
      include: { module: true }
    });

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    res.status(200).json({ ...topic, course_id: course.id });
  } catch (error) {
    next(error);
  }
}

export async function reorderLessonBlocks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { blockIds } = req.body;
    if (!blockIds || !Array.isArray(blockIds)) {
      res.status(400).json({ error: 'blockIds array is required' });
      return;
    }

    const updates = blockIds.map((id: string, idx: number) => 
      prisma.lessonBlock.update({
        where: { id },
        data: { sort_order: (idx + 1) * 10 }
      })
    );

    await prisma.$transaction(updates);

    res.status(200).json({ message: 'Lesson blocks reordered successfully' });
  } catch (error) {
    next(error);
  }
}
