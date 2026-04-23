'use client';

import { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Code, Link, Globe, Mail, Phone, MapPin } from 'lucide-react';

interface ResumePreviewProps {
  profile: any;
  templateId: string;
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  customStyles: Record<string, any>;
  showQrCode?: boolean;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr || dateStr === 'null' || dateStr === 'undefined' || dateStr === '0') return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime()) || date.getTime() === 0) return '';
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function ResumePreview({ profile, templateId, sectionOrder, sectionVisibility, customStyles, showQrCode }: ResumePreviewProps) {
  const [zoom, setZoom] = useState(0.7);

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-sm">
        No profile data available
      </div>
    );
  }

  const font = customStyles?.font || 'Inter';
  const fontSize = customStyles?.fontSize || 11;
  const lineSpacing = customStyles?.lineSpacing || 1.15;
  const accentColor = customStyles?.accentColor || '#7C3AED';
  const marginX = (customStyles?.marginLeft || 0.6) * 96; // inches to px
  const marginY = (customStyles?.marginTop || 0.5) * 96;

  const vis = sectionVisibility || {};

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-elevated)]/50 rounded-xl overflow-hidden">
      {/* Zoom controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--grid-line)]">
        <span className="text-xs text-[var(--text-muted)]">Preview</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))}
            className="p-1 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]"><ZoomOut size={14} /></button>
          <span className="text-xs font-mono text-[var(--text-muted)] w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(1.2, zoom + 0.1))}
            className="p-1 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]"><ZoomIn size={14} /></button>
          <button onClick={() => setZoom(0.7)}
            className="p-1 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]"><Maximize2 size={14} /></button>
        </div>
      </div>

      {/* Paper */}
      <div className="flex-1 overflow-auto p-6 flex justify-center">
        <div
          style={{
            width: `${8.5 * 96}px`,
            minHeight: `${11 * 96}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            fontFamily: font,
            fontSize: `${fontSize}pt`,
            lineHeight: lineSpacing,
            padding: `${marginY}px ${marginX}px`,
          }}
          className="bg-white text-gray-900 shadow-xl rounded-sm relative"
        >
          {/* Header */}
          {templateId === 'bold-05' ? (
            <div className="rounded px-4 py-3 mb-3 flex items-center gap-4" style={{ backgroundColor: accentColor }}>
              {customStyles?.showProfileImage && profile.imageUrl && (
                <img src={profile.imageUrl} alt="Profile" className="w-14 h-14 rounded-full object-cover border-2 border-white/20 flex-shrink-0" />
              )}
              <div>
                <div className="text-xl font-bold text-white">{profile?.name || 'Your Name'}</div>
                {profile.headline && <div className="text-sm text-white/80 mt-0.5">{profile.headline}</div>}
                <div className="text-xs text-[var(--text-muted)] mt-1">{[profile.email, profile.phone, profile.location, profile.website, profile.linkedin, profile.github].filter(Boolean).join(' | ')}</div>
              </div>
            </div>
          ) : templateId === 'classic-02' ? (
            <div className="mb-3 relative pr-14">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {customStyles?.showProfileImage && profile.imageUrl && (
                    <img src={profile.imageUrl} alt="Profile" className="w-14 h-14 rounded-full object-cover border border-gray-300 flex-shrink-0" />
                  )}
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{profile?.name || 'Your Name'}</div>
                    {profile.headline && <div className="text-sm text-gray-500 italic mt-0.5">{profile.headline}</div>}
                  </div>
                </div>
                <div className="text-right text-[9px] text-gray-500 space-y-0.5 pr-2">
                  {profile.email && <div className="flex items-center justify-end gap-1.5"><Mail size={8} /> {profile.email}</div>}
                  {profile.phone && !profile.phone.includes('@') && <div className="flex items-center justify-end gap-1.5"><Phone size={8} /> {profile.phone}</div>}
                  {profile.location && <div className="flex items-center justify-end gap-1.5"><MapPin size={8} /> {profile.location}</div>}
                  {profile.website && <div className="flex items-center justify-end gap-1.5"><Globe size={8} /> {profile.website.replace(/^https?:\/\//, '')}</div>}
                  {profile.linkedin && <div className="flex items-center justify-end gap-1.5"><Link size={8} /> linkedin.com/in/{profile.linkedin.split('/').pop()}</div>}
                  {profile.github && <div className="flex items-center justify-end gap-1.5"><Code size={8} /> github.com/{profile.github.split('/').pop()}</div>}
                </div>
              </div>
              <div className="border-b-2 border-gray-800 mt-2" />
            </div>
          ) : templateId === 'compact-03' ? (
            <div className="rounded px-3 py-2 mb-3 flex items-center gap-3" style={{ backgroundColor: `${accentColor}10` }}>
              {customStyles?.showProfileImage && profile.imageUrl && (
                <img src={profile.imageUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0" />
              )}
              <div>
                <div className="text-lg font-bold" style={{ color: accentColor }}>{profile?.name || 'Your Name'}</div>
                {profile.headline && <div className="text-xs text-gray-500 mt-0.5">{profile.headline}</div>}
                <div className="text-[9px] text-gray-400 mt-1">{[profile.email, profile.phone, profile.location, profile.website, profile.linkedin, profile.github].filter(Boolean).join(' | ')}</div>
              </div>
            </div>
          ) : templateId === 'minimal-04' ? (
            <div className="mb-3 flex justify-between items-start">
              <div>
                <div className="text-2xl font-light tracking-wide text-gray-800">{profile?.name || 'Your Name'}</div>
                {profile.headline && <div className="text-sm text-gray-400 mt-0.5">{profile.headline}</div>}
                <div className="text-xs text-gray-400 mt-1">{[profile.email, profile.phone, profile.location, profile.website, profile.linkedin, profile.github].filter(Boolean).join(' | ')}</div>
              </div>
              {customStyles?.showProfileImage && profile.imageUrl && (
                <img src={profile.imageUrl} alt="Profile" className="w-14 h-14 rounded-full object-cover grayscale opacity-80 flex-shrink-0" />
              )}
            </div>
          ) : (
            <div className="text-center mb-4 flex flex-col items-center relative pr-14 pl-14">
              {customStyles?.showProfileImage && profile.imageUrl && (
                <img src={profile.imageUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-gray-200 mb-2" />
              )}
              <div className="text-xl font-bold" style={{ color: accentColor }}>{profile.name || 'Your Name'}</div>
              {profile.headline && <div className="text-sm text-gray-500 mt-0.5">{profile.headline}</div>}
              <div className="text-xs text-gray-400 mt-1 max-w-[80%]">{[profile.email, profile.phone, profile.location, profile.website, profile.linkedin].filter(Boolean).join(' | ')}</div>
            </div>
          )}

          {/* QR Code (Floating for non-minimal templates) */}
          {(showQrCode ?? profile.showQrCode) !== false && templateId !== 'minimal-04' && templateId !== 'compact-03' && (
            <div className="absolute top-4 right-4 flex flex-col items-center gap-0.5 opacity-100 z-50">
              <div className="p-0.5 bg-white border border-gray-100 shadow-sm rounded-sm">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://scribe.ai/p/${profile.user?.vanitySlug || 'me'}`)}&format=svg&ecc=H`} 
                  alt="Portfolio QR"
                  className="w-10 h-10"
                />
              </div>
              <span className="text-[5px] text-gray-500 font-bold tracking-widest uppercase">Portfolio</span>
            </div>
          )}

          {/* Compact uses two-column layout */}
          {templateId === 'compact-03' ? (
            <div className="flex gap-4">
              {/* Sidebar */}
              <div className="w-[30%]">
                {vis.skills !== false && profile.skills?.length > 0 && (
                  <SectionBlock title="Skills" accentColor={accentColor} templateId={templateId}>
                    {profile.skills.map((s: any, i: number) => (
                      <div key={i} className="text-[9px]">• {s.name}</div>
                    ))}
                  </SectionBlock>
                )}
                {vis.education !== false && profile.education?.length > 0 && (
                  <SectionBlock title="Education" accentColor={accentColor} templateId={templateId}>
                    {profile.education.map((e: any, i: number) => (
                      <div key={i} className="mb-1.5">
                        <div className="text-[10px] font-semibold">{e.degree}</div>
                        <div className="text-[9px] text-gray-500">{e.institution}</div>
                      </div>
                    ))}
                  </SectionBlock>
                )}
              </div>
              {/* Main */}
              <div className="flex-1">
                {renderSections(sectionOrder.filter(s => s !== 'skills' && s !== 'education'), profile, vis, accentColor, templateId)}
              </div>
            </div>
          ) : (
            renderSections(sectionOrder, profile, vis, accentColor, templateId)
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function renderSections(order: string[], profile: any, vis: Record<string, boolean>, accent: string, templateId: string) {
  return order.map((section) => {
    if (vis[section] === false) return null;

    switch (section) {
      case 'summary':
        if (!profile.summary) return null;
        return <SectionBlock key={section} title="Summary" accentColor={accent} templateId={templateId}>
          <p className="text-[10px] text-gray-600">{profile.summary}</p>
        </SectionBlock>;
      case 'experience':
        if (!profile.experiences?.length) return null;
        const visibleExperiences = profile.experiences.filter((e: any) => e.visible !== false);
        if (visibleExperiences.length === 0) return null;
        return <SectionBlock key={section} title="Experience" accentColor={accent} templateId={templateId}>
          {visibleExperiences.map((exp: any, i: number) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <div>
                  <span className="text-[10px] font-bold">{exp.title}</span>
                  {exp.company && <span className="text-[10px] text-gray-500"> — {exp.company}</span>}
                </div>
                <span className="text-[9px] text-gray-400">{formatDate(exp.startDate)}{exp.endDate ? ` - ${formatDate(exp.endDate)}` : exp.current ? ' - Present' : ''}</span>
              </div>
              {exp.bullets?.map((b: string, j: number) => b && (
                <div key={j} className="text-[9px] text-gray-600 ml-2">• {b}</div>
              ))}
              {!exp.bullets?.length && exp.description && (
                <div className="text-[9px] text-gray-600">{exp.description}</div>
              )}
            </div>
          ))}
        </SectionBlock>;
      case 'education':
        if (!profile.education?.length) return null;
        const visibleEducation = profile.education.filter((e: any) => e.visible !== false);
        if (visibleEducation.length === 0) return null;
        return <SectionBlock key={section} title="Education" accentColor={accent} templateId={templateId}>
          {visibleEducation.map((e: any, i: number) => (
            <div key={i} className="flex justify-between mb-1">
              <div>
                <span className="text-[10px] font-bold">{e.degree}{e.field ? ` in ${e.field}` : ''}</span>
                <span className="text-[10px] text-gray-500"> — {e.institution}</span>
              </div>
              <span className="text-[9px] text-gray-400">{formatDate(e.startDate)}{e.endDate ? ` - ${formatDate(e.endDate)}` : ''}</span>
            </div>
          ))}
        </SectionBlock>;
      case 'skills':
        if (!profile.skills?.length) return null;
        return <SectionBlock key={section} title="Skills" accentColor={accent} templateId={templateId}>
          <div className="flex flex-wrap gap-1">
            {profile.skills.map((s: any, i: number) => (
              templateId === 'classic-02' || templateId === 'minimal-04' ? (
                <span key={i} className="text-[9px]">{s.name}{i < profile.skills.length - 1 ? ', ' : ''}</span>
              ) : (
                <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full border" style={{
                  backgroundColor: `${accent}12`,
                  borderColor: `${accent}30`,
                  color: accent,
                }}>{s.name}</span>
              )
            ))}
          </div>
        </SectionBlock>;
      case 'projects':
        if (!profile.projects?.length) return null;
        const visibleProjects = profile.projects.filter((p: any) => p.visible !== false);
        if (visibleProjects.length === 0) return null;
        return <SectionBlock key={section} title="Projects" accentColor={accent} templateId={templateId}>
          {visibleProjects.map((p: any, i: number) => (
            <div key={i} className="mb-1.5">
              <div className="flex flex-col mb-0.5">
                <span className="text-[10px] font-bold">{p.name}</span>
                {p.techStack?.length > 0 && (
                  <span className="text-[8px] text-gray-400 italic leading-tight" dangerouslySetInnerHTML={{ __html: p.techStack.join(', ') }} />
                )}
              </div>
              {p.description && <div className="text-[9px] text-gray-600 leading-tight" dangerouslySetInnerHTML={{ __html: p.description }} />}
              {p.bullets?.length > 0 && (
                <ul className="list-disc ml-3 mt-0.5">
                  {p.bullets.map((b: string, bi: number) => (
                    <li key={bi} className="text-[9px] text-gray-600 leading-tight">{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </SectionBlock>;
      case 'certifications':
        if (!profile.certifications?.length) return null;
        return <SectionBlock key={section} title="Certifications" accentColor={accent} templateId={templateId}>
          {profile.certifications.map((c: any, i: number) => (
            <div key={i} className="text-[9px]">
              <span className="font-semibold">{c.name}</span> — {c.issuer}
            </div>
          ))}
        </SectionBlock>;
      default:
        return null;
    }
  });
}

function SectionBlock({ title, accentColor, templateId, children }: { title: string; accentColor: string; templateId: string; children: React.ReactNode }) {
  const isBold = templateId === 'bold-05';
  const isMinimal = templateId === 'minimal-04';
  const isClassic = templateId === 'classic-02';

  return (
    <div className="mb-3">
      {isBold ? (
        <div className="text-[9px] font-bold text-white uppercase tracking-widest px-1.5 py-0.5 rounded mb-1" style={{ backgroundColor: accentColor }}>
          {title}
        </div>
      ) : isMinimal ? (
        <>
          <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">{title}</div>
          <div className="border-b border-gray-200 mb-1 mt-0.5" />
        </>
      ) : isClassic ? (
        <>
          <div className="text-[11px] font-bold text-gray-800">{title}</div>
          <div className="border-b border-gray-400 mb-1 mt-0.5" />
        </>
      ) : (
        <>
          <div className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>{title}</div>
          <div className="border-b mb-1" style={{ borderColor: `${accentColor}40` }} />
        </>
      )}
      {children}
    </div>
  );
}
