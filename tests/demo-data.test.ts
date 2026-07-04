import { describe, expect, it } from "vitest";
import { buildDemoItems, buildDemoLocations, buildDemoSkus } from "@/lib/demo-data";

describe("demo data", () => {
  it("generates exactly 30 unique items with the required batch and initial state", () => {
    const items = buildDemoItems("2026-07-04T00:00:00.000Z");

    expect(items).toHaveLength(30);
    expect(new Set(items.map((item) => item.itemCode)).size).toBe(30);
    expect(items[0]).toMatchObject({
      itemCode: "ITEM-000001",
      batchCode: "BATCH-20260704-BLUE",
      status: "待分拣",
      currentLocationCode: "待分拣区"
    });
    expect(items[29].itemCode).toBe("ITEM-000030");
  });

  it("routes sizes to A-01, A-02, and A-03 without hardcoded single-location cheating", () => {
    const items = buildDemoItems("2026-07-04T00:00:00.000Z");
    const routeBySku = new Map(items.map((item) => [item.skuCode, item.targetLocationCode]));

    expect(routeBySku.get("BLUE-SHIRT-M")).toBe("A-01");
    expect(routeBySku.get("BLUE-SHIRT-L")).toBe("A-02");
    expect(routeBySku.get("BLUE-SHIRT-XL")).toBe("A-03");
    expect(new Set(items.map((item) => item.targetLocationCode))).toEqual(
      new Set(["A-01", "A-02", "A-03"])
    );
  });

  it("preloads the exact SKU and location surface required by the demo", () => {
    expect(buildDemoSkus().map((sku) => sku.skuCode)).toEqual([
      "BLUE-SHIRT-M",
      "BLUE-SHIRT-L",
      "BLUE-SHIRT-XL"
    ]);
    expect(buildDemoLocations().map((location) => location.code)).toEqual([
      "待分拣区",
      "A-01",
      "A-02",
      "A-03",
      "B-01",
      "异常区"
    ]);
  });
});
