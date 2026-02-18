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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
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
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL?.replace(
    /\/$/,
    ""
  ) || "http://localhost:5000";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...(init?.headers || {}), ...authHeaders() },
  });

  const contentType = res.headers.get("content-type") || "";
  const raw = await res.text().catch(() => "");

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    if (contentType.includes("application/json")) {
      try {
        const json = JSON.parse(raw) as ApiErrorBody;
        msg = json.message || msg;
      } catch {
        // ignore
      }
    }
    throw new Error(raw.trim() ? msg : `Request failed (${res.status})`);
  }

  if (!raw.trim()) return {} as T;
  if (!contentType.includes("application/json")) {
    throw new Error(`Expected JSON but got "${contentType || "unknown"}"`);
  }
  return JSON.parse(raw) as T;
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiJson<T>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

type HiringStatusApi =
  | "PENDING"
  | "INVITED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "HIRED"
  | "REJECTED";

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
        companyName?: string;
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
  interviewStatus: InterviewStatusApi;
  score: number | null;
  hiringStatus: HiringStatusApi;
};

interface CandidateProfile {
  name?: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  experienceLevel?: string;
  about?: string;
  skills?: string[];
  linkedin?: string;
  github?: string;
  portfolio?: string;
  resumeUrl?: string;
  resumeFileName?: string;
}

interface JobDetails {
  title?: string;
  location?: string;
  workType?: string;
  jobType?: string;
  description?: string;
  about?: string;
  techStack?: string[];
  salaryRange?:
    | string
    | {
        currency?: string;
        start?: string | number;
        end?: string | number;
      };
  workExperience?: string | number;
  interviewSettings?: {
    interviewDuration?: number;
    difficultyLevel?: string;
  };
}

type TabCounts = {
  all: number;
  pending: number;
  invited: number;
  underReview: number;
  shortlisted: number;
  hired: number;
  rejected: number;
};

function formatDate(d: string) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function interviewFilterToApi(v: string): InterviewStatusApi | undefined {
  if (v === "All Status") return undefined;
  if (v === "Completed") return "COMPLETED";
  if (v === "Pending") return "PENDING";
  if (v === "In-progress") return "IN_PROGRESS";
  return undefined;
}

function getCandidate(x: PopulatedApplication["candidateId"]) {
  if (typeof x === "string") return { id: x, name: "Unknown", email: "-" };
  return { id: x._id, name: x.name, email: x.email };
}

function getJob(x: PopulatedApplication["jobId"]) {
  if (typeof x === "string") return { id: x, title: "Unknown Job" };
  return { id: x._id, title: x.title };
}

function hiringLabelApi(v: HiringStatusApi) {
  switch (v) {
    case "PENDING":
      return "Pending";
    case "INVITED":
      return "Invited";
    case "UNDER_REVIEW":
      return "Under Review";
    case "SHORTLISTED":
      return "Shortlisted";
    case "HIRED":
      return "Hired";
    default:
      return "Rejected";
  }
}

function interviewLabel(v: InterviewStatusApi) {
  if (v === "COMPLETED") return "Completed";
  if (v === "IN_PROGRESS") return "In Progress";
  return "Pending";
}

function interviewPill(v: InterviewStatusApi): "success" | "warning" | "info" {
  if (v === "COMPLETED") return "success";
  if (v === "IN_PROGRESS") return "warning";
  return "info";
}

