'use client';

import { useTheme } from 'next-themes';
import { User, Palette, Shield, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="max-w-[800px] mx-auto py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-tight mb-2">Settings</h1>
        <p className="text-[var(--text-muted)] text-sm">Manage your account preferences and application settings.</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <section className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--grid-line)]">
            <div className="p-2 bg-[var(--bg-elevated)] rounded-lg text-[var(--gradient-2)]">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="text-lg font-medium">Appearance</h2>
              <p className="text-xs text-[var(--text-muted)]">Customize how Scribe.ai looks on your device.</p>
            </div>
          </div>

          <div className="flex gap-4">
            {['light', 'dark', 'system'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium capitalize transition-all ${
                  theme === t 
                    ? 'border-[var(--gradient-2)] bg-[var(--gradient-2)]/10 text-[var(--text-primary)]' 
                    : 'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* Account Info placeholder */}
        <section className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] opacity-70">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--grid-line)]">
            <div className="p-2 bg-[var(--bg-elevated)] rounded-lg text-[var(--text-muted)]">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-medium">Account Details</h2>
              <p className="text-xs text-[var(--text-muted)]">Manage your personal information.</p>
            </div>
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            Account management features coming soon.
          </div>
        </section>

        {/* Danger Zone */}
        <section className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 mt-12">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-500/20">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-medium text-red-500">Danger Zone</h2>
              <p className="text-xs text-red-500/70">Irreversible and destructive actions.</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium mb-1">Log out of Scribe.ai</div>
              <div className="text-xs text-[var(--text-muted)]">End your current session.</div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-red-500 hover:bg-red-500/10 transition-colors">
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
