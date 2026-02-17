import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  Checkbox,
  ProgressBar,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableBody,
  TableCell,
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
  PeopleTeam20Regular,
  CalendarLtr20Regular,
  Mail20Regular,
  PersonAdd20Regular,
  Laptop20Regular,
  BookOpenFilled,
  CheckmarkCircle20Regular,
} from "@fluentui/react-icons";

import { StatusPill } from "../ui/StatusPill";

type UiStatus = "In Progress" | "Completed";

type OnboardingRow = {
  id: string | number;
  employee: string;
  position: string;
  startDate: string; 
  progress: number; 
  status: UiStatus;
  daysRemaining: number;
};

type OnboardingTask = { id: string | number; name: string; completed: boolean };

type OnboardingStepDto = {
  category: string;
  iconKey: "MAIL" | "LAPTOP" | "BOOK" | "TEAM";
  tasks: OnboardingTask[];
};

type OnboardingDetailDto = {
  id: string | number;
  employee: string;
  position: string;
  startDate: string;
  progress: number;
  status: UiStatus;
  steps: OnboardingStepDto[];
};

type OnboardingStatsDto = {
  activeOnboardingCount: number;
  completedCount: number;
  avgCompletion: string; 
  successRate: string; 
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
      (data &&
        typeof data === "object" &&
        "message" in data &&
        (data).message) ||
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
      (data &&
        typeof data === "object" &&
        "message" in data &&
        (data).message) ||
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
      (data &&
        typeof data === "object" &&
        "message" in data &&
        (data).message) ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data as T;
}


function fetchOnboardingStats(signal?: AbortSignal) {
  return apiGet<OnboardingStatsDto>("/api/onboarding/stats", signal);
}

function fetchOnboardingList(signal?: AbortSignal) {
  return apiGet<OnboardingRow[]>("/api/onboarding", signal);
}

function fetchEmployeeLookup(signal?: AbortSignal) {
  return apiGet<{ id: string; name: string }[]>("/api/reviews/employees", signal);
}

function fetchOnboardingDetail(id: string | number, signal?: AbortSignal) {
  return apiGet<OnboardingDetailDto>(`/api/onboarding/${id}`, signal);
}

function updateTask(
  onboardingId: string | number,
  taskId: string | number,
  completed: boolean,
  signal?: AbortSignal,
) {
  return apiPut<{ ok: boolean }>(
    `/api/onboarding/${onboardingId}/task/${taskId}`,
    { completed },
    signal,
  );
}


function iconFromKey(key: OnboardingStepDto["iconKey"]) {
  if (key === "MAIL") return Mail20Regular;
  if (key === "LAPTOP") return Laptop20Regular;
  if (key === "BOOK") return BookOpenFilled;
  return PeopleTeam20Regular;
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
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    rowGap: "12px",
    columnGap: "12px",

    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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

  sectionCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    backgroundColor: "#FFFFFF",
  },

  sectionHeader: {
    ...shorthands.borderBottom("1px", "solid", "rgba(2,6,23,0.08)"),
    padding: "16px 20px",
  },

  sectionTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#0B1220",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "880px",
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

  progressCellInner: {
    width: "140px",
  },

  progressLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },

  progressLabel: {
    fontSize: "0.8rem",
    color: "#0118D8",
    fontWeight: 500,
  },

  workflowCardInner: {
    padding: "20px 20px 16px",
  },

  workflowTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "16px",
  },

  workflowStepBlock: {
    marginBottom: "20px",
  },

  workflowStepHeader: {
    display: "flex",
    columnGap: "12px",
    alignItems: "center",
    marginBottom: "8px",
  },

  workflowStepIconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  workflowStepInfo: {
    flex: 1,
  },

  workflowStepTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },

  workflowStepTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#0B1220",
  },

  workflowStepMeta: {
    fontSize: "0.8rem",
    color: "#5B6475",
  },

  workflowProgress: {
    marginTop: "4px",
  },

  tasksWrapper: {
    marginLeft: "60px",
    marginTop: "6px",
  },

  taskItem: {
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
    ...shorthands.borderRadius("10px"),
    padding: "8px 10px",
    transitionProperty: "background-color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "#F3F4F6",
    },
  },

  taskText: {
    fontSize: "0.85rem",
    color: "#0B1220",
  },

  taskTextCompleted: {
    fontSize: "0.85rem",
    color: "#6B7280",
    textDecoration: "line-through",
  },

  taskCompletedIcon: {
    marginLeft: "auto",
    flexShrink: 0,
  },

  workflowFooterRow: {
    display: "flex",
    columnGap: "12px",
    marginTop: "16px",
  },

  workflowPrimaryButton: {
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
    ":hover": {
      backgroundColor: "#1B56FD",
      color: "#FFFFFF",
    },
  },

  workflowSecondaryButton: {
    ":hover": {
      backgroundColor: "rgba(1,24,216,0.06)",
      ...shorthands.border("1px", "solid", "#0118D8"),
      color: "#0118D8",
    },
  },
});

