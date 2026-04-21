'use client';

import { useEffect, useState } from 'react';
import { FileText, ClipboardPaste, Upload, TrendingUp, Target, Award, BarChart3, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useApplicationStore } from '@/stores/application-store';
import dynamic from 'next/dynamic';

// Lazy load Recharts to avoid SSR issues
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });

const quickActions = [
  { href: '/resumes', icon: FileText, label: 'Create Resume', desc: 'Start from your profile', gradient: 'from-[var(--gradient-1)] to-[var(--gradient-2)]' },
  { href: '/tailor', icon: Wand2, label: 'AI Tailoring', desc: 'Match & tailor for a JD', gradient: 'from-[var(--gradient-2)] to-[var(--gradient-3)]' },
  { href: '/profile', icon: Upload, label: 'Import CV', desc: 'Upload PDF or DOCX', gradient: 'from-[var(--gradient-3)] to-[var(--gradient-1)]' },
];

export default function DashboardPage() {
  const { stats, fetchStats } = useApplicationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { fetchStats(); setMounted(true); }, [fetchStats]);

  const statCards = [
    { label: 'Resumes', value: stats?.resumeCount ?? '—', icon: FileText },
    { label: 'Response Rate', value: stats ? `${stats.responseRate}%` : '—', icon: TrendingUp },
    { label: 'Interviews', value: stats?.interviews ?? '0', icon: Target },
    { label: 'Avg ATS Score', value: stats?.avgAtsScore ?? '—', icon: Award },
  ];

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
          {statCards.map((stat) => (
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

      {/* Activity Chart */}
      <section>
        <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">Weekly Activity</h3>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)] backdrop-blur-md p-6">
          {mounted && stats?.weeklyActivity && stats.weeklyActivity.some((w) => w.count > 0) ? (
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyActivity}>
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="count" fill="var(--gradient-2)" radius={[4, 4, 0, 0]} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart3 size={32} className="text-[var(--text-muted)] mb-3" />
              <p className="text-[var(--text-secondary)]">No activity yet</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Start by building your profile or creating a resume.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
