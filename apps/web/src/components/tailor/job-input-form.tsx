'use client';

import { useState } from 'react';
import { FileText, Link2, ImageIcon } from 'lucide-react';

interface JobInputFormProps {
  onSubmit: (input: { text?: string; url?: string }) => void;
  isLoading: boolean;
}

type Tab = 'text' | 'url' | 'image';

export default function JobInputForm({ onSubmit, isLoading }: JobInputFormProps) {
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');

  const canSubmit = activeTab === 'text' ? text.length > 50 : activeTab === 'url' ? url.length > 10 : false;

  const handleSubmit = () => {
    if (activeTab === 'text') onSubmit({ text });
    else if (activeTab === 'url') onSubmit({ url });
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'text', label: 'Paste Text', icon: FileText },
    { id: 'url', label: 'Paste URL', icon: Link2 },
    { id: 'image', label: 'Image', icon: ImageIcon },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-3xl tracking-tight text-center mb-2">
        What role are you targeting?
      </h1>
      <p className="text-sm text-[var(--text-muted)] text-center mb-8">
        Paste a job description and we&apos;ll analyze the match with your profile.
      </p>

      {/* Tab Switcher */}
      <div className="flex border-b border-[var(--border-subtle)] mb-4">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[var(--gradient-2)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}>
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === 'text' && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={12}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm resize-none focus:outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--gradient-2)]/20 placeholder:text-[var(--text-muted)]"
          />
        )}

        {activeTab === 'url' && (
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://linkedin.com/jobs/view/..."
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--gradient-2)]/20 placeholder:text-[var(--text-muted)]"
          />
        )}

        {activeTab === 'image' && (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)] hover:border-[var(--border-focus)] transition-colors cursor-pointer">
            <ImageIcon size={32} className="mb-3 opacity-50" />
            <p className="text-sm">📸 Drop a screenshot of the job posting</p>
            <p className="text-xs mt-1 opacity-60">Coming soon — use Paste Text for now</p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isLoading}
          className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze →'
          )}
        </button>
      </div>
    </div>
  );
}
