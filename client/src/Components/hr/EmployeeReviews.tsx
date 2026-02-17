import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Textarea,
  ProgressBar,
  Tab,
  TabList,
  type TabValue,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  makeStyles,
  shorthands,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Field,
  Input,
} from "@fluentui/react-components";

import {
  Star20Filled,
  Star20Regular,
  CalendarLtr20Regular,
  TargetArrow20Regular,
  ChatMultiple20Regular,
  Trophy20Regular,
  ArrowTrending20Regular,
  Add20Regular,
} from "@fluentui/react-icons";

import { StatusPill } from "../ui/StatusPill";

type ReviewTab = "all" | "completed" | "pending" | "scheduled";

type ReviewStatusUi = "Completed" | "Pending" | "Scheduled" | "COMPLETED" | "PENDING" | "SCHEDULED";

type ReviewRow = {
  id: string | number;
  employee: string;
  position: string;
  reviewDate: string;
  reviewer: string;
  overallRating: number;
  categories: {
    technical: number;
    communication: number;
    teamwork: number;
    productivity: number;
  };
  status: ReviewStatusUi;
};

type ReviewsListResponse = ReviewRow[];

type ReviewDetail = {
  id: string | number;
  employee: string;
  position: string;
  reviewer: string;
  reviewDate: string;
  overallRating: number;
  categories: ReviewRow["categories"];
  status: ReviewStatusUi;

  managerFeedback?: string;
  areasForGrowth?: string;
  goals?: string[];
  achievements?: string[];
};

type ReviewsStatsResponse = {
  totalReviews: number;
  completed: number;
  pending: number;
  scheduled: number;
  thisQuarter: number;
  avgRating: number;
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
    throw new Error(msg);
  }

  return data as T;
}

