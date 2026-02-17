import * as React from "react";
import {
  Avatar,
  Button,
  Divider,
  Field,
  Input,
  Spinner,
  Text,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  makeStyles,
  tokens,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";
import { api } from "../../api/http";

type Role = "employer" | "candidate";

type MeResponse = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  lastLoginAt?: string;
  emailVerified?: boolean;
};

type CompanyProfileResponse = {
  _id?: string;
  employerId?: string;
  companyName?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  headquarters?: string;
  description?: string;
};

type CompanyForm = {
  name: string;
  website: string;
  industry: string;
  size: string;
  location: string;
  description: string;
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
    backgroundColor: "#fff",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
  },
  muted: { color: tokens.colorNeutralForeground3 },
  row: { display: "flex", gap: "12px", alignItems: "center" },
  kv: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    gap: "10px",
    rowGap: "10px",
  },
  k: { color: tokens.colorNeutralForeground3, fontSize: "12px" },
  v: {
    color: tokens.colorNeutralForeground1,
    fontSize: "13px",
    fontWeight: 600,
  },
  dangerCard: {
    border: "1px solid rgba(220,38,38,0.25)",
    backgroundColor: "rgba(220,38,38,0.03)",
  },
  dangerText: { color: "#b91c1c" },
  twoCols: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    "@media (max-width: 560px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

function fmtDate(d?: string) {
  if (!d) return "—";
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return "—";
  return t.toLocaleString();
}

function mapProfileToForm(p?: CompanyProfileResponse | null): CompanyForm {
  return {
    name: p?.companyName ?? "",
    website: p?.website ?? "",
    industry: p?.industry ?? "",
    size: p?.companySize ?? "",
    location: p?.headquarters ?? "",
    description: p?.description ?? "",
  };
}

