"use client";

import { useEffect, useState } from "react";
import { BigActionButton } from "@/components/BigActionButton";
import { StatCard } from "@/components/StatCard";
import type { SortingStats } from "@/lib/types";
import { initializeDemoData } from "@/lib/demo-data";
import { clearAllData, getStats } from "@/lib/storage";
import { CURRENT_BATCH_CODE, formatPercent } from "@/lib/utils";

const EMPTY_STATS: SortingStats = {
  total: 0,
  pending: 0,
  sorted: 0,
  exception: 0,
  completionRate: 0
};

export default function HomePage() {
  const [stats, setStats] = useState<SortingStats>(EMPTY_STATS);
  const [message, setMessage] = useState("");

  function refresh() {
    setStats(getStats());
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleInit() {
    initializeDemoData();
    refresh();
    setMessage("已初始化 30 件蓝色制服上衣示例数据。");
  }

  function handleClear() {
    clearAllData();
    refresh();
    setMessage("本地数据已清空。");
  }

  return (
    <main className="page-shell">
      <div className="app-width space-y-5">
        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h1 className="text-3xl font-black leading-tight text-ink">
            工服分拣系统 Demo
          </h1>
          <p className="mt-3 text-base font-semibold text-slate-600">
            当前批次：{CURRENT_BATCH_CODE}
          </p>
        </section>

        {stats.total === 0 ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-800">
            localStorage 暂无数据，请先初始化示例数据。
          </div>
        ) : null}

        {message ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm font-bold text-sky-800">
            {message}
          </div>
        ) : null}

        <section className="grid grid-cols-2 gap-3">
          <StatCard label="总件数" value={stats.total} />
          <StatCard label="待分拣" value={stats.pending} />
          <StatCard label="已分拣" value={stats.sorted} />
          <StatCard label="异常" value={stats.exception} />
          <div className="col-span-2">
            <StatCard
              label="当前批次完成率"
              value={formatPercent(stats.completionRate)}
              hint="异常不计入已完成"
            />
          </div>
        </section>

        <section className="grid gap-3">
          <BigActionButton href="/scan" tone="primary">
            开始分拣
          </BigActionButton>
          <BigActionButton href="/items">衣物列表</BigActionButton>
          <BigActionButton href="/locations">位置管理</BigActionButton>
          <BigActionButton href="/logs">扫码记录</BigActionButton>
          <BigActionButton onClick={handleInit} tone="warning">
            初始化示例数据
          </BigActionButton>
          <BigActionButton onClick={handleClear} tone="danger">
            清空本地数据
          </BigActionButton>
        </section>
      </div>
    </main>
  );
}
