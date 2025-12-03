import * as React from "react";
import {
  Card,
  Text,
  makeStyles,
  shorthands,
  mergeClasses,
} from "@fluentui/react-components";

import {
  Search20Regular,
  ArrowUpload20Regular,
  Target20Regular,
  Premium20Regular,
  Add20Regular,
  PersonAdd20Regular,
  DocumentBulletList20Regular,
  ArrowDownload20Regular,
  FlashRegular,
} from "@fluentui/react-icons";

interface QuickActionsProps {
  userRole: "employer" | "candidate";
  onNavigate: (page: string) => void;
}

const useStyles = makeStyles({
  card: {
    borderRadius: "16px",
    border: "1px solid rgba(2,6,23,0.06)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.04)",
    backgroundColor: "#FFFFFF",
    padding: 0,
    height:"80%",
  },

  header: {
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
    borderBottom: "1px solid rgba(2,6,23,0.04)",
  },

  headerText: {
    color: "#0B1220",
  },

  quickActionsBody: {
    padding: "16px 20px 18px 20px",
    display: "flex",
    flexDirection: "column",
    rowGap: "16px",
    backgroundColor: "#FFFFFF",
    ...shorthands.borderRadius("0 0 16px 16px"),

    "@media (max-width: 480px)": {
      padding: "12px 14px 14px 14px",
    },
  },

  quickActionsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    columnGap: "16px",
    rowGap: "16px",

    "@media (max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },

  quickActionTile: {
  backgroundColor: "rgba(252, 241, 241, 1)",
  ...shorthands.borderRadius("16px"),
  ...shorthands.border("1px", "solid", "rgba(248,250,252,1)"),
  minHeight: "100px",
  padding: "16px 18px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  rowGap: "12px",    
  cursor: "pointer",
  transition:
    "background-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease",

  ":hover": {
    backgroundColor: "#E9DFC3",
    boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
    transform: "translateY(-1px)",
  },

  "@media (max-width: 480px)": {
    padding: "12px 12px",
    minHeight: "80px",
  },
},


  quickActionIconCircle: {
    width: "40px",
    height: "40px",
    ...shorthands.borderRadius("30%"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    flexShrink: 0,
    transition: "transform 0.25s ease",

    "@media (max-width: 480px)": {
      width: "34px",
      height: "34px",
    },
  },

  quickActionIconCircleHovered: {
    transform: "scale(1.15)",
  },

  quickActionTextCol: {
    display: "flex",
    flexDirection: "column",
  },

  quickActionTextTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "4px",

    "@media (max-width: 480px)": {
      fontSize: "0.85rem",
    },
  },

  quickActionTextSub: {
    fontSize: "0.8rem",
    color: "#6B7280",

    "@media (max-width: 480px)": {
      fontSize: "0.75rem",
    },
  },

  quickActionIconBlue: {
    backgroundColor: "#2563EB",
  },

  quickActionIconPurple: {
    backgroundColor: "#8B5CF6",
  },

  quickActionIconGreen: {
    backgroundColor: "#16A34A",
  },

  quickActionIconOrange: {
    backgroundColor: "#F97316",
  },
});

type ActionConfig = {
  key: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  bgClass: string;
  onClick: () => void;
};

export function QuickActions({ userRole, onNavigate }: QuickActionsProps) {
  const styles = useStyles();
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);

  const employerActions: ActionConfig[] = [
    {
      key: "post-job",
      icon: <Add20Regular />,
      title: "Post New Job",
      subtitle: "Create a new position",
      bgClass: styles.quickActionIconBlue,
      onClick: () => onNavigate("create-job"),
    },
    {
      key: "invite-candidate",
      icon: <PersonAdd20Regular />,
      title: "Invite Candidate",
      subtitle: "Direct invitation",
      bgClass: styles.quickActionIconPurple,
      onClick: () => onNavigate("applicants"),
    },
    {
      key: "view-analytics",
      icon: <DocumentBulletList20Regular />,
      title: "View Analytics",
      subtitle: "Performance insights",
      bgClass: styles.quickActionIconGreen,
      onClick: () => onNavigate("Interview Analytics"),
    },
    {
      key: "export-reports",
      icon: <ArrowDownload20Regular />,
      title: "Export Reports",
      subtitle: "Download data",
      bgClass: styles.quickActionIconOrange,
      onClick: () => undefined,
    },
  ];

  const candidateActions: ActionConfig[] = [
    {
      key: "find-jobs",
      icon: <Search20Regular />,
      title: "Find Jobs",
      subtitle: "Browse positions",
      bgClass: styles.quickActionIconBlue,
      onClick: () => onNavigate("jobs"),
    },
    {
      key: "update-resume",
      icon: <ArrowUpload20Regular />,
      title: "Update Resume",
      subtitle: "Upload latest CV",
      bgClass: styles.quickActionIconPurple,
      onClick: () => undefined,
    },
    {
      key: "career-goals",
      icon: <Target20Regular />,
      title: "Career Goals",
      subtitle: "Set preferences",
      bgClass: styles.quickActionIconGreen,
      onClick: () => undefined,
    },
    {
      key: "skill-tests",
      icon: <Premium20Regular />,
      title: "Skill Tests",
      subtitle: "Take assessments",
      bgClass: styles.quickActionIconOrange,
      onClick: () => undefined,
    },
  ];

  const actions = userRole === "employer" ? employerActions : candidateActions;

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <FlashRegular style={{ color: "#0118D8", fontSize: 18 }} />
        <Text weight="semibold" size={400} className={styles.headerText}>
          Quick Actions
        </Text>
      </div>

      <div className={styles.quickActionsBody}>
        <div className={styles.quickActionsRow}>
          {actions.map((action) => (
            <div
              key={action.key}
              className={styles.quickActionTile}
              onClick={action.onClick}
              onMouseEnter={() => setHoveredKey(action.key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              <div
                className={mergeClasses(
                  styles.quickActionIconCircle,
                  action.bgClass,
                  hoveredKey === action.key &&
                    styles.quickActionIconCircleHovered
                )}
              >
                {action.icon}
              </div>

              <div className={styles.quickActionTextCol}>
                <span className={styles.quickActionTextTitle}>
                  {action.title}
                </span>
                <span className={styles.quickActionTextSub}>
                  {action.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
