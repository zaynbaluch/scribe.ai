'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Sparkles, Mail, CheckCircle2 } from 'lucide-react';
import { useTailorStore } from '@/stores/tailor-store';
import { useResumeStore } from '@/stores/resume-store';
import JobInputForm from '@/components/tailor/job-input-form';
import MatchScoreDisplay from '@/components/tailor/match-score-display';
import TailorDiffView from '@/components/tailor/tailor-diff-view';
import { toast } from 'sonner';

export default function TailorPage() {
  const router = useRouter();
  const { resumes, fetchResumes } = useResumeStore();
  const {
    step, matchResult, suggestions, isLoading, error, jobId, parsedKeywords,
    setResumeId, analyzeJob, tailorResume, acceptSuggestion, rejectSuggestion,
    acceptAll, rejectAll, applyToResume, sendTailoredEmail, reset,
  } = useTailorStore();

  const searchParams = useSearchParams();
  const jobIdFromQuery = searchParams.get('jobId');

  const [selectedResumeId, setSelectedResumeId] = useState('');

  useEffect(() => { fetchResumes(); }, [fetchResumes]);
  useEffect(() => {
    const base = resumes.filter(r => !r.isTailored);
    if (base.length > 0 && !selectedResumeId) {
      setSelectedResumeId(base[0].id);
      setResumeId(base[0].id);
    }
  }, [resumes]);
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Handle auto-analysis from jobId query param
  const autoAnalyzeTriggered = useRef(false);
  useEffect(() => {
    if (jobIdFromQuery && selectedResumeId && step === 'input' && !isLoading && !error && !autoAnalyzeTriggered.current) {
      autoAnalyzeTriggered.current = true;
      handleAnalyze({ jobId: jobIdFromQuery });
    }
  }, [jobIdFromQuery, selectedResumeId, step, error]);

  const handleAnalyze = (input: { text?: string; url?: string; jobId?: string }) => {
    if (!selectedResumeId) {
      toast.error('Select a resume first');
      return;
    }
    analyzeJob(selectedResumeId, input);
  };

  const handleTailor = () => {
    if (!selectedResumeId || !jobId) return;
    tailorResume(selectedResumeId, jobId);
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-8">
        <div className="flex items-center gap-3">
          {step !== 'input' && (
            <button onClick={reset}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors">
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Sparkles size={18} className="text-[var(--gradient-2)]" />
            <h1 className="font-display text-2xl tracking-tight">AI Tailoring</h1>
          </div>
        </div>

        {/* Resume selector */}
        {step === 'input' && resumes.filter(r => !r.isTailored).length > 0 && (
          <div className="sm:ml-auto w-full sm:w-auto sm:max-w-[200px]">
            <select value={selectedResumeId}
              onChange={(e) => { setSelectedResumeId(e.target.value); setResumeId(e.target.value); }}
              className="w-full sm:w-auto px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--border-focus)] truncate">
              {resumes.filter(r => !r.isTailored).map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Steps */}
      {(step === 'input') && (
        <JobInputForm onSubmit={handleAnalyze} isLoading={isLoading} />
      )}

      {(step === 'matching') && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-3 border-[var(--gradient-2)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--text-muted)]">Analyzing job description...</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Extracting keywords and computing match score</p>
        </div>
      )}

      {(step === 'results') && matchResult && (
        <MatchScoreDisplay
          score={matchResult.score}
          strong={matchResult.strong}
          partial={matchResult.partial}
          gaps={matchResult.gaps}
          jobTitle={parsedKeywords?.title}
          onTailor={handleTailor}
          isLoading={isLoading}
        />
      )}

      {(step === 'tailoring') && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-3 border-[var(--gradient-2)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--text-muted)]">Tailoring your resume...</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Rewriting bullets and optimizing for keywords</p>
        </div>
      )}

      {(step === 'diff') && (
        <TailorDiffView
          suggestions={suggestions}
          onAccept={acceptSuggestion}
          onReject={rejectSuggestion}
          onAcceptAll={acceptAll}
          onRejectAll={rejectAll}
          onApply={applyToResume}
          isLoading={isLoading}
        />
      )}

      {(step === 'success') && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 bg-[var(--success)]/10 text-[var(--success)] rounded-full flex items-center justify-center mb-6 ring-8 ring-[var(--success)]/5">
            <Sparkles size={32} />
          </div>
          <h2 className="font-display text-2xl tracking-tight mb-2">Tailoring Complete!</h2>
          <p className="text-[var(--text-muted)] max-w-md mb-8">
            Your resume has been successfully tailored. We also automatically generated a Cover Letter for this job!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => {
                const { newResumeId } = useTailorStore.getState();
                if (newResumeId) router.push(`/resumes/${newResumeId}`);
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[var(--gradient-1)]/20"
            >
              Review Resume
            </button>
            <button 
              onClick={() => router.push('/cover-letters')}
              className="px-6 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] font-medium hover:bg-[var(--bg-surface-hover)] transition-colors"
            >
              View Cover Letter
            </button>
            <button 
              onClick={sendTailoredEmail}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl border border-[var(--gradient-1)] text-[var(--gradient-1)] font-medium hover:bg-[var(--gradient-1)]/5 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Mail size={18} />
              Send to Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
