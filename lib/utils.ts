import type { ScanAction } from "./types";

export const CURRENT_BATCH_CODE = "BATCH-20260704-BLUE";

export function nowIso() {
  return new Date().toISOString();
}

export function makeLogId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `LOG-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function scanActionLabel(action: ScanAction) {
  const labels: Record<ScanAction, string> = {
    scan: "扫码",
    sorted: "确认分拣",
    exception: "标记异常",
    location_changed: "修改目标位置",
    edit: "编辑信息"
  };

  return labels[action];
}
