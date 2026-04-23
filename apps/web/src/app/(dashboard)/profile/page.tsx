'use client';

import { useEffect, useState, useRef } from 'react';
import { useProfileStore } from '@/stores/profile-store';
import { toast } from 'sonner';
import { Upload, Camera, Check, Edit2 } from 'lucide-react';
import CompletenessBar from '@/components/profile/completeness-bar';
import SectionEditor from '@/components/profile/section-editor';
import SkillTags from '@/components/profile/skill-tags';
import ImportModal from '@/components/profile/import-modal';
import BulletsEditor from '@/components/profile/bullets-editor';
import CustomDatePicker from '@/components/ui/custom-date-picker';
import Image from 'next/image';

export default function ProfilePage() {
  const { profile, isLoading, fetch, update } = useProfileStore();
  const [importOpen, setImportOpen] = useState(false);
  const [localProfile, setLocalProfile] = useState<any>(null);
  
  // Edit mode toggles
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);

  // File input ref for image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { 
    if (profile && !localProfile) {
      setLocalProfile(profile); 
    }
  }, [profile, localProfile]);

  const saveProfile = async (dataToSave: any) => {
    try {
      await update(dataToSave);
      toast.success('Changes saved successfully');
    } catch (err) {
      toast.error('Failed to save changes');
    }
  };

  const savePersonalInfo = () => {
    saveProfile({
      name: localProfile.name,
      email: localProfile.email,
      headline: localProfile.headline,
      location: localProfile.location,
      phone: localProfile.phone,
      website: localProfile.website,
      linkedin: localProfile.linkedin,
      github: localProfile.github,
      summary: localProfile.summary,
      imageUrl: localProfile.imageUrl,
    });
    setEditingPersonalInfo(false);
  };

  const saveSkills = () => {
    saveProfile({ skills: localProfile.skills });
    setEditingSkills(false);
  };

  const saveSection = (section: string, items: any[]) => {
    const updated = { ...localProfile, [section]: items };
    setLocalProfile(updated);
    saveProfile({ [section]: items });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const updated = { ...localProfile, imageUrl: base64String };
      setLocalProfile(updated);
      saveProfile({ imageUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleImported = (parsed: any) => {
    console.log('Frontend received parsed data:', parsed);
    const merged: any = {};
    if (parsed.name) merged.name = parsed.name;
    if (parsed.summary) merged.summary = parsed.summary;
    if (parsed.headline) merged.headline = parsed.headline;
    if (parsed.phone) merged.phone = parsed.phone;
    if (parsed.email) merged.email = parsed.email;
    if (parsed.linkedin) merged.linkedin = parsed.linkedin;
    if (parsed.github) merged.github = parsed.github;
    if (parsed.website) merged.website = parsed.website;
    if (parsed.experiences?.length) merged.experiences = parsed.experiences;
    if (parsed.education?.length) merged.education = parsed.education;
    if (parsed.skills?.length) merged.skills = parsed.skills;
    if (parsed.projects?.length) merged.projects = parsed.projects;
    if (parsed.certifications?.length) merged.certifications = parsed.certifications;

    update(merged).then(() => {
      setLocalProfile(prev => ({ ...prev, ...merged }));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-tight">Your Profile</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Manage your personal data for tailored resumes.
          </p>
        </div>
        <button onClick={() => setImportOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] text-sm font-medium hover:bg-[var(--bg-elevated)] transition-all sm:w-auto w-full">
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
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Personal Details</h3>
          {!editingPersonalInfo ? (
            <button onClick={() => setEditingPersonalInfo(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
              <Edit2 size={12} /> Edit
            </button>
          ) : (
            <button onClick={savePersonalInfo}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--gradient-2)] text-white hover:opacity-90 transition-colors">
              <Check size={12} /> Save
            </button>
          )}
        </div>

        {editingPersonalInfo ? (
          <div className="space-y-4 pt-2 border-t border-[var(--grid-line)]">
            {/* Image Upload */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] overflow-hidden flex items-center justify-center flex-shrink-0 group">
                {localProfile.imageUrl ? (
                  <Image src={localProfile.imageUrl} alt="Profile" fill className="object-cover" />
                ) : (
                  <Camera size={24} className="text-[var(--text-muted)] group-hover:opacity-0 transition-opacity" />
                )}
                <div onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload size={16} className="text-white" />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                <p className="font-medium text-[var(--text-secondary)] mb-0.5">Profile Picture</p>
                <p>Square image, max 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name" value={localProfile.name || ''} onChange={(v) => setLocalProfile({ ...localProfile, name: v })} placeholder="e.g. Zain Abbas" />
              <InputField label="Email" value={localProfile.email || ''} onChange={(v) => setLocalProfile({ ...localProfile, email: v })} placeholder="you@example.com" type="email" />
              <InputField label="Headline" value={localProfile.headline || ''} onChange={(v) => setLocalProfile({ ...localProfile, headline: v })} placeholder="e.g. Full-Stack Developer" />
              <InputField label="Location" value={localProfile.location || ''} onChange={(v) => setLocalProfile({ ...localProfile, location: v })} placeholder="e.g. Islamabad, Pakistan" />
              <InputField label="Phone" value={localProfile.phone || ''} onChange={(v) => setLocalProfile({ ...localProfile, phone: v })} placeholder="+92 300 1234567" type="tel" />
              <InputField label="Website" value={localProfile.website || ''} onChange={(v) => setLocalProfile({ ...localProfile, website: v })} placeholder="https://yoursite.dev" type="url" />
              <InputField label="LinkedIn" value={localProfile.linkedin || ''} onChange={(v) => setLocalProfile({ ...localProfile, linkedin: v })} placeholder="https://linkedin.com/in/you" type="url" />
              <InputField label="GitHub" value={localProfile.github || ''} onChange={(v) => setLocalProfile({ ...localProfile, github: v })} placeholder="https://github.com/you" type="url" />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] mt-4">
              <div>
                <p className="text-xs font-medium text-[var(--text-secondary)]">Portfolio QR Code</p>
                <p className="text-[10px] text-[var(--text-muted)]">Include a high-definition QR code linking to your portfolio on non-minimal templates.</p>
              </div>
              <button 
                onClick={() => setLocalProfile({ ...localProfile, showQrCode: localProfile.showQrCode === false ? true : false })}
                className={`w-10 h-5 rounded-full transition-colors relative ${localProfile.showQrCode !== false ? 'bg-[var(--gradient-2)]' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localProfile.showQrCode !== false ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5 mt-4">Summary</label>
              <textarea value={localProfile.summary || ''} onChange={(e) => setLocalProfile({ ...localProfile, summary: e.target.value })}
                placeholder="Write a brief professional summary..." rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all resize-none" />
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-[var(--grid-line)] flex items-start gap-4">
            {localProfile.imageUrl && (
              <div className="w-16 h-16 rounded-full overflow-hidden border border-[var(--border-subtle)] flex-shrink-0 relative">
                 <Image src={localProfile.imageUrl} alt="Profile" fill className="object-cover" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">{localProfile.name || 'Your Name'}</p>
              {localProfile.headline && (
                <p className="text-[11px] text-[var(--gradient-2)] font-medium mt-0.5">{localProfile.headline}</p>
              )}
              <p className="text-xs text-[var(--text-muted)] mt-2 max-w-2xl leading-relaxed">{localProfile.summary || 'No summary added.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Experience */}
      <SectionEditor
        title="Experience"
        items={localProfile.experiences || []}
        onUpdate={(items) => saveSection('experiences', items)}
        getItemTitle={(item) => item.title || 'Untitled Role'}
        getItemSubtitle={(item) => [item.company, item.location].filter(Boolean).join(' · ')}
        createEmpty={() => ({ title: '', company: '', location: '', startDate: '', endDate: '', current: false, bullets: [''], description: '' })}
        renderForm={(item, onChange) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Job Title" value={item.title} onChange={(v) => onChange({ title: v })} placeholder="e.g. Software Engineer" />
            <InputField label="Company" value={item.company} onChange={(v) => onChange({ company: v })} placeholder="e.g. TechCorp" />
            <InputField label="Location" value={item.location || ''} onChange={(v) => onChange({ location: v })} placeholder="e.g. Remote" />
            <div className="grid grid-cols-2 gap-4">
              <CustomDatePicker label="Start Date" value={item.startDate || ''} onChange={(v) => onChange({ startDate: v })} mode="month" />
              {!item.current && <CustomDatePicker label="End Date" value={item.endDate || ''} onChange={(v) => onChange({ endDate: v })} mode="month" />}
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
            <div className="col-span-full mt-2">
              <BulletsEditor 
                label="Key Achievements (Bullets)" 
                bullets={item.bullets || []} 
                onChange={(bullets) => onChange({ bullets })} 
              />
            </div>
          </div>
        )}
      />

      {/* Education */}
      <SectionEditor
        title="Education"
        items={localProfile.education || []}
        onUpdate={(items) => saveSection('education', items)}
        getItemTitle={(item) => item.degree || 'Untitled Degree'}
        getItemSubtitle={(item) => item.institution}
        createEmpty={() => ({ institution: '', degree: '', field: '', startDate: '', endDate: '' })}
        renderForm={(item, onChange) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Institution" value={item.institution} onChange={(v) => onChange({ institution: v })} placeholder="e.g. NUST" />
            <InputField label="Degree" value={item.degree} onChange={(v) => onChange({ degree: v })} placeholder="e.g. BS Computer Science" />
            <InputField label="Field of Study" value={item.field || ''} onChange={(v) => onChange({ field: v })} placeholder="e.g. Computer Science" />
            <InputField label="GPA" value={item.gpa || ''} onChange={(v) => onChange({ gpa: v })} placeholder="e.g. 3.8/4.0" />
            <CustomDatePicker label="Start Date" value={item.startDate || ''} onChange={(v) => onChange({ startDate: v })} mode="month" />
            <CustomDatePicker label="End Date" value={item.endDate || ''} onChange={(v) => onChange({ endDate: v })} mode="month" />
          </div>
        )}
      />

      {/* Skills */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)] backdrop-blur-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Skills</h3>
          {!editingSkills ? (
            <button onClick={() => setEditingSkills(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
              <Edit2 size={12} /> Edit
            </button>
          ) : (
            <button onClick={saveSkills}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--gradient-2)] text-white hover:opacity-90 transition-colors">
              <Check size={12} /> Save
            </button>
          )}
        </div>
        
        {editingSkills ? (
          <div className="pt-2 border-t border-[var(--grid-line)]">
            <SkillTags
              skills={localProfile.skills || []}
              onChange={(skills) => setLocalProfile({ ...localProfile, skills })}
            />
          </div>
        ) : (
          <div className="pt-2 border-t border-[var(--grid-line)] flex flex-wrap gap-1.5">
            {localProfile.skills?.length > 0 ? (
              localProfile.skills.map((s: any, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                  {s.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-[var(--text-muted)]">No skills added.</span>
            )}
          </div>
        )}
      </div>

      {/* Projects */}
      <SectionEditor
        title="Projects"
        items={localProfile.projects || []}
        onUpdate={(items) => saveSection('projects', items)}
        getItemTitle={(item) => item.name || 'Untitled Project'}
        getItemSubtitle={(item) => item.techStack?.join(', ') || ''}
        createEmpty={() => ({ name: '', description: '', url: '', techStack: [], bullets: [] })}
        renderForm={(item, onChange) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Project Name" value={item.name} onChange={(v) => onChange({ name: v })} placeholder="e.g. Scribe.ai" />
            <InputField label="URL" value={item.url || ''} onChange={(v) => onChange({ url: v })} placeholder="https://github.com/..." />

            <div className="col-span-full">
              <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Tech Stack (comma separated)</label>
              <input type="text" value={item.techStack?.join(', ') || ''} onChange={(e) => onChange({ techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="React, Node.js, Typescript"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all" />
            </div>
            <div className="col-span-full">
              <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={item.description || ''} onChange={(e) => onChange({ description: e.target.value })} rows={3} placeholder="What does this project do?"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all resize-none" />
            </div>
            <div className="col-span-full mt-2">
              <BulletsEditor 
                label="Key Features (Bullets)" 
                bullets={item.bullets || []} 
                onChange={(bullets) => onChange({ bullets })} 
              />
            </div>
          </div>
        )}
      />

      {/* Certifications */}
      <SectionEditor
        title="Certifications"
        items={localProfile.certifications || []}
        onUpdate={(items) => saveSection('certifications', items)}
        getItemTitle={(item) => item.name || 'Untitled Certification'}
        getItemSubtitle={(item) => item.issuer}
        createEmpty={() => ({ name: '', issuer: '', date: '', url: '' })}
        renderForm={(item, onChange) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Name" value={item.name} onChange={(v) => onChange({ name: v })} placeholder="e.g. AWS Certified Developer" />
            <InputField label="Issuer" value={item.issuer} onChange={(v) => onChange({ issuer: v })} placeholder="e.g. Amazon Web Services" />
            <CustomDatePicker label="Date" value={item.date || ''} onChange={(v) => onChange({ date: v })} mode="date" />
            <InputField label="URL" value={item.url || ''} onChange={(v) => onChange({ url: v })} placeholder="Verification link" />
          </div>
        )}
      />

      {/* Publications */}
      <SectionEditor
        title="Publications"
        items={localProfile.publications || []}
        onUpdate={(items) => saveSection('publications', items)}
        getItemTitle={(item) => item.title || 'Untitled Publication'}
        getItemSubtitle={(item) => item.venue}
        createEmpty={() => ({ title: '', venue: '', date: '', url: '' })}
        renderForm={(item, onChange) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Title" value={item.title} onChange={(v) => onChange({ title: v })} placeholder="e.g. Multi-agent AI systems" />
            <InputField label="Publisher" value={item.venue} onChange={(v) => onChange({ venue: v })} placeholder="e.g. IEEE" />
            <CustomDatePicker label="Date" value={item.date || ''} onChange={(v) => onChange({ date: v })} mode="date" />
            <InputField label="URL" value={item.url || ''} onChange={(v) => onChange({ url: v })} placeholder="Paper link" />
          </div>
        )}
      />

      {/* Volunteer Work */}
      <SectionEditor
        title="Volunteer Work"
        items={localProfile.volunteerWork || []}
        onUpdate={(items) => saveSection('volunteerWork', items)}
        getItemTitle={(item) => item.role || 'Untitled Role'}
        getItemSubtitle={(item) => item.organization}
        createEmpty={() => ({ role: '', organization: '', startDate: '', endDate: '' })}
        renderForm={(item, onChange) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Role" value={item.role} onChange={(v) => onChange({ role: v })} placeholder="e.g. Mentor" />
            <InputField label="Organization" value={item.organization} onChange={(v) => onChange({ organization: v })} placeholder="e.g. Red Cross" />
            <CustomDatePicker label="Start Date" value={item.startDate || ''} onChange={(v) => onChange({ startDate: v })} mode="month" />
            <CustomDatePicker label="End Date" value={item.endDate || ''} onChange={(v) => onChange({ endDate: v })} mode="month" />
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
