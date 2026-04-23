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
import Logo from '@/components/ui/logo';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/resumes', label: 'Resumes', icon: FileText },
  { href: '/tailor', label: 'AI Tailoring', icon: Wand2 },
  { href: '/cover-letters', label: 'Cover Letters', icon: PenLine },
  { href: '/applications', label: 'Applications', icon: KanbanSquare },
  { href: '/portfolio', label: 'Portfolio', icon: Globe },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ collapsed, onToggle, isMobile, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const isHiddenMobile = isMobile && !mobileOpen;

  return (
    <aside
      className={`fixed top-0 h-screen flex flex-col border-r border-[var(--grid-line-strong)] bg-[var(--bg-surface)] z-[70] transition-all duration-250 ease-in-out ${
        isMobile ? (mobileOpen ? 'left-0 shadow-2xl' : '-left-[260px]') : 'left-0'
      }`}
      style={{ width: isMobile ? '260px' : (collapsed ? '64px' : '260px') }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[var(--grid-line-strong)]">
        <Logo size={24} className="text-[var(--text-primary)]" />
        {(!collapsed || isMobile) && (
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
              onClick={() => {
                if (isMobile && onMobileClose) onMobileClose();
              }}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${
                  isActive
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-l-2 border-[var(--gradient-2)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                }
              `}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {(!collapsed || isMobile) && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-[var(--grid-line-strong)] flex flex-col gap-2">
        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={onToggle}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>
    </aside>
  );
}
