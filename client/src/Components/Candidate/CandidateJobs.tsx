import * as React from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Text,
  makeStyles,
  tokens,
  Spinner,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
} from "@fluentui/react-components";
import { Search20Regular, Delete20Regular } from "@fluentui/react-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EnhancedJobCard } from "../ui/EnhancedJobCard";
import { api } from "../../api/http";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";

interface CandidateJobsProps {
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
  logoUrl?: string;
};

type JobsResponse = {
  items: JobFromDB[];
  total: number;
  page: number;
  limit: number;
};

type JobCardUI = {
  id: string;
  company: string;
  companyLogo: string;
  title: string;
  location: string;
  type: string;
  ctc: string;
  experience: string;
  postedDate: string;
  difficulty: "Easy" | "Medium" | "Hard";
  skills: string[];
  match: number;
  logoUrl?: string;
  _raw?: JobFromDB;
};

type SortValue = "relevance" | "recent" | "match" | "salary-high";
type LocationValue = "all-locations" | "remote" | "onsite" | "hybrid";

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

type SavedSearch = {
  _id: string;
  title: string;
  url: string;
  createdAt: string;
};

type CandidateMe = {
  name?: string;
  email?: string;

  resumeUrl?: string;
  resumeDocId?: string;
  resumeFileName?: string;
  resumeText?: string;

  headline?: string;
  about?: string;
  skills?: string[];
  experienceLevel?: string;

  location?: string;
  savedJobs?: string[];
  savedSearches?: SavedSearch[];
};

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

    resumeUrl: getString(r["resumeUrl"]) || undefined,
    resumeDocId: getString(r["resumeDocId"]) || undefined,
    resumeFileName: getString(r["resumeFileName"]) || undefined,
    resumeText: getString(r["resumeText"]) || undefined,

    headline: getString(r["headline"]) || undefined,
    about: getString(r["about"]) || undefined,
    experienceLevel: getString(r["experienceLevel"]) || undefined,
    location: getString(r["location"]) || undefined,
    skills,
    savedJobs: Array.isArray(r["savedJobs"]) ? r["savedJobs"].map(String) : [],
    savedSearches: Array.isArray(r["savedSearches"])
      ? (r["savedSearches"] as SavedSearch[])
      : [],
  };
}

