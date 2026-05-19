'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Shield, User, BookOpen } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2 border-purple-500/10 bg-slate-950/45 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-400 text-xs font-semibold uppercase tracking-wider">Welcome Back</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-white">Hi, {user.name}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ready to level up your technical knowledge today? Explore lessons, practice active coding questions, or test your skills against our advanced evaluations.
            </p>
          </CardContent>
          <CardFooter className="gap-4">
            <Button className="bg-purple-600 hover:bg-purple-500 text-xs font-medium">
              <BookOpen className="mr-2 h-4 w-4" />
              Resume Learning
            </Button>
          </CardFooter>
        </Card>

        {/* Profile Card */}
        <Card className="border-slate-800 bg-slate-950/45 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-400" />
              Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm flex-1">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500">Email</span>
              <span className="text-slate-300 font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500">System Role</span>
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                <Shield className="mr-1 h-3 w-3" />
                {user.role}
              </span>
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-slate-600">
            Account Status: Active
          </CardFooter>
        </Card>
      </div>

      {/* Feature Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-white/5 bg-slate-950/20 p-6 rounded-2xl flex flex-col justify-between h-40 hover:border-purple-500/25 transition-colors">
          <div>
            <h3 className="text-white font-bold mb-1">Learn Module</h3>
            <p className="text-xs text-slate-500">Browse dynamic, AI-structured technical articles and documentation.</p>
          </div>
          <span className="text-xs text-purple-400 font-semibold flex items-center">Coming in Phase 7</span>
        </div>

        <div className="border border-white/5 bg-slate-950/20 p-6 rounded-2xl flex flex-col justify-between h-40 hover:border-indigo-500/25 transition-colors">
          <div>
            <h3 className="text-white font-bold mb-1">Practice Module</h3>
            <p className="text-xs text-slate-500">MCQs and custom logic tests to challenge and reinforce concepts.</p>
          </div>
          <span className="text-xs text-indigo-400 font-semibold flex items-center">Coming in Phase 9</span>
        </div>

        <div className="border border-white/5 bg-slate-950/20 p-6 rounded-2xl flex flex-col justify-between h-40 hover:border-emerald-500/25 transition-colors">
          <div>
            <h3 className="text-white font-bold mb-1">Interview Prep</h3>
            <p className="text-xs text-slate-500">Rapid-fire questions and tech quizzes optimized for job hunting.</p>
          </div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center">Coming in Phase 12</span>
        </div>
      </div>
    </div>
  );
}
