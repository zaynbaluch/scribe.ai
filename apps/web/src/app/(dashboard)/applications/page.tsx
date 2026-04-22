'use client';

import { useEffect, useState } from 'react';
import { KanbanSquare, Plus, X } from 'lucide-react';
import { useApplicationStore, type AppStatus } from '@/stores/application-store';
import { api } from '@/lib/api-client';
import KanbanBoard from '@/components/applications/kanban-board';
import ApplicationDetail from '@/components/applications/application-detail';
import { toast } from 'sonner';

export default function ApplicationsPage() {
  const { applications, isLoading, fetchApplications, updateStatus, updateApplication, deleteApplication } = useApplicationStore();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', location: '', url: '' });

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

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company) {
      toast.error('Title and Company are required');
      return;
    }
    try {
      // First create the job
      const jobData = await api.post<any>('/api/jobs', newJob);
      // Then create application
      await api.post('/api/applications', { jobId: jobData.id, status: 'saved' });
      toast.success('Application added');
      setIsAddModalOpen(false);
      setNewJob({ title: '', company: '', location: '', url: '' });
      fetchApplications();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add application');
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
        <button onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-colors">
          <Plus size={14} /> Add Application
        </button>
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-[var(--bg-primary)] border border-[var(--grid-line-strong)] rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-[var(--grid-line-strong)] flex justify-between items-center">
              <h2 className="font-display text-lg tracking-tight">Add Application</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateApplication} className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block">Job Title <span className="text-red-500">*</span></label>
                <input required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--border-focus)]" placeholder="e.g. Frontend Engineer" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Company <span className="text-red-500">*</span></label>
                <input required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--border-focus)]" placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Location</label>
                <input value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--border-focus)]" placeholder="e.g. Remote, NY" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">URL</label>
                <input value={newJob.url} onChange={e => setNewJob({...newJob, url: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--border-focus)]" placeholder="https://..." />
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity">
                  Add Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
