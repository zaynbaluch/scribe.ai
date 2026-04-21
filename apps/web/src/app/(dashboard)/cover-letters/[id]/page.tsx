'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import CoverLetterEditor from '@/components/cover-letter/cover-letter-editor';

export default function CoverLetterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [content, setContent] = useState('<p>Loading...</p>');
  const [tone, setTone] = useState('formal');

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--grid-line-strong)] bg-[var(--bg-surface-transparent)] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/cover-letters')}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <span className="font-display text-lg tracking-tight">Cover Letter</span>
        </div>
        <div className="flex items-center gap-3">
          <select value={tone} onChange={(e) => setTone(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs focus:outline-none">
            <option value="formal">Formal</option>
            <option value="conversational">Conversational</option>
            <option value="storytelling">Storytelling</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity">
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <CoverLetterEditor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Side panel */}
        <div className="w-72 border-l border-[var(--grid-line-strong)] overflow-y-auto p-4">
          <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Tone Guide</h4>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            You&apos;re writing in <strong className="text-[var(--text-primary)]">{tone}</strong> tone.
          </p>
          {tone === 'formal' && (
            <p className="text-[10px] text-[var(--text-muted)] italic">Use polished, professional language. Avoid slang and keep sentences structured.</p>
          )}
          {tone === 'conversational' && (
            <p className="text-[10px] text-[var(--text-muted)] italic">Be personable and warm while staying professional. Show genuine enthusiasm.</p>
          )}
          {tone === 'storytelling' && (
            <p className="text-[10px] text-[var(--text-muted)] italic">Open with a compelling hook. Weave your experience into a narrative arc.</p>
          )}
        </div>
      </div>
    </div>
  );
}
