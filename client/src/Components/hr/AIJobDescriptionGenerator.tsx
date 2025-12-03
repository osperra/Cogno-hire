import { useState } from "react";
import {
  Button,
  Card,
  Input,
  Label,
  Textarea,
  Dropdown,
  Option,
  ProgressBar,
  Text,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";

import {
  Sparkle24Regular,
  Wand24Regular,
  Copy24Regular,
  ArrowDownload24Regular,
  Send24Regular,
  Globe24Regular,
  CheckmarkCircle24Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
    boxSizing: "border-box",
    backgroundColor: "#FFF5F5",
    padding: "24px 32px",
  },

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
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    columnGap: "16px",
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
    marginBottom: "4px",
  },

  titleText: {
    color: "#0B1220",
  },

  subtitle: {
    color: "#5B6475",
  },

  badgeAI: {
    background: "linear-gradient(to right, #8B5CF6, #3B82F6)",
    color: "#FFFFFF",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    columnGap: "6px",
    border: "none",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    rowGap: "24px",

    "@media (min-width: 900px)": {
      gridTemplateColumns: "1fr 1fr",
      columnGap: "24px",
    },
  },

  card: {
    padding: "24px",
    backgroundColor: "#FFFFFF",
    ...shorthands.border("1px", "solid", "rgba(148,163,184,0.35)"),
    borderRadius: "20px",
    boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 16px 40px rgba(15,23,42,0.06)",
  },

  cardTitle: {
    marginBottom: "20px",
    color: "#0B1220",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    rowGap: "6px",
    marginBottom: "16px",
  },

  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#111827",
  },

  inputRow: {
    display: "flex",
    flexDirection: "column",
    rowGap: "12px",

    "@media (min-width: 768px)": {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      columnGap: "16px",
      rowGap: "0",
    },
  },
  copyButton:{
    backgroundColor:"#FEF2F2",
    ":hover":{backgroundColor:"#E9DFC3"},
    padding:"4px 8px",borderRadius:"8px"
  },
  exportButton:{
    backgroundColor:"#FEF2F2",
    ":hover":{backgroundColor:"#E9DFC3"},
    padding:"4px 8px",borderRadius:"8px"
  },
  generateButton: {
    marginTop: "12px",
    width: "100%",
    height: "44px",
    borderRadius: "999px",
    background: "linear-gradient(to right, #0118D8, #1B56FD)",
    color: "#FFFFFF",
    fontWeight: 600,
    ":hover": {
      background: "linear-gradient(to right, #1B56FD, #0118D8)",
      color: "#FFFFFF",
    },
  },

  progressContainer: {
    marginTop: "16px",
  },

  outputHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },

  outputContainer: {
    minHeight: "360px",
    borderRadius: "18px",
    border: "2px dashed rgba(148,163,184,0.7)",
    backgroundColor: "#FDFDFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },

  jobBoardSection: {
    marginTop: "24px",
    paddingTop: "16px",
    borderTop: "1px solid rgba(226,232,240,0.8)",
  },

  jobBoardButton: {
    width: "100%",
    justifyContent: "flex-start",
    padding: "14px",
    borderRadius: "12px",
    marginBottom: "12px",
  },

  jobBoardTextTitle: {
    fontWeight: 500,
    color: "#0B1220",
  },

  jobBoardTextSubtitle: {
    fontSize: "0.875rem",
    color: "#5B6475",
  },
});

