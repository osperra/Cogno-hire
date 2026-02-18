import * as React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/http";
import {
  Button,
  Card,
  Input,
  Label,
  Textarea,
  Dropdown,
  Option,
  Badge,
  ProgressBar,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import {
  Sparkle24Regular,
  WandRegular,
  Copy20Regular,
  ArrowDownload20Regular,
  Send20Regular,
  CheckmarkCircle20Regular,
} from "@fluentui/react-icons";

const LinkedInIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="18"
    height="18"
    aria-hidden="true"
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const IndeedIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="20"
    height="20"
    aria-hidden="true"
  >
    <path d="M12.91 1.95v12.16s2.57-2.93 6.64-1.28c0 0-2.38.35-3.66 2.05 0 0 5.4 0 7.42 4.67 0 0-3.3 0-5.32-2.19v4.5s-2.58 1.29-6.91 0c0 0-4.63-.94-4-5.59 0 0-.25-5.36 5.83-14.32zM8.3 12.04c.78 0 1.42-.64 1.42-1.42 0-.78-.64-1.42-1.42-1.42-.78 0-1.42.64-1.42 1.42 0 .78.64 1.42 1.42 1.42z" />
  </svg>
);

const GlassdoorIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="18"
    height="18"
    aria-hidden="true"
  >
    <path d="M21 3H3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-6 13h-4v-8h4v2H13v4h2v2z" />
  </svg>
);

const EXPERIENCE_OPTIONS = [
  { value: "junior", label: "Junior (0-2 years)" },
  { value: "mid", label: "Mid-level (3-5 years)" },
  { value: "senior", label: "Senior (5-7 years)" },
  { value: "lead", label: "Lead (7+ years)" },
];

const EMPLOYMENT_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    rowGap: "24px",
    padding: "24px",
    boxSizing: "border-box",
    maxWidth: "1200px",
    margin: "0 auto",
    "@media (max-width: 768px)": {
      padding: "16px",
    },
  },

  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: "16px",
    rowGap: "8px",
    flexWrap: "wrap",
  },

  headerTitleBlock: {
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
    marginBottom: "2px",
  },

  headerTitle: {
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#0B1220",
  },

  headerSubtitle: {
    fontSize: "0.9rem",
    color: "#5B6475",
  },

  poweredBadge: {
    border: "none",
    backgroundImage: "linear-gradient(to right,#a855f7,#3b82f6)",
    color: "#ffffff",
    fontSize: "0.75rem",
    display: "inline-flex",
    alignItems: "center",
    columnGap: "4px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "1fr 1fr",
      columnGap: "24px",
    },
  },

  leftCard: {
    alignSelf: "start",
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    padding: "18px 20px 20px",
  },

  rightCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    padding: "18px 20px 20px",
    display: "flex",
    flexDirection: "column",
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
    rowGap: "4px",
  },

  fieldLabel: {
    marginBottom: "2px",
  },

  twoColRow: {
    display: "grid",
    gridTemplateColumns: "1fr",
    columnGap: "12px",
    rowGap: "12px",
    "@media (min-width: 640px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },

  textarea: {
    minHeight: "96px",
  },

  generateButton: {
    width: "100%",
    marginTop: "4px",
    backgroundImage: "linear-gradient(to right,#0118D8,#1B56FD)",
    color: "#ffffff",
    border: "none",
    ":hover": {
      backgroundImage: "linear-gradient(to right,#1B56FD,#0118D8)",
      color: "#ffffff",
    },
  },

  spinner: {
    width: "16px",
    height: "16px",
    borderRadius: "999px",
    border: "4px solid #ffffff",
    animationName: {
      from: { transform: "rotate(0deg)" },
      to: { transform: "rotate(360deg)" },
    },
    animationDuration: "0.7s",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
    marginRight: "8px",
  },

  progressWrapper: {
    marginTop: "8px",
  },

  progressHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
    fontSize: "0.85rem",
  },

  progressLabel: {
    color: "#5B6475",
  },

  progressValue: {
    color: "#0118D8",
    fontWeight: 500,
  },

  progressBar: {
    height: "8px",
  },

  rightHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: "12px",
    marginBottom: "16px",
  },

  copyActionsRow: {
    display: "flex",
    columnGap: "8px",
  },

  actionBtn: {
    transitionProperty: "transform, box-shadow",
    transitionDuration: "160ms",
    transitionTimingFunction: "ease",
    ":hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 8px 18px rgba(2,6,23,0.12)",
    },
  },

  generatedTextContainer: {
    display: "flex",
    flexDirection: "column",
    rowGap: "16px",
    flex: 1,
  },

  generatedPre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    fontFamily: tokens.fontFamilyBase,
    fontSize: "0.9rem",
    color: "#0B1220",
    lineHeight: 1.5,
  },

  postSection: {
    borderTop: "1px solid rgba(2,6,23,0.08)",
    paddingTop: "16px",
    marginTop: "8px",
  },

  postTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "12px",
  },

  postGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    rowGap: "10px",
  },

  postButton: {
    justifyContent: "flex-start",
    height: "auto",
    paddingTop: "10px",
    paddingBottom: "10px",
  },

  postLogoBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "12px",
    flexShrink: 0,
  },

  postTextBlock: {
    textAlign: "left" as const,
    flex: 1,
  },

  postMain: {
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#0B1220",
    marginBottom: "2px",
  },

  postSub: {
    fontSize: "0.8rem",
    color: "#5B6475",
  },

  emptyState: {
    flex: 1,
    minHeight: "260px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px dashed rgba(2,6,23,0.08)",
    borderRadius: "12px",
  },
  emptyInner: {
    textAlign: "center" as const,
    maxWidth: "280px",
  },
  emptyIcon: {
    width: "48px",
    height: "48px",
    margin: "0 auto 12px",
    color: "#5B6475",
  },
  emptyText: {
    fontSize: "0.9rem",
    color: "#5B6475",
  },
});

