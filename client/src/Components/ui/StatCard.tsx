import * as React from "react";
import {
  Card,
  Text,
  makeStyles,
} from "@fluentui/react-components";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "primary" | "success" | "warning" | "danger";
}

const useStyles = makeStyles({
  card: {
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    boxShadow:
      "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    transition: "box-shadow 200ms ease",
    ":hover": {
      boxShadow:
        "0 1px 0 rgba(2,6,23,0.08), 0 8px 24px rgba(2,6,23,0.08)",
    },
  },

  row: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  iconWrapper: {
    padding: "12px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  primary: {
    backgroundColor: "#EFF6FF",
    color: "#0118D8",
  },
  success: {
    backgroundColor: "#ECFDF5",
    color: "#16A34A",
  },
  warning: {
    backgroundColor: "#FEF3C7",
    color: "#F59E0B",
  },
  danger: {
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
  },

  title: {
    color: "#5B6475",
    marginBottom: "4px",
  },

  value: {
    color: "#0B1220",
    marginBottom: "4px",
    fontSize: "2rem",
    fontWeight: 600,
    lineHeight: "2.5rem",
  },

  trendPositive: {
    color: "#16A34A",
    fontSize: "0.75rem",
  },
  trendNegative: {
    color: "#DC2626",
    fontSize: "0.75rem",
  },
});

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
}) => {
  const styles = useStyles();

  return (
    <Card className={styles.card} appearance="outline">
      <div className={styles.row}>
        <div style={{ flex: 1 }}>
          <Text as="p" size={300} className={styles.title}>
            {title}
          </Text>

          <Text as="p" className={styles.value}>
            {value}
          </Text>

          {trend && (
            <Text
              as="p"
              className={
                trend.isPositive
                  ? styles.trendPositive
                  : styles.trendNegative
              }
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </Text>
          )}
        </div>

        <div className={`${styles.iconWrapper} ${styles[color]}`}>
          <Icon style={{ fontSize: 24 }} />
        </div>
      </div>
    </Card>
  );
};
