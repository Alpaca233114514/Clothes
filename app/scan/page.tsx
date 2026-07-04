"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { BackLink } from "@/components/BackLink";
import { BigActionButton } from "@/components/BigActionButton";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import type { GarmentItem, GarmentSku, Location, SortingStats } from "@/lib/types";
import {
  addScanLog,
  findItemByCode,
  getLocations,
  getSkus,
  getStats,
  recordItemAction,
  updateItem
} from "@/lib/storage";
import { CURRENT_BATCH_CODE, nowIso } from "@/lib/utils";

export default function ScanPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [stats, setStats] = useState<SortingStats>(getStats());
  const [skus, setSkus] = useState<GarmentSku[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentItem, setCurrentItem] = useState<GarmentItem | undefined>();
  const [notice, setNotice] = useState<{ tone: "ok" | "warn" | "bad"; text: string }>();
  const [selectedLocation, setSelectedLocation] = useState("");

  const currentSku = useMemo(
    () => skus.find((sku) => sku.skuCode === currentItem?.skuCode),
    [currentItem, skus]
  );

  function refresh() {
    setStats(getStats());
    setSkus(getSkus());
    setLocations(getLocations());
  }

  function focusInput() {
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  useEffect(() => {
    refresh();
    focusInput();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    setCode("");

    if (!normalized) {
      setNotice({ tone: "bad", text: "请输入衣物二维码编号。" });
      focusInput();
      return;
    }

    const item = findItemByCode(normalized);
    if (!item) {
      setCurrentItem(undefined);
      setNotice({ tone: "bad", text: `未找到衣物：${normalized}` });
      focusInput();
      return;
    }

    addScanLog({
      itemCode: item.itemCode,
      action: "scan",
      fromStatus: item.status,
      toStatus: item.status,
      fromLocationCode: item.currentLocationCode,
      toLocationCode: item.currentLocationCode,
      message: item.status === "已分拣" ? "重复扫码：该衣物已分拣" : "扫码查询成功"
    });

    setCurrentItem(item);
    setSelectedLocation(item.targetLocationCode);
    setNotice(
      item.status === "已分拣"
        ? { tone: "warn", text: "该衣物已分拣，请确认是否重复操作" }
        : { tone: "ok", text: "查询成功，请按目标位置分拣。" }
    );
    refresh();
    focusInput();
  }

  function sortCurrentItem() {
    if (!currentItem) {
      return;
    }

    const fromItem = currentItem;
    const toItem = {
      ...fromItem,
      status: "已分拣" as const,
      currentLocationCode: fromItem.targetLocationCode,
      updatedAt: nowIso()
    };
    const saved = updateItem(fromItem.itemCode, toItem);
    if (!saved) {
      setNotice({ tone: "bad", text: "保存失败：衣物不存在。" });
      return;
    }

    recordItemAction({
      itemCode: saved.itemCode,
      action: "sorted",
      fromItem,
      toItem: saved,
      message:
        fromItem.status === "已分拣"
          ? "重复确认分拣"
          : `已放入目标位置 ${saved.targetLocationCode}`
    });
    setCurrentItem(saved);
    setNotice({ tone: "ok", text: `已确认放入 ${saved.targetLocationCode}` });
    refresh();
    focusInput();
  }

  function markException() {
    if (!currentItem) {
      return;
    }

    const fromItem = currentItem;
    const toItem = {
      ...fromItem,
      status: "异常" as const,
      currentLocationCode: "异常区",
      updatedAt: nowIso()
    };
    const saved = updateItem(fromItem.itemCode, toItem);
    if (!saved) {
      setNotice({ tone: "bad", text: "保存失败：衣物不存在。" });
      return;
    }

    recordItemAction({
      itemCode: saved.itemCode,
      action: "exception",
      fromItem,
      toItem: saved,
      message: "已标记异常并移动到异常区"
    });
    setCurrentItem(saved);
    setNotice({ tone: "bad", text: "已标记异常，位置更新为异常区。" });
    refresh();
    focusInput();
  }

  function changeTargetLocation() {
    if (!currentItem || !selectedLocation) {
      setNotice({ tone: "bad", text: "请选择目标位置。" });
      return;
    }

    const fromItem = currentItem;
    const toItem = {
      ...fromItem,
      targetLocationCode: selectedLocation,
      updatedAt: nowIso()
    };
    const saved = updateItem(fromItem.itemCode, toItem);
    if (!saved) {
      setNotice({ tone: "bad", text: "保存失败：衣物不存在。" });
      return;
    }

    recordItemAction({
      itemCode: saved.itemCode,
      action: "location_changed",
      fromItem,
      toItem: saved,
      message: `目标位置改为 ${selectedLocation}`
    });
    setCurrentItem(saved);
    setNotice({ tone: "ok", text: `目标位置已更新为 ${selectedLocation}` });
    refresh();
    focusInput();
  }

  const noticeClass =
    notice?.tone === "bad"
      ? "border-red-300 bg-red-50 text-red-800"
      : notice?.tone === "warn"
        ? "border-amber-300 bg-amber-50 text-amber-800"
        : "border-emerald-300 bg-emerald-50 text-emerald-800";

  return (
    <main className="page-shell">
      <div className="app-width space-y-4">
        <div className="flex items-center justify-between gap-3">
          <BackLink />
          <div className="text-right text-sm font-bold text-slate-600">
            当前批次：{CURRENT_BATCH_CODE}
          </div>
        </div>

        <section className="grid grid-cols-3 gap-2">
          <StatCard label="已完成/总数" value={`${stats.sorted}/${stats.total}`} />
          <StatCard label="待分拣" value={stats.pending} />
          <StatCard label="异常" value={stats.exception} />
        </section>

        {stats.total === 0 ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-800">
            localStorage 暂无数据，请先返回首页初始化示例数据。
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-white p-4 shadow-sm">
          <input
            ref={inputRef}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="h-20 w-full rounded-lg border-2 border-sky-700 px-4 text-xl font-black outline-none focus:ring-4 focus:ring-sky-200"
            placeholder="扫描或输入衣物二维码编号，例如 ITEM-000001"
          />
          <button className="mt-3 min-h-14 w-full rounded-lg bg-sky-700 px-5 py-3 text-lg font-black text-white">
            查询
          </button>
        </form>

        {notice ? (
          <div className={`rounded-lg border p-4 text-base font-black ${noticeClass}`}>
            {notice.text}
          </div>
        ) : null}

        {currentItem ? (
          <section className="rounded-lg border-2 border-sky-700 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-ink">
                  {currentSku?.name ?? currentItem.skuCode}
                </h1>
                <div className="mt-1 text-base font-bold text-slate-600">
                  {currentSku?.color ?? "-"} · 尺码 {currentSku?.size ?? "-"}
                </div>
              </div>
              <StatusBadge status={currentItem.status} />
            </div>

            <div className="my-6 rounded-lg bg-sky-700 p-6 text-center text-white">
              <div className="text-sm font-bold opacity-90">目标位置</div>
              <div className="mt-2 text-6xl font-black tracking-normal">
                {currentItem.targetLocationCode}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="itemCode" value={currentItem.itemCode} />
              <Info label="skuCode" value={currentItem.skuCode} />
              <Info label="当前所在位置" value={currentItem.currentLocationCode} />
              <Info label="当前状态" value={currentItem.status} />
            </div>

            <div className="mt-5 grid gap-3">
              <BigActionButton onClick={sortCurrentItem} tone="primary">
                确认放入目标位置
              </BigActionButton>
              <BigActionButton onClick={markException} tone="danger">
                标记异常
              </BigActionButton>
              <div className="rounded-lg border border-line bg-slate-50 p-3">
                <label className="text-sm font-bold text-slate-600">修改目标位置</label>
                <div className="mt-2 flex gap-2">
                  <select
                    value={selectedLocation}
                    onChange={(event) => setSelectedLocation(event.target.value)}
                    className="min-h-12 flex-1 rounded-lg border border-line bg-white px-3 font-bold"
                  >
                    <option value="">选择位置</option>
                    {locations.map((location) => (
                      <option key={location.code} value={location.code}>
                        {location.code} - {location.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={changeTargetLocation}
                    className="min-h-12 rounded-lg bg-ink px-4 font-bold text-white"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="text-xs font-bold text-slate-500">{label}</div>
      <div className="mt-1 break-words text-base font-black text-ink">{value}</div>
    </div>
  );
}
