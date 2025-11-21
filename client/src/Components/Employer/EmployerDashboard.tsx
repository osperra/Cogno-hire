import React from "react";
import {
  Button,
  Text,
  makeStyles,
  shorthands,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Dropdown,
  Option,
  mergeClasses,
} from "@fluentui/react-components";

import {
  Briefcase20Regular,
  People20Regular,
  Clock20Regular,
  CheckmarkCircle20Regular,
  DismissCircle20Regular,
  MoreVerticalRegular,
  Edit20Regular,
  Eye20Regular,
  Delete20Regular,
  FlashRegular,
  AddRegular,
  PersonAddRegular,
  ChartMultipleRegular,
  ArrowDownloadRegular,
  DocumentBulletListRegular,
} from "@fluentui/react-icons";

import { StatusPill } from "../layout/StatusPill";

interface EmployerDashboardProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
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

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    columnGap: "16px",
    rowGap: "16px",

    "@media (max-width: 1200px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    "@media (max-width: 768px)": {
      gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    },
  },

  statCard: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    ...shorthands.borderRadius("18px"),
    ...shorthands.border("1px", "solid", "rgba(148,163,184,0.25)"),
    padding: "16px 20px",
    boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
    display: "flex",
    alignItems: "center",

    ":hover": {
      transform: "scale(1.03)",
      boxShadow: "0 25px 55px rgba(15,23,42,0.12)",
    },

    ":hover .statMiniCard": {
      transform: "rotate(10deg) scale(1.06)",
      boxShadow: "0 10px 20px rgba(15,23,42,0.18)",
    },

    "@media (max-width: 480px)": {
      padding: "12px 14px",
    },
  },

  statHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    columnGap: "12px",
  },

  statTextBlock: {
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
  },

  statTitle: {
    fontSize: "0.8rem",
    color: "#6B7280",
    fontWeight: 500,

    "@media (max-width: 480px)": {
      fontSize: "0.75rem",
    },
  },

  statValue: {
    fontSize: "1.6rem",
    fontWeight: 600,
    color: "#020617",

    "@media (max-width: 480px)": {
      fontSize: "1.3rem",
    },
  },

  statSubtitlePositive: {
    fontSize: "0.75rem",
    color: "#16A34A",
    marginTop: "2px",

    "@media (max-width: 480px)": {
      fontSize: "0.7rem",
    },
  },

  statMiniCard: {
    width: "46px",
    height: "46px",
    ...shorthands.borderRadius("14px"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    cursor: "default",
    marginTop: "4px",

    ":hover": {
      transform: "rotate(10deg) scale(1.06)",
      boxShadow: "0 10px 20px rgba(15,23,42,0.18)",
    },

    "@media (max-width: 480px)": {
      width: "40px",
      height: "40px",
    },
  },

  statIconBlue: {
    backgroundColor: "#EEF2FF",
    color: "#1D4ED8",
  },

  statIconAmber: {
    backgroundColor: "#FFF7ED",
    color: "#EA580C",
  },

  statIconGreen: {
    backgroundColor: "#ECFDF5",
    color: "#16A34A",
  },

  statIconRed: {
    backgroundColor: "#FEF2F2",
    color: "#DC2626",
  },

  twoColumnRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
    columnGap: "16px",
    rowGap: "16px",
    alignItems: "flex-start",

    "@media (max-width: 1024px)": {
      gridTemplateColumns: "minmax(0, 1fr)",
    },
  },

  cardBase: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    backgroundColor: "#FFFFFF",

    "@media (max-width: 480px)": {
      ...shorthands.borderRadius("12px"),
    },
  },

  cardHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 24px",
    borderBottom: "1px solid rgba(2,6,23,0.08)",

    "@media (max-width: 480px)": {
      padding: "16px 16px",
    },
  },

  cardTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#0B1220",

    "@media (max-width: 480px)": {
      fontSize: "0.85rem",
    },
  },

  quickActionsBody: {
    padding: "16px 20px 18px 20px",
    display: "flex",
    flexDirection: "column",
    rowGap: "16px",
    backgroundColor: "#FFFFFF",
    ...shorthands.borderRadius("0 0 16px 16px"),

    "@media (max-width: 480px)": {
      padding: "12px 14px 14px 14px",
    },
  },

  quickActionsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    columnGap: "16px",
    rowGap: "16px",

    "@media (max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },

  quickActionTile: {
    backgroundColor: "rgba(252, 241, 241, 1)",
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(248,250,252,1)"),
    minHeight: "100px",
    padding: "16px 18px",
    display: "flex",
    columnGap: "16px",
    alignItems: "center",
    cursor: "pointer",
    transition: "background-color 0.18s ease",

    ":hover": {
      backgroundColor: "#F7F4D9",
    },

    "@media (max-width: 480px)": {
      padding: "12px 12px",
      minHeight: "80px",
    },
  },

  quickActionIconCircle: {
    width: "40px",
    height: "40px",
    ...shorthands.borderRadius("30%"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    flexShrink: 0,
    transition: "transform 0.25s ease",

    "@media (max-width: 480px)": {
      width: "34px",
      height: "34px",
    },
  },

  quickActionIconCircleHovered: {
    transform: "scale(1.15)",
  },

  quickActionTextTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "4px",

    "@media (max-width: 480px)": {
      fontSize: "0.85rem",
    },
  },

  quickActionTextSub: {
    fontSize: "0.8rem",
    color: "#6B7280",

    "@media (max-width: 480px)": {
      fontSize: "0.75rem",
    },
  },

  quickActionIconBlue: {
    backgroundColor: "#2563EB",
  },

  quickActionIconPurple: {
    backgroundColor: "#8B5CF6",
  },

  quickActionIconGreen: {
    backgroundColor: "#16A34A",
  },

  quickActionIconOrange: {
    backgroundColor: "#F97316",
  },

  activityBody: {
    padding: "16px 20px",
    backgroundColor: "#FFFFFF",
    ...shorthands.borderRadius("0 0 16px 16px"),
    display: "flex",
    flexDirection: "column",
    rowGap: "12px",

    "@media (max-width: 480px)": {
      padding: "12px 14px",
    },
  },

  activityItem: {
    display: "flex",
    alignItems: "center",
    columnGap: "12px",
    padding: "10px 8px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "background-color 0.18s ease",

    ":hover": {
      backgroundColor: "#FFFFFF",
    },

    ":hover .activityIcon": {
      transform: "scale(1.12)",
      boxShadow: "0 8px 18px rgba(15,23,42,0.15)",
    },
  },

  activityIconWrapper: {
    width: "40px",
    height: "40px",
    ...shorthands.borderRadius("14px"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    position: "relative",
    top: "-8px",

    "@media (max-width: 480px)": {
      width: "34px",
      height: "34px",
      top: "-6px",
    },
  },

  activityIconBlue: {
    backgroundColor: "#EEF2FF",
    color: "#2563EB",
  },

  activityIconGreen: {
    backgroundColor: "#ECFDF5",
    color: "#16A34A",
  },

  activityIconPurple: {
    backgroundColor: "#F5F3FF",
    color: "#8B5CF6",
  },

  activityIconOrange: {
    backgroundColor: "#FFF7ED",
    color: "#F97316",
  },

  activityTextBlock: {
    display: "flex",
    flexDirection: "column",
    rowGap: "2px",
  },

  activityTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#0B1220",

    "@media (max-width: 480px)": {
      fontSize: "0.85rem",
    },
  },

  activitySubtitle: {
    fontSize: "0.8rem",
    color: "#6B7280",

    "@media (max-width: 480px)": {
      fontSize: "0.75rem",
    },
  },

  activityMeta: {
    marginTop: "4px",
    fontSize: "0.75rem",
    color: "#9CA3AF",

    "@media (max-width: 480px)": {
      fontSize: "0.7rem",
    },
  },

  tableWrapper: {
    width: "100%",
    maxWidth: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    WebkitOverflowScrolling: "touch",
  },

  tableFull: {
    width: "100%",
    minWidth: "1000px",
  },

  tableHeaderRow: {
    background:
      "linear-gradient(to right, rgba(1,24,216,0.06), rgba(27,86,253,0.06))",
  },

  tableHeaderCell: {
    fontSize: "0.8rem",
    color: "#4B5563",
    fontWeight: 500,

    "@media (max-width: 480px)": {
      fontSize: "0.75rem",
    },
  },

  tableRow: {
    ":hover": {
      backgroundColor: "rgba(243,244,246,0.5)",
    },
  },

  noWrap: {
    whiteSpace: "nowrap",
  },

  subtleActionButton: {
    ...shorthands.borderRadius("8px"),
    ...shorthands.padding("4px", "8px"),
    backgroundColor: "transparent",
    color: "#0B1220",
    fontSize: "0.8rem",
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
    ":hover": {
      backgroundColor: "#F3F4F6",
      color: "#0118D8",
    },

    "@media (max-width: 480px)": {
      fontSize: "0.75rem",
      padding: "4px 6px",
    },
  },
});

