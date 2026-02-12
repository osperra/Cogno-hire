// client/src/Components/Employer/Preferences.tsx
// Theme removed completely

import * as React from "react";
import {
  Button,
  Field,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Switch,
  Text,
  makeStyles,
  tokens,
  Spinner,
  Dropdown,
  Option,
} from "@fluentui/react-components";
import { api } from "../../api/http";

type Role = "employer" | "candidate";

type PreferencesResponse = {
  role?: Role;
  emailNotifications?: boolean;
  productUpdates?: boolean;
  marketingEmails?: boolean;
  desktopNotifications?: boolean;
  weeklySummary?: boolean;
  defaultLanding?: "dashboard" | "jobs" | "applicants" | "company" | "analytics";
};

type PreferencesForm = {
  role: Role;
  emailNotifications: boolean;
  productUpdates: boolean;
  marketingEmails: boolean;
  desktopNotifications: boolean;
  weeklySummary: boolean;
  defaultLanding: "dashboard" | "jobs" | "applicants" | "company" | "analytics";
};

const useStyles = makeStyles({
  page: { padding: "24px", maxWidth: "900px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  headerTextWrap: { display: "flex", flexDirection: "column" },
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: tokens.shadow16,
  },
  sectionTitle: { marginTop: "16px", marginBottom: "8px" },
  muted: { color: tokens.colorNeutralForeground3 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "10px 0",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  rowLast: { borderBottom: "none" },
  left: { display: "flex", flexDirection: "column", gap: "2px" },
  actions: { display: "flex", gap: "12px", marginTop: "16px" },
  controls: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginTop: "12px",
  },
});

const DEFAULTS: PreferencesForm = {
  role: "employer",
  emailNotifications: true,
  productUpdates: true,
  marketingEmails: false,
  desktopNotifications: false,
  weeklySummary: true,
  defaultLanding: "dashboard",
};

function mergePrefs(
  server: PreferencesResponse | null,
  role: Role,
): PreferencesForm {
  return { ...DEFAULTS, role, ...(server ?? {}) };
}

async function requestDesktopNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const p = await Notification.requestPermission();
  return p === "granted";
}

