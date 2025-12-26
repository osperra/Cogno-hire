// client/src/Components/auth/Login.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

type Role = "employer" | "candidate" | "admin" | "hr";

type LoginResponse = {
  token: string;
  user: { role: Role; id?: string; name?: string; email?: string };
  message?: string;
};

function isRole(v: unknown): v is Role {
  return v === "employer" || v === "candidate" || v === "admin" || v === "hr";
}

export function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!API_BASE) {
      setError(
        "API base URL missing. Set VITE_API_BASE_URL in client/.env (example: http://localhost:5000) and restart frontend."
      );
      return;
    }

    const safeEmail = email.trim().toLowerCase();
    const safePassword = password.trim();

    if (!safeEmail.includes("@") || !safeEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!safePassword) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: safeEmail, password: safePassword }),
      });

      const raw = await res.text();

      let data: Partial<LoginResponse> = {};
      try {
        data = raw ? (JSON.parse(raw) as Partial<LoginResponse>) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          `Login failed (${res.status}). Backend returned non-JSON (likely wrong route/crash).`;
        throw new Error(msg);
      }

      if (!data.token) throw new Error("Invalid login response: missing token.");
      if (!data.user || !isRole(data.user.role)) {
        throw new Error("Invalid login response: missing/invalid user role.");
      }

      // ✅ store auth
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      // optional helpers for UI
      if (data.user.id) localStorage.setItem("userId", data.user.id);
      if (data.user.name) localStorage.setItem("userName", data.user.name);
      if (data.user.email) localStorage.setItem("userEmail", data.user.email);

      // ✅ one single entry route
      nav("/app", { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message === "Failed to fetch"
            ? "Cannot reach backend. Check: server is running, VITE_API_BASE_URL is correct, and CORS_ORIGIN allows this frontend URL."
            : err.message
          : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brandRow}>
          <div style={styles.logo}>C</div>
          <div>
            <div style={styles.brandName}>Cogno</div>
            <div style={styles.brandTag}>AI Interview Platform</div>
          </div>
        </div>

        <h2 style={styles.h2}>Sign In</h2>
        <p style={styles.subtitle}>Welcome back. Sign in to continue.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button disabled={loading} style={styles.primaryBtn} type="submit">
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div style={styles.footerRow}>
            <span style={{ color: "#5B6475" }}>
              Don’t have an account?{" "}
              <Link to="/register" style={styles.link}>
                Register
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 16,
    background: "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 45%, #fff 100%)",
  },
  card: {
    width: "100%",
    maxWidth: 460,
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
    border: "1px solid rgba(15,23,42,0.08)",
  },
  brandRow: { display: "flex", gap: 12, alignItems: "center", marginBottom: 14 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    color: "#fff",
    fontWeight: 800,
    background: "linear-gradient(135deg,#0118D8,#1B56FD)",
    boxShadow: "0 10px 25px rgba(1,24,216,0.25)",
  },
  brandName: { fontWeight: 700, fontSize: 16, color: "#0B1220" },
  brandTag: { fontSize: 12, color: "#5B6475", marginTop: 2 },
  h2: { margin: "6px 0 0", fontSize: 22, color: "#0B1220" },
  subtitle: { margin: "6px 0 16px", color: "#5B6475", fontSize: 14 },
  form: { display: "grid", gap: 12 },
  field: { display: "grid", gap: 6 },
  label: { fontSize: 13, color: "#0B1220", fontWeight: 600 },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(15,23,42,0.15)",
    outline: "none",
    fontSize: 14,
  },
  error: {
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.25)",
    color: "#b91c1c",
    fontSize: 13,
  },
  primaryBtn: {
    marginTop: 6,
    padding: "11px 12px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg,#0118D8,#1B56FD)",
    boxShadow: "0 10px 25px rgba(1,24,216,0.25)",
  },
  footerRow: { marginTop: 8, textAlign: "center", fontSize: 13 },
  link: { color: "#0118D8", fontWeight: 700, textDecoration: "none" },
};
