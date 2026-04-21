'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

const SKILL_SUGGESTIONS = [
  { name: 'JavaScript', category: 'language' }, { name: 'TypeScript', category: 'language' },
  { name: 'Python', category: 'language' }, { name: 'Java', category: 'language' },
  { name: 'C++', category: 'language' }, { name: 'Go', category: 'language' },
  { name: 'Rust', category: 'language' }, { name: 'Ruby', category: 'language' },
  { name: 'React', category: 'framework' }, { name: 'Next.js', category: 'framework' },
  { name: 'Vue', category: 'framework' }, { name: 'Angular', category: 'framework' },
  { name: 'Node.js', category: 'framework' }, { name: 'Express', category: 'framework' },
  { name: 'Django', category: 'framework' }, { name: 'FastAPI', category: 'framework' },
  { name: 'Spring Boot', category: 'framework' }, { name: 'Svelte', category: 'framework' },
  { name: 'PostgreSQL', category: 'database' }, { name: 'MySQL', category: 'database' },
  { name: 'MongoDB', category: 'database' }, { name: 'Redis', category: 'database' },
  { name: 'Docker', category: 'tool' }, { name: 'Kubernetes', category: 'tool' },
  { name: 'Git', category: 'tool' }, { name: 'AWS', category: 'cloud' },
  { name: 'Azure', category: 'cloud' }, { name: 'GCP', category: 'cloud' },
  { name: 'Terraform', category: 'tool' }, { name: 'GraphQL', category: 'tool' },
  { name: 'Figma', category: 'tool' }, { name: 'Linux', category: 'tool' },
  { name: 'CI/CD', category: 'tool' }, { name: 'Agile', category: 'soft-skill' },
  { name: 'Leadership', category: 'soft-skill' }, { name: 'Communication', category: 'soft-skill' },
];

interface Skill {
  id?: string;
  name: string;
  category?: string | null;
  proficiency?: string | null;
}

interface SkillTagsProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

const categoryColors: Record<string, string> = {
  language: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  framework: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  database: 'border-green-500/30 bg-green-500/10 text-green-400',
  tool: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  cloud: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  'soft-skill': 'border-pink-500/30 bg-pink-500/10 text-pink-400',
};

export default function SkillTags({ skills, onChange }: SkillTagsProps) {
  const [input, setInput] = useState('');

  const addSkill = (name: string, category?: string) => {
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    const suggestion = SKILL_SUGGESTIONS.find((s) => s.name.toLowerCase() === name.toLowerCase());
    onChange([...skills, { name, category: category || suggestion?.category || null }]);
    setInput('');
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      addSkill(input.trim());
    }
    if (e.key === 'Backspace' && !input && skills.length > 0) {
      removeSkill(skills.length - 1);
    }
  };

  const suggestions = input.length >= 1
    ? SKILL_SUGGESTIONS.filter(
        (s) => s.name.toLowerCase().includes(input.toLowerCase()) &&
          !skills.some((sk) => sk.name.toLowerCase() === s.name.toLowerCase())
      ).slice(0, 6)
    : [];

  // Unused skills that could be suggested
  const unusedSuggestions = SKILL_SUGGESTIONS.filter(
    (s) => !skills.some((sk) => sk.name.toLowerCase() === s.name.toLowerCase())
  ).slice(0, 8);

  return (
    <div>
      {/* Tags display */}
      <div className="flex flex-wrap gap-2 mb-3">
        {skills.map((skill, i) => (
          <span key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${categoryColors[skill.category || ''] || 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)]'}`}>
            {skill.name}
            <button onClick={() => removeSkill(i)} className="hover:opacity-70 transition-opacity">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a skill and press Enter..."
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all"
        />

        {/* Autocomplete dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg overflow-hidden z-10">
            {suggestions.map((s) => (
              <button key={s.name} onClick={() => addSkill(s.name, s.category)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-elevated)] flex items-center justify-between transition-colors">
                <span>{s.name}</span>
                <span className="text-xs text-[var(--text-muted)]">{s.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions row */}
      {skills.length < 5 && input.length === 0 && (
        <div className="mt-3">
          <p className="text-xs text-[var(--text-muted)] mb-2">Suggested skills:</p>
          <div className="flex flex-wrap gap-1.5">
            {unusedSuggestions.map((s) => (
              <button key={s.name} onClick={() => addSkill(s.name, s.category)}
                className="px-2.5 py-1 rounded-full border border-dashed border-[var(--border-subtle)] text-xs text-[var(--text-muted)] hover:border-[var(--border-focus)] hover:text-[var(--text-secondary)] transition-colors">
                + {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
