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
import { StatusPill } from "../layout/StatusPill";
import {
  Dismiss12Regular,
  ChevronRight20Regular,
  CheckmarkCircle20Regular,
} from "@fluentui/react-icons";

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

  stepsTitleBlock: {
    display: "flex",
    flexDirection: "column",
    rowGap: "2px",
  },

  stepsTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#0B1220",
  },

  stepsSubtitle: {
    fontSize: "0.8rem",
    color: "#6B7280",
  },

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

  stepCircleActive: {
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
  },

  stepCircleCompleted: {
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
  },

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

  stepLabelDescription: {
    color: "#5B6475",
    fontSize: "0.75rem",
  },

  mainCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
    backgroundColor: "#FFFFFF",
    padding: "20px 22px 18px",

    "@media (max-width: 640px)": {
      padding: "16px",
    },
  },

  sectionHeader: {
    marginBottom: "16px",
  },

  sectionTitle: {
    fontSize: "0.98rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "4px",
  },

  sectionSubtitle: {
    fontSize: "0.8rem",
    color: "#6B7280",
  },

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

  label: {
    fontSize: "0.8rem",
    color: "#374151",
    fontWeight: 500,
  },

  requiredDot: {
    color: "#DC2626",
    marginLeft: "2px",
  },

  skillsRow: {
    display: "flex",
    columnGap: "8px",
    marginTop: "4px",
  },

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

  reviewLabel: {
    fontSize: "0.75rem",
    color: "#5B6475",
    marginBottom: "2px",
  },

  reviewValue: {
    color: "#0B1220",
    fontWeight: 500,
  },

  actionsBar: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: "8px",
  },

  rightActions: {
    display: "flex",
    columnGap: "8px",
  },
});

export function EmployerCreateJob({ onNavigate }: EmployerCreateJobProps) {
  const styles = useStyles();
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "React",
    "TypeScript",
  ]);
  const [newSkill, setNewSkill] = useState("");

  const progress = (currentStep / steps.length) * 100;

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
      setNewSkill("");
    }
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
    if (currentStep === 1) {
      onNavigate("Jobs");
    } else {
      setCurrentStep((prev) => Math.max(1, prev - 1));
    }
  };

  const goForward = () => {
    if (currentStep === steps.length) {
      onNavigate("Jobs");
    } else {
      setCurrentStep((prev) => Math.min(steps.length, prev + 1));
    }
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

            <StatusPill
              status="info"
              label="Draft – not published yet"
              size="sm"
            />
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
                    {isCompleted ? (
                      <CheckmarkCircle20Regular />
                    ) : (
                      step.id
                    )}
                  </div>

                  <div>
                    <div className={styles.stepLabelTitle}>
                      {step.title}
                    </div>
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
                <Input placeholder="e.g. Senior Frontend Developer" />
              </div>

              <div className={styles.formGridTwo}>
                <div className={styles.formRow}>
                  <label className={styles.label}>
                    Employment Type<span className={styles.requiredDot}>*</span>
                  </label>
                  <Dropdown defaultValue="full-time">
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
                  <Input placeholder="e.g. Remote, San Francisco, CA" />
                </div>
              </div>

              <div className={styles.formGridTwo}>
                <div className={styles.formRow}>
                  <label className={styles.label}>
                    Experience Required
                    <span className={styles.requiredDot}>*</span>
                  </label>
                  <Input placeholder="e.g. 5–7 years" />
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>
                    CTC Range<span className={styles.requiredDot}>*</span>
                  </label>
                  <Input placeholder="e.g. $120k – $150k" />
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>
                  Job Description<span className={styles.requiredDot}>*</span>
                </label>
                <Textarea
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={6}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  Requirements & Tech Stack
                </div>
                <div className={styles.sectionSubtitle}>
                  Specify the skills and technologies required for this role.
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>
                  Required Skills<span className={styles.requiredDot}>*</span>
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
                    <Badge
                      key={skill}
                      appearance="filled"
                      className={styles.skillBadge}
                    >
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
                <label className={styles.label}>
                  Educational Qualifications
                </label>
                <Textarea
                  placeholder="e.g. Bachelor's degree in Computer Science or related field"
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>
                  Key Responsibilities<span className={styles.requiredDot}>*</span>
                </label>
                <Textarea
                  placeholder="List the main responsibilities for this role..."
                  rows={6}
                />
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
                    Interview Difficulty
                    <span className={styles.requiredDot}>*</span>
                  </label>
                  <Dropdown defaultValue="medium">
                    <Option value="easy">Easy</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="hard">Hard</Option>
                  </Dropdown>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>
                    Interview Duration
                    <span className={styles.requiredDot}>*</span>
                  </label>
                  <Dropdown defaultValue="45">
                    <Option value="30">30 minutes</Option>
                    <Option value="45">45 minutes</Option>
                    <Option value="60">60 minutes</Option>
                  </Dropdown>
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Focus Areas</label>
                <Textarea
                  placeholder="What should the interview focus on? (e.g. React best practices, system design, problem solving)"
                  rows={4}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Interview Components</label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    rowGap: 4,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      columnGap: 6,
                    }}
                  >
                    <Checkbox defaultChecked />
                    <span>Technical Questions</span>
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      columnGap: 6,
                    }}
                  >
                    <Checkbox defaultChecked />
                    <span>Behavioral Questions</span>
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      columnGap: 6,
                    }}
                  >
                    <Checkbox defaultChecked />
                    <span>Coding Challenges</span>
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      columnGap: 6,
                    }}
                  >
                    <Checkbox />
                    <span>System Design</span>
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
                  <div className={styles.reviewValue}>
                    Senior Frontend Developer
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
                    <div className={styles.reviewLabel}>TYPE</div>
                    <div className={styles.reviewValue}>Full-time</div>
                  </div>
                  <div>
                    <div className={styles.reviewLabel}>LOCATION</div>
                    <div className={styles.reviewValue}>Remote</div>
                  </div>
                  <div>
                    <div className={styles.reviewLabel}>EXPERIENCE</div>
                    <div className={styles.reviewValue}>5–7 years</div>
                  </div>
                </div>

                <div>
                  <div className={styles.reviewLabel}>SKILLS</div>
                  <div className={styles.skillsChipsRow}>
                    {selectedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        appearance="filled"
                        className={styles.skillBadge}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className={styles.reviewLabel}>
                    INTERVIEW DIFFICULTY
                  </div>
                  <div className={styles.reviewValue}>Medium</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "14px",
                  padding: "10px 12px",
                  backgroundColor: "#EFF6FF",
                  borderRadius: "10px",
                  border: "1px solid #BFDBFE",
                  fontSize: "0.85rem",
                  color: "#0118D8",
                }}
              >
                ✓ Your job post is ready to be published. Candidates will be
                able to apply and take the AI interview immediately after
                publishing.
              </div>
            </div>
          )}

          <div className={styles.actionsBar}>
            <Button appearance="secondary" onClick={goBack}>
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>

            <div className={styles.rightActions}>
              {currentStep < steps.length && (
                <Button appearance="outline" onClick={() => onNavigate("Jobs")}>
                  Save as Draft
                </Button>
              )}
              <Button
                appearance="primary"
                onClick={goForward}
                icon={
                  currentStep < steps.length ? (
                    <ChevronRight20Regular />
                  ) : undefined
                }
                iconPosition="after"
              >
                {currentStep === steps.length ? "Publish Job" : "Continue"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
