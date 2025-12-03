"use client";

import * as React from "react";
import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useSkeletonStyles = makeStyles({
  base: {
    backgroundColor: tokens.colorNeutralBackground4,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
});

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const styles = useSkeletonStyles();

  return (
    <div
      data-slot="skeleton"
      className={mergeClassNames(styles.base, className)}
      {...props}
    />
  );
}
