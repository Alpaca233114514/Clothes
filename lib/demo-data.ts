import type { GarmentItem, GarmentSku, Location } from "./types";
import { saveItems, saveLocations, saveScanLogs, saveSkus } from "./storage";
import { CURRENT_BATCH_CODE, nowIso } from "./utils";

const SIZES = ["M", "L", "XL"] as const;
const LOCATION_BY_SIZE: Record<(typeof SIZES)[number], string> = {
  M: "A-01",
  L: "A-02",
  XL: "A-03"
};

export function buildDemoSkus(): GarmentSku[] {
  return SIZES.map((size) => ({
    skuCode: `BLUE-SHIRT-${size}`,
    name: "蓝色制服上衣",
    category: "上衣",
    color: "蓝色",
    size,
    style: "金扣制服"
  }));
}

export function buildDemoLocations(): Location[] {
  return [
    { code: "待分拣区", name: "待分拣区", type: "待分拣区" },
    { code: "A-01", name: "A区-01箱", type: "箱子" },
    { code: "A-02", name: "A区-02箱", type: "箱子" },
    { code: "A-03", name: "A区-03箱", type: "箱子" },
    { code: "B-01", name: "B区-01货架", type: "货架" },
    { code: "异常区", name: "异常区", type: "异常区" }
  ];
}

export function buildDemoItems(baseTime = nowIso()): GarmentItem[] {
  return Array.from({ length: 30 }, (_, index) => {
    const size = SIZES[index % SIZES.length];
    const itemNumber = String(index + 1).padStart(6, "0");

    return {
      itemCode: `ITEM-${itemNumber}`,
      skuCode: `BLUE-SHIRT-${size}`,
      batchCode: CURRENT_BATCH_CODE,
      status: "待分拣",
      targetLocationCode: LOCATION_BY_SIZE[size],
      currentLocationCode: "待分拣区",
      createdAt: baseTime,
      updatedAt: baseTime
    };
  });
}

export function initializeDemoData() {
  const skus = buildDemoSkus();
  const items = buildDemoItems();
  const locations = buildDemoLocations();

  saveSkus(skus);
  saveItems(items);
  saveLocations(locations);
  saveScanLogs([]);

  return { skus, items, locations };
}
