import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { StatusPill } from "../ui/StatusPill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import {
  SearchRegular,
  MoreVerticalRegular,
  ContactCard20Regular,
  Briefcase20Regular,
  DataBarHorizontal20Regular,
} from "@fluentui/react-icons";

interface EmployerApplicantsProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
}

type ApiErrorBody = { message?: string };

const API_BASE =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders() } });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    try {
      const json = JSON.parse(text) as ApiErrorBody;
      throw new Error(json.message || `Request failed (${res.status})`);
    } catch {
      throw new Error(text || `Request failed (${res.status})`);
    }
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    try {
      const json = JSON.parse(text) as ApiErrorBody;
      throw new Error(json.message || `Request failed (${res.status})`);
    } catch {
      throw new Error(text || `Request failed (${res.status})`);
    }
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

type HiringStatus = "Invited" | "Under Review" | "Shortlisted" | "Hired" | "Rejected";
type InterviewStatus = "Completed" | "Pending" | "In Progress";

type HiringStatusApi = "PENDING" | "INVITED" | "UNDER_REVIEW" | "SHORTLISTED" | "HIRED" | "REJECTED";
type InterviewStatusApi = "PENDING" | "IN_PROGRESS" | "COMPLETED";

type PopulatedApplication = {
  _id: string;
  hiringStatus: HiringStatusApi;
  interviewStatus: InterviewStatusApi;
  createdAt: string;

  candidateId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };

  jobId:
    | string
    | {
        _id: string;
        title: string;
        company?: string;
        location?: string;
      };

  overallScore?: number | null;
};

type UiApplicantRow = {
  id: string;
  candidateId: string;
  candidate: string;
  email: string;
  jobId: string;
  job: string;
  appliedDate: string;
  interviewStatus: InterviewStatus;
  score: number | null;
  hiringStatus: HiringStatus;
};

function formatDate(d: string) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}

function hiringStatusToTabValue(s: HiringStatus) {
  return s.toLowerCase().replace(" ", "-"); // under-review
}

function apiHiringToUI(s: HiringStatusApi): HiringStatus {
  switch (s) {
    case "INVITED":
      return "Invited";
    case "UNDER_REVIEW":
      return "Under Review";
    case "SHORTLISTED":
      return "Shortlisted";
    case "HIRED":
      return "Hired";
    case "REJECTED":
      return "Rejected";
    default:
      return "Under Review";
  }
}

function uiHiringToApi(s: HiringStatus): HiringStatusApi {
  switch (s) {
    case "Invited":
      return "INVITED";
    case "Under Review":
      return "UNDER_REVIEW";
    case "Shortlisted":
      return "SHORTLISTED";
    case "Hired":
      return "HIRED";
    case "Rejected":
      return "REJECTED";
    default:
      return "UNDER_REVIEW";
  }
}

function apiInterviewToUI(s: InterviewStatusApi): InterviewStatus {
  switch (s) {
    case "COMPLETED":
      return "Completed";
    case "IN_PROGRESS":
      return "In Progress";
    default:
      return "Pending";
  }
}

function getCandidate(x: PopulatedApplication["candidateId"]) {
  if (typeof x === "string") return { id: x, name: "Unknown", email: "-" };
  return { id: x._id, name: x.name, email: x.email };
}

function getJob(x: PopulatedApplication["jobId"]) {
  if (typeof x === "string") return { id: x, title: "Unknown Job" };
  return { id: x._id, title: x.title };
}

