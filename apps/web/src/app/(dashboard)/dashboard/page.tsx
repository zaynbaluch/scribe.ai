'use client';

import { useEffect, useState } from 'react';
import { FileText, ClipboardPaste, Upload, TrendingUp, Target, Award, BarChart3, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useApplicationStore } from '@/stores/application-store';
import dynamic from 'next/dynamic';

// Lazy load Recharts to avoid SSR issues
const AreaChart = dynamic(() => import('recharts').then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((m) => m.Area), { ssr: false });
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
    <div className="max-w-[1280px] mx-auto space-y-8 pb-12">
      {/* Onboarding Section */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#18181b]/50 backdrop-blur-xl p-8 mb-8">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gradient-1)]/10 border border-[var(--gradient-1)]/20 text-xs font-medium text-[var(--gradient-1)] mb-4">
            <TrendingUp size={14} /> Getting Started
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Welcome to Scribe.ai</h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mb-8">
            Let's get you ready for your next career move. Follow these steps to maximize your chances with AI-powered tailoring.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h4 className="font-semibold mb-1">Finish your profile</h4>
                <p className="text-sm text-[var(--text-muted)] mb-3">Add your experience, skills, and projects to train your AI.</p>
                <Link href="/profile" className="text-xs font-semibold text-[var(--gradient-1)] hover:underline">Complete Profile →</Link>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h4 className="font-semibold mb-1">Create a base resume</h4>
                <p className="text-sm text-[var(--text-muted)] mb-3">Build a master resume from your profile as a starting point.</p>
                <Link href="/resumes" className="text-xs font-semibold text-[var(--gradient-1)] hover:underline">Create Resume →</Link>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h4 className="font-semibold mb-1">Tailor & Apply</h4>
                <p className="text-sm text-[var(--text-muted)] mb-3">Paste a job description and let the AI tailor your story.</p>
                <Link href="/tailor" className="text-xs font-semibold text-[var(--gradient-1)] hover:underline">Start Tailoring →</Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--gradient-1)] opacity-[0.08] blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--gradient-2)] opacity-[0.08] blur-[80px] rounded-full pointer-events-none" />
      </section>

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
          {!stats ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)] p-5">
                <div className="animate-pulse flex flex-col gap-3">
                  <div className="w-4 h-4 bg-[var(--bg-elevated)] rounded"></div>
                  <div className="w-16 h-8 bg-[var(--bg-elevated)] rounded"></div>
                  <div className="w-24 h-3 bg-[var(--bg-elevated)] rounded"></div>
                </div>
              </div>
            ))
          ) : statCards.map((stat) => (
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
                <AreaChart data={stats.weeklyActivity}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(10, 10, 12, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
                    itemStyle={{ color: '#7C3AED' }}
                    cursor={{ stroke: '#7C3AED', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#7C3AED" 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    strokeWidth={3}
                    animationDuration={1500}
                    name="Applications" 
                  />
                </AreaChart>
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
