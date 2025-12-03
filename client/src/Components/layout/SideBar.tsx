import { useState, type JSX } from "react";
import {  Text, Badge, makeStyles } from "@fluentui/react-components";

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
  },

  rootExpanded: {
    width: "248px",
  },

  rootCollapsed: {
    width: "72px",
    alignItems: "center",
  },

  header: {
    height: "64px",
    display: "flex",
    alignItems: "center",
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
    lineHeight: "1.5",
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
    overflowX: "hidden",
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

  navItemButton: {
    border: "none",
    outline: "none",
    background: "transparent",
    cursor: "pointer",
    width: "100%",
    display: "flex",
    alignItems: "center",
    position: "relative",
    paddingBlock: "10px",
    paddingInline: "12px",
    borderRadius: "12px",
    columnGap: "8px",
    color: "#4B5563",
    fontSize: "0.9rem",
    textAlign: "left",
    transition:
      "background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
    "& svg": {
      color: "#4B5563",
      flexShrink: 0,
    },
  },

  navItemExpanded: {},

  navItemCollapsed: {
    justifyContent: "center",
    paddingInline: 0,
    width: "40px",
    height: "40px",
    marginInline: "auto",
  },

 navItemActive: {
  backgroundImage: "linear-gradient(to right, #0118D8, #1B56FD)",
  boxShadow: "0 10px 20px rgba(37, 99, 235, 0.38)",
  color: "#ffffff !important",

  "& svg": {
    color: "#ffffff !important",
  },

}
,

  navItemInactive: {
    ":hover": {
      backgroundColor: "#F3F4F6",
      color: "#0B1220",
      "& svg": {
        color: "#0B1220",
      },
    },
  },

  navLabel: {
    color: "inherit",
  },

  activeLeftPill: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "4px",
    height: "32px",
    borderRadius: "0 999px 999px 0",
    backgroundColor: "rgba(255,255,255,0.95)",
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

  collapseBtn: {
    border: "none",
    outline: "none",
    cursor: "pointer",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "4px",
    color: "#6B7280",
    width: "100%",
    height: "40px",
    borderRadius: "12px",
    transition: "background 0.2s ease, color 0.2s ease",
    ":hover": {
      backgroundImage: "linear-gradient(to right,#0118D8,#1B56FD)",
      color: "#ffffff",
    },
  },

  collapseBtnCollapsed: {
    width: "40px",
    height: "40px",
    borderRadius: "999px",
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
    {
      id: "applicants",
      label: "Applicants",
      icon: <People20Regular />,
      badge: "28",
    },
    { id: "pipeline", label: "Pipeline", icon: <Branch20Regular /> },
    {
      id: "AIJobDescriptionGenerator",
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

  const renderNavItem = (item: NavItem) => {
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
          <button
            type="button"
            className={[
              styles.navItemButton,
              styles.navItemCollapsed,
              isActive ? styles.navItemActive : styles.navItemInactive,
            ].join(" ")}
            onClick={() => onNavigate(item.id)}
          >
            {item.icon}
          </button>
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
      <button
        key={item.id}
        type="button"
        className={[
          styles.navItemButton,
          styles.navItemExpanded,
          isActive ? styles.navItemActive : styles.navItemInactive,
        ].join(" ")}
        onClick={() => onNavigate(item.id)}
      >
        {isActive && <span className={styles.activeLeftPill} />}
        {item.icon}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginLeft: 8,
          }}
        >
          <span className={styles.navLabel}>{item.label}</span>
          {item.badge && (
            <Badge
              size="small"
              style={{
                marginLeft: 8,
                backgroundColor: isActive ? "rgba(255,255,255,0.22)" : "#E9DFC3",
                color: isActive ? "#ffffff" : "#0B1220",
                border: "none",
              }}
            >
              {item.badge}
            </Badge>
          )}
        </span>
      </button>
    );
  };

  return (
    <aside
      className={`${styles.root} ${
        expanded ? styles.rootExpanded : styles.rootCollapsed
      }`}
    >
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

      <div className={styles.scrollArea}>
        <div className={styles.navList}>{navItems.map(renderNavItem)}</div>

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
                  <button
                    type="button"
                    className={[
                      styles.navItemButton,
                      styles.navItemCollapsed,
                      isActive ? styles.navItemActive : styles.navItemInactive,
                    ].join(" ")}
                    onClick={() => onNavigate(item.id)}
                  >
                    {item.icon}
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                className={[
                  styles.navItemButton,
                  styles.navItemExpanded,
                  isActive ? styles.navItemActive : styles.navItemInactive,
                ].join(" ")}
                onClick={() => onNavigate(item.id)}
              >
                {item.icon}
                <span
                  className={styles.navLabel}
                  style={{ marginLeft: 8, width: "100%", textAlign: "left" }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

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
          <button
            type="button"
            className={`${styles.collapseBtn} ${
              !expanded ? styles.collapseBtnCollapsed : ""
            }`}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? <ChevronLeft20Regular /> : <ChevronRight20Regular />}
          </button>
        </div>
      </div>
    </aside>
  );
}
