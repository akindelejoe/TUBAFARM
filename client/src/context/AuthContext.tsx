import { createContext, ReactNode, useEffect, useState } from "react";
import { User } from "../types";
import * as authService from "../services/auth.service";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("tuba_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .fetchProfile()
      .then((profile) => setUser(profile))
      .catch(() => {
        localStorage.removeItem("tuba_token");
        localStorage.removeItem("tuba_user");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const result = await authService.login(email, password);
    localStorage.setItem("tuba_token", result.token);
    localStorage.setItem("tuba_user", JSON.stringify(result.user));
    setUser(result.user);
  }

  function logout() {
    localStorage.removeItem("tuba_token");
    localStorage.removeItem("tuba_user");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
