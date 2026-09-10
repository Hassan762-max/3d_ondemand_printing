export function PortalStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4 shadow-[0_1px_0_rgba(12,14,18,0.03)]">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)]">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}
