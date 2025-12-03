"use client";

import * as React from "react";
import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useScrollAreaStyles = makeStyles({
  root: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  viewport: {
    width: "100%",
    height: "100%",
    borderRadius: tokens.borderRadiusMedium,
    overflow: "auto",
    outlineStyle: "none",
    transitionProperty: "box-shadow, color",
    transitionDuration: tokens.durationFast,
    ":focus-visible": {
      boxShadow: `0 0 0 3px ${tokens.colorStrokeFocus2}`,
    },
    scrollBehavior: "smooth",
  },
});

const useScrollBarStyles = makeStyles({
  scrollbarBase: {
    position: "absolute",
    display: "flex",
    pointerEvents: "none",
  },
  vertical: {
    top: 0,
    bottom: 0,
    right: 0,
    width: "10px",
    ...shorthands.padding("2px"),
  },
  horizontal: {
    left: 0,
    right: 0,
    bottom: 0,
    height: "10px",
    ...shorthands.padding("2px"),
  },
  thumb: {
    flex: 1,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralStroke2,
    opacity: 0.6,
  },
});

type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  const styles = useScrollAreaStyles();

  return (
    <div
      data-slot="scroll-area"
      className={mergeClassNames(styles.root, className)}
      {...props}
    >
      <div
        data-slot="scroll-area-viewport"
        className={styles.viewport}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}

type ScrollBarProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "vertical" | "horizontal";
};

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollBarProps) {
  const styles = useScrollBarStyles();

  const baseClass =
    orientation === "vertical" ? styles.vertical : styles.horizontal;

  return (
    <div
      data-slot="scroll-area-scrollbar"
      aria-hidden="true"
      className={mergeClassNames(styles.scrollbarBase, baseClass, className)}
      {...props}
    >
      <div data-slot="scroll-area-thumb" className={styles.thumb} />
    </div>
  );
}

export { ScrollArea, ScrollBar };
