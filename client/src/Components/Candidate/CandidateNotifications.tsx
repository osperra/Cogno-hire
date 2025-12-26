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
  Spinner,
} from "@fluentui/react-components";

import {
  Alert20Regular,
  DocumentText20Regular,
  Mail20Regular,
  // PersonAdd20Regular,
  CheckmarkCircle20Regular,
  Clock20Regular,
  Dismiss20Regular,
} from "@fluentui/react-icons";

type NotificationTypeApi =
  | "application_created"
  | "application_status_changed"
  | "job_created"
  | "general";

type NotificationFromApi = {
  _id: string;
  userId: string;
  type: NotificationTypeApi;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

type NotificationsResponse = {
  items: NotificationFromApi[];
  unreadCount: number;
};

type NotificationTypeUI =
  | "Application"
  | "Interview"
  | "Invitation"
  | "Profile"
  | "Welcome";

type NotificationItemUI = {
  id: string;
  type: NotificationTypeUI;
  icon: React.ElementType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  link?: string;
};

type TabValue = "all" | "unread" | "applications" | "interviews";

const API_BASE =
  (import.meta.env?.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:5000";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type ApiErrorBody = { message?: string };

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...authHeaders() },
  });
  const raw = await res.text().catch(() => "");

  if (!res.ok) {
    try {
      const j = raw ? (JSON.parse(raw) as ApiErrorBody) : {};
      throw new Error(j?.message || `Request failed (${res.status})`);
    } catch {
      throw new Error(raw || `Request failed (${res.status})`);
    }
  }

  return raw ? (JSON.parse(raw) as T) : ({} as T);
}

async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const raw = await res.text().catch(() => "");
  if (!res.ok) {
    try {
      const j = raw ? (JSON.parse(raw) as ApiErrorBody) : {};
      throw new Error(j?.message || `Request failed (${res.status})`);
    } catch {
      throw new Error(raw || `Request failed (${res.status})`);
    }
  }

  return raw ? (JSON.parse(raw) as T) : ({} as T);
}

function timeAgoFromISO(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";

  const diffMs = Date.now() - t;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

/**
 * Map backend types -> UI types + icons.
 * You can refine this mapping anytime.
 */
function mapTypeToUi(t: NotificationTypeApi): {
  type: NotificationTypeUI;
  icon: React.ElementType;
  actionLabel?: string;
} {
  switch (t) {
    case "application_created":
      return { type: "Application", icon: DocumentText20Regular };
    case "application_status_changed":
      return { type: "Application", icon: CheckmarkCircle20Regular, actionLabel: "View Status" };
    case "job_created":
      return { type: "Invitation", icon: Mail20Regular, actionLabel: "View Job" };
    case "general":
    default:
      return { type: "Welcome", icon: Alert20Regular };
  }
}

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

  headerTitle: { marginBottom: tokens.spacingVerticalXXS },

  headerSubtitle: {
    color: "#5B6475",
    display: "block",
    marginTop: "4px",
  },

  headerActions: {
    display: "flex",
    columnGap: tokens.spacingHorizontalS,
  },

  buttons: {
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
    transition: "box-shadow 150ms ease, border-color 150ms ease, background-color 150ms ease",
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

  iconApplication: { backgroundColor: "#eff6ff", color: "#1d4ed8" },
  iconInterview: { backgroundColor: "#f5f3ff", color: "#7c3aed" },
  iconInvitation: { backgroundColor: "#ecfdf3", color: "#15803d" },
  iconProfile: { backgroundColor: "#fff7ed", color: "#ea580c" },
  iconWelcome: { backgroundColor: "#fdf2f8", color: "#db2777" },

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

  titleText: { color: "#0B1220" },
  messageText: { color: "#5B6475", marginBottom: tokens.spacingVerticalXS },

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
    minWidth: "0",
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

  loadingRow: {
    padding: "14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#5B6475",
  },
});

function getIconClass(styles: ReturnType<typeof useStyles>, type: NotificationTypeUI): string {
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
    default:
      return `${styles.iconContainerBase} ${styles.iconWelcome}`;
  }
}

