import * as React from "react";
import { Card, Button, Input, Select, Text, makeStyles, tokens } from "@fluentui/react-components";
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
  title: string;
  employerId?: string;
  about?: string;
  description?: string;

  location?: string;  // e.g. "hybrid"
  workType?: string;  // e.g. "remote"
  jobType?: string;   // e.g. "full-time"

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
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "easy" || s === "low" || s === "1") return "Easy";
  if (s === "medium" || s === "mid" || s === "2") return "Medium";
  if (s === "hard" || s === "high" || s === "3") return "Hard";
  return "Medium";
}

function salaryToText(sr?: SalaryRangeDb): string {
  if (!sr) return "-";

  // if backend ever sends salaryRange as string
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

function toCard(j: JobFromDB): JobCardUI {
  const skills = (j.techStack ?? j.skills ?? []).filter(Boolean);

  // ✅ Location: prefer `location` ("hybrid") over `workType` ("remote")
  const location = (j.location ?? j.workType ?? "-").toString();

  // ✅ Type: keep as jobType but make it readable
  const type = j.jobType ? titleCase(String(j.jobType)) : "-";

  // ✅ CTC: comes from salaryRange in your DB (object {start,end})
  const ctc = salaryToText(j.salaryRange);

  // ✅ Difficulty: comes from interviewSettings.difficultyLevel (your DB)
  const difficulty = normalizeDifficulty(
    j.interviewSettings?.difficultyLevel ?? j.difficultyLevel ?? j.difficulty
  );

  return {
    id: j._id,
    company: "Company",
    companyLogo: "CO",
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
  searchSection: { display: "flex", flexDirection: "column", rowGap: tokens.spacingVerticalM },
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
  filterChipRow: { display: "flex", flexWrap: "wrap", gap: tokens.spacingHorizontalS },
  chipBase: {
    borderRadius: "999px",
    border: "1px solid rgba(2,6,23,0.08)",
    padding: "6px 12px",
    fontSize: tokens.fontSizeBase200,
    cursor: "pointer",
    backgroundColor: tokens.colorNeutralBackground1,
    color: "#5B6475",
    transition: "border-color 150ms ease, background-color 150ms ease, color 150ms ease",
  },
  chipSelected: { backgroundColor: "#0118D8", color: "#FFFF" },
  resultsRow: { display: "flex", alignItems: "center", justifyContent: "space-between", columnGap: tokens.spacingHorizontalM },
  resultsText: { color: "#5B6475" },
  resultsStrong: { color: "#0B1220", fontWeight: 500 },
  jobsList: { display: "flex", flexDirection: "column", rowGap: tokens.spacingVerticalM },
  loadMoreWrapper: { textAlign: "center", paddingTop: tokens.spacingVerticalL },
  loadMoreButton: { ":hover": { backgroundColor: "#E9DFC3" } },
});

export const CandidateJobs: React.FC<CandidateJobsProps> = ({ onNavigate }) => {
  const styles = useStyles();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["Remote"]);
  const [jobs, setJobs] = useState<JobCardUI[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api<JobFromDB[]>("/api/jobs");
        const visible = (data ?? []).filter((j) => (j.status ?? "open") === "open" && j.isActive !== false);
        if (alive) setJobs(visible.map(toCard));
      } catch (err) {
        console.error("LOAD_CANDIDATE_JOBS_ERROR:", err);
        if (alive) setJobs([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]));
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return jobs.filter((j) => {
      if (!q) return true;
      return (
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.join(" ").toLowerCase().includes(q)
      );
    });
  }, [jobs, searchQuery]);

  const filterChips = [
    { label: "Remote", count: 0 },
    { label: "Full-time", count: 0 },
    { label: "Easy", count: 0 },
    { label: "Medium", count: 0 },
    { label: "Hard", count: 0 },
    { label: "$100k+", count: 0 },
  ];

  return (
    <div className={styles.root}>
      <Card className={styles.searchCard} appearance="outline">
        <div className={styles.searchSection}>
          <div className={styles.searchRow}>
            <div className={styles.searchInputWrapper}>
              <Input
                className={styles.searchInput}
                contentBefore={<Search20Regular style={{ color: "#5B6475", fontSize: 16 }} />}
                placeholder={loading ? "Loading jobs..." : "Search by title, company, or skills..."}
                value={searchQuery}
                onChange={(_, data) => setSearchQuery(data.value)}
              />
            </div>

            <Select defaultValue="all-locations" className={styles.dropdown}>
              <option value="all-locations">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </Select>

            <Select defaultValue="relevance" className={styles.dropdown}>
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
                  className={selected ? `${styles.chipBase} ${styles.chipSelected}` : styles.chipBase}
                >
                  {chip.label}
                  <span style={{ marginLeft: 4, opacity: 0.7 }}>({chip.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <div className={styles.resultsRow}>
        <Text className={styles.resultsText}>
          Showing <span className={styles.resultsStrong}>{filtered.length}</span> jobs
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
            onApply={() => onNavigate("applications", { jobId: job.id })}
            onViewDetails={() => onNavigate("job-details", { jobId: job.id })}
          />
        ))}
      </div>

      <div className={styles.loadMoreWrapper}>
        <Button appearance="outline" size="large" className={styles.loadMoreButton}>
          Load More Jobs
        </Button>
      </div>
    </div>
  );
};
