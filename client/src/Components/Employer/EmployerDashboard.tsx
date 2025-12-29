import React, { useEffect, useMemo, useState } from "react";
import { AnimatedStats } from "../ui/AnimatedStats";
import { QuickActions } from "../ui/QuickActions";
import { ActivityTimeline, type ActivityItem } from "../ui/ActivityTimeline";
import { StatusPill } from "../ui/StatusPill";

import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import {
  Briefcase20Regular,
  People20Regular,
  Clock20Regular,
  CheckmarkCircle20Regular,
  DismissCircle20Regular,
  MoreVerticalRegular,
  Eye20Regular,
  Edit20Regular,
  Delete20Regular,
} from "@fluentui/react-icons";

interface EmployerDashboardProps {
  onNavigate: (page: string) => void;
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

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...authHeaders() },
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
    } else {
      const low = raw.toLowerCase();
      if (low.includes("<!doctype") || low.includes("<html")) {
        msg = `Request failed (${res.status})`;
      } else if (raw.trim()) {
        msg = raw;
      }
    }

    throw new Error(msg);
  }

  if (!raw.trim()) return {} as T;

  if (!contentType.includes("application/json")) {
    throw new Error(`Expected JSON but got "${contentType || "unknown"}"`);
  }

  return JSON.parse(raw) as T;
}

