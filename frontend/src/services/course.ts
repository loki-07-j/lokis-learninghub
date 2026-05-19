import api from './api';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  is_published: boolean;
  created_at: string;
  lessons?: Lesson[];
  _count?: {
    lessons: number;
  };
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  content: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

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

  createLesson: async (data: { course_id: string; title: string; content: string; sort_order?: number; is_published?: boolean }) => {
    const response = await api.post<{ message: string; lesson: Lesson }>('/courses/lessons', data);
    return response.data;
  },

  updateLesson: async (id: string, data: { title?: string; content?: string; sort_order?: number; is_published?: boolean }) => {
    const response = await api.put<{ message: string; lesson: Lesson }>(`/courses/lessons/${id}`, data);
    return response.data;
  },

  deleteLesson: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/courses/lessons/${id}`);
    return response.data;
  }
};
