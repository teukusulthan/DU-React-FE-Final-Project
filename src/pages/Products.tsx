import { useContext, useEffect, useMemo, useState } from "react";
import { fetchProducts, Product } from "../api/products";
import { AuthContext } from "../auth/AuthProvider";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const rupiah = (n: number) =>
  `Rp ${Number(n).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

const placeholder = "https://via.placeholder.com/600x400?text=No+Image";

function useDebounce<T>(value: T, delay = 400) {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
}

type SortKey = "createdAt" | "price";

const SORT_LABEL: Record<SortKey, string> = {
  createdAt: "Terbaru",
  price: "Harga",
};

export default function Products() {
  const { user } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = 8;

  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const debSearch = useDebounce(search.trim(), 400);
  const debMin = useDebounce(minPrice.trim(), 400);
  const debMax = useDebounce(maxPrice.trim(), 400);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  const refetch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchProducts({
        search: debSearch || undefined,
        sortBy,
        order,
        page,
        limit,
        minPrice: debMin ? Number(debMin) : undefined,
        maxPrice: debMax ? Number(debMax) : undefined,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch {
      setError("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!["createdAt", "price"].includes(sortBy)) {
      setSortBy("createdAt");
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debSearch, sortBy, order, debMin, debMax]);

  useEffect(() => {
    refetch();
  }, [debSearch, sortBy, order, page, debMin, debMax]);

  const clearFilters = () => {
    setSearch("");
    setSortBy("createdAt");
    setOrder("desc");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            Produk Tersedia
          </h1>
          {user?.role === "supplier" && (
            <Link
              to="/products/new"
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition duration-500 ease-in-out hover:bg-green-500"
            >
              Tambah Produk
            </Link>
          )}
        </header>

        <section className="mb-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-3xl">
              <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4 shrink-0 opacity-70"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                  />
                </svg>
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
                  placeholder="Cari berdasarkan judul produk…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
                <span className="text-xs text-zinc-400">Min</span>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) =>
                    setMinPrice(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
                <span className="text-xs text-zinc-400">Max</span>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
                  placeholder="1000000"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  className="appearance-none rounded-xl border border-zinc-800 bg-zinc-950 px-3 pr-8 py-2 text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                >
                  <option value="createdAt">Terbaru</option>
                  <option value="price">Harga</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
                  ▼
                </span>
              </div>

              <div className="relative">
                <select
                  className="appearance-none rounded-xl border border-zinc-800 bg-zinc-950 px-3 pr-8 py-2 text-sm"
                  value={order}
                  onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
                >
                  <option value="desc">↓ Tertinggi</option>
                  <option value="asc">↑ Terendah</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
                  ▼
                </span>
              </div>

              <button
                onClick={clearFilters}
                className="rounded-xl border border-zinc-700 px-3 py-2 text-sm transition duration-500 ease-in-out hover:bg-zinc-800"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {debSearch && (
              <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-1">
                Judul: “{debSearch}”
              </span>
            )}
            {debMin && (
              <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-1">
                Min: {rupiah(Number(debMin))}
              </span>
            )}
            {debMax && (
              <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-1">
                Max: {rupiah(Number(debMax))}
              </span>
            )}
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Urutkan: {SORT_LABEL[sortBy]}</span>
          </div>
        </section>

        {error && (
          <div className="mb-4 rounded-xl border border-red-600/30 bg-red-950/30 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <section>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: limit }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3"
                >
                  <div className="h-36 w-full rounded-xl bg-zinc-800" />
                  <div className="mt-3 h-4 w-2/3 rounded bg-zinc-800" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-zinc-800" />
                  <div className="mt-3 h-8 rounded bg-zinc-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} p={p} placeholder={placeholder} />
              ))}
            </div>
          )}
        </section>

        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            className="rounded-xl border border-zinc-700 px-3 py-2 text-sm transition duration-500 ease-in-out hover:bg-zinc-800 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>

          <span className="text-xs text-zinc-400">
            Page <span className="font-medium text-zinc-200">{page}</span> /{" "}
            {totalPages}
          </span>

          <button
            className="rounded-xl border border-zinc-700 px-3 py-2 text-sm transition duration-500 ease-in-out hover:bg-zinc-800 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
