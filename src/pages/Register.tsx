import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../api/auth";

export default function Register() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      await registerApi({ name, email, password });
      nav("/login");
    } catch (e: any) {
      setMsg(e?.response?.data?.message ?? "Register gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-68px)] items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold tracking-tight">
          Buat Akun <span className="text-blue-400">Mini Store</span>
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-400">
          Isi data di bawah untuk mendaftar.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
            <input
              className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
              placeholder="Nama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
            <input
              className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
            <input
              className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {msg && (
            <div className="rounded-lg border border-red-600/30 bg-red-950/30 px-3 py-2 text-sm text-red-300">
              {msg}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses…" : "Daftar"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-zinc-400">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-400 hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
