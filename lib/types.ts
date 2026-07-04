export type GarmentStatus = "待分拣" | "已分拣" | "异常";

export type ScanAction =
  | "scan"
  | "sorted"
  | "exception"
  | "location_changed"
  | "edit";

export interface GarmentSku {
  skuCode: string;
  name: string;
  category: string;
  color: string;
  size: string;
  style: string;
  imageUrl?: string;
}

export interface GarmentItem {
  itemCode: string;
  skuCode: string;
  batchCode: string;
  ownerName?: string;
  department?: string;
  status: GarmentStatus;
  targetLocationCode: string;
  currentLocationCode: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  code: string;
  name: string;
  type: "箱子" | "货架" | "异常区" | "待分拣区" | string;
}

export interface ScanLog {
  id: string;
  itemCode: string;
  action: ScanAction;
  fromStatus?: GarmentStatus;
  toStatus?: GarmentStatus;
  fromLocationCode?: string;
  toLocationCode?: string;
  message: string;
  createdAt: string;
}

export interface SortingStats {
  total: number;
  pending: number;
  sorted: number;
  exception: number;
  completionRate: number;
}
