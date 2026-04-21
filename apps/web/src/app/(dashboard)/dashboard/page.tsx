'use client';

import { FileText, ClipboardPaste, Upload, TrendingUp, Target, Award, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  { href: '/resumes', icon: FileText, label: 'Create Resume', desc: 'Start from your profile', gradient: 'from-[var(--gradient-1)] to-[var(--gradient-2)]' },
  { href: '/jobs', icon: ClipboardPaste, label: 'Paste a JD', desc: 'Get instant match score', gradient: 'from-[var(--gradient-2)] to-[var(--gradient-3)]' },
  { href: '/profile', icon: Upload, label: 'Import CV', desc: 'Upload PDF or DOCX', gradient: 'from-[var(--gradient-3)] to-[var(--gradient-1)]' },
];

const stats = [
  { label: 'Resumes', value: '0', icon: FileText },
  { label: 'Response Rate', value: '—', icon: TrendingUp },
  { label: 'Interviews', value: '0', icon: Target },
  { label: 'Avg ATS Score', value: '—', icon: Award },
];

export default function DashboardPage() {
  return (
    <div className="max-w-[1280px] mx-auto space-y-8">
      {/* Quick Actions */}
      <section>
        <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}
              className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)] backdrop-blur-md p-6 hover:border-[var(--border-focus)] hover:bg-[var(--bg-elevated)] transition-all duration-200 hover:-translate-y-0.5">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon size={20} className="text-white" />
              </div>
              <h4 className="font-semibold mb-1">{action.label}</h4>
              <p className="text-sm text-[var(--text-secondary)]">{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Row */}
      <section>
        <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)] backdrop-blur-md p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon size={16} className="text-[var(--text-muted)]" />
              </div>
              <p className="font-mono text-2xl font-medium">{stat.value}</p>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">Recent Activity</h3>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)] backdrop-blur-md p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 size={32} className="text-[var(--text-muted)] mb-3" />
            <p className="text-[var(--text-secondary)]">No activity yet</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Start by building your profile or creating a resume.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
