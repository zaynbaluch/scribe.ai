'use client';

import { useState } from 'react';
import { Download, FileText, FileType, Type, Braces, Loader2, ChevronDown, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ExportDropdownProps {
  resumeId: string;
  atsScore?: number;
}

const FORMATS = [
  { id: 'pdf', label: 'PDF', icon: FileText, desc: 'Best for sharing' },
  { id: 'docx', label: 'DOCX', icon: FileType, desc: 'For editing in Word' },
  { id: 'txt', label: 'Plain Text', icon: Type, desc: 'ATS-safe fallback' },
  { id: 'json', label: 'JSON', icon: Braces, desc: 'Raw data export' },
];

export default function ExportDropdown({ resumeId, atsScore }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [atsWarning, setAtsWarning] = useState<{ format: string } | null>(null);

  const handleExportClick = (format: string) => {
    // Show ATS warning if score is below 80 and exporting PDF/DOCX
    if (atsScore !== undefined && atsScore < 80 && (format === 'pdf' || format === 'docx')) {
      setAtsWarning({ format });
      return;
    }
    doExport(format);
  };

  const doExport = async (format: string) => {
    setAtsWarning(null);
    setIsExporting(format);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('scribe_access_token') : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/resumes/${resumeId}/export/${format}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || `Export failed (${res.status})`);
      }

      if (format === 'json') {
        const json = await res.json();
        const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `resume.${format}`);
      } else {
        const blob = await res.blob();
        downloadBlob(blob, `resume.${format}`);
      }

      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err.message || 'Export failed');
    } finally {
      setIsExporting(null);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity">
        <Download size={15} />
        Export
        <ChevronDown size={13} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-150">
            {FORMATS.map((f) => (
              <button key={f.id} onClick={() => handleExportClick(f.id)}
                disabled={isExporting !== null}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--bg-elevated)] transition-colors disabled:opacity-50">
                {isExporting === f.id ? (
                  <Loader2 size={15} className="animate-spin text-[var(--gradient-2)]" />
                ) : (
                  <f.icon size={15} className="text-[var(--text-muted)]" />
                )}
                <div>
                  <div className="text-sm font-medium">{f.label}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">{f.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ATS Warning Dialog */}
      {atsWarning && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setAtsWarning(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--warning)]/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-[var(--warning)]" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold mb-1">Low ATS Score</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Your resume has an ATS compatibility score of <strong className="text-[var(--warning)]">{atsScore}</strong>.
                  We recommend fixing the issues before exporting to maximize your chances.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setAtsWarning(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
                Go Back
              </button>
              <button onClick={() => doExport(atsWarning.format)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/30 hover:bg-[var(--warning)]/20 transition-colors">
                Export Anyway
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

