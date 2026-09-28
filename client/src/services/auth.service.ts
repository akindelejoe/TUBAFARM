import { api } from "./api";
import { ApiResponse, User } from "../types";

export interface LoginResult {
  token: string;
  user: User;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<ApiResponse<LoginResult>>("/auth/login", { email, password });
  return data.data;
}

export async function fetchProfile() {
  const { data } = await api.get<ApiResponse<User>>("/auth/me");
  return data.data;
}
