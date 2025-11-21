import {
  Button,
  Card,
  Badge,
  makeStyles,
  shorthands,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

interface InterviewAnalyticsProps {
  onNavigate: (page: string) => void;
}

const skillsData = [
  { skill: "React", score: 90 },
  { skill: "TypeScript", score: 85 },
  { skill: "Problem Solving", score: 88 },
  { skill: "Communication", score: 82 },
  { skill: "System Design", score: 78 },
];

const competencyData = [
  { category: "Technical", score: 87 },
  { category: "Problem Solving", score: 90 },
  { category: "Communication", score: 82 },
  { category: "Collaboration", score: 85 },
  { category: "Creativity", score: 78 },
];

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    rowGap: "16px",
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

  // Candidate header card
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

  // Layout
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

  // Strengths / Improvements
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

  // Status pills (for answers)
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

  // Recommendation
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

  return (
    <div className={styles.root}>
      {/* Header */}
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

      {/* Candidate summary */}
      <Card className={styles.candidateCard}>
        <div className={styles.candidateRow}>
          <div className={styles.candidateAvatar}>SC</div>

          <div className={styles.candidateMain}>
            <div className={styles.candidateHeaderRow}>
              <div>
                <div className={styles.candidateName}>Sarah Chen</div>
                <div className={styles.candidateMetaRow}>
                  <div className={styles.metaItem}>
                    <Mail20Regular />
                    <span>sarah.chen@email.com</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Briefcase20Regular />
                    <span>Senior Frontend Developer</span>
                  </div>
                  <div className={styles.metaItem}>
                    <CalendarLtr20Regular />
                    <span>Interviewed on Jan 15, 2025</span>
                  </div>
                </div>
              </div>

              <div className={styles.overallScoreBox}>
                <div className={styles.overallScoreValue}>87%</div>
                <div className={styles.overallScoreLabel}>Overall Score</div>
              </div>
            </div>

            <div className={styles.candidateBadgesRow}>
              <Badge className={styles.badgeStrong}>
                Strong Technical Skills
              </Badge>
              <Badge className={styles.badgeBlue}>
                Excellent Problem Solver
              </Badge>
              <Badge className={styles.badgeNeutral}>Good Communication</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className={styles.twoColumnGrid}>
        <Card className={styles.sectionCard}>
          <div className={styles.sectionTitle}>Skills Breakdown</div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={skillsData}
                margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="skill" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(2,6,23,0.08)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="score" fill="#0118D8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className={styles.sectionCard}>
          <div className={styles.sectionTitle}>Competency Analysis</div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={competencyData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#0118D8"
                  fill="#0118D8"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Strengths / Weaknesses */}
      <div className={styles.twoColumnGrid}>
        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeaderRow}>
            <div className={styles.sectionIconCircleGreen}>
              <ArrowTrending20Regular style={{ color: "#16A34A" }} />
            </div>
            <div className={styles.sectionTitle}>Key Strengths</div>
          </div>
          <ul className={styles.bulletList}>
            <li className={styles.bulletItem}>
              <div className={styles.bulletIcon}>
                <CheckmarkCircle20Regular style={{ color: "#16A34A" }} />
              </div>
              <div>
                <div className={styles.bulletTitle}>
                  Exceptional React expertise
                </div>
                <div className={styles.bulletText}>
                  Demonstrated deep knowledge of React hooks, performance
                  optimization, and modern patterns.
                </div>
              </div>
            </li>
            <li className={styles.bulletItem}>
              <div className={styles.bulletIcon}>
                <CheckmarkCircle20Regular style={{ color: "#16A34A" }} />
              </div>
              <div>
                <div className={styles.bulletTitle}>
                  Strong problem-solving approach
                </div>
                <div className={styles.bulletText}>
                  Showed excellent analytical thinking and a systematic approach
                  to complex problems.
                </div>
              </div>
            </li>
            <li className={styles.bulletItem}>
              <div className={styles.bulletIcon}>
                <CheckmarkCircle20Regular style={{ color: "#16A34A" }} />
              </div>
              <div>
                <div className={styles.bulletTitle}>
                  Clear communication style
                </div>
                <div className={styles.bulletText}>
                  Articulated thoughts clearly and explained technical concepts
                  effectively.
                </div>
              </div>
            </li>
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
            <li className={styles.bulletItem}>
              <div className={styles.bulletIcon}>
                <Warning20Regular style={{ color: "#EA580C" }} />
              </div>
              <div>
                <div className={styles.bulletTitle}>
                  System design experience
                </div>
                <div className={styles.bulletText}>
                  Could benefit from more exposure to large-scale system
                  architecture and trade-off decisions.
                </div>
              </div>
            </li>
            <li className={styles.bulletItem}>
              <div className={styles.bulletIcon}>
                <Warning20Regular style={{ color: "#EA580C" }} />
              </div>
              <div>
                <div className={styles.bulletTitle}>Backend knowledge</div>
                <div className={styles.bulletText}>
                  Limited experience with backend technologies and API design.
                </div>
              </div>
            </li>
          </ul>
        </Card>
      </div>

      {/* Interview Highlights (scrollable) */}
      <Card className={styles.transcriptCard}>
        <div className={styles.transcriptHeader}>
          <ChatMultiple20Regular className={styles.transcriptHeaderIcon} />
          <span className={styles.sectionTitle}>Interview Highlights</span>
        </div>

        <div className={styles.transcriptBody}>
          {/* Q1 */}
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

          {/* A1 */}
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

          {/* Q2 */}
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

          {/* A2 */}
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

      {/* Recommendation */}
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
