'use client';

import { useEffect, useState } from 'react';

interface MatchScoreDisplayProps {
  score: number;
  strong: string[];
  partial: string[];
  gaps: string[];
  jobTitle?: string;
  onTailor: () => void;
  isLoading: boolean;
}

export default function MatchScoreDisplay({ score, strong, partial, gaps, jobTitle, onTailor, isLoading }: MatchScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(0);

  // Count-up animation
  useEffect(() => {
    let frame: number;
    const start = Date.now();
    const duration = 1200;
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const scoreColor = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';
  const scoreLabel = score >= 80 ? 'Great match!' : score >= 60 ? 'Good match. A few gaps to address.' : 'Needs work. Several gaps to fill.';

  // SVG gauge
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] mb-6">Match Score</h2>

      <div className="flex items-center justify-center gap-8 mb-8">
        {/* Circular Gauge */}
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
            <circle cx="70" cy="70" r={radius} fill="none" stroke={scoreColor} strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={offset}
              strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-4xl font-bold" style={{ color: scoreColor }}>{displayScore}</span>
          </div>
        </div>

        {/* Title & description */}
        <div className="text-left">
          {jobTitle && <h3 className="font-display text-lg font-semibold mb-1">{jobTitle}</h3>}
          <p className="text-sm text-[var(--text-secondary)]">{scoreLabel}</p>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <BreakdownCard title="Strong" items={strong} color="var(--success)" icon="✅" />
        <BreakdownCard title="Partial" items={partial} color="var(--warning)" icon="⚠️" />
        <BreakdownCard title="Gaps" items={gaps} color="var(--danger)" icon="❌" />
      </div>

      {/* Tailor Button */}
      <button onClick={onTailor} disabled={isLoading}
        className="flex items-center gap-2 mx-auto px-8 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity disabled:opacity-40">
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Tailoring...
          </>
        ) : (
          'Tailor My Resume →'
        )}
      </button>
    </div>
  );
}

function BreakdownCard({ title, items, color, icon }: { title: string; items: string[]; color: string; icon: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-left"
      style={{ borderLeftWidth: '3px', borderLeftColor: color }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{title}</span>
        <span className="text-xs font-mono text-[var(--text-muted)] ml-auto">{items.length}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-mono border"
            style={{ borderColor: `${color}30`, backgroundColor: `${color}08`, color }}>
            {item}
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-[10px] text-[var(--text-muted)] italic">None</span>
        )}
      </div>
    </div>
  );
}
