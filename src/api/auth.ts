import type { AxiosResponse } from "axios";
import api from "./client";

type LoginResponse = {
  code?: number;
  status?: string;
  message?: string;
  data?: { token?: string };
  token?: string;
};

type MeUser = {
  id: number;
  name: string;
  email: string;
  role: "SUPPLIER" | "USER";
  avatarUrl?: string | null;
  points?: number;
  createdAt?: string;
  updatedAt?: string;
};

type MeResponse = {
  code: number;
  status: string;
  message: string;
  data: MeUser;
};

function extractToken(res: AxiosResponse<LoginResponse>) {
  const tokenFromBody = res.data?.data?.token ?? res.data?.token ?? undefined;
  const authHeader = res.headers?.authorization as string | undefined;
  const tokenFromHeader =
    typeof authHeader === "string"
      ? authHeader.replace(/^Bearer\s+/i, "")
      : undefined;
  return tokenFromBody ?? tokenFromHeader;
}

export const loginApi = async (email: string, password: string) => {
  try {
    const res = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    console.log("[loginApi] response.data =", res.data);

    const token = extractToken(res);
    if (!token) {
      console.error("[loginApi] Token tidak ditemukan di response.");
      throw new Error("Token tidak ditemukan di response login");
    }

    localStorage.setItem("token", token);
    console.log("[loginApi] saved token =", localStorage.getItem("token"));
    return token;
  } catch (err) {
    console.error("[loginApi] error =", err);
    throw err;
  }
};

export const registerApi = (payload: {
  name: string;
  email: string;
  password: string;
}) => api.post("/auth/register", payload).then((r) => r.data);

export const meApi = () =>
  api.get<MeResponse>("/auth/me").then((r) => r.data.data);

export const logoutApi = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
