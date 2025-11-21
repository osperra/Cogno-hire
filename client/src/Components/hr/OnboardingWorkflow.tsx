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
  //   Text,
  makeStyles,
  shorthands,
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

import { StatusPill } from "../layout/StatusPill";

const mockOnboarding = [
  {
    id: 1,
    employee: "Alice Johnson",
    position: "Senior Frontend Developer",
    startDate: "Feb 1, 2025",
    progress: 85,
    status: "In Progress",
    daysRemaining: 3,
  },
  {
    id: 2,
    employee: "Bob Martinez",
    position: "Product Designer",
    startDate: "Feb 5, 2025",
    progress: 45,
    status: "In Progress",
    daysRemaining: 7,
  },
  {
    id: 3,
    employee: "Carol White",
    position: "Backend Engineer",
    startDate: "Jan 15, 2025",
    progress: 100,
    status: "Completed",
    daysRemaining: 0,
  },
];

const onboardingSteps = [
  {
    category: "Pre-Onboarding",
    icon: Mail20Regular,
    tasks: [
      { id: 1, name: "Send welcome email", completed: true },
      { id: 2, name: "Collect required documents", completed: true },
      { id: 3, name: "Background check completed", completed: true },
      { id: 4, name: "Sign offer letter", completed: true },
    ],
  },
  {
    category: "Day 1 - Setup",
    icon: Laptop20Regular,
    tasks: [
      { id: 5, name: "Workspace setup", completed: true },
      { id: 6, name: "IT equipment provisioning", completed: true },
      { id: 7, name: "Email and account creation", completed: true },
      { id: 8, name: "Security badge issuance", completed: false },
    ],
  },
  {
    category: "Week 1 - Orientation",
    icon: BookOpenFilled,

    tasks: [
      { id: 9, name: "Company orientation", completed: true },
      { id: 10, name: "Team introductions", completed: true },
      { id: 11, name: "HR policies review", completed: false },
      { id: 12, name: "Benefits enrollment", completed: false },
    ],
  },
  {
    category: "Week 2-4 - Integration",
    icon: PeopleTeam20Regular,
    tasks: [
      { id: 13, name: "Department training", completed: false },
      { id: 14, name: "Shadow team members", completed: false },
      { id: 15, name: "First project assignment", completed: false },
      { id: 16, name: "30-day check-in meeting", completed: false },
    ],
  },
];

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    rowGap: "16px",
  },

  // ------- header -------
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

  // ------- stats cards -------
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

  // ------- section cards -------
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

  // ------- table -------
  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "880px", // scroll on smaller screens
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

  // ------- workflow section -------
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

  // hover styling for "Send Reminder"
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

  const activeOnboardingCount = 12;
  const completedCount = 48;
  const avgCompletion = "18 days";
  const successRate = "96%";

  return (
    <div className={styles.root}>
      {/* Header */}
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
        >
          Start Onboarding
        </Button>
      </div>

      {/* Stats */}
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

      {/* Active Onboarding Table */}
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
                      <Button appearance="subtle" size="small">
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

      {/* Detailed Workflow */}
      <Card className={styles.sectionCard}>
        <div className={styles.workflowCardInner}>
          <div className={styles.workflowTitle}>
            Onboarding Workflow: Alice Johnson
          </div>

          <div>
            {onboardingSteps.map((step, index) => {
              const Icon = step.icon;
              const completedTasks = step.tasks.filter(
                (t) => t.completed
              ).length;
              const totalTasks = step.tasks.length;
              const progressPercentage = (completedTasks / totalTasks) * 100;

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
                        <Checkbox defaultChecked={task.completed} />
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
  );
}