async function apiPut<T>(
  url: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(url, {
    method: "PUT",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await safeJson(res);

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "message" in data && data.message) ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data as T;
}

async function apiPost<T>(
  url: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(url, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await safeJson(res);

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "message" in data && data.message) ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data as T;
}

function fetchReviews(tab: ReviewTab, signal?: AbortSignal) {
  const q =
    tab === "all"
      ? ""
      : tab === "completed"
        ? "?status=completed"
        : tab === "pending"
          ? "?status=pending"
          : "?status=scheduled";

  return apiGet<ReviewsListResponse>(`/api/reviews${q}`, signal);
}

function fetchStats(signal?: AbortSignal) {
  return apiGet<ReviewsStatsResponse>("/api/reviews/stats", signal);
}

function fetchReviewDetail(id: string | number, signal?: AbortSignal) {
  return apiGet<ReviewDetail>(`/api/reviews/${id}`, signal);
}

function updateReview(
  id: string | number,
  payload: Partial<ReviewDetail>,
  signal?: AbortSignal,
) {
  return apiPut<{ ok: boolean }>(`/api/reviews/${id}`, payload, signal);
}

function initials(name: string) {
  const s = (name || "").trim();
  if (!s) return "NA";
  const parts = s.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "N";
  const second = parts.length > 1 ? parts[1][0] : (parts[0]?.[1] ?? "A");
  return (first + second).toUpperCase();
}

function clampRating0to5(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(5, v));
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

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: "12px",
    flexWrap: "wrap",
  },

  headerTitleBlock: {
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
  },

  headerTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#0B1220",
  },

  headerSubtitle: {
    fontSize: "0.85rem",
    color: "#5B6475",
  },

  primaryButton: {
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
    ":hover": {
      backgroundColor: "#1B56FD",
      color: "#FFFFFF",
    },
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(1,minmax(0,1fr))",
    rowGap: "12px",
    columnGap: "12px",

    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(4,minmax(0,1fr))",
    },
  },

  statCard: {
    ...shorthands.borderRadius("12px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    padding: "16px 18px",
    backgroundColor: "#FFFFFF",
  },

  statLabel: {
    fontSize: "0.8rem",
    color: "#5B6475",
    marginBottom: "4px",
  },

  statValue: {
    fontSize: "2rem",
    fontWeight: 600,
    color: "#0B1220",
  },

  statIconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  tabsWrapper: {
    display: "inline-flex",
    ...shorthands.borderRadius("999px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    backgroundColor: "#FFFFFF",
    padding: "4px 8px",
    alignSelf: "flex-start",
  },

  tabList: {
    columnGap: "8px",
    rowGap: "6px",
    flexWrap: "wrap",
  },

  tableCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    padding: 0,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  tableWrapper: {
    overflowX: "auto",
    backgroundColor: "#FFFFFF",
  },

  table: {
    width: "100%",
    minWidth: "900px",
  },

  tableHeaderRow: {
    background:
      "linear-gradient(to right, rgba(1,24,216,0.06), rgba(27,86,253,0.06))",
  },

  tableHeaderCell: {
    fontSize: "0.8rem",
    color: "#4B5563",
    fontWeight: 600,
    padding: "12px 16px",
  },

  tableRow: {
    height: "60px",
    backgroundColor: "#FFFFFF",
    ":not(:last-child)": {
      borderBottom: "1px solid #F3F4F6",
    },
    ":hover": {
      backgroundColor: "#F9FAFF",
    },
  },

  tableCell: {
    padding: "12px 16px",
    fontSize: "0.85rem",
    color: "#4B5563",
  },

  employeeCell: {
    padding: "12px 16px",
  },

  employeeRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "12px",
  },

  avatarCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "999px",
    background: "linear-gradient(to bottom right, #0118D8, #1B56FD)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontWeight: 600,
    fontSize: "0.8rem",
    flexShrink: 0,
  },

  employeeName: {
    color: "#0B1220",
    fontWeight: 500,
    fontSize: "0.9rem",
  },

  ratingNumber: {
    color: "#0118D8",
    fontWeight: 600,
    fontSize: "0.9rem",
  },

  ratingRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
  },

  ratingStars: {
    display: "flex",
    columnGap: "2px",
  },

  detailCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    padding: "24px",
    backgroundColor: "#FFFFFF",
  },

  detailTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "16px",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    rowGap: "24px",
    columnGap: "24px",

    "@media (min-width: 992px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },

  sectionTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "12px",
  },

  categoryBlock: {
    marginBottom: "16px",
  },

  categoryHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "6px",
  },

  categoryLabel: {
    color: "#0B1220",
    fontSize: "0.9rem",
  },

  categoryRatingRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
  },

  progress: {
    marginTop: "4px",
  },

  achievementList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  achievementItem: {
    display: "flex",
    columnGap: "8px",
    marginBottom: "8px",
  },

  achievementIconCircle: {
    width: "24px",
    height: "24px",
    borderRadius: "999px",
    backgroundColor: "#ECFDF5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "2px",
  },

  achievementText: {
    color: "#5B6475",
    fontSize: "0.85rem",
  },

  feedbackCard: {
    ...shorthands.borderRadius("12px"),
    backgroundColor: "#EFF6FF",
    ...shorthands.border("1px", "solid", "#BFDBFE"),
    padding: "12px 14px",
  },

  feedbackRow: {
    display: "flex",
    columnGap: "8px",
  },

  feedbackIcon: {
    marginTop: "2px",
    flexShrink: 0,
  },

  feedbackText: {
    fontSize: "0.9rem",
    color: "#0B1220",
  },

  goalsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  goalItem: {
    display: "flex",
    columnGap: "8px",
    marginBottom: "8px",
  },

  goalIconCircle: {
    width: "24px",
    height: "24px",
    borderRadius: "999px",
    backgroundColor: "#EEF2FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "2px",
  },

  goalText: {
    color: "#5B6475",
    fontSize: "0.85rem",
  },

  detailButtonsRow: {
    display: "flex",
    columnGap: "12px",
    marginTop: "8px",
  },

  primaryDetailButton: {
    flex: 1,
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
    ":hover": {
      backgroundColor: "#1B56FD",
      color: "#FFFFFF",
    },
  },

  secondaryDetailButton: {
    flex: 1,
  },

  growthTextarea: {
    width: "100%",
    boxSizing: "border-box",

    border: "1px solid rgba(148,163,184,0.9) !important",
    ...shorthands.borderRadius("10px"),

    backgroundColor: "#FFFFFF !important",

    fontSize: "0.85rem",
    padding: "10px 12px",

    ":hover": {
      border: "1px solid rgba(148,163,184,0.9) !important",
      backgroundColor: "#FFFFFF !important",
    },

    ":focus": {
      border: "1px solid rgba(148,163,184,0.9) !important",
      outlineStyle: "none",
    },

    ":focus-within": {
      border: "1px solid rgba(148,163,184,0.9) !important",
    },
  },
});

