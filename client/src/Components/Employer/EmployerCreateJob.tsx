import { useState, type KeyboardEvent } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Dropdown,
  Input,
  Option,
  ProgressBar,
  Textarea,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import { StatusPill } from "../ui/StatusPill";
import {
  Dismiss12Regular,
  ChevronRight20Regular,
  CheckmarkCircle20Regular,
} from "@fluentui/react-icons";
import { api } from "../../api/http";

interface EmployerCreateJobProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
}

const steps = [
  { id: 1, title: "Basics", description: "Job title, type, and location" },
  { id: 2, title: "Requirements", description: "Skills and tech stack" },
  { id: 3, title: "Interview Settings", description: "Configure AI interview" },
  { id: 4, title: "Review", description: "Review and publish" },
];

const useStyles = makeStyles({
  root: {
    minHeight: "100%",
    padding: "16px 0 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
  },
  content: {
    width: "100%",
    maxWidth: "960px",
    display: "flex",
    flexDirection: "column",
    rowGap: "16px",
  },
  stepsCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
    backgroundColor: "#FFFFFF",
    padding: "16px 20px 18px",
    display: "flex",
    flexDirection: "column",
    rowGap: "12px",
  },
  stepsHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  stepsTitleBlock: { display: "flex", flexDirection: "column", rowGap: "2px" },
  stepsTitle: { fontSize: "0.95rem", fontWeight: 600, color: "#0B1220" },
  stepsSubtitle: { fontSize: "0.8rem", color: "#6B7280" },
  stepsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    columnGap: "16px",
    marginTop: "8px",
    "@media (max-width: 640px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      rowGap: "10px",
    },
  },
  stepItem: {
    display: "flex",
    alignItems: "flex-start",
    columnGap: "10px",
    fontSize: "0.8rem",
  },
  stepCircleBase: {
    width: "30px",
    height: "30px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    fontWeight: 600,
    flexShrink: 0,
  },
  stepCircleActive: { backgroundColor: "#0118D8", color: "#FFFFFF" },
  stepCircleCompleted: { backgroundColor: "#0118D8", color: "#FFFFFF" },
  stepCirclePending: {
    ...shorthands.border("2px", "solid", "rgba(2,6,23,0.08)"),
    color: "#5B6475",
  },
  stepLabelTitle: {
    color: "#0B1220",
    fontWeight: 500,
    fontSize: "0.85rem",
    marginBottom: "2px",
  },
  stepLabelDescription: { color: "#5B6475", fontSize: "0.75rem" },
  mainCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
    backgroundColor: "#FFFFFF",
    padding: "20px 22px 18px",
    "@media (max-width: 640px)": { padding: "16px" },
  },
  sectionHeader: { marginBottom: "16px" },
  sectionTitle: {
    fontSize: "0.98rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "4px",
  },
  sectionSubtitle: { fontSize: "0.8rem", color: "#6B7280" },
  formGridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    columnGap: "16px",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "minmax(0, 1fr)",
      rowGap: "10px",
    },
  },
  formRow: {
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
    marginBottom: "12px",
  },
  label: { fontSize: "0.8rem", color: "#374151", fontWeight: 500 },
  requiredDot: { color: "#DC2626", marginLeft: "2px" },
  skillsRow: { display: "flex", columnGap: "8px", marginTop: "4px" },
  skillsChipsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "8px",
  },
  skillBadge: {
    backgroundColor: "#E9DFC3",
    color: "#0B1220",
    ...shorthands.border("1px", "solid", "#E9DFC3"),
    paddingInline: "10px",
    paddingBlock: "6px",
    display: "inline-flex",
    alignItems: "center",
    columnGap: "6px",
  },
  reviewBox: {
    marginTop: "8px",
    padding: "12px 14px",
    backgroundColor: "#FFF8F8",
    ...shorthands.borderRadius("12px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    display: "flex",
    flexDirection: "column",
    rowGap: "10px",
  },
  reviewLabel: { fontSize: "0.75rem", color: "#5B6475", marginBottom: "2px" },
  reviewValue: { color: "#0B1220", fontWeight: 500 },
  actionsBar: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: "8px",
  },
  rightActions: { display: "flex", columnGap: "8px" },
});

function wrapAsHtmlParagraph(text: string) {
  const t = text.trim();
  if (!t) return "";
  if (t.startsWith("<")) return t;
  return `<p>${t}</p>`;
}

