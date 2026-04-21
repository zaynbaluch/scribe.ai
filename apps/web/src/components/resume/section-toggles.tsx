'use client';

import { GripVertical, Eye, EyeOff } from 'lucide-react';

interface SectionTogglesProps {
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  onOrderChange: (order: string[]) => void;
  onVisibilityChange: (visibility: Record<string, boolean>) => void;
}

const SECTION_LABELS: Record<string, string> = {
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  publications: 'Publications',
  volunteerWork: 'Volunteer Work',
};

export default function SectionToggles({ sectionOrder, sectionVisibility, onOrderChange, onVisibilityChange }: SectionTogglesProps) {
  // Ensure all sections are in the order array
  const allSections = Object.keys(SECTION_LABELS);
  const order = [...sectionOrder, ...allSections.filter((s) => !sectionOrder.includes(s))];

  const toggleVisibility = (section: string) => {
    onVisibilityChange({
      ...sectionVisibility,
      [section]: !(sectionVisibility[section] ?? true),
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...order];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    onOrderChange(newOrder);
  };

  return (
    <div>
      <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Sections</h4>
      <div className="space-y-1">
        {order.map((section, i) => {
          const isVisible = sectionVisibility[section] ?? true;
          return (
            <div key={section}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg group transition-colors ${
                isVisible ? 'hover:bg-[var(--bg-elevated)]' : 'opacity-50 hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {/* Drag / reorder buttons */}
              <div className="flex flex-col -space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveSection(i, 'up')} disabled={i === 0}
                  className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] disabled:opacity-30 text-[10px]">▲</button>
                <button onClick={() => moveSection(i, 'down')} disabled={i === order.length - 1}
                  className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] disabled:opacity-30 text-[10px]">▼</button>
              </div>

              <GripVertical size={12} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-50 transition-opacity" />

              {/* Label */}
              <span className="flex-1 text-xs font-medium">{SECTION_LABELS[section] || section}</span>

              {/* Visibility toggle */}
              <button onClick={() => toggleVisibility(section)}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                {isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