export default function MyAccount() {
  const styles = useStyles();

  const [loading, setLoading] = React.useState(true);
  const [me, setMe] = React.useState<MeResponse | null>(null);

  const [company, setCompany] = React.useState<CompanyProfileResponse | null>(
    null,
  );

  const [error, setError] = React.useState<string>("");

  const [editCompanyOpen, setEditCompanyOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const [companyForm, setCompanyForm] = React.useState<CompanyForm>({
    name: "",
    website: "",
    industry: "",
    size: "",
    location: "",
    description: "",
  });
  const [savingCompany, setSavingCompany] = React.useState(false);

  const [deleteText, setDeleteText] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [deleteMsg, setDeleteMsg] = React.useState<string>("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [meRes, profileRes] = await Promise.all([
        api<MeResponse>("/api/auth/me"),
        api<CompanyProfileResponse | null>("/api/company-profile/me").catch(
          () => null,
        ),
      ]);

      setMe(meRes);
      setCompany(profileRes);
      setCompanyForm(mapProfileToForm(profileRes));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load account");
      setMe(null);
      setCompany(null);
      setCompanyForm(mapProfileToForm(null));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const saveCompany = async () => {
    try {
      setSavingCompany(true);
      setError("");

      const payload = {
        companyName: companyForm.name.trim(),
        website: companyForm.website.trim() || undefined,
        industry: companyForm.industry.trim() || undefined,
        companySize: companyForm.size.trim() || undefined,
        headquarters: companyForm.location.trim() || undefined,
        description: companyForm.description.trim() || undefined,
      };

      const updated = await api<CompanyProfileResponse>(
        "/api/company-profile/me",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      setCompany(updated);
      setCompanyForm(mapProfileToForm(updated));
      setEditCompanyOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save company");
    } finally {
      setSavingCompany(false);
    }
  };

  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false);
  const [oldPass, setOldPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [changingPass, setChangingPass] = React.useState(false);
  const [changePassMsg, setChangePassMsg] = React.useState<{ type: "success" | "error", text: string } | null>(null);

  const changePassword = async () => {
    setChangingPass(true);
    setChangePassMsg(null);
    try {
      if(!oldPass || newPass.length < 6) {
        setChangePassMsg({ type: "error", text: "Invalid input. New password must be at least 6 chars."});
        return;
      }

      await api("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      });

      setChangePassMsg({ type: "success", text: "Password changed successfully." });
      setOldPass("");
      setNewPass("");
      setTimeout(() => setChangePasswordOpen(false), 1500);
    } catch(e) {
      setChangePassMsg({ type: "error", text: e instanceof Error ? e.message : "Failed to change password"});
    } finally {
      setChangingPass(false);
    }
  };

  const deleteAccount = async () => {
    setDeleteMsg("");

    if (deleteText.trim().toUpperCase() !== "DELETE") {
      setDeleteMsg('Type "DELETE" to confirm.');
      return;
    }

    try {
      setDeleting(true);
      await api<{ message?: string }>("/api/account", { method: "DELETE" });

      window.location.href = "/login";
    } catch (e) {
      setDeleteMsg(e instanceof Error ? e.message : "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div
        className={styles.page}
        style={{ display: "flex", gap: 12, alignItems: "center" }}
      >
        <Spinner />
        <Text>Loading account…</Text>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <Text size={700} weight="semibold">
            My Account
          </Text>
          <Text className={styles.muted} size={300}>
            Account summary, company details, security, and delete account.
          </Text>
        </div>

        <Button appearance="outline" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {!!error && (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Error</MessageBarTitle>
            {error}
          </MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardTitle}>
            <Text size={500} weight="semibold">
              Account Summary
            </Text>
          </div>

          <div className={styles.row} style={{ marginBottom: 12 }}>
            <Avatar name={me?.name ?? "User"} size={48} color="brand" />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 0,
              }}
            >
              <Text
                weight="semibold"
                size={400}
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {me?.name ?? "—"}
              </Text>
              <Text className={styles.muted} size={300}>
                {me?.email ?? "—"}
              </Text>
            </div>
          </div>

          <Divider />

          <div style={{ marginTop: 12 }} className={styles.kv}>
            <div className={styles.k}>Role</div>
            <div className={styles.v}>{me?.role ?? "—"}</div>

            <div className={styles.k}>Email verified</div>
            <div className={styles.v}>{me?.emailVerified ? "Yes" : "No"}</div>

            <div className={styles.k}>Member since</div>
            <div className={styles.v}>{fmtDate(me?.createdAt)}</div>

            <div className={styles.k}>Last login</div>
            <div className={styles.v}>{fmtDate(me?.lastLoginAt)}</div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardTitle}>
            <Text size={500} weight="semibold">
              Company Details
            </Text>

            <Button appearance="outline" onClick={() => setEditCompanyOpen(true)}>
              Edit
            </Button>
          </div>

          <div className={styles.kv}>
            <div className={styles.k}>Company</div>
            <div className={styles.v}>{company?.companyName ?? "—"}</div>

            <div className={styles.k}>Website</div>
            <div className={styles.v}>{company?.website ?? "—"}</div>

            <div className={styles.k}>Industry</div>
            <div className={styles.v}>{company?.industry ?? "—"}</div>

            <div className={styles.k}>Size</div>
            <div className={styles.v}>{company?.companySize ?? "—"}</div>

            <div className={styles.k}>Location</div>
            <div className={styles.v}>{company?.headquarters ?? "—"}</div>

            <div className={styles.k}>Description</div>
            <div className={styles.v} style={{ fontWeight: 500 }}>
              {company?.description ?? "—"}
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardTitle}>
            <Text size={500} weight="semibold">
              Security
            </Text>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              className={styles.row}
              style={{ justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Text weight="semibold">Password</Text>
                <Text className={styles.muted} size={200}>
                  Update your password.
                </Text>
              </div>
              <Button appearance="outline" onClick={() => setChangePasswordOpen(true)}>
                Change password
              </Button>
            </div>

            <Divider />

            <div
              className={styles.row}
              style={{ justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Text weight="semibold">Two-factor authentication</Text>
                <Text className={styles.muted} size={200}>
                  Add an extra layer of protection (optional).
                </Text>
              </div>
              <Button appearance="outline" disabled title="Implement when backend ready">
                Manage 2FA
              </Button>
            </div>

            <Divider />

            <div
              className={styles.row}
              style={{ justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Text weight="semibold">Active sessions</Text>
                <Text className={styles.muted} size={200}>
                  Sign out from other devices (optional).
                </Text>
              </div>
              <Button appearance="outline" disabled title="Implement when backend ready">
                Sign out all
              </Button>
            </div>
          </div>
        </section>

        <section className={`${styles.card} ${styles.dangerCard}`}>
          <div className={styles.cardTitle}>
            <Text size={500} weight="semibold" className={styles.dangerText}>
              Delete Account
            </Text>
          </div>

          <Text size={300} className={styles.muted}>
            This permanently removes your employer account. Jobs and
            applications may be deleted depending on your policy.
          </Text>

          <div style={{ marginTop: 12 }}>
            <Button
              appearance="primary"
              style={{ backgroundColor: "#dc2626", color: "#fff" }}
              onClick={() => setDeleteOpen(true)}
            >
              Delete account
            </Button>
          </div>
        </section>
      </div>

      <Dialog
        open={editCompanyOpen}
        onOpenChange={(_, d) => setEditCompanyOpen(d.open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Edit Company Details</DialogTitle>
            <DialogContent
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 6,
              }}
            >
              <div className={styles.twoCols}>
                <Field label="Company name">
                  <Input
                    value={companyForm.name}
                    onChange={(_, d) =>
                      setCompanyForm((p) => ({ ...p, name: d.value }))
                    }
                  />
                </Field>

                <Field label="Website">
                  <Input
                    value={companyForm.website}
                    onChange={(_, d) =>
                      setCompanyForm((p) => ({ ...p, website: d.value }))
                    }
                    placeholder="https://"
                  />
                </Field>

                <Field label="Industry">
                  <Input
                    value={companyForm.industry}
                    onChange={(_, d) =>
                      setCompanyForm((p) => ({ ...p, industry: d.value }))
                    }
                  />
                </Field>

                <Field label="Company size">
                  <Input
                    value={companyForm.size}
                    onChange={(_, d) =>
                      setCompanyForm((p) => ({ ...p, size: d.value }))
                    }
                    placeholder="1-10 / 11-50 / 51-200..."
                  />
                </Field>

                <Field label="Location">
                  <Input
                    value={companyForm.location}
                    onChange={(_, d) =>
                      setCompanyForm((p) => ({ ...p, location: d.value }))
                    }
                  />
                </Field>
              </div>

              <Field label="Description">
                <Input
                  value={companyForm.description}
                  onChange={(_, d) =>
                    setCompanyForm((p) => ({ ...p, description: d.value }))
                  }
                />
              </Field>
            </DialogContent>

            <DialogActions>
              <Button
                appearance="secondary"
                onClick={() => setEditCompanyOpen(false)}
                disabled={savingCompany}
              >
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={() => void saveCompany()}
                disabled={savingCompany}
              >
                {savingCompany ? "Saving..." : "Save"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={(_, d) => setDeleteOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle style={{ color: "#b91c1c" }}>
              Delete account
            </DialogTitle>
            <DialogContent
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 6,
              }}
            >
              <Text>
                This action is <b>permanent</b>. Type <b>DELETE</b> to confirm.
              </Text>

              {!!deleteMsg && (
                <MessageBar intent="error">
                  <MessageBarBody>{deleteMsg}</MessageBarBody>
                </MessageBar>
              )}

              <Field label='Type "DELETE"'>
                <Input
                  value={deleteText}
                  onChange={(_, d) => setDeleteText(d.value)}
                />
              </Field>
            </DialogContent>

            <DialogActions>
              <Button
                appearance="secondary"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={() => void deleteAccount()}
                disabled={deleting}
                style={{ backgroundColor: "#dc2626", color: "#fff" }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={changePasswordOpen} onOpenChange={(_, d) => setChangePasswordOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
              {changePassMsg && (
                 <MessageBar intent={changePassMsg.type}>
                   <MessageBarBody>{changePassMsg.text}</MessageBarBody>
                 </MessageBar>
              )}
              
              <Field label="Old Password">
                <Input type="password" value={oldPass} onChange={(_, d) => setOldPass(d.value)} />
              </Field>

              <Field label="New Password (min 6 chars)">
                <Input type="password" value={newPass} onChange={(_, d) => setNewPass(d.value)} />
              </Field>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setChangePasswordOpen(false)} disabled={changingPass}>Cancel</Button>
              <Button appearance="primary" onClick={() => void changePassword()} disabled={changingPass}>
                {changingPass ? "Changing..." : "Change Password"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
