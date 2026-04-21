'use client';

interface TemplatePicker {
  templates: { id: string; name: string; category: string; description: string }[];
  selected: string;
  onSelect: (id: string) => void;
}

const templateColors: Record<string, string> = {
  'modern-01': '#7C3AED', 'classic-02': '#1a1a2e', 'compact-03': '#7C3AED',
  'minimal-04': '#71717A', 'bold-05': '#7C3AED',
};

export default function TemplatePicker({ templates, selected, onSelect }: TemplatePicker) {
  const fallback = [
    { id: 'modern-01', name: 'Modern Clean', category: 'modern', description: 'Single-column, accent dividers' },
    { id: 'classic-02', name: 'Classic Pro', category: 'classic', description: 'Two-column header, serif feel' },
    { id: 'compact-03', name: 'Compact', category: 'compact', description: 'Sidebar layout, max content' },
    { id: 'minimal-04', name: 'Minimalist', category: 'minimal', description: 'No color, ultra-clean' },
    { id: 'bold-05', name: 'Bold', category: 'bold', description: 'Accent bars, strong hierarchy' },
  ];

  const items = templates.length > 0 ? templates : fallback;

  return (
    <div>
      <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Template</h4>
      <div className="grid grid-cols-2 gap-2">
        {items.map((t) => {
          const color = templateColors[t.id] || '#7C3AED';
          const isSelected = selected === t.id;
          return (
            <button key={t.id} onClick={() => onSelect(t.id)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'border-[var(--gradient-2)] bg-[var(--gradient-2)]/5 ring-1 ring-[var(--gradient-2)]/20'
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-focus)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {/* Mini preview */}
              <div className="w-full h-10 rounded bg-white flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0" style={{
                  backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 5px, ${color}08 5px, ${color}08 6px)`,
                }} />
                <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: color }} />
              </div>
              <span className="text-[10px] font-medium w-full truncate text-center">{t.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
