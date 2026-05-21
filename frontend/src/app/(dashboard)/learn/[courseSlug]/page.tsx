'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { courseService, Course } from '@/services/course';
import { toast } from 'sonner';
import {
  Loader2, PlayCircle, ArrowLeft, ChevronRight,
  CheckCircle2, Circle, BookOpen, Layers, Clock
} from 'lucide-react';

const DONE_KEY = (c: string) => `done_${c}`;
const getCompleted = (slug: string): string[] => {
  try { return JSON.parse(localStorage.getItem(DONE_KEY(slug)) || '[]'); } catch { return []; }
};

export default function CourseOutlinePage() {
  const params     = useParams();
  const router     = useRouter();
  const courseSlug = params.courseSlug as string;

  const [course, setCourse]       = useState<Course | null>(null);
  const [loading, setLoading]     = useState(true);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => { if (courseSlug) load(); }, [courseSlug]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourseDetails(courseSlug);
      setCourse(data);
      setCompleted(getCompleted(courseSlug));
    } catch {
      toast.error('Failed to load course');
      router.push('/learn');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-purple-500" />
    </div>
  );

  if (!course) return null;

  // Gather all topics to find the first one to start
  const allTopics = course.modules?.flatMap(m => m.topics || []) || [];
  const firstTopicSlug = allTopics[0]?.slug;
  const totalTopics    = allTopics.length;
  const doneCount      = allTopics.filter(t => completed.includes(t.slug)).length;
  const progressPct    = totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">

      {/* Back */}
      <Link href="/learn"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors font-semibold">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Catalog
      </Link>

      {/* Course hero */}
      <div className="rounded-3xl border border-white/[0.05] bg-slate-950/40 backdrop-blur-xl p-6 md:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                course.is_published
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              }`}>
                {course.is_published ? 'Published' : 'Draft'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-slate-400 bg-white/[0.02] border border-white/[0.05]">
                <Layers className="h-3 w-3" />
                {totalTopics} topic{totalTopics !== 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-slate-400 bg-white/[0.02] border border-white/[0.05]">
                <Clock className="h-3 w-3" />
                ~{Math.ceil(totalTopics * 10)} min
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{course.title}</h1>
            <p className="text-xs text-slate-400 font-light leading-relaxed max-w-xl">{course.description}</p>
          </div>

          {firstTopicSlug && (
            <Link href={`/learn/${courseSlug}/${firstTopicSlug}`}>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold border border-purple-400/20 shadow-md transition-all cursor-pointer whitespace-nowrap">
                {progressPct > 0 ? 'Continue' : 'Start Learning'}
                <PlayCircle className="h-4 w-4" />
              </button>
            </Link>
          )}
        </div>

        {/* Progress bar */}
        {progressPct > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-semibold">{doneCount}/{totalTopics} topics completed</span>
              <span className="text-purple-400 font-bold">{progressPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Modules & Topics */}
      {!course.modules?.length ? (
        <div className="text-center py-16 border border-dashed border-white/[0.05] rounded-3xl">
          <BookOpen className="h-8 w-8 mx-auto text-slate-700 mb-3" />
          <p className="text-slate-500 text-sm font-light">No content available yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {course.modules.map((mod, mi) => {
            const modTopics   = mod.topics || [];
            const modDone     = modTopics.filter(t => completed.includes(t.slug)).length;
            const allModDone  = modTopics.length > 0 && modDone === modTopics.length;
            return (
              <div key={mod.id} className="rounded-2xl border border-white/[0.05] bg-slate-950/30 overflow-hidden">
                {/* Module header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                      allModDone
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                    }`}>
                      {allModDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : mi + 1}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">{mod.title}</h3>
                      {mod.description && <p className="text-[10px] text-slate-500 font-light">{mod.description}</p>}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-600 font-light shrink-0 ml-4">
                    {modDone}/{modTopics.length}
                  </span>
                </div>

                {/* Topics list */}
                {modTopics.length > 0 ? (
                  <div className="divide-y divide-white/[0.03]">
                    {modTopics.map((topic) => {
                      const isDone   = completed.includes(topic.slug);
                      const hasFlow  = !!(topic.flow_content);
                      return (
                        <Link
                          key={topic.id}
                          href={`/learn/${courseSlug}/${topic.slug}`}
                          className="flex items-center justify-between px-5 py-3 group hover:bg-white/[0.02] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="shrink-0">
                              {isDone
                                ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                : <Circle className="h-4 w-4 text-slate-700 group-hover:text-slate-500 transition-colors" />
                              }
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium truncate transition-colors ${
                                  isDone ? 'text-slate-400' : 'text-slate-300 group-hover:text-white'
                                }`}>
                                  {topic.title}
                                </span>
                                {!hasFlow && (
                                  <span className="text-[8px] text-slate-700 border border-white/[0.04] px-1.5 py-0.5 rounded-full font-medium shrink-0">
                                    empty
                                  </span>
                                )}
                              </div>
                              {topic.description && (
                                <p className="text-[10px] text-slate-600 font-light truncate mt-0.5">{topic.description}</p>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-700 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="px-5 py-4 text-[10px] text-slate-700 italic font-light">No topics in this module yet.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
