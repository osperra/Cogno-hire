"use client";

import * as React from "react";
import {
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { ChevronDown16Regular } from "@fluentui/react-icons";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useNavigationMenuStyles = makeStyles({
  root: {
    position: "relative",
    display: "flex",
    maxWidth: "100%",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    display: "flex",
    flexGrow: 1,
    listStyleType: "none",
    alignItems: "center",
    justifyContent: "center",
    columnGap: tokens.spacingHorizontalXS,
    padding: 0,
    margin: 0,
  },

  item: {
    position: "relative",
    listStyleType: "none",
  },

  triggerButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: tokens.spacingHorizontalXXS,
    height: "36px",
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalXS,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    cursor: "pointer",

    ":hover": {
      backgroundColor: tokens.colorSubtleBackgroundHover,
      color: tokens.colorNeutralForeground1,
    },

    ":focus-visible": {
      outlineStyle: "none",
      boxShadow: `0 0 0 2px ${tokens.colorBrandStroke1}`,
    },
  },

  triggerIcon: {
    width: "16px",
    height: "16px",
  },

  contentWrapper: {
    minWidth: "240px",
    maxWidth: "480px",
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    padding: tokens.spacingVerticalS,
    boxShadow: tokens.shadow16,
  },

  link: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalXXS,
    padding: tokens.spacingVerticalXS,
    paddingInline: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground1,
    textDecoration: "none",
    outlineStyle: "none",
    transitionProperty: "background-color, color, box-shadow",
    transitionDuration: tokens.durationFaster,

    ":hover": {
      backgroundColor: tokens.colorSubtleBackgroundHover,
      color: tokens.colorNeutralForeground1,
    },

    ":focus-visible": {
      boxShadow: `0 0 0 2px ${tokens.colorBrandStroke1}`,
    },
  },

  indicator: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "-2px",
    height: "2px",
    backgroundColor: tokens.colorBrandBackground,
    pointerEvents: "none",
  },

  viewport: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    marginTop: tokens.spacingVerticalXS,
    pointerEvents: "none",
  },

  viewportInner: {
    pointerEvents: "auto",
    minWidth: "280px",
    maxWidth: "640px",
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    padding: tokens.spacingVerticalM,
    boxShadow: tokens.shadow28,
  },
});

type NavigationMenuProps = React.HTMLAttributes<HTMLDivElement> & {
  viewport?: boolean;
};

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: NavigationMenuProps) {
  const styles = useNavigationMenuStyles();

  return (
    <div
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={mergeClassNames(styles.root, className)}
      {...props}
    >
      {children}
    </div>
  );
}

type NavigationMenuListProps = React.HTMLAttributes<HTMLUListElement>;

function NavigationMenuList({ className, ...props }: NavigationMenuListProps) {
  const styles = useNavigationMenuStyles();

  return (
    <ul
      data-slot="navigation-menu-list"
      className={mergeClassNames(styles.list, className)}
      {...props}
    />
  );
}

type MenuChildren =
  | React.ReactElement
  | [React.ReactElement, React.ReactElement];

type NavigationMenuItemProps = React.PropsWithChildren<
  React.LiHTMLAttributes<HTMLLIElement>
>;

function NavigationMenuItem({
  className,
  children,
  ...props
}: NavigationMenuItemProps) {
  const styles = useNavigationMenuStyles();

  return (
    <li
      data-slot="navigation-menu-item"
      className={mergeClassNames(styles.item, className)}
      {...props}
    >
      <Menu>{children as MenuChildren}</Menu>
    </li>
  );
}

type NavigationMenuTriggerProps = {
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuTriggerProps) {
  const styles = useNavigationMenuStyles();

  return (
    <MenuTrigger disableButtonEnhancement>
      <Button
        {...props}
        data-slot="navigation-menu-trigger"
        appearance="transparent"
        className={mergeClassNames(styles.triggerButton, className)}
        icon={<ChevronDown16Regular className={styles.triggerIcon} />}
        iconPosition="after"
      >
        {children}
      </Button>
    </MenuTrigger>
  );
}

type NavigationMenuContentProps = React.HTMLAttributes<HTMLDivElement>;

function NavigationMenuContent({
  className,
  children,
  ...props
}: NavigationMenuContentProps) {
  const styles = useNavigationMenuStyles();

  return (
    <MenuPopover>
      <div
        data-slot="navigation-menu-content"
        className={mergeClassNames(styles.contentWrapper, className)}
        {...props}
      >
        {children}
      </div>
    </MenuPopover>
  );
}

type NavigationMenuViewportProps = React.HTMLAttributes<HTMLDivElement>;

function NavigationMenuViewport({
  className,
  children,
  ...props
}: NavigationMenuViewportProps) {
  const styles = useNavigationMenuStyles();

  return (
    <div
      data-slot="navigation-menu-viewport"
      className={mergeClassNames(styles.viewport, className)}
      {...props}
    >
      <div className={styles.viewportInner}>{children}</div>
    </div>
  );
}

type NavigationMenuLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

function NavigationMenuLink({
  className,
  children,
  ...props
}: NavigationMenuLinkProps) {
  const styles = useNavigationMenuStyles();

  return (
    <a
      data-slot="navigation-menu-link"
      className={mergeClassNames(styles.link, className)}
      {...props}
    >
      {children}
    </a>
  );
}

type NavigationMenuIndicatorProps = React.HTMLAttributes<HTMLDivElement>;

function NavigationMenuIndicator({
  className,
  ...props
}: NavigationMenuIndicatorProps) {
  const styles = useNavigationMenuStyles();

  return (
    <div
      data-slot="navigation-menu-indicator"
      className={mergeClassNames(styles.indicator, className)}
      {...props}
    />
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
