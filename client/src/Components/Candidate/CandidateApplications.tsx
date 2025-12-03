import * as React from "react";
import {
  Button,
  Card,
  Input,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Tab,
  TabList,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";

import {
  Search20Regular,
  MoreVertical20Regular,
  Eye20Regular,
  DataHistogram20Regular,
  Play20Regular,
  Chat20Regular,
  Open20Regular,
} from "@fluentui/react-icons";

import { StatusPill } from "../ui/StatusPill";
import { useState } from "react";

interface CandidateApplicationsProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
}

type ApplicationStatus =
  | "Pending Interview"
  | "Under Review"
  | "Hired"
  | "Interview In Progress"
  | "Rejected"
  | "Shortlisted";

type InterviewStatus = "Not Started" | "In Progress" | "Completed";

interface Application {
  id: number;
  company: string;
  companyLogo: string;
  title: string;
  location: string;
  appliedDate: string;
  status: ApplicationStatus;
  interviewStatus: InterviewStatus;
  score: number | null;
}

const mockApplications: Application[] = [
  {
    id: 1,
    company: "Acme Corporation",
    companyLogo: "AC",
    title: "Senior Frontend Developer",
    location: "Remote",
    appliedDate: "Jan 20, 2025",
    status: "Pending Interview",
    interviewStatus: "Not Started",
    score: null,
  },
  {
    id: 2,
    company: "TechStart Inc",
    companyLogo: "TS",
    title: "Full Stack Engineer",
    location: "San Francisco, CA",
    appliedDate: "Jan 18, 2025",
    status: "Under Review",
    interviewStatus: "Completed",
    score: 87,
  },
  {
    id: 3,
    company: "Innovation Labs",
    companyLogo: "IL",
    title: "React Developer",
    location: "New York, NY",
    appliedDate: "Jan 15, 2025",
    status: "Hired",
    interviewStatus: "Completed",
    score: 92,
  },
  {
    id: 4,
    company: "Digital Solutions",
    companyLogo: "DS",
    title: "Frontend Developer",
    location: "Remote",
    appliedDate: "Jan 22, 2025",
    status: "Pending Interview",
    interviewStatus: "Not Started",
    score: null,
  },
  {
    id: 5,
    company: "CloudTech",
    companyLogo: "CT",
    title: "React Native Developer",
    location: "Austin, TX",
    appliedDate: "Jan 10, 2025",
    status: "Interview In Progress",
    interviewStatus: "In Progress",
    score: null,
  },
  {
    id: 6,
    company: "Enterprise Corp",
    companyLogo: "EC",
    title: "Junior Frontend Developer",
    location: "Boston, MA",
    appliedDate: "Jan 8, 2025",
    status: "Rejected",
    interviewStatus: "Completed",
    score: 68,
  },
  {
    id: 7,
    company: "StartupHub",
    companyLogo: "SH",
    title: "Lead Frontend Engineer",
    location: "Remote",
    appliedDate: "Jan 5, 2025",
    status: "Shortlisted",
    interviewStatus: "Completed",
    score: 89,
  },
];

type TabValue = "all" | "pending" | "hired" | "rejected";

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

  searchCard: {
    padding: tokens.spacingHorizontalL,
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: tokens.colorNeutralBackground1,
  },

  appsTableCard: {
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    overflow: "hidden",
  },

  searchInputWrapper: {
    position: "relative",
  },
  searchInput: {
    width: "100%",
    borderRadius: "8px",
  },

  tabsListWrapper: {
    marginTop: tokens.spacingVerticalM,
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

  companyCell: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalM,
  },

  companyLogo: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: "linear-gradient(135deg, #0118D8, #1B56FD)",
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: 600,
    flexShrink: 0,
  },

  statusText: {
    color: "#5B6475",
  },

  scoreText: {
    color: "#0118D8",
    fontWeight: 500,
  },

  menuTriggerButton: {
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

  tabsList: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: "999px",
    padding: "6px 12px",
    border: "1px solid rgba(2,6,23,0.08)",
    display: "inline-flex",
  },

  tabItem: {
    padding: "6px 14px",
    borderRadius: "999px",
    backgroundColor: "transparent",
    fontWeight: 500,
    color: "#0B1220",
    cursor: "pointer",
    border: "none",
    ":hover": {
      backgroundColor: "rgba(2,6,23,0.04)",
    },
  },

  tabItemSelected: {
    backgroundColor: "white",
    borderRadius: "999px",
    boxShadow: "0 0 0 2px #E5E7EB inset",
    fontWeight: 600,
    color: "#0B1220",
  },

  pillWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-start",
    whiteSpace: "nowrap",
  },

  actionsCell: {
    whiteSpace: "nowrap",
  },

  primaryActionButton: {
    minWidth: "150px",
    justifyContent: "center",
    marginRight: "8px",
  },

  warningActionButton: {
    minWidth: "150px",
    justifyContent: "center",
    marginRight: "8px",
  },

  emptyCard: {
    padding: tokens.spacingHorizontalXXL,
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    textAlign: "center",
    backgroundColor: tokens.colorNeutralBackground1,
  },

  emptyIconWrapper: {
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

  emptyTextMuted: {
    color: "#5B6475",
    maxWidth: "460px",
    marginInline: "auto",
    marginTop: tokens.spacingVerticalXS,
  },
});

