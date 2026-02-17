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
  Spinner,
} from "@fluentui/react-components";

import {
  Briefcase20Regular,
  Clock20Regular,
  CheckmarkCircle20Regular,
  DocumentText20Regular,
  Warning20Regular,
  PlayRegular,
  DataHistogram20Regular,
  Dismiss20Regular,
  ChevronRight20Regular,
} from "@fluentui/react-icons";

import { AnimatedStats } from "../ui/AnimatedStats";
import { QuickActions } from "../ui/QuickActions";
import { ActivityTimeline } from "../ui/ActivityTimeline";
import { FeatureHighlight } from "../ui/FeatureHighlight";
import { StatusPill } from "../ui/StatusPill";

import { api } from "../../api/http";

interface CandidateHomeProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
}

type SalaryRangeDb =
  | string
  | {
      start?: number;
      end?: number;
      currency?: string;
    };

type InterviewSettingsDb = {
  difficultyLevel?: string;
};

type JobFromDB = {
  _id: string;
  company?: string;
  companyName?: string;
  title: string;

  about?: string;
  description?: string;

  location?: string;
  workType?: string;
  jobType?: string;
  salaryRange?: SalaryRangeDb;
  workExperience?: number;
  techStack?: string[];
  skills?: string[];
  interviewSettings?: InterviewSettingsDb;
  difficultyLevel?: string;
  difficulty?: string;
  createdAt?: string;
  status?: "draft" | "open" | "closed";
  isActive?: boolean;
};

type JobCardItem = {
  id: string;
  company: string;
  companyLogo: string;
  title: string;
  location: string;
  type: string;
  ctc: string;
  match: number;
};

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

type CandidateCountsResponse = {
  all: number;
  pending: number;
  hired: number;
  rejected: number;
};

type ApplicationStatus =
  | "Pending Interview"
  | "Under Review"
  | "Hired"
  | "Rejected"
  | "Shortlisted";
type InterviewStatus = "Not Started" | "In Progress" | "Completed";

type Application = {
  id: string;
  company: string;
  companyLogo: string;
  title: string;
  appliedDate: string;
  createdAtIso: string;
  status: ApplicationStatus;
  interviewStatus: InterviewStatus;
  score?: number | null;
};

type CandidateMe = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  headline?: string;
  about?: string;
  experienceLevel?: string;
  skills?: string[];
  resumeUrl?: string;
  resumeDocId?: string;
};

type ProfileTaskKey =
  | "experience"
  | "resume"
  | "skills"
  | "headline"
  | "location"
  | "about";

type ProfileTask = {
  key: ProfileTaskKey;
  title: string;
  subtitle: string;
  done: boolean;
  actionText: string;
  onClick: () => void;
};

type DashboardStats = {
  totalApplications: number;
  pendingInterviews: number;
  offersReceived: number;
  newRecommendations: number;
  invitedCount: number;
};

type CandidateDashboard = {
  displayName: string;
  profileCompletion: number;
  stats: DashboardStats;
  recommendedJobs: JobCardItem[];
  invitedJobs: JobCardItem[];
  recentApplications: Application[];
};

/* =========================
   helpers (safe typing)
   ========================= */

type JsonObject = Record<string, unknown>;
function isRecord(v: unknown): v is JsonObject {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function getString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}
function getNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function unwrapData(raw: unknown): JsonObject {
  const root = isRecord(raw) ? raw : {};
  const d1 = isRecord(root["data"]) ? (root["data"] as JsonObject) : null;
  const d2 = d1 && isRecord(d1["data"]) ? (d1["data"] as JsonObject) : null;
  return (d2 || d1 || root) as JsonObject;
}

