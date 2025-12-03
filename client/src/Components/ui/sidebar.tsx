"use client";

/* eslint-disable react-refresh/only-export-components */

import * as React from "react";
import {
  Button,
  Input,
  Divider,
  Tooltip,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { PanelLeftTextRegular } from "@fluentui/react-icons";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = 256;
const SIDEBAR_WIDTH_ICON = 48;
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarState = "expanded" | "collapsed";

type SidebarContextProps = {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}

const useSidebarStyles = makeStyles({
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  sidebarContainer: {
    position: "fixed",
    insetBlockStart: 0,
    insetBlockEnd: 0,
    insetInlineStart: 0,
    display: "flex",
    flexDirection: "column",
    backgroundColor: tokens.colorNeutralBackground2,
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    transitionProperty: "width, transform",
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    boxShadow: tokens.shadow16,
    zIndex: 20,
  },
  sidebarHeader: {
    padding: "12px 12px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sidebarFooter: {
    padding: "12px",
    marginTop: "auto",
  },
  sidebarContent: {
    padding: "8px 8px 12px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  inset: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    marginInlineStart: `${SIDEBAR_WIDTH}px`,
    transitionProperty: "margin-inline-start",
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
  },
  insetCollapsed: {
    marginInlineStart: `${SIDEBAR_WIDTH_ICON}px`,
  },
  insetMobile: {
    marginInlineStart: 0,
  },
  menu: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  menuItem: {
    position: "relative",
  },
  menuButton: {
    width: "100%",
    justifyContent: "flex-start",
    paddingInline: "8px",
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  groupLabel: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    paddingInline: "8px",
    paddingBlockEnd: "4px",
  },
  badge: {
    position: "absolute",
    insetBlockStart: "50%",
    transform: "translateY(-50%)",
    fontSize: tokens.fontSizeBase100,
    paddingInline: "6px",
    paddingBlock: "2px",
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  skeleton: {
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
  },
});

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(max-width: 768px)");

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mq.matches);

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}

