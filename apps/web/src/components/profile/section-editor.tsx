'use client';

import { useState } from 'react';
import { Trash2, GripVertical, Plus, ChevronDown, ChevronRight } from 'lucide-react';

interface SectionEditorProps {
  title: string;
  items: any[];
  onUpdate: (items: any[]) => void;
  renderForm: (item: any, onChange: (item: any) => void) => React.ReactNode;
  createEmpty: () => any;
  getItemTitle?: (item: any) => string;
  getItemSubtitle?: (item: any) => string;
}

export default function SectionEditor({
  title, items, onUpdate, renderForm, createEmpty, getItemTitle, getItemSubtitle,
}: SectionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(items.length > 0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addItem = () => {
    const newItems = [...items, createEmpty()];
    onUpdate(newItems);
    setEditingIndex(newItems.length - 1);
    setIsExpanded(true);
  };

  const removeItem = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const updateItem = (index: number, updated: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updated };
    onUpdate(newItems);
  };

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)] backdrop-blur-md overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--bg-elevated)] transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="font-mono text-xs px-2 py-0.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)]">
            {items.length}
          </span>
        </div>
      </button>

      {/* Items */}
      {isExpanded && (
        <div className="border-t border-[var(--border-subtle)]">
          {items.map((item, index) => (
            <div key={item.id || index} className="border-b border-[var(--grid-line)] last:border-b-0">
              {editingIndex === index ? (
                /* Edit mode */
                <div className="p-5 bg-[var(--bg-elevated)]/50">
                  {renderForm(item, (updated) => updateItem(index, updated))}
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setEditingIndex(null)}
                      className="px-3 py-1.5 text-sm rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors">
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-center gap-3 px-5 py-3 group hover:bg-[var(--bg-elevated)]/30 transition-colors">
                  <GripVertical size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                  <div className="flex-1 cursor-pointer" onClick={() => setEditingIndex(index)}>
                    <p className="text-sm font-medium">{getItemTitle?.(item) || `Item ${index + 1}`}</p>
                    {getItemSubtitle && (
                      <p className="text-xs text-[var(--text-muted)]">{getItemSubtitle(item)}</p>
                    )}
                  </div>
                  <button onClick={() => removeItem(index)}
                    className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add button */}
          <button onClick={addItem}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/30 border-t border-dashed border-[var(--border-subtle)] transition-colors">
            <Plus size={14} />
            Add {title.replace(/s$/, '')}
          </button>
        </div>
      )}
    </div>
  );
}