const mockJobPosts = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    type: "Full-time",
    location: "Remote",
    ctc: "$120k - $150k",
    experience: "5-7 years",
    duration: "45 days",
    difficulty: "Hard",
    responses: 28,
  },
  {
    id: 2,
    title: "Product Designer",
    type: "Full-time",
    location: "San Francisco, CA",
    ctc: "$100k - $130k",
    experience: "3-5 years",
    duration: "30 days",
    difficulty: "Medium",
    responses: 42,
  },
  {
    id: 3,
    title: "Backend Engineer",
    type: "Contract",
    location: "New York, NY",
    ctc: "$90k - $110k",
    experience: "4-6 years",
    duration: "60 days",
    difficulty: "Hard",
    responses: 15,
  },
];

const mockResponses = [
  {
    id: 1,
    candidate: "Sarah Chen",
    email: "sarah.chen@email.com",
    job: "Senior Frontend Developer",
    interviewStatus: "Completed",
    hiringStatus: "Under Review",
    score: 87,
  },
  {
    id: 2,
    candidate: "Michael Rodriguez",
    email: "m.rodriguez@email.com",
    job: "Product Designer",
    interviewStatus: "Pending",
    hiringStatus: "Invited",
    score: null,
  },
  {
    id: 3,
    candidate: "Jennifer Park",
    email: "jennifer.p@email.com",
    job: "Backend Engineer",
    interviewStatus: "Completed",
    hiringStatus: "Shortlisted",
    score: 92,
  },
  {
    id: 4,
    candidate: "David Kim",
    email: "david.kim@email.com",
    job: "Senior Frontend Developer",
    interviewStatus: "In Progress",
    hiringStatus: "Invited",
    score: null,
  },
];

