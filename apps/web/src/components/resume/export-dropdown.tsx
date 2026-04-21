'use client';

import { useState } from 'react';
import { Download, FileText, FileType, Type, Braces, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface ExportDropdownProps {
  resumeId: string;
}

const FORMATS = [
  { id: 'pdf', label: 'PDF', icon: FileText, desc: 'Best for sharing' },
  { id: 'docx', label: 'DOCX', icon: FileType, desc: 'For editing in Word' },
  { id: 'txt', label: 'Plain Text', icon: Type, desc: 'ATS-safe fallback' },
  { id: 'json', label: 'JSON', icon: Braces, desc: 'Raw data export' },
];

export default function ExportDropdown({ resumeId }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (format: string) => {
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
              <button key={f.id} onClick={() => handleExport(f.id)}
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
