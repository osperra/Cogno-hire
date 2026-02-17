import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Button,
  Card,
  Badge,
  makeStyles,
  shorthands,
  Spinner,
} from "@fluentui/react-components";

import {
  ArrowLeft20Regular,
  Mail20Regular,
  Briefcase20Regular,
  CalendarLtr20Regular,
  CheckmarkCircle20Regular,
  Warning20Regular,
  ArrowTrending20Regular,
  ArrowTrendingDownRegular,
  ChatMultiple20Regular,
} from "@fluentui/react-icons";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { api } from "../../api/http";
interface InterviewAnalyticsProps {
  onNavigate: (page: string) => void;
}

interface StrengthItem {
  title: string;
  description: string;
}

interface ImprovementItem {
  title: string;
  description: string;
}

interface SkillScore {
  skill: string;
  score: number;
}

interface AnalyticsData {
  overallScore: number;
  feedback: string;
  skills: SkillScore[];
  strengths: StrengthItem[];
  improvements: ImprovementItem[];
  jobTitle: string;
  createdAt: string;
  transcript?: { role: string; content: string; ts: number }[];
  candidateName?: string;
  candidateEmail?: string;
  applicationId?: string;
  highlights?: { type: string; label: string; content: string }[];
}

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

  headerRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "16px",
  },

  headerTitleBlock: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
  },

  headerTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#0B1220",
  },

  headerSubtitle: {
    fontSize: "0.9rem",
    color: "#5B6475",
  },

  headerActions: {
    display: "flex",
    columnGap: "8px",
  },

  primaryGreenButton: {
    backgroundColor: "#16A34A",
    color: "#FFFFFF",
    ":hover": {
      backgroundColor: "#15803D",
      color: "#FFFFFF",
    },
  },

  downloadButton: {
    ":hover": {
      backgroundColor: "#E9DFC3",
    },
  },

  backButton: {
    minWidth: "36px",
    ...shorthands.borderRadius("999px"),
    ":hover": {
      backgroundColor: "#E9DFC3",
    },
  },

  candidateCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    padding: "24px",
    backgroundColor: "#FFFFFF",
  },

  candidateRow: {
    display: "flex",
    columnGap: "24px",
    alignItems: "flex-start",
  },

  candidateAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "999px",
    background: "linear-gradient(to bottom right, #0118D8, #1B56FD)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: "2rem",
    fontWeight: 600,
    flexShrink: 0,
  },

  candidateMain: {
    flex: 1,
  },

  candidateHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    rowGap: "8px",
    columnGap: "12px",
    flexWrap: "wrap",
  },

  candidateName: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "4px",
  },

  candidateMetaRow: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: "16px",
    rowGap: "4px",
    color: "#5B6475",
    fontSize: "0.85rem",
  },

  metaItem: {
    display: "flex",
    alignItems: "center",
    columnGap: "6px",
  },

  overallScoreBox: {
    textAlign: "right",
  },

  overallScoreValue: {
    fontSize: "2.5rem",
    lineHeight: 1,
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "4px",
  },

  overallScoreLabel: {
    fontSize: "0.85rem",
    color: "#5B6475",
  },

  candidateBadgesRow: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: "8px",
    rowGap: "8px",
  },

  badgeStrong: {
    backgroundColor: "#16A34A",
    color: "#FFFFFF",
    borderRadius: "8px",
    border: "none",
  },

  badgeBlue: {
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
    borderRadius: "8px",
    border: "none",
  },

  badgeNeutral: {
    backgroundColor: "#E9DFC3",
    color: "#0B1220",
    borderRadius: "8px",
  },

  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    columnGap: "16px",
    rowGap: "16px",
    "@media (min-width: 992px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },

  sectionCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    padding: "24px",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
  },

  feedbackCard: {
    ...shorthands.borderRadius("20px"),
    ...shorthands.border("none"),
    background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    "::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "4px",
      height: "100%",
      backgroundColor: "#0118D8",
    },
  },

  feedbackBadge: {
    display: "inline-flex",
    alignItems: "center",
    columnGap: "6px",
    backgroundColor: "#FFFFFF",
    ...shorthands.padding("4px", "12px"),
    ...shorthands.borderRadius("99px"),
    ...shorthands.border("1px", "solid", "rgba(1, 24, 216, 0.1)"),
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#0118D8",
    marginBottom: "16px",
  },

  feedbackContent: {
    fontSize: "1rem",
    color: "#334155",
    lineHeight: 1.7,
    fontWeight: 400,
  },

  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "16px",
  },

  chartWrapper: {
    width: "100%",
    height: "300px",
  },

  sectionHeaderRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
    marginBottom: "12px",
  },

  sectionIconCircleGreen: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#ECFDF3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionIconCircleOrange: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#FFFBEB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  bulletList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    rowGap: "12px",
  },

  bulletItem: {
    display: "flex",
    columnGap: "8px",
  },

  bulletIcon: {
    marginTop: "4px",
    flexShrink: 0,
  },

  bulletTitle: {
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#0B1220",
    marginBottom: "2px",
  },

  bulletText: {
    fontSize: "0.85rem",
    color: "#5B6475",
  },

  statusRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginTop: "8px",
  },

  statusPillBase: {
    fontSize: "0.75rem",
    padding: "4px 10px",
    borderRadius: "999px",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statusPillGreen: {
    backgroundColor: "#e3ffeeff",
    color: "#1a5a28ff",
  },

  statusPillBlue: {
    backgroundColor: "#d9e5ffff",
    color: "#072bf5ff",
  },

  transcriptCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    backgroundColor: "#FFFFFF",
    padding: 0,
  },

  transcriptHeader: {
    padding: "16px 20px",
    ...shorthands.borderBottom("1px", "solid", "rgba(2,6,23,0.08)"),
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
  },

  transcriptHeaderIcon: {
    color: "#0118D8",
  },

  transcriptBody: {
    padding: "16px 20px",
    maxHeight: "380px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    rowGap: "16px",
  },

  transcriptRow: {
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
  },

  transcriptMessageRow: {
    display: "flex",
    columnGap: "10px",
  },

  avatarSmall: {
    width: "32px",
    height: "32px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "0.75rem",
    fontWeight: 500,
  },

  avatarAi: {
    backgroundColor: "#E9DFC3",
    color: "#111827",
  },

  avatarCandidate: {
    background: "linear-gradient(to bottom right, #0118D8, #1B56FD)",
    color: "#FFFFFF",
  },

  transcriptMeta: {
    fontSize: "0.75rem",
    color: "#6B7280",
  },

  transcriptText: {
    fontSize: "0.9rem",
    color: "#0B1220",
    marginTop: "4px",
  },

  transcriptBubble: {
    backgroundColor: "#F3F4F6",
    ...shorthands.borderRadius("12px"),
    padding: "10px 12px",
  },

  recommendationCard: {
    ...shorthands.borderRadius("18px"),
    ...shorthands.border("2px", "solid", "#0118D8"),
    background: "linear-gradient(to right, #EFF6FF, #FFFFFF)",
    padding: "20px 24px",
  },

  recommendationRow: {
    display: "flex",
    columnGap: "16px",
    alignItems: "flex-start",
  },

  recommendationIconCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "999px",
    backgroundColor: "#0118D8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  recommendationTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "8px",
  },

  recommendationText: {
    fontSize: "0.9rem",
    color: "#4B5563",
    marginBottom: "12px",
  },

  recommendationButtonsRow: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: "8px",
    rowGap: "8px",
  },

  shortlistButton: {
    backgroundColor: "#16A34A",
    color: "#FFFFFF",
    ":hover": {
      backgroundColor: "#15803D",
      color: "#FFFFFF",
    },
  },

  scheduleButton: {
    ":hover": {
      backgroundColor: "#E9DFC3",
    },
  },

  rejectButton: {
    ...shorthands.border("1px", "solid", "#FCA5A5"),
    color: "#DC2626",
    ":hover": {
      backgroundColor: "#FEF2F2",
    },
  },

  highlightCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    padding: "20px",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    rowGap: "12px",
    transition: "transform 0.2s ease-in-out",
    ":hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    },
  },
  highlightIconCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  highlightTypeQuestion: {
    backgroundColor: "#F0F9FF",
    color: "#0284C7",
  },
  highlightTypeAnswer: {
    backgroundColor: "#F0FDF4",
    color: "#16A34A",
  },
  highlightLabel: {
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#64748B",
  },
});

