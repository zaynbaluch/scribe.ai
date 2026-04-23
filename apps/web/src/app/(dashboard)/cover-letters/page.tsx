'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { FileText, Calendar, Building2, Trash2, PenLine, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import CreateCoverLetterModal from '@/components/cover-letter/create-modal';
import ExportDropdown from '@/components/cover-letter/export-dropdown';

interface CoverLetter {
  id: string;
  title: string;
  content: string;
  tone: string;
  createdAt: string;
  job?: { title: string; company: string; };
}

export default function CoverLettersPage() {
  const router = useRouter();
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const data = await api.get<CoverLetter[]>('/api/cover-letters');
      setLetters(data);
    } catch (error) {
      toast.error('Failed to load cover letters');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLetter = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this cover letter?')) return;
    try {
      await api.delete(`/api/cover-letters/${id}`);
      setLetters(letters.filter(l => l.id !== id));
      if (selectedLetter?.id === id) setSelectedLetter(null);
      toast.success('Cover letter deleted');
    } catch (error) {
      toast.error('Failed to delete cover letter');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--text-muted)]">Loading cover letters...</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl tracking-tight mb-2">Cover Letters</h1>
          <p className="text-[var(--text-muted)] text-sm hidden sm:block">View and manage AI-generated cover letters for your applications.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[var(--gradient-1)]/20"
        >
          <PenLine size={16} /> <span>Create <span className="hidden sm:inline">Custom</span></span>
        </button>
      </div>

      <div className="flex flex-1 gap-6 min-h-0 relative">
        {/* List Panel */}
        <div className={`w-full md:w-[350px] flex flex-col gap-3 overflow-y-auto md:pr-2 md:border-r border-[var(--grid-line)] ${selectedLetter ? 'hidden md:flex' : 'flex'}`}>
          {letters.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-elevated)]/30">
              <PenLine size={24} className="text-[var(--text-muted)] mb-3" />
              <div className="text-sm font-medium mb-1">No cover letters yet</div>
              <div className="text-xs text-[var(--text-muted)] mb-4">
                Use the Tailor tool to auto-generate cover letters for jobs.
              </div>
              <button onClick={() => router.push('/tailor')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity">
                Go to AI Tailoring
              </button>
            </div>
          ) : (
            letters.map(letter => (
              <div key={letter.id}
                onClick={() => setSelectedLetter(letter)}
                className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                  selectedLetter?.id === letter.id 
                    ? 'bg-[var(--bg-elevated)] border-[var(--gradient-2)] shadow-sm' 
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-sm truncate pr-4">{letter.title}</div>
                  <button onClick={(e) => deleteLetter(letter.id, e)} className="text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </div>
                
                {letter.job && (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
                    <Building2 size={12} />
                    <span className="truncate">{letter.job.title} @ {letter.job.company}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(letter.createdAt).toLocaleDateString()}
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] uppercase">
                    {letter.tone}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View Panel */}
        <div className={`flex-1 bg-[var(--bg-elevated)]/30 rounded-xl border border-[var(--border-subtle)] overflow-hidden flex flex-col ${selectedLetter ? 'flex' : 'hidden md:flex'}`}>
          {selectedLetter ? (
            <>
              <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-wrap gap-3 justify-between items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => setSelectedLetter(null)} 
                    className="md:hidden p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] flex-shrink-0">
                    <ArrowLeft size={18} />
                  </button>
                  <h2 className="font-medium text-sm truncate">{selectedLetter.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => router.push(`/cover-letters/${selectedLetter.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded hover:bg-[var(--bg-surface)] transition-colors text-[var(--text-primary)]"
                  >
                    <PenLine size={12} /> Edit
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(selectedLetter.content);
                      toast.success('Copied to clipboard');
                    }}
                    className="px-3 py-1.5 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded hover:bg-[var(--bg-surface)] transition-colors"
                  >
                    Copy Text
                  </button>
                  <ExportDropdown id={selectedLetter.id} />
                </div>
              </div>
              <div className="p-8 overflow-y-auto flex-1 font-serif text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-secondary)]">
                {selectedLetter.content}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)]">
              <FileText size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Select a cover letter to view</p>
            </div>
          )}
        </div>
      </div>

      <CreateCoverLetterModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreated={fetchLetters} 
      />
    </div>
  );
}
