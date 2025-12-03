import * as React from "react";
import {
  Button,
  Card,
  Text,
  ProgressBar,
  Tab,
  TabList,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  makeStyles,
  tokens,
} from "@fluentui/react-components";

import {
  Briefcase20Regular,
  Clock20Regular,
  CheckmarkCircle20Regular,
  DocumentText20Regular,
  Warning20Regular,
  PlayRegular,
  DataHistogram20Regular,
} from "@fluentui/react-icons";

import { AnimatedStats } from "../ui/AnimatedStats";
import { QuickActions } from "../ui/QuickActions";
import { ActivityTimeline } from "../ui/ActivityTimeline";
import { FeatureHighlight } from "../ui/FeatureHighlight";
import { StatusPill } from "../ui/StatusPill";

interface CandidateHomeProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
}

type ApplicationStatus = "Pending" | "Interview Completed" | "Hired";

interface Application {
  id: number;
  company: string;
  companyLogo: string;
  title: string;
  appliedDate: string;
  status: ApplicationStatus;
  interviewStatus: "Not Started" | "Completed";
  score?: number;
}

interface RecommendedJob {
  id: number;
  company: string;
  companyLogo: string;
  title: string;
  location: string;
  type: string;
  ctc: string;
  match: number;
}

const mockApplications: Application[] = [
  {
    id: 1,
    company: "Acme Corporation",
    companyLogo: "AC",
    title: "Senior Frontend Developer",
    appliedDate: "Jan 20, 2025",
    status: "Pending",
    interviewStatus: "Not Started",
  },
  {
    id: 2,
    company: "TechStart Inc",
    companyLogo: "TS",
    title: "Full Stack Engineer",
    appliedDate: "Jan 18, 2025",
    status: "Interview Completed",
    interviewStatus: "Completed",
    score: 87,
  },
  {
    id: 3,
    company: "Innovation Labs",
    companyLogo: "IL",
    title: "React Developer",
    appliedDate: "Jan 15, 2025",
    status: "Hired",
    interviewStatus: "Completed",
    score: 92,
  },
];

const mockRecommended: RecommendedJob[] = [
  {
    id: 4,
    company: "Digital Solutions",
    companyLogo: "DS",
    title: "Frontend Developer",
    location: "Remote",
    type: "Full-time",
    ctc: "$100k - $120k",
    match: 95,
  },
  {
    id: 5,
    company: "CloudTech",
    companyLogo: "CT",
    title: "React Native Developer",
    location: "New York, NY",
    type: "Full-time",
    ctc: "$110k - $130k",
    match: 88,
  },
];

