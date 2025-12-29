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
  Spinner,
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
type TabValue = "all" | "pending" | "hired" | "rejected";

type HiringStatusApi =
  | "PENDING"
  | "INVITED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "HIRED"
  | "REJECTED";

type InterviewStatusApi = "PENDING" | "IN_PROGRESS" | "COMPLETED";

type JobPopulated =
  | string
  | {
      _id: string;
      title?: string;
      company?: string;
      location?: string;
    };

type ApplicationFromApi = {
  _id: string;
  jobId: JobPopulated;
  hiringStatus: HiringStatusApi;
  interviewStatus: InterviewStatusApi;
  overallScore?: number;
  createdAt: string;
};

type ApplicationUI = {
  id: string;
  company: string;
  companyLogo: string;
  title: string;
  location: string;
  appliedDate: string;
  status: ApplicationStatus;
  interviewStatus: InterviewStatus;
  score: number | null;
};

const API_BASE =
  (import.meta.env?.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:5000";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type ApiErrorBody = { message?: string };

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders() } });
  const raw = await res.text().catch(() => "");

  if (!res.ok) {
    try {
      const j = raw ? (JSON.parse(raw) as ApiErrorBody) : {};
      throw new Error(j?.message || `Request failed (${res.status})`);
    } catch {
      throw new Error(raw || `Request failed (${res.status})`);
    }
  }

  return raw ? (JSON.parse(raw) as T) : ({} as T);
}

function formatDate(d: string) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function companyInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "C";
}

function getJob(jobId: JobPopulated) {
  if (typeof jobId === "string") {
    return { title: "Unknown Job", company: "—", location: "—" };
  }
  return {
    title: jobId.title ?? "Unknown Job",
    company: jobId.company ?? "—",
    location: jobId.location ?? "—",
  };
}

function mapHiringToUI(h: HiringStatusApi): ApplicationStatus {
  switch (h) {
    case "HIRED":
      return "Hired";
    case "REJECTED":
      return "Rejected";
    case "SHORTLISTED":
      return "Shortlisted";
    case "UNDER_REVIEW":
      return "Under Review";
    case "INVITED":
      return "Pending Interview";
    case "PENDING":
    default:
      return "Pending Interview";
  }
}

function mapInterviewToUI(i: InterviewStatusApi): InterviewStatus {
  switch (i) {
    case "COMPLETED":
      return "Completed";
    case "IN_PROGRESS":
      return "In Progress";
    case "PENDING":
    default:
      return "Not Started";
  }
}

function toUI(a: ApplicationFromApi): ApplicationUI {
  const job = getJob(a.jobId);
  return {
    id: a._id,
    company: job.company,
    companyLogo: companyInitials(job.company),
    title: job.title,
    location: job.location,
    appliedDate: formatDate(a.createdAt),
    status: mapHiringToUI(a.hiringStatus),
    interviewStatus: mapInterviewToUI(a.interviewStatus),
    score: typeof a.overallScore === "number" ? a.overallScore : null,
  };
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

  searchInputWrapper: { position: "relative" },
  searchInput: { width: "100%", borderRadius: "8px" },

  tabsListWrapper: { marginTop: tokens.spacingVerticalM },
  tableWrapper: { width: "100%", overflowX: "auto" },

  tableHeaderRow: {
    backgroundImage:
      "linear-gradient(90deg, rgba(1,24,216,0.06), rgba(27,86,253,0.06))",
  },

  tableRowHover: { ":hover": { backgroundColor: "#F3F4F6" } },

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
    fontWeight: "600",
    flexShrink: 0,
  },

  statusText: { color: "#5B6475" },
  scoreText: { color: "#0118D8", fontWeight: "500" },

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
    ":hover": { backgroundColor: "#F3F4F6" },
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
    fontWeight: "500",
    color: "#0B1220",
    cursor: "pointer",
    border: "none",
    ":hover": { backgroundColor: "rgba(2,6,23,0.04)" },
  },

  tabItemSelected: {
    backgroundColor: "white",
    borderRadius: "999px",
    boxShadow: "0 0 0 2px #E5E7EB inset",
    fontWeight: "600",
    color: "#0B1220",
  },

  pillWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-start",
    whiteSpace: "nowrap",
  },

  actionsCell: { whiteSpace: "nowrap" },

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

  loadingRow: {
    padding: "14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#5B6475",
  },
});

