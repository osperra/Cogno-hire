import * as React from "react";
import {
  Badge,
  Button,
  Card,
  Tab,
  TabList,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";

import {
  Alert20Regular,
  DocumentText20Regular,
  Mail20Regular,
  PersonAdd20Regular,
  CheckmarkCircle20Regular,
  Clock20Regular,
  Dismiss20Regular,
} from "@fluentui/react-icons";

type NotificationType =
  | "Application"
  | "Interview"
  | "Invitation"
  | "Profile"
  | "Welcome";

interface NotificationItem {
  id: number;
  type: NotificationType;
  icon: React.ElementType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
}

const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    type: "Application",
    icon: DocumentText20Regular,
    title: "Application Submitted",
    message:
      "Your application for Senior Frontend Developer at Acme Corporation has been received.",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "Interview",
    icon: Alert20Regular,
    title: "Interview Reminder",
    message:
      "You have a pending AI interview for Full Stack Engineer at TechStart Inc.",
    timestamp: "5 hours ago",
    read: false,
    actionLabel: "Start Interview",
  },
  {
    id: 3,
    type: "Invitation",
    icon: Mail20Regular,
    title: "Direct Invitation",
    message:
      "Innovation Labs has invited you to apply for their React Developer position.",
    timestamp: "1 day ago",
    read: false,
    actionLabel: "View Job",
  },
  {
    id: 4,
    type: "Application",
    icon: CheckmarkCircle20Regular,
    title: "Application Status Updated",
    message:
      "Your application for Frontend Developer has been moved to 'Under Review' stage.",
    timestamp: "2 days ago",
    read: true,
  },
  {
    id: 5,
    type: "Interview",
    icon: CheckmarkCircle20Regular,
    title: "Interview Completed",
    message:
      "You've completed the interview for React Native Developer at CloudTech. View your results.",
    timestamp: "3 days ago",
    read: true,
    actionLabel: "View Results",
  },
  {
    id: 6,
    type: "Profile",
    icon: PersonAdd20Regular,
    title: "Complete Your Profile",
    message: "Add your work experience to improve your job matches by 40%.",
    timestamp: "3 days ago",
    read: true,
    actionLabel: "Update Profile",
  },
  {
    id: 7,
    type: "Application",
    icon: CheckmarkCircle20Regular,
    title: "Application Shortlisted",
    message:
      "Great news! You've been shortlisted for Lead Frontend Engineer at StartupHub.",
    timestamp: "1 week ago",
    read: true,
  },
  {
    id: 8,
    type: "Welcome",
    icon: Alert20Regular,
    title: "Welcome to Cogno!",
    message:
      "Start your journey by completing your profile and browsing available positions.",
    timestamp: "2 weeks ago",
    read: true,
    actionLabel: "Get Started",
  },
];

type TabValue = "all" | "unread" | "applications" | "interviews";

