// client/src/Components/Employer/EmployerJobs.tsx
import { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
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
import { StatusPill } from "../ui/StatusPill";
import {
  SearchRegular,
  Add20Regular,
  Filter20Regular,
  MoreVerticalRegular,
  Eye20Regular,
  Edit20Regular,
  Delete20Regular,
  Copy20Regular,
} from "@fluentui/react-icons";
import { api } from "../../api/http";

interface EmployerJobsProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
}

/** ---- DB Shapes (supports BOTH object + string to be safe) ---- */
type SalaryRangeDb =
  | {
      start?: number;
      end?: number;
      currency?: string;
    }
  | string;

type InterviewSettingsDb = {
  interviewDuration?: number;
  maxCandidates?: number;
  difficultyLevel?: string; // "easy"
};

type JobFromDB = {
  _id: string;
  title?: string;

  location?: string; // "hybrid"
  workType?: string; // "remote"

  salaryRange?: SalaryRangeDb; // ✅ your real DB shows object
  jobType?: string; // "full-time"

  isActive?: boolean;
  status?: "draft" | "open" | "closed";

  workExperience?: number;
  invitedCandidates?: unknown[];

  interviewSettings?: InterviewSettingsDb;

  createdAt?: string;
};

/** ---- UI Types (do NOT change UI) ---- */
type DifficultyUI = "Easy" | "Medium" | "Hard";
type StatusUI = "Active" | "Draft" | "Closed";

type JobRowUI = {
  id: string;
  title: string;
  type: string;
  location: string;
  ctc: string;
  experience: string;
  duration: string;
  difficulty: DifficultyUI;
  status: StatusUI;
  responses: number;
  datePosted: string;
};

