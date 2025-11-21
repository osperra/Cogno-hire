import { useState, type JSX } from "react";
import { Button, Text, Badge, makeStyles } from "@fluentui/react-components";

import {
  GridRegular,
  Briefcase20Regular,
  People20Regular,
  Branch20Regular,
  Sparkle20Regular,
  DocumentBulletListRegular,
  Star20Regular,
  PersonAvailableRegular,
  Building20Regular,
  Home20Regular,
  Alert24Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ArrowTrendingRegular,
  Settings20Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  root: {
    backgroundColor: "#ffffff",
    borderRight: "1px solid rgba(2,6,23,0.08)",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
    transition: "width 0.3s ease-in-out",
    overflow: "hidden",

    "@media (max-width: 768px)": {
      width: "100%",
      height: "auto",
      borderRight: "none",
      borderBottom: "1px solid rgba(2,6,23,0.08)",
    },
  },

  rootExpanded: {
    width: "248px",
    padding: "0 0 0 0",
  },

  rootCollapsed: {
    width: "72px",
    padding: "0 0 0 0",
    alignItems: "center",

    "@media (max-width: 768px)": {
      width: "100%",
      alignItems: "flex-start",
    },
  },

  header: {
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: "24px",
    borderBottom: "1px solid rgba(2,6,23,0.08)",
  },

  logoRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
  },

  logoBox: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundImage: "linear-gradient(to bottom right,#0118D8,#1B56FD)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "18px",
    flexShrink: 0,
  },

  logoTextWrapper: {
    display: "flex",
    flexDirection: "column",
    lineHeight: "1.1",
  },

  appTitle: {
    color: "#0B1220",
    fontSize: "1.125rem",
    fontWeight: 600,
  },

  appSubtitle: {
    color: "#5B6475",
    fontSize: "0.625rem",
  },

  scrollArea: {
    flex: 1,
    padding: "16px 12px",
    overflowY: "auto",
    overflowX: "auto",
  },

  navList: {
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
    width: "100%",
  },

  navListBottom: {
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
    width: "100%",
    marginTop: "12px",
  },

  navButton: {
    justifyContent: "flex-start",
    borderRadius: "12px",
    position: "relative",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    paddingBlock: "8px",
    paddingInline: "12px",
    minHeight: "40px",
    columnGap: "8px",
  },

  navButtonCollapsed: {
    justifyContent: "center",
    paddingInline: 0,
    width: "40px",
    height: "40px",
    marginInline: "auto",
  },

  navButtonActive: {
    backgroundImage: "linear-gradient(to right,#0118D8,#1B56FD)",
    color: "#ffffff",
    boxShadow: "0 10px 20px rgba(37,99,235,0.38)",

    ":hover": {
      backgroundImage: "linear-gradient(to right,#0118D8,#1B56FD)",
      color: "#ffffff",
    },
  },

  navButtonInactive: {
    color: "#5B6475",
    backgroundColor: "transparent",

    ":hover": {
      backgroundColor: "#F3F4F6",
      color: "#0B1220",
    },
  },

  divider: {
    height: "1px",
    backgroundColor: "rgba(15,23,42,0.04)",
    margin: "16px 12px",
  },

  footer: {
    borderTop: "1px solid rgba(2,6,23,0.08)",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    rowGap: "8px",
  },

  statusCard: {
    padding: "12px",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#EFF6FF,#F5F3FF)",
    border: "1px solid #BFDBFE",
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
  },

  collapseWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },

  collapseButton: {
    marginTop: "4px",
    width: "100%",
    height: "40px",
    borderRadius: "12px",
    color: "#6B7280",
    transition: "all 0.25s ease",
    ":hover": {
      backgroundImage: "linear-gradient(to right,#0118D8,#1B56FD)",
      color: "#ffffff",
    },
  },

  collapseButtonCollapsed: {
    marginTop: "4px",
    width: "40px",
    height: "40px",
    borderRadius: "999px",
    color: "#6B7280",
    transition: "all 0.25s ease",
    ":hover": {
      backgroundImage: "linear-gradient(to right,#0118D8,#1B56FD)",
      color: "#ffffff",
    },
  },
});

type NavItem = {
  id: string;
  label: string;
  icon: JSX.Element;
  badge?: string | null;
};