const useStyles = makeStyles({
root: {
    display: "flex",
    flexDirection: "column",
    rowGap: "24px",
    minHeight: "100vh",
    boxSizing: "border-box",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "16px",
    paddingBottom: "24px",
    maxWidth: "2000px",
    margin: "0 auto",

    "@media (max-width: 768px)": {
      paddingLeft: "12px",
      paddingRight: "12px",
      paddingTop: "12px",
      paddingBottom: "16px",
      rowGap: "16px",
    },
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalM,
  },

  headerTitle: {
    marginBottom: tokens.spacingVerticalXXS,
  },

  headerSubtitle: {
    color: "#5B6475",
    display: "block", 
    marginTop: "4px" 
  },

  headerActions: {
    display: "flex",
    columnGap: tokens.spacingHorizontalS,
  },
  Buttons: {
    ":hover": {
      backgroundColor: "#E9DFC3",
    },
  },
  tabsList: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: "999px",
    padding: "6px 12px",
    border: "1px solid rgba(2,6,23,0.08)",
    display: "inline-flex",
  },

  tabItem: {
    padding: "6px 14px",
    borderRadius: "999px",
    backgroundColor: "transparent",
    fontWeight: 500,
    color: "#0B1220",
    cursor: "pointer",
    border: "none",
    ":hover": {
      backgroundColor: "rgba(2,6,23,0.04)",
    },
  },

  tabItemSelected: {
    backgroundColor: "white",
    borderRadius: "999px",
    boxShadow: "0 0 0 2px #E5E7EB inset",
    fontWeight: 600,
    color: "#0B1220",
  },

  tabPanels: {
    marginTop: tokens.spacingVerticalL,
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalS,
  },

  notificationCardBase: {
    padding: tokens.spacingHorizontalL,
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: tokens.colorNeutralBackground1,
    transition:
      "box-shadow 150ms ease, border-color 150ms ease, background-color 150ms ease",
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    ":hover": {
      boxShadow: "0 1px 0 rgba(2,6,23,0.08), 0 8px 24px rgba(2,6,23,0.12)",
    },
  },

  notificationCardUnread: {
    backgroundColor: "rgba(37, 99, 235, 0.06)",
  },

  notificationRow: {
    display: "flex",
    alignItems: "flex-start",
    columnGap: tokens.spacingHorizontalM,
  },

  iconContainerBase: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  iconApplication: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
  },

  iconInterview: {
    backgroundColor: "#f5f3ff",
    color: "#7c3aed",
  },

  iconInvitation: {
    backgroundColor: "#ecfdf3",
    color: "#15803d",
  },

  iconProfile: {
    backgroundColor: "#fff7ed",
    color: "#ea580c",
  },

  iconWelcome: {
    backgroundColor: "#fdf2f8",
    color: "#db2777",
  },

  contentColumn: {
    flex: 1,
    minWidth: 0,
  },

  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    columnGap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalXXS,
  },

  titleWithDot: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalXS,
    flexWrap: "wrap",
  },

  unreadDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    backgroundColor: "#0118D8",
  },

  titleText: {
    color: "#0B1220",
  },

  messageText: {
    color: "#5B6475",
    marginBottom: tokens.spacingVerticalXS,
  },

  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: tokens.spacingVerticalXXS,
  },

  timestamp: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalXS,
    color: "#5B6475",
    fontSize: tokens.fontSizeBase200,
  },

  closeButton: {
    minWidth: 0,
    width: "32px",
    height: "32px",
  },

  emptyCard: {
    padding: tokens.spacingHorizontalXXL,
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    textAlign: "center",
    backgroundColor: tokens.colorNeutralBackground1,
    marginTop: tokens.spacingVerticalL,
  },

  emptyIconWrapper: {
    width: "64px",
    height: "64px",
    borderRadius: "999px",
    margin: "0 auto",
    marginBottom: tokens.spacingVerticalM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9DFC3",
  },

  emptyMuted: {
    color: "#5B6475",
    maxWidth: "420px",
    marginInline: "auto",
    marginTop: tokens.spacingVerticalXS,
  },
});

function getIconClass(
  styles: ReturnType<typeof useStyles>,
  type: NotificationType
): string {
  switch (type) {
    case "Application":
      return `${styles.iconContainerBase} ${styles.iconApplication}`;
    case "Interview":
      return `${styles.iconContainerBase} ${styles.iconInterview}`;
    case "Invitation":
      return `${styles.iconContainerBase} ${styles.iconInvitation}`;
    case "Profile":
      return `${styles.iconContainerBase} ${styles.iconProfile}`;
    case "Welcome":
      return `${styles.iconContainerBase} ${styles.iconWelcome}`;
    default:
      return styles.iconContainerBase;
  }
}

