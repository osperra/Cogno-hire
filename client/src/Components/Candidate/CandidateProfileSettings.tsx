import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Divider,
  Dropdown,
  Input,
  Label,
  Option,
  Spinner,
  Text,
  Textarea,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import {
  LinkRegular,
  PersonRegular,
  DocumentRegular,
  ArrowUploadRegular,
  DeleteRegular,
  OpenRegular,
  GlobeRegular,
  CodeRegular,
  LocationRegular,
  CallRegular,
} from "@fluentui/react-icons";
import { api } from "../../api/http";

type ExperienceLevel = "Fresher" | "Junior" | "Mid" | "Senior" | "Lead";

type CandidateProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  about?: string;
  experienceLevel?: ExperienceLevel;
  skills?: string[];
  linkedin?: string;
  github?: string;
  portfolio?: string;
  resumeUrl?: string;
  resumeDocId?: string;
  resumeFileName?: string;
  resumePublicId?: string;
  resumeFormat?: string;
  resumeResourceType?: "raw" | "image" | "video";
  resumeDeliveryType?: "upload" | "authenticated" | "private";
};

type CandidateProfileApi = Partial<Omit<CandidateProfile, "id">> & {
  id?: string;
  _id?: string;
};

type UpdateCandidateProfilePayload = Partial<Omit<CandidateProfile, "id" | "email">> & {
  skills?: string[];
};

type UploadResumeResponse = {
  resumeUrl: string;
  resumeDocId: string;
  resumeFileName?: string;

  resumePublicId?: string;
  resumeFormat?: string;
  resumeResourceType?: "raw" | "image" | "video";
  resumeDeliveryType?: "upload" | "authenticated" | "private";
};

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

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "14px",
    "@media (min-width: 980px)": {
      gridTemplateColumns: "1fr 1fr",
      alignItems: "start",
    },
  },
  full: { gridColumn: "1 / -1" },

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

  inputWithIcon: {
    display: "grid",
    gridTemplateColumns: "36px 1fr",
    gap: "10px",
    alignItems: "center",
  },
  smallIcon: { color: "#64748B" },

  primaryButton: {
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
    ":hover": { backgroundColor: "#1B56FD", color: "#FFFFFF" },
  },
  dangerButton: {
    backgroundColor: tokens.colorPaletteRedBackground3,
    color: tokens.colorPaletteRedForeground1,
    ":hover": { backgroundColor: tokens.colorPaletteRedBackground2 },
  },

  skillsTopRow: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
    "@media (min-width: 640px)": { gridTemplateColumns: "1fr 220px" },
    alignItems: "end",
  },
  hint: { fontSize: "12px", color: "#5B6475" },
  chips: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" },
  chip: {
    ...shorthands.borderRadius("999px"),
    ...shorthands.padding("6px", "10px"),
    backgroundColor: "#EEF2FF",
    color: "#0B1220",
    fontSize: "12px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },
  chipX: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    lineHeight: 1,
    color: "#334155",
  },

  resumeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  resumeMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: "260px",
  },
  resumeName: { fontWeight: 900, color: "#0B1220" },

  resumeDebug: {
    marginTop: "10px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
  },
  debugPill: {
    fontSize: "12px",
    ...shorthands.padding("4px", "10px"),
    ...shorthands.borderRadius("999px"),
    backgroundColor: "rgba(2,6,23,0.04)",
    color: "#334155",
    border: "1px solid rgba(2,6,23,0.08)",
  },
});

function parseSkills(text: string) {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
}

function isResumeAllowed(file: File) {
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  return ["pdf", "doc", "docx"].includes(ext);
}

function inferResumeMetaFromUrl(url?: string) {
  if (!url) return {};
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);

    const resourceType = parts.find((p) => ["raw", "image", "video"].includes(p)) as
      | "raw"
      | "image"
      | "video"
      | undefined;

    const rtIndex = resourceType ? parts.findIndex((p) => p === resourceType) : -1;
    const deliveryType =
      rtIndex >= 0
        ? (parts[rtIndex + 1] as "upload" | "authenticated" | "private" | undefined)
        : undefined;

    const last = parts[parts.length - 1] || "";
    const dot = last.lastIndexOf(".");
    const format = dot > 0 ? last.slice(dot + 1).toLowerCase() : undefined;

    return { resumeFormat: format, resumeResourceType: resourceType, resumeDeliveryType: deliveryType };
  } catch {
    return {};
  }
}

