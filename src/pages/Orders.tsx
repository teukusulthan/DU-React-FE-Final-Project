import { useEffect, useState } from "react";
import { getMyOrders } from "../api/orders";
import { Link } from "react-router-dom";

type OrderItem = {
  id: number | string;
  userId: number | string;
  productId: number | string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  product?: { id: number | string; name: string; price: number };
};

export default function Orders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getMyOrders();
      const arr = Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : [];
      setOrders(arr as OrderItem[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Pesanan Saya
        </h1>

        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            ← Lanjut Belanja
          </Link>
        </div>

        {loading && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-zinc-400">
            Memuat data...
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <p className="text-zinc-400">Belum ada order.</p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-zinc-400">
                    {new Date(o.createdAt).toLocaleString("id-ID")}
                  </div>
                  <div className="text-sm text-zinc-400">
                    ID Order: <span className="text-zinc-300">#{o.id}</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      Produk
                    </div>
                    <div className="mt-1 truncate font-medium">
                      {o.product?.name ?? `#${o.productId}`}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      Qty
                    </div>
                    <div className="mt-1 font-medium">{o.quantity}</div>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      Harga Satuan
                    </div>
                    <div className="mt-1 tabular-nums">
                      Rp {Number(o.unitPrice).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
                  <div className="text-sm text-zinc-500">Total</div>
                  <div className="text-lg font-semibold tabular-nums">
                    Rp {Number(o.totalPrice).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