export const CandidateNotifications: React.FC = () => {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = React.useState<TabValue>("all");

  const unreadCount = mockNotifications.filter((n) => !n.read).length;
  const applicationCount = mockNotifications.filter(
    (n) => n.type === "Application"
  ).length;
  const interviewCount = mockNotifications.filter(
    (n) => n.type === "Interview"
  ).length;

  const notificationsForCurrentTab = React.useMemo(() => {
    switch (selectedTab) {
      case "unread":
        return mockNotifications.filter((n) => !n.read);
      case "applications":
        return mockNotifications.filter((n) => n.type === "Application");
      case "interviews":
        return mockNotifications.filter((n) => n.type === "Interview");
      case "all":
      default:
        return mockNotifications;
    }
  }, [selectedTab]);

  const renderList = (items: NotificationItem[]) => {
    if (items.length === 0) {
      const isApps = selectedTab === "applications";
      const isInterviews = selectedTab === "interviews";

      return (
        <Card className={styles.emptyCard} appearance="outline">
          <div className={styles.emptyIconWrapper}>
            {isApps ? (
              <DocumentText20Regular
                style={{ fontSize: 32, color: "#0B1220" }}
              />
            ) : (
              <Alert20Regular style={{ fontSize: 32, color: "#0B1220" }} />
            )}
          </div>
          <Text
            as="h3"
            weight="semibold"
            size={500}
            style={{ color: "#0B1220" }}
          >
            {isApps
              ? "Application Notifications"
              : isInterviews
              ? "Interview Notifications"
              : "No Notifications"}
          </Text>
          <Text size={300} className={styles.emptyMuted}>
            {isApps
              ? "Filter by application-related notifications."
              : isInterviews
              ? "Filter by interview-related notifications."
              : "You’re all caught up here."}
          </Text>
        </Card>
      );
    }

    return (
      <div className={styles.tabPanels}>
        {items.map((notification) => {
          const Icon = notification.icon as React.ElementType;
          const cardClasses = [
            styles.notificationCardBase,
            !notification.read ? styles.notificationCardUnread : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <Card
              key={notification.id}
              className={cardClasses}
              appearance="outline"
            >
              <div className={styles.notificationRow}>
                <div className={getIconClass(styles, notification.type)}>
                  <Icon />
                </div>

                <div className={styles.contentColumn}>
                  <div className={styles.titleRow}>
                    <div className={styles.titleWithDot}>
                      <Text
                        as="h4"
                        size={300}
                        weight="semibold"
                        className={styles.titleText}
                      >
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <span className={styles.unreadDot} />
                      )}
                    </div>
                    <Badge
                      appearance="outline"
                      style={{
                        backgroundColor: "#E9DFC3",
                        color: "#0B1220",
                        borderColor: "#E9DFC3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {notification.type}
                    </Badge>
                  </div>

                  <Text size={300} className={styles.messageText}>
                    {notification.message}
                  </Text>

                  <div className={styles.metaRow}>
                    <div className={styles.timestamp}>
                      <Clock20Regular style={{ fontSize: 12 }} />
                      <span>{notification.timestamp}</span>
                    </div>
                    {notification.actionLabel && (
                      <Button
                        appearance="subtle"
                        size="small"
                        style={{ color: "#0118D8", height: 32 }}
                      >
                        {notification.actionLabel}
                      </Button>
                    )}
                  </div>
                </div>

                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Dismiss20Regular />}
                  className={styles.closeButton}
                  aria-label="Dismiss notification"
                />
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <div>
          <Text
            as="h2"
            size={600}
            weight="semibold"
            className={styles.headerTitle}
            style={{ color: "#0B1220" }}
          >
            Notifications
          </Text>
          <Text
            as="p" 
            size={300}
            className={styles.headerSubtitle}
          >
            You have {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}
          </Text>
        </div>
        <div className={styles.headerActions}>
          <Button appearance="outline" size="small" className={styles.Buttons}>
            Mark All as Read
          </Button>
          <Button appearance="outline" size="small" className={styles.Buttons}>
            Settings
          </Button>
        </div>
      </div>

      <div>
        <TabList
          selectedValue={selectedTab}
          onTabSelect={(_, data) => setSelectedTab(data.value as TabValue)}
          className={styles.tabsList}
          appearance="subtle"
        >
          <Tab value="all">All ({mockNotifications.length})</Tab>
          <Tab value="unread">Unread ({unreadCount})</Tab>
          <Tab value="applications">Applications ({applicationCount})</Tab>
          <Tab value="interviews">Interviews ({interviewCount})</Tab>
        </TabList>

        {renderList(notificationsForCurrentTab)}
      </div>
    </div>
  );
};