function getToken(): string | null {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}
function parseJwtPayload(token: string): JsonObject | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const parsed: unknown = JSON.parse(jsonPayload);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
function pickNameFromToken(): string {
  const token = getToken();
  if (!token) return "";
  const payload = parseJwtPayload(token);
  if (!payload) return "";
  return (
    getString(payload["name"]) ||
    getString(payload["fullName"]) ||
    getString(payload["username"]) ||
    getString(payload["email"]) ||
    getString(payload["sub"])
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "C";
  const second = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1];
  return (first + (second ?? "O")).toUpperCase();
}
function titleCase(s: string) {
  return s
    .replace(/[-_]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function salaryToText(sr?: SalaryRangeDb): string {
  if (!sr) return "-";
  if (typeof sr === "string") return sr.trim() || "-";
  const start = typeof sr.start === "number" ? sr.start : undefined;
  const end = typeof sr.end === "number" ? sr.end : undefined;
  const cur = sr.currency ? String(sr.currency) : "";
  if (start != null && end != null) return `${cur}${start} - ${cur}${end}`;
  if (start != null) return `${cur}${start}+`;
  if (end != null) return `${cur}Up to ${end}`;
  return "-";
}

function getJobSkills(j: JobFromDB): string[] {
  const a =
    Array.isArray(j.techStack) && j.techStack.length > 0
      ? j.techStack
      : Array.isArray(j.skills) && j.skills.length > 0
        ? j.skills
        : [];
  return a.filter(Boolean).map(String);
}

function toHomeJobCard(
  j: JobFromDB,
  matchMap?: Record<string, number>,
): JobCardItem {
  const company =
    (j.companyName ?? j.company ?? "Company").toString().trim() || "Company";
  const companyLogo = initials(company);
  const location = (j.location ?? j.workType ?? "-").toString();
  const type = j.jobType ? titleCase(String(j.jobType)) : "-";
  const ctc = salaryToText(j.salaryRange);

  const m = typeof matchMap?.[j._id] === "number" ? matchMap[j._id] : 0;
  const match = Math.max(0, Math.min(100, m));

  return {
    id: j._id,
    company,
    companyLogo,
    title: j.title,
    location,
    type,
    ctc,
    match,
  };
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

function getJob(jobId: JobPopulated) {
  if (typeof jobId === "string")
    return { title: "Unknown Job", company: "—", location: "—" };
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
function toHomeApplication(a: ApplicationFromApi): Application {
  const job = getJob(a.jobId);
  return {
    id: a._id,
    company: job.company,
    companyLogo: initials(job.company || "Company"),
    title: job.title,
    appliedDate: formatDate(a.createdAt),
    createdAtIso: a.createdAt,
    status: mapHiringToUI(a.hiringStatus),
    interviewStatus: mapInterviewToUI(a.interviewStatus),
    score: typeof a.overallScore === "number" ? a.overallScore : null,
  };
}

function extractJobItems(raw: unknown): JobFromDB[] {
  if (isRecord(raw) && Array.isArray(raw["items"])) {
    return (raw["items"] as unknown[])
      .filter((x: unknown) => isRecord(x))
      .map((x: unknown) => x as JobFromDB);
  }

  const data = unwrapData(raw);

  const candidates: unknown[] = [];
  if (Array.isArray(data["items"]))
    candidates.push(...(data["items"] as unknown[]));
  if (Array.isArray(data["jobs"]))
    candidates.push(...(data["jobs"] as unknown[]));
  if (Array.isArray(data["results"]))
    candidates.push(...(data["results"] as unknown[]));

  return candidates
    .filter((x: unknown) => isRecord(x) && typeof x["_id"] === "string")
    .map((x: unknown) => x as JobFromDB);
}

function normalizeMe(raw: unknown): CandidateMe {
  const data = unwrapData(raw);
  const me = (data["me"] ?? data["user"] ?? data["profile"] ?? data) as unknown;
  const r = isRecord(me) ? me : isRecord(data) ? data : {};

  const skillsRaw = r["skills"];
  const skills = Array.isArray(skillsRaw)
    ? skillsRaw.map((x: unknown) => String(x)).filter(Boolean)
    : [];

  return {
    name: getString(r["name"]) || getString(r["fullName"]) || undefined,
    email: getString(r["email"]) || undefined,
    phone: getString(r["phone"]) || undefined,
    location: getString(r["location"]) || undefined,
    headline: getString(r["headline"]) || undefined,
    about: getString(r["about"]) || undefined,
    experienceLevel: getString(r["experienceLevel"]) || undefined,
    skills,
    resumeUrl: getString(r["resumeUrl"]) || undefined,
    resumeDocId: getString(r["resumeDocId"]) || undefined,
  };
}

async function tryFetchMe(): Promise<CandidateMe | null> {
  const candidates = ["/api/candidates/me", "/candidates/me", "/me"];
  for (const path of candidates) {
    try {
      // avoid api<{}>() to prevent {} inference
      const raw: unknown = await api(path, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      return normalizeMe(raw);
    } catch {
      // try next
    }
  }
  return null;
}

/* =========================
   match helpers (same as CandidateJobs)
   ========================= */

type ResumeTextSource = "resume" | "profile" | "none";

async function tryGetResumeTextFromBackend(
  me: CandidateMe,
): Promise<{ text: string; source: ResumeTextSource }> {
  if (me.resumeDocId) {
    try {
      const raw: unknown = await api("/api/ai/resume/extract", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeDocId: me.resumeDocId }),
      });

      const data = unwrapData(raw);
      const txt =
        getString(data["resumeText"]) ||
        getString(data["text"]) ||
        getString(data["content"]);

      if (txt.trim()) return { text: txt.trim(), source: "resume" };
    } catch {
      // ignore
    }
  }

  if (me.resumeUrl) {
    try {
      const raw: unknown = await api("/api/ai/resume/extract", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeUrl: me.resumeUrl }),
      });

      const data = unwrapData(raw);
      const txt =
        getString(data["resumeText"]) ||
        getString(data["text"]) ||
        getString(data["content"]);

      if (txt.trim()) return { text: txt.trim(), source: "resume" };
    } catch {
      // ignore
    }
  }

  const parts: string[] = [];
  if (me.headline) parts.push(`Headline: ${me.headline}`);
  if (me.about) parts.push(`About: ${me.about}`);
  if (me.experienceLevel) parts.push(`Experience: ${me.experienceLevel}`);
  if (me.location) parts.push(`Location: ${me.location}`);
  if (me.skills?.length) parts.push(`Skills: ${me.skills.join(", ")}`);

  const profileText = parts.join("\n").trim();
  if (profileText) return { text: profileText, source: "profile" };

  return { text: "", source: "none" };
}

