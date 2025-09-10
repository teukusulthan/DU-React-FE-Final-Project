// src/components/ProductCard.tsx
import { useNavigate } from "react-router-dom";
import type { Product } from "../api/products";
import { toAbsoluteUrl } from "../utils/url";

type Props = {
  p: Product;
  placeholder: string;
};

export default function ProductCard({ p, placeholder }: Props) {
  const nav = useNavigate();

  const rupiah = (n: number) =>
    `Rp ${Number(n).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

  const imgSrc = p.imageUrl ? toAbsoluteUrl(p.imageUrl) : placeholder;
  const isDeleted = Boolean(p.deletedAt);

  const goDetail = () => nav(`/products/${p.id}`);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goDetail();
        }
      }}
      className={[
        "group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 shadow-sm transition",
        "hover:-translate-y-0.5 hover:shadow cursor-pointer",
        isDeleted ? "opacity-75" : "",
      ].join(" ")}
    >
      <div className="relative overflow-hidden rounded-xl">
        <div className="aspect-[4/3] w-full bg-zinc-800/50">
          <img
            src={imgSrc}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = placeholder;
            }}
            alt={p.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        {isDeleted && (
          <span className="absolute left-2 top-2 rounded-full border border-red-700/60 bg-red-900/40 px-2 py-0.5 text-[10px] font-medium text-red-200 backdrop-blur">
            Deleted
          </span>
        )}
      </div>

      <div className="mt-3">
        <h3 className="line-clamp-2 text-[15px] font-semibold text-zinc-100">
          {p.name}
        </h3>
        <p className="mt-1 text-sm text-zinc-400">{rupiah(Number(p.price))}</p>
        {p.description && (
          <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
            {p.description}
          </p>
        )}
      </div>
    </div>
  );
}
