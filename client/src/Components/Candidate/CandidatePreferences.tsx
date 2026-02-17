import * as React from "react";
import {
  Button,
  Card,
  Checkbox,
  // Field,
  Input,
  Label,
  Switch,
  makeStyles,
  shorthands,
  Spinner,
  Text,
  tokens,
} from "@fluentui/react-components";
import { api } from "../../api/http";

const useStyles = makeStyles({
  root: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  card: {
    ...shorthands.borderRadius("12px"),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    padding: "24px",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: { marginBottom: "24px" },
  title: { fontSize: "20px", fontWeight: "600", color: tokens.colorNeutralForeground1 },
  subtitle: { fontSize: "14px", color: tokens.colorNeutralForeground2, marginTop: "4px" },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: tokens.colorNeutralForeground1,
    marginBottom: "8px",
  },
  row: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: "1",
    minWidth: "120px",
  },
  checkboxGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "12px",
    paddingTop: "16px",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  success: {
    color: tokens.colorPaletteGreenForeground1,
    fontSize: "14px",
    fontWeight: "500",
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: "14px",
    fontWeight: "500",
  },
});

type Preferences = {
  jobTypes: string[];
  workModes: string[];
  locations: string[];
  salary: { min: number; max: number; currency: string };
  relocation: boolean;
};

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
const WORK_MODES = ["Remote", "Hybrid", "On-site"];

export default function CandidatePreferences() {
  const styles = useStyles();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const [pref, setPref] = React.useState<Preferences>({
    jobTypes: [],
    workModes: [],
    locations: [],
    salary: { min: 0, max: 0, currency: "USD" },
    relocation: false,
  });
  
  const [locationInput, setLocationInput] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await api<{ preferences?: Preferences }>("/api/candidates/me");
        if (!alive) return;
        if (me?.preferences) {
          setPref({
            jobTypes: me.preferences.jobTypes || [],
            workModes: me.preferences.workModes || [],
            locations: me.preferences.locations || [],
            salary: {
              min: me.preferences.salary?.min || 0,
              max: me.preferences.salary?.max || 0,
              currency: me.preferences.salary?.currency || "USD",
            },
            relocation: !!me.preferences.relocation,
          });
          setLocationInput((me.preferences.locations || []).join(", "));
        }
      } catch (e) {
        console.error("Failed to load preferences", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const locations = locationInput.split(",").map(s => s.trim()).filter(Boolean);
      
      const payload = {
        preferences: {
          ...pref,
          locations,
        },
      };

      await api("/api/candidates/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setMsg({ type: "success", text: "Preferences saved successfully." });
      setPref(p => ({ ...p, locations })); 
    } catch {
      setMsg({ type: "error", text: "Failed to save preferences." });
    } finally {
      setSaving(false);
    }
  };

  const toggleList = (list: string[], item: string) => {
    return list.includes(item)
      ? list.filter((i) => i !== item)
      : [...list, item];
  };

  if (loading) {
    return (
      <div className={styles.root} style={{ alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <Spinner label="Loading preferences..." />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.title}>Job Preferences</div>
          <div className={styles.subtitle}>
            Tell us what you're looking for to get better job recommendations.
          </div>
        </div>

        <div className={styles.section}>
          <Label className={styles.sectionTitle}>Job Type</Label>
          <div className={styles.checkboxGroup}>
            {JOB_TYPES.map((type) => (
              <Checkbox
                key={type}
                label={type}
                checked={pref.jobTypes.includes(type)}
                onChange={() =>
                  setPref((p) => ({ ...p, jobTypes: toggleList(p.jobTypes, type) }))
                }
              />
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <Label className={styles.sectionTitle}>Work Mode</Label>
          <div className={styles.checkboxGroup}>
            {WORK_MODES.map((mode) => (
              <Checkbox
                key={mode}
                label={mode}
                checked={pref.workModes.includes(mode)}
                onChange={() =>
                  setPref((p) => ({ ...p, workModes: toggleList(p.workModes, mode) }))
                }
              />
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <Label className={styles.sectionTitle}>Preferred Locations</Label>
          <Input
            value={locationInput}
            onChange={(_, d) => setLocationInput(d.value)}
            placeholder="e.g. New York, Remote, London (comma separated)"
            style={{ maxWidth: "100%" }}
          />
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            Separate multiple locations with commas.
          </Text>
        </div>

        <div className={styles.section}>
          <Label className={styles.sectionTitle}>Expected Salary (Annual)</Label>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <Label size="small">Currency</Label>
              <Input
                value={pref.salary.currency}
                onChange={(_, d) =>
                  setPref((p) => ({ ...p, salary: { ...p.salary, currency: d.value.toUpperCase().slice(0, 3) } }))
                }
                style={{ width: "80px" }}
              />
            </div>
            <div className={styles.inputGroup}>
              <Label size="small">Min</Label>
              <Input
                type="number"
                value={pref.salary.min.toString()}
                onChange={(_, d) =>
                  setPref((p) => ({ ...p, salary: { ...p.salary, min: parseInt(d.value) || 0 } }))
                }
                contentBefore="$"
              />
            </div>
            <div className={styles.inputGroup}>
              <Label size="small">Max</Label>
              <Input
                type="number"
                value={pref.salary.max.toString()}
                onChange={(_, d) =>
                  setPref((p) => ({ ...p, salary: { ...p.salary, max: parseInt(d.value) || 0 } }))
                }
                contentBefore="$"
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.row} style={{ justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Label className={styles.sectionTitle} style={{ marginBottom: 0 }}>Open to Relocation</Label>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                Are you willing to move for the right job?
              </Text>
            </div>
            <Switch
              checked={pref.relocation}
              onChange={(_, d) => setPref((p) => ({ ...p, relocation: d.checked }))}
            />
          </div>
        </div>

        <div className={styles.actions}>
          {msg && (
            <div style={{ display: "flex", alignItems: "center", marginRight: "auto" }}>
              <span className={msg.type === "success" ? styles.success : styles.error}>
                {msg.text}
              </span>
            </div>
          )}
          
          <Button appearance="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
