interface StatBoxProps {
  value: string | number;
  label: string;
  accent?: boolean;
  className?: string;
}

export function StatBox({ value, label, accent = false, className = "" }: StatBoxProps) {
  return (
    <div
      className={`bg-[#222] rounded-lg p-4 border border-[#333] flex flex-col gap-1 ${className}`}
    >
      <span
        className={`font-mono text-3xl font-bold leading-none tabular-nums ${
          accent ? "text-[#F99300]" : "text-[#f5f5f5]"
        }`}
      >
        {value}
      </span>
      <span className="text-xs text-[#9ca3af] uppercase tracking-wider">{label}</span>
    </div>
  );
}
