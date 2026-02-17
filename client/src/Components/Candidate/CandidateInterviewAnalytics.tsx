import { useEffect, useMemo, useState } from "react";
import { Button, Card, Divider, Input, Label, makeStyles, shorthands, Spinner, Text } from "@fluentui/react-components";
import { ArrowRight20Regular, ArrowTrending20Regular, Calendar20Regular, Search20Regular, Dismiss20Regular } from "@fluentui/react-icons";
import { api } from "../../api/http";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../layout/AppLayout";
import { StatusPill, type StatusType } from "../ui/StatusPill"; 

type InterviewResultItem = {
  _id: string;
  applicationId?: string;
  jobId?: string;

  jobTitle: string;
  company: string;

  overallScore: number;
  feedback?: string;

  createdAt?: string;
  updatedAt?: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asArrayResponse(input: unknown): InterviewResultItem[] {
  if (Array.isArray(input)) return input as InterviewResultItem[];

  if (isRecord(input)) {
    const r = input["results"];
    const i = input["items"];
    const d = input["data"];

    if (Array.isArray(r)) return r as InterviewResultItem[];
    if (Array.isArray(i)) return i as InterviewResultItem[];
    if (Array.isArray(d)) return d as InterviewResultItem[];

    if (typeof input["_id"] === "string") return [input as InterviewResultItem];
  }
  return [];
}

function clampScore(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scorePill(score: number): { status: StatusType; label: string } {
  if (score >= 75) return { status: "success", label: "Strong" };
  if (score >= 50) return { status: "warning", label: "Average" };
  return { status: "danger", label: "Needs Improvement" };
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    rowGap: "16px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },

  titleRow: { display: "flex", flexDirection: "column", rowGap: "4px" },
  title: { fontSize: "1.25rem", fontWeight: 700, color: "#0B1220" },
  subtitle: { color: "#5B6475" },

  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "end",
    gap: "12px",
    minWidth: "280px",
  },

  card: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    ...shorthands.padding("16px"),
    backgroundColor: "#FFFFFF",
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  },

  kpiRow: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
    "@media (min-width: 840px)": { gridTemplateColumns: "1fr 1fr 1fr" },
  },

  kpiCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    ...shorthands.padding("16px"),
    background: "linear-gradient(135deg,#EFF6FF,#F5F3FF)",
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  },

  kpiTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" },
  kpiLabel: { color: "#5B6475", fontSize: "0.85rem" },
  kpiValue: { fontSize: "1.7rem", fontWeight: 800, color: "#0118D8" },
  kpiHint: { color: "#6B7280", fontSize: "0.8rem" },

  tableWrap: { width: "100%", overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    minWidth: "760px",
  },
  th: {
    textAlign: "left",
    fontSize: "0.8rem",
    color: "#6B7280",
    fontWeight: 700,
    padding: "10px 12px",
    borderBottom: "1px solid rgba(2,6,23,0.08)",
    background: "#FAFAFA",
  },
  tr: { ":hover": { backgroundColor: "#F9FAFB" } },
  td: {
    padding: "12px",
    borderBottom: "1px solid rgba(2,6,23,0.06)",
    verticalAlign: "top",
    color: "#111827",
    fontSize: "0.9rem",
  },

  titleCell: { display: "flex", flexDirection: "column", rowGap: "2px" },
  company: { color: "#6B7280", fontSize: "0.82rem" },

  scoreCell: { display: "flex", flexDirection: "column", rowGap: "8px" },
  scoreNum: { fontSize: "1.1rem", fontWeight: 800, color: "#0B1220" },

  empty: { textAlign: "center", padding: "22px 16px", color: "#6B7280" },

  pillRow: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  rightActions: { display: "flex", justifyContent: "flex-end", gap: "8px" },

  dateRow: { display: "flex", alignItems: "center", gap: "6px", color: "#6B7280" },
});

