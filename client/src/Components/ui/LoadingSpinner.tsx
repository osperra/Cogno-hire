import { makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
  wrapper: {
    height: "24rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  spinnerContainer: {
    position: "relative",
    width: "64px",
    height: "64px",
  },

  spinnerRing: {
    width: "64px",
    height: "64px",
    border: "4px solid #E9DFC3",
    borderTopColor: "#0118D8",
    borderRadius: "50%",
    animationName: {
      from: { transform: "rotate(0deg)" },
      to: { transform: "rotate(360deg)" },
    },
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
  },

  innerDotWrapper: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  innerDot: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundImage: "linear-gradient(135deg, #0118D8, #1B56FD)",
    animationName: {
      "0%": { transform: "scale(1)" },
      "50%": { transform: "scale(1.25)" },
      "100%": { transform: "scale(1)" },
    },
    animationDuration: "1.2s",
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-in-out",
  },
});

export function LoadingSpinner() {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <div className={styles.spinnerContainer}>
        <div className={styles.spinnerRing} />
        <div className={styles.innerDotWrapper}>
          <div className={styles.innerDot} />
        </div>
      </div>
    </div>
  );
}
