import { api } from "./api";
import { ApiListResponse, ApiResponse, Inventory, InventoryTransaction } from "../types";

export async function listInventory(params: Record<string, unknown> = {}) {
  const { data } = await api.get<ApiListResponse<Inventory>>("/inventory", { params });
  return data;
}

export async function listInventoryTransactions(params: Record<string, unknown> = {}) {
  const { data } = await api.get<ApiListResponse<InventoryTransaction>>("/inventory-transactions", { params });
  return data;
}

export async function stockIn(payload: { productId: string; quantity: number; reference?: string; notes?: string }) {
  const { data } = await api.post<ApiResponse<Inventory>>("/inventory/stock-in", payload);
  return data.data;
}

export async function stockOut(payload: { productId: string; quantity: number; reference?: string; notes?: string }) {
  const { data } = await api.post<ApiResponse<Inventory>>("/inventory/stock-out", payload);
  return data.data;
}

export async function adjustInventory(payload: { productId: string; newQuantity: number; notes?: string }) {
  const { data } = await api.post<ApiResponse<Inventory>>("/inventory/adjust", payload);
  return data.data;
}
