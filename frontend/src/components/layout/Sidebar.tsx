'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  Code2, 
  Award, 
  TrendingUp, 
  RotateCcw, 
  Terminal, 
  ShieldAlert, 
  Settings, 
  User,
  Shield,
  LogOut,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  onClose?: () => void; // Used to close mobile sidebar drawer
}

export default function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { label: 'Learn', path: '/learn', icon: <BookOpen className="h-4.5 w-4.5" /> },
    { label: 'Practice', path: '/practice', icon: <Code2 className="h-4.5 w-4.5" /> },
    { label: 'Tests', path: '/tests', icon: <Award className="h-4.5 w-4.5" /> },
    { label: 'Progress', path: '/progress', icon: <TrendingUp className="h-4.5 w-4.5" /> },
    { label: 'Revision', path: '/revision', icon: <RotateCcw className="h-4.5 w-4.5" /> },
    { label: 'Interview Prep', path: '/interview-prep', icon: <Terminal className="h-4.5 w-4.5" /> },
    { 
      label: 'Admin Panel', 
      path: '/admin', 
      icon: <ShieldAlert className="h-4.5 w-4.5" />,
      isAdmin: true 
    },
    { 
      label: 'Course Builder', 
      path: '/admin/courses', 
      icon: <BookOpen className="h-4.5 w-4.5" />,
      isAdmin: true 
    },
    { label: 'Settings', path: '/settings', icon: <Settings className="h-4.5 w-4.5" /> },
  ];

  // Filter menu items by permissions / roles
  const filteredMenuItems = menuItems.filter(item => {
    if (item.isAdmin) {
      return user?.role_code === 'SUPER_ADMIN' || user?.role_code === 'ADMIN';
    }
    return true;
  });

  return (
    <aside className={cn("flex flex-col h-full w-64 border-r border-white/[0.05] bg-slate-950/40 backdrop-blur-2xl text-white select-none", className)}>
      {/* Sidebar Header / Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/[0.05]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(147,51,234,0.3)] group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:text-white transition-colors duration-300">
            Loki's Learning Hub
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {filteredMenuItems.map((item, idx) => {
          const isActive = item.path === '/admin' 
            ? pathname === '/admin' 
            : pathname === item.path || pathname?.startsWith(item.path + '/');
          return (
            <Link
              key={idx}
              href={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 group relative border border-transparent",
                isActive 
                  ? "bg-purple-600/10 text-purple-400 border-purple-500/20 shadow-md shadow-purple-500/5" 
                  : "text-slate-400 hover:text-white hover:bg-white/[0.02] border-transparent"
              )}
            >
              {/* Highlight active strip */}
              {isActive && (
                <div className="absolute left-0 top-3 h-4.5 w-1 rounded-r bg-purple-500 shadow-md shadow-purple-500" />
              )}
              <span className={cn(
                "transition-colors duration-300",
                isActive ? "text-purple-400" : "text-slate-500 group-hover:text-slate-300"
              )}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Summary */}
      {user && (
        <div className="p-4 border-t border-white/[0.05] bg-slate-950/20 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-white/[0.05] shadow-inner shrink-0">
              <User className="h-4.5 w-4.5 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-1 font-light leading-none">
                <Shield className="h-3 w-3 text-purple-400/80" />
                {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer transform active:scale-98"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