export const CandidateApplications: React.FC<CandidateApplicationsProps> = ({ onNavigate }) => {
  const styles = useStyles();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState<TabValue>("all");

  const [apps, setApps] = React.useState<ApplicationUI[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const getStatusType = (status: ApplicationStatus) => {
    if (status === "Hired") return "success";
    if (status === "Rejected") return "danger";
    if (status === "Shortlisted") return "info";
    if (status === "Under Review") return "info";
    if (status === "Interview In Progress") return "warning";
    return "pending";
  };

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const qs = new URLSearchParams();
        qs.set("tab", selectedTab);
        if (searchQuery.trim()) qs.set("q", searchQuery.trim());

        const data = await apiGet<ApplicationFromApi[]>(`/api/applications/me?${qs.toString()}`);
        if (!alive) return;

        setApps(data.map(toUI));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load applications.";
        if (alive) {
          setError(msg);
          setApps([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedTab, searchQuery]);

  const pendingCount = React.useMemo(
    () => apps.filter((a) => a.status.includes("Pending") || a.status.includes("In Progress")).length,
    [apps]
  );
  const hiredCount = React.useMemo(() => apps.filter((a) => a.status === "Hired").length, [apps]);
  const rejectedCount = React.useMemo(() => apps.filter((a) => a.status === "Rejected").length, [apps]);

  return (
    <div className={styles.root}>
      <Card className={styles.searchCard} appearance="outline">
        <div className={styles.searchInputWrapper}>
          <Input
            className={styles.searchInput}
            contentBefore={<Search20Regular style={{ color: "#5B6475", fontSize: 16 }} />}
            placeholder="Search by title, company, or status..."
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
          <Tab value="all" className={selectedTab === "all" ? `${styles.tabItem} ${styles.tabItemSelected}` : styles.tabItem}>
            All Applications ({apps.length})
          </Tab>

          <Tab value="pending" className={selectedTab === "pending" ? `${styles.tabItem} ${styles.tabItemSelected}` : styles.tabItem}>
            Pending ({pendingCount})
          </Tab>

          <Tab value="hired" className={selectedTab === "hired" ? `${styles.tabItem} ${styles.tabItemSelected}` : styles.tabItem}>
            Hired ({hiredCount})
          </Tab>

          <Tab value="rejected" className={selectedTab === "rejected" ? `${styles.tabItem} ${styles.tabItemSelected}` : styles.tabItem}>
            Rejected ({rejectedCount})
          </Tab>
        </TabList>

        <div className={styles.tabsListWrapper}>
          <Card className={styles.appsTableCard} appearance="outline">
            <div className={styles.tableWrapper}>
              {loading && (
                <div className={styles.loadingRow}>
                  <Spinner size="small" /> Loading applications...
                </div>
              )}

              {!loading && error && <div style={{ padding: "14px", color: "#dc2626" }}>{error}</div>}

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
                  {apps.map((app) => (
                    <TableRow key={app.id} className={styles.tableRowHover}>
                      <TableCell>
                        <div className={styles.companyCell}>
                          <div className={styles.companyLogo}>{app.companyLogo}</div>
                          <div>
                            <Text weight="semibold" style={{ color: "#0B1220" }}>
                              {app.title}
                            </Text>
                            <Text size={200} className={styles.statusText} style={{ marginTop: 2, display: "block" }}>
                              {app.company}
                            </Text>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Text className={styles.statusText}>{app.location}</Text>
                      </TableCell>

                      <TableCell>
                        <Text className={styles.statusText}>{app.appliedDate}</Text>
                      </TableCell>

                      <TableCell>
                        <div className={styles.pillWrapper}>
                          <StatusPill status={getStatusType(app.status)} label={app.status} size="sm" />
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
                          <Text className={styles.scoreText}>{app.score}%</Text>
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
                            style={{ backgroundColor: "#0118D8", border: "none" }}
                            onClick={() => onNavigate("interview-room", { applicationId: app.id })}
                          >
                            <Play20Regular style={{ marginRight: 6 }} />
                            Start Interview
                          </Button>
                        ) : app.interviewStatus === "In Progress" ? (
                          <Button
                            size="small"
                            appearance="outline"
                            className={styles.warningActionButton}
                            style={{ color: "#F59E0B", borderColor: "#F59E0B" }}
                            onClick={() => onNavigate("interview", { applicationId: app.id })}
                          >
                            <Play20Regular style={{ marginRight: 6 }} />
                            Continue
                          </Button>
                        ) : (
                          <Menu>
                            <MenuTrigger disableButtonEnhancement>
                              <button type="button" className={styles.menuTriggerButton}>
                                <MoreVertical20Regular />
                              </button>
                            </MenuTrigger>
                            <MenuPopover>
                              <MenuList>
                                <MenuItem icon={<DataHistogram20Regular />} onClick={() => onNavigate("results", { applicationId: app.id })}>
                                  View Results
                                </MenuItem>
                                <MenuItem icon={<Eye20Regular />} onClick={() => onNavigate("job-details", { applicationId: app.id })}>
                                  View Job
                                </MenuItem>
                                <MenuItem icon={<Chat20Regular />} onClick={() => onNavigate("contact-employer", { applicationId: app.id })}>
                                  Contact Employer
                                </MenuItem>
                                <MenuItem icon={<Open20Regular />} onClick={() => onNavigate("company-profile", { applicationId: app.id })}>
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

              {!loading && !error && apps.length === 0 && (
                <Card className={styles.emptyCard} appearance="outline">
                  <div className={styles.emptyIconWrapper}>
                    <Search20Regular style={{ fontSize: 32, color: "#0B1220" }} />
                  </div>
                  <Text as="h3" weight="semibold" size={500} style={{ color: "#0B1220" }}>
                    No Applications Found
                  </Text>
                  <Text size={300} className={styles.emptyTextMuted}>
                    Try adjusting your filters or search query to find what you're looking for.
                  </Text>
                </Card>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
