'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  FileText,
  PenLine,
  Briefcase,
  KanbanSquare,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wand2,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/resumes', label: 'Resumes', icon: FileText },
  { href: '/tailor', label: 'AI Tailoring', icon: Wand2 },
  { href: '/cover-letters', label: 'Cover Letters', icon: PenLine },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/applications', label: 'Applications', icon: KanbanSquare },
  { href: '/portfolio', label: 'Portfolio', icon: Globe },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col border-r border-[var(--grid-line-strong)] bg-[var(--bg-surface)] z-40 transition-all duration-250 ease-in-out"
      style={{ width: collapsed ? '64px' : '260px' }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[var(--grid-line-strong)]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gradient-1)] to-[var(--gradient-2)] flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0">
          S
        </div>
        {!collapsed && (
          <span className="ml-3 font-display font-bold text-lg tracking-tight whitespace-nowrap">
            Scribe.ai
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 p-2 mt-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${
                  isActive
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-l-2 border-[var(--gradient-2)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-[var(--grid-line-strong)] flex flex-col gap-2">
        {/* Plan badge */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-elevated)] ${collapsed ? 'justify-center' : ''}`}
        >
          <Sparkles size={14} className="text-[var(--gradient-2)] flex-shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-mono text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                FREE
              </span>
              <span className="text-[11px] text-[var(--gradient-2)] cursor-pointer hover:underline">
                Upgrade to Pro
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="flex items-center justify-center p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
