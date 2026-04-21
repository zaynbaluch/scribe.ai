'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useResumeStore } from '@/stores/resume-store';
import { useDebounce } from '@/hooks/use-debounce';
import TemplatePicker from '@/components/resume/template-picker';
import StyleControls from '@/components/resume/style-controls';
import SectionToggles from '@/components/resume/section-toggles';
import ResumePreview from '@/components/resume/resume-preview';
import ExportDropdown from '@/components/resume/export-dropdown';
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

  if (isLoading || !activeResume) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--gradient-2)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[var(--text-muted)]">Loading resume...</span>
        </div>
      </div>
    );
  }

  const profile = activeResume.baseProfileSnapshot as any;

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      {/* Editor Topbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--grid-line-strong)] bg-[var(--bg-surface-transparent)] backdrop-blur-md">
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
          {activeResume.atsScore !== null && activeResume.atsScore !== undefined && (
            <div className={`text-xs font-mono font-medium px-2 py-1 rounded-md border ${
              activeResume.atsScore >= 80 ? 'text-[var(--success)] border-[var(--success)]/30 bg-[var(--success)]/10'
                : activeResume.atsScore >= 60 ? 'text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/10'
                : 'text-[var(--danger)] border-[var(--danger)]/30 bg-[var(--danger)]/10'
            }`}>
              ATS {activeResume.atsScore}
            </div>
          )}
          <ExportDropdown resumeId={id} />
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Controls Panel */}
        <div className="w-[320px] border-r border-[var(--grid-line-strong)] overflow-y-auto p-4 space-y-6">
          <TemplatePicker templates={templates} selected={localTemplateId} onSelect={handleTemplateChange} />
          <div className="border-t border-[var(--grid-line)]" />
          <StyleControls styles={localStyles} onChange={handleStylesChange} />
          <div className="border-t border-[var(--grid-line)]" />
          <SectionToggles
            sectionOrder={localSectionOrder}
            sectionVisibility={localVisibility}
            onOrderChange={handleOrderChange}
            onVisibilityChange={handleVisibilityChange}
          />
        </div>

        {/* Preview Panel */}
        <ResumePreview
          profile={profile}
          templateId={localTemplateId}
          sectionOrder={localSectionOrder}
          sectionVisibility={localVisibility}
          customStyles={localStyles}
        />
      </div>
    </div>
  );
}