export function InterviewAnalytics({ onNavigate }: InterviewAnalyticsProps) {
  const styles = useStyles();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [updating, setUpdating] = useState(false);
  const handleStatusUpdate = async (newStatus: string) => {
    const appId = data?.applicationId || location.state?.applicationId;
    if (!appId) {
      alert("Application ID not found. Cannot update status.");
      return;
    }

    setUpdating(true);
    try {
      await api(`/api/applications/${appId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ hiringStatus: newStatus }),
      });
      alert(`Candidate status updated to ${newStatus}`);
    } catch (e) {
      console.error("Failed to update status", e);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadReport = () => {
    if (!data) return;
    const reportText = `
Interview Analytics Report
--------------------------
Candidate: ${data.candidateName || "N/A"}
Email: ${data.candidateEmail || "N/A"}
Job: ${data.jobTitle || "N/A"}
Date: ${new Date(data.createdAt).toLocaleDateString()}
Overall Score: ${data.overallScore}%
Feedback Summary:
${data.feedback}
Skills Breakdown:
${data.skills?.map((s) => `- ${s.skill}: ${s.score}%`).join("\n") || "No skills recorded."}
Key Strengths:
${data.strengths?.map((s) => `- ${s.title}: ${s.description}`).join("\n") || "No strengths recorded."}
Areas for Improvement:
${data.improvements?.map((s) => `- ${s.title}: ${s.description}`).join("\n") || "No improvements recorded."}
Interview Highlights:
${data.transcript?.map((t) => `[${t.role.toUpperCase()}] ${t.content}`).join("\n\n") || "No transcript available."}
    `.trim();

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Interview_Report_${data.candidateName?.replace(/\s+/g, "_") || "Candidate"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    (async () => {
      try {
        const state = (location.state || {}) as {
          applicationId?: string;
          jobId?: string;
          candidateId?: string;
        };
        const applicationId = state.applicationId;
        const jobId = state.jobId;
        const candidateId = state.candidateId;

        let url = "/api/ai/analytics";
        if (applicationId) {
          url = `/api/ai/interview/result/${applicationId}`;
        } else if (jobId && candidateId) {
          url = `/api/ai/analytics?jobId=${jobId}&candidateId=${candidateId}`;
        }

        const res = await api<AnalyticsData | { results: AnalyticsData[] }>(
          url,
        );

        let resultData: AnalyticsData;
        if ("results" in res && Array.isArray(res.results)) {
          resultData = res.results[0];
        } else {
          resultData = res as AnalyticsData;
        }

        if (!resultData.applicationId && applicationId) {
          resultData.applicationId = applicationId;
        }

        setData(resultData);
      } catch (e) {
        console.error("Failed to fetch analytics", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [location.state]);

  if (loading) {
    return (
      <div
        className={styles.root}
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <Spinner label="Loading analytics..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.root}>
        <div className={styles.headerRow}>
          <Button
            appearance="subtle"
            size="small"
            onClick={() => onNavigate("applicants")}
            icon={<ArrowLeft20Regular />}
            className={styles.backButton}
          />
          <div className={styles.headerTitleBlock}>
            <span className={styles.headerTitle}>Interview Analytics</span>
          </div>
        </div>
        <Card className={styles.candidateCard}>
          <div style={{ textAlign: "center", color: "#6B7280" }}>
            No interview data found for this session.
          </div>
        </Card>
      </div>
    );
  }

  const {
    overallScore,
    feedback,
    skills,
    strengths,
    improvements,
    jobTitle,
    createdAt,
  } = data;
  const dateStr = new Date(createdAt).toLocaleDateString();

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <Button
          appearance="subtle"
          size="small"
          onClick={() => onNavigate("applicants")}
          icon={<ArrowLeft20Regular />}
          className={styles.backButton}
        />
        <div className={styles.headerTitleBlock}>
          <span className={styles.headerTitle}>Interview Analytics</span>
          <span className={styles.headerSubtitle}>
            Detailed analysis of candidate&apos;s AI interview performance
          </span>
        </div>
        <div className={styles.headerActions}>
          <Button
            appearance="outline"
            className={styles.downloadButton}
            onClick={handleDownloadReport}
          >
            Download Report
          </Button>
          <Button
            appearance="primary"
            className={styles.primaryGreenButton}
            icon={<CheckmarkCircle20Regular />}
            onClick={() => handleStatusUpdate("HIRED")}
            disabled={updating}
          >
            Mark as Hired
          </Button>
        </div>
      </div>

      <Card className={styles.candidateCard}>
        <div className={styles.candidateRow}>
          <div className={styles.candidateAvatar}>
            {data.candidateName
              ? data.candidateName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "SC"}
          </div>

          <div className={styles.candidateMain}>
            <div className={styles.candidateHeaderRow}>
              <div>
                <div className={styles.candidateName}>
                  {data.candidateName || "Candidate"}
                </div>
                <div className={styles.candidateMetaRow}>
                  <div className={styles.metaItem}>
                    <Mail20Regular />
                    <span>
                      {data.candidateEmail || "candidate@example.com"}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <Briefcase20Regular />
                    <span>{jobTitle}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <CalendarLtr20Regular />
                    <span>Interviewed on {dateStr}</span>
                  </div>
                </div>
              </div>

              <div className={styles.overallScoreBox}>
                <div className={styles.overallScoreValue}>{overallScore}%</div>
                <div className={styles.overallScoreLabel}>Overall Score</div>
              </div>
            </div>

            <div className={styles.candidateBadgesRow}>
              {strengths?.slice(0, 3).map((s: StrengthItem, i: number) => (
                <Badge key={i} className={styles.badgeStrong}>
                  {s.title}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className={styles.twoColumnGrid}>
        <Card className={styles.sectionCard}>
          <div className={styles.sectionTitle}>Skills Assessment</div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={skills || []}
              >
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#2563EB"
                  fill="#3B82F6"
                  fillOpacity={0.8}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "none",
                    borderRadius: 8,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className={styles.feedbackCard}>
          <div className={styles.feedbackBadge}>
            <ChatMultiple20Regular />
            <span>AI ANALYSIS INSIGHTS</span>
          </div>
          <div className={styles.sectionTitle} style={{ marginBottom: "12px" }}>
            Executive Summary
          </div>
          <p className={styles.feedbackContent}>{feedback}</p>
        </Card>
      </div>

      {data.highlights && data.highlights.length > 0 && (
        <>
          <div
            className={styles.sectionTitle}
            style={{ marginTop: "8px", marginBottom: "4px" }}
          >
            Interview Highlights
          </div>
          <div className={styles.twoColumnGrid}>
            {data.highlights.map(
              (
                h: { type: string; label: string; content: string },
                idx: number,
              ) => (
                <div key={idx} className={styles.highlightCard}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      columnGap: "12px",
                    }}
                  >
                    <div
                      className={`${styles.highlightIconCircle} ${h.type === "question" ? styles.highlightTypeQuestion : styles.highlightTypeAnswer}`}
                    >
                      {h.type === "question" ? (
                        <ChatMultiple20Regular />
                      ) : (
                        <CheckmarkCircle20Regular />
                      )}
                    </div>
                    <div>
                      <div className={styles.highlightLabel}>
                        {h.type === "question"
                          ? "Mandatory Question"
                          : "Exceptional Answer"}
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#1E293B",
                          fontSize: "0.95rem",
                        }}
                      >
                        {h.label}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#475569",
                      fontStyle: "italic",
                      lineHeight: 1.5,
                    }}
                  >
                    "{h.content}"
                  </div>
                </div>
              ),
            )}
          </div>
        </>
      )}

      <div className={styles.twoColumnGrid}>
        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeaderRow}>
            <div className={styles.sectionIconCircleGreen}>
              <ArrowTrending20Regular style={{ color: "#16A34A" }} />
            </div>
            <div className={styles.sectionTitle}>Key Strengths</div>
          </div>
          <ul className={styles.bulletList}>
            {strengths?.map((item: StrengthItem, idx: number) => (
              <li key={idx} className={styles.bulletItem}>
                <div className={styles.bulletIcon}>
                  <CheckmarkCircle20Regular style={{ color: "#16A34A" }} />
                </div>
                <div>
                  <div className={styles.bulletTitle}>{item.title}</div>
                  <div className={styles.bulletText}>{item.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeaderRow}>
            <div className={styles.sectionIconCircleOrange}>
              <ArrowTrendingDownRegular style={{ color: "#EA580C" }} />
            </div>
            <div className={styles.sectionTitle}>Areas for Improvement</div>
          </div>
          <ul className={styles.bulletList}>
            {improvements?.map((item: ImprovementItem, idx: number) => (
              <li key={idx} className={styles.bulletItem}>
                <div className={styles.bulletIcon}>
                  <Warning20Regular style={{ color: "#EA580C" }} />
                </div>
                <div>
                  <div className={styles.bulletTitle}>{item.title}</div>
                  <div className={styles.bulletText}>{item.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className={styles.transcriptCard}>
        <div className={styles.transcriptHeader}>
          <ChatMultiple20Regular className={styles.transcriptHeaderIcon} />
          <span className={styles.sectionTitle}>Interview Highlights</span>
        </div>

        <div className={styles.transcriptBody}>
          {data.transcript && data.transcript.length > 0 ? (
            data.transcript.map((msg, idx) => (
              <div key={idx} className={styles.transcriptRow}>
                <div className={styles.transcriptMessageRow}>
                  <div
                    className={`${styles.avatarSmall} ${msg.role === "ai" ? styles.avatarAi : styles.avatarCandidate}`}
                  >
                    {msg.role === "ai"
                      ? "AI"
                      : data.candidateName
                        ? data.candidateName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "C"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={styles.transcriptMeta}>
                      {new Date(msg.ts).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {msg.role === "candidate" ? (
                      <div className={styles.transcriptBubble}>
                        <div className={styles.transcriptText}>
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className={styles.transcriptText}>{msg.content}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{ textAlign: "center", color: "#6B7280", padding: "20px" }}
            >
              No transcript available for this session.
            </div>
          )}
        </div>
      </Card>

      <Card className={styles.recommendationCard}>
        <div className={styles.recommendationRow}>
          <div className={styles.recommendationIconCircle}>
            <CheckmarkCircle20Regular
              style={{ color: "#FFFFFF", fontSize: 22 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div className={styles.recommendationTitle}>
              AI Recommendation: Strong Hire
            </div>
            <div className={styles.recommendationText}>
              Based on the comprehensive analysis of technical skills,
              problem-solving abilities, and communication, Sarah Chen
              demonstrates exceptional qualifications for the Senior Frontend
              Developer role. The candidate shows strong expertise in the React
              ecosystem, a systematic problem-solving approach, and clear
              communication skills. While there&apos;s room for growth in system
              design, the overall profile indicates a strong potential for
              success in this position.
            </div>
            <div className={styles.recommendationButtonsRow}>
              <Button
                appearance="primary"
                className={styles.shortlistButton}
                onClick={() => handleStatusUpdate("SHORTLISTED")}
                disabled={updating}
              >
                Move to Shortlist
              </Button>
              <Button
                appearance="outline"
                className={styles.scheduleButton}
                onClick={() => handleStatusUpdate("INVITED")}
                disabled={updating}
              >
                Schedule Follow-up
              </Button>
              <Button
                appearance="outline"
                className={styles.rejectButton}
                onClick={() => handleStatusUpdate("REJECTED")}
                disabled={updating}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
