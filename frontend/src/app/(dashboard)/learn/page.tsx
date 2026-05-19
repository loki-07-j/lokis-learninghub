'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { courseService, Course } from '@/services/course';
import { toast } from 'sonner';
import { BookOpen, Loader2, Sparkles, LayoutGrid, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LearnCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load courses syllabus catalog');
    } finally {
      setLoading(false);
    }
  };

  const getTopicTag = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('postgres') || t.includes('sql') || t.includes('db') || t.includes('database')) {
      return { label: 'Database Systems', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    }
    if (t.includes('react') || t.includes('next') || t.includes('frontend') || t.includes('css') || t.includes('html')) {
      return { label: 'Frontend Architecture', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
    }
    return { label: 'Core Engineering', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-purple-400" />
          Technical Syllabus Catalog
        </h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">Explore structured, modern developer courses complete with interactive sandbox content.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/[0.05] rounded-3xl bg-slate-900/10 max-w-xl mx-auto space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.05] text-slate-500">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-sm font-semibold">No courses published yet</p>
            <p className="text-xs text-slate-500 font-light leading-relaxed">
              Administrative architects have not released any syllabus courses at this time. Check back soon for PostgreSQL, System Architecture, and React tracks!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const tag = getTopicTag(course.title);
            return (
              <div 
                key={course.id}
                className="rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent hover:from-purple-500/20 hover:to-indigo-500/20 shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer"
              >
                <Card className="border-none bg-slate-950/45 backdrop-blur-xl rounded-3xl p-5 flex flex-col justify-between h-full min-h-[220px]">
                  <CardHeader className="p-0 pb-3">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${tag.color}`}>
                        {tag.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-light flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-purple-400/80" />
                        {course._count?.lessons || 0} Lessons
                      </span>
                    </div>
                    <CardTitle className="text-base font-extrabold text-white tracking-tight leading-tight group-hover:text-purple-300 transition-colors">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 my-2">
                    <CardDescription className="text-slate-400 text-xs font-light leading-relaxed line-clamp-3">
                      {course.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="p-0 pt-4 border-t border-white/[0.04] mt-3">
                    {course._count && course._count.lessons > 0 ? (
                      <Link 
                        href={`/learn/${course.slug}`} 
                        className="w-full"
                      >
                        <Button className="w-full h-9 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl border border-purple-400/20 transition-all duration-300">
                          <span className="flex items-center justify-center gap-1.5">
                            Start Syllabus <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full h-9 bg-slate-900 border border-white/[0.04] text-slate-500 text-xs font-semibold rounded-xl cursor-not-allowed">
                        Syllabus Under Construction
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
