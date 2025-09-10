import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { meApi } from "../api/auth";

type RoleFE = "user" | "supplier";

export type User = {
  id: string;
  name: string;
  email: string;
  role: RoleFE;
  points?: number;
};

type AuthCtx = {
  user: User | null;
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
  meLoading: boolean;
};

export const AuthContext = createContext<AuthCtx>({} as AuthCtx);

function normalizeRole(r: string | undefined | null): RoleFE {
  const low = (r ?? "").toLowerCase();
  if (low === "supplier") return "supplier";
  if (low === "admin") return "supplier";
  return "user";
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialToken = localStorage.getItem("token");
  const [token, setToken] = useState<string | null>(initialToken);
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    try {
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [meLoading, setMeLoading] = useState<boolean>(!!initialToken);

  const refreshMe = async () => {
    if (!token) {
      setUser(null);
      setMeLoading(false);
      return;
    }
    try {
      setMeLoading(true);
      const res = await meApi();
      const raw = (res as any)?.data ?? res;
      const u: User = {
        id: String(raw?.id ?? raw?.user?.id ?? ""),
        name: raw?.name ?? raw?.user?.name ?? "",
        email: raw?.email ?? raw?.user?.email ?? "",
        role: normalizeRole(raw?.role ?? raw?.user?.role),
        points: raw?.points ?? raw?.user?.points ?? raw?.balance ?? 0,
      };
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } else {
        console.warn("[AuthProvider] refreshMe failed (keep token):", err);
      }
    } finally {
      setMeLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [token]);

  useEffect(() => {
    refreshMe();
  }, [token]);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, setToken, logout, refreshMe, meLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
