import { useMemo, useState } from "react";
import {
  Card,
  Dropdown,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Option,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Tab,
  TabList,
  type TabValue,
  Text,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";

import {
  SearchRegular,
  MoreVerticalRegular,
  DataHistogram20Regular,
  ContactCard20Regular,
  Briefcase20Regular,
} from "@fluentui/react-icons";

import { StatusPill } from "../ui/StatusPill";

interface EmployerApplicantsProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
}

const mockApplicants = [
  {
    id: 1,
    candidate: "Sarah Chen",
    email: "sarah.chen@email.com",
    job: "Senior Frontend Developer",
    appliedDate: "Jan 15, 2025",
    interviewStatus: "Completed",
    score: 87,
    hiringStatus: "Under Review",
  },
  {
    id: 2,
    candidate: "Michael Rodriguez",
    email: "m.rodriguez@email.com",
    job: "Product Designer",
    appliedDate: "Jan 18, 2025",
    interviewStatus: "Pending",
    score: null,
    hiringStatus: "Invited",
  },
  {
    id: 3,
    candidate: "Jennifer Park",
    email: "jennifer.p@email.com",
    job: "Backend Engineer",
    appliedDate: "Jan 12, 2025",
    interviewStatus: "Completed",
    score: 92,
    hiringStatus: "Shortlisted",
  },
  {
    id: 4,
    candidate: "David Kim",
    email: "david.kim@email.com",
    job: "Senior Frontend Developer",
    appliedDate: "Jan 20, 2025",
    interviewStatus: "In Progress",
    score: null,
    hiringStatus: "Invited",
  },
  {
    id: 5,
    candidate: "Emily Watson",
    email: "emily.w@email.com",
    job: "DevOps Engineer",
    appliedDate: "Jan 10, 2025",
    interviewStatus: "Completed",
    score: 78,
    hiringStatus: "Rejected",
  },
  {
    id: 6,
    candidate: "Alex Turner",
    email: "alex.turner@email.com",
    job: "Product Designer",
    appliedDate: "Jan 22, 2025",
    interviewStatus: "Completed",
    score: 95,
    hiringStatus: "Hired",
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

  cardBase: {
    ...shorthands.borderRadius("12px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    backgroundColor: "#FFFFFF",
  },

  filterCard: {
    padding: "12px 16px",
  },

  filtersRow: {
    display: "flex",
    flexDirection: "column",
    rowGap: "12px",

    "@media (min-width: 768px)": {
      flexDirection: "row",
      alignItems: "center",
      columnGap: "12px",
    },
  },

  searchWrapper: {
    position: "relative",
    flex: 1,
    width: "100%",
    maxWidth: "100%",
  },

  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#5B6475",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    zIndex:"1"
  },

  searchInput: {
    width: "100%",
    height: "40px",
    paddingLeft: "32px",
    fontSize: "14px",
    backgroundColor: "#FFFFFF",
    ...shorthands.borderRadius("8px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.18)"),

    "::placeholder": {
      color: "#9CA3AF",
    },
  },

  filterDropdown: {
    minWidth: "180px",
  },

  tabsCard: {
    display: "inline-flex",
    width: "auto",
    ...shorthands.borderRadius("999px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    backgroundColor: "#FFFFFF",
    padding: "4px 8px",
    alignSelf: "flex-start",
  },

  tabList: {
    columnGap: "6px",
    rowGap: "6px",
    flexWrap: "wrap",
  },

  tableCard: {
    padding: 0,
    overflow: "hidden",
    borderRadius: "18px",
  },

  tableWrapper: {
    overflowX: "auto",
    overflowY: "auto",      
    maxHeight: "60vh",     
    backgroundColor: "#FFFFFF",
  },

  table: {
    width: "100%",
    minWidth: "1100px",     
    tableLayout: "fixed",  
  },

  tableHeaderRow: {
    background: "linear-gradient(to bottom, #F9FAFF, #EEF2FF)",
    borderBottom: "1px solid #E5E7EB",
    height: "44px",
  },

  tableHeaderCell: {
    fontSize: "0.8rem",
    color: "#4B5563",
    fontWeight: 600,
    padding: "12px 20px",
    whiteSpace: "nowrap",         
  },

  tableRow: {
    height: "56px",
    backgroundColor: "#FFFFFF",
    ":not(:last-child)": {
      borderBottom: "1px solid #F3F4F6",
    },
    ":hover": {
      backgroundColor: "#F9FAFF",
    },
  },

  tableCell: {
    padding: "14px 20px",
    fontSize: "0.85rem",
    whiteSpace: "nowrap",        
    overflow: "hidden",

  },

  statusCell: {
    padding: "14px 20px",
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  subtleIconButton: {
    ...shorthands.borderRadius("999px"),
    ...shorthands.padding("4px"),
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    ":hover": {
      backgroundColor: "#F3F4F6",
    },
  },
});

export function EmployerApplicants({ onNavigate }: EmployerApplicantsProps) {
  const styles = useStyles();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<TabValue>("all");
  const [jobFilter, setJobFilter] = useState("All-jobs");
  const [interviewFilter, setInterviewFilter] = useState("All-status");

  const tabCounts = useMemo(() => {
    const counts = {
      Invited: 0,
      "Under Review": 0,
      Shortlisted: 0,
      hired: 0,
      rejected: 0,
    };

    mockApplicants.forEach((a) => {
      const key = a.hiringStatus
        .toLowerCase()
        .replace(" ", "-") as keyof typeof counts;
      if (counts[key] !== undefined) {
        counts[key] += 1;
      }
    });

    return counts;
  }, []);

  const filteredApplicants = useMemo(() => {
    return mockApplicants.filter((applicant) => {
      if (selectedTab !== "all") {
        const normalizedHiring = applicant.hiringStatus
          .toLowerCase()
          .replace(" ", "-");
        if (normalizedHiring !== selectedTab) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inCandidate = applicant.candidate.toLowerCase().includes(q);
        const inEmail = applicant.email.toLowerCase().includes(q);
        const inJob = applicant.job.toLowerCase().includes(q);

        if (!inCandidate && !inEmail && !inJob) {
          return false;
        }
      }

      if (jobFilter !== "All-jobs") {
        if (
          jobFilter === "frontend" &&
          applicant.job !== "Senior Frontend Developer"
        ) {
          return false;
        }
        if (jobFilter === "designer" && applicant.job !== "Product Designer") {
          return false;
        }
        if (jobFilter === "backend" && applicant.job !== "Backend Engineer") {
          return false;
        }
        if (jobFilter === "devops" && applicant.job !== "DevOps Engineer") {
          return false;
        }
      }

      if (interviewFilter !== "All-status") {
        if (
          interviewFilter === "Completed" &&
          applicant.interviewStatus !== "Completed"
        ) {
          return false;
        }
        if (
          interviewFilter === "pending" &&
          applicant.interviewStatus !== "Pending"
        ) {
          return false;
        }
        if (
          interviewFilter === "in-progress" &&
          applicant.interviewStatus !== "In Progress"
        ) {
          return false;
        }
      }

      return true;
    });
  }, [selectedTab, searchQuery, jobFilter, interviewFilter]);

  return (
    <div className={styles.root}>
      <Card className={`${styles.cardBase} ${styles.filterCard}`}>
        <div className={styles.filtersRow}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <SearchRegular />
            </span>
            <Input
              placeholder="Search by name, email, or job..."
              value={searchQuery}
              onChange={(_, data) => setSearchQuery(data.value)}
              className={styles.searchInput}
            />
          </div>

          <Dropdown
            className={styles.filterDropdown}
            defaultValue="All Jobs"
            onOptionSelect={(_, data) =>
              setJobFilter((data.optionValue as string) ?? "all-jobs")
            }
          >
            <Option value="all-jobs">All Jobs</Option>
            <Option value="frontend">Senior Frontend Developer</Option>
            <Option value="designer">Product Designer</Option>
            <Option value="backend">Backend Engineer</Option>
            <Option value="devops">DevOps Engineer</Option>
          </Dropdown>

          <Dropdown
            className={styles.filterDropdown}
            defaultValue="All Interview Status"
            onOptionSelect={(_, data) =>
              setInterviewFilter((data.optionValue as string) ?? "all-status")
            }
          >
            <Option value="all-status">All Interview Status</Option>
            <Option value="Completed">Completed</Option>
            <Option value="pending">Pending</Option>
            <Option value="in-progress">In Progress</Option>
          </Dropdown>
        </div>
      </Card>

      <Card className={`${styles.tabsCard}`}>
        <TabList
          selectedValue={selectedTab}
          onTabSelect={(_, data) => setSelectedTab(data.value)}
          className={styles.tabList}
        >
          <Tab value="all">All ({mockApplicants.length})</Tab>
          <Tab value="Invited">Invited ({tabCounts.Invited})</Tab>
          <Tab value="Under Review">
            Under Review ({tabCounts["Under Review"]})
          </Tab>
          <Tab value="Shortlisted">Shortlisted ({tabCounts.Shortlisted})</Tab>
          <Tab value="hired">Hired ({tabCounts.hired})</Tab>
          <Tab value="rejected">Rejected ({tabCounts.rejected})</Tab>
        </TabList>
      </Card>

      <Card className={`${styles.cardBase} ${styles.tableCard}`}>
        <div className={styles.tableWrapper}>
          <Table aria-label="Applicants table" className={styles.table}>
            <TableHeader>
              <TableRow className={styles.tableHeaderRow}>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Candidate
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Email
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Job Role
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Applied Date
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Score
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Interview Status
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Hiring Status
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Actions
                </TableHeaderCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredApplicants.map((applicant) => (
                <TableRow key={applicant.id} className={styles.tableRow}>
                  <TableCell className={styles.tableCell}>
                    <Text weight="semibold" style={{ color: "#0B1220" }}>
                      {applicant.candidate}
                    </Text>
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    <Text style={{ color: "#5B6475" }}>{applicant.email}</Text>
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    <Text style={{ color: "#5B6475" }}>{applicant.job}</Text>
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    <Text style={{ color: "#5B6475" }}>
                      {applicant.appliedDate}
                    </Text>
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    {applicant.score != null ? (
                      <Text
                        style={{
                          color: tokens.colorBrandForeground1,
                          fontWeight: 500,
                        }}
                      >
                        {applicant.score}%
                      </Text>
                    ) : (
                      <Text style={{ color: "#9CA3AF" }}>-</Text>
                    )}
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    <StatusPill
                      status={
                        applicant.interviewStatus === "Completed"
                          ? "success"
                          : applicant.interviewStatus === "Pending"
                          ? "pending"
                          : applicant.interviewStatus === "In Progress"
                          ? "warning"
                          : "neutral"
                      }
                      label={applicant.interviewStatus}
                      size="sm"
                    />
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    <Dropdown
                      defaultValue={applicant.hiringStatus
                        .toLowerCase()
                        .replace(" ", "-")}
                      style={{ minWidth: 160 }}
                    >
                      <Option value="Invited">Invited</Option>
                      <Option value="Under Review">Under Review</Option>
                      <Option value="Shortlisted">Shortlisted</Option>
                      <Option value="Hired">Hired</Option>
                      <Option value="Rejected">Rejected</Option>
                    </Dropdown>
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    <Menu>
                      <MenuTrigger disableButtonEnhancement>
                        <button
                          type="button"
                          className={styles.subtleIconButton}
                          aria-label="More actions"
                        >
                          <MoreVerticalRegular />
                        </button>
                      </MenuTrigger>
                      <MenuPopover>
                        <MenuList>
                          <MenuItem
                            icon={<DataHistogram20Regular />}
                            onClick={() =>
                              onNavigate("Interview Analytics", {
                                candidateId: applicant.id,
                              })
                            }
                          >
                            View Analytics
                          </MenuItem>
                          <MenuItem icon={<ContactCard20Regular />}>
                            View Candidate
                          </MenuItem>
                          <MenuItem icon={<Briefcase20Regular />}>
                            View Job
                          </MenuItem>
                        </MenuList>
                      </MenuPopover>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}

              {filteredApplicants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className={styles.tableCell}>
                    <Text
                      style={{
                        display: "block",
                        textAlign: "center",
                        padding: "16px 0",
                        color: "#6B7280",
                      }}
                    >
                      No applicants match the current filters.
                    </Text>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
