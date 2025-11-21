import { useEffect, useRef, useState } from "react";
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
} from "@fluentui/react-components";
import {
  ChevronDownRegular,
  Alert24Regular,
  Sparkle20Regular,
  SearchRegular,
  Dismiss24Regular,
} from "@fluentui/react-icons";

type TopBarProps = {
  title: string;
  role: "employer" | "candidate";
  onSwitchRole: () => void;

  breadcrumbs?: string[];

  onMyAccount?: () => void;
  onProfileSettings?: () => void;
  onPreferences?: () => void;
  onSignOut?: () => void;
};

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  isUnread?: boolean;
};

export function TopBar({
  title,
  role,
  onSwitchRole,
  breadcrumbs,
  onMyAccount,
  onProfileSettings,
  onPreferences,
  onSignOut,
}: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const notifications: NotificationItem[] = [
    {
      id: "1",
      title: "New Application Received",
      description: "Sarah Chen applied for Senior Frontend Developer",
      timeAgo: "5 min ago",
      isUnread: true,
    },
    {
      id: "2",
      title: "Interview Completed",
      description: "Michael Rodriguez finished the interview",
      timeAgo: "1 hour ago",
      isUnread: true,
    },
    {
      id: "3",
      title: "Job Post Approved",
      description: "Your Backend Engineer position is now live",
      timeAgo: "2 hours ago",
      isUnread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const comboPressed = isMac
        ? e.metaKey && e.key === "k"
        : e.ctrlKey && e.key === "k";

      if (comboPressed) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const roleLabel = role === "employer" ? "Employer" : "Candidate";
  const accountLabel =
    role === "employer" ? "Employer Account" : "Candidate Account";
  const switchLabel =
    role === "employer"
      ? "Switch to Candidate View"
      : "Switch to Employer View";

  return (
    <>
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          padding: "8px 24px 10px 24px",
          rowGap: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            columnGap: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text size={500} weight="regular">
              {title}
            </Text>

            <span
              style={{
                fontSize: 12,
                width: "auto",
                height: 15,
                padding: "4px 10px",
                borderRadius: 8,
                background: role === "employer" ? "#0F5BFF" : "#16A34A",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                }}
              >
                <Sparkle20Regular />
              </span>

              {roleLabel}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                position: "relative",
                transition: "all 0.25s ease",
                width: searchFocused ? 380 : 260,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 16,
                  color: "#5B6475",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              >
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
                  borderRadius: 8,
                  borderColor: searchFocused ? "#0118D8" : "transparent",
                  backgroundColor: searchFocused ? "#ffffff" : "#F3F4F6",
                  boxShadow: searchFocused
                    ? "0 0 0 2px rgba(1, 24, 216, 0.35)"
                    : "none",
                  transition: "all 0.25s ease",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowNotifications(true)}
              style={{
                position: "relative",
                background: "transparent",
                border: "none",
                padding: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Alert24Regular />
              {unreadCount > 0 && (
                <Badge
                  appearance="filled"
                  color="danger"
                  size="small"
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                  }}
                >
                  {unreadCount}
                </Badge>
              )}
            </button>

            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button
                  appearance="transparent"
                  style={{
                    padding: "4px 8px",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Avatar
                    name={accountLabel}
                    color="brand"
                    size={32}
                    style={{ flexShrink: 0 }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      lineHeight: 1.1,
                    }}
                  >
                    <Text weight="semibold" size={200}>
                      {accountLabel}
                    </Text>
                    <Text size={100} style={{ color: "#6B7280" }}>
                      employer@company.com
                    </Text>
                  </div>
                  <ChevronDownRegular />
                </Button>
              </MenuTrigger>

              <MenuPopover>
                <MenuList>
                  <MenuItem onClick={onMyAccount}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "999px",
                        background: "#16a34a",
                        marginRight: 8,
                      }}
                    />
                    My Account
                  </MenuItem>
                  <MenuItem onClick={onProfileSettings}>
                    Profile Settings
                  </MenuItem>
                  <MenuItem onClick={onPreferences}>Preferences</MenuItem>
                  <MenuItem onClick={onSwitchRole}>{switchLabel}</MenuItem>
                  <MenuItem
                    onClick={onSignOut}
                    style={{
                      color: "#dc2626",
                      borderTop: "1px solid #eee",
                      marginTop: 4,
                      paddingTop: 8,
                    }}
                  >
                    Sign Out
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        </div>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <div
            style={{
              fontSize: 12,
              color: "#6B7280",
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <span
                  key={`${crumb}-${index}`}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  {index > 0 && (
                    <span style={{ color: "#9CA3AF" }}>/</span>
                  )}
                  <span
                    style={
                      isLast
                        ? { fontWeight: 500, color: "#111827" }
                        : undefined
                    }
                  >
                    {crumb}
                  </span>
                </span>
              );
            })}
          </div>
        )}
      </header>

      {showNotifications && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15,23,42,0.35)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 1300,
          }}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <Text weight="semibold" size={400}>
                Notifications
              </Text>
              <Button
                appearance="subtle"
                icon={<Dismiss24Regular />}
                style={{
                  borderRadius: 9,
                  minWidth: 25,
                  height: 25,
                  padding: 0,
                  border: "1px solid #4F46E5",
                  color: "#4F46E5",
                  backgroundColor: "#F9FAFF",
                }}
                onClick={() => setShowNotifications(false)}
              />
            </div>

            <Text
              size={200}
              style={{ color: "#6B7280", fontSize: 12, marginBottom: 16 }}
            >
              You have <b>{unreadCount} unread notifications</b>
            </Text>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: 10,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    position: "relative",
                    padding: "12px 14px",
                    borderRadius: 16,
                    backgroundColor: n.isUnread ? "#EEF4FF" : "#ffffff",
                    border: `1px solid ${
                      n.isUnread ? "#BFDBFE" : "#E5E7EB"
                    }`,
                    boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
                  }}
                >
                  {n.isUnread && (
                    <span
                      style={{
                        position: "absolute",
                        right: 12,
                        top: 16,
                        width: 8,
                        height: 8,
                        borderRadius: "999px",
                        backgroundColor: "#1D4ED8",
                      }}
                    />
                  )}

                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: 4,
                    }}
                  >
                    {n.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#4B5563",
                      marginBottom: 8,
                    }}
                  >
                    {n.description}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9CA3AF",
                    }}
                  >
                    {n.timeAgo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