export function EmployerApplicants({ onNavigate }: EmployerApplicantsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");

  const [jobFilter, setJobFilter] = useState<string>("All Jobs");
  const [interviewFilter, setInterviewFilter] = useState<string>("All Status");

  const [rows, setRows] = useState<UiApplicantRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiGet<PopulatedApplication[]>("/api/applications/employer");

        if (!alive) return;

        const mapped: UiApplicantRow[] = data.map((a) => {
          const c = getCandidate(a.candidateId);
          const j = getJob(a.jobId);

          return {
            id: a._id,
            candidateId: c.id,
            candidate: c.name,
            email: c.email,
            jobId: j.id,
            job: j.title,
            appliedDate: formatDate(a.createdAt),
            interviewStatus: apiInterviewToUI(a.interviewStatus),
            score: typeof a.overallScore === "number" ? a.overallScore : null,
            hiringStatus: apiHiringToUI(a.hiringStatus),
          };
        });

        setRows(mapped);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load applicants. Please try again.";
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const jobOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => set.add(r.job));
    return ["All Jobs", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  const filteredApplicants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return rows.filter((r) => {
      if (selectedTab !== "All") {
        if (hiringStatusToTabValue(r.hiringStatus) !== selectedTab) return false;
      }

      if (jobFilter !== "All Jobs" && r.job !== jobFilter) return false;

      if (interviewFilter !== "All Status") {
        if (interviewFilter === "In-progress") {
          if (r.interviewStatus !== "In Progress") return false;
        } else {
          if (r.interviewStatus !== (interviewFilter as InterviewStatus)) return false;
        }
      }

      if (!q) return true;
      return (
        r.candidate.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.job.toLowerCase().includes(q)
      );
    });
  }, [rows, searchQuery, selectedTab, jobFilter, interviewFilter]);

  const tabCounts = useMemo(() => {
    const counts = { all: rows.length, invited: 0, underReview: 0, shortlisted: 0, hired: 0, rejected: 0 };
    rows.forEach((r) => {
      if (r.hiringStatus === "Invited") counts.invited += 1;
      else if (r.hiringStatus === "Under Review") counts.underReview += 1;
      else if (r.hiringStatus === "Shortlisted") counts.shortlisted += 1;
      else if (r.hiringStatus === "Hired") counts.hired += 1;
      else if (r.hiringStatus === "Rejected") counts.rejected += 1;
    });
    return counts;
  }, [rows]);

  async function updateHiringStatus(applicationId: string, newStatus: HiringStatus) {
    // optimistic UI
    setRows((prev) => prev.map((r) => (r.id === applicationId ? { ...r, hiringStatus: newStatus } : r)));

    try {
      // ✅ backend expects `hiringStatus` (UPPERCASE ENUM)
      await apiPatch(`/api/applications/${applicationId}/status`, {
        hiringStatus: uiHiringToApi(newStatus),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to update status";
      setError(msg);
    }
  }

  const pageContainerStyle: React.CSSProperties = {
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
  };

  const filtersRowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "center",
  };

  const searchWrapperStyle: React.CSSProperties = {
    position: "relative",
    flex: 1,
    minWidth: 260,
  };

  const tabsListStyle: React.CSSProperties = {
    display: "inline-flex",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    border: "1px solid rgba(2,6,23,0.08)",
    padding: 4,
    borderRadius: 9999,
    marginTop: 8,
  };

  const tabsTriggerStyle: React.CSSProperties = {
    padding: "6px 12px",
    borderRadius: 9999,
    border: "none",
    background: "transparent",
    fontSize: 13,
    cursor: "pointer",
  };

  const tabsContentWrapperStyle: React.CSSProperties = { marginTop: 24 };

  return (
    <div style={pageContainerStyle}>
      <Card style={{ padding: 16, border: "1px solid rgba(2,6,23,0.08)" }}>
        <div style={filtersRowStyle}>
          <div style={searchWrapperStyle}>
            <SearchRegular
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 16,
                height: 16,
                color: "#5B6475",
              }}
            />
            <Input
              placeholder="Search by name, email, or job..."
              value={searchQuery}
              onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
              style={{ paddingLeft: 32, width: "95%" }}
            />
          </div>

          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger style={{ width: 190 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {jobOptions.map((j) => (
                <SelectItem key={j} value={j}>
                  {j}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={interviewFilter} onValueChange={setInterviewFilter}>
            <SelectTrigger style={{ width: 210 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Interview Status</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In-progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Tabs defaultValue="All" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList style={tabsListStyle}>
          <TabsTrigger value="All" style={tabsTriggerStyle}>
            All ({tabCounts.all})
          </TabsTrigger>
          <TabsTrigger value="invited" style={tabsTriggerStyle}>
            Invited ({tabCounts.invited})
          </TabsTrigger>
          <TabsTrigger value="under-review" style={tabsTriggerStyle}>
            Under Review ({tabCounts.underReview})
          </TabsTrigger>
          <TabsTrigger value="shortlisted" style={tabsTriggerStyle}>
            Shortlisted ({tabCounts.shortlisted})
          </TabsTrigger>
          <TabsTrigger value="hired" style={tabsTriggerStyle}>
            Hired ({tabCounts.hired})
          </TabsTrigger>
          <TabsTrigger value="rejected" style={tabsTriggerStyle}>
            Rejected ({tabCounts.rejected})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} style={tabsContentWrapperStyle}>
          <Card style={{ border: "1px solid rgba(2,6,23,0.08)", boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)" }}>
            <div style={{ overflowX: "auto" }}>
              <Table>
                <TableHeader>
                  <TableRow style={{ background: "linear-gradient(to right, rgba(1,24,216,0.06), rgba(27,86,253,0.06))" }}>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Job Role</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Interview Status</TableHead>
                    <TableHead>Hiring Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={8} style={{ color: "#5B6475", padding: 16 }}>
                        Loading applicants...
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && error && (
                    <TableRow>
                      <TableCell colSpan={8} style={{ color: "#dc2626", padding: 16 }}>
                        {error}
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && !error && filteredApplicants.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} style={{ color: "#5B6475", padding: 16 }}>
                        No applicants found.
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    !error &&
                    filteredApplicants.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <div style={{ color: "#0B1220", fontWeight: 500 }}>{a.candidate}</div>
                        </TableCell>
                        <TableCell style={{ color: "#5B6475" }}>{a.email}</TableCell>
                        <TableCell style={{ color: "#5B6475" }}>{a.job}</TableCell>
                        <TableCell style={{ color: "#5B6475" }}>{a.appliedDate}</TableCell>

                        <TableCell>
                          {a.score != null ? (
                            <span style={{ color: "#0118D8", fontWeight: 500 }}>{a.score}%</span>
                          ) : (
                            <span style={{ color: "#5B6475" }}>-</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <StatusPill
                            status={a.interviewStatus === "Completed" ? "success" : a.interviewStatus === "In Progress" ? "warning" : "info"}
                            label={a.interviewStatus}
                            size="sm"
                          />
                        </TableCell>

                        <TableCell>
                          <Select
                            value={hiringStatusToTabValue(a.hiringStatus)}
                            onValueChange={(v) => {
                              const next =
                                v === "invited"
                                  ? "Invited"
                                  : v === "under-review"
                                  ? "Under Review"
                                  : v === "shortlisted"
                                  ? "Shortlisted"
                                  : v === "hired"
                                  ? "Hired"
                                  : "Rejected";
                              updateHiringStatus(a.id, next);
                            }}
                          >
                            <SelectTrigger style={{ width: 160, height: 32 }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="invited">Invited</SelectItem>
                              <SelectItem value="under-review">Under Review</SelectItem>
                              <SelectItem value="shortlisted">Shortlisted</SelectItem>
                              <SelectItem value="hired">Hired</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <button
                                style={{
                                  height: 32,
                                  width: 32,
                                  borderRadius: 6,
                                  border: "none",
                                  background: "transparent",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                }}
                              >
                                <MoreVerticalRegular style={{ width: 16, height: 16 }} />
                              </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  onNavigate("analytics", { candidateId: a.candidateId, applicationId: a.id })
                                }
                              >
                                <span style={{ display: "flex", alignItems: "center" }}>
                                  <DataBarHorizontal20Regular style={{ marginRight: 8 }} />
                                  <span>View Analytics</span>
                                </span>
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => onNavigate("candidate", { candidateId: a.candidateId })}>
                                <span style={{ display: "flex", alignItems: "center" }}>
                                  <ContactCard20Regular style={{ marginRight: 8 }} />
                                  <span>View Candidate</span>
                                </span>
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => onNavigate("job", { jobId: a.jobId })}>
                                <span style={{ display: "flex", alignItems: "center" }}>
                                  <Briefcase20Regular style={{ marginRight: 8 }} />
                                  <span>View Job</span>
                                </span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
