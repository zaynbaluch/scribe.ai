'use client';

import { useEffect, useState } from 'react';
import { Globe, Copy, Check, Eye, EyeOff, Lock, Unlock, ExternalLink, Palette } from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

interface PortfolioConfig {
  id: string;
  slug: string | null;
  templateId: string;
  primaryColor: string;
  accentColor: string;
  showExperience: boolean;
  showProjects: boolean;
  showEducation: boolean;
  showSkills: boolean;
  showPublications: boolean;
  showVolunteer: boolean;
  customHeadline: string | null;
  customBio: string | null;
  isPublic: boolean;
  hasPassword: boolean;
  totalViews: number;
  lastViewedAt: string | null;
}

const TEMPLATES = [
  { id: 'modern', label: 'Modern', desc: 'Sleek, dark, accent-focused layout' },
  { id: 'classic', label: 'Classic', desc: 'Centered, traditional, serif-style layout' },
  { id: 'minimal', label: 'Minimal', desc: 'Ultra-clean, whitespace-heavy layout' },
];

const SECTIONS = [
  { key: 'showExperience', label: 'Experience' },
  { key: 'showProjects', label: 'Projects' },
  { key: 'showEducation', label: 'Education' },
  { key: 'showSkills', label: 'Skills' },
  { key: 'showPublications', label: 'Publications' },
  { key: 'showVolunteer', label: 'Volunteer Work' },
];

export default function PortfolioPage() {
  const [config, setConfig] = useState<PortfolioConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slug, setSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<PortfolioConfig>('/api/portfolio/config');
      setConfig(data);
      setSlug(data.slug || '');
    } catch (err: any) {
      toast.error(err.message || 'Failed to load portfolio config');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (updates: Partial<PortfolioConfig & { password: string }>) => {
    setIsSaving(true);
    try {
      const data = await api.put<PortfolioConfig>('/api/portfolio/config', updates);
      setConfig((prev) => prev ? { ...prev, ...data } : null);
      toast.success('Saved');
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const saveSlug = async () => {
    try {
      await api.put('/api/portfolio/slug', { slug });
      setConfig((prev) => prev ? { ...prev, slug } : null);
      toast.success('URL updated');
    } catch (err: any) {
      toast.error(err.message || 'URL update failed');
    }
  };

  const copyUrl = () => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 border-2 border-[var(--gradient-2)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-[var(--gradient-2)]" />
          <h1 className="font-display text-2xl tracking-tight">Portfolio</h1>
        </div>
        {config.slug && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Eye size={12} /> {config.totalViews} views
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Vanity URL */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <h3 className="text-sm font-semibold mb-3">Portfolio URL</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-[var(--bg-elevated)] px-3 py-2 rounded-lg border border-[var(--border-subtle)] focus-within:border-[var(--border-focus)] transition-colors">
              <span className="text-[10px] md:text-xs text-[var(--text-muted)] whitespace-nowrap hidden xs:inline">
                {typeof window !== 'undefined' ? window.location.origin.replace(/^https?:\/\//, '') : ''}/p/
              </span>
              <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="your-slug" maxLength={40}
                className="flex-1 bg-transparent text-sm font-mono focus:outline-none min-w-0" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={saveSlug}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity">
                Save
              </button>
              {config.slug && (
                <div className="flex items-center gap-2">
                  <button onClick={copyUrl}
                    className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
                    {copied ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
                  </button>
                  <a href={`/p/${config.slug}`} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <h3 className="text-sm font-semibold mb-3">Template</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TEMPLATES.map((t) => (
              <button key={t.id}
                onClick={() => saveConfig({ templateId: t.id })}
                className={`p-4 rounded-lg border text-left transition-all ${
                  config.templateId === t.id
                    ? 'border-[var(--gradient-2)] bg-[var(--gradient-2)]/5'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-focus)]'
                }`}>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Palette size={14} /> Colors</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Primary</label>
              <div className="flex items-center gap-2">
                <input type="color" value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="w-8 h-8 rounded border border-[var(--border-subtle)] cursor-pointer" />
                <input value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-xs font-mono focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Accent</label>
              <div className="flex items-center gap-2">
                <input type="color" value={config.accentColor}
                  onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                  className="w-8 h-8 rounded border border-[var(--border-subtle)] cursor-pointer" />
                <input value={config.accentColor}
                  onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-xs font-mono focus:outline-none" />
              </div>
            </div>
          </div>
          <button onClick={() => saveConfig({ primaryColor: config.primaryColor, accentColor: config.accentColor })}
            className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
            Apply Colors
          </button>
        </div>

        {/* Section Visibility */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <h3 className="text-sm font-semibold mb-3">Visible Sections</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SECTIONS.map((s) => {
              const isOn = config[s.key as keyof PortfolioConfig] as boolean;
              return (
                <button key={s.key}
                  onClick={() => saveConfig({ [s.key]: !isOn })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left text-xs transition-colors ${
                    isOn ? 'border-[var(--gradient-2)]/30 bg-[var(--gradient-2)]/5 text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}>
                  {isOn ? <Eye size={12} /> : <EyeOff size={12} />}
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Privacy */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Lock size={14} /> Privacy</h3>
          <div className="space-y-3">
            <button
              onClick={() => saveConfig({ isPublic: !config.isPublic })}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs w-full text-left transition-colors ${
                config.isPublic ? 'border-[var(--success)]/30 bg-[var(--success)]/5 text-[var(--success)]'
                  : 'border-[var(--danger)]/30 bg-[var(--danger)]/5 text-[var(--danger)]'
              }`}>
              {config.isPublic ? <Unlock size={12} /> : <Lock size={12} />}
              {config.isPublic ? 'Portfolio is public' : 'Portfolio is private'}
            </button>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                Password Protection {config.hasPassword && '(active)'}
              </label>
              <div className="flex items-center gap-2">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={config.hasPassword ? 'Enter new password or leave empty' : 'Set a password (optional)'}
                  className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-xs focus:outline-none" />
                <button onClick={() => { saveConfig({ password }); setPassword(''); }}
                  className="px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
                  {password ? 'Set' : config.hasPassword ? 'Remove' : 'Set'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Content */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <h3 className="text-sm font-semibold mb-3">Custom Content</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Headline Override</label>
              <input value={config.customHeadline || ''} onChange={(e) => setConfig({ ...config, customHeadline: e.target.value })}
                placeholder="e.g. Full-Stack Developer & Open Source Contributor"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-xs focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Bio Override</label>
              <textarea value={config.customBio || ''} onChange={(e) => setConfig({ ...config, customBio: e.target.value })}
                rows={3} placeholder="A short bio that appears on your portfolio..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-xs resize-none focus:outline-none" />
            </div>
            <button onClick={() => saveConfig({ customHeadline: config.customHeadline, customBio: config.customBio })}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity">
              Save Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
