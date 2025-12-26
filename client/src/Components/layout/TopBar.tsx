// client/src/Components/layout/TopBar.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Input,
  Avatar,
  Text,
  Badge,
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Spinner,
} from "@fluentui/react-components";
import {
  ChevronDownRegular,
  Alert24Regular,
  Sparkle20Regular,
  SearchRegular,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import { api } from "../../api/http";

export type Role = "employer" | "candidate";

type TopBarProps = {
  title: string;
  role: Role;
  breadcrumbs?: string[];

  onMyAccount?: () => void;
  onProfileSettings?: () => void;
  onPreferences?: () => void;
  onSignOut?: () => void;
};

type MeResponse = {
  _id: string;
  name: string;
  email: string;
  role: Role;
};

type NotificationType =
  | "application_created"
  | "application_status_changed"
  | "job_created"
  | "general";

type NotificationFromApi = {
  _id: string;
  userId: string;
  type: NotificationType;
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

type NotificationItemUI = {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  isUnread: boolean;
  link?: string;
};

function roleBadgeColor(role: Role) {
  return role === "employer" ? "#0F5BFF" : "#16A34A";
}
function roleLabel(role: Role) {
  return role === "employer" ? "Employer" : "Candidate";
}
function accountLabel(role: Role) {
  return role === "employer" ? "Employer Account" : "Candidate Account";
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

export function TopBar({
  title,
  role,
  breadcrumbs,
  onMyAccount,
  onProfileSettings,
  onPreferences,
  onSignOut,
}: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loadingMe, setLoadingMe] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItemUI[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const comboPressed = isMac ? e.metaKey && e.key === "k" : e.ctrlKey && e.key === "k";
      if (comboPressed) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingMe(true);
        const data = await api<MeResponse>("/api/auth/me");
        if (!alive) return;
        setMe(data);
      } catch {
        if (alive) setMe(null);
      } finally {
        if (alive) setLoadingMe(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const badgeColor = roleBadgeColor(role);
  const roleText = roleLabel(role);

  const acctLabel = useMemo(() => accountLabel(me?.role ?? role), [me?.role, role]);
  const userEmail = me?.email ?? "—";
  const userName = me?.name ?? acctLabel;

  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const data = await api<NotificationsResponse>("/api/notifications/me?unreadOnly=false&limit=20");

      setUnreadCount(data.unreadCount);
      setNotifications(
        data.items.map((n) => ({
          id: n._id,
          title: n.title,
          description: n.message,
          timeAgo: timeAgoFromISO(n.createdAt),
          isUnread: !n.isRead,
          link: n.link,
        }))
      );
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    if (showNotifications) fetchNotifications();
  }, [showNotifications]);

  const markAllRead = async () => {
    try {
      await api<{ modifiedCount: number; message: string }>("/api/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #eee",
          height: 64,
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxSizing: "border-box",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <Text size={500} weight="regular" style={{ whiteSpace: "nowrap" }}>
              {title}
            </Text>

            <span
              style={{
                fontSize: 12,
                height: 18,
                padding: "2px 10px",
                borderRadius: 999,
                background: badgeColor,
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ width: 14, height: 14, borderRadius: "999px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                <Sparkle20Regular />
              </span>
              {roleText}
            </span>

            {loadingMe && <Spinner size="tiny" />}
          </div>

          {breadcrumbs && breadcrumbs.length > 0 && (
            <div style={{ fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <span key={`${crumb}-${index}`} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {index > 0 && <span style={{ color: "#9CA3AF" }}>/</span>}
                    <span style={isLast ? { fontWeight: 500, color: "#111827" } : undefined}>{crumb}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative", transition: "all 0.25s ease", width: searchFocused ? 380 : 260 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#5B6475", pointerEvents: "none", zIndex: 1 }}>
              <SearchRegular />
            </span>

            <Input
              ref={inputRef}
              placeholder="Search anything... (⌘K)"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: "100%",
                paddingLeft: 36,
                height: 36,
                borderRadius: 10,
                borderColor: searchFocused ? "#0118D8" : "transparent",
                backgroundColor: searchFocused ? "#ffffff" : "#F3F4F6",
                boxShadow: searchFocused ? "0 0 0 2px rgba(1, 24, 216, 0.35)" : "none",
                transition: "all 0.25s ease",
              }}
            />
          </div>

          {/* ✅ open panel only (don’t mark read on open) */}
          <button
            type="button"
            onClick={() => setShowNotifications(true)}
            style={{ position: "relative", background: "transparent", border: "none", padding: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Alert24Regular />
            {unreadCount > 0 && (
              <Badge appearance="filled" color="danger" size="small" style={{ position: "absolute", top: -2, right: -2 }}>
                {unreadCount}
              </Badge>
            )}
          </button>

          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button appearance="transparent" style={{ padding: "4px 8px", borderRadius: 999, display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar name={userName} color="brand" size={32} style={{ flexShrink: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
                  <Text weight="semibold" size={200}>{acctLabel}</Text>
                  <Text size={100} style={{ color: "#6B7280" }}>{userEmail}</Text>
                </div>
                <ChevronDownRegular />
              </Button>
            </MenuTrigger>

            <MenuPopover>
              <MenuList>
                <MenuItem onClick={onMyAccount}>My Account</MenuItem>
                <MenuItem onClick={onProfileSettings}>Profile Settings</MenuItem>
                <MenuItem onClick={onPreferences}>Preferences</MenuItem>

                <MenuItem
                  onClick={onSignOut}
                  style={{ color: "#dc2626", borderTop: "1px solid #eee", marginTop: 4, paddingTop: 8 }}
                >
                  Sign Out
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </header>

      {showNotifications && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.35)", display: "flex", justifyContent: "flex-end", zIndex: 1300 }}
          onClick={() => setShowNotifications(false)}
        >
          <div
            style={{
              height: "100vh",
              width: 360,
              maxWidth: "100%",
              backgroundColor: "#FFF7F7",
              boxShadow: "-8px 0 24px rgba(15,23,42,0.18)",
              padding: "16px 16px 24px 16px",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <Text weight="semibold" size={400}>Notifications</Text>

              <div style={{ display: "flex", gap: 8 }}>
                <Button appearance="outline" size="small" onClick={markAllRead}>
                  Mark all read
                </Button>

                <Button
                  appearance="subtle"
                  icon={<Dismiss24Regular />}
                  style={{ borderRadius: 9, minWidth: 25, height: 25, padding: 0, border: "1px solid #4F46E5", color: "#4F46E5", backgroundColor: "#F9FAFF" }}
                  onClick={() => setShowNotifications(false)}
                />
              </div>
            </div>

            <Text size={200} style={{ color: "#6B7280", fontSize: 12, marginBottom: 16 }}>
              You have <b>{unreadCount} unread notifications</b>
            </Text>

            {loadingNotifs ? (
              <div style={{ padding: 16 }}><Spinner size="medium" /></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", rowGap: 10, overflowY: "auto", paddingRight: 4 }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      position: "relative",
                      padding: "12px 14px",
                      borderRadius: 16,
                      backgroundColor: n.isUnread ? "#EEF4FF" : "#ffffff",
                      border: `1px solid ${n.isUnread ? "#BFDBFE" : "#E5E7EB"}`,
                      boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
                      cursor: n.link ? "pointer" : "default",
                    }}
                    onClick={() => {
                      if (n.link) window.location.href = n.link;
                    }}
                  >
                    {n.isUnread && (
                      <span style={{ position: "absolute", right: 12, top: 16, width: 8, height: 8, borderRadius: "999px", backgroundColor: "#1D4ED8" }} />
                    )}
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: "#4B5563", marginBottom: 8 }}>{n.description}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{n.timeAgo}</div>
                  </div>
                ))}

                {notifications.length === 0 && <div style={{ padding: 12, color: "#6B7280", fontSize: 13 }}>No notifications.</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default TopBar;
