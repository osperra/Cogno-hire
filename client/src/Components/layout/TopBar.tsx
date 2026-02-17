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
  tokens,
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
  onNavigate?: (page: string, data?: Record<string, unknown>) => void;
  navigateTo?: (path: string) => void;
  routes?: {
    myAccount?: string;
    profileSettings?: string;
    preferences?: string;
  };
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

type SearchEntity = "job" | "application" | "candidate" | "notification";
type SearchItem = {
  id: string;
  type: SearchEntity;
  title: string;
  subtitle?: string;
  url?: string;
  meta?: Record<string, unknown>;
};
type SearchResponse = {
  items: SearchItem[];
};
type JobListItem = {
  _id?: string;
  id?: string;
  title?: string;
  location?: string;
};

type ApplicationCandidate = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
};
type ApplicationJob = { _id?: string; id?: string; title?: string };

type ApplicationListItem = {
  _id?: string;
  id?: string;
  candidateId?: string | ApplicationCandidate;
  jobId?: string | ApplicationJob;
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

function mapNotifsToUI(items: NotificationFromApi[]): NotificationItemUI[] {
  return items.map((n) => ({
    id: n._id,
    title: n.title,
    description: n.message,
    timeAgo: timeAgoFromISO(n.createdAt),
    isUnread: !n.isRead,
    link: n.link,
  }));
}

function typePill(type: SearchEntity) {
  if (type === "job")
    return { label: "Job", bg: "rgba(15,91,255,0.10)", color: "#0F5BFF" };
  if (type === "application")
    return {
      label: "Application",
      bg: "rgba(249,115,22,0.12)",
      color: "#F97316",
    };
  if (type === "candidate")
    return { label: "Candidate", bg: "rgba(22,163,74,0.12)", color: "#16A34A" };
  return {
    label: "Notification",
    bg: "rgba(107,114,128,0.12)",
    color: "#6B7280",
  };
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

function getAppCandidate(x: ApplicationListItem["candidateId"]) {
  if (!x) return { name: "Unknown", email: "-" };
  if (typeof x === "string") return { name: "Unknown", email: "-" };
  return { name: x.name ?? "Unknown", email: x.email ?? "-" };
}

function getAppJob(x: ApplicationListItem["jobId"]) {
  if (!x) return { title: "Unknown Job" };
  if (typeof x === "string") return { title: "Unknown Job" };
  return { title: x.title ?? "Unknown Job" };
}

export function TopBar({
  title,
  role,
  breadcrumbs,
  onMyAccount,
  onProfileSettings,
  onPreferences,
  onSignOut,
  onNavigate,
  navigateTo,
  routes,
}: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loadingMe, setLoadingMe] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItemUI[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string>("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const resolvedRoutes = useMemo(
    () => ({
      myAccount: routes?.myAccount ?? "/employer/account",
      profileSettings: routes?.profileSettings ?? "/employer/profile",
      preferences: routes?.preferences ?? "/employer/preferences",
    }),
    [routes],
  );

  const go = (path: string, fallback?: () => void) => {
    if (fallback) {
      fallback();
      return;
    }
    if (navigateTo) {
      navigateTo(path);
      return;
    }
    window.location.href = path;
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const comboPressed = isMac
        ? e.metaKey && e.key === "k"
        : e.ctrlKey && e.key === "k";
      if (comboPressed) {
        e.preventDefault();
        inputRef.current?.focus();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = searchWrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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

  const acctLabel = useMemo(
    () => accountLabel(me?.role ?? role),
    [me?.role, role],
  );
  const userEmail = me?.email ?? "—";
  const userName = me?.name ?? acctLabel;

  const fetchNotifications = async () => {
    const data = await api<NotificationsResponse>(
      "/api/notifications/me?unreadOnly=false&limit=20",
    );
    setUnreadCount(data.unreadCount ?? 0);
    setNotifications(mapNotifsToUI(data.items ?? []));
  };

  const fetchUnreadCount = async () => {
    const data = await api<NotificationsResponse>(
      "/api/notifications/me?unreadOnly=false&limit=1",
    );
    setUnreadCount(data.unreadCount ?? 0);
  };

  const clearAllNotifications = async () => {
    try {
      await api("/api/notifications/clear-all", {
        method: "DELETE",
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await fetchUnreadCount();
      } catch {
        if (alive) setUnreadCount(0);
      }
    })();

    const intervalId = window.setInterval(async () => {
      try {
        if (showNotifications) await fetchNotifications();
        else await fetchUnreadCount();
      } catch {
        // ignore
      }
    }, 20000);

    return () => {
      alive = false;
      window.clearInterval(intervalId);
    };
  }, [showNotifications]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!showNotifications) return;
      try {
        setLoadingNotifs(true);
        await fetchNotifications();
      } catch {
        if (!alive) return;
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        if (alive) setLoadingNotifs(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [showNotifications]);

  const markAllRead = async () => {
    try {
      await api<{ modifiedCount: number; message: string }>(
        "/api/notifications/read-all",
        {
          method: "PATCH",
        },
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
      setUnreadCount(0);
      await fetchUnreadCount();
    } catch {
      // ignore
    }
  };

  const fetchSearch = async (q: string): Promise<SearchItem[]> => {
    const safe = encodeURIComponent(q.trim());

    const candidates: Array<() => Promise<SearchResponse>> = [
      () => api<SearchResponse>(`/api/search?q=${safe}&limit=8`),
      () => api<SearchResponse>(`/api/search/global?q=${safe}&limit=8`),
      async () => {
        const [jobsRes, appsRes] = await Promise.all([
          api<{ items: JobListItem[] } | JobListItem[]>(`/api/jobs?search=${safe}&limit=5`).catch(
            () => [] as JobListItem[],
          ),
          api<{ items: ApplicationListItem[] } | ApplicationListItem[]>(
            `/api/applications/employer?search=${safe}&limit=5`,
          ).catch(() => [] as ApplicationListItem[]),
        ]);

        const jobs = Array.isArray(jobsRes) ? jobsRes : (jobsRes?.items || []);
        const apps = Array.isArray(appsRes) ? appsRes : (appsRes?.items || []);

        const jobItems: SearchItem[] = (jobs || []).map((j) => ({
          id: String(j._id ?? j.id ?? ""),
          type: "job",
          title: String(j.title ?? "Untitled Job"),
          subtitle: j.location ? String(j.location) : undefined,
          meta: { jobId: j._id ?? j.id },
        }));

        const appItems: SearchItem[] = (apps || []).map((a) => {
          const c = getAppCandidate(a.candidateId);
          const j = getAppJob(a.jobId);

          return {
            id: String(a._id ?? a.id ?? ""),
            type: "application",
            title: `${c.name} • ${j.title}`,
            subtitle: c.email || undefined,
            meta: { applicationId: a._id ?? a.id },
          };
        });

        return {
          items: [...jobItems, ...appItems].filter((x) => x.id).slice(0, 8),
        };
      },
    ];

    let lastErr: unknown = null;
    for (const fn of candidates) {
      try {
        const r = await fn();
        if (r && Array.isArray(r.items)) return r.items;
      } catch (e) {
        lastErr = e;
      }
    }

    throw lastErr instanceof Error ? lastErr : new Error("Search failed");
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      const q = debouncedQuery.trim();
      if (!q) {
        setResults([]);
        setSearchError("");
        setSearchLoading(false);
        setActiveIndex(0);
        return;
      }

      try {
        setSearchLoading(true);
        setSearchError("");
        setSearchOpen(true);

        const items = await fetchSearch(q);
        if (!alive) return;

        setResults(items);
        setActiveIndex(0);
      } catch (e) {
        if (!alive) return;
        setResults([]);
        setSearchError(e instanceof Error ? e.message : "Search failed");
      } finally {
        if (alive) setSearchLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [debouncedQuery]);

  const selectItem = (item: SearchItem) => {
    setSearchOpen(false);

    if (item.url) {
      window.location.href = item.url;
      return;
    }

    if (!onNavigate) return;

    if (item.type === "job") {
      onNavigate("job", { jobId: item.meta?.jobId ?? item.id });
      return;
    }
    if (item.type === "application") {
      onNavigate("applicants", {
        applicationId: item.meta?.applicationId ?? item.id,
      });
      return;
    }
    if (item.type === "candidate") {
      onNavigate("candidates", {
        candidateId: item.meta?.candidateId ?? item.id,
      });
      return;
    }
    onNavigate("notifications", { id: item.id });
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchOpen) {
      if (e.key === "ArrowDown" && results.length > 0) setSearchOpen(true);
      return;
    }

    if (e.key === "Escape") {
      setSearchOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      return;
    }

    if (e.key === "Enter") {
      const item = results[activeIndex];
      if (item) selectItem(item);
    }
  };

  const searchBgIdle = tokens.colorNeutralBackground3;
  const searchBgFocused = tokens.colorNeutralBackground1;
  const searchText = tokens.colorNeutralForeground1;
  const searchSubText = tokens.colorNeutralForeground3;
  const surfaceBg = tokens.colorNeutralBackground1;
  const surfaceBorder = tokens.colorNeutralStroke2;
  const overlayBg = tokens.colorBackgroundOverlay;
  const dangerText = tokens.colorPaletteRedForeground1;

  return (
    <>
      <header
        style={{
          background: surfaceBg,
          borderBottom: `1px solid ${surfaceBorder}`,
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
          color: tokens.colorNeutralForeground1,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 2,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
            }}
          >
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
              {roleText}
            </span>

            {loadingMe && <Spinner size="tiny" />}
          </div>

          {breadcrumbs && breadcrumbs.length > 0 && (
            <div
              style={{
                fontSize: 12,
                color: searchSubText,
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 2,
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
                      <span style={{ color: tokens.colorNeutralForeground3 }}>
                        /
                      </span>
                    )}
                    <span
                      style={
                        isLast
                          ? {
                              fontWeight: 500,
                              color: tokens.colorNeutralForeground1,
                            }
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
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            ref={searchWrapRef}
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
                color: tokens.colorNeutralForeground3,
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              <SearchRegular />
            </span>

            <Input
              ref={inputRef}
              value={query}
              onChange={(_, data) => setQuery(data.value)}
              placeholder="Search anything... (⌘K)"
              onFocus={() => {
                setSearchFocused(true);
                setSearchOpen(true);
              }}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={onSearchKeyDown}
              style={{
                width: "100%",
                paddingLeft: 36,
                height: 36,
                borderRadius: 10,
                borderColor: searchFocused
                  ? tokens.colorBrandStroke1
                  : "transparent",
                backgroundColor: searchFocused ? searchBgFocused : searchBgIdle,
                boxShadow: searchFocused
                  ? `0 0 0 2px ${tokens.colorBrandStroke2}`
                  : "none",
                transition: "all 0.25s ease",
                color: searchText,
              }}
            />

            {searchOpen &&
              (query.trim().length > 0 ||
                results.length > 0 ||
                searchLoading ||
                searchError) && (
                <div
                  style={{
                    position: "absolute",
                    top: 44,
                    left: 0,
                    width: "100%",
                    background: surfaceBg,
                    border: `1px solid ${surfaceBorder}`,
                    borderRadius: 14,
                    boxShadow: tokens.shadow16,
                    overflow: "hidden",
                    zIndex: 1200,
                  }}
                >
                  <div
                    style={{
                      padding: "10px 12px",
                      borderBottom: `1px solid ${surfaceBorder}`,
                    }}
                  >
                    <Text size={200} style={{ color: searchSubText }}>
                      {searchLoading
                        ? "Searching..."
                        : searchError
                          ? "Error"
                          : results.length
                            ? `${results.length} results`
                            : "No results"}
                    </Text>
                  </div>

                  {searchLoading && (
                    <div
                      style={{
                        padding: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Spinner size="tiny" />
                      <Text size={200} style={{ color: searchSubText }}>
                        Fetching matches…
                      </Text>
                    </div>
                  )}

                  {!searchLoading && !!searchError && (
                    <div style={{ padding: 12 }}>
                      <Text size={200} style={{ color: dangerText }}>
                        {searchError}
                      </Text>
                    </div>
                  )}

                  {!searchLoading && !searchError && results.length > 0 && (
                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                      {results.map((r, idx) => {
                        const pill = typePill(r.type);
                        const active = idx === activeIndex;

                        return (
                          <div
                            key={`${r.type}-${r.id}-${idx}`}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectItem(r);
                            }}
                            style={{
                              padding: "10px 12px",
                              cursor: "pointer",
                              background: active
                                ? tokens.colorNeutralBackground1Hover
                                : surfaceBg,
                              borderBottom: `1px solid ${surfaceBorder}`,
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 10,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                padding: "2px 8px",
                                borderRadius: 999,
                                background: pill.bg,
                                color: pill.color,
                                fontWeight: 600,
                                lineHeight: "16px",
                                marginTop: 1,
                                flexShrink: 0,
                              }}
                            >
                              {pill.label}
                            </span>

                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: tokens.colorNeutralForeground1,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {r.title}
                              </div>
                              {r.subtitle && (
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: searchSubText,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    marginTop: 2,
                                  }}
                                >
                                  {r.subtitle}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!searchLoading &&
                    !searchError &&
                    query.trim().length > 0 &&
                    results.length === 0 && (
                      <div style={{ padding: 12 }}>
                        <Text size={200} style={{ color: searchSubText }}>
                          No matches for “{query.trim()}”.
                        </Text>
                      </div>
                    )}
                </div>
              )}
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
              color: tokens.colorNeutralForeground1,
            }}
          >
            <Alert24Regular />
            {unreadCount > 0 && (
              <Badge
                appearance="filled"
                color="danger"
                size="small"
                style={{ position: "absolute", top: -2, right: -2 }}
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
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Avatar
                  name={userName}
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
                    {acctLabel}
                  </Text>
                  <Text size={100} style={{ color: searchSubText }}>
                    {userEmail}
                  </Text>
                </div>
                <ChevronDownRegular />
              </Button>
            </MenuTrigger>

            <MenuPopover>
              <MenuList>
                <MenuItem
                  onClick={() => go(resolvedRoutes.myAccount, onMyAccount)}
                >
                  My Account
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    go(resolvedRoutes.profileSettings, onProfileSettings)
                  }
                >
                  Profile Settings
                </MenuItem>
                <MenuItem
                  onClick={() => go(resolvedRoutes.preferences, onPreferences)}
                >
                  Preferences
                </MenuItem>

                <MenuItem
                  onClick={onSignOut}
                  style={{
                    color: tokens.colorPaletteRedForeground1,
                    borderTop: `1px solid ${surfaceBorder}`,
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
      </header>

      {showNotifications && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: overlayBg,
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
              backgroundColor: surfaceBg,
              boxShadow: tokens.shadow28,
              padding: "16px 16px 24px 16px",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
              color: tokens.colorNeutralForeground1,
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

              <div style={{ display: "flex", gap: 8 }}>
                <Button appearance="subtle" size="small" onClick={clearAllNotifications} style={{ color: tokens.colorNeutralForeground4 }}>
                  Clear all
                </Button>
                <Button appearance="outline" size="small" onClick={markAllRead}>
                  Mark all read
                </Button>

                <Button
                  appearance="subtle"
                  icon={<Dismiss24Regular />}
                  style={{
                    borderRadius: 9,
                    minWidth: 25,
                    height: 25,
                    padding: 0,
                    border: `1px solid ${tokens.colorBrandStroke1}`,
                    color: tokens.colorBrandForeground1,
                    backgroundColor: tokens.colorNeutralBackground2,
                  }}
                  onClick={() => setShowNotifications(false)}
                />
              </div>
            </div>

            <Text
              size={200}
              style={{ color: searchSubText, fontSize: 12, marginBottom: 16 }}
            >
              You have <b>{unreadCount} unread notifications</b>
            </Text>

            {loadingNotifs ? (
              <div style={{ padding: 16 }}>
                <Spinner size="medium" />
              </div>
            ) : (
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
                      backgroundColor: n.isUnread
                        ? tokens.colorNeutralBackground2
                        : surfaceBg,
                      border: `1px solid ${surfaceBorder}`,
                      boxShadow: tokens.shadow4,
                      cursor: n.link ? "pointer" : "default",
                    }}
                    onClick={() => {
                      if (n.link) window.location.href = n.link;
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
                          backgroundColor: tokens.colorBrandForeground1,
                        }}
                      />
                    )}
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: tokens.colorNeutralForeground1,
                        marginBottom: 4,
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: tokens.colorNeutralForeground2,
                        marginBottom: 8,
                      }}
                    >
                      {n.description}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: searchSubText,
                      }}
                    >
                      <span>{n.timeAgo}</span>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div
                    style={{ padding: 12, color: searchSubText, fontSize: 13 }}
                  >
                    No notifications.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default TopBar;
