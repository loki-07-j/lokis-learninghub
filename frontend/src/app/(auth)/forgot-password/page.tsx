'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { Loader2, Mail, ArrowLeft, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset link sent (check server logs)');
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to initiate password reset.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!submitted ? (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="mb-9">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/15 to-indigo-500/15 border border-purple-500/20 mb-5">
              <KeyRound className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-[10px] font-bold tracking-[0.32em] uppercase text-purple-400/65 mb-3">
              Password Reset
            </p>
            <h1 className="text-3xl md:text-[34px] font-extrabold tracking-[-0.03em] text-white leading-tight mb-2">
              Reset your{' '}
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                password
              </span>
            </h1>
            <p className="text-slate-500 text-sm font-light">
              Enter your email and we'll send a reset link to get you back in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button type="submit" disabled={loading}
              className="relative w-full h-12 mt-2 flex items-center justify-center gap-2 text-[13px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl border border-purple-400/25 shadow-[0_0_28px_rgba(147,51,234,0.25)] hover:shadow-[0_0_40px_rgba(147,51,234,0.4)] transition-all duration-300 group overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]">
              <span className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]" />
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending link…</>
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  Send Reset Link <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center">
            <Link href="/login"
              className="group inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-white transition-colors">
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to login
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          {/* Success icon */}
          <div className="relative w-20 h-20 mx-auto mb-7">
            <motion.div className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }} />
            <motion.div className="absolute inset-2 rounded-full border-2 border-emerald-500/30"
              animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.5 }} />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-500/25 to-teal-500/25 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.25)]">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </div>
          </div>

          <p className="text-[10px] font-bold tracking-[0.32em] uppercase text-emerald-400/70 mb-3">
            Email Sent
          </p>
          <h2 className="text-2xl md:text-[28px] font-extrabold tracking-[-0.03em] text-white leading-tight mb-3">
            Check your{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              inbox
            </span>
          </h2>
          <p className="text-slate-500 text-sm font-light max-w-xs mx-auto mb-2 leading-relaxed">
            If an account exists for that email, we've sent instructions on how to reset your password.
          </p>
          {email && (
            <p className="text-[12px] font-medium text-slate-400 mb-9">
              Sent to <span className="text-white">{email}</span>
            </p>
          )}

          <Link href="/login"
            className="inline-flex w-full items-center justify-center gap-2 h-12 px-6 text-[13px] font-bold bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.14] text-white rounded-xl transition-all group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to login
          </Link>

          <button type="button"
            onClick={() => { setSubmitted(false); setEmail(''); }}
            className="block mx-auto mt-5 text-[11px] text-slate-600 hover:text-slate-400 transition-colors">
            Use a different email
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
