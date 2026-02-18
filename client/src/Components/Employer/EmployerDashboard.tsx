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
  DataBarHorizontal20Regular,
} from "@fluentui/react-icons";

interface EmployerDashboardProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
}

type ApiErrorBody = { message?: string };

const API_BASE =
  (
    import.meta as unknown as { env?: Record<string, string> }
  ).env?.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

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
      if (low.includes("<!doctype") || low.includes("<html"))
        msg = `Request failed (${res.status})`;
      else if (raw.trim()) msg = raw;
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

async function apiPatchJsonFirstOk<T>(
  paths: string[],
  body: unknown,
): Promise<T> {
  let lastErr: unknown = null;

  for (const p of paths) {
    try {
      const res = await fetch(`${API_BASE}${p}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(body ?? {}),
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
        } else if (raw.trim()) {
          msg = raw;
        }
        throw new Error(msg);
      }

      if (!raw.trim()) return {} as T;

      if (!contentType.includes("application/json")) {
        throw new Error(`Expected JSON but got "${contentType || "unknown"}"`);
      }

      return JSON.parse(raw) as T;
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

  const v = String(value ?? "")
    .trim()
    .toLowerCase();
  if (v === "easy" || v === "low") return "Easy";
  if (v === "medium" || v === "mid") return "Medium";
  if (v === "hard" || v === "high") return "Hard";

  return "Medium";
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

type UiApplicationRow = {
  id: string;
  applicationId: string;
  candidateId: string;
  candidate: string;
  email: string;
  jobId: string;
  job: string;
  createdAt?: string;
  appliedDate: string;
  interviewStatus: InterviewStatusApi;
  score: number | null;
  hiringStatus: HiringStatusApi;
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

function useMediaQuery(maxWidth: number) {
  const [match, setMatch] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width:${maxWidth}px)`).matches
      : false,
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
  const [applications, setApplications] = useState<UiApplicationRow[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [errorJobs, setErrorJobs] = useState("");
  const [errorApps, setErrorApps] = useState("");
  const [savingHiringId, setSavingHiringId] = useState<string | null>(null);
  const [delLoadingId, setDelLoadingId] = useState<string | null>(null);
  const handleDelete = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      setDelLoadingId(jobId);
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        throw new Error("Failed to delete job");
      }

      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert("Failed to delete job. Please try again.");
    } finally {
      setDelLoadingId(null);
    }
  };

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
        setLoadingApps(true);
        setErrorApps("");

        const data = await apiGetFirstOk<PopulatedApplication[]>([
          "/api/applications/employer?limit=200",
          "/api/applications/employer",
          "/api/employer/applications?limit=200",
          "/api/employer/applications",
        ]);

        if (!alive) return;

        const mappedAll: UiApplicationRow[] = (data || []).map((a) => {
          const c = getCandidate(a.candidateId);
          const j = getJob(a.jobId);

          return {
            id: a._id,
            applicationId: a._id,
            candidateId: c.id,
            candidate: c.name,
            email: c.email,
            jobId: j.id,
            job: j.title,
            createdAt: a.createdAt,
            appliedDate: formatDate(a.createdAt),
            interviewStatus: a.interviewStatus,
            score: typeof a.overallScore === "number" ? a.overallScore : null,
            hiringStatus: a.hiringStatus,
          };
        });

        const top5 = mappedAll
          .slice()
          .sort((x, y) => {
            const ta = new Date(x.createdAt || "").getTime();
            const tb = new Date(y.createdAt || "").getTime();
            return (
              (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0)
            );
          })
          .slice(0, 5);

        setApplications(top5);
      } catch (e: unknown) {
        setErrorApps(
          e instanceof Error ? e.message : "Failed to load responses.",
        );
      } finally {
        if (alive) setLoadingApps(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const kpis = useMemo(() => {
    const activeJobPosts = jobs.length;
    const totalResponses = applications.length;

    const pendingReviews = applications.filter(
      (r) => r.hiringStatus === "UNDER_REVIEW",
    ).length;
    const hired = applications.filter((r) => r.hiringStatus === "HIRED").length;
    const rejected = applications.filter(
      (r) => r.hiringStatus === "REJECTED",
    ).length;

    return { activeJobPosts, totalResponses, pendingReviews, hired, rejected };
  }, [jobs, applications]);

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

    const appActs: ActivityItem[] = applications.map((r) => {
      const ts = r.createdAt;

      const title =
        r.hiringStatus === "HIRED"
          ? "Candidate hired"
          : r.hiringStatus === "REJECTED"
            ? "Candidate rejected"
            : r.hiringStatus === "UNDER_REVIEW"
              ? "Application under review"
              : "New application received";

      const bg =
        r.hiringStatus === "HIRED"
          ? "rgba(22,163,74,0.12)"
          : r.hiringStatus === "REJECTED"
            ? "rgba(220,38,38,0.12)"
            : "rgba(249,115,22,0.12)";

      const color =
        r.hiringStatus === "HIRED"
          ? "#16A34A"
          : r.hiringStatus === "REJECTED"
            ? "#DC2626"
            : "#F97316";

      const icon =
        r.hiringStatus === "HIRED"
          ? (CheckmarkCircle20Regular as unknown as ActivityItem["icon"])
          : r.hiringStatus === "REJECTED"
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

    const merged = [...jobActs, ...appActs];

    merged.sort((a, b) => {
      const ta =
        typeof a.timeSort === "string"
          ? new Date(a.timeSort).getTime()
          : Number(a.timeSort || 0);
      const tb =
        typeof b.timeSort === "string"
          ? new Date(b.timeSort).getTime()
          : Number(b.timeSort || 0);
      return tb - ta;
    });

    return merged.slice(0, 4);
  }, [jobs, applications]);

  const tableCardStyle: React.CSSProperties = {
    border: "1px solid rgba(2,6,23,0.08)",
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
  };

  const tableHeaderRowStyle: React.CSSProperties = {
    background:
      "linear-gradient(to right, rgba(1,24,216,0.06), rgba(27,86,253,0.06))",
  };

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
    gridTemplateColumns: isNarrow ? "1fr" : "minmax(0, 2fr) minmax(320px, 1fr)",
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

  const iconButtonStyle: React.CSSProperties = {
    height: 32,
    width: 32,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };

  const updateHiringStatus = async (
    applicationId: string,
    next: HiringStatusApi,
  ) => {
    setApplications((prev) =>
      prev.map((r) =>
        r.id === applicationId ? { ...r, hiringStatus: next } : r,
      ),
    );

    try {
      setSavingHiringId(applicationId);

      await apiPatchJsonFirstOk(
        [
          `/api/applications/${encodeURIComponent(applicationId)}/status`,
          `/api/applications/${encodeURIComponent(applicationId)}`,
          `/api/employer/applications/${encodeURIComponent(applicationId)}/status`,
          `/api/employer/applications/${encodeURIComponent(applicationId)}`,
        ],
        { hiringStatus: next },
      );
    } catch (e) {
      console.error("UPDATE_HIRING_STATUS_ERROR:", e);
      try {
        const data = await apiGetFirstOk<PopulatedApplication[]>([
          "/api/applications/employer?limit=200",
          "/api/applications/employer",
          "/api/employer/applications?limit=200",
          "/api/employer/applications",
        ]);

        const mappedAll: UiApplicationRow[] = (data || []).map((a) => {
          const c = getCandidate(a.candidateId);
          const j = getJob(a.jobId);
          return {
            id: a._id,
            applicationId: a._id,
            candidateId: c.id,
            candidate: c.name,
            email: c.email,
            jobId: j.id,
            job: j.title,
            createdAt: a.createdAt,
            appliedDate: formatDate(a.createdAt),
            interviewStatus: a.interviewStatus,
            score: typeof a.overallScore === "number" ? a.overallScore : null,
            hiringStatus: a.hiringStatus,
          };
        });

        const top5 = mappedAll
          .slice()
          .sort(
            (x, y) =>
              new Date(y.createdAt || "").getTime() -
              new Date(x.createdAt || "").getTime(),
          )
          .slice(0, 5);

        setApplications(top5);
      } catch {
        // ignore
      }
    } finally {
      setSavingHiringId(null);
    }
  };

  const HiringStatusDropdown = ({
    rowId,
    current,
  }: {
    rowId: string;
    current: HiringStatusApi;
  }) => {
    const isSaving = savingHiringId === rowId;

    return (
      <DropdownMenu positioning="below-end">
        <DropdownMenuTrigger>
          <button
            type="button"
            disabled={isSaving}
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
              cursor: isSaving ? "not-allowed" : "pointer",
              fontSize: 13,
              color: "#0B1220",
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {hiringLabelApi(current)}
            </span>
            <span style={{ opacity: 0.7 }}>▾</span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => updateHiringStatus(rowId, "PENDING")}
          >
            Pending
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateHiringStatus(rowId, "INVITED")}
          >
            Invited
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateHiringStatus(rowId, "UNDER_REVIEW")}
          >
            Under Review
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateHiringStatus(rowId, "SHORTLISTED")}
          >
            Shortlisted
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateHiringStatus(rowId, "HIRED")}>
            Hired
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateHiringStatus(rowId, "REJECTED")}
          >
            Rejected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
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
            loading={loadingJobs || loadingApps}
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
                      ((
                        e.currentTarget as HTMLTableRowElement
                      ).style.backgroundColor = "#F3F4F6")
                    }
                    onMouseLeave={(e) =>
                      ((
                        e.currentTarget as HTMLTableRowElement
                      ).style.backgroundColor = "transparent")
                    }
                  >
                    <TableCell>
                      <div style={{ color: "#0B1220", fontWeight: 500 }}>
                        {job.title}
                      </div>
                    </TableCell>
                    <TableCell style={{ color: "#5B6475" }}>
                      {job.type}
                    </TableCell>
                    <TableCell style={{ color: "#5B6475" }}>
                      {job.location}
                    </TableCell>
                    <TableCell style={{ color: "#5B6475" }}>
                      {job.ctc}
                    </TableCell>
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
                      <DropdownMenu positioning="below-end">
                        <DropdownMenuTrigger>
                          <Button variant="ghost" style={iconButtonStyle}>
                            <MoreVerticalRegular
                              style={{ width: 16, height: 16 }}
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() =>
                              onNavigate(
                                `/app/employer/jobs/${encodeURIComponent(job.id)}`,
                              )
                            }
                          >
                            <Eye20Regular
                              style={{ width: 14, height: 14, marginRight: 8 }}
                            />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                           onClick={() =>
                            onNavigate(`/app/employer/jobs/${encodeURIComponent(job.id)}/edit`)
                          }
                          >
                            <Edit20Regular
                              style={{ width: 14, height: 14, marginRight: 8 }}
                            />
                            <span>Edit Job</span>
                          </DropdownMenuItem>
                    <DropdownMenuItem
                          onClick={() => handleDelete(job.id)}
                          disabled={delLoadingId === job.id}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Delete20Regular style={{ width: 16, height: 16, flexShrink: 0 }} />
                            <span style={{ lineHeight: 1.2, color: "#DC2626" }}>
                              {delLoadingId === job.id ? "Deleting..." : "Delete"}
                            </span>
                          </div>
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
                <TableHead>Applied</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Interview</TableHead>
                <TableHead>Hiring Status</TableHead>
                <TableHead style={{ width: 130 }} />
              </TableRow>
            </TableHeader>

            <TableBody>
              {loadingApps && (
                <TableRow>
                  <TableCell colSpan={8} style={{ color: "#5B6475" }}>
                    Loading responses...
                  </TableCell>
                </TableRow>
              )}

              {!loadingApps && errorApps && (
                <TableRow>
                  <TableCell colSpan={8} style={{ color: "#dc2626" }}>
                    {errorApps}
                  </TableCell>
                </TableRow>
              )}

              {!loadingApps && !errorApps && applications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} style={{ color: "#5B6475" }}>
                    No responses found.
                  </TableCell>
                </TableRow>
              )}

              {!loadingApps &&
                !errorApps &&
                applications.map((a) => (
                  <TableRow
                    key={a.id}
                    style={{
                      cursor: "default",
                      transition: "background-color 0.15s ease-in-out",
                    }}
                    onMouseEnter={(e) =>
                      ((
                        e.currentTarget as HTMLTableRowElement
                      ).style.backgroundColor = "#F3F4F6")
                    }
                    onMouseLeave={(e) =>
                      ((
                        e.currentTarget as HTMLTableRowElement
                      ).style.backgroundColor = "transparent")
                    }
                  >
                    <TableCell>
                      <div style={{ color: "#0B1220", fontWeight: 500 }}>
                        {a.candidate}
                      </div>
                    </TableCell>
                    <TableCell style={{ color: "#5B6475" }}>
                      {a.email}
                    </TableCell>
                    <TableCell style={{ color: "#5B6475" }}>{a.job}</TableCell>
                    <TableCell style={{ color: "#5B6475" }}>
                      {a.appliedDate}
                    </TableCell>
                    <TableCell>
                      {a.score != null ? (
                        <span style={{ color: "#0118D8", fontWeight: 500 }}>
                          {a.score}%
                        </span>
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
                      <HiringStatusDropdown
                        rowId={a.id}
                        current={a.hiringStatus}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onNavigate("analytics", {
                            candidateId: a.candidateId,
                            applicationId: a.applicationId,
                          })
                        }
                        style={{
                          paddingInline: 10,
                          paddingBlock: 6,
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 500,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <DataBarHorizontal20Regular />
                        Analytics
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
