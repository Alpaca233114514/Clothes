import type {
  GarmentItem,
  GarmentSku,
  Location,
  ScanAction,
  ScanLog,
  SortingStats
} from "./types";
import { makeLogId, nowIso } from "./utils";

const STORAGE_KEYS = {
  skus: "garment-demo:skus",
  items: "garment-demo:items",
  locations: "garment-demo:locations",
  scanLogs: "garment-demo:scanLogs"
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readJson<T>(key: StorageKey, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: StorageKey, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getSkus() {
  return readJson<GarmentSku[]>(STORAGE_KEYS.skus, []);
}

export function saveSkus(skus: GarmentSku[]) {
  writeJson(STORAGE_KEYS.skus, skus);
}

export function getItems() {
  return readJson<GarmentItem[]>(STORAGE_KEYS.items, []);
}

export function saveItems(items: GarmentItem[]) {
  writeJson(STORAGE_KEYS.items, items);
}

export function getLocations() {
  return readJson<Location[]>(STORAGE_KEYS.locations, []);
}

export function saveLocations(locations: Location[]) {
  writeJson(STORAGE_KEYS.locations, locations);
}

export function getScanLogs() {
  return readJson<ScanLog[]>(STORAGE_KEYS.scanLogs, []);
}

export function saveScanLogs(scanLogs: ScanLog[]) {
  writeJson(STORAGE_KEYS.scanLogs, scanLogs);
}

export function addScanLog(log: Omit<ScanLog, "id" | "createdAt">) {
  const nextLog: ScanLog = {
    ...log,
    id: makeLogId(),
    createdAt: nowIso()
  };
  saveScanLogs([nextLog, ...getScanLogs()]);
  return nextLog;
}

export function findItemByCode(itemCode: string) {
  const normalizedCode = itemCode.trim().toUpperCase();
  return getItems().find((item) => item.itemCode === normalizedCode);
}

export function updateItem(
  itemCode: string,
  updater: Partial<GarmentItem> | ((item: GarmentItem) => GarmentItem)
) {
  const normalizedCode = itemCode.trim().toUpperCase();
  let updatedItem: GarmentItem | undefined;
  const nextItems = getItems().map((item) => {
    if (item.itemCode !== normalizedCode) {
      return item;
    }

    updatedItem =
      typeof updater === "function"
        ? updater(item)
        : { ...item, ...updater, updatedAt: nowIso() };

    return updatedItem;
  });

  if (!updatedItem) {
    return undefined;
  }

  saveItems(nextItems);
  return updatedItem;
}

export function getStats(): SortingStats {
  const items = getItems();
  const total = items.length;
  const sorted = items.filter((item) => item.status === "已分拣").length;
  const exception = items.filter((item) => item.status === "异常").length;
  const pending = items.filter((item) => item.status === "待分拣").length;

  return {
    total,
    pending,
    sorted,
    exception,
    completionRate: total === 0 ? 0 : (sorted / total) * 100
  };
}

export function clearAllData() {
  if (!canUseStorage()) {
    return;
  }

  Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
}

export function recordItemAction(params: {
  itemCode: string;
  action: ScanAction;
  fromItem?: GarmentItem;
  toItem?: GarmentItem;
  message: string;
}) {
  return addScanLog({
    itemCode: params.itemCode,
    action: params.action,
    fromStatus: params.fromItem?.status,
    toStatus: params.toItem?.status,
    fromLocationCode: params.fromItem?.currentLocationCode,
    toLocationCode: params.toItem?.currentLocationCode,
    message: params.message
  });
}

export function isLocationInUse(code: string) {
  return getItems().some(
    (item) =>
      item.targetLocationCode === code || item.currentLocationCode === code
  );
}
