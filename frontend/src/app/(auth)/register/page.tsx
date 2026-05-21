'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  bar: string;
}

function evaluatePassword(pwd: string): PasswordStrength {
  if (!pwd) return { score: 0, label: 'Empty',  color: 'text-slate-700', bar: 'bg-slate-800' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
  const variants = [
    { label: 'Too short',   color: 'text-red-400',     bar: 'bg-red-500'     },
    { label: 'Weak',        color: 'text-orange-400',  bar: 'bg-orange-500'  },
    { label: 'Fair',        color: 'text-amber-400',   bar: 'bg-amber-500'   },
    { label: 'Strong',      color: 'text-emerald-400', bar: 'bg-emerald-500' },
    { label: 'Bulletproof', color: 'text-teal-400',    bar: 'bg-teal-400'    },
  ] as const;
  return { score: score as 0 | 1 | 2 | 3 | 4, ...variants[score] };
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => evaluatePassword(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: { preventDefault(): void }) => {
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
    if (success) router.push('/dashboard');
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-bold tracking-[0.32em] uppercase text-purple-400/65 mb-3">
          New Account
        </p>
        <h1 className="text-3xl md:text-[34px] font-extrabold tracking-[-0.03em] text-white leading-tight mb-2">
          Create your{' '}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
            profile
          </span>
        </h1>
        <p className="text-slate-500 text-sm font-light">
          Build a learner profile in seconds — no credit card needed.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.22em] mb-1.5">
            Full Name
          </label>
          <div className="relative group">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-purple-400 transition-colors" />
            <input
              id="name" type="text" autoComplete="name" placeholder="John Doe"
              value={name} onChange={(e) => setName(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-white/[0.02] border border-white/[0.07] rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] focus:shadow-[0_0_0_4px_rgba(168,85,247,0.08)] transition-all"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.22em] mb-1.5">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-purple-400 transition-colors" />
            <input
              id="email" type="email" autoComplete="email" placeholder="name@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-white/[0.02] border border-white/[0.07] rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] focus:shadow-[0_0_0_4px_rgba(168,85,247,0.08)] transition-all"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.22em] mb-1.5">
            Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-purple-400 transition-colors" />
            <input
              id="password" type={showPwd ? 'text' : 'password'} autoComplete="new-password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-11 pr-11 bg-white/[0.02] border border-white/[0.07] rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] focus:shadow-[0_0_0_4px_rgba(168,85,247,0.08)] transition-all"
              required
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Strength meter */}
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-1.5 mb-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex-1 h-1 rounded-full bg-slate-800/80 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${i < strength.score ? strength.bar : 'bg-transparent'}`}
                      style={{ width: i < strength.score ? '100%' : '0%' }}
                    />
                  </div>
                ))}
              </div>
              <p className={`text-[10px] font-bold tracking-wide ${strength.color}`}>{strength.label}</p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.22em] mb-1.5">
            Confirm Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-purple-400 transition-colors" />
            <input
              id="confirmPassword" type={showPwd ? 'text' : 'password'} autoComplete="new-password" placeholder="••••••••"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full h-11 pl-11 pr-11 bg-white/[0.02] border rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.04] transition-all ${
                passwordsMismatch
                  ? 'border-red-500/40 focus:border-red-500/60 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]'
                  : passwordsMatch
                  ? 'border-emerald-500/30 focus:border-emerald-500/50 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]'
                  : 'border-white/[0.07] focus:border-purple-500/40 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.08)]'
              }`}
              required
            />
            {passwordsMatch && (
              <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
            )}
          </div>
          {passwordsMismatch && (
            <p className="mt-1.5 text-[11px] text-red-400 font-medium">Passwords don't match</p>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="relative w-full h-12 mt-1 flex items-center justify-center gap-2 text-[13px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl border border-purple-400/25 shadow-[0_0_28px_rgba(147,51,234,0.25)] hover:shadow-[0_0_40px_rgba(147,51,234,0.4)] transition-all duration-300 group overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]">
          <span className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]" />
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
          ) : (
            <span className="relative z-10 flex items-center gap-2">
              Create Account <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-[13px] text-slate-500 font-light mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </>
  );
}
