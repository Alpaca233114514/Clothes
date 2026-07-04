import { beforeEach, describe, expect, it } from "vitest";
import { initializeDemoData } from "@/lib/demo-data";
import {
  addScanLog,
  clearAllData,
  findItemByCode,
  getItems,
  getScanLogs,
  getStats,
  isLocationInUse,
  recordItemAction,
  updateItem
} from "@/lib/storage";

describe("storage behavior", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns empty safe defaults when localStorage has not been initialized", () => {
    expect(getItems()).toEqual([]);
    expect(getScanLogs()).toEqual([]);
    expect(getStats()).toEqual({
      total: 0,
      pending: 0,
      sorted: 0,
      exception: 0,
      completionRate: 0
    });
  });

  it("sorts an item through the storage API and excludes exceptions from completion", () => {
    initializeDemoData();
    const original = findItemByCode(" item-000001 ");
    expect(original?.targetLocationCode).toBe("A-01");

    const sorted = updateItem("ITEM-000001", (item) => ({
      ...item,
      status: "已分拣",
      currentLocationCode: item.targetLocationCode,
      updatedAt: "2026-07-04T01:00:00.000Z"
    }));
    const exception = updateItem("ITEM-000002", {
      status: "异常",
      currentLocationCode: "异常区"
    });

    expect(sorted).toMatchObject({
      status: "已分拣",
      currentLocationCode: "A-01"
    });
    expect(exception).toMatchObject({
      status: "异常",
      currentLocationCode: "异常区"
    });
    expect(getStats()).toMatchObject({
      total: 30,
      pending: 28,
      sorted: 1,
      exception: 1,
      completionRate: 100 / 30
    });
  });

  it("does not create phantom items when updating a missing code", () => {
    initializeDemoData();

    expect(updateItem("ITEM-404404", { status: "已分拣" })).toBeUndefined();
    expect(getItems()).toHaveLength(30);
  });

  it("records repeated scan and repeated sorted actions instead of hiding duplicates", () => {
    initializeDemoData();
    const first = findItemByCode("ITEM-000001");
    expect(first).toBeDefined();
    const sorted = updateItem("ITEM-000001", {
      status: "已分拣",
      currentLocationCode: "A-01"
    });
    expect(sorted).toBeDefined();

    addScanLog({
      itemCode: "ITEM-000001",
      action: "scan",
      fromStatus: sorted?.status,
      toStatus: sorted?.status,
      fromLocationCode: sorted?.currentLocationCode,
      toLocationCode: sorted?.currentLocationCode,
      message: "重复扫码：该衣物已分拣"
    });
    recordItemAction({
      itemCode: "ITEM-000001",
      action: "sorted",
      fromItem: sorted,
      toItem: sorted,
      message: "重复确认分拣"
    });

    expect(getScanLogs().map((log) => log.action)).toEqual(["sorted", "scan"]);
    expect(getScanLogs()[0].message).toContain("重复");
    expect(getScanLogs()[1].message).toContain("重复");
  });

  it("detects locations that cannot be deleted because items still reference them", () => {
    initializeDemoData();

    expect(isLocationInUse("A-01")).toBe(true);
    expect(isLocationInUse("待分拣区")).toBe(true);
    expect(isLocationInUse("B-01")).toBe(false);
  });

  it("clears only the application storage keys", () => {
    window.localStorage.setItem("unrelated", "keep");
    initializeDemoData();

    clearAllData();

    expect(getItems()).toEqual([]);
    expect(getScanLogs()).toEqual([]);
    expect(window.localStorage.getItem("unrelated")).toBe("keep");
  });
});
