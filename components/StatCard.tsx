import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-black text-ink">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}
