import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Input,
  Label,
  Textarea,
  Dropdown,
  Option,
  makeStyles,
  shorthands,
  Spinner,
} from "@fluentui/react-components";
import {
  CloudArrowUp20Regular,
  Link20Regular,
  Save20Regular,
  Eye20Regular,
} from "@fluentui/react-icons";
import { api } from "../../api/http";

type CompanyProfileDto = {
  companyName: string;
  tagline?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  foundedYear?: number;
  headquarters?: string;
  description?: string;
  mission?: string;
  values?: string;
  contactEmail?: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  facebook?: string;
  culture?: string;
  benefits?: string;

  // IMPORTANT:
  // If you store logo in GridFS, set this to something like:
  // /api/company-profile/logo/me
  logoUrl?: string;
};

const COMPANY_PROFILE_API = "/api/company-profile/me";
const COMPANY_LOGO_UPLOAD_API = "/api/company-profile/logo";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.toString().trim() ||
  "http://localhost:5000";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    rowGap: "24px",
    minHeight: "100vh",
    boxSizing: "border-box",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "16px",
    paddingBottom: "24px",
    maxWidth: "2000px",
    margin: "0 auto",
    "@media (max-width: 768px)": {
      paddingLeft: "12px",
      paddingRight: "12px",
      paddingTop: "12px",
      paddingBottom: "16px",
      rowGap: "16px",
    },
  },

  sectionCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    padding: "24px",
    backgroundColor: "#FFFFFF",
  },

  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "16px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    rowGap: "6px",
  },

  fieldLabel: {
    fontSize: "0.85rem",
    color: "#0B1220",
    fontWeight: 500,
  },

  helperText: {
    fontSize: "0.75rem",
    color: "#5B6475",
    marginTop: "4px",
  },

  sectionBody: {
    display: "flex",
    flexDirection: "column",
    rowGap: "16px",
  },

  logoRow: {
    display: "flex",
    columnGap: "16px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  logoDropZone: {
    width: "96px",
    height: "96px",
    ...shorthands.borderRadius("12px"),
    ...shorthands.border("2px", "dashed", "rgba(2,6,23,0.16)"),
    backgroundColor: "#F3F4F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },

  logoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  logoInfo: {
    display: "flex",
    flexDirection: "column",
    rowGap: "8px",
    flex: 1,
  },

  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    columnGap: "16px",
    rowGap: "12px",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },

  websiteWrapper: { position: "relative" },

  websiteIcon: {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#5B6475",
    pointerEvents: "none",
  },

  websiteInput: { paddingLeft: "32px" },

  socialSection: {
    ...shorthands.borderTop("1px", "solid", "rgba(2,6,23,0.08)"),
    paddingTop: "16px",
    marginTop: "8px",
  },

  socialList: {
    display: "flex",
    flexDirection: "column",
    rowGap: "8px",
  },

  textarea: { resize: "vertical" },

  footerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "8px",
    flexWrap: "wrap",
    rowGap: "10px",
  },

  footerRightButtons: { display: "flex", columnGap: "8px" },

  primaryButton: {
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
    ":hover": { backgroundColor: "#1B56FD", color: "#FFFFFF" },
  },

  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: "12px",
    marginBottom: "10px",
    flexWrap: "wrap",
    rowGap: "8px",
  },

  errorText: {
    color: "#B91C1C",
    fontSize: "0.85rem",
  },

  successText: {
    color: "#15803D",
    fontSize: "0.85rem",
  },
});

const emptyProfile: CompanyProfileDto = {
  companyName: "",
  tagline: "",
  website: "",
  industry: "",
  companySize: "",
  foundedYear: undefined,
  headquarters: "",
  description: "",
  mission: "",
  values: "",
  contactEmail: "",
  phone: "",
  linkedin: "",
  twitter: "",
  github: "",
  facebook: "",
  culture: "",
  benefits: "",
  logoUrl: "",
};

