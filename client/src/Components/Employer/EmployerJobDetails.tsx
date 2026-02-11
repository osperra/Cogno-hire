import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  makeStyles,
  shorthands,
  Spinner,
} from "@fluentui/react-components";
import { StatusPill } from "../ui/StatusPill";
import { api } from "../../api/http";

type SalaryRangeDb =
  | { start?: number; end?: number; currency?: string }
  | string;

type InterviewSettingsDb = {
  interviewDuration?: number;
  maxCandidates?: number;
  difficultyLevel?: string;
  language?: string;
};

type ApplicantDb = {
  _id: string;
  userId?: string;
  name?: string;
  email?: string;
  status?: string;
  score?: number; 
  appliedAt?: string; 
  interviewStatus?: string;
};

type JobFromDB = {
  _id: string;
  title?: string;
  description?: string;
  about?: string;
  location?: string;
  workType?: string;
  jobType?: string;
  salaryRange?: SalaryRangeDb;
  workExperience?: number;
  status?: "draft" | "open" | "closed";
  isActive?: boolean;
  techStack?: string[];
  interviewSettings?: InterviewSettingsDb;
  createdAt?: string;
};

type CandidatePopulated = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
};
type ApplicationItem = {
  _id: string;
  jobId?: string | { _id?: string; id?: string };
  candidateId?: string | CandidatePopulated;
  hiringStatus?: string;
  interviewStatus?: string;
  overallScore?: number;
  createdAt?: string;
};

const useStyles = makeStyles({
  root: { display: "flex", flexDirection: "column", gap: "16px" },
  headerCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
    backgroundColor: "#FFFFFF",
    padding: "16px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  title: { fontSize: "18px", fontWeight: 700, color: "#0B1220" },
  subtitle: { fontSize: "13px", color: "#5B6475", marginTop: "4px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
    gap: "16px",
    "@media (max-width: 900px)": { gridTemplateColumns: "minmax(0, 1fr)" },
  },
  card: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
    backgroundColor: "#FFFFFF",
    padding: "16px 18px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#0B1220",
    marginBottom: "10px",
  },
  kv: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    rowGap: "8px",
    columnGap: "12px",
  },
  k: { color: "#6B7280", fontSize: "12px" },
  v: { color: "#0B1220", fontSize: "13px", fontWeight: 600 },
  desc: {
    color: "#111827",
    fontSize: "13px",
    whiteSpace: "pre-wrap",
    lineHeight: 1.55,
  },
  chipRow: { display: "flex", flexWrap: "wrap", gap: "6px" },
  chip: {
    backgroundColor: "#E9DFC3",
    color: "#0B1220",
    ...shorthands.border("1px", "solid", "#E9DFC3"),
    ...shorthands.borderRadius("999px"),
    paddingInline: "10px",
    paddingBlock: "6px",
    fontSize: "12px",
    fontWeight: 600,
  },
  applicantRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    ...shorthands.borderBottom("1px", "solid", "rgba(2,6,23,0.06)"),
  },
  applicantName: { fontSize: "13px", fontWeight: 700, color: "#0B1220" },
  applicantMeta: { fontSize: "12px", color: "#6B7280" },
});

function stripHtml(html?: string) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function salaryToText(sr?: SalaryRangeDb) {
  if (!sr) return "-";
  if (typeof sr === "string") return sr.trim() || "-";
  const start = typeof sr.start === "number" ? sr.start : undefined;
  const end = typeof sr.end === "number" ? sr.end : undefined;
  const cur = sr.currency ? `${sr.currency}` : "";
  if (start == null && end == null) return "-";
  if (start != null && end != null) return `${cur}${start} - ${cur}${end}`;
  if (start != null) return `${cur}${start}+`;
  return `${cur}Up to ${end}`;
}

function statusToPill(status?: JobFromDB["status"]) {
  if (status === "open") return { s: "success" as const, label: "Active" };
  if (status === "draft") return { s: "warning" as const, label: "Draft" };
  if (status === "closed") return { s: "neutral" as const, label: "Closed" };
  return { s: "neutral" as const, label: "—" };
}

function asId(v: unknown): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    const o = v as { _id?: unknown; id?: unknown };
    return typeof o._id === "string"
      ? o._id
      : typeof o.id === "string"
        ? o.id
        : undefined;
  }
  return undefined;
}

function normalizeApplicants(input: unknown): ApplicantDb[] {
  if (!Array.isArray(input)) return [];

  if (
    input.length > 0 &&
    typeof input[0] === "object" &&
    input[0] &&
    "_id" in input[0]
  ) {
    const first = input[0];

    if (
      "candidateId" in first ||
      "hiringStatus" in first ||
      "overallScore" in first
    ) {
      return (input as ApplicationItem[]).map((a) => {
        const candObj =
          typeof a.candidateId === "object"
            ? (a.candidateId as CandidatePopulated)
            : undefined;
        const userId = asId(a.candidateId);

        return {
          _id: String(a._id),
          userId,
          name: candObj?.name,
          email: candObj?.email,
          status: a.hiringStatus,
          score:
            typeof a.overallScore === "number" ? a.overallScore : undefined,
          appliedAt: a.createdAt,
          interviewStatus: a.interviewStatus,
        };
      });
    }

    return (input as ApplicantDb[]).map((x) => ({ ...x, _id: String(x._id) }));
  }

  return [];
}

