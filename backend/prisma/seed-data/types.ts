// Shared type definitions for all seed data files

export interface BlockData {
  block_type: string;
  title: string;
  subtitle?: string;
  content_json: Record<string, any>;
  sort_order: number;
  difficulty_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimated_time: number; // minutes
  is_interactive: boolean;
  is_required: boolean;
}

export interface LessonData {
  title: string;
  slug: string;
  sort_order: number;
  blocks: BlockData[];
}

export interface QuestionData {
  question_type: 'MCQ' | 'MULTI_SELECT' | 'DEBUG_BASED' | 'OUTPUT_PREDICTION' | 'SCENARIO_ANALYSIS' | 'ARCHITECTURE_REASONING' | 'PROBLEM_SOLVING' | 'CODE_COMPLETION' | 'FLOW_SEQUENCING';
  thinking_type: 'LOGIC' | 'DEBUGGING' | 'PERFORMANCE' | 'ARCHITECTURE' | 'SECURITY' | 'REAL_WORLD' | 'INTERVIEW';
  difficulty_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  title: string;
  question_text: string;
  scenario_context?: string;
  options_json?: Record<string, any>;
  correct_answer: any;
  expected_reasoning?: string;
  explanation: string;
  complexity_score: number; // 1-5
  estimated_time: number; // seconds
}

export interface TopicData {
  title: string;
  slug: string;
  description: string;
  sort_order: number;
  lessons: LessonData[];
  questions: QuestionData[];
}

export interface ModuleData {
  title: string;
  slug: string;
  description: string;
  sort_order: number;
  topics: TopicData[];
}

export interface CourseData {
  title: string;
  slug: string;
  description: string;
  modules: ModuleData[];
}
