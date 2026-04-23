'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface BulletsEditorProps {
  label?: string;
  bullets: string[];
  onChange: (bullets: string[]) => void;
  placeholder?: string;
}

export default function BulletsEditor({ label, bullets, onChange, placeholder }: BulletsEditorProps) {
  const textareasRef = useRef<(HTMLTextAreaElement | null)[]>([]);

  const autoResize = (index: number) => {
    const target = textareasRef.current[index];
    if (target) {
      target.style.height = 'auto';
      target.style.height = `${target.scrollHeight}px`;
    }
  };

  useEffect(() => {
    bullets.forEach((_, i) => autoResize(i));
  }, [bullets.length]); // Also resize when a new bullet is added

  // Resize on initial mount for all bullets
  useEffect(() => {
    bullets.forEach((_, i) => autoResize(i));
  }, []);

  const handleAdd = () => {
    onChange([...bullets, '']);
  };

  const handleRemove = (index: number) => {
    onChange(bullets.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, value: string) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    onChange(newBullets);
    // Use setTimeout to allow state update to reflect in DOM before resizing
    setTimeout(() => autoResize(index), 0);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 font-semibold">{label}</label>
      )}
      <div className="flex flex-col gap-3">
        {bullets.map((bullet, index) => (
          <div key={index} className="flex items-start gap-2 group relative">
            <GripVertical size={14} className="mt-3 text-[var(--text-muted)] cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            <textarea
              ref={el => { textareasRef.current[index] = el; }}
              value={bullet}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={placeholder || "Add a key achievement or responsibility..."}
              rows={1}
              className="flex-1 px-3 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-[border,box-shadow] resize-none overflow-hidden min-h-[40px]"
              onInput={() => autoResize(index)}
            />
            <button
              onClick={() => handleRemove(index)}
              className="p-2.5 mt-0.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors flex-shrink-0"
              title="Remove bullet"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={handleAdd}
        className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border border-dashed border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-focus)] hover:bg-[var(--bg-elevated)] transition-all mt-1"
      >
        <Plus size={14} /> Add Bullet Point
      </button>
    </div>
  );
}