export default function Preferences() {
  const styles = useStyles();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [prefs, setPrefs] = React.useState<PreferencesForm>(DEFAULTS);
  const [initial, setInitial] = React.useState<PreferencesForm>(DEFAULTS);

  const [msg, setMsg] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setMsg(null);

    try {
      const me = await api<{ role: Role }>("/api/auth/me");
      const role = me?.role ?? "employer";

      const serverPrefs = await api<PreferencesResponse>(
        "/api/preferences/me",
      ).catch(() => null);

      const merged = mergePrefs(serverPrefs, role);

      setPrefs(merged);
      setInitial(merged);
    } catch (e) {
      const role = (localStorage.getItem("role") as Role) || "employer";
      const merged = mergePrefs(null, role);

      setPrefs(merged);
      setInitial(merged);

      setMsg({
        type: "error",
        text: e instanceof Error ? e.message : "Failed to load preferences",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const dirty = React.useMemo(
    () => JSON.stringify(prefs) !== JSON.stringify(initial),
    [prefs, initial],
  );

  const reset = () => {
    setMsg(null);
    setPrefs(initial);
  };

  const save = async () => {
    setMsg(null);

    try {
      setSaving(true);

      const updated = await api<PreferencesResponse>("/api/preferences/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications: prefs.emailNotifications,
          productUpdates: prefs.productUpdates,
          marketingEmails: prefs.marketingEmails,
          desktopNotifications: prefs.desktopNotifications,
          weeklySummary: prefs.weeklySummary,
          defaultLanding: prefs.defaultLanding,
        }),
      }).catch(() => null);

      const merged = mergePrefs(updated, prefs.role);

      setPrefs(merged);
      setInitial(merged);

      setMsg({ type: "success", text: "Preferences saved." });
    } catch (e) {
      setMsg({
        type: "error",
        text: e instanceof Error ? e.message : "Failed to save preferences",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className={styles.page}
        style={{ display: "flex", gap: 12, alignItems: "center" }}
      >
        <Spinner />
        <Text>Loading preferences…</Text>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTextWrap}>
          <Text size={700} weight="semibold" style={{ display: "block" }}>
            Preferences
          </Text>
          <Text size={300} className={styles.muted} style={{ marginTop: "4px" }}>
            Notifications and default landing page.
          </Text>
        </div>

        <Button appearance="outline" onClick={() => void load()} disabled={saving}>
          Refresh
        </Button>
      </div>

      {msg && (
        <MessageBar intent={msg.type === "success" ? "success" : "error"}>
          <MessageBarBody>
            <MessageBarTitle>
              {msg.type === "success" ? "Success" : "Error"}
            </MessageBarTitle>
            {msg.text}
          </MessageBarBody>
        </MessageBar>
      )}

      <section className={styles.card} style={{ marginTop: "12px" }}>
        <Text size={500} weight="semibold">
          General
        </Text>

        <div className={styles.controls}>
          <Field label="Default landing">
            <Dropdown
              value={prefs.defaultLanding}
              selectedOptions={[prefs.defaultLanding]}
              onOptionSelect={(_, data) =>
                setPrefs((p) => ({
                  ...p,
                  defaultLanding:
                    (data.optionValue as PreferencesForm["defaultLanding"]) ||
                    "dashboard",
                }))
              }
            >
              <Option value="dashboard">Dashboard</Option>
              <Option value="jobs">Jobs</Option>
              <Option value="applicants">Applicants</Option>
              <Option value="company">Company</Option>
              <Option value="analytics">Analytics</Option>
            </Dropdown>
          </Field>

          {/* empty slot to keep 2-col grid aligned */}
          <div />
        </div>

        <Text size={500} weight="semibold" className={styles.sectionTitle}>
          Notifications
        </Text>

        <div className={styles.row}>
          <div className={styles.left}>
            <Text weight="semibold">Email notifications</Text>
            <Text size={200} className={styles.muted}>
              Job/applicant updates by email.
            </Text>
          </div>
          <Switch
            checked={prefs.emailNotifications}
            onChange={(_, d) =>
              setPrefs((p) => ({ ...p, emailNotifications: d.checked }))
            }
          />
        </div>

        <div className={styles.row}>
          <div className={styles.left}>
            <Text weight="semibold">Weekly summary</Text>
            <Text size={200} className={styles.muted}>
              Receive a weekly activity summary.
            </Text>
          </div>
          <Switch
            checked={prefs.weeklySummary}
            onChange={(_, d) =>
              setPrefs((p) => ({ ...p, weeklySummary: d.checked }))
            }
          />
        </div>

        <div className={styles.row}>
          <div className={styles.left}>
            <Text weight="semibold">Product updates</Text>
            <Text size={200} className={styles.muted}>
              New features and improvements.
            </Text>
          </div>
          <Switch
            checked={prefs.productUpdates}
            onChange={(_, d) =>
              setPrefs((p) => ({ ...p, productUpdates: d.checked }))
            }
          />
        </div>

        <div className={styles.row}>
          <div className={styles.left}>
            <Text weight="semibold">Marketing emails</Text>
            <Text size={200} className={styles.muted}>
              Tips, offers, and announcements.
            </Text>
          </div>
          <Switch
            checked={prefs.marketingEmails}
            onChange={(_, d) =>
              setPrefs((p) => ({ ...p, marketingEmails: d.checked }))
            }
          />
        </div>

        <div className={`${styles.row} ${styles.rowLast}`}>
          <div className={styles.left}>
            <Text weight="semibold">Desktop notifications</Text>
            <Text size={200} className={styles.muted}>
              Browser notifications (requires permission).
            </Text>
          </div>
          <Switch
            checked={prefs.desktopNotifications}
            onChange={async (_, d) => {
              const next = d.checked;
              if (next) {
                const ok = await requestDesktopNotificationPermission();
                if (!ok) {
                  setMsg({
                    type: "error",
                    text: "Desktop notifications permission was not granted.",
                  });
                  setPrefs((p) => ({ ...p, desktopNotifications: false }));
                  return;
                }
              }
              setPrefs((p) => ({ ...p, desktopNotifications: next }));
            }}
          />
        </div>

        <div className={styles.actions}>
          <Button appearance="primary" onClick={() => void save()} disabled={saving || !dirty}>
            {saving ? "Saving..." : "Save preferences"}
          </Button>

          <Button appearance="secondary" onClick={reset} disabled={saving || !dirty}>
            Reset
          </Button>
        </div>

        <Text size={200} className={styles.muted} style={{ marginTop: "10px" }}>
          Note: Preferences will persist only after you add backend routes: GET/PUT /api/preferences/me.
        </Text>
      </section>
    </div>
  );
}
