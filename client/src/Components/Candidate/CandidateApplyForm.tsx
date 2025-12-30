import React, { useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Input,
  Label,
  Textarea,
  makeStyles,
  shorthands,
  Spinner,
} from "@fluentui/react-components";
import { useLocation } from "react-router-dom";
import { api } from "../../api/http";

interface CandidateApplyFormProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
}

type UploadResumeResponse = { resumeUrl: string };
type ApplyResponse = { message: string; applicationId: string };

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    rowGap: "16px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  card: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    padding: "20px",
    backgroundColor: "#fff",
  },
  title: { fontSize: "18px", fontWeight: 700, color: "#0B1220" },
  sub: { fontSize: "13px", color: "#5B6475", marginTop: "4px" },
  row: { display: "flex", gap: "12px", flexWrap: "wrap" },
  field: { display: "flex", flexDirection: "column", rowGap: "6px", flex: 1, minWidth: "260px" },
  error: { color: "#b91c1c", fontSize: "13px" },
  ok: { color: "#15803d", fontSize: "13px" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  primaryButton: {
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
    ":hover": { backgroundColor: "#1B56FD", color: "#FFFFFF" },
  },
});

function getQueryParam(locationSearch: string, key: string) {
  const sp = new URLSearchParams(locationSearch);
  return sp.get(key) ?? "";
}

export const CandidateApplyForm: React.FC<CandidateApplyFormProps> = ({ onNavigate }) => {
  const styles = useStyles();
  const location = useLocation();

  const jobId = useMemo(() => getQueryParam(location.search, "jobId"), [location.search]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [resumeName, setResumeName] = useState<string>("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const canSubmit = Boolean(jobId && !uploading && !submitting);

  const uploadResume = async (file: File) => {
    setError("");
    setSuccess("");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("resume", file);

      const res = await api<UploadResumeResponse>("/api/applications/upload-resume", {
        method: "POST",
        body: fd,
      });

      setResumeUrl(res.resumeUrl);
      setResumeName(file.name);
      setSuccess("Resume uploaded.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Resume upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setError("");
    setSuccess("");

    if (!jobId) {
      setError("Missing jobId. Please go back and click Apply again.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        jobId,
        coverLetter: coverLetter.trim() || undefined,
        resumeUrl: resumeUrl || undefined,
      };

      const res = await api<ApplyResponse>("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSuccess(res.message || "Applied successfully");

      setTimeout(() => onNavigate("applications"), 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to apply");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.root}>
      <Card className={styles.card}>
        <div className={styles.title}>Apply for this job</div>
        <div className={styles.sub}>
          Job ID: <b>{jobId || "-"}</b>
        </div>

        <div style={{ marginTop: 12 }} className={styles.row}>
          <div className={styles.field}>
            <Label>Cover Letter (optional)</Label>
            <Textarea
              value={coverLetter}
              onChange={(_, d) => setCoverLetter(d.value)}
              rows={8}
              placeholder="Write a short cover letter..."
            />
          </div>
        </div>

        <div style={{ marginTop: 12 }} className={styles.row}>
          <div className={styles.field}>
            <Label>Resume (PDF/DOC/DOCX, optional)</Label>

            <div className={styles.row}>
              <Button
                appearance="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || submitting}
              >
                {uploading ? "Uploading..." : "Upload Resume"}
              </Button>

              <Input
                value={resumeName || (resumeUrl ? "Uploaded" : "")}
                placeholder="No file selected"
                readOnly
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                uploadResume(f);
                e.currentTarget.value = "";
              }}
            />

            {resumeUrl ? (
              <div className={styles.sub}>
                Uploaded URL: <b>{resumeUrl}</b>
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {error ? <div className={styles.error}>{error}</div> : null}
          {success ? <div className={styles.ok}>{success}</div> : null}
        </div>

        <div style={{ marginTop: 16 }} className={styles.footer}>
          <Button appearance="outline" onClick={() => onNavigate("jobs")} disabled={uploading || submitting}>
            Back to Jobs
          </Button>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {(uploading || submitting) ? <Spinner size="small" /> : null}
            <Button
              appearance="primary"
              className={styles.primaryButton}
              onClick={submit}
              disabled={!canSubmit}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
