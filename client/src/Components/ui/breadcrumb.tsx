"use client";

import * as React from "react";
import {
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import {
  ChevronRight16Regular,
  MoreHorizontal16Regular,
} from "@fluentui/react-icons";

const useBreadcrumbStyles = makeStyles({
  nav: {
    display: "block",
  },
  list: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    ...shorthands.gap("6px"),
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    wordBreak: "break-word",
  },
  item: {
    display: "inline-flex",
    alignItems: "center",
    ...shorthands.gap("6px"),
  },
  link: {
    cursor: "pointer",
    textDecoration: "none",
    color: tokens.colorNeutralForeground2,
    transition: "color 150ms ease",
    ":hover": {
      color: tokens.colorNeutralForeground1,
    },
  },
  page: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightRegular,
  },
  separator: {
    display: "inline-flex",
    alignItems: "center",
    "> svg": {
      width: "14px",
      height: "14px",
    },
  },
  ellipsis: {
    display: "flex",
    width: "36px",
    height: "36px",
    alignItems: "center",
    justifyContent: "center",
  },
  ellipsisIcon: {
    width: "16px",
    height: "16px",
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  },
});

function mergeClassNames(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function Breadcrumb(props: React.ComponentProps<"nav">) {
  const styles = useBreadcrumbStyles();
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={mergeClassNames(styles.nav, props.className)}
      {...props}
    />
  );
}

function BreadcrumbList({
  className,
  ...props
}: React.ComponentProps<"ol">) {
  const styles = useBreadcrumbStyles();
  return (
    <ol
      data-slot="breadcrumb-list"
      className={mergeClassNames(styles.list, className)}
      {...props}
    />
  );
}

function BreadcrumbItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  const styles = useBreadcrumbStyles();
  return (
    <li
      data-slot="breadcrumb-item"
      className={mergeClassNames(styles.item, className)}
      {...props}
    />
  );
}

type BreadcrumbLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  asChild?: boolean;
};

type BreadcrumbLinkChildProps = React.HTMLAttributes<HTMLElement> & {
  "data-slot"?: string;
};

function BreadcrumbLink({
  asChild,
  className,
  children,
  ...props
}: BreadcrumbLinkProps) {
  const styles = useBreadcrumbStyles();

  if (asChild && React.isValidElement<BreadcrumbLinkChildProps>(children)) {
    const child = children as React.ReactElement<BreadcrumbLinkChildProps>;

    return React.cloneElement<BreadcrumbLinkChildProps>(child, {
      ...child.props,
      ...(props as React.HTMLAttributes<HTMLElement>),
      "data-slot": "breadcrumb-link",
      className: mergeClassNames(
        styles.link,
        child.props.className,
        className,
      ),
    });
  }

  return (
    <a
      data-slot="breadcrumb-link"
      className={mergeClassNames(styles.link, className)}
      {...props}
    >
      {children}
    </a>
  );
}

function BreadcrumbPage({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const styles = useBreadcrumbStyles();
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={mergeClassNames(styles.page, className)}
      {...props}
    />
  );
}

type BreadcrumbSeparatorProps = React.ComponentProps<"li"> & {
  children?: React.ReactNode;
};

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: BreadcrumbSeparatorProps) {
  const styles = useBreadcrumbStyles();
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={mergeClassNames(styles.separator, className)}
      {...props}
    >
      {children ?? <ChevronRight16Regular />}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const styles = useBreadcrumbStyles();
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      className={mergeClassNames(styles.ellipsis, className)}
      {...props}
    >
      <MoreHorizontal16Regular className={styles.ellipsisIcon} />
      <span className={styles.srOnly}>More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
