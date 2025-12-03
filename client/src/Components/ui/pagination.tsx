"use client";

import * as React from "react";
import { makeStyles, shorthands, tokens } from "@fluentui/react-components";
import {
  ChevronLeft16Regular,
  ChevronRight16Regular,
  MoreHorizontal16Regular,
} from "@fluentui/react-icons";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const usePaginationStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginInline: "auto",
  },
  content: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalXXS,
    padding: 0,
    margin: 0,
    listStyleType: "none",
  },
  item: {
    listStyleType: "none",
  },

  linkBase: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: tokens.spacingHorizontalXXS,
    textDecoration: "none",
    cursor: "pointer",
    userSelect: "none",

    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightRegular,

    backgroundColor: "transparent",
    color: tokens.colorNeutralForeground1,
    ...shorthands.border("1px", "solid", "transparent"),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),

    transitionProperty: "background-color, color, box-shadow, border-color",
    transitionDuration: tokens.durationFaster,

    ":hover": {
      backgroundColor: tokens.colorSubtleBackgroundHover,
    },

    ":focus-visible": {
      outlineStyle: "none",
      boxShadow: `0 0 0 2px ${tokens.colorBrandStroke1}`,
    },

    ":disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },

  linkActive: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
  },

  linkGhost: {
    backgroundColor: "transparent",
    ...shorthands.border("1px", "solid", "transparent"),
  },

  linkSmall: {
    height: "28px",
    paddingInline: tokens.spacingHorizontalXS,
    paddingBlock: tokens.spacingVerticalXXS,
  },
  linkMedium: {
    height: "32px",
    paddingInline: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalXXS,
  },
  linkLarge: {
    height: "36px",
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalXS,
  },

  iconOnlyGap: {
    columnGap: tokens.spacingHorizontalXXS,
  },

  prevNextText: {
    "@media (max-width: 480px)": {
      display: "none",
    },
  },

  ellipsis: {
    display: "flex",
    width: "36px",
    height: "36px",
    alignItems: "center",
    justifyContent: "center",
  },

  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    border: 0,
  },
});

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  const styles = usePaginationStyles();

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={mergeClassNames(styles.root, className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  const styles = usePaginationStyles();

  return (
    <ul
      data-slot="pagination-content"
      className={mergeClassNames(styles.content, className)}
      {...props}
    />
  );
}

function PaginationItem(props: React.ComponentProps<"li">) {
  const styles = usePaginationStyles();
  return <li data-slot="pagination-item" className={styles.item} {...props} />;
}

type PaginationLinkSize = "small" | "medium" | "large";

type PaginationLinkProps = {
  isActive?: boolean;
  size?: PaginationLinkSize;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

function PaginationLink({
  className,
  isActive,
  size = "small",
  ...props
}: PaginationLinkProps) {
  const styles = usePaginationStyles();

  const sizeClass =
    size === "large"
      ? styles.linkLarge
      : size === "medium"
      ? styles.linkMedium
      : styles.linkSmall;

  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={mergeClassNames(
        styles.linkBase,
        isActive ? styles.linkActive : styles.linkGhost,
        sizeClass,
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({ className, ...props }: PaginationLinkProps) {
  const styles = usePaginationStyles();

  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="medium"
      className={mergeClassNames(styles.iconOnlyGap, className)}
      {...props}
    >
      <ChevronLeft16Regular />
      <span className={styles.prevNextText}>Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({ className, ...props }: PaginationLinkProps) {
  const styles = usePaginationStyles();

  return (
    <PaginationLink
      aria-label="Go to next page"
      size="medium"
      className={mergeClassNames(styles.iconOnlyGap, className)}
      {...props}
    >
      <span className={styles.prevNextText}>Next</span>
      <ChevronRight16Regular />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const styles = usePaginationStyles();

  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={mergeClassNames(styles.ellipsis, className)}
      {...props}
    >
      <MoreHorizontal16Regular />
      <span className={styles.srOnly}>More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