/** ---- Helpers ---- */
function formatDate(d?: string) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function titleCase(s: string) {
  return s
    .replace(/[-_]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeDifficulty(v: unknown): DifficultyUI {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "easy" || s === "low" || s === "1") return "Easy";
  if (s === "medium" || s === "mid" || s === "2") return "Medium";
  if (s === "hard" || s === "high" || s === "3") return "Hard";
  return "Medium";
}

function mapStatus(j: JobFromDB): StatusUI {
  if (j.status === "draft") return "Draft";
  if (j.status === "closed") return "Closed";
  if (j.status === "open") return "Active";

  if (j.isActive === false) return "Closed";
  return "Active";
}

/** ✅ CTC comes from salaryRange.start/end (and supports salaryRange string too) */
function salaryToText(sr?: SalaryRangeDb) {
  if (!sr) return "-";

  // if salaryRange ever comes as string from API
  if (typeof sr === "string") {
    const t = sr.trim();
    return t ? t : "-";
  }

  const start = typeof sr.start === "number" ? sr.start : undefined;
  const end = typeof sr.end === "number" ? sr.end : undefined;
  const cur = sr.currency ? `${sr.currency}` : "";

  if (start == null && end == null) return "-";
  if (start != null && end != null) return `${cur}${start} - ${cur}${end}`;
  if (start != null) return `${cur}${start}+`;
  return `${cur}Up to ${end}`;
}

/** ✅ Location: show DB.location first (hybrid), fallback to workType */
function pickLocation(j: JobFromDB) {
  return String(j.location ?? j.workType ?? "-");
}

/** ✅ Type: show jobType ("full-time") */
function pickJobType(j: JobFromDB) {
  return j.jobType ? titleCase(String(j.jobType)) : "-";
}

function experienceToText(n?: number) {
  if (typeof n !== "number") return "-";
  return `${n}+`;
}

function durationToText(settings?: InterviewSettingsDb) {
  const mins = settings?.interviewDuration;
  if (typeof mins === "number") return `${mins} min`;
  return "-";
}

function toJobRowUI(j: JobFromDB): JobRowUI {
  return {
    id: j._id,
    title: j.title ?? "Untitled",
    type: pickJobType(j),
    location: pickLocation(j),
    ctc: salaryToText(j.salaryRange),
    experience: experienceToText(j.workExperience),
    duration: durationToText(j.interviewSettings),
    difficulty: normalizeDifficulty(j.interviewSettings?.difficultyLevel),
    status: mapStatus(j),
    responses: Array.isArray(j.invitedCandidates) ? j.invitedCandidates.length : 0,
    datePosted: formatDate(j.createdAt),
  };
}

export function EmployerJobs({ onNavigate }: EmployerJobsProps) {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState("All Types");
  const [locationType, setLocationType] = useState("All Locations");

  const [jobs, setJobs] = useState<JobRowUI[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        let data: JobFromDB[] = [];
        try {
          data = await api<JobFromDB[]>("/api/jobs/me");
        } catch {
          data = await api<JobFromDB[]>("/api/jobs");
        }

        if (!alive) return;

        setJobs((data ?? []).map(toJobRowUI));
      } catch (err) {
        console.error("LOAD_JOBS_ERROR:", err);
        if (alive) setJobs([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || j.title.toLowerCase().includes(q);

      const matchesType =
        jobType === "All Types" || j.type.toLowerCase() === jobType.toLowerCase();

      const matchesLoc =
        locationType === "All Locations" ||
        j.location.toLowerCase() === locationType.toLowerCase();

      return matchesSearch && matchesType && matchesLoc;
    });
  }, [jobs, searchQuery, jobType, locationType]);

  const allChecked =
    filteredJobs.length > 0 && selectedJobs.length === filteredJobs.length;

  // ✅ keep your styles exactly like your original UI
  const toolbarContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  };

  const filtersRowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 1fr) 160px 160px auto",
    columnGap: 12,
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  };

  const searchWrapperStyle: React.CSSProperties = {
    position: "relative",
    width: "95%",
  };

  const iconButtonStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card style={{ padding: 16, border: "1px solid rgba(2,6,23,0.08)" }}>
        <div style={toolbarContainerStyle}>
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
                placeholder={loading ? "Loading jobs..." : "Search jobs..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 32, width: "100%" }}
              />
            </div>

            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger style={{ width: "100%" }}>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                <SelectItem value="Full Time">Full Time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Part Time">Part Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationType} onValueChange={setLocationType}>
              <SelectTrigger style={{ width: "100%" }}>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Locations">All Locations</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="On-site">On-site</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" style={iconButtonStyle}>
              <Filter20Regular style={{ width: 16, height: 16 }} />
            </Button>
          </div>

          <Button
            onClick={() => onNavigate("create-job")}
            style={{
              backgroundColor: "#0118D8",
              color: "#FFFFFF",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
            }}
          >
            <Add20Regular style={{ width: 16, height: 16 }} />
            <span>Create Job</span>
          </Button>
        </div>
      </Card>

      {selectedJobs.length > 0 && (
        <Card
          style={{
            padding: 16,
            border: "1px solid rgba(2,6,23,0.08)",
            backgroundColor: "#EFF5FF",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{ color: "#0118D8", margin: 0 }}>
              {selectedJobs.length} job{selectedJobs.length > 1 ? "s" : ""}{" "}
              selected
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="outline" size="sm">
                Duplicate
              </Button>
              <Button variant="outline" size="sm">
                Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                style={{
                  color: "#DC2626",
                  borderColor: "#FECACA",
                  backgroundColor: "#FEF2F2",
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card
        style={{
          border: "1px solid rgba(2,6,23,0.08)",
          boxShadow:
            "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
          padding: 0,
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <Table>
            <TableHeader>
              <TableRow
                style={{
                  background:
                    "linear-gradient(to right, rgba(1,24,216,0.06), rgba(27,86,253,0.06))",
                }}
              >
                <TableHead style={{ width: 40 }}>
                  <Checkbox
                    checked={allChecked}
                    onChange={(_, data) =>
                      setSelectedJobs(
                        data?.checked ? filteredJobs.map((j) => j.id) : []
                      )
                    }
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>CTC</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Date Posted</TableHead>
                <TableHead style={{ width: 40 }} />
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow
                  key={job.id}
                  style={{
                    cursor: "default",
                    transition: "background-color 0.15s ease-in-out",
                  }}
                  onMouseEnter={(ev) => {
                    (ev.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      "#F3F4F6";
                  }}
                  onMouseLeave={(ev) => {
                    (ev.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      "transparent";
                  }}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedJobs.includes(job.id)}
                      onChange={(_, data) => {
                        const isChecked = !!data?.checked;
                        if (isChecked) {
                          setSelectedJobs((prev) =>
                            prev.includes(job.id) ? prev : [...prev, job.id]
                          );
                        } else {
                          setSelectedJobs((prev) =>
                            prev.filter((id) => id !== job.id)
                          );
                        }
                      }}
                    />
                  </TableCell>

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

                  <TableCell>
                    <StatusPill
                      status={
                        job.status === "Active"
                          ? "success"
                          : job.status === "Draft"
                          ? "warning"
                          : "neutral"
                      }
                      label={job.status}
                      size="sm"
                    />
                  </TableCell>

                  <TableCell style={{ color: "#0118D8", fontWeight: 500 }}>
                    {job.responses}
                  </TableCell>
                  <TableCell style={{ color: "#5B6475" }}>
                    {job.datePosted}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button
                          variant="ghost"
                          style={{ ...iconButtonStyle, borderRadius: 6 }}
                        >
                          <MoreVerticalRegular style={{ width: 16, height: 16 }} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Eye20Regular style={{ width: 16, height: 16, flexShrink: 0 }} />
                            <span style={{ lineHeight: 1.2, display: "inline-block" }}>View Details</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Edit20Regular style={{ width: 16, height: 16, flexShrink: 0 }} />
                            <span style={{ lineHeight: 1.2, display: "inline-block" }}>Edit Job</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Copy20Regular style={{ width: 16, height: 16, flexShrink: 0 }} />
                            <span style={{ lineHeight: 1.2, display: "inline-block" }}>Duplicate</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Delete20Regular style={{ width: 16, height: 16, flexShrink: 0 }} />
                            <span style={{ lineHeight: 1.2, display: "inline-block", color: "#DC2626" }}>
                              Delete
                            </span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && filteredJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} style={{ padding: 16, color: "#5B6475" }}>
                    No jobs found.
                  </TableCell>
                </TableRow>
              )}

              {loading && (
                <TableRow>
                  <TableCell colSpan={12} style={{ padding: 16, color: "#5B6475" }}>
                    Loading jobs...
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
