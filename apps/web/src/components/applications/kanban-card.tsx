'use client';

import { type AppStatus } from '@/stores/application-store';
import { Briefcase, GripVertical } from 'lucide-react';

interface Application {
  id: string;
  status: AppStatus;
  appliedAt: string | null;
  matchScore?: number | null;
  job: { title: string; company: string; location: string | null; matchScore: number | null };
}

interface KanbanCardProps {
  app: Application;
  onClick: () => void;
}

export default function KanbanCard({ app, onClick }: KanbanCardProps) {
  const score = app.job.matchScore;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('applicationId', app.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={onClick}
      className="group rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 cursor-pointer hover:border-[var(--border-focus)] hover:shadow-md transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium truncate">{app.job.title}</h4>
          <p className="text-[11px] text-[var(--text-muted)] truncate">{app.job.company}</p>
        </div>
        <GripVertical size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
      </div>

      <div className="flex items-center gap-2 mt-2">
        {score !== null && score !== undefined && (
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
            score >= 80 ? 'text-[var(--success)] border-[var(--success)]/30 bg-[var(--success)]/8'
              : score >= 60 ? 'text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/8'
              : 'text-[var(--text-muted)] border-[var(--border-subtle)]'
          }`}>
            {score}%
          </span>
        )}
        {app.job.location && (
          <span className="text-[9px] text-[var(--text-muted)] truncate">{app.job.location}</span>
        )}
        {app.appliedAt && (
          <span className="text-[9px] text-[var(--text-muted)] ml-auto">
            {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
