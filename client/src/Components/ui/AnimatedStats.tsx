import * as React from "react";
import { useEffect, useState } from "react";
import { Card, Text, makeStyles, tokens } from "@fluentui/react-components";

type StatColor = "primary" | "success" | "warning" | "danger";

interface AnimatedStatsProps {
  title: string;
  value: number;
  icon: React.ElementType;
  suffix?: string;
  prefix?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: StatColor;
}

const useStyles = makeStyles({
  card: {
    padding: tokens.spacingHorizontalXL,
    borderRadius: "15px",
    border: "1px solid rgba(2,6,23,0.08)",
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    backgroundColor: tokens.colorNeutralBackground1,
    transitionProperty: "box-shadow, transform",
    transitionDuration: "300ms",
    ":hover": {
      boxShadow: "0 1px 0 rgba(2,6,23,0.08), 0 12px 32px rgba(2,6,23,0.12)",
      transform: "translateY(-1px)",
    },
    ":hover .statIconWrapper": {
      transform: "scale(1.08) rotate(3deg)",
    },
  },

  contentRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: tokens.spacingHorizontalM,
  },

  leftCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  title: {
    color: "#5B6475",
  },

  value: {
    color: "#0B1220",
    fontSize: "2rem",
    lineHeight: "2.5rem",
    fontWeight: 600,
    transition: "color 300ms ease",
  },

  trend: {
    display: "flex",
    alignItems: "center",
    columnGap: "4px",
    fontSize: "0.75rem",
  },

  iconWrapper: {
    padding: tokens.spacingHorizontalM,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transitionProperty: "transform",
    transitionDuration: "300ms",
  },
});

const colorMap: Record<StatColor, { bg: string; fg: string }> = {
  primary: { bg: "#EFF6FF", fg: "#0118D8" },
  success: { bg: "#ECFDF5", fg: "#16A34A" },
  warning: { bg: "#FFFBEB", fg: "#D97706" },
  danger: { bg: "#FEF2F2", fg: "#B91C1C" },
};

export const AnimatedStats: React.FC<AnimatedStatsProps> = ({
  title,
  value,
  icon: Icon,
  suffix = "",
  prefix = "",
  trend,
  color = "primary",
}) => {
  const styles = useStyles();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const colors = colorMap[color];

  return (
    <Card className={styles.card} appearance="outline">
      <div className={styles.contentRow}>
        <div className={styles.leftCol}>
          <Text size={300} className={styles.title}>
            {title}
          </Text>

          <Text className={styles.value}>
            {prefix}
            {displayValue.toLocaleString()}
            {suffix}
          </Text>

          {trend && (
            <Text
              className={styles.trend}
              style={{ color: trend.isPositive ? "#16A34A" : "#DC2626" }}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{trend.value}</span>
            </Text>
          )}
        </div>

        <div
          className={`${styles.iconWrapper} statIconWrapper`}
          style={{ backgroundColor: colors.bg, color: colors.fg }}
        >
          <Icon />
        </div>
      </div>
    </Card>
  );
};
