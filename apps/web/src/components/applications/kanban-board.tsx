'use client';

import { useState } from 'react';
import { type AppStatus } from '@/stores/application-store';
import KanbanCard from './kanban-card';

interface Application {
  id: string;
  status: AppStatus;
  appliedAt: string | null;
  job: { title: string; company: string; location: string | null; matchScore: number | null };
  [key: string]: any;
}

interface KanbanBoardProps {
  applications: Application[];
  onStatusChange: (appId: string, newStatus: AppStatus) => void;
  onCardClick: (app: Application) => void;
}

const COLUMNS: { id: AppStatus; label: string; color: string }[] = [
  { id: 'saved', label: 'Saved', color: 'var(--text-muted)' },
  { id: 'applied', label: 'Applied', color: 'var(--gradient-2)' },
  { id: 'screening', label: 'Screening', color: '#f59e0b' },
  { id: 'interview', label: 'Interview', color: '#8b5cf6' },
  { id: 'offer', label: 'Offer', color: 'var(--success)' },
  { id: 'rejected', label: 'Rejected', color: 'var(--danger)' },
];

export default function KanbanBoard({ applications, onStatusChange, onCardClick }: KanbanBoardProps) {
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent, columnId: AppStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const appId = e.dataTransfer.getData('applicationId');
    if (appId) {
      onStatusChange(appId, columnId);
    }
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(columnId);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 180px)' }}>
      {COLUMNS.map((col) => {
        const colApps = applications.filter((a) => a.status === col.id);
        const isDragOver = dragOverCol === col.id;

        return (
          <div
            key={col.id}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => setDragOverCol(null)}
            className={`flex-shrink-0 w-[220px] rounded-xl border transition-colors ${
              isDragOver
                ? 'border-[var(--gradient-2)]/50 bg-[var(--gradient-2)]/5'
                : 'border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)]'
            }`}
          >
            {/* Column Header */}
            <div className="px-3 py-2.5 border-b border-[var(--grid-line)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-xs font-semibold">{col.label}</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
                {colApps.length}
              </span>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 min-h-[100px]">
              {colApps.map((app) => (
                <KanbanCard key={app.id} app={app} onClick={() => onCardClick(app)} />
              ))}
              {colApps.length === 0 && (
                <div className="text-[10px] text-[var(--text-muted)] text-center py-6 italic">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