export function OnboardingWorkflow() {
  const styles = useStyles();

  const [stats, setStats] = useState<OnboardingStatsDto>({
    activeOnboardingCount: 0,
    completedCount: 0,
    avgCompletion: "0 days",
    successRate: "0%",
  });

  const [mockOnboarding, setMockOnboarding] = useState<OnboardingRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const [onboardingSteps, setOnboardingSteps] = useState<
    { category: string; icon: React.ComponentType<{ style?: React.CSSProperties }>; tasks: OnboardingTask[] }[]
  >([]);

  const [workflowName, setWorkflowName] = useState<string>("—");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [newOnboarding, setNewOnboarding] = useState({
    employeeId: "",
    employeeName: "",
    position: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  const [error, setError] = useState<string | null>(null);

  const activeOnboardingCount = stats.activeOnboardingCount;
  const completedCount = stats.completedCount;
  const avgCompletion = stats.avgCompletion;
  const successRate = stats.successRate;

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const [s, list, emps] = await Promise.all([
        fetchOnboardingStats(signal),
        fetchOnboardingList(signal),
        fetchEmployeeLookup(signal),
      ]);

      setStats(s);
      const rows = Array.isArray(list) ? list : [];
      setMockOnboarding(rows);
      setEmployees(Array.isArray(emps) ? emps : []);

      if (rows.length > 0 && !selectedId) {
        setSelectedId(rows[0].id);
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      console.error("Load failed", e);
    }
  }, [selectedId]);

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

    (async () => {
      if (!selectedId) {
        setOnboardingSteps([]);
        setWorkflowName("—");
        return;
      }
      try {
        const d = await fetchOnboardingDetail(selectedId, controller.signal);

        setWorkflowName(d.employee || "—");

        const steps = (d.steps || []).map((s) => ({
          category: s.category,
          icon: iconFromKey(s.iconKey),
          tasks: s.tasks || [],
        }));

        setOnboardingSteps(steps);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setOnboardingSteps([]);
        setWorkflowName("—");
      }
    })();

    return () => controller.abort();
  }, [selectedId]);

  async function onSubmitOnboarding() {
    if (!newOnboarding.employeeId) {
      setError("Please select an employee");
      return;
    }
    try {
      setError(null);
      const res: { id: string } = await apiPost("/api/onboarding", newOnboarding);
      setIsDialogOpen(false);
      setSelectedId(res.id);
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Start failed");
    }
  }

  return (
    <>
      <div className={styles.root}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleBlock}>
          <span className={styles.headerTitle}>Employee Onboarding</span>
          <span className={styles.headerSubtitle}>
            Track and manage new employee onboarding progress
          </span>
        </div>

        <Button
          appearance="primary"
          className={styles.primaryButton}
          icon={<PersonAdd20Regular />}
          onClick={() => setIsDialogOpen(true)}
        >
          Start Onboarding
        </Button>
      </div>

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
              <div className={styles.statLabel}>Active Onboarding</div>
              <div className={styles.statValue}>{activeOnboardingCount}</div>
            </div>
            <div
              className={styles.statIconBox}
              style={{ backgroundColor: "#EFF6FF" }}
            >
              <PeopleTeam20Regular style={{ color: "#0118D8", fontSize: 22 }} />
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
              <div className={styles.statLabel}>Completed</div>
              <div className={styles.statValue}>{completedCount}</div>
            </div>
            <div
              className={styles.statIconBox}
              style={{ backgroundColor: "#ECFDF5" }}
            >
              <CheckmarkCircle20Regular
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
              <div className={styles.statLabel}>Avg Completion</div>
              <div className={styles.statValue}>{avgCompletion}</div>
            </div>
            <div
              className={styles.statIconBox}
              style={{ backgroundColor: "#F5F3FF" }}
            >
              <CalendarLtr20Regular
                style={{ color: "#7C3AED", fontSize: 22 }}
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
              <div className={styles.statLabel}>Success Rate</div>
              <div className={styles.statValue}>{successRate}</div>
            </div>
            <div
              className={styles.statIconBox}
              style={{ backgroundColor: "#ECFDF5" }}
            >
              <CheckmarkCircle20Regular
                style={{ color: "#16A34A", fontSize: 22 }}
              />
            </div>
          </div>
        </Card>
      </div>

      <Card className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>
            Active Onboarding Processes
          </span>
        </div>

        <div className={styles.tableWrapper}>
          <Table aria-label="Active onboarding" className={styles.table}>
            <TableHeader>
              <TableRow className={styles.tableHeaderRow}>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Employee
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Position
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Start Date
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Progress
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Days Remaining
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
              {mockOnboarding.map((item) => {
                const initials = item.employee
                  .split(" ")
                  .map((n) => n[0])
                  .join("");

                const isCompleted = item.status === "Completed";

                return (
                  <TableRow key={item.id} className={styles.tableRow}>
                    <TableCell className={styles.employeeCell}>
                      <div className={styles.employeeRow}>
                        <div className={styles.avatarCircle}>{initials}</div>
                        <span className={styles.employeeName}>
                          {item.employee}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className={styles.tableCell}>
                      {item.position}
                    </TableCell>

                    <TableCell className={styles.tableCell}>
                      {item.startDate}
                    </TableCell>

                    <TableCell className={styles.tableCell}>
                      <div className={styles.progressCellInner}>
                        <div className={styles.progressLabelRow}>
                          <span className={styles.progressLabel}>
                            {item.progress}%
                          </span>
                        </div>
                        <ProgressBar
                          value={item.progress / 100}
                          className={styles.workflowProgress}
                        />
                      </div>
                    </TableCell>

                    <TableCell className={styles.tableCell}>
                      {item.daysRemaining > 0
                        ? `${item.daysRemaining} days`
                        : "Completed"}
                    </TableCell>

                    <TableCell className={styles.tableCell}>
                      <StatusPill
                        status={isCompleted ? "success" : "pending"}
                        label={item.status}
                        size="sm"
                      />
                    </TableCell>

                    <TableCell className={styles.tableCell}>
                      <Button
                        appearance="subtle"
                        size="small"
                        onClick={() => setSelectedId(item.id)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className={styles.sectionCard}>
        <div className={styles.workflowCardInner}>
          <div className={styles.workflowTitle}>
            Onboarding Workflow: {workflowName}
          </div>

          <div>
            {onboardingSteps.map((step, index) => {
              const Icon = step.icon;
              const completedTasks = step.tasks.filter((t) => t.completed).length;
              const totalTasks = step.tasks.length;
              const progressPercentage =
                totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

              const iconBg =
                progressPercentage === 100
                  ? "#ECFDF5"
                  : progressPercentage > 0
                    ? "#EFF6FF"
                    : "#F3F4F6";

              const iconColor =
                progressPercentage === 100
                  ? "#16A34A"
                  : progressPercentage > 0
                    ? "#0118D8"
                    : "#9CA3AF";

              return (
                <div key={index} className={styles.workflowStepBlock}>
                  <div className={styles.workflowStepHeader}>
                    <div
                      className={styles.workflowStepIconBox}
                      style={{ backgroundColor: iconBg }}
                    >
                      <Icon style={{ color: iconColor, fontSize: 20 }} />
                    </div>

                    <div className={styles.workflowStepInfo}>
                      <div className={styles.workflowStepTitleRow}>
                        <span className={styles.workflowStepTitle}>
                          {step.category}
                        </span>
                        <span className={styles.workflowStepMeta}>
                          {completedTasks}/{totalTasks} completed
                        </span>
                      </div>
                      <ProgressBar
                        value={progressPercentage / 100}
                        className={styles.workflowProgress}
                      />
                    </div>
                  </div>

                  <div className={styles.tasksWrapper}>
                    {step.tasks.map((task) => (
                      <div key={task.id} className={styles.taskItem}>
                        <Checkbox
                          checked={task.completed}
                          onChange={async (_e, data) => {
                            if (!selectedId) return;

                            const next = !!data.checked;

                            setOnboardingSteps((prev) =>
                              prev.map((s) =>
                                s.category !== step.category
                                  ? s
                                  : {
                                      ...s,
                                      tasks: s.tasks.map((t) =>
                                        t.id === task.id
                                          ? { ...t, completed: next }
                                          : t,
                                      ),
                                    },
                              ),
                            );

                            try {
                              await updateTask(selectedId, task.id, next);
                              void load(); 
                            } catch {
                              void load();
                            }
                          }}
                        />
                        <span
                          className={
                            task.completed
                              ? styles.taskTextCompleted
                              : styles.taskText
                          }
                        >
                          {task.name}
                        </span>
                        {task.completed && (
                          <span className={styles.taskCompletedIcon}>
                            <CheckmarkCircle20Regular
                              style={{ color: "#16A34A", fontSize: 16 }}
                            />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.workflowFooterRow}>
            <Button
              appearance="primary"
              className={styles.workflowPrimaryButton}
            >
              Update Progress
            </Button>
            <Button
              appearance="outline"
              className={styles.workflowSecondaryButton}
              icon={<Mail20Regular />}
            >
              Send Reminder
            </Button>
          </div>
        </div>
      </Card>
    </div>

      <Dialog open={isDialogOpen} onOpenChange={(_, d) => setIsDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Start New Onboarding</DialogTitle>
            <DialogContent style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
              {error && <div style={{ color: "#DC2626", fontSize: "0.85rem", marginBottom: "8px" }}>{error}</div>}
              
              <Field label="Employee" required>
                <select
                  value={newOnboarding.employeeId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const emp = employees.find(x => x.id === id);
                    setNewOnboarding(p => ({ ...p, employeeId: id, employeeName: emp?.name || "" }));
                  }}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #D1D5DB" }}
                >
                  <option value="">Select Employee...</option>
                  {employees.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </Field>

              <Field label="Position" required>
                <Input
                  value={newOnboarding.position}
                  onChange={(_, d) => setNewOnboarding(p => ({ ...p, position: d.value }))}
                  placeholder="e.g. Senior Software Engineer"
                />
              </Field>

              <Field label="Start Date" required>
                <Input
                  type="date"
                  value={newOnboarding.startDate}
                  onChange={(_, d) => setNewOnboarding(p => ({ ...p, startDate: d.value }))}
                />
              </Field>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={onSubmitOnboarding}>Start Process</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
