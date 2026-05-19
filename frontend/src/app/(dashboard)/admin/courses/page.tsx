'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { courseService, Course, Lesson } from '@/services/course';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Loader2, 
  FileText, 
  Settings, 
  Code,
  LayoutGrid,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminCoursesPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role_code === 'SUPER_ADMIN' || currentUser?.role_code === 'ADMIN';

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);

  // Creators
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // Editing Lesson form
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonSortOrder, setLessonSortOrder] = useState(0);
  const [lessonIsPublished, setLessonIsPublished] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchCourses();
    }
  }, [isAdmin]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await courseService.getCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load administrative course logs');
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle || !newCourseDesc) return;

    try {
      setSavingCourse(true);
      const response = await courseService.createCourse({
        title: newCourseTitle,
        description: newCourseDesc
      });
      toast.success(response.message);
      
      // Update local states
      setCourses(prev => [response.course, ...prev]);
      setSelectedCourse(response.course);
      setShowCourseModal(false);
      setNewCourseTitle('');
      setNewCourseDesc('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create new course path');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleUpdateCourseMetadata = async (isPublishedToggle?: boolean) => {
    if (!selectedCourse) return;

    try {
      setSavingCourse(true);
      const nextPublishedState = isPublishedToggle ? !selectedCourse.is_published : selectedCourse.is_published;
      const response = await courseService.updateCourse(selectedCourse.id, {
        title: selectedCourse.title,
        description: selectedCourse.description,
        is_published: nextPublishedState
      });
      toast.success(response.message);
      
      // Sync local lists
      setCourses(prev => prev.map(c => c.id === selectedCourse.id ? response.course : c));
      setSelectedCourse(response.course);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update course specifications');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this course? This action deletes all lessons cascadingly.')) return;

    try {
      await courseService.deleteCourse(id);
      toast.success('Course path deleted successfully');
      setCourses(prev => prev.filter(c => c.id !== id));
      if (selectedCourse?.id === id) {
        setSelectedCourse(null);
        setSelectedLesson(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete course');
    }
  };

  const handleSelectCourse = async (course: Course) => {
    try {
      setLoadingCourses(true);
      const data = await courseService.getCourseDetails(course.slug);
      setSelectedCourse(data);
      setSelectedLesson(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch full course metadata details');
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonContent(lesson.content);
    setLessonSortOrder(lesson.sort_order);
    setLessonIsPublished(lesson.is_published);
  };

  const handleAddLessonTemplate = async () => {
    if (!selectedCourse) return;

    try {
      setSavingLesson(true);
      const count = selectedCourse.lessons ? selectedCourse.lessons.length : 0;
      const response = await courseService.createLesson({
        course_id: selectedCourse.id,
        title: `New Lesson ${count + 1}`,
        content: '# New Lesson Title\n\nWrite your technical lesson markdown outline contents here!\n\n```javascript\n// Write example code snippets here\nconsole.log("Hello Sandbox!");\n```',
        sort_order: count * 10 + 10,
        is_published: false
      });
      toast.success(response.message);

      // Refresh Course Detail state
      await handleSelectCourse(selectedCourse);
      handleSelectLesson(response.lesson);
    } catch (err) {
      console.error(err);
      toast.error('Failed to append new lesson path template');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleSaveLesson = async () => {
    if (!selectedLesson || !selectedCourse) return;

    try {
      setSavingLesson(true);
      const response = await courseService.updateLesson(selectedLesson.id, {
        title: lessonTitle,
        content: lessonContent,
        sort_order: Number(lessonSortOrder),
        is_published: lessonIsPublished
      });
      toast.success(response.message);

      // Re-load course structure and select updated lesson
      await handleSelectCourse(selectedCourse);
      // Select the updated lesson returning from DB list
      const updated = response.lesson;
      setSelectedLesson(updated);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save lesson updates');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this lesson?')) return;

    try {
      setSavingLesson(true);
      await courseService.deleteLesson(id);
      toast.success('Lesson deleted successfully');
      setSelectedLesson(null);
      if (selectedCourse) {
        await handleSelectCourse(selectedCourse);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete lesson');
    } finally {
      setSavingLesson(false);
    }
  };

  /**
   * Raw Live preview renderer
   */
  const renderLiveMarkdownPreview = (text: string) => {
    const lines = text.split('\n');
    let insideCodeBlock = false;
    let codeContent: string[] = [];

    return lines.map((line, idx) => {
      if (line.trim().startsWith('```')) {
        if (insideCodeBlock) {
          insideCodeBlock = false;
          const code = codeContent.join('\n');
          codeContent = [];
          return (
            <div key={idx} className="my-4 rounded-xl p-[1px] bg-gradient-to-r from-purple-500/20 to-indigo-500/20 shadow-md">
              <div className="bg-black p-3.5 rounded-xl overflow-x-auto text-[10px] text-purple-300 font-mono leading-relaxed text-left">
                <code>{code}</code>
              </div>
            </div>
          );
        } else {
          insideCodeBlock = true;
          return null;
        }
      }

      if (insideCodeBlock) {
        codeContent.push(line);
        return null;
      }

      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-xl font-bold text-white border-b border-white/[0.04] pb-1.5 mt-5 mb-2">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-bold text-white mt-4 mb-2">{line.substring(3)}</h2>;
      }
      if (line.startsWith('> ')) {
        return <blockquote key={idx} className="my-3 pl-3 border-l border-purple-500 bg-purple-500/5 py-2 text-xs text-purple-200 rounded-r-lg font-light leading-relaxed">{line.substring(2)}</blockquote>;
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <ul key={idx} className="list-disc list-inside pl-3 text-slate-300 text-[11px] font-light leading-relaxed my-1">
            <li>{line.trim().substring(2)}</li>
          </ul>
        );
      }
      if (line.trim() === '') return <div key={idx} className="h-1.5" />;
      return <p key={idx} className="text-slate-300 text-[11px] font-light leading-relaxed my-1.5 text-left">{line}</p>;
    });
  };

  if (!isAdmin) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <BookOpen className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight">Access Denied</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            You do not possess the necessary privileges to load the administrative builder workspaces.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
            Administrative Course Builder
          </h1>
          <p className="text-xs text-slate-400 font-light mt-0.5 font-light">Author and structure syllabus courses, lessons, and code editor sandboxes.</p>
        </div>
        <Button 
          onClick={() => setShowCourseModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl border border-purple-400/20 shadow-[0_0_15px_rgba(147,51,234,0.15)] transition-all cursor-pointer shadow-md"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Create Course Path
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Column 1: Courses list overview */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-white/[0.05] bg-slate-950/40 backdrop-blur-2xl rounded-3xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <LayoutGrid className="h-4 w-4 text-purple-400" />
              Syllabus Tracks
            </h3>

            {loadingCourses && courses.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              </div>
            ) : courses.length === 0 ? (
              <p className="text-slate-500 text-[10px] text-center font-light py-4">No course paths found.</p>
            ) : (
              <div className="space-y-2">
                {courses.map((course) => {
                  const isSelected = selectedCourse?.id === course.id;
                  return (
                    <div 
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-600/10 text-purple-400 border-purple-500/20 font-bold shadow-md shadow-purple-500/5' 
                          : 'text-slate-400 hover:text-white bg-slate-900/10 hover:bg-white/[0.02] border-white/[0.04]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-semibold truncate flex-1">{course.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold shrink-0 ${
                          course.is_published 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Column 2: Selected Course Outlines & Lessons list */}
        <div className="lg:col-span-3 space-y-6">
          {selectedCourse ? (
            <div className="space-y-6">
              
              {/* Metadata specs */}
              <Card className="border-white/[0.05] bg-slate-950/40 backdrop-blur-2xl rounded-3xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <h2 className="text-base font-extrabold text-white tracking-tight">{selectedCourse.title}</h2>
                    <p className="text-[9px] text-slate-500 font-light truncate max-w-lg">Course UUID: {selectedCourse.id}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => handleUpdateCourseMetadata(true)}
                      size="sm"
                      variant="outline"
                      className={`border-white/[0.05] bg-slate-900/30 text-[10px] font-bold rounded-xl h-8 cursor-pointer ${
                        selectedCourse.is_published 
                          ? 'text-amber-400 border-amber-500/20 hover:bg-amber-500/10' 
                          : 'text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
                      }`}
                    >
                      {selectedCourse.is_published ? 'Unpublish Course' : 'Publish Course'}
                    </Button>
                    <Button 
                      onClick={() => handleDeleteCourse(selectedCourse.id)}
                      size="sm"
                      className="border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-[10px] font-bold rounded-xl h-8 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="text-xs font-light text-slate-400 leading-relaxed border-t border-white/[0.04] pt-3">
                  {selectedCourse.description}
                </div>
              </Card>

              {/* Course Outline & Editor Grid split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Outliner column */}
                <div className="lg:col-span-1">
                  <Card className="border-white/[0.05] bg-slate-950/40 backdrop-blur-2xl rounded-3xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-indigo-400" />
                        Lessons Outline
                      </h3>
                      <button 
                        onClick={handleAddLessonTemplate}
                        className="p-1 rounded-lg border border-white/[0.05] hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {!selectedCourse.lessons || selectedCourse.lessons.length === 0 ? (
                      <p className="text-slate-500 text-[10px] text-center font-light py-4">No lessons outline created.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {selectedCourse.lessons.map((lesson, idx) => {
                          const isSelected = selectedLesson?.id === lesson.id;
                          return (
                            <div 
                              key={lesson.id}
                              onClick={() => handleSelectLesson(lesson)}
                              className={`p-3 rounded-xl border text-xs flex justify-between items-center transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-bold' 
                                  : 'text-slate-400 hover:text-white bg-slate-900/10 hover:bg-white/[0.01] border-white/[0.04]'
                              }`}
                            >
                              <span className="truncate flex-1">
                                {idx + 1}. {lesson.title}
                              </span>
                              <span className={`ml-2 text-[8px] font-bold ${
                                lesson.is_published ? 'text-emerald-400' : 'text-amber-400'
                              }`}>
                                {lesson.is_published ? 'Live' : 'Draft'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </div>

                {/* Split Dual-Pane Editor workspace */}
                <div className="lg:col-span-2">
                  {selectedLesson ? (
                    <Card className="border-white/[0.05] bg-slate-950/40 backdrop-blur-2xl rounded-3xl p-5 space-y-4">
                      
                      {/* Editor Controls bar */}
                      <div className="flex justify-between items-center border-b border-white/[0.04] pb-3">
                        <div className="space-y-0.5">
                          <h3 className="text-xs font-bold text-white flex items-center gap-1">
                            <Edit3 className="h-3.5 w-3.5 text-purple-400" />
                            Lesson Editor
                          </h3>
                          <p className="text-[9px] text-slate-500 font-light truncate max-w-[200px]">ID: {selectedLesson.id}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={handleSaveLesson}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold rounded-xl h-8 cursor-pointer border border-indigo-400/20 shadow-md shadow-indigo-600/5"
                          >
                            Save Updates
                          </Button>
                          <Button 
                            onClick={() => handleDeleteLesson(selectedLesson.id)}
                            size="sm"
                            className="border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-[10px] font-bold rounded-xl h-8 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Fields grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Lesson Title</label>
                          <input 
                            type="text"
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/[0.05] text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sort Weight</label>
                          <input 
                            type="number"
                            value={lessonSortOrder}
                            onChange={(e) => setLessonSortOrder(Number(e.target.value))}
                            className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-white/[0.05] text-white focus:outline-none focus:border-purple-500/50 transition-all"
                          />
                        </div>

                        <div className="flex items-center gap-2 mt-4 ml-2">
                          <input 
                            type="checkbox"
                            id="is_published_chk"
                            checked={lessonIsPublished}
                            onChange={(e) => setLessonIsPublished(e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-white/[0.1] bg-slate-900 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <label htmlFor="is_published_chk" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide cursor-pointer select-none">
                            Publish Lesson
                          </label>
                        </div>
                      </div>

                      {/* Double Pane Workspace: Markdown Editor vs Real-time Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/[0.04]">
                        
                        {/* Write Markdown Pane */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            <span>Markdown Editor</span>
                            <Code className="h-3.5 w-3.5 text-slate-500" />
                          </div>
                          <textarea
                            value={lessonContent}
                            onChange={(e) => setLessonContent(e.target.value)}
                            className="w-full h-80 p-3 rounded-xl bg-slate-900 border border-white/[0.05] text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-[11px] leading-relaxed resize-none"
                            placeholder="Write raw markdown here..."
                          />
                        </div>

                        {/* Real-time HTML preview pane */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            <span>Real-time Preview</span>
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                          </div>
                          <div className="w-full h-80 p-3 rounded-xl bg-slate-950/40 border border-white/[0.05] overflow-y-auto text-left prose prose-invert max-w-none">
                            {lessonContent ? (
                              renderLiveMarkdownPreview(lessonContent)
                            ) : (
                              <p className="text-slate-500 text-[10px] font-light italic">Start typing markdown to preview...</p>
                            )}
                          </div>
                        </div>

                      </div>

                    </Card>
                  ) : (
                    <Card className="border-white/[0.05] bg-slate-950/40 backdrop-blur-2xl rounded-3xl p-6 text-center space-y-2">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.02] border border-white/[0.05] text-slate-500">
                        <FileText className="h-5 w-5" />
                      </div>
                      <p className="text-slate-400 text-xs font-semibold">No lesson active</p>
                      <p className="text-[10px] text-slate-500 font-light leading-relaxed max-w-xs mx-auto">
                        Select a lesson from the outline to load the markdown dual-pane editor workspace, or create a new lesson.
                      </p>
                    </Card>
                  )}
                </div>

              </div>

            </div>
          ) : (
            <Card className="border-white/[0.05] bg-slate-950/40 backdrop-blur-2xl rounded-3xl p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.05] text-slate-500 shadow-inner">
                <BookOpen className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">No course selected</h3>
                <p className="text-[11px] text-slate-400 font-light leading-relaxed max-w-md mx-auto">
                  Choose a syllabus track from the sidebar catalog to edit metadata specifications, organize lessons, or compose technical articles.
                </p>
              </div>
            </Card>
          )}
        </div>

      </div>

      {/* Course Creator modal card layer */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl p-[1px] bg-gradient-to-b from-purple-500/20 via-white/[0.03] to-indigo-500/20 shadow-2xl">
            <Card className="border-none bg-[#030014]/90 backdrop-blur-2xl rounded-3xl p-5">
              <div className="flex justify-between items-center pb-4 border-b border-white/[0.05] mb-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Initialize Course Track</h3>
                <button 
                  onClick={() => setShowCourseModal(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Course Title</label>
                  <input 
                    type="text"
                    required
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/[0.05] text-white focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="e.g. PostgreSQL Core Optimizations"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Syllabus Overview Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={newCourseDesc}
                    onChange={(e) => setNewCourseDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/[0.05] text-white focus:outline-none focus:border-purple-500/50 transition-all resize-none leading-relaxed"
                    placeholder="Write a compelling overview of what topics, techniques, and structures will be covered..."
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    type="submit"
                    className="w-full h-10 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl border border-purple-400/20 transition-all cursor-pointer shadow-md shadow-purple-600/10"
                    disabled={savingCourse}
                  >
                    {savingCourse ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Create Course Path'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
}
