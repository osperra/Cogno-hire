import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Divider,
  Input,
  Label,
  Spinner,
  Text,
  Textarea,
  makeStyles,
  shorthands,
  tokens,
  Combobox,
  Option,
} from "@fluentui/react-components";
import {
  TargetArrowRegular,
} from "@fluentui/react-icons";
import { api } from "../../api/http";

const useStyles = makeStyles({
  root: {
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    rowGap: "14px",
  },
  headerBar: {
    position: "sticky",
    top: "0px",
    zIndex: 5,
    backgroundColor: "rgba(255,248,248,0.92)",
    backdropFilter: "blur(10px)",
    ...shorthands.padding("14px", "12px"),
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  headerLeft: { display: "flex", flexDirection: "column", gap: "2px" },
  titleRow: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  title: { fontSize: "20px", fontWeight: 900, color: "#0B1220" },
  sub: { fontSize: "12px", color: "#5B6475" },
  msgError: { color: tokens.colorPaletteRedForeground1, fontSize: "12px" },
  msgOk: { color: tokens.colorPaletteGreenForeground1, fontSize: "12px" },
  actions: { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" },

  card: {
    ...shorthands.borderRadius("18px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    backgroundColor: "#fff",
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
    ...shorthands.padding("16px"),
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap",
  },
  headerTitle: { display: "flex", alignItems: "center", gap: "10px" },
  iconPill: {
    width: "34px",
    height: "34px",
    borderRadius: "12px",
    backgroundColor: "#EEF2FF",
    color: "#1B56FD",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 auto",
  },
  sectionTitle: { fontSize: "14px", fontWeight: 900, color: "#0B1220" },
  sectionSub: { fontSize: "12px", color: "#5B6475", marginTop: "2px" },

  form2: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
    "@media (min-width: 640px)": { gridTemplateColumns: "1fr 1fr" },
  },
  field: { display: "flex", flexDirection: "column", rowGap: "6px" },
  primaryButton: {
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
    ":hover": { backgroundColor: "#1B56FD", color: "#FFFFFF" },
  },
});

type UserResponse = {
  preferences?: {
    careerGoals?: {
      targetRole?: string;
      targetSalary?: {
        min?: number | string;
        max?: number | string;
        currency?: string;
      };
      targetIndustries?: string[];
      timeline?: string;
      skillsToAcquire?: string[];
      notes?: string;
    };
  };
};

export default function CandidateCareerGoals() {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [goals, setGoals] = useState<{
    targetRole: string;
    targetSalary: { min: string; max: string; currency: string };
    targetIndustries: string[];
    timeline: string;
    skillsToAcquire: string[];
    notes: string;
  }>({
    targetRole: "",
    targetSalary: { min: "", max: "", currency: "USD" },
    targetIndustries: [],
    timeline: "Open",
    skillsToAcquire: [],
    notes: "",
  });

  const load = async () => {
    setError("");
    setOk("");
    setLoading(true);
    try {
      const me = await api<UserResponse>("/api/auth/me");
      const g = me.preferences?.careerGoals || {};
      setGoals({
        targetRole: g.targetRole || "",
        targetSalary: {
          min: g.targetSalary?.min?.toString() || "",
          max: g.targetSalary?.max?.toString() || "",
          currency: g.targetSalary?.currency || "USD",
        },
        targetIndustries: g.targetIndustries || [],
        timeline: g.timeline || "Open",
        skillsToAcquire: g.skillsToAcquire || [],
        notes: g.notes || "",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    setError("");
    setOk("");
    setSaving(true);
    try {
      const me = await api<UserResponse>("/api/auth/me");
      const updatedPrefs = {
        ...me.preferences,
        careerGoals: {
          ...goals,
          targetSalary: {
            min: Number(goals.targetSalary.min) || undefined,
            max: Number(goals.targetSalary.max) || undefined,
            currency: goals.targetSalary.currency,
          },
        },
      };

      await api("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: updatedPrefs }),
      });

      setOk("Goals updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <div className={styles.title}>Career Goals</div>
            <Badge appearance="tint" color="brand">
              Candidate
            </Badge>
          </div>
          <div className={styles.sub}>
            Set your career objectives to help us recommend better opportunities.
          </div>
          {error ? <div className={styles.msgError}>{error}</div> : null}
          {ok ? <div className={styles.msgOk}>{ok}</div> : null}
        </div>

        <div className={styles.actions}>
          <Button
            appearance="outline"
            onClick={() => void load()}
            disabled={loading || saving}
          >
            Refresh
          </Button>
          <Button
            appearance="primary"
            className={styles.primaryButton}
            onClick={() => void save()}
            disabled={loading || saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className={styles.card}>
          <Spinner size="medium" />
        </Card>
      ) : (
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.headerTitle}>
              <span className={styles.iconPill}>
                <TargetArrowRegular />
              </span>
              <div>
                <Text className={styles.sectionTitle}>Your Goals</Text>
                <div className={styles.sectionSub}>Manage your target role and preferences.</div>
              </div>
            </div>
            <Badge appearance="tint" color="informative">Private</Badge>
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <div className={styles.form2}>
            <div className={styles.field}>
              <Label>Target Role</Label>
              <Input
                value={goals.targetRole}
                onChange={(_, d) => setGoals((p) => ({ ...p, targetRole: d.value }))}
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>

             <div className={styles.field}>
              <Label>Timeline</Label>
              <Combobox
                value={goals.timeline}
                onOptionSelect={(_, d) =>
                  setGoals((p) => ({ ...p, timeline: d.optionValue || "Open" }))
                }
                freeform
              >
                <Option>Immediate</Option>
                <Option>1-3 Months</Option>
                <Option>3-6 Months</Option>
                <Option>6-12 Months</Option>
                <Option>Open</Option>
              </Combobox>
            </div>

            <div className={styles.field}>
              <Label>Min Salary (USD)</Label>
              <Input
                type="number"
                value={goals.targetSalary.min}
                onChange={(_, d) =>
                  setGoals((p) => ({
                    ...p,
                    targetSalary: { ...p.targetSalary, min: d.value },
                  }))
                }
              />
            </div>

            <div className={styles.field}>
              <Label>Max Salary (USD)</Label>
              <Input
                type="number"
                value={goals.targetSalary.max}
                onChange={(_, d) =>
                  setGoals((p) => ({
                    ...p,
                    targetSalary: { ...p.targetSalary, max: d.value },
                  }))
                }
              />
            </div>

            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <Label>Target Industries (comma separated)</Label>
              <Input
                 value={goals.targetIndustries.join(", ")}
                 onChange={(_, d) =>
                   setGoals((p) => ({
                     ...p,
                     targetIndustries: d.value.split(",").map((s) => s.trim()),
                   }))
                 }
                 placeholder="e.g. Fintech, Edtech, AI"
              />
            </div>
            
            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <Label>Skills to Acquire (comma separated)</Label>
              <Input
                value={goals.skillsToAcquire.join(", ")}
                onChange={(_, d) =>
                  setGoals((p) => ({
                    ...p,
                    skillsToAcquire: d.value.split(",").map((s) => s.trim()),
                  }))
                }
                placeholder="e.g. Rust, Go, Leadership"
              />
            </div>

            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <Label>Notes</Label>
              <Textarea
                value={goals.notes}
                onChange={(_, d) => setGoals((p) => ({ ...p, notes: d.value }))}
                rows={4}
                placeholder="Any specific companies or other requirements..."
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
