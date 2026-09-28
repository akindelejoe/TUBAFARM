import { api } from "./api";
import { ApiListResponse, ApiResponse } from "../types";

export function createCrudService<T, TCreate = Partial<T>, TUpdate = Partial<T>>(resource: string) {
  return {
    async list(params: Record<string, unknown> = {}) {
      const { data } = await api.get<ApiListResponse<T>>(`/${resource}`, { params });
      return data;
    },
    async details(id: string) {
      const { data } = await api.get<ApiResponse<unknown>>(`/${resource}/${id}`);
      return data.data;
    },
    async create(payload: TCreate) {
      const { data } = await api.post<ApiResponse<T>>(`/${resource}`, payload);
      return data.data;
    },
    async update(id: string, payload: TUpdate) {
      const { data } = await api.put<ApiResponse<T>>(`/${resource}/${id}`, payload);
      return data.data;
    },
    async remove(id: string) {
      const { data } = await api.delete<ApiResponse<null>>(`/${resource}/${id}`);
      return data;
    },
  };
}
