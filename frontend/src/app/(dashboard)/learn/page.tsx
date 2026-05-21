'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { courseService, Course } from '@/services/course';
import { toast } from 'sonner';
import {
  BookOpen, Loader2, LayoutGrid, ChevronRight, Search,
  List, Grid3x3, Layers, CheckCircle2, PlayCircle, Sparkles
} from 'lucide-react';

type ViewMode = 'list' | 'grid';

const DONE_KEY = (c: string) => `done_${c}`;
const getDoneSlugs = (slug: string): string[] => {
  try { return JSON.parse(localStorage.getItem(DONE_KEY(slug)) || '[]'); } catch { return []; }
};

const TAG_FOR_TITLE = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('postgres') || t.includes('sql') || t.includes('db') || t.includes('database')) {
    return { label: 'Database', cls: 'text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/20', accent: 'bg-emerald-500' };
  }
  if (t.includes('react') || t.includes('next') || t.includes('frontend') || t.includes('tailwind')) {
    return { label: 'Frontend', cls: 'text-purple-400 bg-purple-500/[0.08] border-purple-500/20', accent: 'bg-purple-500' };
  }
  if (t.includes('css') || t.includes('html')) {
    return { label: 'Web Basics', cls: 'text-sky-400 bg-sky-500/[0.08] border-sky-500/20', accent: 'bg-sky-500' };
  }
  if (t.includes('node') || t.includes('express') || t.includes('api') || t.includes('backend')) {
    return { label: 'Backend', cls: 'text-amber-400 bg-amber-500/[0.08] border-amber-500/20', accent: 'bg-amber-500' };
  }
  if (t.includes('git') || t.includes('github')) {
    return { label: 'Tooling', cls: 'text-rose-400 bg-rose-500/[0.08] border-rose-500/20', accent: 'bg-rose-500' };
  }
  if (t.includes('seo')) {
    return { label: 'Growth', cls: 'text-indigo-400 bg-indigo-500/[0.08] border-indigo-500/20', accent: 'bg-indigo-500' };
  }
  return { label: 'Engineering', cls: 'text-slate-300 bg-white/[0.04] border-white/[0.08]', accent: 'bg-slate-400' };
};