export function CandidateInterviewAnalytics() {
  const styles = useStyles();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [all, setAll] = useState<InterviewResultItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api<unknown>("/api/ai/interview/analytics");
        const items = asArrayResponse(data);

        items.sort((a, b) => {
          const da = new Date(a.createdAt || a.updatedAt || 0).getTime();
          const db = new Date(b.createdAt || b.updatedAt || 0).getTime();
          return db - da;
        });

        if (!alive) return;
        setAll(items);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load analytics";
        if (!alive) return;
        setError(msg);
        setAll([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((x) => `${x.jobTitle || ""} ${x.company || ""}`.toLowerCase().includes(q));
  }, [all, query]);

  const kpis = useMemo(() => {
    const total = all.length;
    const avg = total > 0 ? Math.round(all.reduce((s, x) => s + clampScore(Number(x.overallScore)), 0) / total) : 0;
    const best = total > 0 ? Math.max(...all.map((x) => clampScore(Number(x.overallScore)))) : 0;
    const strongCount = all.filter((x) => clampScore(Number(x.overallScore)) >= 75).length;
    return { total, avg, best, strongCount };
  }, [all]);

  const openResult = (item: InterviewResultItem) => {
    if (item.applicationId) {
      navigate(ROUTES.candidateResults, { state: { applicationId: item.applicationId } });
      return;
    }

    navigate(ROUTES.candidateResults, {
      state: {
        overallScore: item.overallScore,
        feedback: item.feedback || "",
        skills: [],
        strengths: [],
        improvements: [],
      },
    });
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.title}>Interview Analytics</div>
          <div className={styles.subtitle}>Your recent interview outcomes and performance trends.</div>
        </div>

        <div className={styles.controls}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 240 }}>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              contentBefore={<Search20Regular />}
              value={query}
              onChange={(_, data) => setQuery(data.value)}
              placeholder="Search by job title or company…"
            />
          </div>

          <Button appearance="primary" icon={<ArrowTrending20Regular />} onClick={() => navigate(ROUTES.candidateJobs)}>
            Find Jobs
          </Button>
        </div>
      </div>

      <div className={styles.kpiRow}>
        <Card className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <Text className={styles.kpiLabel}>Total Interviews</Text>
            <StatusPill status="info" label={String(kpis.total)} size="sm" />
          </div>
          <div className={styles.kpiValue}>{kpis.total}</div>
          <div className={styles.kpiHint}>Completed sessions saved in analytics</div>
        </Card>

        <Card className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <Text className={styles.kpiLabel}>Average Score</Text>
            <StatusPill status="pending" label={`${kpis.avg}%`} size="sm" />
          </div>
          <div className={styles.kpiValue}>{kpis.avg}%</div>
          <div className={styles.kpiHint}>Mean of your saved interview results</div>
        </Card>

        <Card className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <Text className={styles.kpiLabel}>Best Score</Text>
            <StatusPill status="success" label={`${kpis.best}%`} size="sm" />
          </div>
          <div className={styles.kpiValue}>{kpis.best}%</div>
          <div className={styles.kpiHint}>{kpis.strongCount} strong performance(s)</div>
        </Card>
      </div>

      <Card className={styles.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <Text weight="semibold" size={500}>
            Interview History
          </Text>

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Spinner size="tiny" />
              <Text size={200} style={{ color: "#6B7280" }}>
                Loading…
              </Text>
            </div>
          )}
        </div>

        <Divider style={{ marginTop: 12, marginBottom: 12 }} />

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Dismiss20Regular style={{ color: "#EF4444" }} />
            <Text style={{ color: "#B91C1C" }}>{error}</Text>
          </div>
        )}

        {!loading && filtered.length === 0 ? (
          <div className={styles.empty}>
            <Text weight="semibold" size={400}>
              No interview analytics found
            </Text>
            <div style={{ marginTop: 6 }}>
              <Text size={200}>Complete an interview to see results here.</Text>
            </div>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Score</th>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th} style={{ width: 190 }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((it) => {
                  const score = clampScore(Number(it.overallScore));
                  const pill = scorePill(score);
                  const when = formatDate(it.createdAt || it.updatedAt);

                  return (
                    <tr key={it._id} className={styles.tr}>
                      <td className={styles.td}>
                        <div className={styles.titleCell}>
                          <Text weight="semibold">{it.jobTitle || "Interview"}</Text>
                          <Text className={styles.company}>{it.company || "Company"}</Text>
                        </div>
                      </td>

                      <td className={styles.td}>
                        <div className={styles.scoreCell}>
                          <div className={styles.pillRow}>
                            <StatusPill status={pill.status} label={pill.label} />
                            <Text className={styles.scoreNum}>{score}%</Text>
                          </div>

                          {it.feedback ? (
                            <Text size={200} style={{ color: "#6B7280" }}>
                              {it.feedback.length > 120 ? it.feedback.slice(0, 120) + "…" : it.feedback}
                            </Text>
                          ) : (
                            <Text size={200} style={{ color: "#6B7280" }}>
                              No feedback text.
                            </Text>
                          )}
                        </div>
                      </td>

                      <td className={styles.td}>
                        <div className={styles.dateRow}>
                          <Calendar20Regular />
                          <Text size={200}>{when || "—"}</Text>
                        </div>
                      </td>

                      <td className={styles.td}>
                        <div className={styles.rightActions}>
                          <Button appearance="secondary" icon={<ArrowRight20Regular />} onClick={() => openResult(it)}>
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default CandidateInterviewAnalytics;
