import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchProductById } from "../api/products";
import { createOrder } from "../api/orders";
import { useCart } from "../cart/CartProvider";
import { AuthContext } from "../auth/AuthProvider";
import { toAbsoluteUrl } from "../utils/url";

type NavState = {
  product?: {
    id: number | string;
    name: string;
    price: number;
    imageUrl?: string | null;
  };
  qty?: number;
};

type Line = {
  id: string | number;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
};

const PLACEHOLDER_THUMB = "https://via.placeholder.com/80x80?text=No+Img";

const normalizeImg = (u?: string | null) => {
  if (!u) return undefined;
  const trimmed = String(u).trim();
  if (!trimmed) return undefined;
  return toAbsoluteUrl(trimmed);
};

export default function Checkout() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const navState = (location.state as NavState) || {};
  const { token } = useContext(AuthContext);
  const { items: cartItems = [], clear: clearCart } = useCart();

  const isSingle = Boolean(id) || Boolean(navState.product?.id);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [lines, setLines] = useState<Line[]>([]);

  const SafeImg = ({
    src,
    alt,
    className,
  }: {
    src?: string;
    alt: string;
    className?: string;
  }) => (
    <img
      src={src || PLACEHOLDER_THUMB}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        if (e.currentTarget.src !== PLACEHOLDER_THUMB) {
          e.currentTarget.src = PLACEHOLDER_THUMB;
        }
      }}
    />
  );

  useEffect(() => {
    if (token === undefined) return;
    if (!token) nav("/login?redirect=/checkout", { replace: true });
  }, [token, nav]);

  useEffect(() => {
    async function init() {
      setMsg("");
      if (isSingle) {
        if (navState.product) {
          setLines([
            {
              id: navState.product.id,
              name: navState.product.name,
              price: Number(navState.product.price) || 0,
              qty: Math.max(1, Number(navState.qty ?? 1)),
              imageUrl: normalizeImg(navState.product.imageUrl),
            },
          ]);
          return;
        }
        if (id) {
          try {
            const p = await fetchProductById(id);
            setLines([
              {
                id: p.id,
                name: p.name,
                price: Number(p.price) || 0,
                qty: 1,
                imageUrl: normalizeImg(p.imageUrl),
              },
            ]);
          } catch {
            setLines([{ id, name: `Produk #${id}`, price: 0, qty: 1 }]);
          }
          return;
        }
      }
      setLines(
        cartItems.map((c: any) => ({
          id: c.id,
          name: c.name,
          price: Number(c.price) || 0,
          qty: Math.max(1, Number(c.qty ?? 1)),
          imageUrl: normalizeImg(c.imageUrl),
        }))
      );
    }
    init();
  }, [id, isSingle, navState.product, navState.qty, cartItems.length]);

  const total = useMemo(
    () =>
      lines.reduce(
        (acc, l) => acc + (Number(l.price) || 0) * (Number(l.qty) || 1),
        0
      ),
    [lines]
  );

  const setQty = (idx: number, next: number) => {
    setLines((prev) => {
      const cp = [...prev];
      cp[idx] = { ...cp[idx], qty: Math.max(1, Number(next) || 1) };
      return cp;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (!lines.length) {
      setMsg("Tidak ada item untuk di-order.");
      return;
    }
    try {
      setLoading(true);
      if (isSingle) {
        const l = lines[0];
        await createOrder({ productId: String(l.id), quantity: l.qty });
        nav("/orders");
        return;
      }
      const results = await Promise.allSettled(
        lines.map((l) =>
          createOrder({ productId: String(l.id), quantity: l.qty })
        )
      );
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length === 0) {
        clearCart?.();
        nav("/orders");
      } else {
        setMsg(`${failed.length} item gagal dibuat. Item lain berhasil.`);
      }
    } catch (e: any) {
      setMsg(e?.response?.data?.message ?? "Checkout gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
          <Link
            to="/"
            className="text-sm text-zinc-400 transition duration-500 ease-in-out hover:text-zinc-200"
          >
            ← Kembali
          </Link>
        </header>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm"
        >
          <div className="space-y-3">
            {lines.length > 0 ? (
              lines.map((l, idx) => (
                <div
                  key={`${l.id}-${idx}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                >
                  <SafeImg
                    src={l.imageUrl}
                    alt={l.name}
                    className="h-14 w-14 rounded-lg bg-zinc-800 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{l.name}</div>
                    <div className="text-sm text-zinc-400">
                      Rp {(Number(l.price) || 0).toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-9 w-9 rounded-lg border border-zinc-700 bg-zinc-800/60 transition duration-500 ease-in-out hover:bg-zinc-800 disabled:opacity-50"
                      onClick={() => setQty(idx, (l.qty || 1) - 1)}
                      disabled={loading || (l.qty || 1) <= 1}
                      aria-label="Kurangi jumlah"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={l.qty}
                      onChange={(e) => setQty(idx, Number(e.target.value))}
                      className="h-9 w-20 rounded-lg border border-zinc-700 bg-zinc-900/60 text-center"
                    />
                    <button
                      type="button"
                      className="h-9 w-9 rounded-lg border border-zinc-700 bg-zinc-800/60 transition duration-500 ease-in-out hover:bg-zinc-800 disabled:opacity-50"
                      onClick={() => setQty(idx, (l.qty || 1) + 1)}
                      disabled={loading}
                      aria-label="Tambah jumlah"
                    >
                      +
                    </button>
                  </div>
                  <div className="w-28 text-right font-medium tabular-nums">
                    Rp{" "}
                    {(
                      (Number(l.price) || 0) * (Number(l.qty) || 1) || 0
                    ).toLocaleString("id-ID")}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-400">
                Tidak ada item untuk di-checkout.
              </div>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Total Item</span>
              <span className="tabular-nums">
                {lines.reduce((a, l) => a + (Number(l.qty) || 1), 0)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3 text-base">
              <span className="font-medium text-zinc-300">Total</span>
              <span className="tabular-nums font-semibold">
                Rp {(Number(total) || 0).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2 hover:bg-zinc-800"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-500 disabled:opacity-60"
              disabled={loading || lines.length === 0}
            >
              {loading
                ? "Memproses..."
                : isSingle
                ? "Buat Pesanan"
                : "Buat Semua Order"}
            </button>
          </div>

          {msg && <p className="mt-3 text-sm text-red-400">{msg}</p>}
        </form>
      </div>
    </div>
  );
}