async function apiGetFirstOk<T>(paths: string[]): Promise<T> {
  let lastErr: unknown = null;

  for (const p of paths) {
    try {
      return await apiGet<T>(p);
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("All endpoints failed");
}

type DifficultyUI = "Easy" | "Medium" | "Hard";

function difficultyDbToUi(value: unknown): DifficultyUI {
  if (value === 1) return "Easy";
  if (value === 2) return "Medium";
  if (value === 3) return "Hard";

  const v = String(value ?? "").trim().toLowerCase();
  if (v === "easy" || v === "low") return "Easy";
  if (v === "medium" || v === "mid") return "Medium";
  if (v === "hard" || v === "high") return "Hard";

  return "Medium";
}

type UiJobRow = {
  id: string;
  title: string;
  type: string;
  location: string;
  ctc: string;
  experience: string;
  duration: string;
  difficulty: DifficultyUI;
  responses: number;

  createdAt?: string;
  updatedAt?: string;
};

type HiringStatus =
  | "Invited"
  | "Under Review"
  | "Shortlisted"
  | "Hired"
  | "Rejected";
type InterviewStatus = "Completed" | "Pending" | "In Progress";

type UiResponseRow = {
  id: string;
  candidate: string;
  email: string;
  job: string;
  interviewStatus: InterviewStatus;
  hiringStatus: HiringStatus;
  score: number | null;
  candidateId?: string;
  jobId?: string;
  applicationId?: string;

  createdAt?: string;
  updatedAt?: string;
};

function safeInterviewStatus(x: unknown): InterviewStatus {
  const v = String(x || "").toLowerCase();
  if (v === "completed") return "Completed";
  if (v === "in_progress" || v === "in progress") return "In Progress";
  return "Pending";
}

function safeHiringStatus(x: unknown): HiringStatus {
  const v = String(x || "").toLowerCase();
  if (v === "invited") return "Invited";
  if (v === "under_review" || v === "under review") return "Under Review";
  if (v === "shortlisted") return "Shortlisted";
  if (v === "hired") return "Hired";
  if (v === "rejected") return "Rejected";
  return "Under Review";
}

type SalaryRangeDb = { start?: number; end?: number; currency?: string };

type InterviewSettingsDb = {
  maxCandidates?: number;
  interviewDuration?: number;
  difficultyLevel?: unknown; 
  language?: string;
};

type JobFromDb = {
  _id: string;
  title?: string;
  location?: string;
  workType?: string;
  jobType?: string;
  salaryRange?: SalaryRangeDb;
  workExperience?: number;
  invitedCandidates?: unknown[];
  interviewSettings?: InterviewSettingsDb;
  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
};

type PopulatedApplication = {
  _id: string;
  overallScore?: number | null;
  hiringStatus?: unknown;
  interviewStatus?: unknown;

  candidateId?:
    | string
    | {
        _id: string;
        name?: string;
        email?: string;
      };

  jobId?:
    | string
    | {
        _id: string;
        title?: string;
      };

  createdAt?: string;
  updatedAt?: string;
};

function getCandidate(x: PopulatedApplication["candidateId"]) {
  if (!x) return { id: "", name: "Unknown", email: "-" };
  if (typeof x === "string") return { id: x, name: "Unknown", email: "-" };
  return { id: x._id, name: x.name || "Unknown", email: x.email || "-" };
}

function getJob(x: PopulatedApplication["jobId"]) {
  if (!x) return { id: "", title: "Unknown Job" };
  if (typeof x === "string") return { id: x, title: "Unknown Job" };
  return { id: x._id, title: x.title || "Unknown Job" };
}

function titleCase(s: string) {
  return s
    .replace(/[-_]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function salaryToText(sr?: SalaryRangeDb) {
  if (!sr) return "—";
  const start = typeof sr.start === "number" ? sr.start : undefined;
  const end = typeof sr.end === "number" ? sr.end : undefined;
  const cur = sr.currency ? `${sr.currency}` : "";
  if (start == null && end == null) return "—";
  if (start != null && end != null) return `${cur}${start} - ${cur}${end}`;
  if (start != null) return `${cur}${start}+`;
  return `${cur}Up to ${end}`;
}

function experienceToText(n?: number) {
  if (typeof n !== "number") return "—";
  return `${n}+`;
}

function durationToText(s?: InterviewSettingsDb) {
  if (typeof s?.interviewDuration === "number")
    return `${s.interviewDuration} min`;
  return "—";
}

function useMediaQuery(maxWidth: number) {
  const [match, setMatch] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width:${maxWidth}px)`).matches
      : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width:${maxWidth}px)`);
    const handler = () => setMatch(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [maxWidth]);

  return match;
}

function timeAgo(iso?: string) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;

  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;

  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;

  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

export function EmployerDashboard({ onNavigate }: EmployerDashboardProps) {
  const [jobs, setJobs] = useState<UiJobRow[]>([]);
  const [responses, setResponses] = useState<UiResponseRow[]>([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(true);

  const [errorJobs, setErrorJobs] = useState("");
  const [errorResponses, setErrorResponses] = useState("");

  const isNarrow = useMediaQuery(1024);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingJobs(true);
        setErrorJobs("");

        const data = await apiGetFirstOk<JobFromDb[]>([
          "/api/jobs/me?limit=5",
          "/api/jobs/me",
          "/api/jobs?limit=5",
          "/api/jobs",
        ]);

        if (!alive) return;

        const mapped: UiJobRow[] = (data || []).slice(0, 5).map((j) => ({
          id: j._id,
          title: j.title ?? "Untitled",
          type: j.jobType ? titleCase(j.jobType) : "—",
          location: j.location ?? "—",
          ctc: salaryToText(j.salaryRange),
          experience: experienceToText(j.workExperience),
          duration: durationToText(j.interviewSettings),
          difficulty: difficultyDbToUi(j.interviewSettings?.difficultyLevel),
          responses: Array.isArray(j.invitedCandidates)
            ? j.invitedCandidates.length
            : 0,
          createdAt: j.createdAt,
          updatedAt: j.updatedAt,
        }));

        setJobs(mapped);
      } catch (e: unknown) {
        setErrorJobs(e instanceof Error ? e.message : "Failed to load jobs.");
      } finally {
        if (alive) setLoadingJobs(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingResponses(true);
        setErrorResponses("");

        const data = await apiGetFirstOk<PopulatedApplication[]>([
          "/api/applications/employer?limit=5",
          "/api/applications/employer",
          "/api/employer/applications?limit=5",
          "/api/employer/applications",
        ]);

        if (!alive) return;

        const mapped: UiResponseRow[] = (data || []).slice(0, 5).map((a) => {
          const c = getCandidate(a.candidateId);
          const j = getJob(a.jobId);

          return {
            id: a._id,
            applicationId: a._id,
            candidateId: c.id,
            jobId: j.id,
            candidate: c.name,
            email: c.email,
            job: j.title,
            interviewStatus: safeInterviewStatus(a.interviewStatus),
            hiringStatus: safeHiringStatus(a.hiringStatus),
            score: typeof a.overallScore === "number" ? a.overallScore : null,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
          };
        });

        setResponses(mapped);
      } catch (e: unknown) {
        setErrorResponses(
          e instanceof Error ? e.message : "Failed to load responses."
        );
      } finally {
        if (alive) setLoadingResponses(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const kpis = useMemo(() => {
    const activeJobPosts = jobs.length;
    const totalResponses = responses.length;

    const pendingReviews = responses.filter(
      (r) => r.hiringStatus === "Under Review"
    ).length;
    const hired = responses.filter((r) => r.hiringStatus === "Hired").length;
    const rejected = responses.filter((r) => r.hiringStatus === "Rejected").length;

    return { activeJobPosts, totalResponses, pendingReviews, hired, rejected };
  }, [jobs, responses]);

  const activities = useMemo<ActivityItem[]>(() => {
    const jobActs: ActivityItem[] = jobs.map((j) => {
      const ts = j.createdAt || j.updatedAt;

      return {
        icon: Briefcase20Regular as unknown as ActivityItem["icon"],
        bg: "rgba(37,99,235,0.12)",
        color: "#2563EB",
        title: "Job posted",
        description: j.title,
        time: ts ? timeAgo(ts) : "",
        timeSort: ts ?? 0,
      };
    });

    const respActs: ActivityItem[] = responses.map((r) => {
      const ts = r.createdAt || r.updatedAt;

      const title =
        r.hiringStatus === "Hired"
          ? "Candidate hired"
          : r.hiringStatus === "Rejected"
          ? "Candidate rejected"
          : r.hiringStatus === "Under Review"
          ? "Application under review"
          : "New response received";

      const bg =
        r.hiringStatus === "Hired"
          ? "rgba(22,163,74,0.12)"
          : r.hiringStatus === "Rejected"
          ? "rgba(220,38,38,0.12)"
          : "rgba(249,115,22,0.12)";

      const color =
        r.hiringStatus === "Hired"
          ? "#16A34A"
          : r.hiringStatus === "Rejected"
          ? "#DC2626"
          : "#F97316";

      const icon =
        r.hiringStatus === "Hired"
          ? (CheckmarkCircle20Regular as unknown as ActivityItem["icon"])
          : r.hiringStatus === "Rejected"
          ? (DismissCircle20Regular as unknown as ActivityItem["icon"])
          : (Clock20Regular as unknown as ActivityItem["icon"]);

      return {
        icon,
        bg,
        color,
        title,
        description: `${r.candidate} • ${r.job}`,
        time: ts ? timeAgo(ts) : "",
        timeSort: ts ?? 0,
      };
    });

    const merged = [...jobActs, ...respActs];

    merged.sort((a, b) => {
      const ta =
        typeof a.timeSort === "string" ? new Date(a.timeSort).getTime() : Number(a.timeSort || 0);
      const tb =
        typeof b.timeSort === "string" ? new Date(b.timeSort).getTime() : Number(b.timeSort || 0);
      return tb - ta;
    });

    return merged.slice(0, 4);
  }, [jobs, responses]);

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

  const kpiGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isNarrow
      ? "repeat(2, minmax(0, 1fr))"
      : "repeat(5, minmax(0, 1fr))",
    gap: 16,
  };

  const largeGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isNarrow
      ? "1fr"
      : "minmax(0, 2fr) minmax(320px, 1fr)",
    gap: 24,
    alignItems: "start", 
  };

  const sectionHeaderStyle: React.CSSProperties = {
    padding: 24,
    borderBottom: "1px solid rgba(2,6,23,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const sectionTitleStyle: React.CSSProperties = {
    margin: 0,
    color: "#0B1220",
    fontSize: 16,
    fontWeight: 500,
  };

  const tableCardStyle: React.CSSProperties = {
    border: "1px solid rgba(2,6,23,0.08)",
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
  };

  const tableHeaderRowStyle: React.CSSProperties = {
    background:
      "linear-gradient(to right, rgba(1,24,216,0.06), rgba(27,86,253,0.06))",
  };

  const iconButtonStyle: React.CSSProperties = {
    height: 32,
    width: 32,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };

  return (
    <div style={pageContainerStyle}>
      <div style={kpiGridStyle}>
        <AnimatedStats
          title="Active Job Posts"
          value={kpis.activeJobPosts}
          icon={Briefcase20Regular}
          color="primary"
        />
        <AnimatedStats
          title="Total Responses"
          value={kpis.totalResponses}
          icon={People20Regular}
          trend={{ value: "Live", isPositive: true }}
        />
        <AnimatedStats
          title="Pending Reviews"
          value={kpis.pendingReviews}
          icon={Clock20Regular}
          color="warning"
        />
        <AnimatedStats
          title="Hired"
          value={kpis.hired}
          icon={CheckmarkCircle20Regular}
          color="success"
        />
        <AnimatedStats
          title="Rejected"
          value={kpis.rejected}
          icon={DismissCircle20Regular}
          color="danger"
        />
      </div>

      <div style={largeGridStyle}>
        <div style={{ alignSelf: "start" }}>
          <QuickActions userRole="employer" onNavigate={onNavigate} />
        </div>

        <div style={{ height: "100%" }}>
          <ActivityTimeline
            userRole="employer"
            loading={loadingJobs || loadingResponses}
            activities={activities}
          />
        </div>
      </div>

      <Card style={tableCardStyle}>
        <div style={sectionHeaderStyle}>
          <h3 style={sectionTitleStyle}>Recent Job Posts</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("jobs")}
            style={{ fontSize: 13 }}
          >
            View All
          </Button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <Table>
            <TableHeader>
              <TableRow style={tableHeaderRowStyle}>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>CTC</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead style={{ width: 48 }} />
              </TableRow>
            </TableHeader>

            <TableBody>
              {loadingJobs && (
                <TableRow>
                  <TableCell colSpan={9} style={{ color: "#5B6475" }}>
                    Loading job posts...
                  </TableCell>
                </TableRow>
              )}

              {!loadingJobs && errorJobs && (
                <TableRow>
                  <TableCell colSpan={9} style={{ color: "#dc2626" }}>
                    {errorJobs}
                  </TableCell>
                </TableRow>
              )}

              {!loadingJobs && !errorJobs && jobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} style={{ color: "#5B6475" }}>
                    No job posts found.
                  </TableCell>
                </TableRow>
              )}

              {!loadingJobs &&
                !errorJobs &&
                jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    style={{
                      cursor: "default",
                      transition: "background-color 0.15s ease-in-out",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        "#F3F4F6")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        "transparent")
                    }
                  >
                    <TableCell>
                      <div style={{ color: "#0B1220", fontWeight: 500 }}>
                        {job.title}
                      </div>
                    </TableCell>
                    <TableCell style={{ color: "#5B6475" }}>{job.type}</TableCell>
                    <TableCell style={{ color: "#5B6475" }}>
                      {job.location}
                    </TableCell>
                    <TableCell style={{ color: "#5B6475" }}>{job.ctc}</TableCell>
                    <TableCell style={{ color: "#5B6475" }}>
                      {job.experience}
                    </TableCell>
                    <TableCell style={{ color: "#5B6475" }}>
                      {job.duration}
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
                    <TableCell style={{ color: "#0118D8", fontWeight: 500 }}>
                      {job.responses}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" style={iconButtonStyle}>
                            <MoreVerticalRegular style={{ width: 16, height: 16 }} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye20Regular style={{ width: 14, height: 14, marginRight: 8 }} />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit20Regular style={{ width: 14, height: 14, marginRight: 8 }} />
                            <span>Edit Job</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Delete20Regular style={{ width: 14, height: 14, marginRight: 8 }} />
                            <span style={{ color: "#DC2626" }}>Delete</span>
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

      <Card style={tableCardStyle}>
        <div style={sectionHeaderStyle}>
          <h3 style={sectionTitleStyle}>Recent Responses</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("applicants")}
            style={{ fontSize: 13 }}
          >
            View All
          </Button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <Table>
            <TableHeader>
              <TableRow style={tableHeaderRowStyle}>
                <TableHead>Candidate</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Interview Status</TableHead>
                <TableHead>Hiring Status</TableHead>
                <TableHead style={{ width: 120 }} />
              </TableRow>
            </TableHeader>

            <TableBody>
              {loadingResponses && (
                <TableRow>
                  <TableCell colSpan={7} style={{ color: "#5B6475" }}>
                    Loading responses...
                  </TableCell>
                </TableRow>
              )}

              {!loadingResponses && errorResponses && (
                <TableRow>
                  <TableCell colSpan={7} style={{ color: "#dc2626" }}>
                    {errorResponses}
                  </TableCell>
                </TableRow>
              )}

              {!loadingResponses && !errorResponses && responses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} style={{ color: "#5B6475" }}>
                    No responses found.
                  </TableCell>
                </TableRow>
              )}

              {!loadingResponses &&
                !errorResponses &&
                responses.map((response) => (
                  <TableRow
                    key={response.id}
                    style={{
                      cursor: "default",
                      transition: "background-color 0.15s ease-in-out",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        "#F3F4F6")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        "transparent")
                    }
                  >
                    <TableCell>
                      <div style={{ color: "#0B1220", fontWeight: 500 }}>
                        {response.candidate}
                      </div>
                    </TableCell>
                    <TableCell style={{ color: "#5B6475" }}>
                      {response.email}
                    </TableCell>
                    <TableCell style={{ color: "#5B6475" }}>
                      {response.job}
                    </TableCell>
                    <TableCell>
                      {response.score != null ? (
                        <span style={{ color: "#0118D8", fontWeight: 500 }}>
                          {response.score}%
                        </span>
                      ) : (
                        <span style={{ color: "#5B6475" }}>-</span>
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
                      <Select
                        defaultValue={response.hiringStatus
                          .toLowerCase()
                          .replace(" ", "-")}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate("analytics")}
                        style={{
                          paddingInline: 12,
                          paddingBlock: 6,
                          borderRadius: 6,
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        View Analytics
                      </Button>
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