export default function LearnCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [view, setView]       = useState<ViewMode>('list');
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCourses();
    const saved = localStorage.getItem('learn_catalog_view') as ViewMode | null;
    if (saved === 'grid' || saved === 'list') setView(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('learn_catalog_view', view);
  }, [view]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourses();
      setCourses(data);
      // Read progress for each
      const map: Record<string, number> = {};
      data.forEach(c => {
        const done = getDoneSlugs(c.slug).length;
        const total = c._count?.lessons || 0;
        map[c.slug] = total > 0 ? Math.round((done / total) * 100) : 0;
      });
      setProgressMap(map);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      TAG_FOR_TITLE(c.title).label.toLowerCase().includes(q)
    );
  }, [courses, search]);

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-400" />
            Syllabus Catalog
          </h1>
          <p className="text-[11px] text-slate-500 font-light mt-0.5">
            {courses.length} course{courses.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Search + view toggle */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses…"
              className="w-56 md:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white/[0.02] border border-white/[0.05] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/30 transition-colors"
            />
          </div>
          <div className="flex border border-white/[0.06] rounded-lg overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                view === 'list' ? 'bg-white/[0.05] text-white' : 'text-slate-500 hover:text-white hover:bg-white/[0.02]'
              }`}
              title="List view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView('grid')}
              className={`flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold transition-all cursor-pointer border-l border-white/[0.06] ${
                view === 'grid' ? 'bg-white/[0.05] text-white' : 'text-slate-500 hover:text-white hover:bg-white/[0.02]'
              }`}
              title="Grid view"
            >
              <Grid3x3 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── States ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-purple-500" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/[0.05] rounded-3xl bg-slate-900/10 max-w-xl mx-auto space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.05] text-slate-500">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <p className="text-slate-400 text-sm font-semibold">No courses published yet</p>
            <p className="text-xs text-slate-600 font-light leading-relaxed max-w-sm mx-auto">
              Course content is being prepared. Check back soon.
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-xs">
          No courses match <span className="text-slate-300 font-semibold">"{search}"</span>.
        </div>
      ) : view === 'list' ? (
        // ═══ LIST VIEW ═══════════════════════════════════════════════
        <div className="rounded-2xl border border-white/[0.05] bg-slate-950/30 backdrop-blur-xl overflow-hidden divide-y divide-white/[0.04]">
          {filtered.map(course => {
            const tag = TAG_FOR_TITLE(course.title);
            const pct = progressMap[course.slug] || 0;
            const topics = course._count?.lessons || 0;
            const empty = topics === 0;
            return (
              <Link
                key={course.id}
                href={empty ? '#' : `/learn/${course.slug}`}
                onClick={(e) => empty && e.preventDefault()}
                className={`group flex items-center gap-4 px-4 py-3 transition-all ${
                  empty ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.02] cursor-pointer'
                }`}
              >
                {/* Color accent */}
                <div className={`w-1 h-9 rounded-full ${tag.accent} opacity-80 shrink-0`} />

                {/* Title + tag */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${tag.cls}`}>
                      {tag.label}
                    </span>
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-purple-200 transition-colors">
                      {course.title}
                    </h3>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-3 shrink-0 text-[10px] font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {topics} topic{topics !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Progress */}
                <div className="hidden lg:flex items-center gap-2 shrink-0 w-32">
                  <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold font-mono w-8 text-right ${pct > 0 ? 'text-purple-300' : 'text-slate-700'}`}>
                    {pct}%
                  </span>
                </div>

                {/* Action */}
                {empty ? (
                  <span className="shrink-0 text-[10px] text-slate-700 italic px-2 py-1">empty</span>
                ) : pct === 100 ? (
                  <span className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Done
                  </span>
                ) : (
                  <span className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600/10 border border-purple-500/20 text-[11px] font-semibold text-purple-300 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-400/30 transition-all">
                    {pct > 0 ? 'Continue' : 'Start'}
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        // ═══ GRID VIEW (compact) ════════════════════════════════════
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(course => {
            const tag = TAG_FOR_TITLE(course.title);
            const pct = progressMap[course.slug] || 0;
            const topics = course._count?.lessons || 0;
            const empty = topics === 0;
            return (
              <Link
                key={course.id}
                href={empty ? '#' : `/learn/${course.slug}`}
                onClick={(e) => empty && e.preventDefault()}
                className={`group flex flex-col gap-2 p-3.5 rounded-2xl border bg-slate-950/30 backdrop-blur-xl transition-all ${
                  empty
                    ? 'opacity-50 cursor-not-allowed border-white/[0.04]'
                    : 'border-white/[0.05] hover:border-purple-500/25 hover:bg-white/[0.02] hover:-translate-y-0.5 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${tag.cls} shrink-0`}>
                    {tag.label}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] text-slate-600 font-mono">
                    <Layers className="h-2.5 w-2.5" />
                    {topics}
                  </div>
                </div>

                <h3 className="text-[13px] font-bold text-white leading-tight line-clamp-2 group-hover:text-purple-200 transition-colors min-h-[36px]">
                  {course.title}
                </h3>

                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/[0.04]">
                  <div className="flex-1 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-[10px] font-bold font-mono ${pct > 0 ? 'text-purple-300' : 'text-slate-700'}`}>
                    {pct}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {empty ? (
                    <span className="text-[10px] text-slate-700 italic">Coming soon</span>
                  ) : pct === 100 ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Completed
                    </span>
                  ) : pct > 0 ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-300">
                      <PlayCircle className="h-3 w-3" /> Continue
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 group-hover:text-purple-300 transition-colors">
                      <Sparkles className="h-3 w-3" /> Start
                    </span>
                  )}
                  <ChevronRight className="h-3 w-3 text-slate-700 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