type JDResponse = { text: string };
type ApiError = { message?: string };

export const AIJobDescriptionGenerator: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = React.useState("Senior Frontend Developer");
  const [experienceLevel, setExperienceLevel] =
    React.useState<string>("senior");
  const [employmentType, setEmploymentType] =
    React.useState<string>("full-time");
  const [keySkills, setKeySkills] = React.useState(
    "React, TypeScript, JavaScript, CSS, HTML",
  );
  const [location, setLocation] = React.useState("");
  const [salaryRange, setSalaryRange] = React.useState("");
  const [additionalRequirements, setAdditionalRequirements] =
    React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [generationProgress, setGenerationProgress] = React.useState(0);
  const [generatedJD, setGeneratedJD] = React.useState("");
  const [error, setError] = React.useState<string>("");
  const [publishError, setPublishError] = React.useState<string>("");
  const canGenerate =
    jobTitle.trim() &&
    experienceLevel.trim() &&
    employmentType.trim() &&
    keySkills.trim();
  const handleGenerate = async () => {
    if (isGenerating) return;
    setError("");
    setGeneratedJD("");
    setIsGenerating(true);
    setGenerationProgress(10);

    const timer = window.setInterval(() => {
      setGenerationProgress((p) => (p >= 90 ? p : p + 10));
    }, 250);

    try {
      const res = await fetch("/api/ai/job-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          jobTitle,
          experienceLevel,
          employmentType,
          keySkills,
          location,
          salaryRange,
          additionalRequirements,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as ApiError;
        throw new Error(data?.message || `Request failed (${res.status})`);
      }

      const data = (await res.json()) as JDResponse;
      setGeneratedJD(data.text || "");
      setGenerationProgress(100);
    } catch (e) {
      setError(
        (e instanceof Error ? e.message : String(e)) ||
          "Failed to generate job description",
      );
      setGenerationProgress(0);
    } finally {
      if (timer) window.clearInterval(timer);
      setIsGenerating(false);
    }
  };

  const parseSalaryRange = (input: string): { start?: number; end?: number } => {
    const raw = input.trim();
    if (!raw) return {};
    const cleaned = raw.replace(/[₹$,]/g, "").replace(/[–—]/g, "-").toLowerCase();
    const parts = cleaned
      .split(/-|to/)
      .map((x) => x.trim())
      .filter(Boolean);

    const start = parts[0] ? Number(parts[0]) : undefined;
    const end = parts[1] ? Number(parts[1]) : undefined;

    return {
      start: Number.isFinite(start as number) ? (start as number) : undefined,
      end: Number.isFinite(end as number) ? (end as number) : undefined,
    };
  };

  const handlePublish = async () => {
    if (!generatedJD || isPublishing) return;
    setPublishError("");
    setIsPublishing(true);

    try {
      const salaryRangeParsed = parseSalaryRange(salaryRange);
      const expMap: Record<string, number> = {
        junior: 1,
        mid: 3,
        senior: 5,
        lead: 7,
      };

      const payload = {
        title: jobTitle.trim(),
        description: generatedJD.trim(),
        about: `<p>${generatedJD.trim().replace(/\n\n/g, "</p><p>")}</p>`,
        location: location.trim() || "Remote",
        workType: "remote",
        jobType: employmentType,
        salaryRange: salaryRangeParsed.start
          ? { start: salaryRangeParsed.start, end: salaryRangeParsed.end }
          : undefined,
        isActive: true,
        workExperience: expMap[experienceLevel] || 3,
        techStack: keySkills.split(",").map((s) => s.trim()),
        status: "open",
        interviewSettings: {
          maxCandidates: 10,
          interviewDuration: 15,
          difficultyLevel: "medium",
          language: "english",
        },
      };

      const res = await api<{ _id: string }>("/api/jobs", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res?._id) {
        navigate(`/app/employer/jobs/${res._id}`);
      } else {
        navigate("/app/employer/jobs");
      }
    } catch (e) {
      setPublishError(
        e instanceof Error ? e.message : "Failed to publish job post",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedJD) return;
    try {
      await navigator.clipboard?.writeText(generatedJD);
    } catch {
      // ignore
    }
  };

  const handleExport = () => {
    if (!generatedJD) return;

    const safeTitle = (jobTitle || "job-description")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const blob = new Blob([generatedJD], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeTitle || "job-description"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.headerTitleBlock}>
            <Sparkle24Regular style={{ color: "#0118D8" }} />
            <span className={styles.headerTitle}>
              AI Job Description Generator
            </span>
          </div>
          <div className={styles.headerSubtitle}>
            Create professional, compelling job descriptions in seconds using AI
          </div>
        </div>
        <Badge className={styles.poweredBadge}>
          <Sparkle24Regular style={{ width: 14, height: 14 }} />
          <span>Powered by AI</span>
        </Badge>
      </div>

      <div className={styles.grid}>
        <Card className={styles.leftCard}>
          <div className={styles.sectionTitle}>Job Details</div>

          {!!error && (
            <div
              style={{ color: "#DC2626", fontSize: "0.85rem", marginBottom: 8 }}
            >
              {error}
            </div>
          )}

          <div
            style={{ display: "flex", flexDirection: "column", rowGap: "12px" }}
          >
            <div className={styles.fieldGroup}>
              <Label htmlFor="job-title" className={styles.fieldLabel}>
                Job Title *
              </Label>
              <Input
                id="job-title"
                placeholder="e.g. Senior Frontend Developer"
                value={jobTitle}
                onChange={(_, data) => setJobTitle(data.value)}
              />
            </div>

            <div className={styles.twoColRow}>
              <div className={styles.fieldGroup}>
                <Label htmlFor="level" className={styles.fieldLabel}>
                  Experience Level *
                </Label>
                <Dropdown
                  id="level"
                  placeholder="Select level"
                  selectedOptions={experienceLevel ? [experienceLevel] : []}
                  value={
                    EXPERIENCE_OPTIONS.find((x) => x.value === experienceLevel)
                      ?.label ?? ""
                  }
                  onOptionSelect={(_, data) => {
                    const v = String(data.optionValue ?? "");
                    if (v) setExperienceLevel(v);
                  }}
                >
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Dropdown>
              </div>

              <div className={styles.fieldGroup}>
                <Label htmlFor="type" className={styles.fieldLabel}>
                  Employment Type *
                </Label>
                <Dropdown
                  id="type"
                  placeholder="Select type"
                  selectedOptions={employmentType ? [employmentType] : []}
                  value={
                    EMPLOYMENT_OPTIONS.find((x) => x.value === employmentType)
                      ?.label ?? ""
                  }
                  onOptionSelect={(_, data) => {
                    const v = String(data.optionValue ?? "");
                    if (v) setEmploymentType(v);
                  }}
                >
                  {EMPLOYMENT_OPTIONS.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Dropdown>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="skills" className={styles.fieldLabel}>
                Key Skills (comma separated) *
              </Label>
              <Input
                id="skills"
                placeholder="e.g. React, TypeScript, Node.js"
                value={keySkills}
                onChange={(_, data) => setKeySkills(data.value)}
              />
            </div>

            <div className={styles.twoColRow}>
              <div className={styles.fieldGroup}>
                <Label htmlFor="location" className={styles.fieldLabel}>
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Remote, New York"
                  value={location}
                  onChange={(_, data) => setLocation(data.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Label htmlFor="salary" className={styles.fieldLabel}>
                  Salary Range
                </Label>
                <Input
                  id="salary"
                  placeholder="e.g. $100k - $150k"
                  value={salaryRange}
                  onChange={(_, data) => setSalaryRange(data.value)}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="additional" className={styles.fieldLabel}>
                Additional Requirements (optional)
              </Label>
              <Textarea
                id="additional"
                className={styles.textarea}
                placeholder="Any specific requirements, benefits, or company details..."
                value={additionalRequirements}
                onChange={(_, data) => setAdditionalRequirements(data.value)}
              />
            </div>

            <Button
              appearance="primary"
              className={styles.generateButton}
              onClick={handleGenerate}
              disabled={isGenerating || !canGenerate}
            >
              {isGenerating ? (
                <>
                  <span className={styles.spinner} />
                  Generating...
                </>
              ) : (
                <>
                  <WandRegular
                    style={{ width: 18, height: 18, marginRight: 8 }}
                  />
                  Generate Job Description
                </>
              )}
            </Button>

            {isGenerating && (
              <div className={styles.progressWrapper}>
                <div className={styles.progressHeaderRow}>
                  <span className={styles.progressLabel}>Generating...</span>
                  <span className={styles.progressValue}>
                    {generationProgress}%
                  </span>
                </div>
                <ProgressBar
                  value={generationProgress}
                  max={100}
                  className={styles.progressBar}
                />
              </div>
            )}
          </div>
        </Card>

        <Card className={styles.rightCard}>
          <div className={styles.rightHeaderRow}>
            <div className={styles.sectionTitle}>Generated Job Description</div>
            {generatedJD && (
              <div className={styles.copyActionsRow}>
                <Button
                  appearance="outline"
                  size="small"
                  icon={<Copy20Regular />}
                  onClick={handleCopy}
                  className={styles.actionBtn}
                >
                  Copy
                </Button>
                <Button
                  appearance="outline"
                  size="small"
                  icon={<ArrowDownload20Regular />}
                  onClick={handleExport}
                  className={styles.actionBtn}
                >
                  Export
                </Button>
              </div>
            )}
          </div>

          {generatedJD ? (
            <div className={styles.generatedTextContainer}>
              <pre className={styles.generatedPre}>{generatedJD}</pre>

              <div className={styles.postSection}>
                <div className={styles.postTitle}>Post to Job Boards</div>
                <div className={styles.postGrid}>
                  <Button appearance="outline" className={styles.postButton}>
                    <div
                      className={styles.postLogoBox}
                      style={{ backgroundColor: "#0077B5" }}
                    >
                      <LinkedInIcon />
                    </div>
                    <div className={styles.postTextBlock}>
                      <div className={styles.postMain}>Post to LinkedIn</div>
                      <div className={styles.postSub}>
                        Reach millions of professionals
                      </div>
                    </div>
                    <CheckmarkCircle20Regular
                      style={{ color: "#16A34A", flexShrink: 0 }}
                    />
                  </Button>

                  <Button
                    appearance="outline"
                    className={styles.postButton}
                    style={{ borderColor: "#2557A7" }}
                  >
                    <div
                      className={styles.postLogoBox}
                      style={{ backgroundColor: "#2557A7" }}
                    >
                      <IndeedIcon />
                    </div>
                    <div className={styles.postTextBlock}>
                      <div className={styles.postMain}>Post to Indeed</div>
                      <div className={styles.postSub}>
                        World&apos;s largest job site
                      </div>
                    </div>
                  </Button>

                  <Button
                    appearance="outline"
                    className={styles.postButton}
                    style={{ borderColor: "#0CAA41" }}
                  >
                    <div
                      className={styles.postLogoBox}
                      style={{ backgroundColor: "#0CAA41" }}
                    >
                      <GlassdoorIcon />
                    </div>
                    <div className={styles.postTextBlock}>
                      <div className={styles.postMain}>Post to Glassdoor</div>
                      <div className={styles.postSub}>
                        Connect with active job seekers
                      </div>
                    </div>
                  </Button>

                  <Button
                    appearance="primary"
                    icon={<Send20Regular />}
                    disabled={isPublishing}
                    onClick={handlePublish}
                    style={{
                      backgroundImage:
                        "linear-gradient(to right,#0118D8,#1B56FD)",
                      color: "#ffffff",
                      border: "none",
                    }}
                  >
                    {isPublishing ? "Publishing..." : "Publish to Cogno-hire"}
                  </Button>
                  {publishError && (
                    <div
                      style={{
                        color: "#DC2626",
                        fontSize: "0.8rem",
                        marginTop: 4,
                      }}
                    >
                      {publishError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyInner}>
                <Sparkle24Regular className={styles.emptyIcon} />
                <div className={styles.emptyText}>
                  Fill in the details and click &quot;Generate&quot; to create
                  your job description.
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
