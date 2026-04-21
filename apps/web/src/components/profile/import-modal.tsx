'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import api from '@/lib/api-client';
import { toast } from 'sonner';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: (data: any) => void;
}

export default function ImportModal({ isOpen, onClose, onImported }: ImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF and DOCX files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 10MB.');
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = typeof window !== 'undefined' ? localStorage.getItem('scribe_access_token') : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/profile/import`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Resume parsed successfully! Review the imported data.');
        onImported(result.data.parsed);
        onClose();
      } else {
        toast.error(result.error?.message || 'Failed to parse file.');
      }
    } catch {
      toast.error('Failed to upload file. Is the API server running?');
    } finally {
      setIsUploading(false);
      setFileName(null);
    }
  }, [onClose, onImported]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl tracking-tight">Import Resume</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Drag and drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[var(--gradient-2)] bg-[var(--gradient-2)]/5'
              : 'border-[var(--border-subtle)] hover:border-[var(--border-focus)] hover:bg-[var(--bg-elevated)]'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 size={32} className="text-[var(--gradient-2)] animate-spin" />
              <p className="text-sm text-[var(--text-secondary)]">Parsing {fileName}...</p>
            </>
          ) : (
            <>
              <Upload size={32} className="text-[var(--text-muted)]" />
              <div className="text-center">
                <p className="text-sm font-medium">Drop your resume here</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">PDF or DOCX, max 10MB</p>
              </div>
            </>
          )}
        </div>

        <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

        <p className="text-xs text-[var(--text-muted)] text-center mt-4">
          Your data will be extracted and shown for review before saving.
        </p>
      </div>
    </div>
  );
}
