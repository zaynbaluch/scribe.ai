'use client';

import { useState } from 'react';
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

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const toggleVisibility = (section: string) => {
    onVisibilityChange({
      ...sectionVisibility,
      [section]: !(sectionVisibility[section] ?? true),
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newOrder = [...order];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    onOrderChange(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div>
      <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Sections</h4>
      <div className="space-y-1">
        {order.map((section, i) => {
          const isVisible = sectionVisibility[section] ?? true;
          return (
            <div key={section}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()} // necessary to allow dropping
              className={`flex items-center gap-3 px-2 py-2 rounded-lg group transition-colors cursor-grab active:cursor-grabbing border ${
                draggedIndex === i ? 'bg-[var(--bg-elevated)] border-[var(--border-focus)] shadow-md opacity-75' : 'border-transparent'
              } ${isVisible ? 'hover:bg-[var(--bg-elevated)]' : 'opacity-50 hover:bg-[var(--bg-elevated)]'}`}
            >
              <GripVertical size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors" />

              {/* Label */}
              <span className="flex-1 text-xs font-medium">{SECTION_LABELS[section] || section}</span>

              {/* Visibility toggle */}
              <button onClick={(e) => { e.stopPropagation(); toggleVisibility(section); }}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                onPointerDown={(e) => e.stopPropagation()} /* prevent dragging when clicking eye */
              >
                {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
