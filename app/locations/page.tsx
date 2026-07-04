"use client";

import { FormEvent, useEffect, useState } from "react";
import { BackLink } from "@/components/BackLink";
import type { Location } from "@/lib/types";
import { getLocations, isLocationInUse, saveLocations } from "@/lib/storage";

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState<Location>({ code: "", name: "", type: "箱子" });
  const [message, setMessage] = useState<{ tone: "ok" | "bad"; text: string }>();

  function refresh() {
    setLocations(getLocations());
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = form.code.trim();
    const name = form.name.trim();
    const type = form.type.trim();

    if (!code || !name || !type) {
      setMessage({ tone: "bad", text: "code、name、type 均不能为空。" });
      return;
    }

    if (locations.some((location) => location.code === code)) {
      setMessage({ tone: "bad", text: `位置 ${code} 已存在。` });
      return;
    }

    saveLocations([...locations, { code, name, type }]);
    setForm({ code: "", name: "", type: "箱子" });
    setMessage({ tone: "ok", text: `已新增位置 ${code}。` });
    refresh();
  }

  function deleteLocation(code: string) {
    if (isLocationInUse(code)) {
      setMessage({ tone: "bad", text: `位置 ${code} 仍被衣物使用，不能删除。` });
      return;
    }

    saveLocations(locations.filter((location) => location.code !== code));
    setMessage({ tone: "ok", text: `已删除位置 ${code}。` });
    refresh();
  }

  return (
    <main className="page-shell">
      <div className="app-width space-y-4">
        <BackLink />
        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-black text-ink">位置管理</h1>
          {message ? (
            <div
              className={`mt-4 rounded-lg border p-3 text-sm font-bold ${
                message.tone === "bad"
                  ? "border-red-300 bg-red-50 text-red-800"
                  : "border-emerald-300 bg-emerald-50 text-emerald-800"
              }`}
            >
              {message.text}
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
            <input
              value={form.code}
              onChange={(event) => setForm({ ...form, code: event.target.value })}
              className="control"
              placeholder="code，例如 C-01"
            />
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="control"
              placeholder="name，例如 C区-01箱"
            />
            <select
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
              className="control"
            >
              <option value="箱子">箱子</option>
              <option value="货架">货架</option>
              <option value="异常区">异常区</option>
              <option value="待分拣区">待分拣区</option>
            </select>
            <button className="min-h-14 rounded-lg bg-sky-700 px-5 py-3 text-lg font-black text-white">
              新增位置
            </button>
          </form>
        </section>

        {locations.length === 0 ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-800">
            localStorage 暂无位置数据，请先初始化示例数据。
          </div>
        ) : null}

        <section className="space-y-3">
          {locations.map((location) => (
            <article
              key={location.code}
              className="rounded-lg border border-line bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xl font-black text-ink">{location.code}</div>
                  <div className="mt-1 font-bold text-slate-600">{location.name}</div>
                  <div className="mt-2 text-sm font-bold text-slate-500">
                    {location.type}
                  </div>
                </div>
                <button
                  onClick={() => deleteLocation(location.code)}
                  className="min-h-11 rounded-lg border border-red-300 bg-red-50 px-4 text-sm font-bold text-red-700"
                >
                  删除
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