type SidebarProviderProps = React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  children,
  ...rest
}: SidebarProviderProps) {
  const styles = useSidebarStyles();
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  const [_open, _setOpen] = React.useState<boolean>(() => {
    if (typeof document === "undefined") return defaultOpen;
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${SIDEBAR_COOKIE_NAME}=`));
    if (!cookie) return defaultOpen;
    return cookie.split("=")[1] === "true";
  });

  const open = openProp ?? _open;

  const setOpen = React.useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next =
        typeof value === "function"
          ? (value as (v: boolean) => boolean)(open)
          : value;

      if (onOpenChange) onOpenChange(next);
      else _setOpen(next);

      if (typeof document !== "undefined") {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      }
    },
    [open, onOpenChange]
  );

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((v) => !v);
    } else {
      setOpen((v) => !v);
    }
  }, [isMobile, setOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state: SidebarState = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, openMobile, isMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className={styles.wrapper} {...rest}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

type SidebarProps = {
  side?: "left" | "right";
  collapsible?: "offcanvas" | "icon" | "none";
  children: React.ReactNode;
};

export function Sidebar({
  side = "left",
  collapsible = "offcanvas",
  children,
}: SidebarProps) {
  const { isMobile, open, openMobile } = useSidebar();
  const styles = useSidebarStyles();

  const isExpanded = open;
  const isCollapsed = !open && collapsible === "icon";

  const isVisibleMobile = isMobile && openMobile;
  const isVisibleDesktop =
    !isMobile && (isExpanded || isCollapsed || collapsible === "none");

  const widthStyle: React.CSSProperties =
    collapsible === "none"
      ? { width: SIDEBAR_WIDTH }
      : isCollapsed
      ? { width: SIDEBAR_WIDTH_ICON }
      : { width: SIDEBAR_WIDTH };

  const transformStyle: React.CSSProperties =
    isMobile && !isVisibleMobile
      ? {
          transform: side === "left" ? "translateX(-100%)" : "translateX(100%)",
        }
      : { transform: "translateX(0)" };

  return (
    <>
      {isMobile && isVisibleMobile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 15,
          }}
        />
      )}

      <div
        className={styles.sidebarContainer}
        style={{
          ...(side === "left"
            ? { left: 0 }
            : {
                right: 0,
                borderRight: "none",
                borderLeft: `1px solid ${tokens.colorNeutralStroke1}`,
              }),
          ...widthStyle,
          ...transformStyle,
          display: isVisibleMobile || isVisibleDesktop ? "flex" : "none",
        }}
      >
        {children}
      </div>
    </>
  );
}

type SidebarTriggerProps = React.ComponentProps<typeof Button>;

export function SidebarTrigger(props: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar();
  const { onClick, ...rest } = props;

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    if (onClick) {
      (onClick as (event: unknown) => void)(e);
    }
    toggleSidebar();
  };

  return (
    <Button
      appearance="subtle"
      icon={<PanelLeftTextRegular />}
      onClick={handleClick}
      {...rest}
    />
  );
}

type SidebarInsetProps = React.ComponentProps<"main">;

export function SidebarInset({ children, style, ...props }: SidebarInsetProps) {
  const { isMobile, state } = useSidebar();
  const styles = useSidebarStyles();

  const classNames = [styles.inset];
  if (isMobile) classNames.push(styles.insetMobile);
  else if (state === "collapsed") classNames.push(styles.insetCollapsed);

  return (
    <main className={classNames.join(" ")} style={style} {...props}>
      {children}
    </main>
  );
}

export function SidebarRail() {
  const { toggleSidebar } = useSidebar();
  return (
    <div
      style={{
        position: "absolute",
        insetBlock: 0,
        insetInlineEnd: -6,
        width: 12,
        cursor: "ew-resize",
      }}
      onClick={toggleSidebar}
    />
  );
}

type SidebarHeaderProps = React.ComponentProps<"div">;

export function SidebarHeader({
  children,
  style,
  ...props
}: SidebarHeaderProps) {
  const styles = useSidebarStyles();
  return (
    <div className={styles.sidebarHeader} style={style} {...props}>
      {children}
    </div>
  );
}

type SidebarFooterProps = React.ComponentProps<"div">;

export function SidebarFooter({
  children,
  style,
  ...props
}: SidebarFooterProps) {
  const styles = useSidebarStyles();
  return (
    <div className={styles.sidebarFooter} style={style} {...props}>
      {children}
    </div>
  );
}

type SidebarContentProps = React.ComponentProps<"div">;

export function SidebarContent({
  children,
  style,
  ...props
}: SidebarContentProps) {
  const styles = useSidebarStyles();
  return (
    <div className={styles.sidebarContent} style={style} {...props}>
      {children}
    </div>
  );
}

export function SidebarSeparator() {
  return <Divider />;
}

export function SidebarInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...props} />;
}

export function SidebarGroup(props: React.ComponentProps<"div">) {
  const styles = useSidebarStyles();
  return (
    <div className={styles.group} {...props}>
      {props.children}
    </div>
  );
}

export function SidebarGroupLabel(props: React.ComponentProps<"div">) {
  const styles = useSidebarStyles();
  return (
    <div className={styles.groupLabel} {...props}>
      {props.children}
    </div>
  );
}

export function SidebarGroupAction(props: React.ComponentProps<typeof Button>) {
  return <Button appearance="subtle" size="small" {...props} />;
}

export function SidebarGroupContent(props: React.ComponentProps<"div">) {
  return <div {...props} />;
}

export function SidebarMenu(props: React.ComponentProps<"ul">) {
  const styles = useSidebarStyles();
  return (
    <ul className={styles.menu} {...props}>
      {props.children}
    </ul>
  );
}

export function SidebarMenuItem(props: React.ComponentProps<"li">) {
  const styles = useSidebarStyles();
  return (
    <li className={styles.menuItem} {...props}>
      {props.children}
    </li>
  );
}

type SidebarMenuButtonProps = React.ComponentProps<typeof Button> & {
  isActive?: boolean;
  tooltip?: string;
};

export function SidebarMenuButton({
  isActive,
  tooltip,
  style,
  ...props
}: SidebarMenuButtonProps) {
  const styles = useSidebarStyles();

  const btn = (
    <Button
      appearance={isActive ? "primary" : "subtle"}
      style={{ ...style, justifyContent: "flex-start" }}
      className={styles.menuButton}
      {...props}
    />
  );

  if (!tooltip) return btn;

  return (
    <Tooltip content={tooltip} relationship="label">
      {btn}
    </Tooltip>
  );
}

export function SidebarMenuAction(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      appearance="subtle"
      size="small"
      style={{ position: "absolute", insetInlineEnd: 4, insetBlockStart: 4 }}
      {...props}
    />
  );
}

export function SidebarMenuBadge(props: React.ComponentProps<"div">) {
  const styles = useSidebarStyles();
  return (
    <div className={styles.badge} {...props}>
      {props.children}
    </div>
  );
}

export function SidebarMenuSkeleton() {
  const styles = useSidebarStyles();
  return <div className={styles.skeleton} />;
}

export function SidebarMenuSub(props: React.ComponentProps<"ul">) {
  return (
    <ul
      style={{
        listStyle: "none",
        paddingLeft: 16,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
      {...props}
    />
  );
}

export function SidebarMenuSubItem(props: React.ComponentProps<"li">) {
  return <li {...props} />;
}

type SidebarMenuSubButtonProps = React.ComponentProps<"a"> & {
  isActive?: boolean;
  size?: "sm" | "md";
};

export function SidebarMenuSubButton({
  isActive,
  size = "md",
  style,
  ...props
}: SidebarMenuSubButtonProps) {
  const fontSize =
    size === "sm" ? tokens.fontSizeBase100 : tokens.fontSizeBase200;
  const paddingBlock = size === "sm" ? 4 : 6;

  return (
    <a
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderRadius: tokens.borderRadiusMedium,
        textDecoration: "none",
        paddingInline: 8,
        paddingBlock,
        fontSize,
        backgroundColor: isActive
          ? tokens.colorNeutralBackground3Selected
          : "transparent",
        color: isActive
          ? tokens.colorNeutralForeground1
          : tokens.colorNeutralForeground2,
        ...style,
      }}
    />
  );
}
