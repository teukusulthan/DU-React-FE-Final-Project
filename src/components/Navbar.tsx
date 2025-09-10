import { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import { useCart } from "../cart/CartProvider";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { totalItems } = useCart();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
        document.removeEventListener("keydown", onKey);
      };
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (path: string) => {
    if (path === "/products/new") return pathname.startsWith("/products/new");
    return pathname === path;
  };

  const linkClass = (path: string) =>
    [
      "px-3 py-2 text-sm rounded-md transition",
      "text-zinc-300 hover:text-white hover:bg-zinc-800",
      isActive(path) ? "bg-zinc-800 text-white" : "",
    ].join(" ");

  return (
    <div className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-zinc-200">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-white"
          >
            Ninetyn <span className="text-blue-400">Store</span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <Link to="/" className={linkClass("/")}>
              Produk
            </Link>

            {user && (
              <Link to="/cart" className={linkClass("/cart")}>
                <span className="inline-flex items-center gap-1">
                  Keranjang
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full border border-zinc-700 px-1 text-[11px] leading-4 text-zinc-300">
                    {totalItems}
                  </span>
                </span>
              </Link>
            )}

            {user && (
              <Link to="/orders" className={linkClass("/orders")}>
                Pesanan
              </Link>
            )}
          </div>
        </div>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          {user?.role === "supplier" && (
            <Link to="/products/new" className={linkClass("/products/new")}>
              Tambah Produk
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-zinc-400 sm:inline">
                Hi, {user.name} • Role:{" "}
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <button
                onClick={logout}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className={linkClass("/login")}>
                Login
              </Link>
              <Link to="/register" className={linkClass("/register")}>
                Register
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          className="rounded-md border border-zinc-700 p-2 text-zinc-300 hover:bg-zinc-800 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-5 w-6">
            <span
              className={[
                "absolute left-0 top-1 block h-0.5 w-6 bg-zinc-300 transition-transform duration-300",
                open ? "translate-y-1.5 rotate-45" : "",
              ].join(" ")}
            />
            <span
              className={[
                "absolute left-0 top-2.5 block h-0.5 w-6 bg-zinc-300 transition-opacity duration-200",
                open ? "opacity-0" : "opacity-100",
              ].join(" ")}
            />
            <span
              className={[
                "absolute bottom-1 left-0 block h-0.5 w-6 bg-zinc-300 transition-transform duration-300",
                open ? "-translate-y-1.5 -rotate-45" : "",
              ].join(" ")}
            />
          </span>
        </button>
      </div>

      <div
        onClick={() => setOpen(false)}
        className={[
          "fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm transition-opacity md:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        className={[
          "fixed right-0 top-0 z-50 h-full w-72 max-w-[85%] border-l border-zinc-800 bg-zinc-950 md:hidden",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
          <span className="text-sm font-medium text-zinc-200">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md border border-zinc-700 p-2 text-zinc-300 hover:bg-zinc-800"
            aria-label="Close menu"
          >
            ✖
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-3">
          <Link to="/" className={linkClass("/")}>
            Produk
          </Link>

          {user && (
            <Link to="/cart" className={linkClass("/cart")}>
              <span className="inline-flex items-center gap-1">
                Keranjang
                <span className="inline-flex min-w-5 items-center justify-center rounded-full border border-zinc-700 px-1 text-[11px] leading-4 text-zinc-300">
                  {totalItems}
                </span>
              </span>
            </Link>
          )}

          {user && (
            <Link to="/orders" className={linkClass("/orders")}>
              Pesanan
            </Link>
          )}

          {user?.role === "supplier" && (
            <Link to="/products/new" className={linkClass("/products/new")}>
              Tambah Produk
            </Link>
          )}

          <div className="my-2 h-px bg-zinc-800" />

          {user ? (
            <button
              onClick={logout}
              className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className={linkClass("/login")}>
                Login
              </Link>
              <Link to="/register" className={linkClass("/register")}>
                Register
              </Link>
            </>
          )}
        </nav>
      </aside>
    </div>
  );
}
