import Link from "next/link";
import type { GarmentItem, GarmentSku } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ItemCard({
  item,
  sku
}: {
  item: GarmentItem;
  sku?: GarmentSku;
}) {
  return (
    <Link
      href={`/items/${item.itemCode}`}
      className="block rounded-lg border border-line bg-white p-4 shadow-sm transition hover:border-sky-400"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-black text-ink">{item.itemCode}</div>
          <div className="mt-1 text-sm text-slate-600">
            {sku?.name ?? item.skuCode} · {sku?.size ?? "-"}
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Info label="目标位置" value={item.targetLocationCode} />
        <Info label="当前位置" value={item.currentLocationCode} />
        <Info label="SKU" value={item.skuCode} />
        <Info label="批次" value={item.batchCode} />
      </div>
    </Link>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold text-slate-500">{label}</div>
      <div className="mt-1 break-words font-semibold text-ink">{value}</div>
    </div>
  );
}
