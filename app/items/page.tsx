"use client";

import { useEffect, useMemo, useState } from "react";
import { BackLink } from "@/components/BackLink";
import { ItemCard } from "@/components/ItemCard";
import type { GarmentItem, GarmentSku, GarmentStatus } from "@/lib/types";
import { getItems, getSkus } from "@/lib/storage";

type FilterStatus = "全部" | GarmentStatus;

const FILTERS: FilterStatus[] = ["全部", "待分拣", "已分拣", "异常"];

export default function ItemsPage() {
  const [items, setItems] = useState<GarmentItem[]>([]);
  const [skus, setSkus] = useState<GarmentSku[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("全部");

  useEffect(() => {
    setItems(getItems());
    setSkus(getSkus());
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const sku = skus.find((entry) => entry.skuCode === item.skuCode);
      const matchesStatus = filter === "全部" || item.status === filter;
      const haystack = [
        item.itemCode,
        item.skuCode,
        item.ownerName ?? "",
        item.department ?? "",
        sku?.name ?? "",
        sku?.size ?? ""
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [filter, items, query, skus]);

  return (
    <main className="page-shell">
      <div className="app-width space-y-4">
        <BackLink />
        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-black text-ink">衣物列表</h1>
          <div className="mt-4 space-y-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-h-12 w-full rounded-lg border border-line px-4 font-semibold"
              placeholder="搜索 itemCode / skuCode / 姓名 / 部门"
            />
            <div className="grid grid-cols-4 gap-2">
              {FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`min-h-11 rounded-lg border px-2 text-sm font-bold ${
                    filter === status
                      ? "border-sky-700 bg-sky-700 text-white"
                      : "border-line bg-white text-ink"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-800">
            localStorage 暂无数据，请先初始化示例数据。
          </div>
        ) : null}

        <section className="space-y-3">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.itemCode}
              item={item}
              sku={skus.find((sku) => sku.skuCode === item.skuCode)}
            />
          ))}
          {items.length > 0 && filteredItems.length === 0 ? (
            <div className="rounded-lg border border-line bg-white p-5 text-center font-bold text-slate-600">
              没有匹配的衣物。
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
