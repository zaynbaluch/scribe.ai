'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';

interface BulletsEditorProps {
  label?: string;
  bullets: string[];
  onChange: (bullets: string[]) => void;
  placeholder?: string;
}

export default function BulletsEditor({ label, bullets, onChange, placeholder }: BulletsEditorProps) {
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
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">{label}</label>
      )}
      <div className="space-y-2">
        {bullets.map((bullet, index) => (
          <div key={index} className="flex items-start gap-2 group">
            <GripVertical size={14} className="mt-2.5 text-[var(--text-muted)] cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            <textarea
              value={bullet}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={placeholder || "Add a key achievement or responsibility..."}
              rows={1}
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all resize-none overflow-hidden"
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <button
              onClick={() => handleRemove(index)}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all flex-shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={handleAdd}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-dashed border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-focus)] hover:bg-[var(--bg-elevated)] transition-all mt-2"
      >
        <Plus size={14} /> Add Bullet Point
      </button>
    </div>
  );
}