function normalizeCandidateProfile(r: CandidateProfileApi): CandidateProfile {
  const url = r.resumeUrl ? String(r.resumeUrl) : undefined;
  const inferred = inferResumeMetaFromUrl(url);

  return {
    id: String(r.id ?? r._id ?? ""),
    name: String(r.name ?? ""),
    email: String(r.email ?? ""),
    phone: r.phone ? String(r.phone) : undefined,
    location: r.location ? String(r.location) : undefined,
    headline: r.headline ? String(r.headline) : undefined,
    about: r.about ? String(r.about) : undefined,
    experienceLevel: r.experienceLevel,
    skills: Array.isArray(r.skills) ? r.skills.map(String) : undefined,
    linkedin: r.linkedin ? String(r.linkedin) : undefined,
    github: r.github ? String(r.github) : undefined,
    portfolio: r.portfolio ? String(r.portfolio) : undefined,

    resumeUrl: url,
    resumeDocId: r.resumeDocId ? String(r.resumeDocId) : undefined,
    resumeFileName: r.resumeFileName ? String(r.resumeFileName) : undefined,

    resumePublicId: r.resumePublicId ? String(r.resumePublicId) : undefined,
    resumeFormat: r.resumeFormat ? String(r.resumeFormat) : inferred.resumeFormat,
    resumeResourceType: r.resumeResourceType ?? inferred.resumeResourceType,
    resumeDeliveryType: r.resumeDeliveryType ?? inferred.resumeDeliveryType,
  };
}

