import { useMemo, useState } from "react";
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

const mockReviews = [
  {
    id: 1,
    employee: "John Doe",
    position: "Senior Frontend Developer",
    reviewDate: "Jan 15, 2025",
    reviewer: "Sarah Manager",
    overallRating: 4.5,
    categories: {
      technical: 5,
      communication: 4,
      teamwork: 4.5,
      productivity: 4.5,
    },
    status: "Completed",
  },
  {
    id: 2,
    employee: "Jane Smith",
    position: "Product Designer",
    reviewDate: "Jan 18, 2025",
    reviewer: "Mike Lead",
    overallRating: 4.8,
    categories: {
      technical: 5,
      communication: 5,
      teamwork: 4.5,
      productivity: 5,
    },
    status: "Completed",
  },
  {
    id: 3,
    employee: "Bob Johnson",
    position: "Backend Engineer",
    reviewDate: "Scheduled: Jan 25",
    reviewer: "Sarah Manager",
    overallRating: 0,
    categories: {
      technical: 0,
      communication: 0,
      teamwork: 0,
      productivity: 0,
    },
    status: "Pending",
  },
];

type ReviewTab = "all" | "completed" | "pending" | "scheduled";

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

  const filteredReviews = useMemo(() => {
    if (activeTab === "completed") {
      return mockReviews.filter((r) => r.status === "Completed");
    }
    if (activeTab === "pending") {
      return mockReviews.filter((r) => r.status === "Pending");
    }
    if (activeTab === "scheduled") {
      return mockReviews.filter((r) =>
        r.reviewDate.toLowerCase().includes("scheduled")
      );
    }
    return mockReviews;
  }, [activeTab]);

  const totalReviews = 124;
  const completed = 106;
  const pending = 18;
  const thisQuarter = 42;
  const avgRating = 4.6;

  return (
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
        >
          Schedule Review
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
                <span className={styles.statValue}>{avgRating}</span>
                <div className={styles.ratingStars}>
                  {Array.from({ length: 5 }).map((_, i) =>
                    i < 4 ? (
                      <Star20Filled key={i} style={{ color: "#F59E0B" }} />
                    ) : (
                      <Star20Regular key={i} style={{ color: "#D1D5DB" }} />
                    )
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
          <Tab value="scheduled">Scheduled (12)</Tab>
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
                        {review.employee
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
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
                            )
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
                    <Button appearance="subtle" size="small">
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
        <div className={styles.detailTitle}>Performance Review: John Doe</div>

        <div className={styles.detailGrid}>
          <div>
            <div className={styles.sectionTitle}>Performance Categories</div>

            {Object.entries(mockReviews[0].categories).map(
              ([category, rating]) => (
                <div key={category} className={styles.categoryBlock}>
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryLabel}>
                      {category.charAt(0).toUpperCase() +
                        category.slice(1)}{" "}
                      Skills
                    </span>
                    <div className={styles.categoryRatingRow}>
                      <span
                        style={{
                          color: "#0118D8",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        {rating}/5
                      </span>
                      <div className={styles.ratingStars}>
                        {Array.from({ length: 5 }).map((_, i) =>
                          i < rating ? (
                            <Star20Filled
                              key={i}
                              style={{ color: "#F59E0B" }}
                            />
                          ) : (
                            <Star20Regular
                              key={i}
                              style={{ color: "#D1D5DB" }}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  <ProgressBar
                    value={rating / 5}
                    className={styles.progress}
                  />
                </div>
              )
            )}

            <div style={{ marginTop: "8px" }}>
              <div className={styles.sectionTitle}>Key Achievements</div>
              <ul className={styles.achievementList}>
                <li className={styles.achievementItem}>
                  <div className={styles.achievementIconCircle}>
                    <ArrowTrending20Regular
                      style={{ color: "#16A34A", fontSize: 14 }}
                    />
                  </div>
                  <span className={styles.achievementText}>
                    Led migration to React 18, improving performance by 40%
                  </span>
                </li>
                <li className={styles.achievementItem}>
                  <div className={styles.achievementIconCircle}>
                    <ArrowTrending20Regular
                      style={{ color: "#16A34A", fontSize: 14 }}
                    />
                  </div>
                  <span className={styles.achievementText}>
                    Mentored 3 junior developers, all promoted within 6 months
                  </span>
                </li>
                <li className={styles.achievementItem}>
                  <div className={styles.achievementIconCircle}>
                    <ArrowTrending20Regular
                      style={{ color: "#16A34A", fontSize: 14 }}
                    />
                  </div>
                  <span className={styles.achievementText}>
                    Delivered 5 major features ahead of schedule
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: "16px" }}>
              <div className={styles.sectionTitle}>Manager Feedback</div>
              <div className={styles.feedbackCard}>
                <div className={styles.feedbackRow}>
                  <div className={styles.feedbackIcon}>
                    <ChatMultiple20Regular
                      style={{ color: "#0118D8", fontSize: 18 }}
                    />
                  </div>
                  <span className={styles.feedbackText}>
                    “John has been an exceptional contributor to the team. His
                    technical expertise and leadership have been instrumental in
                    our recent successes. He consistently goes above and beyond
                    and is a valued mentor to junior team members.”
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div className={styles.sectionTitle}>Areas for Growth</div>
              <Textarea
                appearance="filled-lighter"
                resize="none"
                rows={3}
                defaultValue="Continue developing system design skills through architecture reviews and larger project ownership. Consider pursuing technical leadership role in Q2."
                className={styles.growthTextarea}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div className={styles.sectionTitle}>Goals for Next Period</div>
              <ul className={styles.goalsList}>
                <li className={styles.goalItem}>
                  <div className={styles.goalIconCircle}>
                    <TargetArrow20Regular
                      style={{ color: "#0118D8", fontSize: 14 }}
                    />
                  </div>
                  <span className={styles.goalText}>
                    Lead architecture for new microservices initiative
                  </span>
                </li>
                <li className={styles.goalItem}>
                  <div className={styles.goalIconCircle}>
                    <TargetArrow20Regular
                      style={{ color: "#0118D8", fontSize: 14 }}
                    />
                  </div>
                  <span className={styles.goalText}>
                    Expand mentorship program to 5 developers
                  </span>
                </li>
                <li className={styles.goalItem}>
                  <div className={styles.goalIconCircle}>
                    <TargetArrow20Regular
                      style={{ color: "#0118D8", fontSize: 14 }}
                    />
                  </div>
                  <span className={styles.goalText}>
                    Complete AWS Solutions Architect certification
                  </span>
                </li>
              </ul>
            </div>

            <div className={styles.detailButtonsRow}>
              <Button
                appearance="primary"
                className={styles.primaryDetailButton}
              >
                Save Review
              </Button>
              <Button
                appearance="outline"
                className={styles.secondaryDetailButton}
              >
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
