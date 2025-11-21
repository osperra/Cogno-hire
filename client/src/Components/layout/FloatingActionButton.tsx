import { useState } from "react";
import { makeStyles } from "@fluentui/react-components";
import {
  Add24Regular,
  Mail24Regular,
  QuestionCircle24Regular,
  Dismiss24Regular,
} from "@fluentui/react-icons";

interface FloatingActionButtonProps {
  userRole: "employer" | "candidate";
  onAction?: (action: string) => void;
}

const useStyles = makeStyles({
  root: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    zIndex: 2000,
  },

  actionsWrapper: {
    position: "absolute",
    bottom: "72px",
    right: 0,
    display: "flex",
    flexDirection: "column",
    rowGap: "12px",
    transition: "opacity 0.2s ease, transform 0.2s ease",
  },

  actionsHidden: {
    opacity: 0,
    pointerEvents: "none",
    transform: "translateY(8px)",
  },

  actionsVisible: {
    opacity: 1,
    pointerEvents: "auto",
    transform: "translateY(0)",
  },

  actionButton: {
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    color: "#ffffff",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease",
    backgroundColor: "#2563EB",

    ":hover": {
      transform: "scale(1.05)",
      boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
      filter: "brightness(1.05)",
    },
  },

  blue: {
    backgroundColor: "#2563EB",
  },
  green: {
    backgroundColor: "#16A34A",
  },
  purple: {
    backgroundColor: "#7C3AED",
  },

  fabButton: {
    width: "56px",
    height: "56px",
    borderRadius: "999px",
    border: "none",
    outline: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    cursor: "pointer",
    color: "#ffffff",
    transition: "all 0.25s ease",
  },

  fabClosed: {
    backgroundImage: "linear-gradient(to bottom right,#0118D8,#1B56FD)",

    ":hover": {
      transform: "scale(1.08)",
    },
  },

  fabOpen: {
    backgroundColor: "#DC2626",
    transform: "rotate(45deg)",

    ":hover": {
      backgroundColor: "#B91C1C",
    },
  },
});

export function FloatingActionButton({
  userRole,
  onAction,
}: FloatingActionButtonProps) {
  const styles = useStyles();
  const [isOpen, setIsOpen] = useState(false);

  const employerActions = [
    {
      icon: Add24Regular,
      label: "Post Job",
      action: "create-job",
      colorClass: styles.blue,
    },
    {
      icon: Mail24Regular,
      label: "Support",
      action: "support",
      colorClass: styles.green,
    },
    {
      icon: QuestionCircle24Regular,
      label: "Help",
      action: "help",
      colorClass: styles.purple,
    },
  ];

  const candidateActions = [
    {
      icon: Add24Regular,
      label: "Apply",
      action: "apply",
      colorClass: styles.blue,
    },
    {
      icon: Mail24Regular,
      label: "Support",
      action: "support",
      colorClass: styles.green,
    },
    {
      icon: QuestionCircle24Regular,
      label: "Help",
      action: "help",
      colorClass: styles.purple,
    },
  ];

  const actions = userRole === "employer" ? employerActions : candidateActions;

  return (
    <div className={styles.root}>
      <div
        className={`${styles.actionsWrapper} ${
          isOpen ? styles.actionsVisible : styles.actionsHidden
        }`}
      >
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.action}
              className={`${styles.actionButton} ${item.colorClass}`}
              onClick={() => {
                onAction?.(item.action);
                setIsOpen(false);
              }}
            >
              <Icon />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <button
        className={`${styles.fabButton} ${
          isOpen ? styles.fabOpen : styles.fabClosed
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <Dismiss24Regular /> : <Add24Regular />}
      </button>
    </div>
  );
}
