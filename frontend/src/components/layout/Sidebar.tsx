'use client';

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Brain, Award, TrendingUp,
  RotateCcw, Terminal, ShieldAlert, Settings, User, Shield,
  LogOut, Sparkles, AlertTriangle, Zap, Map,
  ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';

// ── Context to share collapsed state with children ────────────────────────────
const CollapsedCtx = createContext(false);

// ── Portal tooltip (escapes overflow:hidden on aside) ────────────────────────
function SideTooltip({ children, label }: { children: React.ReactNode; label: string }) {
  const collapsed = useContext(CollapsedCtx);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const show = useCallback(() => {
    if (!collapsed || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: r.right + 10, y: r.top + r.height / 2 });
  }, [collapsed]);

  const hide = useCallback(() => setPos(null), []);

  return (
    <div ref={ref} onMouseEnter={show} onMouseLeave={hide} className="w-full">
      {children}
      {mounted && pos && createPortal(
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -4 }}
          transition={{ duration: 0.15 }}
          style={{ position: 'fixed', left: pos.x, top: pos.y, transform: 'translateY(-50%)', zIndex: 9999 }}
          className="pointer-events-none px-2.5 py-1.5 rounded-lg bg-slate-800/95 border border-white/10 text-white text-[11px] font-semibold whitespace-nowrap shadow-xl shadow-black/40 backdrop-blur-sm"
        >
          {/* Arrow */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-800/95" />
          {label}
        </motion.div>,
        document.body
      )}
    </div>
  );
}

// ── Nav data ──────────────────────────────────────────────────────────────────
interface NavChild { label: string; path: string; icon: React.ReactNode }
interface NavItem  { label: string; path: string; icon: React.ReactNode; isAdmin?: boolean; children?: NavChild[] }