export function EmployerApplicants({ onNavigate }: EmployerApplicantsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");

  const [jobFilter, setJobFilter] = useState<string>("All Jobs");
  const [interviewFilter, setInterviewFilter] = useState<string>("All Status");

  const [rows, setRows] = useState<UiApplicantRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [tabCounts, setTabCounts] = useState<TabCounts>({
    all: 0,
    pending: 0,
    invited: 0,
    underReview: 0,
    shortlisted: 0,
    hired: 0,
    rejected: 0,
  });

  const [candidateSheetOpen, setCandidateSheetOpen] = useState(false);
  const [jobSheetOpen, setJobSheetOpen] = useState(false);
  const [candidateData, setCandidateData] = useState<CandidateProfile | null>(null);
  const [jobData, setJobData] = useState<JobDetails | null>(null);
  const [loadingCandidate, setLoadingCandidate] = useState(false);
  const [loadingJob, setLoadingJob] = useState(false);

  const jobOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => set.add(r.job));
    return ["All Jobs", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  async function loadCountsSafe(fallbackRows?: UiApplicantRow[]) {
    try {
      const c = await apiJson<TabCounts>("/api/applications/employer/counts");
      setTabCounts(c);
    } catch {
      if (!fallbackRows) return;

      const map: Record<HiringStatusApi, number> = {
        PENDING: 0,
        INVITED: 0,
        UNDER_REVIEW: 0,
        SHORTLISTED: 0,
        HIRED: 0,
        REJECTED: 0,
      };
      for (const r of fallbackRows) map[r.hiringStatus] += 1;

      setTabCounts({
        all:
          map.PENDING +
          map.INVITED +
          map.UNDER_REVIEW +
          map.SHORTLISTED +
          map.HIRED +
          map.REJECTED,
        pending: map.PENDING,
        invited: map.INVITED,
        underReview: map.UNDER_REVIEW,
        shortlisted: map.SHORTLISTED,
        hired: map.HIRED,
        rejected: map.REJECTED,
      });
    }
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        params.set("tab", selectedTab === "All" ? "all" : selectedTab);
        params.set("limit", "200");

        const q = searchQuery.trim();
        if (q) params.set("q", q);

        if (jobFilter !== "All Jobs") params.set("jobTitle", jobFilter);

        const apiInterview = interviewFilterToApi(interviewFilter);
        if (apiInterview) params.set("interviewStatus", apiInterview);

        const data = await apiJson<PopulatedApplication[]>(
          `/api/applications/employer?${params.toString()}`
        );

        if (!alive) return;

        const mapped: UiApplicantRow[] = (data || []).map((a) => {
          const c = getCandidate(a.candidateId);
          const j = getJob(a.jobId);

          const isCompletedPending =
            a.interviewStatus === "COMPLETED" &&
            (a.hiringStatus === "PENDING" || a.hiringStatus === "INVITED");

          return {
            id: a._id,
            candidateId: c.id,
            candidate: c.name,
            email: c.email,
            jobId: j.id,
            job: j.title,
            appliedDate: formatDate(a.createdAt),
            interviewStatus: a.interviewStatus,
            score: typeof a.overallScore === "number" ? a.overallScore : null,
            hiringStatus: isCompletedPending ? "UNDER_REVIEW" : a.hiringStatus,
          };
        });

        setRows(mapped);
        await loadCountsSafe(mapped);
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Failed to load applicants. Please try again.";
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedTab, searchQuery, jobFilter, interviewFilter]);

  async function updateHiringStatus(applicationId: string, next: HiringStatusApi) {
    setRows((prev) =>
      prev.map((r) => (r.id === applicationId ? { ...r, hiringStatus: next } : r))
    );

    try {
      await apiPatch(`/api/applications/${applicationId}/status`, { hiringStatus: next });
      setRows((prev) => {
        void loadCountsSafe(prev);
        return prev;
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to update status";
      setError(msg);
    }
  }

  async function handleViewCandidate(candidateId: string) {
    setCandidateSheetOpen(true);
    setLoadingCandidate(true);
    setCandidateData(null);

    try {
      const data = await apiJson<CandidateProfile>(`/api/candidates/profile/${candidateId}`);
      setCandidateData(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load candidate";
      setError(msg);
    } finally {
      setLoadingCandidate(false);
    }
  }

  async function handleViewJob(jobId: string) {
    setJobSheetOpen(true);
    setLoadingJob(true);
    setJobData(null);

    try {
      const data = await apiJson<JobDetails>(`/api/jobs/${jobId}`);
      setJobData(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load job";
      setError(msg);
    } finally {
      setLoadingJob(false);
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
    flexWrap: "wrap",
  };

  const tabsTriggerStyle: React.CSSProperties = {
    padding: "6px 12px",
    borderRadius: 9999,
    border: "none",
    background: "transparent",
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  const tabsContentWrapperStyle: React.CSSProperties = { marginTop: 24 };

  const cellTextStyle: React.CSSProperties = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const tableWrapStyle: React.CSSProperties = { overflow: "visible" };
  const tableStyle: React.CSSProperties = { width: "100%", tableLayout: "fixed" };

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
              <SelectValue placeholder="All Jobs" />
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
              <SelectValue placeholder="All Interview Status" />
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
          <TabsTrigger value="pending" style={tabsTriggerStyle}>
            Pending ({tabCounts.pending})
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
          <Card
            style={{
              border: "1px solid rgba(2,6,23,0.08)",
              boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
              overflow: "visible",
            }}
          >
            <div style={tableWrapStyle}>
              <Table style={tableStyle}>
                <TableHeader>
                  <TableRow
                    style={{
                      background:
                        "linear-gradient(to right, rgba(1,24,216,0.06), rgba(27,86,253,0.06))",
                    }}
                  >
                    <TableHead style={{ width: 220 }}>Candidate</TableHead>
                    <TableHead style={{ width: 240 }}>Email</TableHead>
                    <TableHead style={{ width: 220 }}>Job Role</TableHead>
                    <TableHead style={{ width: 140 }}>Applied Date</TableHead>
                    <TableHead style={{ width: 90 }}>Score</TableHead>
                    <TableHead style={{ width: 160 }}>Interview Status</TableHead>
                    <TableHead style={{ width: 180 }}>Hiring Status</TableHead>
                    <TableHead style={{ width: 90 }}>Actions</TableHead>
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

                  {!loading && !error && rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} style={{ color: "#5B6475", padding: 16 }}>
                        No applicants found.
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    !error &&
                    rows.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <div style={{ color: "#0B1220", fontWeight: 500, ...cellTextStyle }}>
                            {a.candidate}
                          </div>
                        </TableCell>

                        <TableCell style={{ color: "#5B6475", ...cellTextStyle }}>
                          {a.email}
                        </TableCell>

                        <TableCell style={{ color: "#5B6475", ...cellTextStyle }}>{a.job}</TableCell>

                        <TableCell style={{ color: "#5B6475", ...cellTextStyle }}>
                          {a.appliedDate}
                        </TableCell>

                        <TableCell>
                          {a.score != null ? (
                            <span style={{ color: "#0118D8", fontWeight: 500 }}>{a.score}%</span>
                          ) : (
                            <span style={{ color: "#5B6475" }}>-</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <StatusPill
                            status={interviewPill(a.interviewStatus)}
                            label={interviewLabel(a.interviewStatus)}
                            size="sm"
                          />
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <button
                                type="button"
                                style={{
                                  width: 170,
                                  height: 32,
                                  borderRadius: 6,
                                  border: "1px solid rgba(2,6,23,0.12)",
                                  background: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "0 10px",
                                  cursor: "pointer",
                                  fontSize: 13,
                                  color: "#0B1220",
                                }}
                              >
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {hiringLabelApi(a.hiringStatus)}
                                </span>
                                <span style={{ opacity: 0.7 }}>▾</span>
                              </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => updateHiringStatus(a.id, "PENDING")}>
                                Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateHiringStatus(a.id, "INVITED")}>
                                Invited
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateHiringStatus(a.id, "UNDER_REVIEW")}>
                                Under Review
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateHiringStatus(a.id, "SHORTLISTED")}>
                                Shortlisted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateHiringStatus(a.id, "HIRED")}>
                                Hired
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateHiringStatus(a.id, "REJECTED")}>
                                Rejected
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <button
                                type="button"
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
                                  onNavigate("analytics", {
                                    candidateId: a.candidateId,
                                    applicationId: a.id,
                                  })
                                }
                              >
                                <span style={{ display: "flex", alignItems: "center" }}>
                                  <DataBarHorizontal20Regular style={{ marginRight: 8 }} />
                                  <span>View Analytics</span>
                                </span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleViewCandidate(a.candidateId)}
                              >
                                <span style={{ display: "flex", alignItems: "center" }}>
                                  <ContactCard20Regular style={{ marginRight: 8 }} />
                                  <span>View Candidate</span>
                                </span>
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => handleViewJob(a.jobId)}>
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

      <Sheet open={candidateSheetOpen} onOpenChange={setCandidateSheetOpen}>
        <SheetContent side="right" style={{ width: "500px", maxWidth: "90vw", overflow: "auto", padding: "24px" }}>
          <SheetHeader>
            <SheetTitle>Candidate Profile</SheetTitle>
            <SheetDescription>View candidate information and details</SheetDescription>
          </SheetHeader>

          {loadingCandidate && (
            <div style={{ padding: "24px", textAlign: "center", color: "#5B6475" }}>
              Loading candidate profile...
            </div>
          )}

          {!loadingCandidate && candidateData && (
            <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#0B1220", marginBottom: "4px" }}>
                  {String(candidateData.name || "Unknown")}
                </div>
                {candidateData.headline && (
                  <div style={{ fontSize: "14px", color: "#5B6475", marginBottom: "8px" }}>
                    {String(candidateData.headline)}
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px solid rgba(2,6,23,0.08)", paddingTop: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#0B1220", marginBottom: "12px" }}>
                  Contact Information
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {candidateData.email && (
                    <div style={{ fontSize: "13px" }}>
                      <span style={{ color: "#6B7280", width: "80px", display: "inline-block" }}>Email:</span>
                      <span style={{ color: "#0B1220" }}>{String(candidateData.email)}</span>
                    </div>
                  )}
                  {candidateData.phone && (
                    <div style={{ fontSize: "13px" }}>
                      <span style={{ color: "#6B7280", width: "80px", display: "inline-block" }}>Phone:</span>
                      <span style={{ color: "#0B1220" }}>{String(candidateData.phone)}</span>
                    </div>
                  )}
                  {candidateData.location && (
                    <div style={{ fontSize: "13px" }}>
                      <span style={{ color: "#6B7280", width: "80px", display: "inline-block" }}>Location:</span>
                      <span style={{ color: "#0B1220" }}>{String(candidateData.location)}</span>
                    </div>
                  )}
                  {candidateData.experienceLevel && (
                    <div style={{ fontSize: "13px" }}>
                      <span style={{ color: "#6B7280", width: "80px", display: "inline-block" }}>Level:</span>
                      <span style={{ color: "#0B1220" }}>{String(candidateData.experienceLevel)}</span>
                    </div>
                  )}
                </div>
              </div>

              {candidateData.about && (
                <div style={{ borderTop: "1px solid rgba(2,6,23,0.08)", paddingTop: "20px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0B1220", marginBottom: "8px" }}>
                    About
                  </div>
                  <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {String(candidateData.about)}
                  </div>
                </div>
              )}

              {Array.isArray(candidateData.skills) && candidateData.skills.length > 0 && (
                <div style={{ borderTop: "1px solid rgba(2,6,23,0.08)", paddingTop: "20px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0B1220", marginBottom: "12px" }}>
                    Skills
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {candidateData.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: "#E9DFC3",
                          color: "#0B1220",
                          border: "1px solid #E9DFC3",
                          borderRadius: "999px",
                          padding: "6px 10px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {String(skill)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(candidateData.linkedin || candidateData.github || candidateData.portfolio) && (
                <div style={{ borderTop: "1px solid rgba(2,6,23,0.08)", paddingTop: "20px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0B1220", marginBottom: "12px" }}>
                    Links
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {candidateData.linkedin && (
                      <a
                        href={String(candidateData.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "13px", color: "#0118D8", textDecoration: "none" }}
                      >
                        LinkedIn Profile →
                      </a>
                    )}
                    {candidateData.github && (
                      <a
                        href={String(candidateData.github)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "13px", color: "#0118D8", textDecoration: "none" }}
                      >
                        GitHub Profile →
                      </a>
                    )}
                    {candidateData.portfolio && (
                      <a
                        href={String(candidateData.portfolio)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "13px", color: "#0118D8", textDecoration: "none" }}
                      >
                        Portfolio →
                      </a>
                    )}
                  </div>
                </div>
              )}

              {candidateData.resumeUrl && (
                <div style={{ borderTop: "1px solid rgba(2,6,23,0.08)", paddingTop: "20px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0B1220", marginBottom: "12px" }}>
                    Resume
                  </div>
                  <a
                    href={String(candidateData.resumeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "13px",
                      color: "#0118D8",
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    {candidateData.resumeFileName
                      ? String(candidateData.resumeFileName)
                      : "View Resume"} →
                  </a>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={jobSheetOpen} onOpenChange={setJobSheetOpen}>
        <SheetContent side="right" style={{ width: "500px", maxWidth: "90vw", overflow: "auto", padding: "24px" }}>
          <SheetHeader>
            <SheetTitle>Job Details</SheetTitle>
            <SheetDescription>View job description and requirements</SheetDescription>
          </SheetHeader>

          {loadingJob && (
            <div style={{ padding: "24px", textAlign: "center", color: "#5B6475" }}>
              Loading job details...
            </div>
          )}

          {!loadingJob && jobData && (
            <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#0B1220", marginBottom: "4px" }}>
                  {String(jobData.title || "Untitled Job")}
                </div>
                <div style={{ fontSize: "14px", color: "#5B6475" }}>
                  {[jobData.location, jobData.workType, jobData.jobType]
                    .filter(Boolean)
                    .map(String)
                    .join(" • ")}
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(2,6,23,0.08)", paddingTop: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#0B1220", marginBottom: "8px" }}>
                  Description
                </div>
                <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {String(jobData.description || jobData.about || "No description available")}
                </div>
              </div>

              {Array.isArray(jobData.techStack) && jobData.techStack.length > 0 && (
                <div style={{ borderTop: "1px solid rgba(2,6,23,0.08)", paddingTop: "20px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0B1220", marginBottom: "12px" }}>
                    Tech Stack
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {jobData.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: "#E9DFC3",
                          color: "#0B1220",
                          border: "1px solid #E9DFC3",
                          borderRadius: "999px",
                          padding: "6px 10px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {String(tech)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ borderTop: "1px solid rgba(2,6,23,0.08)", paddingTop: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#0B1220", marginBottom: "12px" }}>
                  Job Details
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {jobData.salaryRange && (
                    <div style={{ fontSize: "13px" }}>
                      <span style={{ color: "#6B7280", width: "120px", display: "inline-block" }}>Salary:</span>
                      <span style={{ color: "#0B1220" }}>
                        {typeof jobData.salaryRange === "string"
                          ? jobData.salaryRange
                          : typeof jobData.salaryRange === "object" && jobData.salaryRange
                          ? `${jobData.salaryRange.currency || ""}${
                              jobData.salaryRange.start || ""
                            } - ${jobData.salaryRange.currency || ""}${
                              jobData.salaryRange.end || ""
                            }`
                          : "-"}
                      </span>
                    </div>
                  )}
                  {jobData.workExperience && (
                    <div style={{ fontSize: "13px" }}>
                      <span style={{ color: "#6B7280", width: "120px", display: "inline-block" }}>Experience:</span>
                      <span style={{ color: "#0B1220" }}>{String(jobData.workExperience)}+ years</span>
                    </div>
                  )}
                  {jobData.interviewSettings?.interviewDuration && (
                    <div style={{ fontSize: "13px" }}>
                      <span style={{ color: "#6B7280", width: "120px", display: "inline-block" }}>
                        Interview Duration:
                      </span>
                      <span style={{ color: "#0B1220" }}>
                        {String(jobData.interviewSettings.interviewDuration)} minutes
                      </span>
                    </div>
                  )}
                  {jobData.interviewSettings?.difficultyLevel && (
                    <div style={{ fontSize: "13px" }}>
                      <span style={{ color: "#6B7280", width: "120px", display: "inline-block" }}>Difficulty:</span>
                      <span style={{ color: "#0B1220" }}>
                        {String(jobData.interviewSettings.difficultyLevel)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
