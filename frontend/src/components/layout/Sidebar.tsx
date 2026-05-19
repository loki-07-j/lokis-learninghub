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
  LogOut
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  onClose?: () => void; // Used to close mobile sidebar drawer
}

export default function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Learn', path: '/learn', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Practice', path: '/practice', icon: <Code2 className="h-5 w-5" /> },
    { label: 'Tests', path: '/tests', icon: <Award className="h-5 w-5" /> },
    { label: 'Progress', path: '/progress', icon: <TrendingUp className="h-5 w-5" /> },
    { label: 'Revision', path: '/revision', icon: <RotateCcw className="h-5 w-5" /> },
    { label: 'Interview Prep', path: '/interview-prep', icon: <Terminal className="h-5 w-5" /> },
    { 
      label: 'Admin Panel', 
      path: '/admin', 
      icon: <ShieldAlert className="h-5 w-5" />,
      isAdmin: true 
    },
    { 
      label: 'Course Builder', 
      path: '/admin/courses', 
      icon: <BookOpen className="h-5 w-5" />,
      isAdmin: true 
    },
    { label: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  // Filter menu items by permissions / roles
  const filteredMenuItems = menuItems.filter(item => {
    if (item.isAdmin) {
      return user?.role_code === 'SUPER_ADMIN' || user?.role_code === 'ADMIN';
    }
    return true;
  });

  return (
    <aside className={cn("flex flex-col h-full w-64 border-r border-white/5 bg-slate-950/70 backdrop-blur-xl text-white", className)}>
      {/* Sidebar Header / Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 shadow-md">
            <span className="text-sm font-bold text-white">L</span>
          </div>
          <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Loki's Learning Hub
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
        {filteredMenuItems.map((item, idx) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
          return (
            <Link
              key={idx}
              href={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-purple-600/10 text-purple-400 border border-purple-500/20" 
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {/* Highlight active strip */}
              {isActive && (
                <div className="absolute left-0 top-3 h-5 w-1 rounded-r bg-purple-500 shadow-lg shadow-purple-500" />
              )}
              <span className={cn(
                "transition-colors",
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
        <div className="p-4 border-t border-white/5 bg-slate-950/40 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-white/5">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                <Shield className="h-3 w-3 text-purple-400/80" />
                {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
