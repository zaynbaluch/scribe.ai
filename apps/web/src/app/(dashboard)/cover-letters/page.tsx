'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, PenLine, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Placeholder until we build dedicated CL list endpoints
// For now, cover letters are created via the tailoring flow

export default function CoverLettersPage() {
  const router = useRouter();

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl tracking-tight">Cover Letters</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Generate tailored cover letters from your resumes.</p>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
          <PenLine size={24} className="text-[var(--text-muted)]" />
        </div>
        <h3 className="font-semibold mb-1">No cover letters yet</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4 max-w-md">
          Cover letters are generated during the AI tailoring flow. Go to <strong>AI Tailoring</strong>, analyze a job description, and generate a cover letter alongside your tailored resume.
        </p>
        <button onClick={() => router.push('/tailor')}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity">
          Go to AI Tailoring
        </button>
      </div>
    </div>
  );
}