const NAV: NavItem[] = [
  { label: 'Dashboard',      path: '/dashboard',     icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { label: 'Learn',          path: '/learn',          icon: <BookOpen        className="h-[18px] w-[18px]" /> },
  {
    label: 'Practice Hub',   path: '/practice',       icon: <Brain           className="h-[18px] w-[18px]" />,
    children: [
      { label: 'Weak Areas', path: '/practice/weak-areas', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    ],
  },
  { label: 'Tests',          path: '/tests',          icon: <Award           className="h-[18px] w-[18px]" /> },
  { label: 'Progress',       path: '/progress',       icon: <TrendingUp      className="h-[18px] w-[18px]" /> },
  { label: 'Planner',        path: '/planner',        icon: <Map             className="h-[18px] w-[18px]" /> },
  { label: 'Revision',       path: '/revision',       icon: <RotateCcw       className="h-[18px] w-[18px]" /> },
  {
    label: 'Interview Prep', path: '/interview-prep', icon: <Terminal        className="h-[18px] w-[18px]" />,
    children: [
      { label: 'Rapid Fire', path: '/interview-prep/rapid-fire', icon: <Zap className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: 'Admin Panel',    path: '/admin',           icon: <ShieldAlert     className="h-[18px] w-[18px]" />, isAdmin: true,
    children: [
      { label: 'Course Builder',    path: '/admin/courses',    icon: <BookOpen    className="h-3.5 w-3.5" /> },
      { label: 'Practice Mgr',      path: '/admin/practice',   icon: <Brain       className="h-3.5 w-3.5" /> },
      { label: 'Assessment Builder', path: '/admin/tests',     icon: <Award       className="h-3.5 w-3.5" /> },
      { label: 'Revision Builder',  path: '/admin/revision',   icon: <RotateCcw   className="h-3.5 w-3.5" /> },
      { label: 'Rapid Fire Builder', path: '/admin/rapid-fire', icon: <Zap        className="h-3.5 w-3.5" /> },
    ],
  },
  { label: 'Settings',       path: '/settings',       icon: <Settings        className="h-[18px] w-[18px]" /> },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface SidebarProps {
  className?: string;
  onClose?: () => void; // mobile drawer → always expanded
}

export default function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isMobile = !!onClose; // inside mobile drawer → never collapse

  const isAdmin = user?.role_code === 'SUPER_ADMIN' || user?.role_code === 'ADMIN';

  // ── Collapsed state (persisted, desktop only) ─────────────────────────────
  const [isCollapsed, setIsCollapsed] = useState(false);
  useEffect(() => {
    if (isMobile) return;
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, [isMobile]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      if (next) setExpanded({}); // close all submenus when collapsing
      return next;
    });
  };

  const collapsed = !isMobile && isCollapsed;

  // ── Submenu expanded state ────────────────────────────────────────────────
  const visibleNav = NAV.filter(item => !item.isAdmin || isAdmin);

  const initExpanded = () => {
    const s: Record<string, boolean> = {};
    visibleNav.forEach(item => {
      if (item.children?.some(c => pathname === c.path || pathname?.startsWith(c.path + '/'))) {
        s[item.label] = true;
      }
    });
    return s;
  };
  const [expanded, setExpanded] = useState<Record<string, boolean>>(initExpanded);

  useEffect(() => {
    if (collapsed) return;
    visibleNav.forEach(item => {
      if (item.children?.some(c => pathname === c.path || pathname?.startsWith(c.path + '/'))) {
        setExpanded(prev => ({ ...prev, [item.label]: true }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, collapsed]);

  const toggle = (label: string) =>
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));

  const isActive = (path: string) =>
    path === '/admin' ? pathname === '/admin' : pathname === path || pathname?.startsWith(path + '/');

  return (
    <CollapsedCtx.Provider value={collapsed}>
      <aside
        style={{ width: collapsed ? 72 : 256 }}
        className={cn(
          'flex flex-col h-full border-r border-white/[0.05] bg-slate-950/40 backdrop-blur-2xl text-white select-none',
          'transition-[width] duration-300 ease-in-out overflow-hidden',
          className
        )}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className={cn(
          'flex h-16 items-center border-b border-white/[0.05] shrink-0 gap-3 px-4',
          collapsed ? 'justify-center px-0' : 'justify-between'
        )}>
          {/* Logo */}
          {collapsed ? (
            <SideTooltip label="Loki's Learning Hub">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:scale-105 transition-transform duration-300 shrink-0"
              >
                <Sparkles className="h-4 w-4 text-white" />
              </Link>
            </SideTooltip>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2.5 group flex-1 min-w-0" onClick={onClose}>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(147,51,234,0.3)] group-hover:scale-105 transition-transform duration-300 shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:text-white transition-colors duration-300 truncate">
                Loki's Learning Hub
              </span>
            </Link>
          )}

          {/* Collapse toggle — desktop only */}
          {!isMobile && (
            <button
              onClick={toggleCollapse}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={cn(
                'shrink-0 flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-200 cursor-pointer group',
                'text-slate-600 hover:text-purple-400 hover:bg-purple-500/[0.08] border border-transparent hover:border-purple-500/20',
                collapsed && 'mt-1'
              )}
            >
              {collapsed
                ? <ChevronsRight className="h-3.5 w-3.5" />
                : <ChevronsLeft  className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        {/* ── Nav ────────────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-0.5">
          {visibleNav.map(item => {
            const hasChildren   = !!item.children?.length;
            const isOpen        = !collapsed && (expanded[item.label] ?? false);
            const parentActive  = isActive(item.path);
            const childActive   = item.children?.some(c => isActive(c.path)) ?? false;
            const highlighted   = parentActive || childActive;

            return (
              <div key={item.label}>
                {/* ── Parent row ── */}
                <SideTooltip label={item.label}>
                  <div className={cn(
                    'flex items-center rounded-xl border border-transparent transition-all duration-200 group',
                    highlighted
                      ? 'bg-purple-600/10 border-purple-500/20 shadow-sm shadow-purple-500/5'
                      : 'hover:bg-white/[0.03] hover:border-white/[0.04]',
                    collapsed ? 'justify-center' : 'justify-between'
                  )}>
                    {/* Link part */}
                    <Link
                      href={item.path}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 text-xs font-semibold tracking-wide transition-colors duration-200 relative min-w-0',
                        collapsed ? 'justify-center w-full px-0 py-2.5' : 'flex-1',
                        highlighted ? 'text-purple-400' : 'text-slate-400 group-hover:text-white'
                      )}
                    >
                      {/* Active bar */}
                      {highlighted && !collapsed && (
                        <span className="absolute left-0 top-2.5 h-4 w-[3px] rounded-r bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                      )}
                      {/* Icon */}
                      <span className={cn(
                        'shrink-0 transition-colors duration-200',
                        highlighted ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300',
                        highlighted && collapsed && 'drop-shadow-[0_0_6px_rgba(168,85,247,0.9)]'
                      )}>
                        {item.icon}
                      </span>
                      {/* Label */}
                      {!collapsed && (
                        <span className="truncate transition-opacity duration-200">{item.label}</span>
                      )}
                    </Link>

                    {/* Chevron toggle */}
                    {hasChildren && !collapsed && (
                      <button
                        onClick={() => toggle(item.label)}
                        className={cn(
                          'shrink-0 mr-2 p-1 rounded-lg transition-all duration-200 cursor-pointer',
                          isOpen ? 'text-purple-400 hover:bg-purple-500/10' : 'text-slate-600 hover:text-slate-400 hover:bg-white/[0.03]'
                        )}
                        aria-label={isOpen ? `Collapse ${item.label}` : `Expand ${item.label}`}
                      >
                        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </motion.div>
                      </button>
                    )}
                  </div>
                </SideTooltip>

                {/* ── Children ── */}
                <AnimatePresence initial={false}>
                  {hasChildren && isOpen && (
                    <motion.div
                      key="children"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-0.5 mb-1 pl-3 border-l border-white/[0.06] space-y-0.5">
                        {item.children!.map(child => {
                          const childIsActive = isActive(child.path);
                          return (
                            <Link
                              key={child.path}
                              href={child.path}
                              onClick={onClose}
                              className={cn(
                                'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all duration-200 group',
                                childIsActive
                                  ? 'text-purple-300'
                                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'
                              )}
                            >
                              <span className={cn(
                                'shrink-0 transition-colors duration-200',
                                childIsActive ? 'text-purple-400' : 'text-slate-600 group-hover:text-slate-400'
                              )}>
                                {child.icon}
                              </span>
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        {user && (
          <div className={cn(
            'border-t border-white/[0.05] bg-slate-950/20 shrink-0',
            collapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-4 flex flex-col gap-3'
          )}>
            {collapsed ? (
              /* ── Collapsed footer: avatar + sign-out icon ── */
              <>
                <SideTooltip label={user.name}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-white/[0.05] shadow-inner cursor-default">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                </SideTooltip>
                <SideTooltip label="Sign Out">
                  <button
                    onClick={logout}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 transition-all duration-200 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </SideTooltip>
              </>
            ) : (
              /* ── Expanded footer ── */
              <>
                <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-white/[0.05] shadow-inner shrink-0">
                    <User className="h-4 w-4 text-slate-400" />
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
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        )}
      </aside>
    </CollapsedCtx.Provider>
  );
}