async function fetchApplicantsForJob(jobId: string): Promise<ApplicantDb[]> {
  try {
    const data = await api<unknown>(
      `/api/applications/employer?jobId=${encodeURIComponent(jobId)}&limit=500`,
    );
    const normalized = normalizeApplicants(data);
    if (normalized.length || Array.isArray(data)) return normalized;
  } catch {
    // ignore 
  }

  try {
    const data = await api<unknown>(
      `/api/jobs/${encodeURIComponent(jobId)}/applicants`,
    );
    return normalizeApplicants(data);
  } catch {
    // ignore and fallback
  }

  try {
    const data = await api<unknown>(
      `/api/applications/employer/job/${encodeURIComponent(jobId)}`,
    );
    return normalizeApplicants(data);
  } catch {
    return [];
  }
}

export function EmployerJobDetails({ jobId }: { jobId?: string }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const params = useParams<{ jobId: string }>();

  const effectiveJobId = jobId ?? params.jobId;

  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<JobFromDB | null>(null);
  const [applicants, setApplicants] = useState<ApplicantDb[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!effectiveJobId) return;

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [jobData, applicantsData] = await Promise.all([
          api<JobFromDB>(`/api/jobs/${encodeURIComponent(effectiveJobId)}`),
          fetchApplicantsForJob(effectiveJobId),
        ]);

        if (!alive) return;

        setJob(jobData);
        setApplicants(applicantsData);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load job details");
        setJob(null);
        setApplicants([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [effectiveJobId]);

  const pill = statusToPill(job?.status);

  const techStack = useMemo(() => {
    return Array.isArray(job?.techStack) ? job!.techStack! : [];
  }, [job]);

  if (!effectiveJobId) {
    return (
      <div className={styles.root}>
        <Card className={styles.card}>Invalid job id.</Card>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <Card className={styles.headerCard}>
        <div>
          <div className={styles.title}>{job?.title ?? "Job Details"}</div>
          <div className={styles.subtitle}>
            {job?.location ?? "-"} • {job?.workType ?? "-"} •{" "}
            {job?.jobType ?? "-"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <StatusPill status={pill.s} label={pill.label} size="sm" />
          <Button
            appearance="secondary"
            onClick={() => navigate("/app/employer/jobs")}
          >
            Back to Jobs
          </Button>
        </div>
      </Card>

      {loading && (
        <Card className={styles.card}>
          <Spinner size="small" /> Loading...
        </Card>
      )}

      {error && !loading && (
        <Card className={styles.card} style={{ color: "crimson" }}>
          {error}
        </Card>
      )}

      {!loading && !error && job && (
        <div className={styles.grid}>
          <Card className={styles.card}>
            <div className={styles.sectionTitle}>Job Description</div>
            <div className={styles.desc}>
              {job.description?.trim()
                ? job.description
                : stripHtml(job.about) || "—"}
            </div>

            {techStack.length > 0 && (
              <>
                <div style={{ height: 14 }} />
                <div className={styles.sectionTitle}>Tech Stack</div>
                <div className={styles.chipRow}>
                  {techStack.map((s) => (
                    <span key={s} className={styles.chip}>
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card className={styles.card}>
              <div className={styles.sectionTitle}>Job Summary</div>
              <div className={styles.kv}>
                <div className={styles.k}>CTC</div>
                <div className={styles.v}>{salaryToText(job.salaryRange)}</div>

                <div className={styles.k}>Experience</div>
                <div className={styles.v}>
                  {typeof job.workExperience === "number"
                    ? `${job.workExperience}+`
                    : "-"}
                </div>

                <div className={styles.k}>Max Candidates</div>
                <div className={styles.v}>
                  {job.interviewSettings?.maxCandidates ?? "-"}
                </div>

                <div className={styles.k}>Interview Duration</div>
                <div className={styles.v}>
                  {job.interviewSettings?.interviewDuration
                    ? `${job.interviewSettings?.interviewDuration} min`
                    : "-"}
                </div>

                <div className={styles.k}>Difficulty</div>
                <div className={styles.v}>
                  {job.interviewSettings?.difficultyLevel ?? "-"}
                </div>

                <div className={styles.k}>Language</div>
                <div className={styles.v}>
                  {job.interviewSettings?.language ?? "-"}
                </div>
              </div>
            </Card>

            <Card className={styles.card}>
              <div className={styles.sectionTitle}>
                Candidates Applied ({applicants.length})
              </div>

              {applicants.length === 0 ? (
                <div style={{ color: "#6B7280", fontSize: 13 }}>
                  No candidates applied yet.
                </div>
              ) : (
                <div>
                  {applicants.map((a) => (
                    <div key={a._id} className={styles.applicantRow}>
                      <div style={{ minWidth: 0 }}>
                        <div className={styles.applicantName}>
                          {a.name ?? "Unnamed Candidate"}
                        </div>
                        <div className={styles.applicantMeta}>
                          {a.email ?? "-"}
                          {a.status ? ` • ${a.status}` : ""}
                          {typeof a.score === "number"
                            ? ` • Score: ${a.score}`
                            : ""}
                          {a.interviewStatus ? ` • ${a.interviewStatus}` : ""}
                        </div>
                      </div>

                      <Button
                        appearance="secondary"
                        onClick={() => navigate(`/app/employer/applicants`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