export const CandidateNotifications: React.FC = () => {
  const styles = useStyles();

  const [selectedTab, setSelectedTab] = React.useState<TabValue>("all");

  const [items, setItems] = React.useState<NotificationItemUI[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const fetchNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet<NotificationsResponse>(
        "/api/notifications/me?unreadOnly=false&limit=50"
      );

      const mapped: NotificationItemUI[] = data.items.map((n) => {
        const mappedType = mapTypeToUi(n.type);
        return {
          id: n._id,
          type: mappedType.type,
          icon: mappedType.icon,
          title: n.title,
          message: n.message,
          timestamp: timeAgoFromISO(n.createdAt),
          read: n.isRead,
          link: n.link,
          actionLabel: mappedType.actionLabel,
        };
      });

      setItems(mapped);
      setUnreadCount(data.unreadCount);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load notifications.";
      setError(msg);
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const applicationCount = React.useMemo(
    () => items.filter((n) => n.type === "Application").length,
    [items]
  );
  const interviewCount = React.useMemo(
    () => items.filter((n) => n.type === "Interview").length,
    [items]
  );

  const notificationsForCurrentTab = React.useMemo(() => {
    switch (selectedTab) {
      case "unread":
        return items.filter((n) => !n.read);
      case "applications":
        return items.filter((n) => n.type === "Application");
      case "interviews":
        return items.filter((n) => n.type === "Interview");
      case "all":
      default:
        return items;
    }
  }, [items, selectedTab]);

  const markAllRead = async () => {
    try {
      await apiPatch<{ modifiedCount: number; message?: string }>("/api/notifications/read-all");
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to mark all read.";
      setError(msg);
    }
  };

  const dismissOne = async (id: string) => {
    // optimistic
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)));
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await apiPatch<{ message?: string }>(`/api/notifications/${id}/read`);
    } catch (e: unknown) {
      // revert by refetch (simple + safe)
      await fetchNotifications();
      const msg = e instanceof Error ? e.message : "Failed to dismiss.";
      setError(msg);
    }
  };

  const renderList = (list: NotificationItemUI[]) => {
    if (loading) {
      return (
        <div className={styles.loadingRow}>
          <Spinner size="small" /> Loading notifications...
        </div>
      );
    }

    if (error && list.length === 0) {
      return (
        <Card className={styles.emptyCard} appearance="outline">
          <div className={styles.emptyIconWrapper}>
            <Alert20Regular style={{ fontSize: 32, color: "#0B1220" }} />
          </div>
          <Text as="h3" weight="semibold" size={500} style={{ color: "#0B1220" }}>
            Failed to load notifications
          </Text>
          <Text size={300} className={styles.emptyMuted}>
            {error}
          </Text>
          <div style={{ marginTop: "12px" }}>
            <Button appearance="primary" onClick={fetchNotifications}>
              Retry
            </Button>
          </div>
        </Card>
      );
    }

    if (list.length === 0) {
      const isApps = selectedTab === "applications";
      const isInterviews = selectedTab === "interviews";

      return (
        <Card className={styles.emptyCard} appearance="outline">
          <div className={styles.emptyIconWrapper}>
            {isApps ? (
              <DocumentText20Regular style={{ fontSize: 32, color: "#0B1220" }} />
            ) : (
              <Alert20Regular style={{ fontSize: 32, color: "#0B1220" }} />
            )}
          </div>
          <Text as="h3" weight="semibold" size={500} style={{ color: "#0B1220" }}>
            {isApps
              ? "Application Notifications"
              : isInterviews
              ? "Interview Notifications"
              : "No Notifications"}
          </Text>
          <Text size={300} className={styles.emptyMuted}>
            {isApps
              ? "No application updates right now."
              : isInterviews
              ? "No interview updates right now."
              : "You’re all caught up here."}
          </Text>
        </Card>
      );
    }

    return (
      <div className={styles.tabPanels}>
        {list.map((n) => {
          const Icon = n.icon;

          const cardClasses = [
            styles.notificationCardBase,
            !n.read ? styles.notificationCardUnread : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <Card
              key={n.id}
              className={cardClasses}
              appearance="outline"
              // Optional: click card to open link
              onClick={() => {
                if (n.link) window.location.href = n.link;
              }}
              style={{ cursor: n.link ? "pointer" : "default" }}
            >
              <div className={styles.notificationRow}>
                <div className={getIconClass(styles, n.type)}>
                  <Icon />
                </div>

                <div className={styles.contentColumn}>
                  <div className={styles.titleRow}>
                    <div className={styles.titleWithDot}>
                      <Text as="h4" size={300} weight="semibold" className={styles.titleText}>
                        {n.title}
                      </Text>
                      {!n.read && <span className={styles.unreadDot} />}
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
                      {n.type}
                    </Badge>
                  </div>

                  <Text size={300} className={styles.messageText}>
                    {n.message}
                  </Text>

                  <div className={styles.metaRow}>
                    <div className={styles.timestamp}>
                      <Clock20Regular style={{ fontSize: 12 }} />
                      <span>{n.timestamp}</span>
                    </div>

                    {n.actionLabel && (
                      <Button
                        appearance="subtle"
                        size="small"
                        style={{ color: "#0118D8", height: 32 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (n.link) window.location.href = n.link;
                        }}
                      >
                        {n.actionLabel}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissOne(n.id);
                  }}
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

          <Text as="p" size={300} className={styles.headerSubtitle}>
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </Text>
        </div>

        <div className={styles.headerActions}>
          <Button appearance="outline" size="small" className={styles.buttons} onClick={markAllRead}>
            Mark All as Read
          </Button>
          <Button appearance="outline" size="small" className={styles.buttons} onClick={fetchNotifications}>
            Refresh
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
          <Tab value="all">All ({items.length})</Tab>
          <Tab value="unread">Unread ({unreadCount})</Tab>
          <Tab value="applications">Applications ({applicationCount})</Tab>
          <Tab value="interviews">Interviews ({interviewCount})</Tab>
        </TabList>

        {renderList(notificationsForCurrentTab)}
      </div>
    </div>
  );
};

export default CandidateNotifications;
