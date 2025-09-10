import axios from "axios";

const RAW = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";
const BASE = String(RAW).replace(/\/+$/, "");

const api = axios.create({
  baseURL: BASE,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn("[api] gagal membaca localStorage:", e);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err?.response?.data;
    if (typeof data === "string" && data.startsWith("<!DOCTYPE html")) {
      console.warn(
        "[api] Server mengembalikan HTML. Cek baseURL/path:",
        api.defaults.baseURL,
        err?.config?.url
      );
    }
    return Promise.reject(err);
  }
);

if (import.meta.env.DEV) {
  console.log("[api] baseURL =", api.defaults.baseURL);
}

export default api;
