import * as React from "react";
import {
  Avatar,
  Button,
  Field,
  Input,
  Spinner,
  Text,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { api } from "../../api/http";

type Role = "employer" | "candidate";

type MeResponse = {
  _id: string;
  name: string;
  email: string;
  role: Role;
};

const useStyles = makeStyles({
  page: {
    padding: "24px",
    maxWidth: "900px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },

  headerTextWrap: {
    display: "flex",
    flexDirection: "column",
  },

  card: {
    backgroundColor: "#fff",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
  },

  row: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  muted: {
    color: tokens.colorNeutralForeground3,
  },

  form: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "520px",
  },

  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
});

export default function ProfileSettings() {
  const styles = useStyles();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [me, setMe] = React.useState<MeResponse | null>(null);
  const [name, setName] = React.useState("");

  const [msg, setMsg] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setMsg(null);

    try {
      const data = await api<MeResponse>("/api/auth/me");
      setMe(data);
      setName(data.name ?? "");
    } catch (e) {
      setMsg({
        type: "error",
        text: e instanceof Error ? e.message : "Failed to load profile",
      });
      setMe(null);
      setName("");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setMsg(null);

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setMsg({ type: "error", text: "Name must be at least 2 characters." });
      return;
    }

    try {
      setSaving(true);

      const updated = await api<MeResponse>("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      setMe(updated);
      setName(updated.name ?? trimmed);
      setMsg({ type: "success", text: "Profile updated successfully." });
    } catch (e) {
      setMsg({
        type: "error",
        text: e instanceof Error ? e.message : "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className={styles.page}
        style={{ display: "flex", gap: "12px", alignItems: "center" }}
      >
        <Spinner />
        <Text>Loading profile…</Text>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTextWrap}>
          <Text size={700} weight="semibold" style={{ display: "block" }}>
            Profile Settings
          </Text>

          <Text
            size={300}
            className={styles.muted}
            style={{ marginTop: "4px" }}
          >
            Update your public profile details.
          </Text>
        </div>

        <Button
          appearance="outline"
          onClick={() => void load()}
          disabled={saving}
        >
          Refresh
        </Button>
      </div>

      {/* Message */}
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

      {/* Card */}
      <section className={styles.card} style={{ marginTop: "12px" }}>
        <div className={styles.row}>
          <Avatar name={me?.name ?? "User"} size={56} color="brand" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text weight="semibold">{me?.name ?? "—"}</Text>
            <Text size={200} className={styles.muted}>
              {me?.email ?? "—"} • {me?.role ?? "—"}
            </Text>
          </div>
        </div>

        <div className={styles.form}>
          <Field label="Full name">
            <Input value={name} onChange={(_, d) => setName(d.value)} />
          </Field>

          <Field label="Email">
            <Input value={me?.email ?? ""} disabled />
          </Field>

          <div className={styles.actions}>
            <Button
              appearance="primary"
              onClick={() => void save()}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>

            <Button
              appearance="secondary"
              onClick={() => setName(me?.name ?? "")}
              disabled={saving}
            >
              Reset
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
