'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Lock, User, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const success = await register(name, email, password);
    setLoading(false);

    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#030014] p-4 relative overflow-hidden select-none">
      
      {/* Floating Back to Home Link */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5 font-bold z-20 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Home
      </Link>

      {/* Decorative gradient glowing mesh background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute top-1/4 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-indigo-600/5 blur-[120px]" />

      <div className="w-full max-w-sm rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-transparent shadow-2xl relative z-10 animate-fade-in">
        <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-5 md:p-6">
          <CardHeader className="space-y-1.5 text-center p-0 pb-4">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.35)]">
              <Sparkles className="h-4 w-4 text-white animate-pulse" />
            </div>
            <CardTitle className="text-lg font-extrabold tracking-tight text-white">Create Account</CardTitle>
            <CardDescription className="text-slate-400 text-[11px] font-light">
              Sign up for a student profile to start learning tracks.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3 p-0 pb-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 h-9 border-white/[0.05] bg-slate-900/40 text-white text-xs placeholder-slate-500 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-9 border-white/[0.05] bg-slate-900/40 text-white text-xs placeholder-slate-500 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-9 border-white/[0.05] bg-slate-900/40 text-white text-xs placeholder-slate-500 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 h-9 border-white/[0.05] bg-slate-900/40 text-white text-xs placeholder-slate-500 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <div className="flex flex-col space-y-4 pt-1">
              <Button
                type="submit"
                className="w-full h-9 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl border border-purple-400/10 shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300 transform active:scale-[0.98] cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
              <div className="text-center text-[11px] text-slate-400 font-light">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
