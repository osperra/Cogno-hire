import * as React from "react";
import {
  Card,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";

import {
  Sparkle20Regular,
  ArrowTrending20Regular,
  Target20Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "1fr",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
  },
  card: {
    position: "relative",
    padding: "24px",
    overflow: "hidden",
    borderRadius: "20px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: tokens.colorNeutralBackground1,
    transition: "box-shadow 300ms, transform 300ms",
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    ":hover": {
      boxShadow: "0 1px 0 rgba(2,6,23,0.08), 0 12px 32px rgba(2,6,23,0.12)",
      transform: "translateY(-2px)",
    },
  },
  gradientBlob: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "140px",
    height: "140px",
    borderRadius: "999px",
    opacity: 0.12,
    filter: "blur(60px)",
    transition: "transform 500ms",
  },
  iconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
    color: "#FFFFFF",
    transition: "transform 300ms ease",
  },
  title: {
    color: "#0B1220",
    marginBottom: "4px",
    fontWeight: 600,
  },
  description: {
    color: "#5B6475",
    display:"flex",
    flexDirection:"column",
    fontSize: tokens.fontSizeBase200,
  },
});

export const FeatureHighlight: React.FC = () => {
  const styles = useStyles();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const features = [
    {
      icon: <Sparkle20Regular />,
      title: "98% Interview Quality",
      description: "AI-powered interviews with human-like conversations",
      gradient: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
    },
    {
      icon: <ArrowTrending20Regular />,
      title: "75% Time Saved",
      description: "Automated screening and evaluation process",
      gradient: "linear-gradient(135deg, #22C55E, #059669)",
    },
    {
      icon: <Target20Regular />,
      title: "60% Cost Reduction",
      description: "Reduce hiring costs significantly",
      gradient: "linear-gradient(135deg, #F97316, #DC2626)",
    },
  ];

  return (
    <div className={styles.grid}>
      {features.map((f, i) => (
        <Card
          key={i}
          appearance="outline"
          className={styles.card}
          style={{
            animation: "fadeIn 0.6s ease",
            animationDelay: `${i * 100}ms`,
          }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div
            className={styles.gradientBlob}
            style={{
              background: f.gradient,
            }}
          />

          <div>
            <div
              className={styles.iconWrapper}
              style={{
                background: f.gradient,
                transform:
                  hoveredIndex === i ? "scale(1.08) rotate(6deg)" : "none",
              }}
            >
              {f.icon}
            </div>

            <Text as="h4" className={styles.title} size={400}>
              {f.title}
            </Text>

            <Text as="p" className={styles.description}>
              {f.description}
            </Text>
          </div>
        </Card>
      ))}
    </div>
  );
};
