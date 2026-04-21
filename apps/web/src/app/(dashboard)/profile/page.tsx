'use client';

import { useEffect, useState, useCallback } from 'react';
import { useProfileStore } from '@/stores/profile-store';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import CompletenessBar from '@/components/profile/completeness-bar';
import SectionEditor from '@/components/profile/section-editor';
import SkillTags from '@/components/profile/skill-tags';
import ImportModal from '@/components/profile/import-modal';

export default function ProfilePage() {
  const { profile, isLoading, isSaving, fetch, update } = useProfileStore();
  const [importOpen, setImportOpen] = useState(false);
  const [localProfile, setLocalProfile] = useState<any>(null);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { if (profile) setLocalProfile(profile); }, [profile]);

  const debouncedSave = useDebounce((data: any) => {
    update(data).then(() => toast.success('Changes saved')).catch(() => toast.error('Failed to save'));
  }, 1500);

  const updateField = (field: string, value: any) => {
    const updated = { ...localProfile, [field]: value };
    setLocalProfile(updated);
    debouncedSave({ [field]: value });
  };

  const updateSection = (section: string, items: any[]) => {
    const updated = { ...localProfile, [section]: items };
    setLocalProfile(updated);
    debouncedSave({ [section]: items });
  };

  const handleImported = (parsed: any) => {
    // Merge imported data with existing profile
    const merged: any = {};
    if (parsed.summary) merged.summary = parsed.summary;
    if (parsed.headline) merged.headline = parsed.headline;
    if (parsed.phone) merged.phone = parsed.phone;
    if (parsed.experiences?.length) merged.experiences = parsed.experiences;
    if (parsed.education?.length) merged.education = parsed.education;
    if (parsed.skills?.length) merged.skills = parsed.skills;
    if (parsed.projects?.length) merged.projects = parsed.projects;
    if (parsed.certifications?.length) merged.certifications = parsed.certifications;

    update(merged).then(() => {
      toast.success('Imported data saved to profile');
      fetch();
    }).catch(() => toast.error('Failed to save imported data'));
  };

  if (isLoading || !localProfile) {
    return (
      <div className="max-w-[900px] mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-[var(--bg-elevated)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tight">Your Profile</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {isSaving ? 'Saving...' : 'All changes are auto-saved'}
          </p>
        </div>
        <button onClick={() => setImportOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-sm font-medium hover:bg-[var(--bg-elevated)] hover:border-[var(--border-focus)] transition-all">
          <Upload size={16} />
          Import Resume
        </button>
      </div>

      {/* Completeness */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)] backdrop-blur-md p-5">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Profile Completeness</p>
        <CompletenessBar value={localProfile.completeness || 0} />
      </div>

      {/* Personal Info */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)] backdrop-blur-md p-5 space-y-4">
        <h3 className="font-semibold text-sm">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Headline</label>
            <input type="text" value={localProfile.headline || ''} onChange={(e) => updateField('headline', e.target.value)}
              placeholder="e.g. Full-Stack Developer"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Location</label>
            <input type="text" value={localProfile.location || ''} onChange={(e) => updateField('location', e.target.value)}
              placeholder="e.g. Islamabad, Pakistan"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Phone</label>
            <input type="tel" value={localProfile.phone || ''} onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+92 300 1234567"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Website</label>
            <input type="url" value={localProfile.website || ''} onChange={(e) => updateField('website', e.target.value)}
              placeholder="https://yoursite.dev"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">LinkedIn</label>
            <input type="url" value={localProfile.linkedin || ''} onChange={(e) => updateField('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/you"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">GitHub</label>
            <input type="url" value={localProfile.github || ''} onChange={(e) => updateField('github', e.target.value)}
              placeholder="https://github.com/you"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Summary</label>
          <textarea value={localProfile.summary || ''} onChange={(e) => updateField('summary', e.target.value)}
            placeholder="Write a brief professional summary..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all resize-none" />
        </div>
      </div>

      {/* Experience */}
      <SectionEditor
        title="Experience"
        items={localProfile.experiences || []}
        onUpdate={(items) => updateSection('experiences', items)}
        getItemTitle={(item) => item.title || 'Untitled Role'}
        getItemSubtitle={(item) => [item.company, item.location].filter(Boolean).join(' · ')}
        createEmpty={() => ({ title: '', company: '', location: '', startDate: '', endDate: '', current: false, bullets: [''], description: '' })}
        renderForm={(item, onChange) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Job Title" value={item.title} onChange={(v) => onChange({ title: v })} placeholder="e.g. Software Engineer" />
            <InputField label="Company" value={item.company} onChange={(v) => onChange({ company: v })} placeholder="e.g. TechCorp" />
            <InputField label="Location" value={item.location || ''} onChange={(v) => onChange({ location: v })} placeholder="e.g. Remote" />
            <div className="flex items-center gap-4">
              <InputField label="Start Date" value={item.startDate?.slice(0, 7) || ''} onChange={(v) => onChange({ startDate: v })} type="month" />
              {!item.current && <InputField label="End Date" value={item.endDate?.slice(0, 7) || ''} onChange={(v) => onChange({ endDate: v })} type="month" />}
            </div>
            <label className="col-span-full flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={item.current || false} onChange={(e) => onChange({ current: e.target.checked, endDate: e.target.checked ? null : item.endDate })} className="rounded" />
              Currently working here
            </label>
            <div className="col-span-full">
              <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Description / Key Achievements</label>
              <textarea value={item.description || ''} onChange={(e) => onChange({ description: e.target.value })} rows={3} placeholder="Describe your role and key achievements..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all resize-none" />
            </div>
          </div>
        )}
      />

      {/* Education */}
      <SectionEditor
        title="Education"
        items={localProfile.education || []}
        onUpdate={(items) => updateSection('education', items)}
        getItemTitle={(item) => item.degree || 'Untitled Degree'}
        getItemSubtitle={(item) => item.institution}
        createEmpty={() => ({ institution: '', degree: '', field: '', startDate: '', endDate: '' })}
        renderForm={(item, onChange) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Institution" value={item.institution} onChange={(v) => onChange({ institution: v })} placeholder="e.g. NUST" />
            <InputField label="Degree" value={item.degree} onChange={(v) => onChange({ degree: v })} placeholder="e.g. BS Computer Science" />
            <InputField label="Field of Study" value={item.field || ''} onChange={(v) => onChange({ field: v })} placeholder="e.g. Computer Science" />
            <InputField label="GPA" value={item.gpa || ''} onChange={(v) => onChange({ gpa: v })} placeholder="e.g. 3.8/4.0" />
            <InputField label="Start Date" value={item.startDate?.slice(0, 7) || ''} onChange={(v) => onChange({ startDate: v })} type="month" />
            <InputField label="End Date" value={item.endDate?.slice(0, 7) || ''} onChange={(v) => onChange({ endDate: v })} type="month" />
          </div>
        )}
      />

      {/* Skills */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)] backdrop-blur-md p-5">
        <h3 className="font-semibold text-sm mb-4">Skills</h3>
        <SkillTags
          skills={localProfile.skills || []}
          onChange={(skills) => updateSection('skills', skills)}
        />
      </div>

      {/* Projects */}
      <SectionEditor
        title="Projects"
        items={localProfile.projects || []}
        onUpdate={(items) => updateSection('projects', items)}
        getItemTitle={(item) => item.name || 'Untitled Project'}
        getItemSubtitle={(item) => item.techStack?.join(', ') || ''}
        createEmpty={() => ({ name: '', description: '', url: '', techStack: [], bullets: [] })}
        renderForm={(item, onChange) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Project Name" value={item.name} onChange={(v) => onChange({ name: v })} placeholder="e.g. Scribe.ai" />
            <InputField label="URL" value={item.url || ''} onChange={(v) => onChange({ url: v })} placeholder="https://github.com/..." />
            <div className="col-span-full">
              <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={item.description || ''} onChange={(e) => onChange({ description: e.target.value })} rows={3} placeholder="What does this project do?"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all resize-none" />
            </div>
          </div>
        )}
      />

      {/* Certifications */}
      <SectionEditor
        title="Certifications"
        items={localProfile.certifications || []}
        onUpdate={(items) => updateSection('certifications', items)}
        getItemTitle={(item) => item.name || 'Untitled Certification'}
        getItemSubtitle={(item) => item.issuer}
        createEmpty={() => ({ name: '', issuer: '', date: '', url: '' })}
        renderForm={(item, onChange) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Certification Name" value={item.name} onChange={(v) => onChange({ name: v })} placeholder="e.g. AWS Solutions Architect" />
            <InputField label="Issuer" value={item.issuer} onChange={(v) => onChange({ issuer: v })} placeholder="e.g. Amazon" />
            <InputField label="Date" value={item.date?.slice(0, 7) || ''} onChange={(v) => onChange({ date: v })} type="month" />
            <InputField label="URL" value={item.url || ''} onChange={(v) => onChange({ url: v })} placeholder="Credential URL" />
          </div>
        )}
      />

      {/* Import Modal */}
      <ImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} onImported={handleImported} />
    </div>
  );
}

// ─── Reusable input ─────────────────────────────────────────────────────────

function InputField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all" />
    </div>
  );
}
