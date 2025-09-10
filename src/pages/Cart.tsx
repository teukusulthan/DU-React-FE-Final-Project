import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../cart/CartProvider";
import { AuthContext } from "../auth/AuthProvider";

const PLACEHOLDER_SM = "https://via.placeholder.com/96x96?text=No+Img";

export default function Cart() {
  const { items, setQty, remove, clear, subtotal } = useCart();
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const nav = useNavigate();

  const totalItems = items.reduce((acc, i) => acc + i.qty, 0);

  const checkoutAll = () => {
    if (loading) return;
    setMsg("");
    if (!token) {
      nav("/login?redirect=/checkout");
      return;
    }
    if (items.length === 0) {
      setMsg("Keranjang masih kosong.");
      return;
    }
    try {
      sessionStorage.setItem("checkout_source", "cart");
    } catch {}
    setLoading(true);
    nav("/checkout");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Keranjang
        </h1>

        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            ← Lanjut Belanja
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <p className="text-zinc-400">
              Keranjang kosong.{" "}
              <Link
                to="/"
                className="text-zinc-200 underline underline-offset-4 transition hover:text-white"
              >
                Belanja dulu
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:gap-4 sm:p-4"
                >
                  <img
                    src={i.imageUrl || PLACEHOLDER_SM}
                    alt={i.name}
                    className="h-16 w-16 rounded-lg bg-zinc-800 object-cover sm:h-20 sm:w-20"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{i.name}</div>
                    <div className="text-sm text-zinc-400">
                      Rp {i.price.toLocaleString("id-ID")}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-9 w-9 rounded-lg border border-zinc-700 bg-zinc-800/60 transition hover:bg-zinc-800 focus:outline-none focus-visible:ring focus-visible:ring-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setQty(i.id, Math.max(1, i.qty - 1))}
                      disabled={i.qty <= 1}
                      aria-label="Kurangi jumlah"
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min={1}
                      value={i.qty}
                      onChange={(e) =>
                        setQty(i.id, Math.max(1, Number(e.target.value)))
                      }
                      className="h-9 w-16 rounded-lg border border-zinc-700 bg-zinc-900/60 text-center focus:outline-none focus-visible:ring focus-visible:ring-zinc-600"
                    />

                    <button
                      type="button"
                      className="h-9 w-9 rounded-lg border border-zinc-700 bg-zinc-800/60 transition hover:bg-zinc-800 focus:outline-none focus-visible:ring focus-visible:ring-zinc-600"
                      onClick={() => setQty(i.id, i.qty + 1)}
                      aria-label="Tambah jumlah"
                    >
                      +
                    </button>
                  </div>

                  <div className="w-28 text-right font-medium tabular-nums">
                    Rp {(i.qty * i.price).toLocaleString("id-ID")}
                  </div>

                  <button
                    type="button"
                    className="ml-2 rounded-lg border border-red-700/40 bg-red-900/20 px-3 py-2 text-red-300 transition hover:bg-red-900/30 focus:outline-none focus-visible:ring focus-visible:ring-red-700"
                    onClick={() => remove(i.id)}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-lg sm:text-xl">
                  Subtotal{" "}
                  <span className="text-base text-zinc-400 sm:text-lg">
                    ({totalItems} item{totalItems > 1 ? "s" : ""})
                  </span>
                  :{" "}
                  <b className="tabular-nums">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </b>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    type="button"
                    className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-zinc-200 transition hover:bg-zinc-800 focus:outline-none focus-visible:ring focus-visible:ring-zinc-600"
                    onClick={clear}
                    disabled={loading}
                  >
                    Kosongkan
                  </button>

                  <button
                    type="button"
                    className="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-500 focus:outline-none focus-visible:ring focus-visible:ring-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={checkoutAll}
                    disabled={loading || items.length === 0}
                  >
                    {loading ? "Membuka Checkout..." : "Checkout Semua"}
                  </button>
                </div>
              </div>

              {msg && <p className="mt-3 text-sm text-red-400">{msg}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