interface SidebarProps {
  userRole: "employer" | "candidate";
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ userRole, currentPage, onNavigate }: SidebarProps) {
  const styles = useStyles();
  const [expanded, setExpanded] = useState(true);

  const employerNav: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <GridRegular /> },
    { id: "jobs", label: "Jobs", icon: <Briefcase20Regular />, badge: "12" },
    { id: "applicants", label: "Applicants", icon: <People20Regular />, badge: "28" },
    { id: "pipeline", label: "Pipeline", icon: <Branch20Regular /> },
    {
      id: "ai-jd-generator",
      label: "AI Job Generator",
      icon: <Sparkle20Regular />,
      badge: "New",
    },
    {
      id: "documents",
      label: "Documents",
      icon: <DocumentBulletListRegular />,
      badge: "42",
    },
    { id: "reviews", label: "Reviews", icon: <Star20Regular />, badge: "18" },
    {
      id: "onboarding",
      label: "Onboarding",
      icon: <PersonAvailableRegular />,
      badge: "12",
    },
    { id: "company", label: "Company", icon: <Building20Regular /> },
  ];

  const candidateNav: NavItem[] = [
    { id: "home", label: "Home", icon: <Home20Regular /> },
    { id: "jobs", label: "Find Jobs", icon: <Briefcase20Regular />, badge: "234" },
    {
      id: "applications",
      label: "Applications",
      icon: <DocumentBulletListRegular />,
      badge: "12",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Alert24Regular />,
      badge: "3",
    },
  ];

  const bottomNav: NavItem[] = [
    { id: "analytics", label: "Analytics", icon: <ArrowTrendingRegular /> },
    { id: "settings", label: "Settings", icon: <Settings20Regular /> },
  ];

  const navItems = userRole === "employer" ? employerNav : candidateNav;

  const renderNavButton = (item: NavItem) => {
    const isActive = currentPage === item.id;

    if (!expanded) {
      return (
        <div
          key={item.id}
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          <Button
            icon={item.icon}
            appearance="subtle"
            className={`${styles.navButton} ${styles.navButtonCollapsed} ${
              isActive ? styles.navButtonActive : styles.navButtonInactive
            }`}
            onClick={() => onNavigate(item.id)}
          />
          {item.badge && (
            <Badge
              appearance="filled"
              color="danger"
              size="tiny"
              style={{
                position: "absolute",
                top: -5,
                right: -10,
                fontSize: "0.625rem",
                minWidth: 16,
                height: 16,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
              }}
            >
              {item.badge}
            </Badge>
          )}
        </div>
      );
    }

    return (
      <Button
        key={item.id}
        icon={item.icon}
        appearance="subtle"
        className={`${styles.navButton} ${
          isActive ? styles.navButtonActive : styles.navButtonInactive
        }`}
        onClick={() => onNavigate(item.id)}
      >
        {isActive && (
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 4,
              height: 32,
              borderRadius: "0 999px 999px 0",
              backgroundColor: "rgba(255,255,255,0.95)",
            }}
          />
        )}

        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginLeft: 8,
          }}
        >
          <span>{item.label}</span>
          {item.badge && (
            <Badge
              size="small"
              style={{
                marginLeft: 8,
                top: 3,
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.22)"
                  : "#E9DFC3",
                color: isActive ? "#ffffff" : "#0B1220",
                border: "none",
              }}
            >
              {item.badge}
            </Badge>
          )}
        </span>
      </Button>
    );
  };

  return (
    <aside
      className={`${styles.root} ${
        expanded ? styles.rootExpanded : styles.rootCollapsed
      }`}
    >
      {/* Header / Logo */}
      <div className={styles.header}>
        {expanded ? (
          <div className={styles.logoRow}>
            <div className={styles.logoBox}>C</div>
            <div className={styles.logoTextWrapper}>
              <span className={styles.appTitle}>Cogno</span>
              <span className={styles.appSubtitle}>AI Interviewing</span>
            </div>
          </div>
        ) : (
          <div className={styles.logoBox}>C</div>
        )}
      </div>

      {/* Nav / Scroll Area */}
      <div className={styles.scrollArea}>
        <div className={styles.navList}>{navItems.map(renderNavButton)}</div>

        <div className={styles.divider} />

        <div className={styles.navListBottom}>
          {bottomNav.map((item) => {
            const isActive = currentPage === item.id;

            if (!expanded) {
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 4,
                  }}
                >
                  <Button
                    icon={item.icon}
                    appearance="subtle"
                    className={`${styles.navButton} ${
                      styles.navButtonCollapsed
                    } ${
                      isActive
                        ? styles.navButtonActive
                        : styles.navButtonInactive
                    }`}
                    onClick={() => onNavigate(item.id)}
                  />
                </div>
              );
            }

            return (
              <Button
                key={item.id}
                icon={item.icon}
                appearance="subtle"
                className={`${styles.navButton} ${
                  isActive ? styles.navButtonActive : styles.navButtonInactive
                }`}
                onClick={() => onNavigate(item.id)}
              >
                <span
                  style={{
                    marginLeft: 8,
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Footer / Status + Toggle */}
      <div className={styles.footer}>
        {expanded && (
          <div className={styles.statusCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "999px",
                  background: "#22C55E",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <Text size={200} weight="semibold">
                You&apos;re online
              </Text>
            </div>
            <Text size={100} style={{ color: "#6B7280" }}>
              98% interview quality
            </Text>
          </div>
        )}

        <div className={styles.collapseWrapper}>
          <Button
            appearance="transparent"
            icon={
              expanded ? (
                <span style={{ transform: "scale(1.1)" }}>
                  <ChevronLeft20Regular />
                </span>
              ) : (
                <span style={{ transform: "scale(1.25)" }}>
                  <ChevronRight20Regular />
                </span>
              )
            }
            className={
              expanded ? styles.collapseButton : styles.collapseButtonCollapsed
            }
            onClick={() => setExpanded((prev) => !prev)}
          />
        </div>
      </div>
    </aside>
  );
}
