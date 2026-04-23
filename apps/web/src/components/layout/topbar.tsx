'use client';

import { useAuthStore } from '@/stores/auth-store';
import { Moon, Sun, Bell, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface TopbarProps {
  sidebarWidth: number;
  isMobile?: boolean;
  onMobileMenuToggle?: () => void;
}

export default function Topbar({ sidebarWidth, isMobile, onMobileMenuToggle }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header
      className="fixed top-0 right-0 h-14 flex items-center justify-between px-4 md:px-6 border-b border-[var(--grid-line-strong)] bg-[var(--bg-surface-transparent)] backdrop-blur-xl z-[60] transition-all duration-250"
      style={{ left: sidebarWidth }}
    >
      <div className="flex items-center gap-3">
        {isMobile && (
          <button 
            onClick={onMobileMenuToggle}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
          >
            <Menu size={20} />
          </button>
        )}
        {/* Greeting */}
        <h2 className="font-display text-base md:text-lg tracking-tight text-[var(--text-primary)]">
          <span className="text-[var(--text-primary)]">
            {getGreeting()},{' '}
          
          <span className="font-semibold">
            {user?.name?.split(' ')[0] || 'there'}
          </span>
          </span>
        </h2>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
            title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}



        {/* User dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--gradient-2)] to-[var(--gradient-3)] flex items-center justify-center text-white text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <ChevronDown
              size={14}
              className={`text-[var(--text-muted)] transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--danger)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
