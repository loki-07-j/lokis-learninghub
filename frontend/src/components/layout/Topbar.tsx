'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Sun, ChevronRight, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    if (!pathname || pathname === '/') return [{ label: 'Home', href: '/' }];
    
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((seg, index) => {
      const label = seg
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      const href = '/' + segments.slice(0, index + 1).join('/');
      return { label, href };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="flex h-16 w-full items-center justify-between px-6 border-b border-white/5 bg-slate-950/45 backdrop-blur-xl text-white z-20">
      {/* Mobile Menu trigger & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden text-slate-400 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Dynamic Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 font-medium">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-600" />}
                <span className={isLast ? "text-purple-400 font-semibold" : "hover:text-slate-300 transition-colors cursor-pointer"}>
                  {crumb.label}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3">
        {/* Mock Search Trigger */}
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-full">
          <Search className="h-4 w-4" />
        </Button>

        {/* Mock Notifications */}
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-full relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-purple-500" />
        </Button>

        {/* Theme Indicator (Locking in Premium Dark Mode) */}
        <Button variant="ghost" size="icon" className="text-purple-400 hover:text-purple-300 rounded-full bg-purple-500/10 border border-purple-500/20">
          <Moon className="h-4 w-4 fill-purple-400/20 animate-pulse" />
        </Button>
      </div>
    </header>
  );
}
