import {
  Button,
  Card,
  Badge,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import {
  ArrowLeft20Regular,
  CheckmarkCircle20Regular,
  Warning20Regular,
  ArrowTrending20Regular,
  ArrowTrendingDownRegular,
} from "@fluentui/react-icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../layout/AppLayout";

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
    maxWidth: "1200px",
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "16px",
  },
  headerTitleBlock: {
    flex: 1,
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
    fontSize: "0.9rem",
    color: "#5B6475",
  },
  card: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    padding: "24px",
    backgroundColor: "#FFFFFF",
  },
  scoreRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
  },
  scoreValue: {
    fontSize: "3rem",
    fontWeight: 700,
    color: "#0118D8",
  },
  scoreLabel: {
    fontSize: "1rem",
    color: "#5B6475",
    fontWeight: 500,
  },
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "16px",
  },
  chartWrapper: {
    width: "100%",
    height: "300px",
  },
  bulletList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    rowGap: "12px",
  },
  bulletItem: {
    display: "flex",
    columnGap: "12px",
    alignItems: "flex-start",
  },
  bulletIcon: {
    marginTop: "2px",
    flexShrink: 0,
  },
  bulletTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "4px",
  },
  bulletText: {
    fontSize: "0.9rem",
    color: "#4B5563",
    lineHeight: "1.4",
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "24px",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
});

type AnalysisData = {
  overallScore: number;
  feedback: string;
  skills: { skill: string; score: number }[];
  strengths: { title: string; description: string }[];
  improvements: { title: string; description: string }[];
};

export function CandidateInterviewResults() {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const analysis = location.state as AnalysisData | undefined;

  if (!analysis) {
    return (
      <div className={styles.root}>
        <Card className={styles.card}>
          <div style={{ textAlign: "center", padding: 32 }}>
            <h2>No results found</h2>
            <Button onClick={() => navigate(ROUTES.candidateHome)}>Go Home</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <Button
          appearance="subtle"
          icon={<ArrowLeft20Regular />}
          onClick={() => navigate(ROUTES.candidateHome)}
        />
        <div className={styles.headerTitleBlock}>
          <div className={styles.headerTitle}>Interview Results</div>
          <div className={styles.headerSubtitle}>Here is how you performed</div>
        </div>
      </div>

      <Card className={styles.card}>
        <div className={styles.scoreRow}>
          <div>
            <div className={styles.scoreLabel}>Overall Score</div>
            <div className={styles.scoreValue}>{analysis.overallScore}%</div>
          </div>
          <div style={{ maxWidth: 600 }}>
            <div className={styles.sectionTitle}>Feedback</div>
            <p className={styles.bulletText}>{analysis.feedback}</p>
          </div>
        </div>
      </Card>

      <div className={styles.gridTwo}>
        <Card className={styles.card}>
          <div className={styles.sectionTitle}>Skills Analysis</div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analysis.skills}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="skill" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#0118D8" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card className={styles.card} style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
              <ArrowTrending20Regular style={{ color: "#16A34A" }} />
              <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                Key Strengths
              </div>
            </div>
            <ul className={styles.bulletList}>
              {analysis.strengths.map((s, i) => (
                <li key={i} className={styles.bulletItem}>
                  <CheckmarkCircle20Regular className={styles.bulletIcon} style={{ color: "#16A34A" }} />
                  <div>
                    <div className={styles.bulletTitle}>{s.title}</div>
                    <div className={styles.bulletText}>{s.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className={styles.card} style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
              <ArrowTrendingDownRegular style={{ color: "#EA580C" }} />
              <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                Areas for Improvement
              </div>
            </div>
            <ul className={styles.bulletList}>
              {analysis.improvements.map((s, i) => (
                <li key={i} className={styles.bulletItem}>
                  <Warning20Regular className={styles.bulletIcon} style={{ color: "#EA580C" }} />
                  <div>
                    <div className={styles.bulletTitle}>{s.title}</div>
                    <div className={styles.bulletText}>{s.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
