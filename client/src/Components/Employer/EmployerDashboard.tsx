import * as React from "react";
import {
  Button,
  Card,
  Dropdown,
  Option,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";

import {
  Briefcase20Regular,
  People20Regular,
  Clock20Regular,
  CheckmarkCircle20Regular,
  DismissCircle20Regular,
  MoreVertical20Regular,
  Eye20Regular,
  Delete20Regular,
  Edit20Regular,
} from "@fluentui/react-icons";

import { AnimatedStats } from "../ui/AnimatedStats";
import { QuickActions } from "../ui/QuickActions";
import { ActivityTimeline } from "../ui/ActivityTimeline";
import { StatusPill } from "../ui/StatusPill";

interface EmployerDashboardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNavigate: (page: string, data?: any) => void;
}

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

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    columnGap: tokens.spacingHorizontalM,
    rowGap: tokens.spacingVerticalM,

    "@media (max-width: 1200px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },

    "@media (max-width: 700px)": {
      gridTemplateColumns: "minmax(0, 1fr)",
    },
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
    columnGap: tokens.spacingHorizontalXL,
    rowGap: tokens.spacingVerticalL,

    "@media (max-width: 960px)": {
      gridTemplateColumns: "minmax(0, 1fr)",
    },
  },

  cardBase: {
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: tokens.colorNeutralBackground1,
  },

  cardHeader: {
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalXL),
    borderBottom: "1px solid rgba(2,6,23,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    color: "#0B1220",
  },

  viewAllButton: {
    fontWeight: "bold",
    ":hover": {
      backgroundColor: "#E9DFC3",
    },
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  tableHeaderRow: {
    backgroundImage:
      "linear-gradient(90deg, rgba(1,24,216,0.06), rgba(27,86,253,0.06))",
  },

  tableRowHover: {
    ":hover": {
      backgroundColor: "#F3F4F6",
    },
  },

  titleCellText: {
    color: "#0B1220",
    fontWeight: 500,
  },

  mutedCell: {
    color: "#5B6475",
  },

  responsesCell: {
    color: "#0118D8",
    fontWeight: 500,
  },

  moreButton: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background-color 150ms ease",

    ":hover": {
      backgroundColor: "#F3F4F6",
    },
  },

  analyticsButton: {
    ...shorthands.padding("4px", "12px"),
    borderRadius: "8px",
    border: "none",
    backgroundColor: "transparent",
    color: "#0B1220",
    fontSize: tokens.fontSizeBase300,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background-color 120ms ease, color 120ms ease",

    ":hover": {
      backgroundColor: "#F3F4F6",
      color: "#0118D8",
    },
  },

  scoreDash: {
    color: "#5B6475",
  },

  scoreValue: {
    color: "#0118D8",
    fontWeight: 500,
  },

  hiringSelect: {
    minWidth: "160px",
  },
});

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({
  onNavigate,
}) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      {/* KPI cards */}
      <div className={styles.kpiGrid}>
        <AnimatedStats
          title="Active Job Posts"
          value={12}
          icon={Briefcase20Regular}
          color="primary"
        />
        <AnimatedStats
          title="Total Responses"
          value={156}
          icon={People20Regular}
          trend={{ value: "12% this week", isPositive: true }}
        />
        <AnimatedStats
          title="Pending Reviews"
          value={28}
          icon={Clock20Regular}
          color="warning"
        />
        <AnimatedStats
          title="Hired"
          value={45}
          icon={CheckmarkCircle20Regular}
          color="success"
        />
        <AnimatedStats
          title="Rejected"
          value={83}
          icon={DismissCircle20Regular}
          color="danger"
        />
      </div>

      {/* Quick actions + activity */}
      <div className={styles.mainGrid}>
        <QuickActions userRole="employer" onNavigate={onNavigate} />

        <ActivityTimeline userRole="employer" />
      </div>

      {/* Recent Job Posts */}
      <Card className={styles.cardBase} appearance="outline">
        <div className={styles.cardHeader}>
          <Text as="h3" weight="semibold" className={styles.cardTitle}>
            Recent Job Posts
          </Text>
          <Button
            appearance="subtle"
            size="small"
            onClick={() => onNavigate("jobs")}
            className={styles.viewAllButton}
          >
            View All
          </Button>
        </div>

        <div className={styles.tableWrapper}>
          <Table>
            <TableHeader>
              <TableRow className={styles.tableHeaderRow}>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Location</TableHeaderCell>
                <TableHeaderCell>CTC</TableHeaderCell>
                <TableHeaderCell>Experience</TableHeaderCell>
                <TableHeaderCell>Duration</TableHeaderCell>
                <TableHeaderCell>Difficulty</TableHeaderCell>
                <TableHeaderCell>Responses</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHeader>

            <TableBody>
              {mockJobPosts.map((job) => (
                <TableRow key={job.id} className={styles.tableRowHover}>
                  <TableCell>
                    <Text className={styles.titleCellText}>{job.title}</Text>
                  </TableCell>
                  <TableCell>
                    <Text className={styles.mutedCell}>{job.type}</Text>
                  </TableCell>
                  <TableCell>
                    <Text className={styles.mutedCell}>{job.location}</Text>
                  </TableCell>
                  <TableCell>
                    <Text className={styles.mutedCell}>{job.ctc}</Text>
                  </TableCell>
                  <TableCell>
                    <Text className={styles.mutedCell}>{job.experience}</Text>
                  </TableCell>
                  <TableCell>
                    <Text className={styles.mutedCell}>{job.duration}</Text>
                  </TableCell>
                  <TableCell>
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
                  <TableCell>
                    <Text className={styles.responsesCell}>
                      {job.responses}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Menu>
                      <MenuTrigger disableButtonEnhancement>
                        <button
                          type="button"
                          className={styles.moreButton}
                          aria-label="Open job actions"
                        >
                          <MoreVertical20Regular />
                        </button>
                      </MenuTrigger>
                      <MenuPopover>
                        <MenuList>
                          <MenuItem icon={<Eye20Regular />}>
                            View Details
                          </MenuItem>
                          <MenuItem icon={<Edit20Regular />}>Edit Job</MenuItem>
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

      {/* Recent Responses */}
      <Card className={styles.cardBase} appearance="outline">
        <div className={styles.cardHeader}>
          <Text as="h3" weight="semibold" className={styles.cardTitle}>
            Recent Responses
          </Text>
          <Button
            appearance="subtle"
            size="small"
            onClick={() => onNavigate("applicants")}
            className={styles.viewAllButton}
          >
            View All
          </Button>
        </div>

        <div className={styles.tableWrapper}>
          <Table>
            <TableHeader>
              <TableRow className={styles.tableHeaderRow}>
                <TableHeaderCell>Candidate</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Job Role</TableHeaderCell>
                <TableHeaderCell>Score</TableHeaderCell>
                <TableHeaderCell>Interview Status</TableHeaderCell>
                <TableHeaderCell>Hiring Status</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHeader>

            <TableBody>
              {mockResponses.map((response) => (
                <TableRow key={response.id} className={styles.tableRowHover}>
                  <TableCell>
                    <Text className={styles.titleCellText}>
                      {response.candidate}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text className={styles.mutedCell}>{response.email}</Text>
                  </TableCell>
                  <TableCell>
                    <Text className={styles.mutedCell}>{response.job}</Text>
                  </TableCell>
                  <TableCell>
                    {response.score != null ? (
                      <Text className={styles.scoreValue}>
                        {response.score}%
                      </Text>
                    ) : (
                      <Text className={styles.scoreDash}>-</Text>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      status={
                        response.interviewStatus === "Completed"
                          ? "success"
                          : response.interviewStatus === "In Progress"
                          ? "warning"
                          : "info"
                      }
                      label={response.interviewStatus}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>
                    <Dropdown
                      defaultSelectedOptions={[
                        response.hiringStatus.toLowerCase().replace(" ", "-"),
                      ]}
                      className={styles.hiringSelect}
                    >
                      <Option value="invited">Invited</Option>
                      <Option value="under-review">Under Review</Option>
                      <Option value="shortlisted">Shortlisted</Option>
                      <Option value="hired">Hired</Option>
                      <Option value="rejected">Rejected</Option>
                    </Dropdown>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate("Interview Analytics", {
                          candidateId: response.id,
                        })
                      }
                      className={styles.analyticsButton}
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
};
