'use client';

import { useTheme } from 'next-themes';
import { User, Palette, Shield, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
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

        {/* Account Info */}
        <section className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--grid-line)]">
            <div className="p-2 bg-[var(--bg-elevated)] rounded-lg text-[var(--gradient-1)]">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-medium">Account Details</h2>
              <p className="text-xs text-[var(--text-muted)]">Manage your personal information.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium mb-1">Email Address</div>
                <div className="text-xs text-[var(--text-muted)]">{useAuthStore.getState().user?.email}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Browser Extension */}
        <section className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--grid-line)]">
            <div className="p-2 bg-[var(--bg-elevated)] rounded-lg text-[var(--gradient-3)]">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-medium">Browser Extension</h2>
              <p className="text-xs text-[var(--text-muted)]">Connect the Scribe.ai extension to your account.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Extension Key</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="password" 
                  readOnly 
                  value={useAuthStore.getState().user?.extensionToken || ''}
                  className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm font-mono text-[var(--text-secondary)] focus:outline-none w-full"
                />
                <button 
                  onClick={() => {
                    const token = useAuthStore.getState().user?.extensionToken;
                    if (token) {
                      navigator.clipboard.writeText(token);
                      alert('Extension key copied to clipboard!');
                    }
                  }}
                  className="px-4 py-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium transition-colors sm:w-auto w-full"
                >
                  Copy Key
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-2">
                Paste this key into the extension settings to enable job scraping and AI tailoring.
              </p>
            </div>
          </div>
        </section>

        {/* Session Management */}
        <section className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] mt-12">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--grid-line)]">
            <div className="p-2 bg-[var(--bg-elevated)] rounded-lg text-[var(--text-secondary)]">
              <LogOut size={20} />
            </div>
            <div>
              <h2 className="text-lg font-medium">Security & Sessions</h2>
              <p className="text-xs text-[var(--text-muted)]">Manage your active sessions and security.</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium mb-1">Log out of Scribe.ai</div>
              <div className="text-xs text-[var(--text-muted)]">End your current session.</div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors">
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