export function AIJobDescriptionGenerator() {
  const styles = useStyles();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedJD, setGeneratedJD] = useState("");

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setGeneratedJD(sampleGeneratedJD);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className={styles.page}>
      <div className={styles.root}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.titleRow}>
              <Sparkle24Regular style={{ color: "#0118D8" }} />
              <Text weight="semibold" size={600} className={styles.titleText}>
                AI Job Description Generator
              </Text>
            </div>
            <Text size={300} className={styles.subtitle}>
              Create professional, compelling job descriptions in seconds using
              AI
            </Text>
          </div>

          <div className={styles.badgeAI}>
            <Sparkle24Regular />
            <span>Powered by AI</span>
          </div>
        </div>

        <div className={styles.grid}>
          <Card className={styles.card}>
            <Text weight="semibold" size={500} className={styles.cardTitle}>
              Job Details
            </Text>

            <div className={styles.field}>
              <Label className={styles.label}>Job Title *</Label>
              <Input
                defaultValue="Senior Frontend Developer"
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>

            <div className={styles.inputRow}>
              <div className={styles.field}>
                <Label className={styles.label}>Experience Level *</Label>
                <Dropdown defaultValue="senior">
                  <Option value="junior">Junior (0–2 years)</Option>
                  <Option value="mid">Mid-level (3–5 years)</Option>
                  <Option value="senior">Senior (5–7 years)</Option>
                  <Option value="lead">Lead (7+ years)</Option>
                </Dropdown>
              </div>

              <div className={styles.field}>
                <Label className={styles.label}>Employment Type *</Label>
                <Dropdown defaultValue="full-time">
                  <Option value="full-time">Full-time</Option>
                  <Option value="part-time">Part-time</Option>
                  <Option value="contract">Contract</Option>
                  <Option value="internship">Internship</Option>
                </Dropdown>
              </div>
            </div>

            <div className={styles.field}>
              <Label className={styles.label}>
                Key Skills (comma separated) *
              </Label>
              <Input
                defaultValue="React, TypeScript, JavaScript, CSS, HTML"
                placeholder="e.g. React, TypeScript, Node.js"
              />
            </div>

            <div className={styles.inputRow}>
              <div className={styles.field}>
                <Label className={styles.label}>Location</Label>
                <Input placeholder="e.g. Remote, New York" />
              </div>

              <div className={styles.field}>
                <Label className={styles.label}>Salary Range</Label>
                <Input placeholder="e.g. $100k – $150k" />
              </div>
            </div>

            <div className={styles.field}>
              <Label className={styles.label}>
                Additional Requirements (optional)
              </Label>
              <Textarea
                rows={4}
                placeholder="Any specific requirements, benefits, or company details..."
              />
            </div>

            <Button
              className={styles.generateButton}
              onClick={handleGenerate}
              disabled={isGenerating}
              icon={<Wand24Regular />}
            >
              {isGenerating ? "Generating..." : "Generate Job Description"}
            </Button>

            {isGenerating && (
              <div className={styles.progressContainer}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text size={300} style={{ color: "#5B6475" }}>
                    Generating...
                  </Text>
                  <Text
                    weight="semibold"
                    style={{ color: "#0118D8" }}
                    size={300}
                  >
                    {generationProgress}%
                  </Text>
                </div>
                <ProgressBar value={generationProgress} />
              </div>
            )}
          </Card>

          <Card className={styles.card}>
            <div className={styles.outputHeader}>
              <Text
                weight="semibold"
                size={500}
                className={styles.cardTitle}
                style={{ marginBottom: 0 }}
              >
                Generated Job Description
              </Text>

              {generatedJD && (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button 
                    className={styles.copyButton}
                    appearance="outline"
                    icon={<Copy24Regular />}
                    size="small"
                  >
                    Copy
                  </Button>
                  <Button
                    className={styles.exportButton}
                    appearance="outline"
                    icon={<ArrowDownload24Regular />}
                    size="small"
                  >
                    Export
                  </Button>
                </div>
              )}
            </div>

            {generatedJD ? (
              <>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
                    marginTop: 8,
                    color: "#0B1220",
                    lineHeight: 1.5,
                  }}
                >
                  {generatedJD}
                </pre>

                <div className={styles.jobBoardSection}>
                  <Text
                    weight="semibold"
                    size={400}
                    style={{ marginBottom: 12, display: "block" }}
                  >
                    Post to Job Boards
                  </Text>

                  <Button
                    appearance="outline"
                    icon={<Globe24Regular />}
                    className={styles.jobBoardButton}
                  >
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div className={styles.jobBoardTextTitle}>
                        Post to LinkedIn
                      </div>
                      <div className={styles.jobBoardTextSubtitle}>
                        Reach millions of professionals
                      </div>
                    </div>
                    <CheckmarkCircle24Regular style={{ color: "#16A34A" }} />
                  </Button>

                  <Button
                    appearance="outline"
                    icon={<Globe24Regular />}
                    className={styles.jobBoardButton}
                  >
                    <div style={{ textAlign: "left" }}>
                      <div className={styles.jobBoardTextTitle}>
                        Post to Indeed
                      </div>
                      <div className={styles.jobBoardTextSubtitle}>
                        World&apos;s largest job site
                      </div>
                    </div>
                  </Button>

                  <Button
                    appearance="outline"
                    icon={<Globe24Regular />}
                    className={styles.jobBoardButton}
                  >
                    <div style={{ textAlign: "left" }}>
                      <div className={styles.jobBoardTextTitle}>
                        Post to Glassdoor
                      </div>
                      <div className={styles.jobBoardTextSubtitle}>
                        Connect with active job seekers
                      </div>
                    </div>
                  </Button>

                  <Button
                    icon={<Send24Regular />}
                    style={{
                      background: "linear-gradient(to right, #0118D8, #1B56FD)",
                      color: "#FFFFFF",
                      width: "100%",
                      marginTop: 8,
                      borderRadius: "999px",
                      fontWeight: 600,
                    }}
                  >
                    Post to All Platforms
                  </Button>
                </div>
              </>
            ) : (
              <div className={styles.outputContainer}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <Sparkle24Regular
                    style={{
                      fontSize: 48,
                      color: "#9CA3AF",
                      marginBottom: 12,
                    }}
                  />
                  <Text size={300} style={{ color: "#6B7280" }}>
                    Fill in the details and click "Generate" to create your job
                    description
                  </Text>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

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
• Proficiency in HTML5, CSS3, and modern CSS frameworks
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
