interface CompletenessBarProps {
  value: number; // 0–100
}

export default function CompletenessBar({ value }: CompletenessBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            background: 'linear-gradient(90deg, var(--gradient-1), var(--gradient-2))',
          }}
        />
      </div>
      <span className="font-mono text-sm text-[var(--text-secondary)] tabular-nums w-10 text-right">
        {clamped}%
      </span>
    </div>
  );
}
