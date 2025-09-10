import {
  useContext,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthProvider";

type Role = "user" | "supplier";

type Props = {
  children: ReactNode;
  role?: Role;
};

function normalizeRole(r?: string | null): Role {
  const low = (r ?? "").toLowerCase();
  if (low === "supplier" || low === "admin") return "supplier";
  return "user";
}

function getRoleFromToken(token: string | null): Role | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const json = JSON.parse(atob(parts[1]));
    const raw = json?.role ?? json?.user?.role;
    return normalizeRole(raw);
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children, role }: Props) {
  const { token, user, meLoading } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" replace />;

  const fastRole = useMemo(() => getRoleFromToken(token), [token]);
  if (role && fastRole && fastRole !== role) return <Navigate to="/" replace />;

  const [timeoutPassed, setTimeoutPassed] = useState(false);
  useEffect(() => {
    if (!role) return;
    setTimeoutPassed(false);
    const t = setTimeout(() => setTimeoutPassed(true), 1500);
    return () => clearTimeout(t);
  }, [role, token]);

  if (role) {
    if ((meLoading || !user) && timeoutPassed)
      return <Navigate to="/" replace />;
    if (user && user.role !== role) return <Navigate to="/" replace />;
    if (meLoading || !user) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-400">
          Memuat...
        </div>
      );
    }
  }

  return <>{children}</>;
}
