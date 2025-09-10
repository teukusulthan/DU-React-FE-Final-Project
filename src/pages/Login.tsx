import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../auth/AuthProvider";

export default function Login() {
  const nav = useNavigate();
  const { token, setToken, refreshMe } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (token) nav("/");
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const r = await api.post("/auth/login", { email, password });
      const t = r?.data?.data?.token ?? r?.data?.token;
      if (!t) throw new Error("Token tidak ditemukan di response");
      localStorage.setItem("token", t);
      setToken(t);
      await refreshMe();
      nav("/");
    } catch (err: any) {
      console.error("[Login] error:", err);
      const apiMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Login gagal. Periksa email/password.";
      setMsg(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold tracking-tight">
          Masuk ke <span className="text-blue-400">Ninetyn Store</span>
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-400">
          Gunakan email dan password akunmu.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4 shrink-0 opacity-70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path strokeWidth="2" d="M4 6h16v12H4z" />
                <path strokeWidth="2" d="m22 6-10 7L2 6" />
              </svg>
              <input
                className="w-full bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 outline-none"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4 shrink-0 opacity-70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path strokeWidth="2" d="M17 11V7a5 5 0 0 0-10 0v4" />
                <rect
                  x="4"
                  y="11"
                  width="16"
                  height="9"
                  rx="2"
                  strokeWidth="2"
                />
              </svg>
              <input
                className="w-full bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 outline-none"
                type={showPwd ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="ml-1 rounded-md px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition"
                aria-label={
                  showPwd ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {msg && (
            <div className="rounded-lg border border-red-600/30 bg-red-950/30 px-3 py-2 text-sm text-red-300">
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses…" : "Masuk"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-zinc-400">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-400 hover:underline"
          >
            Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}
