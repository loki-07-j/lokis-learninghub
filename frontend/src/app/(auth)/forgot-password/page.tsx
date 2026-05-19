'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset link sent (check server logs)');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to initiate password reset.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030014] p-4 relative overflow-hidden select-none">
      
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
      <div className="absolute top-1/4 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-purple-600/5 blur-[120px]" />

      <div className="w-full max-w-md rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-transparent shadow-2xl relative z-10 animate-fade-in">
        <Card className="border-none bg-slate-950/45 backdrop-blur-2xl rounded-3xl p-6 md:p-8">
          <CardHeader className="space-y-2 text-center p-0 pb-6">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(147,51,234,0.35)]">
              <Sparkles className="h-4.5 w-4.5 text-white animate-pulse" />
            </div>
            <CardTitle className="text-xl font-extrabold tracking-tight text-white">Reset Password</CardTitle>
            <CardDescription className="text-slate-400 text-xs font-light">
              We will send a password reset link to your email address.
            </CardDescription>
          </CardHeader>
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 p-0 pb-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-11 border-white/[0.05] bg-slate-900/40 text-white text-xs placeholder-slate-500 rounded-xl focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <div className="flex flex-col space-y-4 pt-1">
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold rounded-xl border border-purple-400/10 shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300 transform active:scale-[0.98] cursor-pointer"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
                <Link
                  href="/login"
                  className="flex items-center text-xs text-slate-400 hover:text-slate-300 transition-colors font-semibold self-center"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Back to login
                </Link>
              </div>
            </form>
          ) : (
            <CardContent className="space-y-6 text-center py-4 p-0">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Check your email</h3>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  If the email exists, we've sent instructions on how to reset your password.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.05] bg-slate-900/60 hover:bg-slate-900 text-xs font-bold h-11 px-4 text-white shadow transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
