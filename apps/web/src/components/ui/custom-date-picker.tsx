'use client';

import { useState, useEffect } from 'react';

interface CustomDatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mode?: 'month' | 'date';
}

export default function CustomDatePicker({ label, value, onChange, mode = 'month' }: CustomDatePickerProps) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 70 }, (_, i) => currentYear + 10 - i);

  // Parse initial value (expected ISO string or YYYY-MM-DD)
  const date = value ? new Date(value) : new Date();
  const [initialYear, setInitialYear] = useState(isNaN(date.getTime()) ? currentYear : date.getFullYear());
  const [initialMonth, setInitialMonth] = useState(isNaN(date.getTime()) ? 0 : date.getMonth());
  const [initialDay, setInitialDay] = useState(isNaN(date.getTime()) ? 1 : date.getDate());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setInitialYear(d.getFullYear());
        setInitialMonth(d.getMonth());
        setInitialDay(d.getDate());
      }
    }
  }, [value]);

  const handleUpdate = (y: number, m: number, d: number) => {
    const newDate = new Date(y, m, d);
    onChange(newDate.toISOString());
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        {mode === 'date' && (
          <select 
            value={initialDay} 
            onChange={(e) => handleUpdate(initialYear, initialMonth, parseInt(e.target.value))}
            className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:border-[var(--gradient-2)]"
          >
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>
        )}
        <select 
          value={initialMonth} 
          onChange={(e) => handleUpdate(initialYear, parseInt(e.target.value), initialDay)}
          className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:border-[var(--gradient-2)]"
        >
          {months.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>
        <select 
          value={initialYear} 
          onChange={(e) => handleUpdate(parseInt(e.target.value), initialMonth, initialDay)}
          className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:border-[var(--gradient-2)]"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