type TabValue = "recommended" | "invited";

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

  welcomeCard: {
    position: "relative",
    padding: tokens.spacingHorizontalXL,
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundImage: "linear-gradient(90deg, #eff6ff, #f5f3ff, #ffffff)",
    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    overflow: "hidden",
  },
  welcomeAccent: {
    position: "absolute",
    top: "-80px",
    right: "-80px",
    width: "260px",
    height: "260px",
    borderRadius: "999px",
    opacity: 0.12,
    filter: "blur(4px)",
    pointerEvents: "none",
  },
  welcomeContent: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    columnGap: tokens.spacingHorizontalXL,
  },
  welcomeText: {
    maxWidth: "70%",
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
  },

  browseButton: {
    backgroundImage: "linear-gradient(90deg, #0118D8, #1B56FD)",
    color: tokens.colorNeutralForegroundOnBrand,
    border: "none",
    ":hover": {
      backgroundImage: "linear-gradient(90deg, #1B56FD, #0118D8)",
    },
  },

  profileCard: {
    padding: "24px 28px",
    borderRadius: "16px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  },

  profileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: tokens.spacingVerticalM,
    columnGap: tokens.spacingHorizontalXL,
  },

  profileHeaderText: {
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
  },

  profileProgress: {
    marginTop: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalXL,
    height: "6px",
    borderRadius: "9999px",
    backgroundColor: "#e0e7ff",
    overflow: "hidden",

    "& .fui-ProgressBar-bar": {
      backgroundColor: "#0044ff",
      borderRadius: "9999px",
    },
  },
  profileTaskContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    rowGap: "1px",
  },

  profileTasksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: tokens.spacingHorizontalM,
  },

  profileTaskCard: {
    display: "flex",
    alignItems: "flex-start",
    columnGap: tokens.spacingHorizontalM,
    padding: "16px 18px",
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: "#FFF8F8",
  },

  profileTaskIcon: {
    marginTop: "2px",
    flexShrink: 0,
  },

  linkButton: {
    height: "auto",
    marginTop: "4px",
    color: "#0118D8",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: tokens.spacingHorizontalL,
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
    gap: tokens.spacingHorizontalXL,
  },

  tabs: {
    width: "30%",
    paddingBottom: "4px",
    marginBottom: "4px",
    backgroundColor: "#FFFF",
    borderRadius: "50px",
  },

  tabsWrapper: {
    marginTop: tokens.spacingVerticalM,
  },

  tabPanels: {
    marginTop: tokens.spacingVerticalM,
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalM,
  },

  jobCard: {
    padding: tokens.spacingHorizontalXL,
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: "pointer",
    transitionProperty: "box-shadow, transform, border-color",
    transitionDuration: "200ms",
    ":hover": {
      boxShadow: "0 1px 0 rgba(2,6,23,0.08), 0 8px 24px rgba(2,6,23,0.12)",
      transform: "translateY(-1px)",
    },
  },

  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalXL,
  },

  jobHeaderLeft: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalM,
    minWidth: 0,
  },

  jobTitleBlock: {
    display: "flex",
    flexDirection: "column",
    rowGap: "0px",
    minWidth: 0,
  },

  jobTitle: {
    color: "#0B1220",
    margin: 0,
    lineHeight: 1.25,
    fontWeight: 600,
    fontSize: tokens.fontSizeBase400,
  },

  jobCompany: {
    color: "#5B6475",
    marginTop: "2px",
    marginBottom: "10px",
    lineHeight: 1.2,
    fontSize: tokens.fontSizeBase300,
  },

  jobLogo: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: "linear-gradient(135deg, #0118D8, #1B56FD)",
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: 600,
    flexShrink: 0,
  },

  jobHeaderRight: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalM,
  },

  jobMatchContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    lineHeight: 1.1,
  },

  jobMetaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalM,
    marginLeft: "50px",
    color: "#5B6475",
    fontSize: tokens.fontSizeBase200,
  },

  invitedCard: {
    padding: tokens.spacingHorizontalXXL,
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    display: "flex",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colorNeutralBackground1,
  },

  invitedIconWrapper: {
    width: "64px",
    height: "64px",
    borderRadius: "999px",
    margin: "0 auto",
    marginBottom: tokens.spacingVerticalM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#E9DFC3",
  },
  browseAllJobsButton: {
    width: "auto",
    backgroundColor: "rgba(252, 241, 241, 1)",
    ":hover": {
      backgroundColor: "#E9DFC3",
    },
  },

  applicationsCard: {
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
  },

  applicationsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: tokens.spacingVerticalM,
  },
  applicationsTable: {
    minWidth: "980px",
    borderCollapse: "collapse",
  },
  actionsCell: {
    whiteSpace: "nowrap",
  },

  statusCell: {
    whiteSpace: "nowrap",
  },

  iconInline: {
    marginRight: "6px",
    fontSize: "16px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },
  tableHeaderRow: {
    backgroundImage:
      "linear-gradient(90deg, rgba(1,24,216,0.06), rgba(27,86,253,0.06))",
  },

  companyCell: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalS,
  },

  companyLogo: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: "linear-gradient(135deg, #0118D8, #1B56FD)",
    color: "#fff",
    fontWeight: 600,
    flexShrink: 0,
  },

  tableRowHover: {
    ":hover": {
      backgroundColor: "#F3F4F6",
    },
  },
  scoreCell: {
    whiteSpace: "nowrap",
  },

  mobileLabel: {
    display: "none",
  },

  "@media (max-width: 900px)": {
    tableWrapper: {
      overflowX: "visible",
    },

    tableHeaderRow: {
      display: "none",
    },

    tableRowHover: {
      display: "flex",
      flexDirection: "column",
      padding: "16px",
      borderRadius: "12px",
      border: "1px solid rgba(2, 6, 23, 0.08)",
      marginBottom: "12px",
      backgroundColor: "#FFFFFF",

      "& td": {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid #F1F1F1",
      },

      "& td:last-child": {
        borderBottom: "none",
      },
    },

    mobileLabel: {
      display: "inline-block",
      fontWeight: 600,
      fontSize: "12px",
      color: "#5B6475",
      minWidth: "90px",
      marginRight: "8px",
    },
  },
});

