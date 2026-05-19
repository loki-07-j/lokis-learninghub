'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { courseService, Course } from '@/services/course';
import { toast } from 'sonner';
import { BookOpen, Loader2, PlayCircle, Clock, Award, Shield, FileText, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CourseOutlinePage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseSlug) {
      fetchCourseDetails();
    }
  }, [courseSlug]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourseDetails(courseSlug);
      setCourse(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load course details');
      router.push('/learn');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!course) return null;

  const hasLessons = course.lessons && course.lessons.length > 0;
  const firstLessonSlug = hasLessons ? course.lessons![0].slug : '';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back to Catalog */}
      <Link href="/learn" className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors font-medium">
        ← Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Course Jumbotron Details */}
        <div className="lg:col-span-2 rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/20 via-white/[0.03] to-indigo-500/20 shadow-[0_0_40px_rgba(147,51,234,0.06)]">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-6 md:p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  <Award className="h-3 w-3" />
                  Syllabus Path
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold text-slate-400 bg-white/[0.02] border border-white/[0.05]">
                  <Clock className="h-3 w-3" />
                  {hasLessons ? `${course.lessons!.length * 15} mins` : 'N/A'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {course.title}
              </h1>
              <p className="text-slate-400 text-sm font-light leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Course goals cards mock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-2">
                <Shield className="h-5 w-5 text-purple-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Targeted Topics</h4>
                <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                  Focus on exact, high-legibility developer principles curated directly for production environments.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-2">
                <PlayCircle className="h-5 w-5 text-indigo-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Interactive Drills</h4>
                <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                  Every lesson comes equipped with practice codes and direct technical assessments downstream.
                </p>
              </div>
            </div>

            {hasLessons && (
              <div className="pt-6 border-t border-white/[0.04]">
                <Link href={`/learn/${course.slug}/${firstLessonSlug}`}>
                  <Button size="lg" className="w-full sm:w-auto relative group overflow-hidden bg-purple-600 hover:bg-purple-500 text-xs font-bold px-6 py-5 rounded-xl border border-purple-400/20 transition-all duration-300">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Start Syllabus Now
                      <PlayCircle className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                    </span>
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Lessons Vertical Outline List */}
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500/20 via-white/[0.03] to-purple-500/20 shadow-[0_0_40px_rgba(99,102,241,0.06)]">
          <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-indigo-400" />
                Syllabus Outline
              </h3>
              <p className="text-[10px] text-slate-500 font-light mt-0.5">Follow the chronological order to unlock achievements.</p>
            </div>

            {!hasLessons ? (
              <div className="text-center py-8 border border-dashed border-white/[0.05] rounded-2xl">
                <p className="text-slate-500 text-xs font-light">No lessons added to this course outline yet.</p>
              </div>
            ) : (
              <div className="relative border-l border-white/[0.05] ml-2.5 pl-5 space-y-5 py-2">
                {course.lessons!.map((lesson, idx) => (
                  <Link 
                    key={lesson.id}
                    href={`/learn/${course.slug}/${lesson.slug}`}
                    className="block group"
                  >
                    <div className="relative">
                      {/* Timeline dot marker */}
                      <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-slate-900 border border-white/[0.1] group-hover:bg-purple-500 group-hover:border-purple-400/30 transition-all shadow-[0_0_10px_rgba(168,85,247,0.2)]" />
                      
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">
                          LESSON {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors flex items-center gap-1.5">
                          {lesson.title}
                          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-purple-400" />
                        </h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