function parseSalaryRange(input: string): { start?: number; end?: number } {
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
}

function parseNumberStrict(input: string): number | undefined {
  const v = input.trim();
  if (!v) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

export function EmployerCreateJob({ onNavigate }: EmployerCreateJobProps) {
  const styles = useStyles();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [jobType, setJobType] = useState<
    "full-time" | "part-time" | "contract" | "internship"
  >("full-time");
  const [location, setLocation] = useState("");
  const [workType, setWorkType] = useState<"remote" | "hybrid" | "on-site">(
    "remote"
  );
  const [workExperienceText, setWorkExperienceText] = useState("");
  const [salaryRangeText, setSalaryRangeText] = useState("");
  const [description, setDescription] = useState("");

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const [maxCandidatesText, setMaxCandidatesText] = useState("1");
  const [interviewDurationText, setInterviewDurationText] = useState("10");
  const [difficultyLevel, setDifficultyLevel] = useState<
    "easy" | "medium" | "hard"
  >("easy");
  const [language, setLanguage] = useState("english");

  const progress = (currentStep / steps.length) * 100;

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    const exists = selectedSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setSelectedSkills((prev) => [...prev, trimmed]);
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const goBack = () => {
    if (currentStep === 1) onNavigate("jobs");
    else setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const saveJob = async (status: "draft" | "open") => {
    setError(null);

    if (!title.trim()) return setError("Job title is required");
    if (!location.trim()) return setError("Location is required");
    if (!description.trim()) return setError("Job description is required");
    if (!salaryRangeText.trim()) return setError("CTC Range is required");

    if (selectedSkills.length === 0) {
      return setError("Please add at least 1 skill in Tech Stack");
    }

    const salaryRange = parseSalaryRange(salaryRangeText);
    if (salaryRange.start == null || salaryRange.end == null) {
      return setError("CTC Range should be like: 12 - 15");
    }

    const workExperience = parseNumberStrict(workExperienceText);
    if (workExperience == null) {
      return setError("Experience should be a number (example: 1, 2, 3)");
    }

    const maxCandidates = parseNumberStrict(maxCandidatesText);
    if (maxCandidates == null || maxCandidates <= 0) {
      return setError("Max candidates must be a valid number (>= 1)");
    }

    const interviewDuration = parseNumberStrict(interviewDurationText);
    if (interviewDuration == null || interviewDuration <= 0) {
      return setError("Interview duration must be a valid number (>= 1)");
    }

    const payload = {
      title: title.trim(),
      about: wrapAsHtmlParagraph(description),
      description: description, 

      location: location.trim(),
      workType,

      salaryRange: { start: salaryRange.start, end: salaryRange.end },
      jobType,
      isActive: true,
      workExperience,

      techStack: selectedSkills,

      interviewSettings: {
        maxCandidates,
        interviewDuration,
        interviewers: [],
        difficultyLevel,
        questions: [],
        language: language.trim() || "english",
      },

      price: 7,
      paymentDetails: { status: "pending" },
      invitedCandidates: [],
      status,

   
    };

    try {
      setSaving(true);


      await api("/api/jobs", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onNavigate("jobs");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  const goForward = async () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => Math.min(steps.length, prev + 1));
      return;
    }
    await saveJob("open");
  };

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Card className={styles.stepsCard}>
          <div className={styles.stepsHeaderRow}>
            <div className={styles.stepsTitleBlock}>
              <span className={styles.stepsTitle}>Create New Job</span>
              <span className={styles.stepsSubtitle}>
                Step {currentStep} of {steps.length}
              </span>
            </div>

            <StatusPill status="info" label="Draft – not published yet" size="sm" />
          </div>

          <ProgressBar value={progress} max={100} />

          <div className={styles.stepsRow}>
            {steps.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className={styles.stepItem}>
                  <div
                    className={`${styles.stepCircleBase} ${
                      isCompleted
                        ? styles.stepCircleCompleted
                        : isActive
                        ? styles.stepCircleActive
                        : styles.stepCirclePending
                    }`}
                  >
                    {isCompleted ? <CheckmarkCircle20Regular /> : step.id}
                  </div>

                  <div>
                    <div className={styles.stepLabelTitle}>{step.title}</div>
                    <div className={styles.stepLabelDescription}>
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className={styles.mainCard}>
          {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

          {currentStep === 1 && (
            <div>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Job Basics</div>
                <div className={styles.sectionSubtitle}>
                  Enter the basic information about the job opening.
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>
                  Job Title<span className={styles.requiredDot}>*</span>
                </label>
                <Input
                  placeholder="e.g. Senior Frontend Developer"
                  value={title}
                  onChange={(_, d) => setTitle(d.value)}
                />
              </div>

              <div className={styles.formGridTwo}>
                <div className={styles.formRow}>
                  <label className={styles.label}>
                    Employment Type<span className={styles.requiredDot}>*</span>
                  </label>
                  <Dropdown
                    value={jobType}
                    onOptionSelect={(_, d) =>
                      setJobType((d.optionValue ?? "full-time") as typeof jobType)
                    }
                  >
                    <Option value="full-time">Full-time</Option>
                    <Option value="part-time">Part-time</Option>
                    <Option value="contract">Contract</Option>
                    <Option value="internship">Internship</Option>
                  </Dropdown>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>
                    Location<span className={styles.requiredDot}>*</span>
                  </label>
                  <Input
                    placeholder="e.g. hybrid / remote / on-site"
                    value={location}
                    onChange={(_, d) => setLocation(d.value)}
                  />
                </div>
              </div>

              <div className={styles.formGridTwo}>
                <div className={styles.formRow}>
                  <label className={styles.label}>
                    Work Type<span className={styles.requiredDot}>*</span>
                  </label>
                  <Dropdown
                    value={workType}
                    onOptionSelect={(_, d) =>
                      setWorkType((d.optionValue ?? "remote") as typeof workType)
                    }
                  >
                    <Option value="remote">Remote</Option>
                    <Option value="hybrid">Hybrid</Option>
                    <Option value="on-site">On-site</Option>
                  </Dropdown>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>
                    Experience Required<span className={styles.requiredDot}>*</span>
                  </label>
                  <Input
                    placeholder="e.g. 1"
                    value={workExperienceText}
                    onChange={(_, d) => setWorkExperienceText(d.value)}
                  />
                </div>
              </div>

              <div className={styles.formGridTwo}>
                <div className={styles.formRow}>
                  <label className={styles.label}>
                    CTC Range<span className={styles.requiredDot}>*</span>
                  </label>
                  <Input
                    placeholder="e.g. 12 - 15"
                    value={salaryRangeText}
                    onChange={(_, d) => setSalaryRangeText(d.value)}
                  />
                </div>
                <div className={styles.formRow} />
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>
                  Job Description<span className={styles.requiredDot}>*</span>
                </label>
                <Textarea
                  placeholder="Describe the role..."
                  rows={6}
                  value={description}
                  onChange={(_, d) => setDescription(d.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Requirements & Tech Stack</div>
                <div className={styles.sectionSubtitle}>
                  Specify the skills and technologies required for this role.
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>
                  Tech Stack<span className={styles.requiredDot}>*</span>
                </label>

                <div className={styles.skillsRow}>
                  <Input
                    placeholder="Add a skill (e.g. React, Node.js)"
                    value={newSkill}
                    onChange={(_, data) => setNewSkill(data.value)}
                    onKeyDown={handleSkillKeyDown}
                  />
                  <Button appearance="primary" onClick={addSkill}>
                    Add
                  </Button>
                </div>

                <div className={styles.skillsChipsRow}>
                  {selectedSkills.map((skill) => (
                    <Badge key={skill} appearance="filled" className={styles.skillBadge}>
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Dismiss12Regular />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Key Responsibilities</label>
                <Textarea placeholder="List responsibilities..." rows={6} />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Interview Settings</div>
                <div className={styles.sectionSubtitle}>
                  Configure how the AI will conduct interviews for this role.
                </div>
              </div>

              <div className={styles.formGridTwo}>
                <div className={styles.formRow}>
                  <label className={styles.label}>
                    Max Candidates<span className={styles.requiredDot}>*</span>
                  </label>
                  <Input
                    placeholder="e.g. 2"
                    value={maxCandidatesText}
                    onChange={(_, d) => setMaxCandidatesText(d.value)}
                  />
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>
                    Interview Duration (min)<span className={styles.requiredDot}>*</span>
                  </label>
                  <Input
                    placeholder="e.g. 10"
                    value={interviewDurationText}
                    onChange={(_, d) => setInterviewDurationText(d.value)}
                  />
                </div>
              </div>

              <div className={styles.formGridTwo}>
                <div className={styles.formRow}>
                  <label className={styles.label}>
                    Difficulty Level<span className={styles.requiredDot}>*</span>
                  </label>
                  <Dropdown
                    value={difficultyLevel}
                    onOptionSelect={(_, d) =>
                      setDifficultyLevel((d.optionValue ?? "easy") as typeof difficultyLevel)
                    }
                  >
                    <Option value="easy">Easy</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="hard">Hard</Option>
                  </Dropdown>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>Language</label>
                  <Input
                    placeholder="e.g. english"
                    value={language}
                    onChange={(_, d) => setLanguage(d.value)}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Interview Components</label>
                <div style={{ display: "flex", flexDirection: "column", rowGap: 4 }}>
                  <label style={{ display: "flex", alignItems: "center", columnGap: 6 }}>
                    <Checkbox defaultChecked />
                    <span>Technical Questions</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", columnGap: 6 }}>
                    <Checkbox defaultChecked />
                    <span>Behavioral Questions</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", columnGap: 6 }}>
                    <Checkbox defaultChecked />
                    <span>Coding Challenges</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Review & Publish</div>
                <div className={styles.sectionSubtitle}>
                  Review all the details before publishing the job post.
                </div>
              </div>

              <div className={styles.reviewBox}>
                <div>
                  <div className={styles.reviewLabel}>JOB TITLE</div>
                  <div className={styles.reviewValue}>{title || "—"}</div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    columnGap: "12px",
                    rowGap: "8px",
                  }}
                >
                  <div>
                    <div className={styles.reviewLabel}>TYPE</div>
                    <div className={styles.reviewValue}>{jobType}</div>
                  </div>
                  <div>
                    <div className={styles.reviewLabel}>LOCATION</div>
                    <div className={styles.reviewValue}>{location || "—"}</div>
                  </div>
                  <div>
                    <div className={styles.reviewLabel}>WORK TYPE</div>
                    <div className={styles.reviewValue}>{workType}</div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    columnGap: "12px",
                    rowGap: "8px",
                  }}
                >
                  <div>
                    <div className={styles.reviewLabel}>EXPERIENCE</div>
                    <div className={styles.reviewValue}>{workExperienceText || "—"}</div>
                  </div>
                  <div>
                    <div className={styles.reviewLabel}>CTC</div>
                    <div className={styles.reviewValue}>{salaryRangeText || "—"}</div>
                  </div>
                  <div>
                    <div className={styles.reviewLabel}>DIFFICULTY</div>
                    <div className={styles.reviewValue}>{difficultyLevel}</div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    columnGap: "12px",
                    rowGap: "8px",
                  }}
                >
                  <div>
                    <div className={styles.reviewLabel}>MAX CANDIDATES</div>
                    <div className={styles.reviewValue}>{maxCandidatesText}</div>
                  </div>
                  <div>
                    <div className={styles.reviewLabel}>DURATION</div>
                    <div className={styles.reviewValue}>{interviewDurationText} min</div>
                  </div>
                  <div>
                    <div className={styles.reviewLabel}>LANGUAGE</div>
                    <div className={styles.reviewValue}>{language}</div>
                  </div>
                </div>

                <div>
                  <div className={styles.reviewLabel}>TECH STACK</div>
                  <div className={styles.skillsChipsRow}>
                    {selectedSkills.map((skill) => (
                      <Badge key={skill} appearance="filled" className={styles.skillBadge}>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className={styles.reviewLabel}>DESCRIPTION</div>
                  <div style={{ color: "#111827", fontSize: 13, whiteSpace: "pre-wrap" }}>
                    {description || "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.actionsBar}>
            <Button appearance="secondary" onClick={goBack} disabled={saving}>
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>

            <div className={styles.rightActions}>
              {currentStep < steps.length && (
                <Button appearance="outline" disabled={saving} onClick={() => saveJob("draft")}>
                  Save as Draft
                </Button>
              )}

              <Button
                appearance="primary"
                disabled={saving}
                onClick={goForward}
                icon={currentStep < steps.length ? <ChevronRight20Regular /> : undefined}
                iconPosition="after"
              >
                {saving ? "Saving..." : currentStep === steps.length ? "Publish Job" : "Continue"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