export const CandidateHome: React.FC<CandidateHomeProps> = ({ onNavigate }) => {
  const styles = useStyles();
  const profileCompletion = 75;
  const [selectedTab, setSelectedTab] = React.useState<TabValue>("recommended");

  return (
    <div className={styles.root}>
      <Card className={styles.welcomeCard} appearance="filled">
        <div className={styles.welcomeAccent} />
        <div className={styles.welcomeContent}>
          <div className={styles.welcomeText}>
            <Text
              as="h2"
              weight="semibold"
              size={600}
              style={{ color: "#0B1220" }}
            >
              Welcome back, John! 👋
            </Text>

            <Text size={300} style={{ color: "#5B6475" }}>
              You have{" "}
              <span style={{ color: "#0118D8", fontWeight: 500 }}>
                2 pending interviews
              </span>{" "}
              and{" "}
              <span style={{ color: "#0118D8", fontWeight: 500 }}>
                1 new job recommendation
              </span>
              .
            </Text>
          </div>

          <Button
            appearance="primary"
            className={styles.browseButton}
            onClick={() => onNavigate("jobs")}
          >
            <Briefcase20Regular className={styles.iconInline} />
            Browse Jobs
          </Button>
        </div>
      </Card>

      <FeatureHighlight />

      <Card className={styles.profileCard} appearance="outline">
        <div className={styles.profileHeader}>
          <div className={styles.profileHeaderText}>
            <Text
              as="h3"
              weight="semibold"
              size={500}
              style={{ color: "#0B1220" }}
            >
              Complete Your Profile
            </Text>
            <Text size={300} style={{ color: "#5B6475" }}>
              {profileCompletion}% complete – Add more details to get better job
              matches
            </Text>
          </div>

          <Button appearance="subtle" size="small">
            <h4> Dismiss</h4>
          </Button>
        </div>

        <ProgressBar
          value={profileCompletion}
          max={100}
          thickness="large"
          className={styles.profileProgress}
        />

        <div className={styles.profileTasksGrid}>
          <div className={styles.profileTaskCard}>
            <div className={styles.profileTaskIcon}>
              <Warning20Regular style={{ color: "#F59E0B" }} />
            </div>

            <div className={styles.profileTaskContent}>
              <Text
                weight="semibold"
                size={300}
                style={{ color: "#0B1220", marginBottom: 2 }}
              >
                Add work experience
              </Text>
              <Button
                appearance="transparent"
                size="small"
                className={styles.linkButton}
              >
                Add now →
              </Button>
            </div>
          </div>

          <div className={styles.profileTaskCard}>
            <div className={styles.profileTaskIcon}>
              <Warning20Regular style={{ color: "#F59E0B" }} />
            </div>

            <div className={styles.profileTaskContent}>
              <Text
                weight="semibold"
                size={300}
                style={{ color: "#0B1220", marginBottom: 2 }}
              >
                Upload your resume
              </Text>
              <Button
                appearance="transparent"
                size="small"
                className={styles.linkButton}
              >
                Upload →
              </Button>
            </div>
          </div>

          <div className={styles.profileTaskCard}>
            <div className={styles.profileTaskIcon}>
              <Warning20Regular style={{ color: "#F59E0B" }} />
            </div>

            <div className={styles.profileTaskContent}>
              <Text
                weight="semibold"
                size={300}
                style={{ color: "#0B1220", marginBottom: 2 }}
              >
                Add skills & certifications
              </Text>
              <Button
                appearance="transparent"
                size="small"
                className={styles.linkButton}
              >
                Add now →
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className={styles.statsGrid}>
        <AnimatedStats
          title="Total Applications"
          value={12}
          icon={DocumentText20Regular}
          color="primary"
        />
        <AnimatedStats
          title="Pending Interviews"
          value={3}
          icon={Clock20Regular}
          color="warning"
        />
        <AnimatedStats
          title="Offers Received"
          value={1}
          icon={CheckmarkCircle20Regular}
          color="success"
        />
      </div>

      <div className={styles.mainGrid}>
        <div>
          <QuickActions userRole="candidate" onNavigate={onNavigate} />
        </div>
        <div>
          <ActivityTimeline userRole="candidate" />
        </div>
      </div>

      <div className={styles.root}>
        <div className={styles.tabs}>
          <TabList
            selectedValue={selectedTab}
            onTabSelect={(_, data) => setSelectedTab(data.value as TabValue)}
            appearance="transparent"
          >
            <Tab value="recommended">Recommended for You</Tab>
            <Tab value="invited">Invited to Apply (2)</Tab>
          </TabList>
        </div>

        <div className={styles.tabsWrapper}>
          {selectedTab === "recommended" && (
            <div className={styles.tabPanels}>
              {mockRecommended.map((job) => (
                <Card
                  key={job.id}
                  className={styles.jobCard}
                  appearance="outline"
                  onClick={() => onNavigate("job-details", { jobId: job.id })}
                >
                  <div className={styles.jobHeader}>
                    <div className={styles.jobHeaderLeft}>
                      <div className={styles.jobLogo}>{job.companyLogo}</div>

                      <div className={styles.jobTitleBlock}>
                        <Text as="h4" className={styles.jobTitle}>
                          {job.title}
                        </Text>
                        <Text className={styles.jobCompany}>{job.company}</Text>
                      </div>
                    </div>

                    <div className={styles.jobHeaderRight}>
                      <div className={styles.jobMatchContainer}>
                        <Text
                          weight="semibold"
                          size={500}
                          style={{ color: "#16A34A" }}
                        >
                          {job.match}%
                        </Text>
                        <Text size={200} style={{ color: "#5B6475" }}>
                          Match
                        </Text>
                      </div>

                      <Button
                        appearance="primary"
                        style={{ backgroundColor: "#0118D8", border: "none" }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className={styles.jobMetaRow}>
                    <span>📍 {job.location}</span>
                    <span>💼 {job.type}</span>
                    <span>💰 {job.ctc}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {selectedTab === "invited" && (
            <div className={styles.tabPanels}>
              <Card className={styles.invitedCard} appearance="outline">
                <div className={styles.invitedIconWrapper}>
                  <Briefcase20Regular
                    style={{ fontSize: 32, color: "#0B1220" }}
                  />
                </div>
                <Text
                  as="h3"
                  weight="semibold"
                  size={300}
                  style={{ color: "#020202ff", marginBottom: 4 }}
                >
                  No Direct Invitations Yet
                </Text>
                <Text
                  size={400}
                  style={{
                    color: "#5B6475",
                    marginBottom: tokens.spacingVerticalL,
                    maxWidth: 420,
                    marginInline: "auto",
                    display: "block",
                  }}
                >
                  When employers specifically invite you to apply for their open
                  positions, they'll appear here.
                </Text>
                <Button
                  appearance="outline"
                  onClick={() => onNavigate("jobs")}
                  className={styles.browseAllJobsButton}
                >
                  Browse All Jobs
                </Button>
              </Card>
            </div>
          )}
        </div>

        <Card className={styles.applicationsCard} appearance="outline">
          <div className={styles.applicationsHeader}>
            <Text
              as="h3"
              weight="semibold"
              size={500}
              style={{ color: "#0B1220" }}
            >
              Recent Applications
            </Text>
            <Button
              appearance="subtle"
              size="small"
              onClick={() => onNavigate("applications")}
            >
              <h4>View All</h4>
            </Button>
          </div>

          <div className={styles.tableWrapper}>
            <Table className={styles.applicationsTable}>
              <TableHeader>
                <TableRow className={styles.tableHeaderRow}>
                  <TableHeaderCell>Company</TableHeaderCell>
                  <TableHeaderCell>Position</TableHeaderCell>
                  <TableHeaderCell>Applied Date</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Score</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {mockApplications.map((app) => (
                  <TableRow key={app.id} className={styles.tableRowHover}>
                    <TableCell>
                      <span className={styles.mobileLabel}>Company</span>
                      <div className={styles.companyCell}>
                        <div className={styles.companyLogo}>
                          {app.companyLogo}
                        </div>
                        <Text weight="semibold" style={{ color: "#0B1220" }}>
                          {app.company}
                        </Text>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className={styles.mobileLabel}>Position</span>
                      <Text style={{ color: "#5B6475" }}>{app.title}</Text>
                    </TableCell>

                    <TableCell>
                      <span className={styles.mobileLabel}>Applied Date</span>
                      <Text style={{ color: "#5B6475" }}>
                        {app.appliedDate}
                      </Text>
                    </TableCell>

                    <TableCell className={styles.statusCell}>
                      <span className={styles.mobileLabel}>Status</span>
                      <StatusPill
                        status={
                          app.status === "Hired"
                            ? "success"
                            : app.status === "Interview Completed"
                            ? "info"
                            : "warning"
                        }
                        label={app.status}
                        size="sm"
                      />
                    </TableCell>

                    <TableCell className={styles.scoreCell}>
                      <span className={styles.mobileLabel}>Score</span>
                      {app.score != null ? (
                        <Text weight="semibold" style={{ color: "#0118D8" }}>
                          {app.score}%
                        </Text>
                      ) : (
                        <Text style={{ color: "#5B6475" }}>-</Text>
                      )}
                    </TableCell>

                    <TableCell className={styles.actionsCell}>
                      <span className={styles.mobileLabel}>Actions</span>
                      {app.interviewStatus === "Not Started" ? (
                        <Button
                          size="small"
                          appearance="primary"
                          style={{ backgroundColor: "#0118D8", border: "none" }}
                          onClick={() =>
                            onNavigate("interview-room", {
                              applicationId: app.id,
                            })
                          }
                        >
                          <PlayRegular className={styles.iconInline} />
                          Start Interview
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          appearance="outline"
                          onClick={() =>
                            onNavigate("results", { applicationId: app.id })
                          }
                        >
                          <DataHistogram20Regular
                            className={styles.iconInline}
                          />
                          View Results
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};