async function tryComputeJobMatches(args: {
  resumeText: string;
  jobs: JobFromDB[];
}): Promise<Record<string, number>> {
  const { resumeText, jobs } = args;

  const payload = {
    resumeText,
    jobs: jobs.map((j) => {
      const jobSkills = getJobSkills(j);
      return {
        id: j._id,
        title: j.title,
        location: j.location ?? j.workType,
        jobType: j.jobType,
        workType: j.workType,
        experience: j.workExperience,
        skills: jobSkills,
        description: j.description ?? j.about ?? "",
      };
    }),
  };

  try {
    const raw: unknown = await api("/api/ai/jobs/match-batch", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = unwrapData(raw);
    const m1 = data["matches"];

    if (isRecord(m1)) {
      const out: Record<string, number> = {};
      for (const [k, v] of Object.entries(m1)) {
        const n = getNumber(v);
        if (n != null)
          out[String(k)] = n <= 1 ? Math.round(n * 100) : Math.round(n);
      }
      return out;
    }

    return {};
  } catch {
    return {};
  }
}

/* =========================
   jobs list fetch (typed, no any, no {} inference)
   ========================= */

type JobsListResponse = { items: JobFromDB[]; total: number };
type JobsApiShape = {
  items?: unknown;
  jobs?: unknown;
  results?: unknown;
  total?: unknown;
  count?: unknown;
  data?: unknown;
};

function asJobsApiShape(v: unknown): JobsApiShape | null {
  return isRecord(v) ? (v as JobsApiShape) : null;
}

function readTotalFromUnknown(raw: unknown): number | null {
  const root = asJobsApiShape(raw);
  if (root && typeof root.total === "number") return root.total;

  const data = unwrapData(raw);
  const t = (data as Record<string, unknown>)["total"];
  const c = (data as Record<string, unknown>)["count"];
  if (typeof t === "number") return t;
  if (typeof c === "number") return c;

  return null;
}

/* =========================
   styles
   ========================= */

const PROFILE_BANNER_DISMISS_KEY = "candidate_home_profile_banner_dismissed";

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
    width: "100%",
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
    width: "100%",
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
    "@media (max-width: 768px)": {
      flexDirection: "column",
      rowGap: "12px",
    },
  },
  welcomeText: {
    maxWidth: "70%",
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
    "@media (max-width: 768px)": {
      maxWidth: "100%",
    },
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
    width: "100%",
  },

  profileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: tokens.spacingVerticalM,
    columnGap: tokens.spacingHorizontalXL,
    "@media (max-width: 768px)": {
      flexDirection: "column",
      rowGap: "8px",
    },
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
    transitionProperty: "transform, box-shadow, border-color",
    transitionDuration: "160ms",
    ":hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 6px 18px rgba(2,6,23,0.08)",
    },
  },

  profileTaskCardDone: {
    backgroundColor: "#F8FAFC",
    border: "1px solid rgba(2,6,23,0.06)",
  },

  profileTaskIcon: { marginTop: "2px", flexShrink: 0 },

  profileTaskContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    rowGap: "2px",
    flex: 1,
    minWidth: 0,
  },

  taskRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
    marginLeft: "auto",
  },

  linkButton: {
    height: "auto",
    marginTop: "6px",
    color: "#0118D8",
    paddingLeft: 0,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: tokens.spacingHorizontalL,
    width: "100%",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
    gap: tokens.spacingHorizontalXL,
    width: "100%",
    "@media (max-width: 1000px)": { gridTemplateColumns: "1fr" },
  },

  tabsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    width: "100%",
  },

  tabs: {
    width: "fit-content",
    backgroundColor: "#FFFFFF",
    borderRadius: "999px",
    padding: "6px",
    border: "1px solid rgba(2,6,23,0.08)",
  },

  viewAllRight: { marginLeft: "auto" },

  tabsWrapper: { width: "100%" },

  tabPanels: {
    marginTop: tokens.spacingVerticalM,
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalM,
    width: "100%",
  },

  jobCard: {
    padding: tokens.spacingHorizontalXL,
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: "pointer",
    transitionProperty: "box-shadow, transform, border-color",
    transitionDuration: "200ms",
    width: "100%",
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
    "@media (max-width: 768px)": {
      flexDirection: "column",
      alignItems: "stretch",
      rowGap: "12px",
    },
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
    "@media (max-width: 768px)": { justifyContent: "space-between" },
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
    marginLeft: "60px",
    color: "#5B6475",
    fontSize: tokens.fontSizeBase200,
    "@media (max-width: 768px)": { marginLeft: 0 },
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
    width: "100%",
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
    ":hover": { backgroundColor: "#E9DFC3" },
  },

  applicationsCard: {
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    width: "100%",
    marginTop: tokens.spacingVerticalXXL,
    padding: tokens.spacingHorizontalXL,
  },

  applicationsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: tokens.spacingVerticalM,
  },

  applicationsTable: { minWidth: "980px", borderCollapse: "collapse" },

  actionsCell: { whiteSpace: "nowrap" },
  statusCell: { whiteSpace: "nowrap" },

  iconInline: { marginRight: "6px", fontSize: "16px" },

  tableWrapper: { width: "100%", overflowX: "auto" },
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

  tableRowHover: { ":hover": { backgroundColor: "#F3F4F6" } },
  scoreCell: { whiteSpace: "nowrap" },

  mobileLabel: { display: "none" },

  "@media (max-width: 900px)": {
    tableWrapper: { overflowX: "visible" },
    tableHeaderRow: { display: "none" },
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
      "& td:last-child": { borderBottom: "none" },
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

type TabValue = "recommended" | "invited";

export const CandidateHome: React.FC<CandidateHomeProps> = ({ onNavigate }) => {
  const styles = useStyles();

  const [selectedTab, setSelectedTab] = React.useState<TabValue>("recommended");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [softError, setSoftError] = React.useState<string>("");

  const [me, setMe] = React.useState<CandidateMe | null>(null);

  const [profileBannerDismissed, setProfileBannerDismissed] =
    React.useState<boolean>(() => {
      try {
        return localStorage.getItem(PROFILE_BANNER_DISMISS_KEY) === "1";
      } catch {
        return false;
      }
    });

  const [dashboard, setDashboard] = React.useState<CandidateDashboard>(() => ({
    displayName: "",
    profileCompletion: 0,
    stats: {
      totalApplications: 0,
      pendingInterviews: 0,
      offersReceived: 0,
      newRecommendations: 0,
      invitedCount: 0,
    },
    recommendedJobs: [],
    invitedJobs: [],
    recentApplications: [],
  }));

  const dismissProfileBanner = () => {
    setProfileBannerDismissed(true);
    try {
      localStorage.setItem(PROFILE_BANNER_DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };

  const computeProfileCompletion = React.useCallback(
    (m: CandidateMe | null) => {
      const hasSkills = (m?.skills?.length ?? 0) >= 5;
      const hasResume = Boolean(m?.resumeUrl || m?.resumeDocId);
      const hasExperience = Boolean(
        m?.experienceLevel && m.experienceLevel.trim(),
      );
      const hasHeadline = Boolean(m?.headline && m.headline.trim());
      const hasLocation = Boolean(m?.location && m.location.trim());
      const hasAbout = Boolean(m?.about && m.about.trim());

      const total = 6;
      const done = [
        hasSkills,
        hasResume,
        hasExperience,
        hasHeadline,
        hasLocation,
        hasAbout,
      ].filter(Boolean).length;
      return Math.round((done / total) * 100);
    },
    [],
  );

  const fetchJobsList = React.useCallback(
    async (args: {
      invited?: boolean;
      limit: number;
      sort?: string;
    }): Promise<JobsListResponse> => {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", String(args.limit));
      params.set("sort", args.sort ?? "recent");
      params.set("includeAll", "1");
      if (args.invited) params.set("invited", "1");

      const url = `/api/jobs?${params.toString()}`;

      // IMPORTANT: keep as unknown to avoid `{}` inference issues
      const raw: unknown = await api(url, {
        cache: "no-store",
        credentials: "include",
      });

      const items = extractJobItems(raw);
      const total = readTotalFromUnknown(raw) ?? items.length;

      return { items, total };
    },
    [],
  );

  const fetchRecentApplications = React.useCallback(async () => {
    const qs = new URLSearchParams();
    qs.set("tab", "all");

    const data = await api<ApplicationFromApi[]>(
      `/api/applications/me?${qs.toString()}`,
      { cache: "no-store", credentials: "include" },
    );

    const list = (data ?? []).map(toHomeApplication);

    const sorted = [...list].sort((a, b) => {
      const da = new Date(a.createdAtIso).getTime();
      const db = new Date(b.createdAtIso).getTime();
      if (Number.isNaN(da) || Number.isNaN(db)) return 0;
      return db - da;
    });

    return sorted.slice(0, 5);
  }, []);

  const fetchCounts =
    React.useCallback(async (): Promise<CandidateCountsResponse> => {
      try {
        const c = await api<CandidateCountsResponse>(
          "/api/applications/candidate/counts",
          { cache: "no-store", credentials: "include" },
        );
        return {
          all: c?.all ?? 0,
          pending: c?.pending ?? 0,
          hired: c?.hired ?? 0,
          rejected: c?.rejected ?? 0,
        };
      } catch {
        return { all: 0, pending: 0, hired: 0, rejected: 0 };
      }
    }, []);

  const refreshAll = React.useCallback(async () => {
    const m = await tryFetchMe();
    const displayName = m?.name?.trim() || pickNameFromToken();
    const profileCompletion = computeProfileCompletion(m);

    const [recRes, invRes, recentApps, counts] = await Promise.all([
      fetchJobsList({ invited: false, limit: 2, sort: "recent" }).catch(
        (): JobsListResponse => ({ items: [], total: 0 }),
      ),
      fetchJobsList({ invited: true, limit: 2, sort: "recent" }).catch(
        (): JobsListResponse => ({ items: [], total: 0 }),
      ),
      fetchRecentApplications().catch(() => [] as Application[]),
      fetchCounts(),
    ]);

    // compute match for the jobs shown on home (recommended + invited)
    let matchMap: Record<string, number> = {};
    try {
      const combined = [...recRes.items, ...invRes.items];
      if (m && combined.length) {
        const { text, source } = await tryGetResumeTextFromBackend(m);

        if (source === "resume" && text.trim()) {
          const enrichedResumeText = [
            text,
            m.skills?.length
              ? `\n\nExplicit Skills: ${m.skills.join(", ")}`
              : "",
            m.headline ? `\nHeadline: ${m.headline}` : "",
            m.experienceLevel ? `\nExperience Level: ${m.experienceLevel}` : "",
            m.location ? `\nLocation: ${m.location}` : "",
          ].join("");

          matchMap = await tryComputeJobMatches({
            resumeText: enrichedResumeText,
            jobs: combined,
          });
        }
      }
    } catch {
      matchMap = {};
    }

    const recommendedCards = recRes.items.map((j) =>
      toHomeJobCard(j, matchMap),
    );
    const invitedCards = invRes.items.map((j) => toHomeJobCard(j, matchMap));

    const pendingInterviews = recentApps.filter(
      (a) => a.interviewStatus !== "Completed",
    ).length;

    setMe(m);
    setDashboard({
      displayName,
      profileCompletion,
      stats: {
        totalApplications: counts.all || recentApps.length,
        pendingInterviews,
        offersReceived:
          counts.hired || recentApps.filter((a) => a.status === "Hired").length,
        // counts on the home headline should reflect totals, not just the 2 cards
        newRecommendations: recRes.total || recommendedCards.length,
        invitedCount: invRes.total || invitedCards.length,
      },
      recommendedJobs: recommendedCards,
      invitedJobs: invitedCards,
      recentApplications: recentApps,
    });
  }, [
    computeProfileCompletion,
    fetchCounts,
    fetchJobsList,
    fetchRecentApplications,
  ]);

  React.useEffect(() => {
    let alive = true;
    let t: number | undefined;

    (async () => {
      try {
        setLoading(true);
        setSoftError("");
        await refreshAll();
      } catch {
        if (alive) {
          setSoftError(
            "Home data not available yet (API route missing / auth / server error).",
          );
          setDashboard((prev) => ({
            ...prev,
            displayName: prev.displayName || pickNameFromToken(),
          }));
        }
      } finally {
        if (alive) setLoading(false);
      }

      t = window.setInterval(() => {
        refreshAll().catch(() => {});
      }, 25000);
    })();

    return () => {
      alive = false;
      if (t) window.clearInterval(t);
    };
  }, [refreshAll]);

  const name = dashboard.displayName || me?.name || "User";
  const profileCompletion = dashboard.profileCompletion;

  const stats = dashboard.stats;
  const pendingInterviews = stats.pendingInterviews;
  const newRecommendations = stats.newRecommendations;
  const invitedCount = stats.invitedCount;

  const jobsToShow =
    selectedTab === "recommended"
      ? dashboard.recommendedJobs
      : dashboard.invitedJobs;

  const jobsToShowLimited = jobsToShow.slice(0, 2);

  const tasks: ProfileTask[] = React.useMemo(() => {
    const hasSkills = (me?.skills?.length ?? 0) >= 5;
    const hasResume = Boolean(me?.resumeUrl || me?.resumeDocId);
    const hasExperience = Boolean(
      me?.experienceLevel && me.experienceLevel.trim(),
    );
    const hasHeadline = Boolean(me?.headline && me.headline.trim());
    const hasLocation = Boolean(me?.location && me.location.trim());
    const hasAbout = Boolean(me?.about && me.about.trim());

    return [
      {
        key: "experience",
        title: "Add work experience",
        subtitle: "Add your experience level to help matching.",
        done: hasExperience,
        actionText: hasExperience ? "Done" : "Add now",
        onClick: () => onNavigate("profile-settings"),
      },
      {
        key: "resume",
        title: "Upload your resume",
        subtitle: "Recruiters prefer profiles with resumes.",
        done: hasResume,
        actionText: hasResume ? "Done" : "Upload",
        onClick: () => onNavigate("profile-settings"),
      },
      {
        key: "skills",
        title: "Add skills",
        subtitle: "Aim for 8–12 skills. Minimum 5 recommended.",
        done: hasSkills,
        actionText: hasSkills ? "Done" : "Add now",
        onClick: () => onNavigate("profile-settings"),
      },
      {
        key: "headline",
        title: "Add a headline",
        subtitle: "Example: Fullstack Developer | React | Node",
        done: hasHeadline,
        actionText: hasHeadline ? "Done" : "Add",
        onClick: () => onNavigate("profile-settings"),
      },
      {
        key: "location",
        title: "Add location",
        subtitle: "Improves local job recommendations.",
        done: hasLocation,
        actionText: hasLocation ? "Done" : "Add",
        onClick: () => onNavigate("profile-settings"),
      },
      {
        key: "about",
        title: "Add about summary",
        subtitle: "2–3 lines about your work and impact.",
        done: hasAbout,
        actionText: hasAbout ? "Done" : "Add",
        onClick: () => onNavigate("profile-settings"),
      },
    ];
  }, [me, onNavigate]);

  const incompleteTasks = tasks.filter((t) => !t.done);
  const tasksToShow = incompleteTasks.slice(0, 3);

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
              Welcome back, {name}!
            </Text>

            <Text size={300} style={{ color: "#5B6475" }}>
              You have{" "}
              <span style={{ color: "#0118D8", fontWeight: 500 }}>
                {pendingInterviews} pending interview
                {pendingInterviews === 1 ? "" : "s"}
              </span>{" "}
              and{" "}
              <span style={{ color: "#0118D8", fontWeight: 500 }}>
                {newRecommendations} new job recommendation
                {newRecommendations === 1 ? "" : "s"}
              </span>
              .
            </Text>

            {softError ? (
              <Text size={200} style={{ color: "#9a3412", marginTop: 6 }}>
                {softError}
              </Text>
            ) : null}
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

      {!profileBannerDismissed ? (
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
                {profileCompletion}% complete – Finish the remaining items to
                get better matches
              </Text>
            </div>

            <Button
              appearance="subtle"
              size="small"
              icon={<Dismiss20Regular />}
              onClick={dismissProfileBanner}
            >
              Dismiss
            </Button>
          </div>

          <ProgressBar
            value={profileCompletion}
            max={100}
            thickness="large"
            className={styles.profileProgress}
          />

          <div className={styles.profileTasksGrid}>
            {(tasksToShow.length ? tasksToShow : tasks.slice(0, 3)).map((t) => (
              <div
                key={t.key}
                className={`${styles.profileTaskCard} ${t.done ? styles.profileTaskCardDone : ""}`}
              >
                <div className={styles.profileTaskIcon}>
                  {t.done ? (
                    <CheckmarkCircle20Regular style={{ color: "#16A34A" }} />
                  ) : (
                    <Warning20Regular style={{ color: "#F59E0B" }} />
                  )}
                </div>

                <div className={styles.profileTaskContent}>
                  <Text
                    weight="semibold"
                    size={300}
                    style={{ color: "#0B1220", marginBottom: 2 }}
                    title={t.title}
                  >
                    {t.title}
                  </Text>
                  <Text size={200} style={{ color: "#5B6475" }}>
                    {t.subtitle}
                  </Text>

                  {!t.done ? (
                    <Button
                      appearance="transparent"
                      size="small"
                      className={styles.linkButton}
                      onClick={t.onClick}
                    >
                      {t.actionText} <ChevronRight20Regular />
                    </Button>
                  ) : null}
                </div>

                <div className={styles.taskRight}>
                  <StatusPill
                    status={t.done ? "success" : "warning"}
                    label={t.done ? "Done" : "Pending"}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className={styles.statsGrid}>
        <AnimatedStats
          title="Total Applications"
          value={dashboard.stats.totalApplications}
          icon={DocumentText20Regular}
          color="primary"
        />
        <AnimatedStats
          title="Pending Interviews"
          value={dashboard.stats.pendingInterviews}
          icon={Clock20Regular}
          color="warning"
        />
        <AnimatedStats
          title="Offers Received"
          value={dashboard.stats.offersReceived}
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

      <div className={styles.tabsWrapper}>
        <div className={styles.tabsRow}>
          <div className={styles.tabs}>
            <TabList
              selectedValue={selectedTab}
              onTabSelect={(_, data) => setSelectedTab(data.value as TabValue)}
              appearance="transparent"
            >
              <Tab value="recommended">Recommended for You</Tab>
              <Tab value="invited">Invited to Apply ({invitedCount})</Tab>
            </TabList>
          </div>

          <Button
            appearance="subtle"
            size="small"
            className={styles.viewAllRight}
            onClick={() => onNavigate("jobs")}
          >
            View All
          </Button>
        </div>

        <div className={styles.tabPanels}>
          {loading ? (
            <div
              style={{
                padding: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Spinner size="medium" />
              <Text style={{ color: "#5B6475" }}>Loading your dashboard…</Text>
            </div>
          ) : selectedTab === "invited" && jobsToShowLimited.length === 0 ? (
            <Card className={styles.invitedCard} appearance="outline">
              <div>
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
                  When employers invite you to apply, they’ll appear here.
                </Text>
                <Button
                  appearance="outline"
                  onClick={() => onNavigate("jobs")}
                  className={styles.browseAllJobsButton}
                >
                  Browse All Jobs
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {jobsToShowLimited.map((job) => (
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate("job-details", { jobId: job.id });
                        }}
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
            </>
          )}

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
                View All
              </Button>
            </div>

            <div className={styles.tableWrapper}>
              {dashboard.recentApplications.length === 0 ? (
                <div style={{ padding: 16 }}>
                  <Text style={{ color: "#5B6475" }}>No applications yet.</Text>
                </div>
              ) : (
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
                    {dashboard.recentApplications.map((app) => (
                      <TableRow key={app.id} className={styles.tableRowHover}>
                        <TableCell>
                          <span className={styles.mobileLabel}>Company</span>
                          <div className={styles.companyCell}>
                            <div className={styles.companyLogo}>
                              {app.companyLogo}
                            </div>
                            <Text
                              weight="semibold"
                              style={{ color: "#0B1220" }}
                            >
                              {app.company}
                            </Text>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className={styles.mobileLabel}>Position</span>
                          <Text style={{ color: "#5B6475" }}>{app.title}</Text>
                        </TableCell>

                        <TableCell>
                          <span className={styles.mobileLabel}>
                            Applied Date
                          </span>
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
                                : app.status === "Rejected"
                                  ? "danger"
                                  : "info"
                            }
                            label={app.status}
                            size="sm"
                          />
                        </TableCell>

                        <TableCell className={styles.scoreCell}>
                          <span className={styles.mobileLabel}>Score</span>
                          {app.score != null ? (
                            <Text
                              weight="semibold"
                              style={{ color: "#0118D8" }}
                            >
                              {app.score}%
                            </Text>
                          ) : (
                            <Text style={{ color: "#5B6475" }}>-</Text>
                          )}
                        </TableCell>

                        <TableCell className={styles.actionsCell}>
                          <span className={styles.mobileLabel}>Actions</span>
                          {app.interviewStatus === "Not Started" ||
                          app.interviewStatus === "In Progress" ? (
                            <Button
                              size="small"
                              appearance="primary"
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
                              <PlayRegular className={styles.iconInline} />
                              {app.interviewStatus === "In Progress"
                                ? "Continue"
                                : "Start Interview"}
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
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
