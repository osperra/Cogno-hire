"use client";

import * as React from "react";
import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useInputStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    minWidth: 0,
    height: "36px",

    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    paddingInline: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalXS,

    fontSize: tokens.fontSizeBase200,
    lineHeight: "20px",

    transitionProperty: "color, box-shadow, border-color, background-color",
    transitionDuration: "150ms",
    outlineStyle: "none",

    "::placeholder": {
      color: tokens.colorNeutralForeground3,
    },

    "::selection": {
      backgroundColor: tokens.colorBrandBackground,
      color: tokens.colorNeutralForegroundInverted,
    },

    ":focus-visible": {
      boxShadow: `0 0 0 3px ${tokens.colorBrandStroke1}`,
      ...shorthands.borderColor(tokens.colorBrandStroke1),
    },

    ":disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },

    "[aria-invalid='true']&": {
      ...shorthands.borderColor(tokens.colorPaletteRedBorder2),
      boxShadow: `0 0 0 3px rgba(209, 52, 56, 0.25)`,
    },

    "::file-selector-button": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      height: "28px",
      paddingInline: tokens.spacingHorizontalS,
      border: "none",
      backgroundColor: "transparent",
      fontSize: tokens.fontSizeBase200,
      fontWeight: tokens.fontWeightSemibold,
      color: tokens.colorNeutralForeground1,
      cursor: "pointer",
    },
  },
});

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const styles = useInputStyles();

  return (
    <input
      type={type}
      data-slot="input"
      className={mergeClassNames(styles.root, className)}
      {...props}
    />
  );
}

export { Input };
