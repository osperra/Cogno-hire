import {
  Card,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";

import {
  Briefcase20Regular,
  PersonAddRegular,
  DocumentText20Regular,
  Clock20Regular,
  CheckmarkCircle20Regular,
  Warning20Regular,
} from "@fluentui/react-icons";

interface ActivityTimelineProps {
  userRole: "employer" | "candidate";
}

const useStyles = makeStyles({
  card: {
    padding: tokens.spacingHorizontalXL,
    borderRadius: "12px",
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: tokens.colorNeutralBackground1,
    height:"450px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalM,
    marginTop: tokens.spacingVerticalM,
  },

  item: {
    display: "flex",
    columnGap: tokens.spacingHorizontalM,
    alignItems: "flex-start",
    padding: "4px 0",
    transition: "background 200ms ease",

    // "group hover" — animate icon when hovering the whole row
    ":hover .iconWrapper": {
      transform: "scale(1.12) rotate(3deg)",
    },
  },

  iconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "transform 250ms ease", // smooth animation
  },

  title: {
    color: "#0B1220",
    fontWeight: 600,
    fontSize: tokens.fontSizeBase200,
    marginBottom: "2px",
  },

  description: {
    color: "#5B6475",
    fontSize: tokens.fontSizeBase200,
  },

  time: {
    color: "#5B6475",
    fontSize: tokens.fontSizeBase200,
    marginTop: "4px",
    display: "block",
  },
});

const employerActivities = [
  {
    icon: Briefcase20Regular,
    bg: "#EFF6FF",
    color: "#1D4ED8",
    title: "New job posted",
    description: "Senior Frontend Developer position created",
    time: "2 hours ago",
  },
  {
    icon: PersonAddRegular,
    bg: "#ECFDF5",
    color: "#059669",
    title: "Candidate shortlisted",
    description: "Sarah Chen moved to shortlist",
    time: "5 hours ago",
  },
  {
    icon: DocumentText20Regular,
    bg: "#EEF2FF",
    color: "#4F46E5",
    title: "28 new applications",
    description: "For Backend Engineer position",
    time: "1 day ago",
  },
  {
    icon: Clock20Regular,
    bg: "#FFF7ED",
    color: "#EA580C",
    title: "Interview reminder",
    description: "Review pending interviews",
    time: "2 days ago",
  },
];

const candidateActivities = [
  {
    icon: CheckmarkCircle20Regular,
    bg: "#ECFDF5",
    color: "#059669",
    title: "Interview completed",
    description: "Full Stack Engineer at TechStart Inc",
    time: "1 hour ago",
  },
  {
    icon: DocumentText20Regular,
    bg: "#EFF6FF",
    color: "#1D4ED8",
    title: "Application submitted",
    description: "Senior Frontend Developer at Acme",
    time: "3 hours ago",
  },
  {
    icon: PersonAddRegular,
    bg: "#F5F3FF",
    color: "#7C3AED",
    title: "Profile updated",
    description: "Added new skills and certifications",
    time: "1 day ago",
  },
  {
    icon: Warning20Regular,
    bg: "#FFF7ED",
    color: "#EA580C",
    title: "Interview pending",
    description: "React Developer at Innovation Labs",
    time: "2 days ago",
  },
];

export function ActivityTimeline({ userRole }: ActivityTimelineProps) {
  const styles = useStyles();
  const activities =
    userRole === "candidate" ? candidateActivities : employerActivities;

  return (
    <Card className={styles.card} appearance="outline">
      <Text as="h3" size={500} weight="semibold" style={{ color: "#0B1220" }}>
        Recent Activity
      </Text>

      <div className={styles.list}>
        {activities.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <div key={index} className={styles.item}>
              <div
                className={`${styles.iconBox} iconWrapper`}
                style={{
                  backgroundColor: activity.bg,
                  color: activity.color,
                }}
              >
                <Icon />
              </div>

              <div>
                <Text className={styles.title}>{activity.title}</Text>
                <Text className={styles.description}>
                  {activity.description}
                </Text>
                <Text className={styles.time}>{activity.time}</Text>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
