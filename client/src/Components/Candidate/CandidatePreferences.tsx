import { Card, makeStyles, shorthands } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: { maxWidth: "1100px", margin: "0 auto", padding: "16px" },
  card: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    padding: "16px",
    backgroundColor: "#fff",
  },
  title: { fontSize: "18px", fontWeight: 700, color: "#0B1220" },
  sub: { fontSize: "13px", color: "#5B6475", marginTop: "4px" },
});

export default function CandidatePreferences() {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Card className={styles.card}>
        <div className={styles.title}>Preferences</div>
        <div className={styles.sub}>Candidate preferences page (add settings here).</div>
      </Card>
    </div>
  );
}
