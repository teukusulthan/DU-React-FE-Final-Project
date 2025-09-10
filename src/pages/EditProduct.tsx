import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchProductById,
  updateProduct,
  Product as ApiProduct,
} from "../api/products";

export default function EditProduct() {
  const nav = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [serverError, setServerError] = useState("");

  const previewUrl = useMemo(
    () => (image ? URL.createObjectURL(image) : ""),
    [image]
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const p = (await fetchProductById(id)) as Partial<ApiProduct>;
        setName(p.name ?? "");
        setDescription(p.description ?? "");
        setPrice(p.price != null ? String(p.price) : "");
        setStock(p.stock != null ? String(p.stock) : "");
      } catch {}
    })();
  }, [id]);

  const validate = () => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("Nama produk wajib diisi.");
    const p = Number(price);
    const s = Number(stock);
    if (!price || Number.isNaN(p) || p < 0)
      errs.push("Harga harus berupa angka ≥ 0.");
    if (!stock || Number.isNaN(s) || s < 0)
      errs.push("Stok harus berupa angka ≥ 0.");
    if (image && !image.type.startsWith("image/"))
      errs.push("File gambar tidak valid.");
    if (image && image.size > 2 * 1024 * 1024)
      errs.push("Ukuran gambar maksimal 2 MB.");
    setServerError(errs.join(" "));
    return errs.length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    setServerError("");
    if (!validate() || !id) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("description", description.trim());
      fd.append("price", String(Math.trunc(Number(price))));
      fd.append("stock", String(Math.trunc(Number(stock))));
      if (image) fd.append("imageUrl", image);
      await updateProduct(id, fd);
      setMsg("Produk berhasil diperbarui.");
      nav("/");
    } catch (e: any) {
      setServerError(e?.response?.data?.message ?? "Gagal menyimpan produk");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-0 outline-none";

  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          Edit Produk
        </h1>
        <p className="mt-1 text-center text-sm text-zinc-400">
          Lengkapi detail produk agar mudah ditemukan pembeli.
        </p>

        {serverError && (
          <div className="mt-4 rounded-lg border border-red-600/30 bg-red-950/30 px-3 py-2 text-sm text-red-300">
            {serverError}
          </div>
        )}
        {msg && (
          <div className="mt-4 rounded-lg border border-emerald-600/30 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
            {msg}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm text-zinc-300">Nama</label>
            <input
              className={inputClass}
              placeholder="Contoh: Iphone 17 Pro"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-zinc-300">
              Deskripsi
            </label>
            <textarea
              className={`${inputClass} min-h-24`}
              placeholder="Deskripsi singkat produk"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-zinc-300">
                Harga (Rp)
              </label>
              <input
                className={`${inputClass} no-spinner`}
                type="number"
                min={0}
                step="1"
                placeholder="20000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-zinc-300">Stok</label>
              <input
                className={inputClass}
                type="number"
                min={0}
                step="1"
                placeholder="10"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-zinc-300">
              Gambar (opsional)
            </label>
            <input
              className="w-full text-sm text-zinc-100 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:text-zinc-100 hover:file:bg-zinc-700"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="preview"
                  className="h-28 w-28 rounded-md border border-zinc-800 object-cover"
                />
              </div>
            )}
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </div>
    </div>
  );
}
