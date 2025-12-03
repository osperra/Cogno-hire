import { Card, makeStyles} from "@fluentui/react-components";

const useSkeletonStyles = makeStyles({
  skeleton: {
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: "4px",
    position: "relative",
    overflow: "hidden",

    "::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
      animationName: {
        from: { transform: "translateX(-100%)" },
        to: { transform: "translateX(100%)" },
      },
      animationDuration: "1.2s",
      animationIterationCount: "infinite",
    },
  },

  // Sizes
  roundedLg: { borderRadius: "12px" },
  roundedFull: { borderRadius: "50%" },

  card: {
    padding: "24px",
    border: "1px solid rgba(2,6,23,0.08)",
    borderRadius: "12px",
  },

  flex: {
    display: "flex",
    alignItems: "center",
    columnGap: "16px",
  },

  flexStart: {
    display: "flex",
    alignItems: "flex-start",
    columnGap: "16px",
  },

  col: {
    display: "flex",
    flexDirection: "column",
    rowGap: "12px",
    flex: 1,
  },

  tableRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "16px",
  },
});

const SkeletonBlock = ({
  width,
  height,
  rounded,
}: {
  width: string | number;
  height: string | number;
  rounded?: "lg" | "full";
}) => {
  const styles = useSkeletonStyles();

  return (
    <div
      className={`${styles.skeleton} ${
        rounded === "lg"
          ? styles.roundedLg
          : rounded === "full"
          ? styles.roundedFull
          : ""
      }`}
      style={{ width, height }}
    />
  );
};

export function SkeletonCard() {
  const styles = useSkeletonStyles();

  return (
    <Card className={styles.card}>
      <div className={styles.flexStart}>
        <SkeletonBlock width="56px" height="56px" rounded="lg" />

        <div className={styles.col}>
          <SkeletonBlock width="75%" height="24px" />
          <SkeletonBlock width="50%" height="16px" />

          <div className={styles.flex}>
            <SkeletonBlock width="64px" height="24px" />
            <SkeletonBlock width="80px" height="24px" />
            <SkeletonBlock width="96px" height="24px" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function SkeletonTable() {
  const styles = useSkeletonStyles();

  return (
    <Card className={styles.card}>
      <div style={{ display: "flex", flexDirection: "column", rowGap: "16px" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.tableRow}>
            <SkeletonBlock width="40px" height="40px" rounded="full" />

            <div className={styles.col} style={{ rowGap: "8px" }}>
              <SkeletonBlock width="100%" height="16px" />
              <SkeletonBlock width="66%" height="12px" />
            </div>

            <SkeletonBlock width="80px" height="32px" />
          </div>
        ))}
      </div>
    </Card>
  );
}
