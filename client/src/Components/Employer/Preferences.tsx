import * as React from "react";
import {
  Button,
  // Field,
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
  Divider,
} from "@fluentui/react-components";
import { api } from "../../api/http";


type PreferencesResponse = {
  emailNotifications?: boolean;
  productUpdates?: boolean;
  marketingEmails?: boolean;
  desktopNotifications?: boolean;
  weeklySummary?: boolean;
  defaultLanding?: "dashboard" | "jobs" | "applicants" | "company" | "analytics";
  theme?: "light" | "dark" | "system";
};

type PreferencesForm = {
  emailNotifications: boolean;
  productUpdates: boolean;
  marketingEmails: boolean;
  desktopNotifications: boolean;
  weeklySummary: boolean;
  defaultLanding: "dashboard" | "jobs" | "applicants" | "company" | "analytics";
  theme: "light" | "dark" | "system";
};

const useStyles = makeStyles({
  page: {
    padding: "24px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "16px",
  },
  titleWrap: { display: "flex", flexDirection: "column", gap: "4px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    alignItems: "start",
    "@media (max-width: 980px)": {
      gridTemplateColumns: "1fr",
    },
  },
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: "16px",
    padding: "16px",
    boxShadow: tokens.shadow16,
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
  },
  muted: { color: tokens.colorNeutralForeground3 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "10px 0",
  },
  left: { display: "flex", flexDirection: "column", gap: "2px" },
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "24px",
    paddingTop: "16px",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
});

const DEFAULTS: PreferencesForm = {
  emailNotifications: true,
  productUpdates: true,
  marketingEmails: false,
  desktopNotifications: false,
  weeklySummary: true,
  defaultLanding: "dashboard",
  theme: "system",
};

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
      const serverPrefs = await api<PreferencesResponse>(
        "/api/preferences/me",
      ).catch(() => null);

      const merged: PreferencesForm = { ...DEFAULTS, ...(serverPrefs ?? {}) };

      setPrefs(merged);
      setInitial(merged);
      
    } catch (e) {
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
        body: JSON.stringify(prefs),
      });

      const merged: PreferencesForm = { ...DEFAULTS, ...(updated ?? {}) };

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
      <div className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <Text size={700} weight="semibold">
            Preferences
          </Text>
          <Text className={styles.muted} size={300}>
            Manage your notifications, theme, and default views.
          </Text>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Button appearance="outline" onClick={reset} disabled={saving || !dirty}>
            Reset
          </Button>
          <Button appearance="primary" onClick={() => void save()} disabled={saving || !dirty}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {msg && (
        <MessageBar intent={msg.type === "success" ? "success" : "error"} style={{ marginBottom: "16px" }}>
          <MessageBarBody>
            <MessageBarTitle>
              {msg.type === "success" ? "Success" : "Error"}
            </MessageBarTitle>
            {msg.text}
          </MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardTitle}>
            <Text size={500} weight="semibold">
              General Settings
            </Text>
          </div>

          <div className={styles.row}>
             <div className={styles.left}>
                <Text weight="semibold">Theme</Text>
                <Text size={200} className={styles.muted}>
                  Choose your preferred appearance.
                </Text>
             </div>
             <Dropdown
                value={prefs.theme.charAt(0).toUpperCase() + prefs.theme.slice(1)}
                selectedOptions={[prefs.theme]}
                onOptionSelect={(_, data) => {
                  const nextTheme = (data.optionValue as "light" | "dark" | "system") || "system";
                  setPrefs((p) => ({
                    ...p,
                    theme: nextTheme,
                  }));
                }}
                style={{ minWidth: "120px" }}
              >
                <Option value="light">Light</Option>
                <Option value="dark">Dark</Option>
                <Option value="system">System</Option>
              </Dropdown>
          </div>

          <Divider />

          <div className={styles.row}>
            <div className={styles.left}>
              <Text weight="semibold">Default Landing Page</Text>
              <Text size={200} className={styles.muted}>
                The page you see when you log in.
              </Text>
            </div>
            <Dropdown
              value={prefs.defaultLanding.charAt(0).toUpperCase() + prefs.defaultLanding.slice(1)}
              selectedOptions={[prefs.defaultLanding]}
              onOptionSelect={(_, data) =>
                setPrefs((p) => ({
                  ...p,
                  defaultLanding:
                    (data.optionValue as PreferencesForm["defaultLanding"]) ||
                    "dashboard",
                }))
              }
              style={{ minWidth: "140px" }}
            >
              <Option value="dashboard">Dashboard</Option>
              <Option value="jobs">Jobs</Option>
              <Option value="applicants">Applicants</Option>
              <Option value="company">Company</Option>
              <Option value="analytics">Analytics</Option>
            </Dropdown>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardTitle}>
            <Text size={500} weight="semibold">
              Notifications
            </Text>
          </div>

          <div className={styles.row}>
            <div className={styles.left}>
              <Text weight="semibold">Email notifications</Text>
              <Text size={200} className={styles.muted}>
                Get updates on jobs and applicants.
              </Text>
            </div>
            <Switch
              checked={prefs.emailNotifications}
              onChange={(_, d) =>
                setPrefs((p) => ({ ...p, emailNotifications: d.checked }))
              }
            />
          </div>

          <Divider />

          <div className={styles.row}>
            <div className={styles.left}>
              <Text weight="semibold">Weekly summary</Text>
              <Text size={200} className={styles.muted}>
                Receive a weekly activity digest.
              </Text>
            </div>
            <Switch
              checked={prefs.weeklySummary}
              onChange={(_, d) =>
                setPrefs((p) => ({ ...p, weeklySummary: d.checked }))
              }
            />
          </div>

          <Divider />

          <div className={styles.row}>
            <div className={styles.left}>
              <Text weight="semibold">Product updates</Text>
              <Text size={200} className={styles.muted}>
                News about new features and improvements.
              </Text>
            </div>
            <Switch
              checked={prefs.productUpdates}
              onChange={(_, d) =>
                setPrefs((p) => ({ ...p, productUpdates: d.checked }))
              }
            />
          </div>

          <Divider />

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

          <Divider />

          <div className={styles.row}>
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
        </section>
      </div>
    </div>
  );
}
