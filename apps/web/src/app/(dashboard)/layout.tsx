'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import { Toaster } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 64 : 260);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--gradient-1)] to-[var(--gradient-2)] animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <Topbar 
        sidebarWidth={sidebarWidth} 
        isMobile={isMobile}
        onMobileMenuToggle={() => setMobileMenuOpen(true)}
      />
      <main className="pt-14 min-h-screen transition-all duration-250" style={{ marginLeft: sidebarWidth }}>
        <div className="p-4 md:p-6">{children}</div>
      </main>
      <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' } }} />
    </div>
  );
}
