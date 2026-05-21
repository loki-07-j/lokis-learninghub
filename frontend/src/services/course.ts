import api from './api';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  is_published: boolean;
  created_at: string;
  modules?: Module[];
  _count?: { lessons: number };
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  description: string;
  sort_order: number;
  is_published: boolean;
  flow_content?: FlowContent | null;
  created_at: string;
  // legacy
  lessons?: Lesson[];
}

// ========== FROZEN CONTENT ARCHITECTURE ==========

export type ContentElementType =
  | 'TEXT'
  | 'CODE'
  | 'IMAGE'
  | 'VIDEO'
  | 'QUIZ'
  | 'CHALLENGE'
  | 'OUTPUT_PREVIEW'
  | 'FLOW_DIAGRAM'
  | 'CALLOUT';

export type FlowSection = 'what' | 'why' | 'how' | 'practice';

export interface TextElement {
  id: string;
  type: 'TEXT';
  content: string;
}

export interface CodeElement {
  id: string;
  type: 'CODE';
  language: string;
  title: string;
  code: string;
  editable?: boolean;
  runnable?: boolean;
  showLineNumbers?: boolean;
}

export interface ImageElement {
  id: string;
  type: 'IMAGE';
  url: string;
  caption?: string;
  alt?: string;
}

export interface VideoElement {
  id: string;
  type: 'VIDEO';
  url: string;
  title?: string;
}

export interface QuizElement {
  id: string;
  type: 'QUIZ';
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface ChallengeElement {
  id: string;
  type: 'CHALLENGE';
  instructions: string;
  hints: string[];
  expectedOutput?: string;
}

export interface OutputPreviewElement {
  id: string;
  type: 'OUTPUT_PREVIEW';
  html: string;
}

export interface FlowDiagramElement {
  id: string;
  type: 'FLOW_DIAGRAM';
  nodes: Array<{ label: string; detail?: string }>;
}

export interface CalloutElement {
  id: string;
  type: 'CALLOUT';
  variant: 'info' | 'warning' | 'tip' | 'danger';
  content: string;
}

export type ContentElement =
  | TextElement
  | CodeElement
  | ImageElement
  | VideoElement
  | QuizElement
  | ChallengeElement
  | OutputPreviewElement
  | FlowDiagramElement
  | CalloutElement;

export interface FlowContent {
  what: ContentElement[];
  why: ContentElement[];
  how: ContentElement[];
  practice: ContentElement[];
}

export const EMPTY_FLOW: FlowContent = { what: [], why: [], how: [], practice: [] };

// ========== LEGACY TYPES (kept for backward compat) ==========

export type BlockType =
  | 'WHY' | 'CONCEPT' | 'INTERNAL_WORKING' | 'VISUAL_FLOW' | 'REAL_WORLD'
  | 'MISTAKES' | 'DEBUGGING' | 'INTERVIEW' | 'CHALLENGE' | 'PRACTICE'
  | 'SUMMARY' | 'AI_EXPLORE';

export interface LessonBlock {
  id: string;
  lesson_id: string;
  block_type: BlockType;
  title: string;
  subtitle?: string;
  content_json: any;
  sort_order: number;
  difficulty_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimated_time: number;
  is_interactive: boolean;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  topic_id: string;
  course_id?: string;
  title: string;
  slug: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  blocks?: LessonBlock[];
  content?: string;
}

// ========== SERVICE ==========

export const courseService = {
  getCourses: async () => {
    const response = await api.get<Course[]>('/courses');
    return response.data;
  },

  getCourseDetails: async (slug: string) => {
    const response = await api.get<Course>(`/courses/${slug}`);
    return response.data;
  },

  getLesson: async (courseSlug: string, lessonSlug: string) => {
    const response = await api.get<Lesson>(`/courses/${courseSlug}/lessons/${lessonSlug}`);
    return response.data;
  },

  getTopicContent: async (courseSlug: string, topicSlug: string) => {
    const response = await api.get<Topic & { course_id: string }>(`/courses/${courseSlug}/topics/${topicSlug}`);
    return response.data;
  },

  createCourse: async (data: { title: string; description: string }) => {
    const response = await api.post<{ message: string; course: Course }>('/courses', data);
    return response.data;
  },

  updateCourse: async (id: string, data: { title?: string; description?: string; is_published?: boolean }) => {
    const response = await api.put<{ message: string; course: Course }>(`/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/courses/${id}`);
    return response.data;
  },

  createModule: async (data: { course_id: string; title: string; description?: string; sort_order?: number; is_published?: boolean }) => {
    const response = await api.post<{ message: string; module: Module }>('/courses/modules', data);
    return response.data;
  },

  updateModule: async (id: string, data: { title?: string; description?: string; sort_order?: number; is_published?: boolean }) => {
    const response = await api.put<{ message: string; module: Module }>(`/courses/modules/${id}`, data);
    return response.data;
  },

  deleteModule: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/courses/modules/${id}`);
    return response.data;
  },

  createTopic: async (data: { module_id: string; title: string; description?: string; sort_order?: number; is_published?: boolean }) => {
    const response = await api.post<{ message: string; topic: Topic }>('/courses/topics', data);
    return response.data;
  },

  updateTopic: async (id: string, data: { title?: string; description?: string; sort_order?: number; is_published?: boolean }) => {
    const response = await api.put<{ message: string; topic: Topic }>(`/courses/topics/${id}`, data);
    return response.data;
  },

  deleteTopic: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/courses/topics/${id}`);
    return response.data;
  },

  updateTopicFlow: async (id: string, flow_content: FlowContent) => {
    const response = await api.put<{ message: string; topic: Topic }>(`/courses/topics/${id}/flow`, { flow_content });
    return response.data;
  },

  // Legacy lesson methods
  createLesson: async (data: { topic_id: string; title: string; sort_order?: number; is_published?: boolean }) => {
    const response = await api.post<{ message: string; lesson: Lesson }>('/courses/lessons', data);
    return response.data;
  },

  updateLesson: async (id: string, data: { title?: string; sort_order?: number; is_published?: boolean }) => {
    const response = await api.put<{ message: string; lesson: Lesson }>(`/courses/lessons/${id}`, data);
    return response.data;
  },

  deleteLesson: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/courses/lessons/${id}`);
    return response.data;
  },

  createLessonBlock: async (data: {
    lesson_id: string; block_type: string; title: string; subtitle?: string;
    content_json: any; sort_order?: number; difficulty_level?: string;
    estimated_time?: number; is_interactive?: boolean; is_required?: boolean;
  }) => {
    const response = await api.post<{ message: string; block: LessonBlock }>('/courses/lessons/blocks', data);
    return response.data;
  },

  updateLessonBlock: async (id: string, data: {
    title?: string; subtitle?: string; content_json?: any; sort_order?: number;
    difficulty_level?: string; estimated_time?: number; is_interactive?: boolean; is_required?: boolean;
  }) => {
    const response = await api.put<{ message: string; block: LessonBlock }>(`/courses/lessons/blocks/${id}`, data);
    return response.data;
  },

  deleteLessonBlock: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/courses/lessons/blocks/${id}`);
    return response.data;
  },

  reorderLessonBlocks: async (lessonId: string, blockIds: string[]) => {
    const response = await api.post<{ message: string }>(`/courses/lessons/${lessonId}/blocks/reorder`, { blockIds });
    return response.data;
  }
};