export default function CandidateProfileSettings() {
  const styles = useStyles();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [skillsInput, setSkillsInput] = useState("");

  const experienceOptions = useMemo(
    () => ["Fresher", "Junior", "Mid", "Senior", "Lead"] as const,
    []
  );

  const load = async () => {
    setError("");
    setOk("");
    setLoading(true);
    try {
      const me = await api<CandidateProfileApi>("/api/candidates/me");
      const normalized = normalizeCandidateProfile(me);
      setProfile(normalized);
      setSkillsInput((normalized.skills ?? []).join(", "));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateField = <K extends keyof CandidateProfile>(k: K, v: CandidateProfile[K]) => {
    setProfile((p) => (p ? { ...p, [k]: v } : p));
  };

  const removeSkill = (skill: string) => {
    const next = parseSkills(skillsInput).filter(
      (s) => s.toLowerCase() !== skill.toLowerCase()
    );
    setSkillsInput(next.join(", "));
  };

  const save = async () => {
    if (!profile) return;
    setError("");
    setOk("");
    setSaving(true);
    try {
      const payload: UpdateCandidateProfilePayload = {
        name: profile.name,
        phone: profile.phone?.trim() || undefined,
        location: profile.location?.trim() || undefined,
        headline: profile.headline?.trim() || undefined,
        about: profile.about?.trim() || undefined,
        experienceLevel: profile.experienceLevel,
        linkedin: profile.linkedin?.trim() || undefined,
        github: profile.github?.trim() || undefined,
        portfolio: profile.portfolio?.trim() || undefined,
        skills: parseSkills(skillsInput),
      };

      const updatedRaw = await api<CandidateProfileApi>("/api/candidates/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const updated = normalizeCandidateProfile(updatedRaw);
      setProfile(updated);
      setSkillsInput((updated.skills ?? []).join(", "));
      setOk("Profile updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = async (file: File) => {
    if (!profile) return;
    setError("");
    setOk("");

    if (!isResumeAllowed(file)) {
      setError("Only PDF/DOC/DOCX supported.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await api<UploadResumeResponse>("/api/candidates/me/resume", {
        method: "POST",
        body: fd,
      });

      setProfile((p) => {
        if (!p) return p;
        const inferred = inferResumeMetaFromUrl(res.resumeUrl);

        return {
          ...p,
          resumeUrl: res.resumeUrl,
          resumeDocId: res.resumeDocId,
          resumeFileName: res.resumeFileName ?? file.name,

          resumePublicId: res.resumePublicId ?? p.resumePublicId,
          resumeFormat: res.resumeFormat ?? inferred.resumeFormat,
          resumeResourceType: res.resumeResourceType ?? inferred.resumeResourceType,
          resumeDeliveryType: res.resumeDeliveryType ?? inferred.resumeDeliveryType,
        };
      });

      setOk("Resume uploaded.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Resume upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeResume = async () => {
    setError("");
    setOk("");
    setSaving(true);
    try {
      await api("/api/candidates/me/resume", { method: "DELETE" });
      setProfile((p) =>
        p
          ? {
              ...p,
              resumeUrl: "",
              resumeDocId: "",
              resumeFileName: "",
              resumePublicId: "",
              resumeFormat: "",
              resumeResourceType: undefined,
              resumeDeliveryType: undefined,
            }
          : p
      );
      setOk("Resume removed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove resume");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.root}>
      <input
        ref={fileRef}
        type="file"
        style={{ display: "none" }}
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          void uploadResume(f);
          e.currentTarget.value = "";
        }}
      />

      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <div className={styles.title}>Profile Settings</div>
            <Badge appearance="tint" color="brand">
              Candidate
            </Badge>
          </div>
          <div className={styles.sub}>Manage your candidate profile and resume.</div>
          {error ? <div className={styles.msgError}>{error}</div> : null}
          {ok ? <div className={styles.msgOk}>{ok}</div> : null}
        </div>

        <div className={styles.actions}>
          <Button appearance="outline" onClick={() => void load()} disabled={loading || saving || uploading}>
            Refresh
          </Button>
          <Button appearance="primary" className={styles.primaryButton} onClick={() => void save()} disabled={loading || saving || uploading || !profile}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className={styles.card}>
          <Spinner size="medium" />
        </Card>
      ) : !profile ? (
        <Card className={styles.card}>
          <Text style={{ color: tokens.colorPaletteRedForeground1 }}>Unable to load profile.</Text>
        </Card>
      ) : (
        <div className={styles.grid}>
          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTitle}>
                <span className={styles.iconPill}><PersonRegular /></span>
                <div>
                  <Text className={styles.sectionTitle}>Basic Information</Text>
                  <div className={styles.sectionSub}>Name, location, and summary recruiters see.</div>
                </div>
              </div>
              <Badge appearance="tint" color="informative">Public</Badge>
            </div>

            <Divider style={{ margin: "12px 0" }} />

            <div className={styles.form2}>
              <div className={styles.field}>
                <Label>Name</Label>
                <Input value={profile.name} onChange={(_, d) => updateField("name", d.value)} />
              </div>

              <div className={styles.field}>
                <Label>Email</Label>
                <Input value={profile.email} readOnly />
              </div>

              <div className={styles.field}>
                <Label>Phone</Label>
                <div className={styles.inputWithIcon}>
                  <span className={styles.smallIcon}><CallRegular /></span>
                  <Input value={profile.phone ?? ""} onChange={(_, d) => updateField("phone", d.value)} />
                </div>
              </div>

              <div className={styles.field}>
                <Label>Location</Label>
                <div className={styles.inputWithIcon}>
                  <span className={styles.smallIcon}><LocationRegular /></span>
                  <Input value={profile.location ?? ""} onChange={(_, d) => updateField("location", d.value)} />
                </div>
              </div>
            </div>

            <div className={styles.field} style={{ marginTop: "10px" }}>
              <Label>Headline</Label>
              <Input value={profile.headline ?? ""} onChange={(_, d) => updateField("headline", d.value)} placeholder="e.g. Fullstack Developer | React | Node" />
            </div>

            <div className={styles.field} style={{ marginTop: "10px" }}>
              <Label>About</Label>
              <Textarea value={profile.about ?? ""} onChange={(_, d) => updateField("about", d.value)} rows={6} placeholder="Write 2–3 lines about your work and impact..." />
            </div>

            <div className={styles.field} style={{ marginTop: "10px" }}>
              <Label>Experience Level</Label>
              <Dropdown
                selectedOptions={profile.experienceLevel ? [profile.experienceLevel] : []}
                value={profile.experienceLevel ?? ""}
                onOptionSelect={(_, d) => updateField("experienceLevel", d.optionValue as ExperienceLevel)}
                placeholder="Select"
              >
                {experienceOptions.map((x) => (
                  <Option key={x} value={x}>{x}</Option>
                ))}
              </Dropdown>
            </div>
          </Card>

          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTitle}>
                <span className={styles.iconPill}><LinkRegular /></span>
                <div>
                  <Text className={styles.sectionTitle}>Links & Skills</Text>
                  <div className={styles.sectionSub}>Add profiles and skills for better matches.</div>
                </div>
              </div>
              <Badge appearance="tint" color="informative">Visible to employers</Badge>
            </div>

            <Divider style={{ margin: "12px 0" }} />

            <div className={styles.field}>
              <Text style={{ fontWeight: 900, color: "#0B1220" }}>Links</Text>
              <Text className={styles.hint}>Optional, but improves trust.</Text>

              <div className={styles.form2} style={{ marginTop: "8px" }}>
                <div className={styles.field}>
                  <Label>LinkedIn</Label>
                  <div className={styles.inputWithIcon}>
                    <span className={styles.smallIcon}><GlobeRegular /></span>
                    <Input value={profile.linkedin ?? ""} onChange={(_, d) => updateField("linkedin", d.value)} placeholder="https://linkedin.com/in/..." />
                  </div>
                </div>

                <div className={styles.field}>
                  <Label>GitHub</Label>
                  <div className={styles.inputWithIcon}>
                    <span className={styles.smallIcon}><CodeRegular /></span>
                    <Input value={profile.github ?? ""} onChange={(_, d) => updateField("github", d.value)} placeholder="https://github.com/..." />
                  </div>
                </div>

                <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                  <Label>Portfolio</Label>
                  <div className={styles.inputWithIcon}>
                    <span className={styles.smallIcon}><GlobeRegular /></span>
                    <Input value={profile.portfolio ?? ""} onChange={(_, d) => updateField("portfolio", d.value)} placeholder="https://your-site.com" />
                  </div>
                </div>
              </div>
            </div>

            <Divider style={{ margin: "14px 0" }} />

            <div className={styles.field}>
              <Text style={{ fontWeight: 900, color: "#0B1220" }}>Skills</Text>
              <Text className={styles.hint}>Comma separated. Click × on a chip to remove.</Text>

              <div className={styles.skillsTopRow} style={{ marginTop: "8px" }}>
                <div className={styles.field}>
                  <Label>Skills</Label>
                  <Input value={skillsInput} onChange={(_, d) => setSkillsInput(d.value)} placeholder="React, TypeScript, Node.js, MongoDB" />
                </div>

                <div className={styles.field}>
                  <Label>Recommendation</Label>
                  <Text className={styles.hint}>
                    Aim for <b>8–12</b> relevant skills.
                  </Text>
                </div>
              </div>

              <div className={styles.chips}>
                {parseSkills(skillsInput).length === 0 ? (
                  <Text className={styles.hint}>Add skills to show chips here.</Text>
                ) : (
                  parseSkills(skillsInput).map((s) => (
                    <span key={s} className={styles.chip}>
                      {s}
                      <button className={styles.chipX} type="button" onClick={() => removeSkill(s)} aria-label={`Remove ${s}`}>
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </Card>

          <Card className={`${styles.card} ${styles.full}`}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTitle}>
                <span className={styles.iconPill}><DocumentRegular /></span>
                <div>
                  <Text className={styles.sectionTitle}>Resume</Text>
                  <div className={styles.sectionSub}>Upload PDF/DOC/DOCX to improve visibility.</div>
                </div>
              </div>
              {profile.resumeUrl ? (
                <Badge appearance="filled" color="success">Uploaded</Badge>
              ) : (
                <Badge appearance="tint" color="warning">Missing</Badge>
              )}
            </div>

            <Divider style={{ margin: "12px 0" }} />

            <div className={styles.resumeRow}>
              <div className={styles.resumeMeta}>
                <div className={styles.resumeName}>
                  {profile.resumeFileName || (profile.resumeUrl ? "Resume uploaded" : "No resume uploaded")}
                </div>
                <div className={styles.sectionSub}>Supported: PDF, DOC, DOCX • Max size depends on server config</div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <Button
                  appearance="primary"
                  className={styles.primaryButton}
                  icon={<ArrowUploadRegular />}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || saving}
                >
                  {uploading ? "Uploading..." : profile.resumeUrl ? "Replace" : "Upload"}
                </Button>

                <Button
                  appearance="outline"
                  icon={<OpenRegular />}
                  onClick={() => {
                    if (profile.resumeUrl) window.open(profile.resumeUrl, "_blank", "noopener,noreferrer");
                  }}
                  disabled={!profile.resumeUrl}
                >
                  View
                </Button>

                <Button
                  appearance="secondary"
                  className={styles.dangerButton}
                  icon={<DeleteRegular />}
                  onClick={() => void removeResume()}
                  disabled={!profile.resumeDocId || uploading || saving}
                >
                  Remove
                </Button>

                {uploading ? <Spinner size="small" /> : null}
              </div>
            </div>

            {profile.resumeUrl ? (
              <div className={styles.resumeDebug}>
                <span className={styles.debugPill}>publicId: {profile.resumePublicId || "—"}</span>
                <span className={styles.debugPill}>format: {profile.resumeFormat || "—"}</span>
                <span className={styles.debugPill}>resource: {profile.resumeResourceType || "—"}</span>
                <span className={styles.debugPill}>delivery: {profile.resumeDeliveryType || "—"}</span>
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </div>
  );
}
