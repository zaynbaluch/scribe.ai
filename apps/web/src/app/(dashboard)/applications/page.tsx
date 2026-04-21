'use client';

import { useEffect, useState } from 'react';
import { KanbanSquare } from 'lucide-react';
import { useApplicationStore, type AppStatus } from '@/stores/application-store';
import KanbanBoard from '@/components/applications/kanban-board';
import ApplicationDetail from '@/components/applications/application-detail';
import { toast } from 'sonner';

export default function ApplicationsPage() {
  const { applications, isLoading, fetchApplications, updateStatus, updateApplication, deleteApplication } = useApplicationStore();
  const [selectedApp, setSelectedApp] = useState<any>(null);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleStatusChange = async (appId: string, newStatus: AppStatus) => {
    try {
      await updateStatus(appId, newStatus);
      toast.success(`Moved to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedApp) return;
    try {
      await updateApplication(selectedApp.id, data);
      toast.success('Updated');
      setSelectedApp(null);
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedApp) return;
    try {
      await deleteApplication(selectedApp.id);
      toast.success('Deleted');
      setSelectedApp(null);
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="h-8 w-48 bg-[var(--bg-elevated)] rounded-md animate-pulse"></div>
        <div className="flex gap-3 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[220px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)]">
              <div className="px-3 py-2.5 border-b border-[var(--grid-line)]"><div className="w-16 h-4 bg-[var(--bg-elevated)] rounded animate-pulse"></div></div>
              <div className="p-2 space-y-2">
                <div className="h-24 w-full bg-[var(--bg-elevated)] rounded-lg animate-pulse"></div>
                <div className="h-24 w-full bg-[var(--bg-elevated)] rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <KanbanSquare size={18} className="text-[var(--gradient-2)]" />
          <h1 className="font-display text-2xl tracking-tight">Applications</h1>
          <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded ml-2">
            {applications.length}
          </span>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
            <KanbanSquare size={24} className="text-[var(--text-muted)]" />
          </div>
          <h3 className="font-semibold mb-1">No applications yet</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4 max-w-md">
            Applications are created when you save a job from the AI Tailoring flow or add one from the Jobs page.
          </p>
        </div>
      ) : (
        <KanbanBoard
          applications={applications}
          onStatusChange={handleStatusChange}
          onCardClick={(app) => setSelectedApp(app)}
        />
      )}

      {selectedApp && (
        <ApplicationDetail
          app={selectedApp}
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
