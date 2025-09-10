import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import { useCart } from "../cart/CartProvider";
import { toAbsoluteUrl } from "../utils/url";
import {
  fetchProductById,
  restoreProduct,
  softDeleteProduct,
  type Product,
} from "../api/products";

const placeholder = "https://via.placeholder.com/800x600?text=Tidak+Ada+Gambar";
const rupiah = (n: number) =>
  `Rp ${Number(n).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useContext(AuthContext);
  const cart = useCart() as any;

  const [p, setP] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(String(id));
        if (mounted) setP(data ?? null);
      } catch (e: any) {
        if (mounted) setServerError(e?.message || "Gagal memuat produk");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const imgAbs = useMemo(() => {
    const raw = p?.imageUrl;
    if (!raw || !String(raw).trim()) return undefined;
    return toAbsoluteUrl(raw);
  }, [p?.imageUrl]);

  const isDeleted = Boolean(p?.deletedAt);
  const canManage =
    user?.role === "supplier" &&
    String(p?.supplierId ?? "") === String(user?.id ?? "");

  const addFn = cart?.addToCart || cart?.add || cart?.addItem || null;

  const handleAddToCart = useCallback(() => {
    if (!p) return;
    if (typeof addFn !== "function") {
      console.warn(
        "[ProductDetail] addToCart tidak tersedia. Pastikan <CartProvider> aktif."
      );
      alert("Keranjang belum aktif. Pastikan <CartProvider> membungkus App.");
      return;
    }
    try {
      addFn({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        imageUrl: imgAbs ?? "",
        quantity: 1,
      });
      return;
    } catch {}
    try {
      addFn(p);
      return;
    } catch {}
    try {
      addFn(p.id, 1);
    } catch (e) {
      console.error("[ProductDetail] gagal menambahkan ke keranjang:", e);
      alert("Gagal menambahkan ke keranjang. Coba lagi.");
    }
  }, [addFn, p, imgAbs]);

  return (
    <div className="min-h-[calc(100vh-68px)] bg-zinc-950 text-zinc-200">
      <div className="mx-auto max-w-6xl p-4">
        <nav className="mb-6">
          <Link
            to="/products"
            className="inline-block rounded-lg px-4 py-2 text-base font-medium text-zinc-400 transition hover:text-zinc-200"
          >
            ← Kembali ke Produk
          </Link>
        </nav>

        <div className="flex min-h-[70vh] items-center justify-center">
          {loading && (
            <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-zinc-800/60" />
                <div className="space-y-3">
                  <div className="h-7 w-3/4 animate-pulse rounded bg-zinc-800" />
                  <div className="h-5 w-1/3 animate-pulse rounded bg-zinc-800" />
                  <div className="h-20 w-full animate-pulse rounded bg-zinc-800/60" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 rounded-xl bg-zinc-800" />
                    <div className="h-12 rounded-xl bg-zinc-800" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && (serverError || !p) && (
            <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <p className="text-red-300">
                Terjadi kesalahan: {serverError || "Produk tidak ditemukan"}
              </p>
              <button
                onClick={() => nav(-1)}
                className="mt-3 h-12 rounded-xl border border-zinc-700 px-4 text-base font-medium hover:text-zinc-100"
              >
                Kembali
              </button>
            </div>
          )}

          {!loading && p && (
            <div className="relative w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              {isDeleted && (
                <span className="absolute left-4 top-4 rounded-full border border-red-700/60 bg-red-900/40 px-2 py-0.5 text-[10px] font-medium text-red-200 backdrop-blur">
                  Dihapus
                </span>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="order-1 overflow-hidden rounded-xl">
                  <div className="aspect-[4/3] w-full bg-zinc-800/50">
                    <img
                      src={imgAbs || placeholder}
                      alt={p.name || "Gambar produk"}
                      onError={(e) => {
                        if (e.currentTarget.src !== placeholder) {
                          e.currentTarget.src = placeholder;
                        }
                      }}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="order-2">
                  <h1 className="text-2xl font-semibold text-zinc-100">
                    {p.name}
                  </h1>
                  <p className="mt-1 text-lg text-zinc-400">
                    {rupiah(Number(p.price))}
                  </p>

                  {p.description && (
                    <p className="mt-3 text-base leading-relaxed text-zinc-300">
                      {p.description}
                    </p>
                  )}

                  <div className="mt-2 text-sm text-zinc-500">
                    {typeof p.stock === "number" && (
                      <span>Stok: {p.stock}</span>
                    )}
                    {p.supplierId && (
                      <span className="ml-3">
                        ID Supplier: {String(p.supplierId)}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={handleAddToCart}
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-blue-700 bg-blue-600 px-4 text-base font-medium text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:scale-[0.995]"
                    >
                      Tambah ke Keranjang
                    </button>

                    <Link
                      to={`/checkout/${p.id}`}
                      state={{
                        product: {
                          id: p.id,
                          name: p.name,
                          price: Number(p.price),
                          imageUrl: imgAbs || null,
                        },
                        qty: 1,
                      }}
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-green-600 bg-green-600 px-4 text-base font-medium text-white transition hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:scale-[0.995]"
                    >
                      Beli Sekarang
                    </Link>
                  </div>

                  {canManage && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Link
                        to={`/products/${p.id}/edit`}
                        className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/30 px-4 text-base font-medium text-zinc-200 transition hover:bg-zinc-800 hover:shadow focus:outline-none focus:ring-2 focus:ring-zinc-600/40 active:scale-[0.995]"
                      >
                        Edit
                      </Link>

                      {!isDeleted ? (
                        <button
                          onClick={async () => {
                            await softDeleteProduct(p.id);
                            setP({ ...p, deletedAt: new Date().toISOString() });
                          }}
                          className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-red-700 bg-red-900/20 px-4 text-base font-medium text-red-200 transition hover:bg-red-900/30 hover:shadow focus:outline-none focus:ring-2 focus:ring-red-600/40 active:scale-[0.995]"
                        >
                          Hapus
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            await restoreProduct(p.id);
                            setP({ ...p, deletedAt: null });
                          }}
                          className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-emerald-700 bg-emerald-900/20 px-4 text-base font-medium text-emerald-200 transition hover:bg-emerald-900/30 hover:-translate-y-0.5 hover:shadow focus:outline-none focus:ring-2 focus:ring-emerald-600/40 active:scale-[0.995]"
                        >
                          Pulihkan
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