export function EmployeeReviews() {
  const styles = useStyles();

  const [activeTab, setActiveTab] = useState<TabValue>("all" as ReviewTab);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [stats, setStats] = useState<ReviewsStatsResponse>({
    totalReviews: 0,
    completed: 0,
    pending: 0,
    scheduled: 0,
    thisQuarter: 0,
    avgRating: 0,
  });

  const [selectedReviewId, setSelectedReviewId] = useState<
    string | number | null
  >(null);
  const [detail, setDetail] = useState<ReviewDetail | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    employeeId: "",
    employeeName: "",
    position: "",
    reviewDate: new Date().toISOString().split("T")[0],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editDetail, setEditDetail] = useState<Partial<ReviewDetail>>({});

  const [areasForGrowth, setAreasForGrowth] = useState<string>("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await apiGet<{ id: string; name: string }[]>("/api/reviews/employees");
        setEmployees(data);
      } catch (e) {
        console.error("Failed to fetch employees:", e);
      }
    };
    void fetchEmployees();
  }, []);

  const load = React.useCallback(async (signal?: AbortSignal) => {
    try {
      setError(null);
      const [statsRes, listRes] = await Promise.all([
        fetchStats(signal),
        fetchReviews(activeTab as ReviewTab, signal),
      ]);
      setStats(statsRes);
      setReviews(Array.isArray(listRes) ? listRes : []);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }, [activeTab]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        await load(controller.signal);
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return;
        console.error("Load failed", e);
      }
    })();
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    const controller = new AbortController();
    if (!selectedReviewId) {
      Promise.resolve().then(() => {
        setDetail(null);
        setAreasForGrowth("");
      });
      return;
    }
    (async () => {
      try {
        setError(null);
        const d = await fetchReviewDetail(selectedReviewId, controller.signal);
        setDetail(d);
        setAreasForGrowth(d.areasForGrowth ?? "");
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Failed to load details");
      }
    })();
    return () => controller.abort();
  }, [selectedReviewId]);

  async function onSubmitSchedule() {
    if (!newReview.employeeId) {
      setError("Please select an employee");
      return;
    }
    try {
      setError(null);
      await apiPost("/api/reviews", {
        employeeId: newReview.employeeId,
        employeeName: newReview.employeeName,
        position: newReview.position,
        reviewDate: new Date(newReview.reviewDate),
        status: "SCHEDULED",
        categories: { technical: 0, communication: 0, teamwork: 0, productivity: 0 }
      });
      setIsScheduleOpen(false);
      void load(); 
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Schedule failed");
    }
  }

  async function onCompleteReview() {
    if (!detail?.id) return;
    try {
      setError(null);
      await updateReview(detail.id, { status: "COMPLETED" });
      void load();
      const updated = await fetchReviewDetail(detail.id);
      setDetail(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Completion failed");
    }
  }

  async function onSaveReview() {
    if (!detail?.id) return;
    try {
      setError(null);
      const payload: Partial<ReviewDetail> = isEditing ? { ...editDetail } : { areasForGrowth: areasForGrowth };
      
      if (isEditing && payload.categories) {
        const c = payload.categories;
        const avg = (Number(c.technical || 0) + Number(c.communication || 0) + Number(c.teamwork || 0) + Number(c.productivity || 0)) / 4;
        payload.overallRating = Number(avg.toFixed(1));
      }

      if (payload.status) {
        payload.status = payload.status.toUpperCase() as ReviewStatusUi;
      }
      const backendPayload = { ...payload };
      delete (backendPayload as { id?: unknown }).id;

      await updateReview(detail.id, backendPayload);
      
      void load();
      const updated = await fetchReviewDetail(detail.id);
      setDetail(updated);
      setIsEditing(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  const toggleEdit = () => {
    if (!isEditing && detail) {
      setEditDetail(detail);
    }
    setIsEditing(!isEditing);
  };

  const filteredReviews = useMemo(() => {
    if (activeTab === "completed")
      return reviews.filter((r) => r.status === "Completed");
    if (activeTab === "pending")
      return reviews.filter((r) => r.status === "Pending");
    if (activeTab === "scheduled")
      return reviews.filter(
        (r) =>
          r.status === "Scheduled" ||
          r.reviewDate.toLowerCase().includes("scheduled"),
      );
    return reviews;
  }, [activeTab, reviews]);

  const totalReviews = stats.totalReviews;
  const completed = stats.completed;
  const pending = stats.pending;
  const scheduled = stats.scheduled;
  const thisQuarter = stats.thisQuarter;
  const avgRating = clampRating0to5(stats.avgRating);
  const avgStars = Math.floor(avgRating);

  const detailTitleName = detail?.employee ?? "—";
  const categories = detail?.categories ?? {
    technical: 0,
    communication: 0,
    teamwork: 0,
    productivity: 0,
  };

  const achievements = detail?.achievements?.length
    ? detail.achievements
    : [];

  const goals = detail?.goals?.length
    ? detail.goals
    : [];

  const managerFeedback = detail?.managerFeedback ?? "“—”";

  return (
    <>
      <div className={styles.root}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleBlock}>
          <span className={styles.headerTitle}>
            Employee Performance Reviews
          </span>
          <span className={styles.headerSubtitle}>
            Track and manage employee performance evaluations and feedback
          </span>
        </div>

        <Button
          appearance="primary"
          className={styles.primaryButton}
          icon={<Add20Regular />}
          onClick={() => setIsScheduleOpen(true)}
        >
          Schedule Review
        </Button>
      </div>

      {error && <Text style={{ color: "#B91C1C", fontSize: 12 }}>{error}</Text>}

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div className={styles.statLabel}>Total Reviews</div>
              <div className={styles.statValue}>{totalReviews}</div>
            </div>
            <div
              className={styles.statIconBox}
              style={{ backgroundColor: "#EFF6FF" }}
            >
              <Trophy20Regular style={{ color: "#0118D8", fontSize: 22 }} />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div className={styles.statLabel}>Avg Rating</div>
              <div className={styles.ratingRow}>
                <span className={styles.statValue}>{avgRating.toFixed(1)}</span>
                <div className={styles.ratingStars}>
                  {Array.from({ length: 5 }).map((_, i) =>
                    i < avgStars ? (
                      <Star20Filled key={i} style={{ color: "#F59E0B" }} />
                    ) : (
                      <Star20Regular key={i} style={{ color: "#D1D5DB" }} />
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div className={styles.statLabel}>This Quarter</div>
              <div className={styles.statValue}>{thisQuarter}</div>
            </div>
            <div
              className={styles.statIconBox}
              style={{ backgroundColor: "#ECFDF5" }}
            >
              <CalendarLtr20Regular
                style={{ color: "#16A34A", fontSize: 22 }}
              />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div className={styles.statLabel}>Pending</div>
              <div className={styles.statValue}>{pending}</div>
            </div>
            <div
              className={styles.statIconBox}
              style={{ backgroundColor: "#FFFBEB" }}
            >
              <TargetArrow20Regular
                style={{ color: "#D97706", fontSize: 22 }}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.tabsWrapper}>
        <TabList
          selectedValue={activeTab}
          onTabSelect={(_, data) => setActiveTab(data.value as ReviewTab)}
          className={styles.tabList}
        >
          <Tab value="all">All Reviews ({totalReviews})</Tab>
          <Tab value="completed">Completed ({completed})</Tab>
          <Tab value="pending">Pending ({pending})</Tab>
          <Tab value="scheduled">Scheduled ({scheduled})</Tab>
        </TabList>
      </div>

      <Card className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <Table aria-label="Employee reviews" className={styles.table}>
            <TableHeader>
              <TableRow className={styles.tableHeaderRow}>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Employee
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Position
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Review Date
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Reviewer
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Overall Rating
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Status
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Actions
                </TableHeaderCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id} className={styles.tableRow}>
                  <TableCell className={styles.employeeCell}>
                    <div className={styles.employeeRow}>
                      <div className={styles.avatarCircle}>
                        {initials(review.employee)}
                      </div>
                      <span className={styles.employeeName}>
                        {review.employee}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    {review.position}
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    {review.reviewDate}
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    {review.reviewer}
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    {review.overallRating > 0 ? (
                      <div className={styles.ratingRow}>
                        <span className={styles.ratingNumber}>
                          {review.overallRating}
                        </span>
                        <div className={styles.ratingStars}>
                          {Array.from({ length: 5 }).map((_, i) =>
                            i < Math.floor(review.overallRating) ? (
                              <Star20Filled
                                key={i}
                                style={{ color: "#F59E0B" }}
                              />
                            ) : (
                              <Star20Regular
                                key={i}
                                style={{ color: "#D1D5DB" }}
                              />
                            ),
                          )}
                        </div>
                      </div>
                    ) : (
                      <Text style={{ color: "#6B7280" }}>Not rated</Text>
                    )}
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    <StatusPill
                      status={
                        review.status === "Completed" ? "success" : "pending"
                      }
                      label={review.status}
                      size="sm"
                    />
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    <Button
                      appearance="subtle"
                      size="small"
                      onClick={() => setSelectedReviewId(review.id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className={styles.detailCard}>
        <div className={styles.detailTitle}>
          Performance Review: {detailTitleName}
        </div>

        <div className={styles.detailGrid}>
          <div style={{ padding: "16px", backgroundColor: "#F9FAFB", borderRadius: "8px", marginBottom: "16px", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.85rem", color: "#6B7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.025em" }}>Overall Rating</span>
              <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>
                {isEditing ? (
                  ((p: Partial<ReviewDetail>) => {
                    const c = p.categories || { technical: 0, communication: 0, teamwork: 0, productivity: 0 };
                    const avg = (Number(c.technical || 0) + Number(c.communication || 0) + Number(c.teamwork || 0) + Number(c.productivity || 0)) / 4;
                    return avg.toFixed(1);
                  })(editDetail)
                ) : (
                  detail?.overallRating || "0.0"
                )}
                <span style={{ fontSize: "0.85rem", color: "#6B7280", fontWeight: 400, marginLeft: "4px" }}>/ 5.0</span>
              </span>
            </div>
            <div className={styles.ratingStars} style={{ fontSize: "1.5rem" }}>
              {Array.from({ length: 5 }).map((_, i) => {
                const effectiveRating = isEditing 
                  ? ((p: Partial<ReviewDetail>) => {
                      const c = p.categories || { technical: 0, communication: 0, teamwork: 0, productivity: 0 };
                      return (Number(c.technical || 0) + Number(c.communication || 0) + Number(c.teamwork || 0) + Number(c.productivity || 0)) / 4;
                    })(editDetail)
                  : (detail?.overallRating || 0);
                return i < Math.floor(effectiveRating) ? (
                  <Star20Filled key={i} style={{ color: "#F59E0B", width: "24px", height: "24px" }} />
                ) : (
                  <Star20Regular key={i} style={{ color: "#D1D5DB", width: "24px", height: "24px" }} />
                );
              })}
            </div>
          </div>

          <div>
            <div className={styles.sectionTitle}>Performance Categories</div>

            {Object.entries(categories).map(([category, rating]) => {
              const r = isEditing 
                ? (editDetail.categories?.[category as keyof ReviewDetail["categories"]] ?? 0)
                : clampRating0to5(rating);
              return (
                <div key={category} className={styles.categoryBlock}>
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryLabel}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}{" "}
                      Skills
                    </span>
                    <div className={styles.categoryRatingRow}>
                      {isEditing ? (
                        <Input
                          type="number"
                          min={0}
                          max={5}
                          step={0.5}
                          value={String(r)}
                          onChange={(_, d) => setEditDetail(p => ({
                            ...p,
                            categories: {
                              technical: p.categories?.technical ?? 0,
                              communication: p.categories?.communication ?? 0,
                              teamwork: p.categories?.teamwork ?? 0,
                              productivity: p.categories?.productivity ?? 0,
                              [category]: Number(d.value)
                            }
                          }))}
                          style={{ width: "60px" }}
                        />
                      ) : (
                        <>
                          <span
                            style={{
                              color: "#0118D8",
                              fontWeight: 600,
                              fontSize: "0.85rem",
                            }}
                          >
                            {r}/5
                          </span>
                          <div className={styles.ratingStars}>
                            {Array.from({ length: 5 }).map((_, i) =>
                              i < Math.floor(r) ? (
                                <Star20Filled
                                  key={i}
                                  style={{ color: "#F59E0B" }}
                                />
                              ) : (
                                <Star20Regular
                                  key={i}
                                  style={{ color: "#D1D5DB" }}
                                />
                              ),
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {!isEditing && <ProgressBar value={r / 5} className={styles.progress} />}
                </div>
              );
            })}

            <div style={{ marginTop: "8px" }}>
              <div className={styles.sectionTitle}>Key Achievements</div>
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(editDetail.achievements || []).map((t, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "8px" }}>
                      <Input
                        value={t}
                        onChange={(_, d) => setEditDetail(p => {
                          const arr = [...(p.achievements || [])];
                          arr[idx] = d.value;
                          return { ...p, achievements: arr };
                        })}
                        style={{ flex: 1 }}
                      />
                      <Button onClick={() => setEditDetail(p => ({
                        ...p,
                        achievements: (p.achievements || []).filter((_, i) => i !== idx)
                      }))}>-</Button>
                    </div>
                  ))}
                  <Button onClick={() => setEditDetail(p => ({
                    ...p,
                    achievements: [...(p.achievements || []), ""]
                  }))}>Add Achievement</Button>
                </div>
              ) : (
                <ul className={styles.achievementList}>
                  {achievements.map((t, idx) => (
                    <li key={idx} className={styles.achievementItem}>
                      <div className={styles.achievementIconCircle}>
                        <ArrowTrending20Regular
                          style={{ color: "#16A34A", fontSize: 14 }}
                        />
                      </div>
                      <span className={styles.achievementText}>{t}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <div style={{ marginBottom: "16px" }}>
              <div className={styles.sectionTitle}>Manager Feedback</div>
              {isEditing ? (
                <Textarea
                  value={editDetail.managerFeedback || ""}
                  onChange={(_, d) => setEditDetail(p => ({ ...p, managerFeedback: d.value }))}
                  style={{ width: "100%" }}
                  rows={4}
                />
              ) : (
                <div className={styles.feedbackCard}>
                  <div className={styles.feedbackRow}>
                    <div className={styles.feedbackIcon}>
                      <ChatMultiple20Regular
                        style={{ color: "#0118D8", fontSize: 18 }}
                      />
                    </div>
                    <span className={styles.feedbackText}>{managerFeedback}</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div className={styles.sectionTitle}>Areas for Growth</div>
              <Textarea
                appearance="filled-lighter"
                resize="none"
                rows={3}
                value={isEditing ? (editDetail.areasForGrowth || "") : areasForGrowth}
                onChange={(_, data) => isEditing 
                  ? setEditDetail(p => ({ ...p, areasForGrowth: data.value }))
                  : setAreasForGrowth(data.value)
                }
                className={styles.growthTextarea}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div className={styles.sectionTitle}>Goals for Next Period</div>
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(editDetail.goals || []).map((t, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "8px" }}>
                      <Input
                        value={t}
                        onChange={(_, d) => setEditDetail(p => {
                          const arr = [...(p.goals || [])];
                          arr[idx] = d.value;
                          return { ...p, goals: arr };
                        })}
                        style={{ flex: 1 }}
                      />
                      <Button onClick={() => setEditDetail(p => ({
                        ...p,
                        goals: (p.goals || []).filter((_, i) => i !== idx)
                      }))}>-</Button>
                    </div>
                  ))}
                  <Button onClick={() => setEditDetail(p => ({
                    ...p,
                    goals: [...(p.goals || []), ""]
                  }))}>Add Goal</Button>
                </div>
              ) : (
                <ul className={styles.goalsList}>
                  {goals.map((t, idx) => (
                    <li key={idx} className={styles.goalItem}>
                      <div className={styles.goalIconCircle}>
                        <TargetArrow20Regular
                          style={{ color: "#0118D8", fontSize: 14 }}
                        />
                      </div>
                      <span className={styles.goalText}>{t}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.detailButtonsRow}>
              {isEditing ? (
                <>
                  <Button
                    appearance="primary"
                    className={styles.primaryDetailButton}
                    onClick={onSaveReview}
                  >
                    Save Changes
                  </Button>
                  <Button
                    appearance="outline"
                    className={styles.secondaryDetailButton}
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  {detail?.status !== "Completed" && (
                    <Button
                      appearance="primary"
                      className={styles.primaryDetailButton}
                      onClick={onCompleteReview}
                      style={{ backgroundColor: "#10B981" }} // Green for completion
                    >
                      Complete Review
                    </Button>
                  )}
                  <Button
                    appearance="outline"
                    className={styles.secondaryDetailButton}
                    onClick={toggleEdit}
                  >
                    Edit Details
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
      <Dialog open={isScheduleOpen} onOpenChange={(_, d) => setIsScheduleOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Schedule Performance Review</DialogTitle>
            <DialogContent style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Field label="Employee" required>
                <select
                  value={newReview.employeeId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const emp = employees.find(x => x.id === id);
                    setNewReview(p => ({ ...p, employeeId: id, employeeName: emp?.name || "" }));
                  }}
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #D1D5DB"
                  }}
                >
                  <option value="">Select Employee...</option>
                  {employees.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Position" required>
                <Input
                  value={newReview.position}
                  onChange={(_, d) => setNewReview(p => ({ ...p, position: d.value }))}
                />
              </Field>
              <Field label="Date" required>
                <Input
                  type="date"
                  value={newReview.reviewDate}
                  onChange={(_, d) => setNewReview(p => ({ ...p, reviewDate: d.value }))}
                />
              </Field>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setIsScheduleOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={onSubmitSchedule}>Schedule</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
