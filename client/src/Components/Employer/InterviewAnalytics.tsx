import { useEffect, useState } from "react";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../../api/http";

interface InterviewAnalyticsProps {
  onNavigate: (page: string) => void;
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
});

export function InterviewAnalytics({ onNavigate }: InterviewAnalyticsProps) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<any>("/api/ai/analytics");
        setData(res);
      } catch (e) {
        console.error("Failed to fetch analytics", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className={styles.root} style={{ alignItems: "center", justifyContent: "center" }}>
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
            onClick={() => onNavigate("Applicants")}
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

  // Use real data from "data" object
  const { overallScore, feedback, skills, strengths, improvements, jobTitle, createdAt } = data;

  const dateStr = new Date(createdAt).toLocaleDateString();

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <Button
          appearance="subtle"
          size="small"
          onClick={() => onNavigate("Applicants")}
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
          <Button appearance="outline" className={styles.downloadButton}>
            Download Report
          </Button>
          <Button
            appearance="primary"
            className={styles.primaryGreenButton}
            icon={<CheckmarkCircle20Regular />}
          >
            Mark as Hired
          </Button>
        </div>
      </div>

      <Card className={styles.candidateCard}>
        <div className={styles.candidateRow}>
          <div className={styles.candidateAvatar}>SC</div>

          <div className={styles.candidateMain}>
            <div className={styles.candidateHeaderRow}>
              <div>
                <div className={styles.candidateName}>Candidate</div>
                <div className={styles.candidateMetaRow}>
                  <div className={styles.metaItem}>
                    <Mail20Regular />
                    <span>candidate@example.com</span>
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
              {strengths?.slice(0, 3).map((s: any, i: number) => (
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
          <div className={styles.sectionTitle}>Skills Breakdown</div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={skills || []}
                layout="vertical"
                margin={{ top: 16, right: 16, left: 16, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="skill" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(2,6,23,0.08)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="score" fill="#0118D8" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className={styles.sectionCard}>
          <div className={styles.sectionTitle}>Feedback Summary</div>
          <p style={{ fontSize: "0.9rem", color: "#4B5563", lineHeight: 1.5 }}>
            {feedback}
          </p>
        </Card>
      </div>

      <div className={styles.twoColumnGrid}>
        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeaderRow}>
            <div className={styles.sectionIconCircleGreen}>
              <ArrowTrending20Regular style={{ color: "#16A34A" }} />
            </div>
            <div className={styles.sectionTitle}>Key Strengths</div>
          </div>
          <ul className={styles.bulletList}>
            {strengths?.map((item: any, idx: number) => (
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
            {improvements?.map((item: any, idx: number) => (
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
          <div className={styles.transcriptRow}>
            <div className={styles.transcriptMessageRow}>
              <div className={`${styles.avatarSmall} ${styles.avatarAi}`}>
                AI
              </div>
              <div style={{ flex: 1 }}>
                <div className={styles.transcriptMeta}>10:32 AM</div>
                <div className={styles.transcriptText}>
                  Can you explain how you would optimize a React application
                  that&apos;s experiencing performance issues?
                </div>
              </div>
            </div>
          </div>

          <div className={styles.transcriptRow}>
            <div className={styles.transcriptMessageRow}>
              <div
                className={`${styles.avatarSmall} ${styles.avatarCandidate}`}
              >
                SC
              </div>
              <div style={{ flex: 1 }}>
                <div className={styles.transcriptBubble}>
                  <div className={styles.transcriptMeta}>10:33 AM</div>
                  <div className={styles.transcriptText}>
                    I would start by using React DevTools Profiler to identify
                    which components are causing re-renders. Then I&apos;d apply
                    techniques like <code>React.memo</code> for component
                    memoization, <code>useMemo</code> for expensive
                    calculations, and <code>useCallback</code> for function
                    references. I&apos;d also consider code splitting with{" "}
                    <code>React.lazy</code> and <code>Suspense</code> to reduce
                    the initial bundle size. Finally, I&apos;d optimize any list
                    rendering with proper keys and virtualization if dealing
                    with large datasets.
                  </div>
                  <div className={styles.statusRow}>
                    <span
                      className={`${styles.statusPillBase} ${styles.statusPillGreen}`}
                    >
                      Excellent Answer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.transcriptRow}>
            <div className={styles.transcriptMessageRow}>
              <div className={`${styles.avatarSmall} ${styles.avatarAi}`}>
                AI
              </div>
              <div style={{ flex: 1 }}>
                <div className={styles.transcriptMeta}>10:35 AM</div>
                <div className={styles.transcriptText}>
                  Great answer! Now, can you describe a challenging bug
                  you&apos;ve encountered and how you resolved it?
                </div>
              </div>
            </div>
          </div>

          <div className={styles.transcriptRow}>
            <div className={styles.transcriptMessageRow}>
              <div
                className={`${styles.avatarSmall} ${styles.avatarCandidate}`}
              >
                SC
              </div>
              <div style={{ flex: 1 }}>
                <div className={styles.transcriptBubble}>
                  <div className={styles.transcriptMeta}>10:37 AM</div>
                  <div className={styles.transcriptText}>
                    One of the most challenging bugs was an intermittent state
                    issue in a complex form with nested components. The state
                    would occasionally not update correctly. After extensive
                    debugging, I discovered it was a closure issue with event
                    handlers that were capturing stale values. I resolved it by
                    restructuring the component hierarchy and using{" "}
                    <code>useCallback</code> with proper dependencies. This
                    taught me the importance of understanding React&apos;s
                    rendering lifecycle deeply.
                  </div>
                  <div className={styles.statusRow}>
                    <span
                      className={`${styles.statusPillBase} ${styles.statusPillBlue}`}
                    >
                      Good Answer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              <Button appearance="primary" className={styles.shortlistButton}>
                Move to Shortlist
              </Button>
              <Button appearance="outline" className={styles.scheduleButton}>
                Schedule Follow-up
              </Button>
              <Button appearance="outline" className={styles.rejectButton}>
                Reject
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
