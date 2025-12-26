import React, { useMemo } from "react";
import { Card, Text, makeStyles, tokens } from "@fluentui/react-components";

import {
  Briefcase20Regular,
  PersonAddRegular,
  DocumentText20Regular,
  Clock20Regular,
  CheckmarkCircle20Regular,
  Warning20Regular,
} from "@fluentui/react-icons";

export type IconComponent = React.ComponentType<Record<string, never>>;

export type ActivityItem = {
  icon: IconComponent;
  bg: string;
  color: string;
  title: string;
  description: string;
  time: string;
  __placeholder?: true; // internal (for stable layout)
};

interface ActivityTimelineProps {
  userRole: "employer" | "candidate";

  /** ✅ pass dynamic activity items from Dashboard */
  activities?: ActivityItem[];
}

const useStyles = makeStyles({
  card: {
    padding: "20px 24px",
    borderRadius: "16px",
    boxShadow: "0 18px 45px rgba(15,23,42,0.06)",
    border: "1px solid rgba(226,232,240,0.9)",
    backgroundColor: "#FFFFFF",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    rowGap: "18px",
    marginTop: "18px",
  },

  item: {
    display: "flex",
    columnGap: "14px",
    padding: "6px 4px",
    borderRadius: "12px",
    transition: "background 200ms ease",

    ":hover": {
      backgroundColor: "rgba(248,250,252,0.9)",
    },
    ":hover .iconWrapper": {
      transform: "scale(1.12) ",
    },
  },

  iconBox: {
    width: "44px",
    height: "44px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 6px 14px rgba(15,23,42,0.12)",
    transition: "transform 250ms ease",
  },

  textBlock: {
    display: "flex",
    flexDirection: "column",
    rowGap: "2px",
  },

  title: {
    color: "#0B1220",
    fontWeight: 600,
    fontSize: tokens.fontSizeBase300,
  },

  description: {
    color: "#6B7280",
    fontSize: tokens.fontSizeBase200,
  },

  time: {
    color: "#9CA3AF",
    fontSize: tokens.fontSizeBase100,
    marginTop: "2px",
  },
});

const employerActivitiesDemo: ActivityItem[] = [
  {
    icon: Briefcase20Regular as unknown as IconComponent,
    bg: "#EFF6FF",
    color: "#1D4ED8",
    title: "New job posted",
    description: "Senior Frontend Developer position created",
    time: "2 hours ago",
  },
  {
    icon: PersonAddRegular as unknown as IconComponent,
    bg: "#ECFDF5",
    color: "#059669",
    title: "Candidate shortlisted",
    description: "Sarah Chen moved to shortlist",
    time: "5 hours ago",
  },
  {
    icon: DocumentText20Regular as unknown as IconComponent,
    bg: "#EEF2FF",
    color: "#4F46E5",
    title: "28 new applications",
    description: "For Backend Engineer position",
    time: "1 day ago",
  },
  {
    icon: Clock20Regular as unknown as IconComponent,
    bg: "#FFF7ED",
    color: "#EA580C",
    title: "Interview reminder",
    description: "Review pending interviews",
    time: "2 days ago",
  },
];

const candidateActivitiesDemo: ActivityItem[] = [
  {
    icon: CheckmarkCircle20Regular as unknown as IconComponent,
    bg: "#ECFDF5",
    color: "#059669",
    title: "Interview completed",
    description: "Full Stack Engineer at TechStart Inc",
    time: "1 hour ago",
  },
  {
    icon: DocumentText20Regular as unknown as IconComponent,
    bg: "#EFF6FF",
    color: "#1D4ED8",
    title: "Application submitted",
    description: "Senior Frontend Developer at Acme",
    time: "3 hours ago",
  },
  {
    icon: PersonAddRegular as unknown as IconComponent,
    bg: "#F5F3FF",
    color: "#7C3AED",
    title: "Profile updated",
    description: "Added new skills and certifications",
    time: "1 day ago",
  },
  {
    icon: Warning20Regular as unknown as IconComponent,
    bg: "#FFF7ED",
    color: "#EA580C",
    title: "Interview pending",
    description: "React Developer at Innovation Labs",
    time: "2 days ago",
  },
];

function makePlaceholder(): ActivityItem {
  return {
    icon: Clock20Regular as unknown as IconComponent,
    bg: "transparent",
    color: "transparent",
    title: "",
    description: "",
    time: "",
    __placeholder: true,
  };
}

export function ActivityTimeline({ userRole, activities }: ActivityTimelineProps) {
  const styles = useStyles();

  const fallback = userRole === "candidate" ? candidateActivitiesDemo : employerActivitiesDemo;
  const baseList = activities && activities.length > 0 ? activities : fallback;

  // ✅ Keep UI stable: always 4 rows, missing become invisible placeholders
  const stableActivities = useMemo(() => {
    const targetCount = 4;
    const list = [...baseList];
    while (list.length < targetCount) list.push(makePlaceholder());
    return list.slice(0, targetCount);
  }, [baseList]);

  return (
    <Card className={styles.card} appearance="outline">
      <Text
        as="h3"
        size={500}
        weight="semibold"
        style={{ color: "#0B1220", marginBottom: 4 }}
      >
        Recent Activity
      </Text>

      <div className={styles.list}>
        {stableActivities.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <div
              key={index}
              className={styles.item}
              style={activity.__placeholder ? { visibility: "hidden" } : undefined}
            >
              <div
                className={`${styles.iconBox} iconWrapper`}
                style={{
                  backgroundColor: activity.bg,
                  color: activity.color,
                }}
              >
                <Icon />
              </div>

              <div className={styles.textBlock}>
                <Text className={styles.title}>{activity.title}</Text>
                <Text className={styles.description}>{activity.description}</Text>
                <Text className={styles.time}>{activity.time}</Text>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