export const CandidateApplications: React.FC<CandidateApplicationsProps> = ({
  onNavigate,
}) => {
  const styles = useStyles();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<TabValue>("all");

  const getStatusType = (status: ApplicationStatus) => {
    if (status === "Hired") return "success";
    if (status === "Rejected") return "danger";
    if (status === "Shortlisted") return "info";
    if (status === "Under Review") return "info";
    if (status === "Interview In Progress") return "warning";
    return "pending";
  };

  const filteredByTab = mockApplications.filter((app) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "pending") {
      return (
        app.status.includes("Pending") || app.status.includes("In Progress")
      );
    }
    if (selectedTab === "hired") return app.status === "Hired";
    if (selectedTab === "rejected") return app.status === "Rejected";
    return true;
  });

  const filteredApplications = filteredByTab.filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.company.toLowerCase().includes(q) ||
      app.title.toLowerCase().includes(q) ||
      app.status.toLowerCase().includes(q)
    );
  });

  const pendingCount = mockApplications.filter(
    (a) => a.status.includes("Pending") || a.status.includes("In Progress")
  ).length;
  const hiredCount = mockApplications.filter((a) => a.status === "Hired")
    .length;
  const rejectedCount = mockApplications.filter(
    (a) => a.status === "Rejected"
  ).length;

  return (
    <div className={styles.root}>
      <Card className={styles.searchCard} appearance="outline">
        <div className={styles.searchInputWrapper}>
          <Input
            className={styles.searchInput}
            contentBefore={
              <Search20Regular style={{ color: "#5B6475", fontSize: 16 }} />
            }
            placeholder="Search by title, company, or skills..."
            value={searchQuery}
            onChange={(_, data) => setSearchQuery(data.value)}
          />
        </div>
      </Card>

      <div>
        <TabList
          selectedValue={selectedTab}
          onTabSelect={(_, data) => setSelectedTab(data.value as TabValue)}
          className={styles.tabsList}
          appearance="subtle"
        >
          <Tab
            value="all"
            className={
              selectedTab === "all"
                ? `${styles.tabItem} ${styles.tabItemSelected}`
                : styles.tabItem
            }
          >
            All Applications ({mockApplications.length})
          </Tab>

          <Tab
            value="pending"
            className={
              selectedTab === "pending"
                ? `${styles.tabItem} ${styles.tabItemSelected}`
                : styles.tabItem
            }
          >
            Pending ({pendingCount})
          </Tab>
          <Tab
            value="hired"
            className={
              selectedTab === "hired"
                ? `${styles.tabItem} ${styles.tabItemSelected}`
                : styles.tabItem
            }
          >
            Hired ({hiredCount})
          </Tab>
          <Tab
            value="rejected"
            className={
              selectedTab === "rejected"
                ? `${styles.tabItem} ${styles.tabItemSelected}`
                : styles.tabItem
            }
          >
            Rejected ({rejectedCount})
          </Tab>
        </TabList>

        <div className={styles.tabsListWrapper}>
          <Card className={styles.appsTableCard} appearance="outline">
            <div className={styles.tableWrapper}>
              <Table style={{ minWidth: "1120px" }}>
                <TableHeader>
                  <TableRow className={styles.tableHeaderRow}>
                    <TableHeaderCell>Company &amp; Position</TableHeaderCell>
                    <TableHeaderCell>Location</TableHeaderCell>
                    <TableHeaderCell>Applied Date</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Interview</TableHeaderCell>
                    <TableHeaderCell>Score</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id} className={styles.tableRowHover}>
                      <TableCell>
                        <div className={styles.companyCell}>
                          <div className={styles.companyLogo}>
                            {app.companyLogo}
                          </div>
                          <div>
                            <Text
                              weight="semibold"
                              style={{ color: "#0B1220" }}
                            >
                              {app.title}
                            </Text>
                            <Text
                              size={200}
                              className={styles.statusText}
                              style={{ marginTop: 2, display: "block" }}
                            >
                              {app.company}
                            </Text>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Text className={styles.statusText}>
                          {app.location}
                        </Text>
                      </TableCell>

                      <TableCell>
                        <Text className={styles.statusText}>
                          {app.appliedDate}
                        </Text>
                      </TableCell>

                      <TableCell>
                        <div className={styles.pillWrapper}>
                          <StatusPill
                            status={getStatusType(app.status)}
                            label={app.status}
                            size="sm"
                          />
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className={styles.pillWrapper}>
                          <StatusPill
                            status={
                              app.interviewStatus === "Completed"
                                ? "success"
                                : app.interviewStatus === "In Progress"
                                ? "warning"
                                : "neutral"
                            }
                            label={app.interviewStatus}
                            size="sm"
                          />
                        </div>
                      </TableCell>

                      <TableCell>
                        {app.score != null ? (
                          <Text className={styles.scoreText}>
                            {app.score}%
                          </Text>
                        ) : (
                          <Text className={styles.statusText}>-</Text>
                        )}
                      </TableCell>

                      <TableCell className={styles.actionsCell}>
                        {app.interviewStatus === "Not Started" ? (
                          <Button
                            size="small"
                            appearance="primary"
                            className={styles.primaryActionButton}
                            style={{
                              backgroundColor: "#0118D8",
                              border: "none",
                            }}
                            onClick={() =>
                              onNavigate("interview-room", {
                                applicationId: app.id,
                              })
                            }
                          >
                            <Play20Regular style={{ marginRight: 6 }} />
                            Start Interview
                          </Button>
                        ) : app.interviewStatus === "In Progress" ? (
                          <Button
                            size="small"
                            appearance="outline"
                            className={styles.warningActionButton}
                            style={{
                              color: "#F59E0B",
                              borderColor: "#F59E0B",
                            }}
                            onClick={() =>
                              onNavigate("interview", {
                                applicationId: app.id,
                              })
                            }
                          >
                            <Play20Regular style={{ marginRight: 6 }} />
                            Continue
                          </Button>
                        ) : (
                          <Menu>
                            <MenuTrigger disableButtonEnhancement>
                              <button
                                type="button"
                                className={styles.menuTriggerButton}
                              >
                                <MoreVertical20Regular />
                              </button>
                            </MenuTrigger>
                            <MenuPopover>
                              <MenuList>
                                <MenuItem
                                  icon={<DataHistogram20Regular />}
                                  onClick={() =>
                                    onNavigate("results", {
                                      applicationId: app.id,
                                    })
                                  }
                                >
                                  View Results
                                </MenuItem>
                                <MenuItem
                                  icon={<Eye20Regular />}
                                  onClick={() =>
                                    onNavigate("job-details", {
                                      applicationId: app.id,
                                    })
                                  }
                                >
                                  View Job
                                </MenuItem>
                                <MenuItem
                                  icon={<Chat20Regular />}
                                  onClick={() =>
                                    onNavigate("contact-employer", {
                                      applicationId: app.id,
                                    })
                                  }
                                >
                                  Contact Employer
                                </MenuItem>
                                <MenuItem
                                  icon={<Open20Regular />}
                                  onClick={() =>
                                    onNavigate("company-profile", {
                                      applicationId: app.id,
                                    })
                                  }
                                >
                                  Company Profile
                                </MenuItem>
                              </MenuList>
                            </MenuPopover>
                          </Menu>
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

      {filteredApplications.length === 0 && (
        <Card className={styles.emptyCard} appearance="outline">
          <div className={styles.emptyIconWrapper}>
            <Search20Regular style={{ fontSize: 32, color: "#0B1220" }} />
          </div>
          <Text
            as="h3"
            weight="semibold"
            size={500}
            style={{ color: "#0B1220" }}
          >
            No Applications Found
          </Text>
          <Text size={300} className={styles.emptyTextMuted}>
            Try adjusting your filters or search query to find what you're
            looking for.
          </Text>
        </Card>
      )}
    </div>
  );
};