async function tryFetchMe(): Promise<CandidateMe | null> {
  const candidates = ["/api/candidates/me", "/candidates/me", "/me"];
  let lastErr: unknown = null;

  for (const path of candidates) {
    try {
      const raw = await api<unknown>(path, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      return normalizeMe(raw);
    } catch (e) {
      lastErr = e;
    }
  }

  console.error("FETCH_ME_FAILED:", lastErr);
  return null;
}

function postedText(d?: string) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  const diff = Math.max(0, Date.now() - dt.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function titleCase(s: string) {
  return s
    .replace(/[-_]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeDifficulty(v: unknown): "Easy" | "Medium" | "Hard" {
  const s = String(v ?? "")
    .trim()
    .toLowerCase();
  if (s === "easy" || s === "low" || s === "1") return "Easy";
  if (s === "medium" || s === "mid" || s === "2") return "Medium";
  if (s === "hard" || s === "high" || s === "3") return "Hard";
  return "Medium";
}

function salaryToText(sr?: SalaryRangeDb): string {
  if (!sr) return "-";
  if (typeof sr === "string") {
    const t = sr.trim();
    return t ? t : "-";
  }
  const start = typeof sr.start === "number" ? sr.start : undefined;
  const end = typeof sr.end === "number" ? sr.end : undefined;
  const cur = sr.currency ? String(sr.currency) : "";
  if (start != null && end != null) return `${cur}${start} - ${cur}${end}`;
  if (start != null) return `${cur}${start}+`;
  if (end != null) return `${cur}Up to ${end}`;
  return "-";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "C";
  const second = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1];
  return (first + (second ?? "O")).toUpperCase();
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

function toCard(j: JobFromDB, matchMap?: Record<string, number>): JobCardUI {
  const skills = getJobSkills(j);

  const location = (j.location ?? j.workType ?? "-").toString();
  const type = j.jobType ? titleCase(String(j.jobType)) : "-";
  const ctc = salaryToText(j.salaryRange);

  const difficulty = normalizeDifficulty(
    j.interviewSettings?.difficultyLevel ?? j.difficultyLevel ?? j.difficulty,
  );

  const company =
    (j.companyName ?? j.company ?? "Company").toString().trim() || "Company";
  const companyLogo = initials(company);

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
    experience: j.workExperience != null ? `${j.workExperience}+ yrs` : "-",
    postedDate: postedText(j.createdAt),
    difficulty,
    skills,
    match,
    logoUrl: j.logoUrl,
    _raw: j,
  };
}

async function tryComputeJobMatches(args: {
  resumeText: string;
  jobs: JobFromDB[];
}): Promise<Record<string, number>> {
  const { resumeText, jobs } = args;

  const payload = {
    resumeText,
    jobs: jobs.map((j) => {
      const jobSkills =
        Array.isArray(j.techStack) && j.techStack.length > 0
          ? j.techStack
          : Array.isArray(j.skills) && j.skills.length > 0
            ? j.skills
            : [];

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

  const url = "/api/ai/jobs/match-batch";

  try {
    const raw = await api<unknown>(url, {
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
        if (n != null) {
          out[String(k)] = n <= 1 ? Math.round(n * 100) : Math.round(n);
        }
      }
      return out;
    }

    return {};
  } catch (e) {
    console.error("AI_MATCH_FAILED:", e);
    return {};
  }
}

type ResumeTextSource = "resume" | "profile" | "none";

async function tryGetResumeTextFromBackend(
  me: CandidateMe,
): Promise<{ text: string; source: ResumeTextSource }> {
  if (me.resumeText && me.resumeText.trim()) {
    return { text: me.resumeText.trim(), source: "resume" };
  }

  if (me.resumeDocId) {
    try {
      const raw = await api<unknown>("/api/ai/resume/extract", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeDocId: me.resumeDocId,
          resumeFileName: me.resumeFileName,
        }),
      });

      const data = unwrapData(raw);
      const txt =
        getString(data["resumeText"]) ||
        getString(data["text"]) ||
        getString(data["content"]);

      if (txt.trim()) return { text: txt.trim(), source: "resume" };
    } catch (e) {
      console.error("RESUME_EXTRACT_FAILED_DOCID:", e);
    }
  }

  if (me.resumeUrl) {
    try {
      const raw = await api<unknown>("/api/ai/resume/extract", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeUrl: me.resumeUrl,
          resumeFileName: me.resumeFileName,
        }),
      });

      const data = unwrapData(raw);
      const txt =
        getString(data["resumeText"]) ||
        getString(data["text"]) ||
        getString(data["content"]);

      if (txt.trim()) return { text: txt.trim(), source: "resume" };
    } catch (e) {
      console.error("RESUME_EXTRACT_FAILED_URL:", e);
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
  searchSection: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalM,
  },
  searchRow: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalS,
    "@media (min-width: 768px)": {
      display: "grid",
      gridTemplateColumns: "1fr 190px 190px",
      columnGap: tokens.spacingHorizontalM,
      alignItems: "center",
    },
  },
  searchInputWrapper: { width: "100%", minWidth: 0 },
  searchInput: { width: "100%", borderRadius: "8px" },
  dropdown: {
    width: "100%",
    "@media (min-width: 768px)": { width: "190px", justifySelf: "end" },
  },
  filterChipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
  },
  chipBase: {
    borderRadius: "999px",
    border: "1px solid rgba(2,6,23,0.08)",
    padding: "6px 12px",
    fontSize: tokens.fontSizeBase200,
    cursor: "pointer",
    backgroundColor: tokens.colorNeutralBackground1,
    color: "#5B6475",
    transition:
      "border-color 150ms ease, background-color 150ms ease, color 150ms ease",
  },
  chipSelected: { backgroundColor: "#0118D8", color: "#FFFF" },
  resultsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: tokens.spacingHorizontalM,
  },
  resultsText: { color: "#5B6475" },
  resultsStrong: { color: "#0B1220", fontWeight: 500 },
  jobsList: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalM,
  },
  loadMoreWrapper: { textAlign: "center", paddingTop: tokens.spacingVerticalL },
  loadMoreButton: { ":hover": { backgroundColor: "#E9DFC3" } },
  matchHint: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#5B6475",
  },
});

