'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Shield, Palette, Type, Layout } from 'lucide-react';
import { useResumeStore } from '@/stores/resume-store';
import { useDebounce } from '@/hooks/use-debounce';
import TemplatePicker from '@/components/resume/template-picker';
import StyleControls from '@/components/resume/style-controls';
import SectionToggles from '@/components/resume/section-toggles';
import ResumePreview from '@/components/resume/resume-preview';
import ExportDropdown from '@/components/resume/export-dropdown';
import AtsSimulator from '@/components/resume/ats-simulator';
import ContentEditor from '@/components/resume/content-editor';
import { toast } from 'sonner';

export default function ResumeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { activeResume, templates, isLoading, isSaving, fetchResume, fetchTemplates, updateResume } = useResumeStore();

  // Local state for instant UI updates
  const [localName, setLocalName] = useState('');
  const [localTemplateId, setLocalTemplateId] = useState('modern-01');
  const [localStyles, setLocalStyles] = useState<Record<string, any>>({});
  const [localSectionOrder, setLocalSectionOrder] = useState<string[]>([]);
  const [localVisibility, setLocalVisibility] = useState<Record<string, boolean>>({});
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [atsOpen, setAtsOpen] = useState(false);
  const [localAtsScore, setLocalAtsScore] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'content'>('design');

  useEffect(() => {
    fetchResume(id);
    if (templates.length === 0) fetchTemplates();
  }, [id]);

  // Sync from server to local state
  useEffect(() => {
    if (activeResume) {
      setLocalName(activeResume.name);
      setLocalTemplateId(activeResume.templateId);
      setLocalStyles(activeResume.customStyles || {});
      setLocalSectionOrder(activeResume.sectionOrder || ['summary', 'experience', 'skills', 'projects', 'education']);
      setLocalVisibility(activeResume.sectionVisibility || {});
      setLocalProfile(activeResume.baseProfileSnapshot);
    }
  }, [activeResume]);

  // Debounced save
  const debouncedSave = useDebounce((data: any) => {
    updateResume(id, data).then(() => toast.success('Saved', { duration: 1500 })).catch(() => toast.error('Save failed'));
  }, 1200);

  const handleNameChange = (name: string) => {
    setLocalName(name);
    debouncedSave({ name });
  };

  const handleTemplateChange = (templateId: string) => {
    setLocalTemplateId(templateId);
    debouncedSave({ templateId });
  };

  const handleStylesChange = (styles: any) => {
    setLocalStyles(styles);
    debouncedSave({ customStyles: styles });
  };

  const handleOrderChange = (order: string[]) => {
    setLocalSectionOrder(order);
    debouncedSave({ sectionOrder: order });
  };

  const handleVisibilityChange = (vis: Record<string, boolean>) => {
    setLocalVisibility(vis);
    debouncedSave({ sectionVisibility: vis });
  };

  const handleContentChange = (updatedProfile: any) => {
    setLocalProfile({ ...updatedProfile });
    debouncedSave({ baseProfileSnapshot: updatedProfile });
  };

  if (isLoading || !activeResume || !localProfile) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--gradient-2)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[var(--text-muted)]">Loading resume...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-4 md:-mt-6 -mx-4 md:-mx-6 h-[calc(100vh-56px)] flex flex-col bg-[var(--bg-base)]">
      {/* Editor Topbar */}
      <div className="relative z-50 flex items-center justify-between px-4 py-2.5 border-b border-[var(--grid-line-strong)] bg-[var(--bg-surface-transparent)] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/resumes')}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <input type="text" value={localName} onChange={(e) => handleNameChange(e.target.value)}
            className="bg-transparent text-lg font-display tracking-tight border-none outline-none focus:ring-0 w-64" />
          {isSaving && (
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Save size={12} className="animate-pulse" /> Saving...
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {(localAtsScore ?? activeResume.atsScore) != null && (
            <div className={`text-xs font-mono font-medium px-2 py-1 rounded-md border ${
              (localAtsScore ?? activeResume.atsScore)! >= 80 ? 'text-[var(--success)] border-[var(--success)]/30 bg-[var(--success)]/10'
                : (localAtsScore ?? activeResume.atsScore)! >= 60 ? 'text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/10'
                : 'text-[var(--danger)] border-[var(--danger)]/30 bg-[var(--danger)]/10'
            }`}>
              ATS {localAtsScore ?? activeResume.atsScore}
            </div>
          )}
          <button onClick={() => setAtsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
            <Shield size={14} />
            ATS Check
          </button>
          <ExportDropdown resumeId={id} atsScore={localAtsScore ?? activeResume.atsScore ?? undefined} />
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Controls Panel */}
        <div className="w-full md:w-[320px] md:border-r border-b md:border-b-0 border-[var(--grid-line-strong)] flex flex-col flex-shrink-0 max-h-[50vh] md:max-h-full">
          {/* Tab Switcher */}
          <div className="flex p-1 bg-[var(--bg-elevated)] border-b border-[var(--grid-line)]">
            <button
              onClick={() => setActiveTab('design')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'design' 
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <Palette size={14} /> Design
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'content' 
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <Type size={14} /> Content
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {activeTab === 'design' ? (
              <>
                <TemplatePicker templates={templates} selected={localTemplateId} onSelect={handleTemplateChange} />
                <div className="border-t border-[var(--grid-line)]" />
                <StyleControls styles={localStyles} hasAvatar={!!localProfile?.imageUrl} onChange={handleStylesChange} />
                <div className="border-t border-[var(--grid-line)]" />
                <SectionToggles
                  sectionOrder={localSectionOrder}
                  sectionVisibility={localVisibility}
                  onOrderChange={handleOrderChange}
                  onVisibilityChange={handleVisibilityChange}
                />
              </>
            ) : (
              <ContentEditor profile={localProfile} onChange={handleContentChange} />
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 overflow-auto bg-[var(--bg-elevated)]/30">
          <ResumePreview
            profile={localProfile}
            templateId={localTemplateId}
            sectionOrder={localSectionOrder}
            sectionVisibility={localVisibility}
            customStyles={localStyles}
          />
        </div>
      </div>

      {/* ATS Simulator Panel */}
      <AtsSimulator
        resumeId={id}
        isOpen={atsOpen}
        onClose={() => setAtsOpen(false)}
        onScoreUpdate={(score) => setLocalAtsScore(score)}
      />
    </div>
  );
}
