"use client";

import * as React from "react";
import { ProgressBar, makeStyles } from "@fluentui/react-components";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useProgressStyles = makeStyles({
  root: {
    width: "100%",
  },
});

export interface ProgressProps
  extends Omit<React.ComponentProps<typeof ProgressBar>, "max" | "value"> {
  value?: number;
  max?: number;
  className?: string;
}

function Progress({ className, value, max = 100, ...props }: ProgressProps) {
  const styles = useProgressStyles();

  const safeValue =
    typeof value === "number" ? Math.min(Math.max(value, 0), max) : undefined;

  return (
    <div
      data-slot="progress"
      className={mergeClassNames(styles.root, className)}
    >
      <ProgressBar
        value={safeValue}
        max={max}
        thickness="medium"
        color="brand"
        {...props}
      />
    </div>
  );
}

export { Progress };
