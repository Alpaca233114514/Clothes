import type { GarmentStatus } from "@/lib/types";

const statusClasses: Record<GarmentStatus, string> = {
  待分拣: "bg-amber-100 text-amber-800 border-amber-300",
  已分拣: "bg-emerald-100 text-emerald-800 border-emerald-300",
  异常: "bg-red-100 text-red-800 border-red-300"
};

export function StatusBadge({ status }: { status: GarmentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-sm font-bold ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}
