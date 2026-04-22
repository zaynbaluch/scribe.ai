'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, GripVertical } from 'lucide-react';

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
              <label className="block text-[10px] text-[var(--text-muted)] uppercase mb-1">Headline</label>
              <input 
                type="text" 
                value={profile.headline || ''} 
                onChange={(e) => updateProfile('headline', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--gradient-2)]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-muted)] uppercase mb-1">Professional Summary</label>
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
          <div className="p-4 space-y-6 bg-[var(--bg-base)]">
            {profile.experiences?.map((exp: any, idx: number) => (
              <div key={idx} className="space-y-3 p-3 rounded-lg border border-[var(--grid-line)] bg-[var(--bg-surface)]">
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
                      className="w-full bg-transparent font-medium text-sm focus:outline-none"
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
                      className="w-full bg-transparent text-xs text-[var(--text-muted)] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase mb-1">Bullets</label>
                  <div className="space-y-2">
                    {exp.bullets?.map((bullet: string, bIdx: number) => (
                      <div key={bIdx} className="flex gap-2">
                        <textarea 
                          value={bullet}
                          rows={2}
                          onChange={(e) => {
                            const newExps = [...profile.experiences];
                            newExps[idx].bullets[bIdx] = e.target.value;
                            updateProfile('experiences', newExps);
                          }}
                          className="flex-1 px-2 py-1.5 rounded bg-[var(--bg-elevated)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--gradient-2)] resize-none"
                        />
                        <button 
                          onClick={() => {
                            const newExps = [...profile.experiences];
                            newExps[idx].bullets.splice(bIdx, 1);
                            updateProfile('experiences', newExps);
                          }}
                          className="p-1 text-[var(--text-muted)] hover:text-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newExps = [...profile.experiences];
                        newExps[idx].bullets = [...(newExps[idx].bullets || []), ''];
                        updateProfile('experiences', newExps);
                      }}
                      className="text-[10px] text-[var(--gradient-2)] hover:underline flex items-center gap-1"
                    >
                      <Plus size={10} /> Add Bullet
                    </button>
                  </div>
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
          <div className="p-4 space-y-6 bg-[var(--bg-base)]">
            {profile.projects?.map((proj: any, idx: number) => (
              <div key={idx} className="space-y-3 p-3 rounded-lg border border-[var(--grid-line)] bg-[var(--bg-surface)]">
                <input 
                  type="text" 
                  value={proj.name || ''} 
                  placeholder="Project Name"
                  onChange={(e) => {
                    const newProjs = [...profile.projects];
                    newProjs[idx].name = e.target.value;
                    updateProfile('projects', newProjs);
                  }}
                  className="w-full bg-transparent font-medium text-sm focus:outline-none"
                />
                <input 
                  type="text" 
                  value={proj.techStack?.join(', ') || ''} 
                  placeholder="Tech Stack (comma separated)"
                  onChange={(e) => {
                    const newProjs = [...profile.projects];
                    newProjs[idx].techStack = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    updateProfile('projects', newProjs);
                  }}
                  className="w-full bg-transparent text-[10px] text-[var(--text-muted)] focus:outline-none"
                />
                <textarea 
                  value={proj.description || ''} 
                  placeholder="Description"
                  rows={2}
                  onChange={(e) => {
                    const newProjs = [...profile.projects];
                    newProjs[idx].description = e.target.value;
                    updateProfile('projects', newProjs);
                  }}
                  className="w-full px-2 py-1.5 rounded bg-[var(--bg-elevated)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--gradient-2)] resize-none"
                />
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase mb-1">Key Features / Bullets</label>
                  <div className="space-y-2">
                    {proj.bullets?.map((bullet: string, bIdx: number) => (
                      <div key={bIdx} className="flex gap-2">
                        <textarea 
                          value={bullet}
                          rows={2}
                          onChange={(e) => {
                            const newProjs = [...profile.projects];
                            newProjs[idx].bullets[bIdx] = e.target.value;
                            updateProfile('projects', newProjs);
                          }}
                          className="flex-1 px-2 py-1.5 rounded bg-[var(--bg-elevated)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--gradient-2)] resize-none"
                        />
                        <button 
                          onClick={() => {
                            const newProjs = [...profile.projects];
                            newProjs[idx].bullets.splice(bIdx, 1);
                            updateProfile('projects', newProjs);
                          }}
                          className="p-1 text-[var(--text-muted)] hover:text-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newProjs = [...profile.projects];
                        newProjs[idx].bullets = [...(newProjs[idx].bullets || []), ''];
                        updateProfile('projects', newProjs);
                      }}
                      className="text-[10px] text-[var(--gradient-2)] hover:underline flex items-center gap-1"
                    >
                      <Plus size={10} /> Add Bullet
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
