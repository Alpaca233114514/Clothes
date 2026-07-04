"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BackLink } from "@/components/BackLink";
import { StatusBadge } from "@/components/StatusBadge";
import type { GarmentItem, GarmentSku, GarmentStatus, Location } from "@/lib/types";
import {
  findItemByCode,
  getLocations,
  getSkus,
  recordItemAction,
  updateItem
} from "@/lib/storage";
import { nowIso } from "@/lib/utils";

const STATUSES: GarmentStatus[] = ["待分拣", "已分拣", "异常"];

export default function ItemDetailPage({
  params
}: {
  params: Promise<{ itemCode: string }>;
}) {
  const [itemCode, setItemCode] = useState("");
  const [item, setItem] = useState<GarmentItem | undefined>();
  const [skus, setSkus] = useState<GarmentSku[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    params.then((resolved) => setItemCode(decodeURIComponent(resolved.itemCode)));
  }, [params]);

  useEffect(() => {
    if (!itemCode) {
      return;
    }

    setItem(findItemByCode(itemCode));
    setSkus(getSkus());
    setLocations(getLocations());
  }, [itemCode]);

  const sku = useMemo(
    () => skus.find((entry) => entry.skuCode === item?.skuCode),
    [item, skus]
  );

  function updateField<K extends keyof GarmentItem>(key: K, value: GarmentItem[K]) {
    setItem((current) => (current ? { ...current, [key]: value } : current));
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item) {
      return;
    }

    if (!item.targetLocationCode || !item.currentLocationCode || !item.status) {
      setMessage("状态、目标位置、当前位置不能为空。");
      return;
    }

    const fromItem = findItemByCode(item.itemCode);
    if (!fromItem) {
      setMessage("保存失败：未找到该衣物。");
      return;
    }

    const saved = updateItem(item.itemCode, {
      ...item,
      ownerName: item.ownerName?.trim(),
      department: item.department?.trim(),
      note: item.note?.trim(),
      updatedAt: nowIso()
    });

    if (!saved) {
      setMessage("保存失败：未找到该衣物。");
      return;
    }

    recordItemAction({
      itemCode: saved.itemCode,
      action: "edit",
      fromItem,
      toItem: saved,
      message: "衣物详情已编辑"
    });
    setItem(saved);
    setMessage("保存成功。");
  }

  if (itemCode && !item) {
    return (
      <main className="page-shell">
        <div className="app-width space-y-4">
          <BackLink href="/items" />
          <div className="rounded-lg border border-red-300 bg-red-50 p-5 text-lg font-black text-red-800">
            未找到该衣物。
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="app-width space-y-4">
        <BackLink href="/items" />
        {item ? (
          <form
            onSubmit={handleSave}
            className="space-y-4 rounded-lg border border-line bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-ink">{item.itemCode}</h1>
                <p className="mt-1 text-sm font-bold text-slate-600">
                  {sku?.name ?? item.skuCode} · {sku?.size ?? "-"} · {item.batchCode}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </div>

            {message ? (
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm font-bold text-sky-800">
                {message}
              </div>
            ) : null}

            <Field label="姓名">
              <input
                value={item.ownerName ?? ""}
                onChange={(event) => updateField("ownerName", event.target.value)}
                className="control"
              />
            </Field>
            <Field label="部门">
              <input
                value={item.department ?? ""}
                onChange={(event) => updateField("department", event.target.value)}
                className="control"
              />
            </Field>
            <Field label="状态">
              <select
                value={item.status}
                onChange={(event) => updateField("status", event.target.value as GarmentStatus)}
                className="control"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="目标位置">
              <select
                value={item.targetLocationCode}
                onChange={(event) => updateField("targetLocationCode", event.target.value)}
                className="control"
              >
                {locations.map((location) => (
                  <option key={location.code} value={location.code}>
                    {location.code} - {location.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="当前位置">
              <select
                value={item.currentLocationCode}
                onChange={(event) => updateField("currentLocationCode", event.target.value)}
                className="control"
              >
                {locations.map((location) => (
                  <option key={location.code} value={location.code}>
                    {location.code} - {location.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="备注">
              <textarea
                value={item.note ?? ""}
                onChange={(event) => updateField("note", event.target.value)}
                className="control min-h-28"
              />
            </Field>

            <button className="min-h-14 w-full rounded-lg bg-sky-700 px-5 py-3 text-lg font-black text-white">
              保存
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-bold text-slate-600">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}
