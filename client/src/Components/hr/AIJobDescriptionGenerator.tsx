import * as React from "react";
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
  Globe20Regular,
  CheckmarkCircle20Regular,
} from "@fluentui/react-icons";

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
    } ,
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

const sampleGeneratedJD = `Senior Frontend Developer

About the Role:
We are seeking a talented Senior Frontend Developer to join our dynamic team. You will be responsible for building scalable, high-performance web applications using modern technologies and best practices.

Key Responsibilities:
• Design and develop responsive web applications using React, TypeScript, and modern JavaScript
• Collaborate with cross-functional teams to define, design, and ship new features
• Optimize applications for maximum speed and scalability
• Mentor junior developers and conduct code reviews
• Stay up-to-date with emerging trends and technologies in frontend development

Required Qualifications:
• 5-7 years of professional experience in frontend development
• Expert knowledge of React, TypeScript, and modern JavaScript (ES6+)
• Strong understanding of responsive design and cross-browser compatibility
• Experience with state management libraries (Redux, Zustand, or similar)
• Proficiency in HTML5, CSS3, and modern CSS frameworks (Tailwind, styled-components)
• Experience with testing frameworks (Jest, React Testing Library)
• Excellent problem-solving skills and attention to detail

Preferred Qualifications:
• Experience with Next.js or other React frameworks
• Knowledge of backend technologies (Node.js, GraphQL)
• Familiarity with CI/CD pipelines and DevOps practices
• Contributions to open-source projects
• Experience with performance optimization and monitoring tools

What We Offer:
• Competitive salary: $120,000 - $150,000 per year
• Comprehensive health, dental, and vision insurance
• 401(k) with company match
• Flexible remote work options
• Professional development budget
• Collaborative and innovative work environment

Application Process:
Qualified candidates will undergo an AI-powered technical interview followed by team interviews. We strive to complete the hiring process within 2-3 weeks.`;

export const AIJobDescriptionGenerator: React.FC = () => {
  const styles = useStyles();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationProgress, setGenerationProgress] = React.useState(0);
  const [generatedJD, setGeneratedJD] = React.useState("");

  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedJD("");

    const interval = window.setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(interval);
          setIsGenerating(false);
          setGeneratedJD(sampleGeneratedJD);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleCopy = () => {
    if (!generatedJD) return;
    navigator.clipboard?.writeText(generatedJD).catch(() => {});
  };

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.headerTitleBlock}>
            <Sparkle24Regular style={{ color: "#0118D8" }} />
            <span className={styles.headerTitle}>AI Job Description Generator</span>
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

          <div style={{ display: "flex", flexDirection: "column", rowGap: "12px" }}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="job-title" className={styles.fieldLabel}>
                Job Title *
              </Label>
              <Input
                id="job-title"
                placeholder="e.g. Senior Frontend Developer"
                defaultValue="Senior Frontend Developer"
              />
            </div>

            <div className={styles.twoColRow}>
              <div className={styles.fieldGroup}>
                <Label htmlFor="level" className={styles.fieldLabel}>
                  Experience Level *
                </Label>
                <Dropdown
                  id="level"
                  defaultSelectedOptions={["senior"]}
                  placeholder="Select level"
                >
                  <Option value="junior">Junior (0-2 years)</Option>
                  <Option value="mid">Mid-level (3-5 years)</Option>
                  <Option value="senior">Senior (5-7 years)</Option>
                  <Option value="lead">Lead (7+ years)</Option>
                </Dropdown>
              </div>

              <div className={styles.fieldGroup}>
                <Label htmlFor="type" className={styles.fieldLabel}>
                  Employment Type *
                </Label>
                <Dropdown
                  id="type"
                  defaultSelectedOptions={["full-time"]}
                  placeholder="Select type"
                >
                  <Option value="full-time">Full-time</Option>
                  <Option value="part-time">Part-time</Option>
                  <Option value="contract">Contract</Option>
                  <Option value="internship">Internship</Option>
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
                defaultValue="React, TypeScript, JavaScript, CSS, HTML"
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
                />
              </div>
              <div className={styles.fieldGroup}>
                <Label htmlFor="salary" className={styles.fieldLabel}>
                  Salary Range
                </Label>
                <Input
                  id="salary"
                  placeholder="e.g. $100k - $150k"
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
              />
            </div>

            <Button
              appearance="primary"
              className={styles.generateButton}
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className={styles.spinner} />
                  Generating...
                </>
              ) : (
                <>
                  <WandRegular style={{ width: 18, height: 18, marginRight: 8 }} />
                  Generate Job Description
                </>
              )}
            </Button>

            {isGenerating && (
              <div className={styles.progressWrapper}>
                <div className={styles.progressHeaderRow}>
                  <span className={styles.progressLabel}>Generating...</span>
                  <span className={styles.progressValue}>{generationProgress}%</span>
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
                >
                  Copy
                </Button>
                <Button
                  appearance="outline"
                  size="small"
                  icon={<ArrowDownload20Regular />}
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
                  <Button
                    appearance="outline"
                    className={styles.postButton}
                  >
                    <div
                      className={styles.postLogoBox}
                      style={{ backgroundColor: "#0077B5" }}
                    >
                      <Globe20Regular style={{ color: "#ffffff" }} />
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
                    style={{
                      borderColor: "#2557A7",
                    }}
                  >
                    <div
                      className={styles.postLogoBox}
                      style={{ backgroundColor: "#2557A7" }}
                    >
                      <Globe20Regular style={{ color: "#ffffff" }} />
                    </div>
                    <div className={styles.postTextBlock}>
                      <div className={styles.postMain}>Post to Indeed</div>
                      <div className={styles.postSub}>
                        World's largest job site
                      </div>
                    </div>
                  </Button>

                  <Button
                    appearance="outline"
                    className={styles.postButton}
                    style={{
                      borderColor: "#0CAA41",
                    }}
                  >
                    <div
                      className={styles.postLogoBox}
                      style={{ backgroundColor: "#0CAA41" }}
                    >
                      <Globe20Regular style={{ color: "#ffffff" }} />
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
                    style={{
                      backgroundImage: "linear-gradient(to right,#0118D8,#1B56FD)",
                      color: "#ffffff",
                      border: "none",
                    }}
                  >
                    Post to All Platforms
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyInner}>
                <Sparkle24Regular className={styles.emptyIcon} />
                <div className={styles.emptyText}>
                  Fill in the details and click &quot;Generate&quot; to create your job description.
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
