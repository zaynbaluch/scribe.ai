'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import CustomDatePicker from '@/components/ui/custom-date-picker';
import BulletsEditor from '@/components/profile/bullets-editor';

interface ContentEditorProps {
  profile: any;
  onChange: (updatedProfile: any) => void;
}

export default function ContentEditor({ profile, onChange }: ContentEditorProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('basic');

  const updateProfile = (path: string, value: any) => {
    const newProfile = { ...profile };
    const keys = path.split('.');
    let current = newProfile;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onChange(newProfile);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <button 
          onClick={() => toggleSection('basic')}
          className="w-full px-4 py-3 flex items-center justify-between bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <span className="text-sm font-medium">Basic Information</span>
          {expandedSection === 'basic' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {expandedSection === 'basic' && (
          <div className="p-4 space-y-4 bg-[var(--bg-base)]">
            <div>
              <label className="block text-[10px] text-[var(--text-muted)] uppercase mb-1 font-semibold">Headline</label>
              <input 
                type="text" 
                value={profile.headline || ''} 
                onChange={(e) => updateProfile('headline', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--gradient-2)]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-muted)] uppercase mb-1 font-semibold">Professional Summary</label>
              <textarea 
                value={profile.summary || ''} 
                onChange={(e) => updateProfile('summary', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--gradient-2)] resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <button 
          onClick={() => toggleSection('experience')}
          className="w-full px-4 py-3 flex items-center justify-between bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <span className="text-sm font-medium">Work Experience</span>
          {expandedSection === 'experience' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {expandedSection === 'experience' && (
          <div className="p-4 space-y-8 bg-[var(--bg-base)]">
            {profile.experiences?.map((exp: any, idx: number) => (
              <div key={idx} className="space-y-5 p-4 rounded-xl border border-[var(--grid-line)] bg-[var(--bg-surface)]">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <input 
                      type="text" 
                      value={exp.title || ''} 
                      placeholder="Title"
                      onChange={(e) => {
                        const newExps = [...profile.experiences];
                        newExps[idx].title = e.target.value;
                        updateProfile('experiences', newExps);
                      }}
                      className="w-full bg-transparent font-semibold text-base text-[var(--text-primary)] focus:outline-none"
                    />
                    <input 
                      type="text" 
                      value={exp.company || ''} 
                      placeholder="Company"
                      onChange={(e) => {
                        const newExps = [...profile.experiences];
                        newExps[idx].company = e.target.value;
                        updateProfile('experiences', newExps);
                      }}
                      className="w-full bg-transparent text-sm text-[var(--text-muted)] focus:outline-none"
                    />
                    <div className="flex flex-col gap-4 pt-1">
                      <CustomDatePicker 
                        label="From" 
                        value={exp.startDate || ''} 
                        onChange={(v) => {
                          const newExps = [...profile.experiences];
                          newExps[idx].startDate = v;
                          updateProfile('experiences', newExps);
                        }} 
                      />
                      <CustomDatePicker 
                        label="To" 
                        value={exp.endDate || ''} 
                        onChange={(v) => {
                          const newExps = [...profile.experiences];
                          newExps[idx].endDate = v;
                          updateProfile('experiences', newExps);
                        }} 
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase mb-1 font-semibold">Description</label>
                  <textarea 
                    value={exp.description || ''} 
                    onChange={(e) => {
                      const newExps = [...profile.experiences];
                      newExps[idx].description = e.target.value;
                      updateProfile('experiences', newExps);
                    }}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--gradient-2)] resize-none"
                  />
                </div>
                <div className="pt-2">
                  <BulletsEditor 
                    bullets={exp.bullets || []} 
                    onChange={(bullets) => {
                      const newExps = [...profile.experiences];
                      newExps[idx].bullets = bullets;
                      updateProfile('experiences', newExps);
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <button 
          onClick={() => toggleSection('projects')}
          className="w-full px-4 py-3 flex items-center justify-between bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <span className="text-sm font-medium">Projects</span>
          {expandedSection === 'projects' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {expandedSection === 'projects' && (
          <div className="p-4 space-y-8 bg-[var(--bg-base)]">
            {profile.projects?.map((proj: any, idx: number) => (
              <div key={idx} className="space-y-5 p-4 rounded-xl border border-[var(--grid-line)] bg-[var(--bg-surface)]">
                <div className="flex justify-between items-center gap-3">
                  <input 
                    type="text" 
                    value={proj.name || ''} 
                    placeholder="Project Name"
                    onChange={(e) => {
                      const newProjs = [...profile.projects];
                      newProjs[idx] = { ...newProjs[idx], name: e.target.value };
                      updateProfile('projects', newProjs);
                    }}
                    className="flex-1 bg-transparent font-semibold text-base text-[var(--text-primary)] focus:outline-none"
                  />
                  <button 
                    onClick={() => {
                      const newProjs = [...profile.projects];
                      newProjs[idx] = { ...newProjs[idx], visible: proj.visible === false };
                      updateProfile('projects', newProjs);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${proj.visible === false ? 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]' : 'text-[var(--gradient-2)] hover:bg-[var(--gradient-2)]/10'}`}
                    title={proj.visible === false ? "Hidden in resume" : "Visible in resume"}
                  >
                    {proj.visible === false ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase mb-1 font-semibold">Technologies / Stack</label>
                  <input 
                    type="text" 
                    value={proj.techStack?.join(', ') || ''} 
                    placeholder="e.g. React, Node.js, PostgreSQL"
                    onChange={(e) => {
                      const newProjs = [...profile.projects];
                      newProjs[idx].techStack = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      updateProfile('projects', newProjs);
                    }}
                    className="w-full bg-transparent text-sm text-[var(--text-primary)] focus:outline-none border-b border-[var(--grid-line)] pb-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase mb-1 font-semibold">Project Description</label>
                  <textarea 
                    value={proj.description || ''} 
                    placeholder="Briefly describe the project..."
                    rows={2}
                    onChange={(e) => {
                      const newProjs = [...profile.projects];
                      newProjs[idx].description = e.target.value;
                      updateProfile('projects', newProjs);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--gradient-2)] resize-none"
                  />
                </div>
                <div className="pt-2">
                  <BulletsEditor 
                    bullets={proj.bullets || []} 
                    onChange={(bullets) => {
                      const newProjs = [...profile.projects];
                      newProjs[idx].bullets = bullets;
                      updateProfile('projects', newProjs);
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
