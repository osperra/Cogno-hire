import { useMemo } from "react";
import {
  Card,
  Button,
  Avatar,
  Badge,
  ProgressBar,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import {
  PeopleAudience20Regular,
  ArrowTrending20Regular,
  Filter20Regular,
  MoreVerticalRegular,
  Mail20Regular,
  Call20Regular,
  CalendarLtr20Regular,
  ChevronRight20Regular,
} from "@fluentui/react-icons";

const pipelineStages = [
  { name: "Applied", count: 156, color: "#6B7280" },
  { name: "Screening", count: 89, color: "#2563EB" },
  { name: "Interview", count: 42, color: "#7C3AED" },
  { name: "Offer", count: 18, color: "#F97316" },
  { name: "Hired", count: 12, color: "#16A34A" },
];

const candidates = {
  screening: [
    { id: 1, name: "Sarah Chen", role: "Senior Frontend Dev", score: 95, avatar: "SC" },
    { id: 2, name: "Mike Rodriguez", role: "Product Designer", score: 88, avatar: "MR" },
    { id: 3, name: "Emily Watson", role: "Backend Engineer", score: 92, avatar: "EW" },
  ],
  interview: [
    { id: 4, name: "John Smith", role: "DevOps Engineer", score: 87, avatar: "JS" },
    { id: 5, name: "Lisa Park", role: "Data Scientist", score: 91, avatar: "LP" },
  ],
  offer: [
    { id: 6, name: "David Kim", role: "Full Stack Dev", score: 94, avatar: "DK" },
  ],
};

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
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: "16px",
  },
  headerTitleBlock: {
    display: "flex",
    flexDirection: "column",
    rowGap: "2px",
  },
  headerTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#0B1220",
  },
  headerSubtitle: {
    fontSize: "0.85rem",
    color: "#5B6475",
  },
  headerActions: {
    display: "flex",
    columnGap: "8px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    rowGap: "16px",
    columnGap: "16px",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
  },
  statCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    padding: "18px 20px",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "#5B6475",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: 600,
    color: "#0B1220",
  },
  statIconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  funnelCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    padding: "18px 20px 20px",
  },
  funnelTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "16px",
  },
  funnelStageRow: {
    position: "relative",
    marginBottom: "16px",
  },
  funnelStageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  funnelStageLeft: {
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
  },
  stageName: {
    fontSize: "0.85rem",
    fontWeight: 500,
    color: "#0B1220",
  },
  stageCountBadge: {
    backgroundColor: "#F9FAFB",
    color: "#4B5563",
    fontSize: "0.7rem",
    ...shorthands.border("1px", "solid", "rgba(148,163,184,0.4)"),
  },
  stagePercent: {
    fontSize: "0.78rem",
    color: "#5B6475",
  },
  funnelBar: {
    height: "64px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: "18px",
    color: "#ffffff",
    boxShadow: "0 10px 24px rgba(15,23,42,0.25)",
    cursor: "pointer",
    transitionProperty: "box-shadow, transform",
    transitionDuration: "200ms",
    ":hover": {
      boxShadow: "0 14px 32px rgba(15,23,42,0.32)",
      transform: "translateY(-1px)",
    },
  },
  funnelBarValue: {
    fontSize: "1.4rem",
    fontWeight: 600,
  },
  funnelChevronOverlay: {
    position: "absolute",
    right: "-22px",
    top: "50%",
    transform: "translateY(10px)",
    zIndex: 1,
  },

  candidatesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    rowGap: "16px",
    columnGap: "16px",
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
  },
  stageColumnCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  stageColumnHeader: {
    padding: "12px 14px",
    borderBottom: "1px solid rgba(2,6,23,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stageColumnTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#0B1220",
  },
  stageColumnBadge: {
    border: "none",
    fontSize: "0.75rem",
    color: "#FFFFFF",
  },
  stageColumnBody: {
    padding: "12px 14px 14px",
    display: "flex",
    flexDirection: "column",
    rowGap: "10px",
  },

  candidateCard: {
    ...shorthands.borderRadius("12px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    padding: "10px 12px 12px",
    boxShadow: "0 1px 0 rgba(15,23,42,0.02)",
    transitionProperty: "box-shadow, transform",
    transitionDuration: "150ms",
    cursor: "pointer",
    backgroundColor: "#FFFFFF",
    ":hover": {
      boxShadow: "0 6px 18px rgba(15,23,42,0.10)",
      transform: "translateY(-1px)",
    },
  },
  candidateHeaderRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "10px",
    marginBottom: "8px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  avatarGradientBlue: {
    backgroundImage: "linear-gradient(to bottom right,#0118D8,#1B56FD)",
    color: "#ffffff",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
  },
  avatarGradientPurple: {
    backgroundImage: "linear-gradient(to bottom right,#7C3AED,#EC4899)",
    color: "#ffffff",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
  },
  avatarGradientGreen: {
    backgroundImage: "linear-gradient(to bottom right,#16A34A,#22C55E)",
    color: "#ffffff",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
  },
  candidateName: {
    fontSize: "0.85rem",
    fontWeight: 500,
    color: "#0B1220",
  },
  candidateRole: {
    fontSize: "0.75rem",
    color: "#5B6475",
  },
  candidateMoreButton: {
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ":hover": {
      backgroundColor: "#F3F4F6",
    },
  },
  candidateLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  candidateLabel: {
    fontSize: "0.72rem",
    color: "#6B7280",
  },
  candidateScoreBlue: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#0118D8",
  },
  candidateScorePurple: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#7C3AED",
  },
  candidateScoreGreen: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#16A34A",
  },

  progressBar: {
    marginBottom: "8px",
    height: "6px",
    borderRadius: "999px",
  },

  candidateActionsRow: {
    display: "flex",
    columnGap: "8px",
  },
  softButton: {
    flex: 1,
    height: "28px",
    borderRadius: "8px",
    border: "1px solid rgba(2,6,23,0.12)",
    backgroundColor: "#FFFFFF",
    fontSize: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: "4px",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#F3F4F6",
    },
  },
  softButtonEmphasis: {
    flex: 1,
    height: "28px",
    borderRadius: "8px",
    border: "1px solid rgba(147,51,234,0.4)",
    backgroundColor: "rgba(233,213,255,0.45)",
    fontSize: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: "4px",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "rgba(221,214,254,0.7)",
    },
  },
  primaryFullButton: {
    width: "100%",
    marginTop: "4px",
    backgroundColor: "#16A34A",
    color: "#FFFFFF",
    borderRadius: "8px",
    border: "none",
    height: "30px",
    fontSize: "0.8rem",
    fontWeight: 500,
    ":hover": {
      backgroundColor: "#15803D",
      color: "#FFFFFF",
    },
  },
});

