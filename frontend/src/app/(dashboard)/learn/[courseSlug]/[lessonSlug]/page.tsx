'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { courseService, Course, Lesson } from '@/services/course';
import { toast } from 'sonner';
import { BookOpen, Loader2, ChevronLeft, ChevronRight, Menu, X, FileCode, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LessonReaderPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;
  const lessonSlug = params.lessonSlug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (courseSlug && lessonSlug) {
      fetchReaderData();
    }
  }, [courseSlug, lessonSlug]);

  const fetchReaderData = async () => {
    try {
      setLoading(true);
      const [fetchedCourse, fetchedLesson] = await Promise.all([
        courseService.getCourseDetails(courseSlug),
        courseService.getLesson(courseSlug, lessonSlug)
      ]);
      setCourse(fetchedCourse);
      setLesson(fetchedLesson);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load lesson reader data');
      router.push(`/learn/${courseSlug}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!course || !lesson) return null;

  const lessonsList = course.lessons || [];
  const currentIdx = lessonsList.findIndex(l => l.slug === lessonSlug);
  const prevLesson = currentIdx > 0 ? lessonsList[currentIdx - 1] : null;
  const nextLesson = currentIdx < lessonsList.length - 1 ? lessonsList[currentIdx + 1] : null;

  /**
   * Helper to parse and render Markdown text content cleanly
   */
  const renderMarkdownContent = (text: string) => {
    const lines = text.split('\n');
    let insideCodeBlock = false;
    let codeContent: string[] = [];
    let codeLang = 'javascript';

    return lines.map((line, idx) => {
      // Handle Code Block Fences
      if (line.trim().startsWith('```')) {
        if (insideCodeBlock) {
          insideCodeBlock = false;
          const code = codeContent.join('\n');
          codeContent = [];
          return (
            <div key={idx} className="my-6 rounded-2xl p-[1px] bg-gradient-to-r from-purple-500/20 to-indigo-500/20 shadow-lg">
              <div className="rounded-2xl bg-black/95 overflow-hidden">
                {/* Code Window Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05] bg-white/[0.02]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <FileCode className="h-3 w-3" />
                    {codeLang || 'Terminal'}
                  </span>
                </div>
                <pre className="p-4 overflow-x-auto text-[11px] text-purple-300 font-mono leading-relaxed text-left">
                  <code>{code}</code>
                </pre>
              </div>
            </div>
          );
        } else {
          insideCodeBlock = true;
          codeLang = line.trim().substring(3) || 'javascript';
          return null;
        }
      }

      // Buffer code lines
      if (insideCodeBlock) {
        codeContent.push(line);
        return null;
      }

      // Render Headings
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-snug mt-8 mb-4 border-b border-white/[0.04] pb-2">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug mt-6 mb-3">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm font-semibold text-white tracking-tight leading-snug mt-5 mb-2">
            {line.substring(4)}
          </h3>
        );
      }

      // Render Blockquotes / Info alerts
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="my-5 pl-4 border-l-2 border-purple-500 bg-purple-500/5 py-3 pr-3 rounded-r-xl text-xs text-purple-200 leading-relaxed font-light">
            {line.substring(2)}
          </blockquote>
        );
      }

      // Render Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <ul key={idx} className="list-disc list-inside pl-4 text-slate-300 text-xs leading-relaxed font-light my-2 space-y-1">
            <li>{line.trim().substring(2)}</li>
          </ul>
        );
      }

      // Skip blank lines or spacer lines
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      // Standard paragraphs
      return (
        <p key={idx} className="text-slate-300 text-xs md:text-sm leading-relaxed font-light my-3 text-left">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] border border-white/[0.05] rounded-3xl overflow-hidden bg-[#030014]/40 backdrop-blur-xl relative select-none">
      
      {/* 1. Left Collapsible sidebar outline list */}
      <aside 
        className={`flex flex-col border-r border-white/[0.05] bg-slate-950/60 backdrop-blur-2xl text-white transition-all duration-300 z-30 shrink-0 overflow-hidden ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-0 lg:border-none'
        }`}
      >
        <div className="flex h-12 items-center justify-between px-4 border-b border-white/[0.05] bg-slate-950/30">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
            Lessons Outline
          </span>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation list scroll container */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {lessonsList.map((l, index) => {
            const isActive = l.slug === lessonSlug;
            return (
              <Link
                key={l.id}
                href={`/learn/${courseSlug}/${l.slug}`}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 ${
                  isActive 
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent font-light'
                }`}
              >
                <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 border ${
                  isActive ? 'border-purple-400/30 text-purple-400 bg-purple-500/10' : 'border-slate-800 text-slate-600'
                }`}>
                  <span className="text-[9px] font-bold">{index + 1}</span>
                </div>
                <span className="truncate">{l.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.05] bg-slate-950/40">
          <Link href={`/learn/${courseSlug}`}>
            <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase tracking-wider h-8">
              ← Outline Details
            </Button>
          </Link>
        </div>
      </aside>

      {/* 2. Main Reader Content workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#030014]/25">
        {/* Top Control Bar */}
        <div className="h-12 border-b border-white/[0.05] bg-slate-950/40 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg border border-white/[0.05] hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest truncate max-w-[200px]">
              {course.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="h-3 w-3" />
              Lesson Active
            </span>
          </div>
        </div>

        {/* Dynamic Lesson Render body */}
        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 max-w-3xl mx-auto w-full relative select-text">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest leading-none block">
              COURSE LESSON {currentIdx + 1} OF {lessonsList.length}
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight leading-snug mt-1">
              {lesson.title}
            </h1>
          </div>

          {/* Render parsed contents */}
          <div className="mt-8 prose prose-invert max-w-none">
            {renderMarkdownContent(lesson.content)}
          </div>

          {/* Navigational pagination buttons at bottom */}
          <div className="flex items-center justify-between pt-10 mt-12 border-t border-white/[0.05]">
            {prevLesson ? (
              <Link href={`/learn/${courseSlug}/${prevLesson.slug}`}>
                <Button variant="outline" className="border-white/[0.05] bg-white/[0.01] text-slate-300 hover:bg-white/[0.05] hover:text-white text-xs font-semibold rounded-xl h-10 px-4 transition-all">
                  <ChevronLeft className="mr-1.5 h-4 w-4" />
                  {prevLesson.title}
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link href={`/learn/${courseSlug}/${nextLesson.slug}`}>
                <Button className="bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl h-10 px-4 border border-purple-400/20 shadow-[0_0_15px_rgba(147,51,234,0.15)] transition-all">
                  Next Lesson
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/learn">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-xl h-10 px-4 border border-emerald-400/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all">
                  Finish Path
                  <CheckCircle className="ml-1.5 h-4 w-4 animate-pulse" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
