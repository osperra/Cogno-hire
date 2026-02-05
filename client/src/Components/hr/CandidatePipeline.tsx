import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Progress } from "../ui/progress";

import {
  People20Regular,
  ArrowTrending20Regular,
  Filter20Regular,
  MoreVerticalRegular,
  Mail20Regular,
  Call20Regular,
  CalendarLtr20Regular,
  ChevronRight20Regular,
} from "@fluentui/react-icons";

interface PipelineStage {
  name: string;
  count: number;
  color: string;
}

interface Candidate {
  id: string | number;
  name: string;
  role: string;
  score: number;
  avatar: string;
}

type CandidatesResponse = {
  screening: Candidate[];
  interview: Candidate[];
  offer: Candidate[];
};

type PipelineResponse = {
  stages: PipelineStage[];
};

function getAuthToken(): string | null {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken")
  );
}

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response. First chars: ${text.slice(0, 30)}`);
  }
}

async function apiGet<T>(url: string, signal?: AbortSignal): Promise<T> {
  const token = getAuthToken();

  const res = await fetch(url, {
    method: "GET",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await safeJson(res);

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "message" in data && data.message) ||
      `${res.status} ${res.statusText}`;
    throw new Error(String(msg));
  }

  return data as T;
}

function fetchPipelineData(signal?: AbortSignal) {
  return apiGet<PipelineResponse>("/api/pipeline", signal);
}

function fetchCandidatesData(signal?: AbortSignal) {
  return apiGet<CandidatesResponse>("/api/candidates", signal);
}

export function CandidatePipeline() {
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [candidates, setCandidates] = useState<CandidatesResponse>({
    screening: [],
    interview: [],
    offer: [],
  });
  const [error, setError] = useState<string | null>(null);

  // ===== computed =====
  const totalCandidates = useMemo(() => {
    return pipelineStages.reduce((sum, stage) => sum + (stage?.count ?? 0), 0);
  }, [pipelineStages]);

  const conversionRate = useMemo(() => {
    const applied = pipelineStages?.[0]?.count ?? 0;
    const hired = pipelineStages?.[4]?.count ?? 0;
    if (!applied) return "0.0";
    return ((hired / applied) * 100).toFixed(1);
  }, [pipelineStages]);

  const getStageWidthPercent = (count: number) => {
    if (!totalCandidates || count <= 0) return 0;
    const pct = (count / totalCandidates) * 100;
    const MIN_VISIBLE = 18;
    return Math.min(100, Math.max(MIN_VISIBLE, pct));
  };

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setError(null);

        const [pipelineData, candidatesData] = await Promise.all([
          fetchPipelineData(controller.signal),
          fetchCandidatesData(controller.signal),
        ]);

        setPipelineStages(
          Array.isArray(pipelineData?.stages) ? pipelineData.stages : [],
        );

        setCandidates({
          screening: Array.isArray(candidatesData?.screening)
            ? candidatesData.screening
            : [],
          interview: Array.isArray(candidatesData?.interview)
            ? candidatesData.interview
            : [],
          offer: Array.isArray(candidatesData?.offer)
            ? candidatesData.offer
            : [],
        });
      } catch (e: unknown) {
        const isAbort =
          (typeof DOMException !== "undefined" &&
            e instanceof DOMException &&
            e.name === "AbortError") ||
          (e instanceof Error && e.name === "AbortError");
        if (isAbort) return;

        setPipelineStages([]);
        setCandidates({ screening: [], interview: [], offer: [] });

        if (e instanceof Error) setError(e.message);
        else setError("Something went wrong");
      }
    })();

    return () => controller.abort();
  }, []);

  const withHoverAnimation = (
    base: React.CSSProperties,
  ): React.CSSProperties => ({
    ...base,
    transition: "transform 150ms ease, box-shadow 150ms ease",
    cursor: "pointer",
  });

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLElement;
    el.style.transform = "translateY(-1px)";
    el.style.boxShadow = "0 6px 18px rgba(15,23,42,0.10)";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLElement;
    el.style.transform = "translateY(0)";
    el.style.boxShadow = "0 1px 0 rgba(15,23,42,0.02)";
  };

  const rootStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    rowGap: 24,
    minHeight: "100vh",
    boxSizing: "border-box",
    padding: 16,
    maxWidth: 2000,
    margin: "0 auto",
  };

  const headerRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: 16,
  };

  const headerTitleBlock: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    rowGap: 2,
  };

  const headerTitle: React.CSSProperties = {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#0B1220",
  };

  const headerSubtitle: React.CSSProperties = {
    fontSize: "0.85rem",
    color: "#5B6475",
  };

  const headerActions: React.CSSProperties = {
    display: "flex",
    columnGap: 8,
  };

  const statsGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  };

  const statCard: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(2,6,23,0.08)",
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    padding: "18px 20px",
  };

  const statRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const statLabel: React.CSSProperties = {
    fontSize: "0.8rem",
    color: "#5B6475",
    marginBottom: 4,
  };

  const statValue: React.CSSProperties = {
    fontSize: "2rem",
    fontWeight: 600,
    color: "#0B1220",
  };

  const statIconBox: React.CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const funnelCard: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(2,6,23,0.08)",
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    padding: "18px 20px 20px",
  };

  const funnelTitle: React.CSSProperties = {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: 16,
  };

  const funnelStageRow: React.CSSProperties = {
    position: "relative",
    marginBottom: 16,
  };

  const funnelStageHeader: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  };

  const funnelStageLeft: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    columnGap: 8,
  };

  const stageName: React.CSSProperties = {
    fontSize: "0.85rem",
    fontWeight: 500,
    color: "#0B1220",
  };

  const stageCountBadge: React.CSSProperties = {
    backgroundColor: "#F9FAFB",
    color: "#4B5563",
    fontSize: "0.7rem",
    border: "1px solid rgba(148,163,184,0.4)",
  };

  const stagePercent: React.CSSProperties = {
    fontSize: "0.78rem",
    color: "#5B6475",
  };

  const funnelBarBase: React.CSSProperties = {
    height: 64,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: 18,
    color: "#FFFFFF",
    boxShadow: "0 10px 24px rgba(15,23,42,0.25)",
    cursor: "pointer",
    transition: "box-shadow 200ms ease, transform 200ms ease",
  };

  const funnelBarValue: React.CSSProperties = {
    fontSize: "1.4rem",
    fontWeight: 600,
  };

  const funnelChevronOverlay: React.CSSProperties = {
    position: "absolute",
    right: -22,
    top: "50%",
    transform: "translateY(10px)",
    zIndex: 1,
  };

  const candidatesGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  };

  const stageColumnCard: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  };

  const stageColumnHeader: React.CSSProperties = {
    padding: "12px 14px",
    borderBottom: "1px solid rgba(2,6,23,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const stageColumnTitle: React.CSSProperties = {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#0B1220",
  };

  const stageColumnBadge: React.CSSProperties = {
    border: "none",
    fontSize: "0.75rem",
    color: "#FFFFFF",
  };

  const stageColumnBody: React.CSSProperties = {
    padding: "12px 14px 14px",
    display: "flex",
    flexDirection: "column",
    rowGap: 10,
  };

  const candidateCardBase: React.CSSProperties = {
    borderRadius: 12,
    border: "1px solid rgba(2,6,23,0.08)",
    padding: "10px 12px 12px",
    boxShadow: "0 1px 0 rgba(15,23,42,0.02)",
    backgroundColor: "#FFFFFF",
  };

  const candidateHeaderRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    columnGap: 10,
    marginBottom: 8,
  };

  const avatarStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    fontSize: "0.8rem",
    fontWeight: 600,
  };

  const avatarInnerBase: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    color: "#FFFFFF",
  };

  const candidateName: React.CSSProperties = {
    fontSize: "0.85rem",
    fontWeight: 500,
    color: "#0B1220",
  };

  const candidateRole: React.CSSProperties = {
    fontSize: "0.75rem",
    color: "#5B6475",
  };

  const candidateMoreButton: React.CSSProperties = {
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    padding: 4,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const candidateLabelRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  };

  const candidateLabel: React.CSSProperties = {
    fontSize: "0.72rem",
    color: "#6B7280",
  };

  const candidateScoreBlue: React.CSSProperties = {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#0118D8",
  };

  const candidateScorePurple: React.CSSProperties = {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#7C3AED",
  };

  const candidateScoreGreen: React.CSSProperties = {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#16A34A",
  };

  const progressBarStyle: React.CSSProperties = {
    marginBottom: 8,
    height: 6,
    borderRadius: 999,
  };

  const candidateActionsRow: React.CSSProperties = {
    display: "flex",
    columnGap: 8,
  };

  const softButton: React.CSSProperties = {
    flex: 1,
    height: 28,
    borderRadius: 8,
    border: "1px solid rgba(2,6,23,0.12)",
    backgroundColor: "#FFFFFF",
    fontSize: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 4,
    cursor: "pointer",
  };

  const softButtonEmphasis: React.CSSProperties = {
    flex: 1,
    height: 28,
    borderRadius: 8,
    border: "1px solid rgba(147,51,234,0.4)",
    backgroundColor: "rgba(233,213,255,0.45)",
    fontSize: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 4,
    cursor: "pointer",
  };

  const primaryFullButton: React.CSSProperties = {
    width: "100%",
    marginTop: 4,
    backgroundColor: "#16A34A",
    color: "#FFFFFF",
    borderRadius: 8,
    border: "none",
    height: 30,
    fontSize: "0.8rem",
    fontWeight: 500,
  };

  return (
    <div style={rootStyle}>
      <div style={headerRow}>
        <div style={headerTitleBlock}>
          <span style={headerTitle}>Candidate Pipeline</span>
          <span style={headerSubtitle}>
            Visual funnel of candidates through the hiring process
          </span>
        </div>

        <div style={headerActions}>
          <Button
            variant="outline"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#E9DFC3")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <Filter20Regular style={{ width: 16, height: 16 }} />
            <span>Filter</span>
          </Button>

          <Button
            variant="outline"
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#E9DFC3")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Export Report
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ color: "#B91C1C", fontSize: 12 }}>
          Failed to load pipeline: {error}
        </div>
      )}

      <div style={statsGrid}>
        <Card style={statCard}>
          <div style={statRow}>
            <div>
              <div style={statLabel}>Total Candidates</div>
              <div style={statValue}>{totalCandidates}</div>
            </div>
            <div style={{ ...statIconBox, backgroundColor: "#EFF6FF" }}>
              <People20Regular
                style={{ width: 24, height: 24, color: "#0118D8" }}
              />
            </div>
          </div>
        </Card>

        <Card style={statCard}>
          <div style={statRow}>
            <div>
              <div style={statLabel}>Conversion Rate</div>
              <div style={statValue}>{conversionRate}%</div>
            </div>
            <div style={{ ...statIconBox, backgroundColor: "#ECFDF3" }}>
              <ArrowTrending20Regular
                style={{ width: 24, height: 24, color: "#16A34A" }}
              />
            </div>
          </div>
        </Card>

        <Card style={statCard}>
          <div style={statRow}>
            <div>
              <div style={statLabel}>Avg Time to Hire</div>
              <div style={statValue}>18 days</div>
            </div>
            <div style={{ ...statIconBox, backgroundColor: "#F5F3FF" }}>
              <CalendarLtr20Regular
                style={{ width: 24, height: 24, color: "#7C3AED" }}
              />
            </div>
          </div>
        </Card>
      </div>

      <Card style={funnelCard}>
        <div style={funnelTitle}>Hiring Funnel</div>
        <div>
          {pipelineStages.map((stage, index) => {
            const count = stage?.count ?? 0;
            const percentage = totalCandidates
              ? (count / totalCandidates) * 100
              : 0;

            const widthPercent = getStageWidthPercent(count);

            const nextCount = pipelineStages?.[index + 1]?.count ?? 0;
            const showConnector = count > 0 && nextCount > 0;

            return (
              <div key={stage.name} style={funnelStageRow}>
                <div style={funnelStageHeader}>
                  <div style={funnelStageLeft}>
                    <span style={stageName}>{stage.name}</span>
                    <Badge style={stageCountBadge}>{count}</Badge>
                  </div>
                  <span style={stagePercent}>{percentage.toFixed(1)}%</span>
                </div>

                {count > 0 ? (
                  <div
                    style={{
                      ...funnelBarBase,
                      width: `${widthPercent}%`,
                      backgroundColor: stage.color,
                    }}
                  >
                    <span style={funnelBarValue}>{count}</span>
                    <ChevronRight20Regular style={{ width: 24, height: 24 }} />
                  </div>
                ) : (
                  <div style={{ height: 64 }} />
                )}

                {index < pipelineStages.length - 1 && showConnector && (
                  <div style={funnelChevronOverlay}>
                    <ChevronRight20Regular
                      style={{ width: 28, height: 28, color: "#D1D5DB" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div style={candidatesGrid}>
        <Card style={stageColumnCard}>
          <div
            style={{
              ...stageColumnHeader,
              background:
                "linear-gradient(to right, rgba(59,130,246,0.08), transparent)",
            }}
          >
            <span style={stageColumnTitle}>
              Screening ({candidates.screening.length})
            </span>
            <Badge style={{ ...stageColumnBadge, backgroundColor: "#2563EB" }}>
              {candidates.screening.length}
            </Badge>
          </div>

          <div style={stageColumnBody}>
            {candidates.screening.map((candidate) => (
              <div
                key={candidate.id}
                style={withHoverAnimation(candidateCardBase)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div style={candidateHeaderRow}>
                  <Avatar style={avatarStyle}>
                    <AvatarFallback
                      style={{
                        ...avatarInnerBase,
                        backgroundImage:
                          "linear-gradient(to bottom right,#0118D8,#1B56FD)",
                      }}
                    >
                      {candidate.avatar}
                    </AvatarFallback>
                  </Avatar>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={candidateName}>{candidate.name}</div>
                    <div style={candidateRole}>{candidate.role}</div>
                  </div>

                  <button
                    style={candidateMoreButton}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor =
                        "#F3F4F6")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor =
                        "transparent")
                    }
                    type="button"
                  >
                    <MoreVerticalRegular
                      style={{ width: 16, height: 16, color: "#6B7280" }}
                    />
                  </button>
                </div>

                <div style={candidateLabelRow}>
                  <span style={candidateLabel}>Match Score</span>
                  <span style={candidateScoreBlue}>{candidate.score}%</span>
                </div>

                <Progress
                  value={candidate.score}
                  style={{ ...progressBarStyle, width: `${candidate.score}%` }}
                />

                <div style={candidateActionsRow}>
                  <button style={softButton} type="button">
                    <Mail20Regular style={{ width: 12, height: 12 }} />
                    <span>Email</span>
                  </button>
                  <button style={softButton} type="button">
                    <Call20Regular style={{ width: 12, height: 12 }} />
                    <span>Call</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={stageColumnCard}>
          <div
            style={{
              ...stageColumnHeader,
              background:
                "linear-gradient(to right, rgba(124,58,237,0.08), transparent)",
            }}
          >
            <span style={stageColumnTitle}>
              Interview ({candidates.interview.length})
            </span>
            <Badge style={{ ...stageColumnBadge, backgroundColor: "#7C3AED" }}>
              {candidates.interview.length}
            </Badge>
          </div>

          <div style={stageColumnBody}>
            {candidates.interview.map((candidate) => (
              <div
                key={candidate.id}
                style={withHoverAnimation(candidateCardBase)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div style={candidateHeaderRow}>
                  <Avatar style={avatarStyle}>
                    <AvatarFallback
                      style={{
                        ...avatarInnerBase,
                        backgroundImage:
                          "linear-gradient(to bottom right,#7C3AED,#EC4899)",
                      }}
                    >
                      {candidate.avatar}
                    </AvatarFallback>
                  </Avatar>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={candidateName}>{candidate.name}</div>
                    <div style={candidateRole}>{candidate.role}</div>
                  </div>

                  <button
                    style={candidateMoreButton}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor =
                        "#F3F4F6")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor =
                        "transparent")
                    }
                    type="button"
                  >
                    <MoreVerticalRegular
                      style={{ width: 16, height: 16, color: "#6B7280" }}
                    />
                  </button>
                </div>

                <div style={candidateLabelRow}>
                  <span style={candidateLabel}>Match Score</span>
                  <span style={candidateScorePurple}>{candidate.score}%</span>
                </div>

                <Progress value={candidate.score} style={progressBarStyle} />

                <div style={candidateActionsRow}>
                  <button style={softButton} type="button">
                    <CalendarLtr20Regular style={{ width: 12, height: 12 }} />
                    <span>Schedule</span>
                  </button>
                  <button style={softButtonEmphasis} type="button">
                    <span>View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={stageColumnCard}>
          <div
            style={{
              ...stageColumnHeader,
              background:
                "linear-gradient(to right, rgba(34,197,94,0.08), transparent)",
            }}
          >
            <span style={stageColumnTitle}>
              Offer ({candidates.offer.length})
            </span>
            <Badge style={{ ...stageColumnBadge, backgroundColor: "#16A34A" }}>
              {candidates.offer.length}
            </Badge>
          </div>

          <div style={stageColumnBody}>
            {candidates.offer.map((candidate) => (
              <div
                key={candidate.id}
                style={withHoverAnimation({
                  ...candidateCardBase,
                  border: "1px solid #BBF7D0",
                  backgroundColor: "rgba(240,253,244,0.6)",
                })}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div style={candidateHeaderRow}>
                  <Avatar style={avatarStyle}>
                    <AvatarFallback
                      style={{
                        ...avatarInnerBase,
                        backgroundImage:
                          "linear-gradient(to bottom right,#16A34A,#22C55E)",
                      }}
                    >
                      {candidate.avatar}
                    </AvatarFallback>
                  </Avatar>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={candidateName}>{candidate.name}</div>
                    <div style={candidateRole}>{candidate.role}</div>
                  </div>

                  <button
                    style={candidateMoreButton}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor =
                        "#F3F4F6")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor =
                        "transparent")
                    }
                    type="button"
                  >
                    <MoreVerticalRegular
                      style={{ width: 16, height: 16, color: "#6B7280" }}
                    />
                  </button>
                </div>

                <div style={candidateLabelRow}>
                  <span style={candidateLabel}>Match Score</span>
                  <span style={candidateScoreGreen}>{candidate.score}%</span>
                </div>

                <Progress
                  value={candidate.score}
                  style={{ ...progressBarStyle, marginBottom: 12 }}
                />

                <Button style={primaryFullButton}>Send Offer</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
