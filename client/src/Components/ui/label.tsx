"use client";

import * as React from "react";
import {
  Label as FluentLabel,
  makeStyles,
  tokens,
} from "@fluentui/react-components";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
) {
  return classes.filter(Boolean).join(" ");
}

const useLabelStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: "1",
    userSelect: "none",

    "[data-disabled='true'] &": {
      opacity: 0.5,
      pointerEvents: "none",
    },

    ".peer:disabled ~ &": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
});

type LabelProps = React.ComponentProps<typeof FluentLabel>;

function Label({ className, ...props }: LabelProps) {
  const styles = useLabelStyles();

  return (
    <FluentLabel
      data-slot="label"
      className={mergeClassNames(styles.root, className)}
      {...props}
    />
  );
}

export { Label };