export function CandidatePipeline() {
  const styles = useStyles();

  const totalCandidates = useMemo(
    () => pipelineStages.reduce((sum, stage) => sum + stage.count, 0),
    []
  );
  const conversionRate = useMemo(
    () => ((pipelineStages[4].count / pipelineStages[0].count) * 100).toFixed(1),
    []
  );

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleBlock}>
          <span className={styles.headerTitle}>Candidate Pipeline</span>
          <span className={styles.headerSubtitle}>
            Visual funnel of candidates through the hiring process
          </span>
        </div>
        <div className={styles.headerActions}>
          <Button appearance="outline" icon={<Filter20Regular />}>
            Filter
          </Button>
          <Button appearance="outline">Export Report</Button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statRow}>
            <div>
              <div className={styles.statLabel}>Total Candidates</div>
              <div className={styles.statValue}>{totalCandidates}</div>
            </div>
            <div
              className={styles.statIconBox}
              style={{ backgroundColor: "#EFF6FF" }}
            >
              <PeopleAudience20Regular
                style={{ width: 24, height: 24, color: "#0118D8" }}
              />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statRow}>
            <div>
              <div className={styles.statLabel}>Conversion Rate</div>
              <div className={styles.statValue}>{conversionRate}%</div>
            </div>
            <div
              className={styles.statIconBox}
              style={{ backgroundColor: "#ECFDF3" }}
            >
              <ArrowTrending20Regular
                style={{ width: 24, height: 24, color: "#16A34A" }}
              />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statRow}>
            <div>
              <div className={styles.statLabel}>Avg Time to Hire</div>
              <div className={styles.statValue}>18 days</div>
            </div>
            <div
              className={styles.statIconBox}
              style={{ backgroundColor: "#F5F3FF" }}
            >
              <CalendarLtr20Regular
                style={{ width: 24, height: 24, color: "#7C3AED" }}
              />
            </div>
          </div>
        </Card>
      </div>

      <Card className={styles.funnelCard}>
        <div className={styles.funnelTitle}>Hiring Funnel</div>
        <div>
          {pipelineStages.map((stage, index) => {
            const percentage = (stage.count / totalCandidates) * 100;
            const widthPercent = 100 - index * 15;

            return (
              <div key={stage.name} className={styles.funnelStageRow}>
                <div className={styles.funnelStageHeader}>
                  <div className={styles.funnelStageLeft}>
                    <span className={styles.stageName}>{stage.name}</span>
                    <Badge
                      appearance="outline"
                      className={styles.stageCountBadge}
                    >
                      {stage.count}
                    </Badge>
                  </div>
                  <span className={styles.stagePercent}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>

                <div
                  className={styles.funnelBar}
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: stage.color,
                  }}
                >
                  <span className={styles.funnelBarValue}>{stage.count}</span>
                  <ChevronRight20Regular style={{ width: 24, height: 24 }} />
                </div>

                {index < pipelineStages.length - 1 && (
                  <div className={styles.funnelChevronOverlay}>
                    <ChevronRight20Regular
                      style={{ width: 28, height: 28, color: "#D1D5DB" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className={styles.candidatesGrid}>
        <Card className={styles.stageColumnCard}>
          <div
            className={styles.stageColumnHeader}
            style={{
              background:
                "linear-gradient(to right, rgba(59,130,246,0.08), transparent)",
            }}
          >
            <span className={styles.stageColumnTitle}>
              Screening ({candidates.screening.length})
            </span>
            <Badge
              appearance="filled"
              className={styles.stageColumnBadge}
              style={{ backgroundColor: "#2563EB" }}
            >
              {candidates.screening.length}
            </Badge>
          </div>

          <div className={styles.stageColumnBody}>
            {candidates.screening.map((candidate) => (
              <div key={candidate.id} className={styles.candidateCard}>
                <div className={styles.candidateHeaderRow}>
                  <Avatar className={styles.avatar}>
                    <span className={styles.avatarGradientBlue}>
                      {candidate.avatar}
                    </span>
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={styles.candidateName}>
                      {candidate.name}
                    </div>
                    <div className={styles.candidateRole}>
                      {candidate.role}
                    </div>
                  </div>
                  <button className={styles.candidateMoreButton}>
                    <MoreVerticalRegular
                      style={{ width: 16, height: 16, color: "#6B7280" }}
                    />
                  </button>
                </div>

                <div className={styles.candidateLabelRow}>
                  <span className={styles.candidateLabel}>Match Score</span>
                  <span className={styles.candidateScoreBlue}>
                    {candidate.score}%
                  </span>
                </div>

                <ProgressBar
                  value={candidate.score}
                  max={100}
                  className={styles.progressBar}
                />

                <div className={styles.candidateActionsRow}>
                  <button className={styles.softButton}>
                    <Mail20Regular style={{ width: 12, height: 12 }} />
                    <span>Email</span>
                  </button>
                  <button className={styles.softButton}>
                    <Call20Regular style={{ width: 12, height: 12 }} />
                    <span>Call</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className={styles.stageColumnCard}>
          <div
            className={styles.stageColumnHeader}
            style={{
              background:
                "linear-gradient(to right, rgba(124,58,237,0.08), transparent)",
            }}
          >
            <span className={styles.stageColumnTitle}>
              Interview ({candidates.interview.length})
            </span>
            <Badge
              appearance="filled"
              className={styles.stageColumnBadge}
              style={{ backgroundColor: "#7C3AED" }}
            >
              {candidates.interview.length}
            </Badge>
          </div>

          <div className={styles.stageColumnBody}>
            {candidates.interview.map((candidate) => (
              <div key={candidate.id} className={styles.candidateCard}>
                <div className={styles.candidateHeaderRow}>
                  <Avatar className={styles.avatar}>
                    <span className={styles.avatarGradientPurple}>
                      {candidate.avatar}
                    </span>
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={styles.candidateName}>
                      {candidate.name}
                    </div>
                    <div className={styles.candidateRole}>
                      {candidate.role}
                    </div>
                  </div>
                  <button className={styles.candidateMoreButton}>
                    <MoreVerticalRegular
                      style={{ width: 16, height: 16, color: "#6B7280" }}
                    />
                  </button>
                </div>

                <div className={styles.candidateLabelRow}>
                  <span className={styles.candidateLabel}>Match Score</span>
                  <span className={styles.candidateScorePurple}>
                    {candidate.score}%
                  </span>
                </div>

                <ProgressBar
                  value={candidate.score}
                  max={100}
                  className={styles.progressBar}
                />

                <div className={styles.candidateActionsRow}>
                  <button className={styles.softButton}>
                    <CalendarLtr20Regular style={{ width: 12, height: 12 }} />
                    <span>Schedule</span>
                  </button>
                  <button className={styles.softButtonEmphasis}>
                    <span>View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className={styles.stageColumnCard}>
          <div
            className={styles.stageColumnHeader}
            style={{
              background:
                "linear-gradient(to right, rgba(34,197,94,0.08), transparent)",
            }}
          >
            <span className={styles.stageColumnTitle}>
              Offer ({candidates.offer.length})
            </span>
            <Badge
              appearance="filled"
              className={styles.stageColumnBadge}
              style={{ backgroundColor: "#16A34A" }}
            >
              {candidates.offer.length}
            </Badge>
          </div>

          <div className={styles.stageColumnBody}>
            {candidates.offer.map((candidate) => (
              <div key={candidate.id} className={styles.candidateCard}>
                <div className={styles.candidateHeaderRow}>
                  <Avatar className={styles.avatar}>
                    <span className={styles.avatarGradientGreen}>
                      {candidate.avatar}
                    </span>
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={styles.candidateName}>
                      {candidate.name}
                    </div>
                    <div className={styles.candidateRole}>
                      {candidate.role}
                    </div>
                  </div>
                  <button className={styles.candidateMoreButton}>
                    <MoreVerticalRegular
                      style={{ width: 16, height: 16, color: "#6B7280" }}
                    />
                  </button>
                </div>

                <div className={styles.candidateLabelRow}>
                  <span className={styles.candidateLabel}>Match Score</span>
                  <span className={styles.candidateScoreGreen}>
                    {candidate.score}%
                  </span>
                </div>

                <ProgressBar
                  value={candidate.score}
                  max={100}
                  className={styles.progressBar}
                />

                <Button
                  appearance="primary"
                  className={styles.primaryFullButton}
                >
                  Send Offer
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