function mapInterviewStatusToPill(status: string) {
  switch (status) {
    case "Completed":
      return "success" as const;
    case "In Progress":
      return "warning" as const;
    case "Pending":
      return "pending" as const;
    default:
      return "info" as const;
  }
}

export function EmployerDashboard({ onNavigate }: EmployerDashboardProps) {
  const styles = useStyles();
  const [hoveredQuickAction, setHoveredQuickAction] = React.useState<
    string | null
  >(null);

  return (
    <div className={styles.root}>
      <div className={styles.statsRow}>
        <Card className={styles.statCard}>
          <div className={styles.statHeaderRow}>
            <div className={styles.statTextBlock}>
              <span className={styles.statTitle}>Active Job Posts</span>
              <span className={styles.statValue}>12</span>
            </div>
            <div
              className={`${styles.statMiniCard} statMiniCard ${styles.statIconBlue}`}
            >
              <Briefcase20Regular />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeaderRow}>
            <div className={styles.statTextBlock}>
              <span className={styles.statTitle}>Total Responses</span>
              <span className={styles.statValue}>156</span>
              <span className={styles.statSubtitlePositive}>
                ↑ 12% this week
              </span>
            </div>
            <div
              className={`${styles.statMiniCard} statMiniCard ${styles.statIconBlue}`}
            >
              <People20Regular />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeaderRow}>
            <div className={styles.statTextBlock}>
              <span className={styles.statTitle}>Pending Reviews</span>
              <span className={styles.statValue}>28</span>
            </div>
            <div
              className={`${styles.statMiniCard} statMiniCard ${styles.statIconAmber}`}
            >
              <Clock20Regular />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeaderRow}>
            <div className={styles.statTextBlock}>
              <span className={styles.statTitle}>Hired</span>
              <span className={styles.statValue}>45</span>
            </div>
            <div
              className={`${styles.statMiniCard} statMiniCard ${styles.statIconGreen}`}
            >
              <CheckmarkCircle20Regular />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeaderRow}>
            <div className={styles.statTextBlock}>
              <span className={styles.statTitle}>Rejected</span>
              <span className={styles.statValue}>83</span>
            </div>
            <div
              className={`${styles.statMiniCard} statMiniCard ${styles.statIconRed}`}
            >
              <DismissCircle20Regular />
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.twoColumnRow}>
        <Card className={mergeClasses(styles.cardBase)}>
          <div className={styles.cardHeaderRow}>
            <div
              style={{ display: "flex", alignItems: "center", columnGap: 8 }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FlashRegular style={{ color: "#3206f7ff" }} />
              </span>
              <span className={styles.cardTitle}>Quick Actions</span>
            </div>
          </div>

          <div className={styles.quickActionsBody}>
            <div className={styles.quickActionsRow}>
              <div
                className={styles.quickActionTile}
                onClick={() => onNavigate("create-job", { action: "create" })}
                onMouseEnter={() => setHoveredQuickAction("post")}
                onMouseLeave={() => setHoveredQuickAction(null)}
              >
                <div
                  className={mergeClasses(
                    styles.quickActionIconCircle,
                    styles.quickActionIconBlue,
                    hoveredQuickAction === "post" &&
                      styles.quickActionIconCircleHovered
                  )}
                >
                  <AddRegular />
                </div>
                <div>
                  <div className={styles.quickActionTextTitle}>
                    Post New Job
                  </div>
                  <div className={styles.quickActionTextSub}>
                    Create a new position
                  </div>
                </div>
              </div>

              <div
                className={styles.quickActionTile}
                onClick={() => onNavigate("Applicants")}
                onMouseEnter={() => setHoveredQuickAction("invite")}
                onMouseLeave={() => setHoveredQuickAction(null)}
              >
                <div
                  className={mergeClasses(
                    styles.quickActionIconCircle,
                    styles.quickActionIconPurple,
                    hoveredQuickAction === "invite" &&
                      styles.quickActionIconCircleHovered
                  )}
                >
                  <PersonAddRegular />
                </div>
                <div>
                  <div className={styles.quickActionTextTitle}>
                    Invite Candidate
                  </div>
                  <div className={styles.quickActionTextSub}>
                    Direct invitation
                  </div>
                </div>
              </div>

              <div
                className={styles.quickActionTile}
                onClick={() => onNavigate("Interview Analytics")}
                onMouseEnter={() => setHoveredQuickAction("analytics")}
                onMouseLeave={() => setHoveredQuickAction(null)}
              >
                <div
                  className={mergeClasses(
                    styles.quickActionIconCircle,
                    styles.quickActionIconGreen,
                    hoveredQuickAction === "analytics" &&
                      styles.quickActionIconCircleHovered
                  )}
                >
                  <ChartMultipleRegular />
                </div>
                <div>
                  <div className={styles.quickActionTextTitle}>
                    View Analytics
                  </div>
                  <div className={styles.quickActionTextSub}>
                    Performance insights
                  </div>
                </div>
              </div>

              <div
                className={styles.quickActionTile}
                onClick={() => onNavigate("Documents")}
                onMouseEnter={() => setHoveredQuickAction("reports")}
                onMouseLeave={() => setHoveredQuickAction(null)}
              >
                <div
                  className={mergeClasses(
                    styles.quickActionIconCircle,
                    styles.quickActionIconOrange,
                    hoveredQuickAction === "reports" &&
                      styles.quickActionIconCircleHovered
                  )}
                >
                  <ArrowDownloadRegular />
                </div>
                <div>
                  <div className={styles.quickActionTextTitle}>
                    Export Reports
                  </div>
                  <div className={styles.quickActionTextSub}>Download data</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className={styles.cardBase}>
          <div className={styles.cardHeaderRow}>
            <span className={styles.cardTitle}>Recent Activity</span>
          </div>

          <div className={styles.activityBody}>
            <div className={styles.activityItem}>
              <div
                className={`${styles.activityIconWrapper} activityIcon ${styles.activityIconBlue}`}
              >
                <Briefcase20Regular />
              </div>
              <div className={styles.activityTextBlock}>
                <div className={styles.activityTitle}>New job posted</div>
                <div className={styles.activitySubtitle}>
                  Senior Frontend Developer position created
                </div>
                <div className={styles.activityMeta}>2 hours ago</div>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div
                className={`${styles.activityIconWrapper} activityIcon ${styles.activityIconGreen}`}
              >
                <PersonAddRegular />
              </div>
              <div className={styles.activityTextBlock}>
                <div className={styles.activityTitle}>
                  Candidate shortlisted
                </div>
                <div className={styles.activitySubtitle}>
                  Sarah Chen moved to shortlist
                </div>
                <div className={styles.activityMeta}>5 hours ago</div>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div
                className={`${styles.activityIconWrapper} activityIcon ${styles.activityIconPurple}`}
              >
                <DocumentBulletListRegular />
              </div>
              <div className={styles.activityTextBlock}>
                <div className={styles.activityTitle}>28 new applications</div>
                <div className={styles.activitySubtitle}>
                  For Backend Engineer position
                </div>
                <div className={styles.activityMeta}>1 day ago</div>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div
                className={`${styles.activityIconWrapper} activityIcon ${styles.activityIconOrange}`}
              >
                <Clock20Regular />
              </div>
              <div className={styles.activityTextBlock}>
                <div className={styles.activityTitle}>Interview reminder</div>
                <div className={styles.activitySubtitle}>
                  Review pending interviews
                </div>
                <div className={styles.activityMeta}>2 days ago</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className={styles.cardBase}>
        <div className={styles.cardHeaderRow}>
          <span className={styles.cardTitle}>Recent Job Posts</span>
          <Button
            appearance="subtle"
            size="small"
            onClick={() => onNavigate("Jobs")}
          >
            View All
          </Button>
        </div>

        <div className={styles.tableWrapper}>
          <Table aria-label="Recent job posts" className={styles.tableFull}>
            <TableHeader>
              <TableRow className={styles.tableHeaderRow}>
                <TableHeaderCell
                  className={mergeClasses(
                    styles.tableHeaderCell,
                    styles.noWrap
                  )}
                >
                  Title
                </TableHeaderCell>
                <TableHeaderCell
                  className={mergeClasses(
                    styles.tableHeaderCell,
                    styles.noWrap
                  )}
                >
                  Type
                </TableHeaderCell>
                <TableHeaderCell
                  className={mergeClasses(
                    styles.tableHeaderCell,
                    styles.noWrap
                  )}
                >
                  Location
                </TableHeaderCell>
                <TableHeaderCell
                  className={mergeClasses(
                    styles.tableHeaderCell,
                    styles.noWrap
                  )}
                >
                  CTC
                </TableHeaderCell>
                <TableHeaderCell
                  className={mergeClasses(
                    styles.tableHeaderCell,
                    styles.noWrap
                  )}
                >
                  Experience
                </TableHeaderCell>
                <TableHeaderCell
                  className={mergeClasses(
                    styles.tableHeaderCell,
                    styles.noWrap
                  )}
                >
                  Duration
                </TableHeaderCell>
                <TableHeaderCell
                  className={mergeClasses(
                    styles.tableHeaderCell,
                    styles.noWrap
                  )}
                >
                  Difficulty
                </TableHeaderCell>
                <TableHeaderCell
                  className={mergeClasses(
                    styles.tableHeaderCell,
                    styles.noWrap
                  )}
                >
                  Responses
                </TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockJobPosts.map((job) => (
                <TableRow key={job.id} className={styles.tableRow}>
                  <TableCell className={styles.noWrap}>
                    <Text weight="semibold" style={{ color: "#0B1220" }}>
                      {job.title}
                    </Text>
                  </TableCell>
                  <TableCell className={styles.noWrap}>
                    <Text style={{ color: "#5B6475" }}>{job.type}</Text>
                  </TableCell>
                  <TableCell className={styles.noWrap}>
                    <Text style={{ color: "#5B6475" }}>{job.location}</Text>
                  </TableCell>
                  <TableCell className={styles.noWrap}>
                    <Text style={{ color: "#5B6475" }}>{job.ctc}</Text>
                  </TableCell>
                  <TableCell className={styles.noWrap}>
                    <Text style={{ color: "#5B6475" }}>{job.experience}</Text>
                  </TableCell>
                  <TableCell className={styles.noWrap}>
                    <Text style={{ color: "#5B6475" }}>{job.duration}</Text>
                  </TableCell>
                  <TableCell className={styles.noWrap}>
                    <StatusPill
                      status={
                        job.difficulty === "Easy"
                          ? "success"
                          : job.difficulty === "Medium"
                          ? "warning"
                          : "danger"
                      }
                      label={job.difficulty}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className={styles.noWrap}>
                    <Text
                      style={{
                        color: "#0118D8",
                        fontWeight: 500,
                      }}
                    >
                      {job.responses}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Menu>
                      <MenuTrigger disableButtonEnhancement>
                        <Button
                          appearance="subtle"
                          icon={<MoreVerticalRegular />}
                          aria-label="More actions"
                        />
                      </MenuTrigger>
                      <MenuPopover>
                        <MenuList>
                          <MenuItem
                            icon={<Eye20Regular />}
                            onClick={() =>
                              onNavigate("Jobs", { jobId: job.id })
                            }
                          >
                            View Details
                          </MenuItem>
                          <MenuItem
                            icon={<Edit20Regular />}
                            onClick={() =>
                              onNavigate("Jobs", {
                                jobId: job.id,
                                action: "edit",
                              })
                            }
                          >
                            Edit Job
                          </MenuItem>
                          <MenuItem
                            icon={<Delete20Regular />}
                            style={{ color: "#DC2626" }}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </MenuPopover>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className={styles.cardBase}>
        <div className={styles.cardHeaderRow}>
          <span className={styles.cardTitle}>Recent Responses</span>
          <Button
            appearance="subtle"
            size="small"
            onClick={() => onNavigate("Applicants")}
          >
            View All
          </Button>
        </div>

        <div className={styles.tableWrapper}>
          <Table aria-label="Recent responses" className={styles.tableFull}>
            <TableHeader>
              <TableRow className={styles.tableHeaderRow}>
                <TableHeaderCell
                  className={mergeClasses(
                    styles.tableHeaderCell,
                    styles.noWrap
                  )}
                >
                  Candidate
                </TableHeaderCell>
                <TableHeaderCell
                  className={mergeClasses(
                    styles.tableHeaderCell,
                    styles.noWrap
                  )}
                >
                  Email
                </TableHeaderCell>
                <TableHeaderCell
                  className={mergeClasses(
                    styles.tableHeaderCell,
                    styles.noWrap
                  )}
                >
                  Job Role
                </TableHeaderCell>
                <TableHeaderCell
                  className={mergeClasses(
                    styles.tableHeaderCell,
                    styles.noWrap
                  )}
                >
                  Score
                </TableHeaderCell>
                <TableHeaderCell
                  className={mergeClasses(
                    styles.tableHeaderCell,
                    styles.noWrap
                  )}
                >
                  Interview Status
                </TableHeaderCell>
                <TableHeaderCell
                  className={mergeClasses(
                    styles.tableHeaderCell,
                    styles.noWrap
                  )}
                >
                  Hiring Status
                </TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockResponses.map((response) => (
                <TableRow key={response.id} className={styles.tableRow}>
                  <TableCell className={styles.noWrap}>
                    <Text weight="semibold" style={{ color: "#0B1220" }}>
                      {response.candidate}
                    </Text>
                  </TableCell>
                  <TableCell className={styles.noWrap}>
                    <Text style={{ color: "#5B6475" }}>{response.email}</Text>
                  </TableCell>
                  <TableCell className={styles.noWrap}>
                    <Text style={{ color: "#5B6475" }}>{response.job}</Text>
                  </TableCell>
                  <TableCell className={styles.noWrap}>
                    {response.score != null ? (
                      <Text
                        style={{
                          color: "#0118D8",
                          fontWeight: 500,
                        }}
                      >
                        {response.score}%
                      </Text>
                    ) : (
                      <Text style={{ color: "#5B6475" }}>-</Text>
                    )}
                  </TableCell>
                  <TableCell className={styles.noWrap}>
                    <StatusPill
                      status={mapInterviewStatusToPill(
                        response.interviewStatus
                      )}
                      label={response.interviewStatus}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className={styles.noWrap}>
                    <Dropdown
                      defaultValue={response.hiringStatus}
                      style={{ minWidth: 160 }}
                    >
                      <Option value="Invited">Invited</Option>
                      <Option value="Under Review">Under Review</Option>
                      <Option value="Shortlisted">Shortlisted</Option>
                      <Option value="Hired">Hired</Option>
                      <Option value="Rejected">Rejected</Option>
                    </Dropdown>
                  </TableCell>
                  <TableCell>
                    <button
                      className={styles.subtleActionButton}
                      style={{ minWidth: 150 }}
                      onClick={() =>
                        onNavigate("Interview Analytics", {
                          candidateId: response.id,
                        })
                      }
                    >
                      View Analytics
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

export default EmployerDashboard;