// If logoUrl is absolute -> use it.
// If startsWith("/") -> prefix API_BASE.
// BUT for protected logo endpoints, we will NOT use it directly in <img>
// We will fetch it as blob with Authorization and use object URL.
function toAbsoluteUrl(url?: string): string | undefined {
  const v = (url ?? "").trim();
  if (!v) return undefined;
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("/")) return `${API_BASE}${v}`;
  return v;
}

async function fetchLogoBlobUrl(logoUrl: string): Promise<string> {
  const abs = toAbsoluteUrl(logoUrl);
  if (!abs) throw new Error("No logo url");

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    "";

  const res = await fetch(abs, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Logo fetch failed: ${res.status} ${text || ""}`.trim());
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export function CompanyProfile() {
  const styles = useStyles();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<CompanyProfileDto>(emptyProfile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // ✅ This is the key: we store a blob URL for protected images
  const [logoBlobUrl, setLogoBlobUrl] = useState<string | null>(null);

  const isValid = useMemo(
    () => Boolean(form.companyName?.trim()),
    [form.companyName]
  );

  // If you typed an external public image URL, we can show it directly.
  const directLogoUrl = useMemo(() => {
    const v = (form.logoUrl ?? "").trim();
    if (!v) return undefined;
    if (/^https?:\/\//i.test(v)) return v;
    // if it is your API path, we won't use it directly in <img>
    return undefined;
  }, [form.logoUrl]);

  // ✅ When logoUrl is an API route (protected), fetch it as blob with auth
  useEffect(() => {
    let alive = true;

    (async () => {
      // cleanup old blob url
      if (logoBlobUrl) {
        URL.revokeObjectURL(logoBlobUrl);
        setLogoBlobUrl(null);
      }

      const v = (form.logoUrl ?? "").trim();
      if (!v) return;

      // If it's a backend route like "/api/company-profile/logo/me"
      // we must fetch with Authorization and use blob url.
      const isBackendProtected =
        v.startsWith("/api/") || v.startsWith("/company-profile") || v.startsWith("/uploads") || v.startsWith("/");

      // external absolute url -> do nothing (use directLogoUrl)
      if (/^https?:\/\//i.test(v)) return;

      if (!isBackendProtected) return;

      try {
        const blobUrl = await fetchLogoBlobUrl(v);
        if (!alive) {
          URL.revokeObjectURL(blobUrl);
          return;
        }
        setLogoBlobUrl(blobUrl);
      } catch (e) {
        if (!alive) return;
        setLogoBlobUrl(null);
        setError(e instanceof Error ? e.message : "Logo failed to load");
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.logoUrl]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await api<CompanyProfileDto | null>(COMPANY_PROFILE_API);

        if (!alive) return;
        setForm((prev) => ({
          ...prev,
          ...(data ?? {}),
          companyName: (data?.companyName ?? "").toString(),
        }));
      } catch (e) {
        if (!alive) return;
        setError(
          e instanceof Error ? e.message : "Failed to load company profile"
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const onChange = <K extends keyof CompanyProfileDto>(
    key: K,
    value: CompanyProfileDto[K]
  ) => {
    setSavedMsg(null);
    setForm((p) => ({ ...p, [key]: value }));
  };

  const uploadLogo = async (file: File) => {
    setError(null);
    setSavedMsg(null);

    const okTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!okTypes.includes(file.type)) {
      setError("Only PNG/JPG/WEBP allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Max file size is 2MB");
      return;
    }

    try {
      setUploadingLogo(true);
      const fd = new FormData();
      fd.append("logo", file);

      // server should return logoUrl as "/api/company-profile/logo/me"
      // OR "/api/company-profile/logo/<profileId>" etc
      const resp = await api<{ logoUrl: string }>(COMPANY_LOGO_UPLOAD_API, {
        method: "POST",
        body: fd,
      });

      onChange("logoUrl", resp.logoUrl);
      setSavedMsg("Logo uploaded");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const save = async () => {
    setError(null);
    setSavedMsg(null);

    if (!isValid) {
      setError("Company Name is required");
      return;
    }

    try {
      setSaving(true);

      const payload: CompanyProfileDto = {
        ...form,
        companyName: form.companyName.trim(),
        website: form.website?.trim() || undefined,
        contactEmail: form.contactEmail?.trim() || undefined,
        logoUrl: form.logoUrl?.trim() || undefined,
      };

      await api(COMPANY_PROFILE_API, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setSavedMsg("Saved successfully");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to save company profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const openPreview = () => {
    const w = window.open("", "_blank");
    if (!w) return;

    const safe = (s?: string) => (s ?? "").toString();
    // prefer blob url if available, else external direct url
    const logo = logoBlobUrl || directLogoUrl || "";

    w.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Company Profile Preview</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; background: #f7f7fb; }
            .card { background: #fff; border-radius: 14px; padding: 20px; max-width: 900px; margin: 0 auto; box-shadow: 0 8px 24px rgba(15,23,42,0.08); }
            .row { display:flex; gap:16px; align-items:center; }
            .logo { width:80px; height:80px; border-radius:12px; background:#f3f4f6; display:flex; align-items:center; justify-content:center; overflow:hidden; }
            .logo img { width:100%; height:100%; object-fit:cover; }
            h1 { margin:0; font-size: 22px; }
            .muted { color:#6b7280; margin-top: 4px; }
            .sec { margin-top: 16px; padding-top: 16px; border-top:1px solid #e5e7eb; }
            .kv { margin: 6px 0; color:#111827; }
            .k { color:#6b7280; display:inline-block; min-width: 150px; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="row">
              <div class="logo">
                ${
                  logo
                    ? `<img src="${logo}" alt="logo" />`
                    : `<span style="color:#6b7280;">No Logo</span>`
                }
              </div>
              <div>
                <h1>${safe(form.companyName) || "Company"}</h1>
                <div class="muted">${safe(form.tagline)}</div>
                <div class="muted">${safe(form.website)}</div>
              </div>
            </div>

            <div class="sec">
              <div class="kv"><span class="k">Industry:</span> ${safe(form.industry)}</div>
              <div class="kv"><span class="k">Company Size:</span> ${safe(form.companySize)}</div>
              <div class="kv"><span class="k">Founded Year:</span> ${safe(form.foundedYear?.toString())}</div>
              <div class="kv"><span class="k">Headquarters:</span> ${safe(form.headquarters)}</div>
            </div>

            <div class="sec">
              <h3>About</h3>
              <pre>${safe(form.description)}</pre>
            </div>

            <div class="sec">
              <h3>Mission</h3>
              <pre>${safe(form.mission)}</pre>
              <h3>Values</h3>
              <pre>${safe(form.values)}</pre>
            </div>

            <div class="sec">
              <h3>Culture & Benefits</h3>
              <pre>${safe(form.culture)}</pre>
              <pre>${safe(form.benefits)}</pre>
            </div>

            <div class="sec">
              <h3>Contact</h3>
              <div class="kv"><span class="k">Email:</span> ${safe(form.contactEmail)}</div>
              <div class="kv"><span class="k">Phone:</span> ${safe(form.phone)}</div>
              <div class="kv"><span class="k">LinkedIn:</span> ${safe(form.linkedin)}</div>
              <div class="kv"><span class="k">GitHub:</span> ${safe(form.github)}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    w.document.close();
  };

  // ✅ choose what to show in <img>
  const logoToShow = logoBlobUrl || directLogoUrl;

  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <div>
          {loading ? null : error ? (
            <div className={styles.errorText}>{error}</div>
          ) : savedMsg ? (
            <div className={styles.successText}>{savedMsg}</div>
          ) : null}
        </div>
        {loading ? <Spinner size="small" /> : null}
      </div>

      <Card className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Company Information</h3>

        <div className={styles.sectionBody}>
          <div className={styles.fieldGroup}>
            <Label className={styles.fieldLabel}>Company Logo</Label>
            <div className={styles.logoRow}>
              <div className={styles.logoDropZone}>
                {logoToShow ? (
                  <img
                    src={logoToShow}
                    alt="Company logo"
                    className={styles.logoImg}
                    onError={() => {
                      // don't clear logoUrl here (it might be correct but token/session issue)
                      setError("Logo failed to load");
                    }}
                  />
                ) : (
                  <CloudArrowUp20Regular
                    style={{ fontSize: 22, color: "#5B6475" }}
                  />
                )}
              </div>

              <div className={styles.logoInfo}>
                <div
                  style={{
                    display: "flex",
                    columnGap: "8px",
                    flexWrap: "wrap",
                    rowGap: "8px",
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadLogo(f);
                      e.currentTarget.value = "";
                    }}
                  />

                  <Button
                    appearance="outline"
                    size="small"
                    icon={<CloudArrowUp20Regular />}
                    disabled={uploadingLogo || loading}
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploadingLogo ? "Uploading..." : "Upload Logo"}
                  </Button>

                  <Input
                    placeholder="Logo URL (external https://...)"
                    value={form.logoUrl ?? ""}
                    onChange={(_, d) => onChange("logoUrl", d.value)}
                  />
                </div>

                <span className={styles.helperText}>
                  Recommended size: 200x200px. Max file size: 2MB. Supports JPG,
                  PNG, WEBP.
                </span>
              </div>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="company-name" className={styles.fieldLabel}>
              Company Name *
            </Label>
            <Input
              id="company-name"
              placeholder="e.g. Acme Corporation"
              value={form.companyName}
              onChange={(_, d) => onChange("companyName", d.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="tagline" className={styles.fieldLabel}>
              Tagline
            </Label>
            <Input
              id="tagline"
              placeholder="e.g. Building the future of technology"
              value={form.tagline ?? ""}
              onChange={(_, d) => onChange("tagline", d.value)}
            />
          </div>

          <div className={styles.twoColumnGrid}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="company-size" className={styles.fieldLabel}>
                Company Size
              </Label>
              <Dropdown
                id="company-size"
                value={form.companySize ?? ""}
                placeholder="Select size"
                onOptionSelect={(_, d) =>
                  onChange("companySize", String(d.optionValue ?? ""))
                }
              >
                <Option value="1-10 employees">1-10 employees</Option>
                <Option value="11-50 employees">11-50 employees</Option>
                <Option value="51-200 employees">51-200 employees</Option>
                <Option value="201-500 employees">201-500 employees</Option>
                <Option value="501-1000 employees">501-1000 employees</Option>
                <Option value="1000+ employees">1000+ employees</Option>
              </Dropdown>
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="industry" className={styles.fieldLabel}>
                Industry
              </Label>
              <Dropdown
                id="industry"
                value={form.industry ?? ""}
                placeholder="Select industry"
                onOptionSelect={(_, d) =>
                  onChange("industry", String(d.optionValue ?? ""))
                }
              >
                <Option value="Technology">Technology</Option>
                <Option value="Finance">Finance</Option>
                <Option value="Healthcare">Healthcare</Option>
                <Option value="Education">Education</Option>
                <Option value="Retail">Retail</Option>
                <Option value="Manufacturing">Manufacturing</Option>
                <Option value="Other">Other</Option>
              </Dropdown>
            </div>
          </div>

          <div className={styles.twoColumnGrid}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="founded" className={styles.fieldLabel}>
                Founded Year
              </Label>
              <Input
                id="founded"
                type="number"
                placeholder="e.g. 2015"
                value={form.foundedYear?.toString() ?? ""}
                onChange={(_, d) =>
                  onChange("foundedYear", d.value ? Number(d.value) : undefined)
                }
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="headquarters" className={styles.fieldLabel}>
                Headquarters
              </Label>
              <Input
                id="headquarters"
                placeholder="e.g. San Francisco, CA"
                value={form.headquarters ?? ""}
                onChange={(_, d) => onChange("headquarters", d.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>About Company</h3>

        <div className={styles.sectionBody}>
          <div className={styles.fieldGroup}>
            <Label htmlFor="about" className={styles.fieldLabel}>
              Company Description
            </Label>
            <Textarea
              id="about"
              placeholder="Tell candidates about your company, mission, values, and culture..."
              rows={8}
              className={styles.textarea}
              value={form.description ?? ""}
              onChange={(_, d) => onChange("description", d.value)}
            />
            <span className={styles.helperText}>
              This will be displayed on your company profile and job postings.
            </span>
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="mission" className={styles.fieldLabel}>
              Mission Statement
            </Label>
            <Textarea
              id="mission"
              placeholder="What drives your company?"
              rows={3}
              className={styles.textarea}
              value={form.mission ?? ""}
              onChange={(_, d) => onChange("mission", d.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="values" className={styles.fieldLabel}>
              Company Values
            </Label>
            <Textarea
              id="values"
              placeholder="What are your core values?"
              rows={3}
              className={styles.textarea}
              value={form.values ?? ""}
              onChange={(_, d) => onChange("values", d.value)}
            />
          </div>
        </div>
      </Card>

      <Card className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Contact & Social Media</h3>

        <div className={styles.sectionBody}>
          <div className={styles.fieldGroup}>
            <Label htmlFor="website" className={styles.fieldLabel}>
              Website
            </Label>
            <div className={styles.websiteWrapper}>
              <span className={styles.websiteIcon}>
                <Link20Regular />
              </span>
              <Input
                id="website"
                type="url"
                placeholder="https://www.example.com"
                value={form.website ?? ""}
                onChange={(_, d) => onChange("website", d.value)}
                className={styles.websiteInput}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="email" className={styles.fieldLabel}>
              Contact Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@company.com"
              value={form.contactEmail ?? ""}
              onChange={(_, d) => onChange("contactEmail", d.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="phone" className={styles.fieldLabel}>
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={form.phone ?? ""}
              onChange={(_, d) => onChange("phone", d.value)}
            />
          </div>

          <div className={styles.socialSection}>
            <Label className={styles.fieldLabel}>Social Media Links</Label>
            <div className={styles.socialList}>
              <Input
                placeholder="LinkedIn URL"
                value={form.linkedin ?? ""}
                onChange={(_, d) => onChange("linkedin", d.value)}
              />
              <Input
                placeholder="Twitter URL"
                value={form.twitter ?? ""}
                onChange={(_, d) => onChange("twitter", d.value)}
              />
              <Input
                placeholder="GitHub URL"
                value={form.github ?? ""}
                onChange={(_, d) => onChange("github", d.value)}
              />
              <Input
                placeholder="Facebook URL"
                value={form.facebook ?? ""}
                onChange={(_, d) => onChange("facebook", d.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Culture & Benefits</h3>

        <div className={styles.sectionBody}>
          <div className={styles.fieldGroup}>
            <Label htmlFor="culture" className={styles.fieldLabel}>
              Company Culture
            </Label>
            <Textarea
              id="culture"
              placeholder="Describe your work environment and culture..."
              rows={4}
              className={styles.textarea}
              value={form.culture ?? ""}
              onChange={(_, d) => onChange("culture", d.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="benefits" className={styles.fieldLabel}>
              Employee Benefits & Perks
            </Label>
            <Textarea
              id="benefits"
              placeholder="List benefits like health insurance, remote work, learning budget, etc."
              rows={6}
              className={styles.textarea}
              value={form.benefits ?? ""}
              onChange={(_, d) => onChange("benefits", d.value)}
            />
          </div>
        </div>
      </Card>

      <div className={styles.footerRow}>
        <Button
          appearance="outline"
          disabled={loading}
          icon={<Eye20Regular />}
          onClick={openPreview}
        >
          Preview Profile
        </Button>

        <div className={styles.footerRightButtons}>
          <Button
            appearance="outline"
            onClick={() => window.location.reload()}
            disabled={saving || uploadingLogo}
          >
            Cancel
          </Button>

          <Button
            appearance="primary"
            className={styles.primaryButton}
            icon={<Save20Regular />}
            onClick={save}
            disabled={saving || uploadingLogo || loading || !isValid}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
