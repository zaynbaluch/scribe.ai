'use client';

interface StyleControlsProps {
  styles: {
    font?: string;
    fontSize?: number;
    lineSpacing?: number;
    accentColor?: string;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    showProfileImage?: boolean;
    qrSize?: number;
  };
  hasAvatar?: boolean;
  onChange: (styles: any) => void;
}

const FONTS = ['Inter', 'Roboto', 'Lato', 'Georgia', 'Times New Roman', 'Merriweather'];
const ACCENT_PRESETS = ['#7C3AED', '#06B6D4', '#FF3366', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#1a1a2e'];

export default function StyleControls({ styles, hasAvatar = true, onChange }: StyleControlsProps) {
  const update = (key: string, value: any) => onChange({ ...styles, [key]: value });

  return (
    <div className="space-y-4">
      <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Customization</h4>

      {/* Font */}
      <div>
        <label className="text-xs text-[var(--text-muted)] mb-1 block">Font</label>
        <select value={styles.font || 'Inter'} onChange={(e) => update('font', e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--border-focus)]">
          {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="text-xs text-[var(--text-muted)] mb-1 flex justify-between">
          <span>Font Size</span>
          <span className="font-mono">{styles.fontSize || 11}pt</span>
        </label>
        <input type="range" min={8} max={14} step={0.5} value={styles.fontSize || 11}
          onChange={(e) => update('fontSize', parseFloat(e.target.value))}
          className="w-full h-1 appearance-none rounded-full bg-[var(--bg-elevated)] accent-[var(--gradient-2)] cursor-pointer" />
      </div>

      {/* Line Spacing */}
      <div>
        <label className="text-xs text-[var(--text-muted)] mb-1 flex justify-between">
          <span>Line Spacing</span>
          <span className="font-mono">{(styles.lineSpacing || 1.15).toFixed(2)}</span>
        </label>
        <input type="range" min={0.9} max={1.6} step={0.05} value={styles.lineSpacing || 1.15}
          onChange={(e) => update('lineSpacing', parseFloat(e.target.value))}
          className="w-full h-1 appearance-none rounded-full bg-[var(--bg-elevated)] accent-[var(--gradient-2)] cursor-pointer" />
      </div>

      {/* Accent Color */}
      <div>
        <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Accent Color</label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {ACCENT_PRESETS.map((c) => (
            <button key={c} onClick={() => update('accentColor', c)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                styles.accentColor === c ? 'border-white scale-110 ring-2 ring-[var(--gradient-2)]/30' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          {/* Custom color input */}
          <label className="relative w-6 h-6 rounded-full border border-dashed border-[var(--border-subtle)] cursor-pointer overflow-hidden hover:border-[var(--border-focus)] transition-colors">
            <input type="color" value={styles.accentColor || '#7C3AED'}
              onChange={(e) => update('accentColor', e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="w-full h-full rounded-full" style={{
              background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)`,
            }} />
          </label>
        </div>
      </div>

      {/* Margins */}
      <div>
        <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Margins (inches)</label>
        <div className="grid grid-cols-2 gap-2">
          {(['marginTop', 'marginBottom', 'marginLeft', 'marginRight'] as const).map((key) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-[10px] text-[var(--text-muted)] capitalize w-8">{key.replace('margin', '')}</span>
              <input type="number" min={0.3} max={1.5} step={0.1}
                value={styles[key] ?? (key.includes('Left') || key.includes('Right') ? 0.6 : 0.5)}
                onChange={(e) => update(key, parseFloat(e.target.value))}
                className="flex-1 px-2 py-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-mono focus:outline-none focus:border-[var(--border-focus)] w-full" />
            </div>
          ))}
        </div>
      </div>
      {/* Toggle options */}
      <div className="pt-3 border-t border-[var(--grid-line)] space-y-3">

        {/* QR Code Size Slider */}
        <div className="space-y-1.5 px-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">QR Code Size</label>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">{styles.qrSize || 40}px</span>
          </div>
          <input 
            type="range" 
            min={30} 
            max={80} 
            step={2} 
            value={styles.qrSize || 40}
            onChange={(e) => update('qrSize', parseInt(e.target.value))}
            className="w-full h-1 appearance-none rounded-full bg-[var(--bg-elevated)] accent-[var(--gradient-2)] cursor-pointer" 
          />
        </div>
      </div>
    </div>
  );
}
