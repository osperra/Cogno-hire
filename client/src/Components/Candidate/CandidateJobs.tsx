/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Search20Regular } from "@fluentui/react-icons";
import { EnhancedJobCard } from "../ui/EnhancedJobCard";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/http";

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
};

type SortValue = "relevance" | "recent" | "match" | "salary-high";
type LocationValue = "all-locations" | "remote" | "onsite" | "hybrid";

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

function toCard(j: JobFromDB): JobCardUI {
  const skills = (j.techStack ?? j.skills ?? []).filter(Boolean).map(String);
  const location = (j.location ?? j.workType ?? "-").toString();
  const type = j.jobType ? titleCase(String(j.jobType)) : "-";
  const ctc = salaryToText(j.salaryRange);

  const difficulty = normalizeDifficulty(
    j.interviewSettings?.difficultyLevel ?? j.difficultyLevel ?? j.difficulty
  );

  const company =
    (j.company ?? j.companyName ?? "Company").toString().trim() || "Company";
  const companyLogo = initials(company);

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
    match: 80,
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
});

export const CandidateJobs: React.FC<CandidateJobsProps> = ({ onNavigate }) => {
  const styles = useStyles();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["Remote"]);

  const [locationValue, setLocationValue] =
    useState<LocationValue>("all-locations");
  const [sortValue, setSortValue] = useState<SortValue>("recent");

  const [jobs, setJobs] = useState<JobCardUI[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
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

  const buildQuery = (nextPage: number) => {
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
  };

  const fetchJobs = async (nextPage: number, mode: "replace" | "append") => {
    const url = buildQuery(nextPage);
    const res = await api<JobsResponse>(url);

    const items = (res?.items ?? []).map(toCard);

    setTotal(res?.total ?? items.length);
    setPage(res?.page ?? nextPage);

    setJobs((prev) => (mode === "append" ? [...prev, ...items] : items));
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setJobs([]);
        setPage(1);
        await fetchJobs(1, "replace");
      } catch (err) {
        console.error("LOAD_CANDIDATE_JOBS_ERROR:", err);
        if (alive) {
          setJobs([]);
          setTotal(0);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [
    searchQuery,
    locationValue,
    sortValue,
    workTypeFilter,
    jobTypeFilter,
    difficultyFilter,
    minSalaryFilter,
  ]);

  const filtered = useMemo(() => jobs, [jobs]);
  const hasMore = jobs.length < total;

  const chipCounts = useMemo(() => {
    const base = {
      Remote: 0,
      "Full-time": 0,
      Easy: 0,
      Medium: 0,
      Hard: 0,
      "$100k+": 0,
    };
    for (const j of jobs) {
      if (String(j.location).toLowerCase().includes("remote")) base.Remote += 1;
      if (String(j.type).toLowerCase().includes("full")) base["Full-time"] += 1;
      base[j.difficulty] += 1;
      if (j.ctc.includes("100") || j.ctc.toLowerCase().includes("$100k"))
        base["$100k+"] += 1;
    }
    return base;
  }, [jobs]);

  const filterChips = [
    { label: "Remote", count: chipCounts.Remote },
    { label: "Full-time", count: chipCounts["Full-time"] },
    { label: "Easy", count: chipCounts.Easy },
    { label: "Medium", count: chipCounts.Medium },
    { label: "Hard", count: chipCounts.Hard },
    { label: "$100k+", count: chipCounts["$100k+"] },
  ];

  return (
    <div className={styles.root}>
      <Card className={styles.searchCard} appearance="outline">
        <div className={styles.searchSection}>
          <div className={styles.searchRow}>
            <div className={styles.searchInputWrapper}>
              <Input
                className={styles.searchInput}
                contentBefore={
                  <Search20Regular style={{ color: "#5B6475", fontSize: 16 }} />
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
        <Button appearance="subtle" size="small">
          <h4> Save Search </h4>
        </Button>
      </div>

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
            match={job.match}
            onApply={() => onNavigate("apply", { jobId: job.id })}
            onViewDetails={() => onNavigate("job-details", { jobId: job.id })}
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
    </div>
  );
};
