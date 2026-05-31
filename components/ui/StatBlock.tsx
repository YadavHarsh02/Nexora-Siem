interface StatBlockProps {
  label: string;
  value: string;
}

export default function StatBlock({
  label,
  value,
}: StatBlockProps) {
  return (
    <div className="space-y-1">
      <div className="font-heading text-3xl md:text-[38px] font-semibold text-primary leading-none">
        {value}
      </div>
      <div className="font-mono text-[10px] md:text-xs tracking-[0.18em] text-white/40 uppercase">
        {label}
      </div>
    </div>
  );
}