const CandidateJobs: React.FC<CandidateJobsProps> = ({ onNavigate }) => {
  const styles = useStyles();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["Remote"]);

  const [locationValue, setLocationValue] =
    useState<LocationValue>("all-locations");
  const [sortValue, setSortValue] = useState<SortValue>("recent");

  const [jobsRaw, setJobsRaw] = useState<JobFromDB[]>([]);
  const [jobsUI, setJobsUI] = useState<JobCardUI[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const [me, setMe] = useState<CandidateMe | null>(null);

  const [matchLoading, setMatchLoading] = useState(false);
  const [matchMap, setMatchMap] = useState<Record<string, number>>({});
  const [matchSource, setMatchSource] = useState<ResumeTextSource>("none");

  const [viewJob, setViewJob] = useState<JobFromDB | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [isSaveSearchOpen, setIsSaveSearchOpen] = useState(false);
  const [saveSearchTitle, setSaveSearchTitle] = useState("");
  const [showSavedSearches, setShowSavedSearches] = useState(false);

  const matchReqIdRef = useRef(0);

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
    setPage(1);
  };

  const difficultyFilter = useMemo(() => {
    if (selectedFilters.includes("Easy")) return "easy";
    if (selectedFilters.includes("Medium")) return "medium";
    if (selectedFilters.includes("Hard")) return "hard";
    return undefined;
  }, [selectedFilters]);

  const workTypeFilter = useMemo(() => {
    if (selectedFilters.includes("Remote")) return "remote";
    return undefined;
  }, [selectedFilters]);

  const jobTypeFilter = useMemo(() => {
    if (selectedFilters.includes("Full-time")) return "full-time";
    return undefined;
  }, [selectedFilters]);

  const minSalaryFilter = useMemo(() => {
    if (selectedFilters.includes("$100k+")) return "100000";
    return undefined;
  }, [selectedFilters]);

  const buildQuery = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", String(limit));
      params.set("sort", sortValue);
      params.set("includeAll", "1");

      const q = searchQuery.trim();
      if (q) params.set("q", q);

      if (locationValue && locationValue !== "all-locations")
        params.set("location", locationValue);
      if (workTypeFilter) params.set("workType", workTypeFilter);
      if (jobTypeFilter) params.set("jobType", jobTypeFilter);
      if (difficultyFilter) params.set("difficulty", difficultyFilter);
      if (minSalaryFilter) params.set("minSalary", minSalaryFilter);

      return `/api/jobs?${params.toString()}`;
    },
    [
      difficultyFilter,
      jobTypeFilter,
      limit,
      locationValue,
      minSalaryFilter,
      searchQuery,
      sortValue,
      workTypeFilter,
    ],
  );

  const fetchJobs = useCallback(
    async (nextPage: number, mode: "replace" | "append") => {
      const url = buildQuery(nextPage);
      const res = await api<JobsResponse>(url);

      const items = res?.items ?? [];
      setTotal(res?.total ?? items.length);
      setPage(res?.page ?? nextPage);

      setJobsRaw((prev) => (mode === "append" ? [...prev, ...items] : items));
    },
    [buildQuery],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      const m = await tryFetchMe();
      if (alive) setMe(m);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setJobsRaw([]);
        setJobsUI([]);
        setMatchMap({});
        setMatchSource("none");
        setPage(1);

        await fetchJobs(1, "replace");
      } catch (err) {
        console.error("LOAD_CANDIDATE_JOBS_ERROR:", err);
        if (alive) {
          setJobsRaw([]);
          setJobsUI([]);
          setTotal(0);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [fetchJobs]);

  useEffect(() => {
    setJobsUI(jobsRaw.map((j) => toCard(j, matchMap)));
  }, [jobsRaw, matchMap]);

  const handleSave = async (jobId: string) => {
    if (!me) return;
    const isSaved = me.savedJobs?.includes(jobId);
    const url = `/api/jobs/${jobId}/save`;
    const method = isSaved ? "DELETE" : "POST";

    setMe((prev) => {
      if (!prev) return null;
      const oldSaved = prev.savedJobs || [];
      const newSaved = isSaved
        ? oldSaved.filter((id) => id !== jobId)
        : [...oldSaved, jobId];
      return { ...prev, savedJobs: newSaved };
    });

    try {
      await api(url, { method });
    } catch (e) {
      console.error("SAVE_JOB_FAILED:", e);
      setMe((prev) => {
        if (!prev) return null;
        const oldSaved = prev.savedJobs || [];
        const newSaved = isSaved
          ? [...oldSaved, jobId]
          : oldSaved.filter((id) => id !== jobId);
        return { ...prev, savedJobs: newSaved };
      });
    }
  };

  const handleShare = (jobId: string) => {
    const url = `${window.location.origin}/jobs/${jobId}`;
    navigator.clipboard.writeText(url).then(
      () => alert("Job link copied to clipboard!"),
      () => alert("Failed to copy link."),
    );
  };

  const handleView = (job: JobFromDB) => {
    setViewJob(job);
    setIsSheetOpen(true);
  };

  const handleSaveSearch = async () => {
    if (!saveSearchTitle.trim()) return;
    try {
      const params = new URLSearchParams();
      params.set("sort", sortValue);
      const q = searchQuery.trim();
      if (q) params.set("q", q);
      if (locationValue && locationValue !== "all-locations")
        params.set("location", locationValue);
      if (workTypeFilter) params.set("workType", workTypeFilter);
      if (jobTypeFilter) params.set("jobType", jobTypeFilter);
      if (difficultyFilter) params.set("difficulty", difficultyFilter);
      if (minSalaryFilter) params.set("minSalary", minSalaryFilter);

      const urlToSave = `/api/jobs?${params.toString()}`;

      const res = await api<SavedSearch[]>(
        "/api/candidates/me/saved-searches",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: saveSearchTitle, url: urlToSave }),
        },
      );

      setMe((prev) => {
        if (!prev) return null;
        return { ...prev, savedSearches: res };
      });

      setIsSaveSearchOpen(false);
      setSaveSearchTitle("");
      alert("Search saved!");
    } catch (e) {
      console.error("SAVE_SEARCH_FAILED:", e);
      alert("Failed to save search.");
    }
  };

  const handleDeleteSearch = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api<SavedSearch[]>(
        `/api/candidates/me/saved-searches/${id}`,
        {
          method: "DELETE",
        },
      );
      setMe((prev) => {
        if (!prev) return null;
        return { ...prev, savedSearches: res };
      });
    } catch (err) {
      console.error("DELETE_SEARCH_FAILED:", err);
      alert("Failed to delete search.");
    }
  };

  const applySavedSearch = (s: SavedSearch) => {
    try {
      const dummyBase = "http://dummy.com";
      const u = new URL(s.url, dummyBase);
      const sp = u.searchParams;

      setSearchQuery(sp.get("q") || "");
      setLocationValue(
        (sp.get("location") as LocationValue) || "all-locations",
      );
      setSortValue((sp.get("sort") as SortValue) || "recent");

      const newFilters: string[] = [];
      if (sp.get("workType") === "remote") newFilters.push("Remote");
      if (sp.get("jobType") === "full-time") newFilters.push("Full-time");
      if (sp.get("difficulty") === "easy") newFilters.push("Easy");
      if (sp.get("difficulty") === "medium") newFilters.push("Medium");
      if (sp.get("difficulty") === "hard") newFilters.push("Hard");
      if (sp.get("minSalary") === "100000") newFilters.push("$100k+");

      setSelectedFilters(newFilters);
      setPage(1);
    } catch (e) {
      console.error("APPLY_SEARCH_FAILED:", e);
    }
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!me) return;
      if (!jobsRaw.length) return;

      if (
        !me.resumeDocId &&
        !me.resumeUrl &&
        !(me.resumeText && me.resumeText.trim())
      ) {
        setMatchSource("none");
        setMatchMap({});
        return;
      }

      const { text, source } = await tryGetResumeTextFromBackend(me);
      if (!alive) return;

      setMatchSource(source);

      if (source !== "resume") {
        setMatchMap({});
        return;
      }

      const enrichedResumeText = [
        text,
        me.skills?.length ? `\n\nExplicit Skills: ${me.skills.join(", ")}` : "",
        me.headline ? `\nHeadline: ${me.headline}` : "",
        me.experienceLevel ? `\nExperience Level: ${me.experienceLevel}` : "",
        me.location ? `\nLocation: ${me.location}` : "",
      ].join("");

      const reqId = ++matchReqIdRef.current;
      setMatchLoading(true);

      try {
        const matches = await tryComputeJobMatches({
          resumeText: enrichedResumeText,
          jobs: jobsRaw,
        });

        if (!alive || reqId !== matchReqIdRef.current) return;
        setMatchMap(matches);
      } finally {
        if (alive && reqId === matchReqIdRef.current) setMatchLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [me, jobsRaw]);

  const hasMore = jobsRaw.length < total;

  const filtered = useMemo(() => {
    if (sortValue !== "match") return jobsUI;
    return [...jobsUI].sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
  }, [jobsUI, sortValue]);

  const chipCounts = useMemo(() => {
    const base: Record<
      "Remote" | "Full-time" | "Easy" | "Medium" | "Hard" | "$100k+",
      number
    > = {
      Remote: 0,
      "Full-time": 0,
      Easy: 0,
      Medium: 0,
      Hard: 0,
      "$100k+": 0,
    };

    for (const j of jobsUI) {
      if (String(j.location).toLowerCase().includes("remote")) base.Remote += 1;
      if (String(j.type).toLowerCase().includes("full")) base["Full-time"] += 1;
      base[j.difficulty] += 1;
      if (j.ctc.includes("100") || j.ctc.toLowerCase().includes("$100k"))
        base["$100k+"] += 1;
    }
    return base;
  }, [jobsUI]);

  const filterChips = [
    { label: "Remote", count: chipCounts.Remote },
    { label: "Full-time", count: chipCounts["Full-time"] },
    { label: "Easy", count: chipCounts.Easy },
    { label: "Medium", count: chipCounts.Medium },
    { label: "Hard", count: chipCounts.Hard },
    { label: "$100k+", count: chipCounts["$100k+"] },
  ];

  const matchHintText = matchLoading
    ? "Calculating match from your resume…"
    : matchSource === "resume"
      ? "Resume match enabled"
      : matchSource === "profile"
        ? "Resume extraction failed. Upload again to enable match."
        : "Upload resume to enable match";

  return (
    <div className={styles.root}>
      <Card className={styles.searchCard} appearance="outline">
        <div className={styles.searchSection}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text weight="semibold" size={400}>
              Find your next role
            </Text>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                appearance="subtle"
                size="small"
                onClick={() => setShowSavedSearches(!showSavedSearches)}
              >
                {showSavedSearches ? "Hide Saved" : "My Saved Searches"}
              </Button>
            </div>
          </div>

          <Dialog
            open={isSaveSearchOpen}
            onOpenChange={(_, data) => setIsSaveSearchOpen(data.open)}
          >
            <DialogSurface>
              <DialogBody>
                <DialogTitle>Save this Search</DialogTitle>
                <DialogContent>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <Text>
                      Give your search a name to easily run it again later.
                    </Text>
                    <Input
                      placeholder="e.g. Remote React Jobs"
                      value={saveSearchTitle}
                      onChange={(_, d) => setSaveSearchTitle(d.value)}
                    />
                  </div>
                </DialogContent>
                <DialogActions>
                  <DialogTrigger disableButtonEnhancement>
                    <Button appearance="secondary">Cancel</Button>
                  </DialogTrigger>
                  <Button
                    appearance="primary"
                    onClick={handleSaveSearch}
                    disabled={!saveSearchTitle.trim()}
                  >
                    Save
                  </Button>
                </DialogActions>
              </DialogBody>
            </DialogSurface>
          </Dialog>
          <div className={styles.searchRow}>
            <div className={styles.searchInputWrapper}>
              <Input
                className={styles.searchInput}
                contentBefore={
                  <Search20Regular style={{ color: "#5B6475", fontSize: 16 }} />
                }
                contentAfter={
                  <Button
                    appearance="transparent"
                    icon={
                      <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                        +
                      </div>
                    }
                    size="small"
                    onClick={() => setIsSaveSearchOpen(true)}
                    title="Save this search"
                  />
                }
                placeholder={
                  loading
                    ? "Loading jobs..."
                    : "Search by title, company, or skills..."
                }
                value={searchQuery}
                onChange={(_, data) => {
                  setSearchQuery(data.value);
                  setPage(1);
                }}
              />
            </div>

            <Select
              value={locationValue}
              className={styles.dropdown}
              onChange={(e) => {
                setLocationValue(e.target.value as LocationValue);
                setPage(1);
              }}
            >
              <option value="all-locations">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </Select>

            <Select
              value={sortValue}
              className={styles.dropdown}
              onChange={(e) => {
                setSortValue(e.target.value as SortValue);
                setPage(1);
              }}
            >
              <option value="relevance">Most Relevant</option>
              <option value="recent">Most Recent</option>
              <option value="match">Best Match</option>
              <option value="salary-high">Highest Salary</option>
            </Select>
          </div>

          <div className={styles.filterChipRow}>
            {filterChips.map((chip) => {
              const selected = selectedFilters.includes(chip.label);
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => toggleFilter(chip.label)}
                  className={
                    selected
                      ? `${styles.chipBase} ${styles.chipSelected}`
                      : styles.chipBase
                  }
                >
                  {chip.label}
                  <span style={{ marginLeft: 4, opacity: 0.7 }}>
                    ({chip.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <div className={styles.resultsRow}>
        <div className={styles.matchHint}>
          <Text className={styles.resultsText}>
            Showing{" "}
            <span className={styles.resultsStrong}>
              {loading ? "…" : filtered.length}
            </span>{" "}
            jobs
            {total ? (
              <>
                {" "}
                of <span className={styles.resultsStrong}>{total}</span>
              </>
            ) : null}
          </Text>

          {matchLoading ? <Spinner size="tiny" /> : null}
          <Text size={200}>{matchHintText}</Text>
        </div>
      </div>

      {showSavedSearches &&
        me?.savedSearches &&
        me.savedSearches.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "16px",
              padding: "16px",
              backgroundColor: "#F8FAFC",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
            }}
          >
            {me.savedSearches.map((s) => (
              <div
                key={s._id}
                onClick={() => applySavedSearch(s)}
                style={{
                  cursor: "pointer",
                  padding: "6px 12px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#334155",
                }}
              >
                {s.title}
                <Button
                  appearance="transparent"
                  size="small"
                  icon={
                    <Delete20Regular
                      style={{ fontSize: "14px", color: "#94A3B8" }}
                    />
                  }
                  onClick={(e) => handleDeleteSearch(s._id, e)}
                  style={{ minWidth: "auto", padding: 0, height: "16px" }}
                />
              </div>
            ))}
          </div>
        )}

      <div className={styles.jobsList}>
        {filtered.map((job) => (
          <EnhancedJobCard
            key={job.id}
            company={job.company}
            companyLogo={job.companyLogo}
            title={job.title}
            location={job.location}
            type={job.type}
            ctc={job.ctc}
            experience={job.experience}
            postedDate={job.postedDate}
            difficulty={job.difficulty}
            skills={job.skills}
            logoUrl={job.logoUrl}
            match={job.match}
            isSaved={me?.savedJobs?.includes(job.id)}
            onSave={() => handleSave(job.id)}
            onShare={() => handleShare(job.id)}
            onViewDetails={() => {
              if (job._raw) handleView(job._raw);
            }}
            onApply={() => onNavigate("apply", { jobId: job.id })}
          />
        ))}
      </div>

      <div className={styles.loadMoreWrapper}>
        <Button
          appearance="outline"
          size="large"
          className={styles.loadMoreButton}
          disabled={loading || loadingMore || !hasMore}
          onClick={async () => {
            if (!hasMore) return;
            try {
              setLoadingMore(true);
              const nextPage = page + 1;
              await fetchJobs(nextPage, "append");
            } catch (e) {
              console.error("LOAD_MORE_JOBS_ERROR:", e);
            } finally {
              setLoadingMore(false);
            }
          }}
        >
          {loadingMore
            ? "Loading..."
            : hasMore
              ? "Load More Jobs"
              : "No more jobs"}
        </Button>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          style={{
            width: "600px",
            maxWidth: "90vw",
            overflowY: "auto",
            padding: "24px",
          }}
        >
          <SheetHeader>
            <SheetTitle>{viewJob?.title}</SheetTitle>
            <SheetDescription>
              {viewJob?.companyName ?? viewJob?.company}
            </SheetDescription>
          </SheetHeader>

          {viewJob && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                marginTop: "24px",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {viewJob.location && (
                  <Text
                    size={200}
                    style={{
                      backgroundColor: "#F1F5F9",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {viewJob.location}
                  </Text>
                )}
                {viewJob.workType && (
                  <Text
                    size={200}
                    style={{
                      backgroundColor: "#F1F5F9",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {viewJob.workType}
                  </Text>
                )}
                {viewJob.jobType && (
                  <Text
                    size={200}
                    style={{
                      backgroundColor: "#F1F5F9",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {titleCase(viewJob.jobType)}
                  </Text>
                )}
                {viewJob.salaryRange && (
                  <Text
                    size={200}
                    style={{
                      backgroundColor: "#ECFDF5",
                      color: "#047857",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {salaryToText(viewJob.salaryRange)}
                  </Text>
                )}
              </div>

              {(viewJob.description || viewJob.about) && (
                <div>
                  <Text
                    weight="semibold"
                    size={300}
                    block
                    style={{ marginBottom: "8px" }}
                  >
                    About the Job
                  </Text>
                  <Text
                    size={300}
                    style={{
                      whiteSpace: "pre-wrap",
                      color: "#475569",
                      lineHeight: 1.6,
                    }}
                  >
                    {viewJob.description || viewJob.about}
                  </Text>
                </div>
              )}

              {getJobSkills(viewJob).length > 0 && (
                <div>
                  <Text
                    weight="semibold"
                    size={300}
                    block
                    style={{ marginBottom: "12px" }}
                  >
                    Skills & Tech Stack
                  </Text>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {getJobSkills(viewJob).map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: "#E9DFC3",
                          color: "#0B1220",
                          border: "1px solid #E9DFC3",
                          borderRadius: "999px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: "auto", paddingTop: "24px" }}>
                <Button
                  appearance="primary"
                  size="large"
                  style={{ width: "100%" }}
                  onClick={() => onNavigate("apply", { jobId: viewJob._id })}
                >
                  Apply for this Job
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CandidateJobs;
export { CandidateJobs };
