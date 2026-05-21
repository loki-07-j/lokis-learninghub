'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) router.push('/dashboard');
  };

  return (
    <>
      {/* Header */}
      <div className="mb-9">
        <p className="text-[10px] font-bold tracking-[0.32em] uppercase text-purple-400/65 mb-3">
          Welcome Back
        </p>
        <h1 className="text-3xl md:text-[34px] font-extrabold tracking-[-0.03em] text-white leading-tight mb-2">
          Sign in to{' '}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
            continue
          </span>
        </h1>
        <p className="text-slate-500 text-sm font-light">
          Unlock interactive training sandboxes and pick up where you left off.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.22em] mb-2">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-purple-400 transition-colors" />
            <input
              id="email" type="email" autoComplete="email" placeholder="name@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-white/[0.02] border border-white/[0.07] rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] focus:shadow-[0_0_0_4px_rgba(168,85,247,0.08)] transition-all"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.22em]">
              Password
            </label>
            <Link href="/forgot-password"
              className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors tracking-tight">
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-purple-400 transition-colors" />
            <input
              id="password" type={showPwd ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-11 pr-11 bg-white/[0.02] border border-white/[0.07] rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] focus:shadow-[0_0_0_4px_rgba(168,85,247,0.08)] transition-all"
              required
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="relative w-full h-12 mt-2 flex items-center justify-center gap-2 text-[13px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl border border-purple-400/25 shadow-[0_0_28px_rgba(147,51,234,0.25)] hover:shadow-[0_0_40px_rgba(147,51,234,0.4)] transition-all duration-300 group overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]">
          <span className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]" />
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
          ) : (
            <span className="relative z-10 flex items-center gap-2">
              Sign In <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[10px] font-medium text-slate-700 tracking-wider uppercase">or</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      {/* Footer */}
      <p className="text-center text-[13px] text-slate-500 font-light">
        Don't have an account?{' '}
        <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
          Sign up
        </Link>
      </p>
    </>
  );
}
