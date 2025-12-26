import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

type Role = "candidate" | "employer" | "hr";

type RegisterResponse = {
  token?: string;
  user?: { role: Role };
  message?: string;
};

export function Register() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("candidate");
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

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = (await res.json().catch(() => ({}))) as Partial<RegisterResponse>;

      if (!res.ok) throw new Error(data?.message || "Registration failed");

      // If backend returns token on register, auto-login:
      if (data.token && data.user?.role) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);

        if (data.user.role === "candidate") nav("/candidate");
        else if (data.user.role === "employer") nav("/employer");
        else nav("/hr");
        return;
      }

      // If backend doesn’t auto-login, go to login
      nav("/login");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message === "Failed to fetch"
            ? "Cannot reach backend. Check: server is running, VITE_API_BASE_URL is correct, and CORS allows this frontend URL."
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

        <h2 style={styles.h2}>Create Account</h2>
        <p style={styles.subtitle}>Start your hiring journey in minutes.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <input
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <select
              style={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="candidate">Candidate</option>
              <option value="employer">Employer</option>
              <option value="hr">HR</option>
            </select>
          </div>

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
              autoComplete="new-password"
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button disabled={loading} style={styles.primaryBtn} type="submit">
            {loading ? "Creating account..." : "Create account"}
          </button>

          <div style={styles.footerRow}>
            <span style={{ color: "#5B6475" }}>
              Already have an account?{" "}
              <Link to="/login" style={styles.link}>
                Sign in
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
    background: "#fff",
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
