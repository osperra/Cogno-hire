import type { ElementType } from "react";
import {
  CheckmarkCircle20Regular,
  Clock20Regular,
  DismissCircle20Regular,
  Warning20Regular,
  Info20Regular,
} from "@fluentui/react-icons";
import { makeStyles, shorthands } from "@fluentui/react-components";

export type StatusType =
  | "success"
  | "pending"
  | "danger"
  | "warning"
  | "info"
  | "neutral";

interface StatusPillProps {
  status: StatusType;
  label: string;
  size?: "sm" | "default";
}

type StatusStyleKey =
  | "success"
  | "pending"
  | "danger"
  | "warning"
  | "info"
  | "neutral";

const useStyles = makeStyles({
  base: {
    display: "inline-flex",
    alignItems: "center",
    columnGap: "4px",
    ...shorthands.borderRadius("999px"),
    ...shorthands.border("1px", "solid", "transparent"),
    padding: "2px 8px",
    fontWeight: 500,
  },

  sm: {
    padding: "0 6px",
    fontSize: "10px",
    height: "20px",
  },

  success: {
    backgroundColor: "#E9FCEB",
    color: "#34C759",
    ...shorthands.border("1px", "solid", "#34C759"),
  },

  pending: {
    backgroundColor: "#E8F1FF",
    color: "#3B82F6",
    ...shorthands.border("1px", "solid", "#3B82F6"),
  },

  danger: {
    backgroundColor: "#FEF2F2",
    color: "#B91C1C",
    ...shorthands.border("1px", "solid", "#FECACA"),
  },

  warning: {
    backgroundColor: "#FFF4E5",
    color: "#F59E0B",
    ...shorthands.border("1px", "solid", "#F59E0B"),
  },

  info: {
    backgroundColor: "#EFF6FF",
    color: "#1D4ED8",
    ...shorthands.border("1px", "solid", "#BFDBFE"),
  },

  neutral: {
    backgroundColor: "#F3F4F6",
    color: "#374151",
    ...shorthands.border("1px", "solid", "#D1D5DB"),
  },

  iconSm: {
    width: "12px",
    height: "12px",
  },

  iconMd: {
    width: "14px",
    height: "14px",
  },
});

const statusConfig: Record<
  StatusType,
  { icon: ElementType; styleKey: StatusStyleKey }
> = {
  success: { icon: CheckmarkCircle20Regular, styleKey: "success" },
  pending: { icon: Clock20Regular, styleKey: "pending" },
  danger: { icon: DismissCircle20Regular, styleKey: "danger" },
  warning: { icon: Warning20Regular, styleKey: "warning" },
  info: { icon: Info20Regular, styleKey: "info" },
  neutral: { icon: Info20Regular, styleKey: "neutral" },
};

export function StatusPill({ status, label, size = "default" }: StatusPillProps) {
  const styles = useStyles();
  const { icon: Icon, styleKey } = statusConfig[status];

  return (
    <span
      className={`${styles.base} ${styles[styleKey]} ${
        size === "sm" ? styles.sm : ""
      }`}
    >
      <Icon className={size === "sm" ? styles.iconSm : styles.iconMd} />
      {label}
    </span>
  );
}
