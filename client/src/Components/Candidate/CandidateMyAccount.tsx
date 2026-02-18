import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Spinner,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { api } from "../../api/http";

type Role = "candidate" | "employer" | "hr";

type MeApi = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: Role;
  createdAt?: string;
  updatedAt?: string;
};

type Me = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
};

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    rowGap: "16px",
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "16px",
  },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  title: { fontSize: "18px", fontWeight: 700, color: "#0B1220" },
  sub: { fontSize: "13px", color: "#5B6475", marginTop: "4px" },
  card: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    padding: "16px",
    backgroundColor: "#fff",
  },
  grid: {
    display: "flex",
    gap: "12px",
    alignItems: "start",
    "@media (max-width: 960px)": {
      flexDirection: "column",
    },
  },
  column: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minWidth: 0,
  },
  label: { color: "#5B6475", fontSize: "12px" },
  value: { color: "#0B1220", fontSize: "14px", fontWeight: 600 },
  row: { display: "flex", flexDirection: "column", rowGap: "6px" },
  actions: { display: "flex", gap: "10px", flexWrap: "wrap" },
  msgError: { color: tokens.colorPaletteRedForeground1, fontSize: "13px" },
});

function normalizeMe(r: MeApi): Me {
  return {
    id: String(r.id ?? r._id ?? ""),
    name: String(r.name ?? ""),
    email: String(r.email ?? ""),
    role: (r.role ?? "candidate") as Role,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function fmtDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export default function CandidateMyAccount({
  onNavigate,
  hideHeader = false,
  hidePadding = false,
}: {
  onNavigate: (page: string) => void;
  hideHeader?: boolean;
  hidePadding?: boolean;
}) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState<Me | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const raw = await api<MeApi>("/api/candidates/me");
      setMe(normalizeMe(raw));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load account");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className={hidePadding ? "" : styles.root}>
      {!hideHeader && (
        <div className={styles.header}>
          <div>
            <div className={styles.title}>My Account</div>
            <div className={styles.sub}>View your account information.</div>
            {error ? <div className={styles.msgError}>{error}</div> : null}
          </div>

          <div className={styles.actions}>
            <Button
              appearance="outline"
              onClick={() => void load()}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              appearance="primary"
              onClick={() => onNavigate("profile-settings")}
            >
              Go to Profile Settings
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <Card className={styles.card}>
          <Spinner size="medium" />
        </Card>
      ) : !me ? (
        <Card className={styles.card}>
          <div className={styles.msgError}>Unable to load account.</div>
        </Card>
      ) : (
        <div className={styles.grid}>
          <div className={styles.column}>
            <Card className={styles.card}>
              <div style={{ fontWeight: 700, color: "#0B1220" }}>Account</div>
              <Divider style={{ margin: "12px 0" }} />

              <div className={styles.row}>
                <div className={styles.label}>Name</div>
                <div className={styles.value}>{me.name || "-"}</div>
              </div>

              <div style={{ marginTop: 10 }} className={styles.row}>
                <div className={styles.label}>Email</div>
                <div className={styles.value}>{me.email || "-"}</div>
              </div>

              <div style={{ marginTop: 10 }} className={styles.row}>
                <div className={styles.label}>Role</div>
                <div className={styles.value}>{me.role}</div>
              </div>
            </Card>
          </div>

          <div className={styles.column}>
            <Card className={styles.card}>
              <div style={{ fontWeight: 700, color: "#0B1220" }}>Activity</div>
              <Divider style={{ margin: "12px 0" }} />

              <div className={styles.row}>
                <div className={styles.label}>Created</div>
                <div className={styles.value}>{fmtDate(me.createdAt)}</div>
              </div>

              <div style={{ marginTop: 10 }} className={styles.row}>
                <div className={styles.label}>Last Updated</div>
                <div className={styles.value}>{fmtDate(me.updatedAt)}</div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
