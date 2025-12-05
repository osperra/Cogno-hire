import * as React from "react";
import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from "@fluentui/react-components";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  as?: React.ElementType;
}

const useBadgeStyles = makeStyles({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.border("1px", "solid", "transparent"),
    ...shorthands.padding("2px", "8px"), 
    borderRadius: tokens.borderRadiusLarge,
    fontSize: tokens.fontSizeBase100, 
    fontWeight: tokens.fontWeightMedium,
    lineHeight: 1,
    width: "fit-content",
    whiteSpace: "nowrap",
    flexShrink: 0,
    columnGap: "4px",
    transitionProperty: "color, box-shadow, background-color, border-color",
    transitionDuration: tokens.durationFast,
    overflow: "hidden",
    "& svg": {
      width: "0.75rem",
      height: "0.75rem",
      pointerEvents: "none",
    },
    ":focus-visible": {
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineColor: tokens.colorStrokeFocus2,
      outlineOffset: "2px",
    },
  },

  default: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundInverted,
    ":hover": {
      backgroundColor: tokens.colorBrandBackgroundHover,
    },
  },

  secondary: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground1,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground4,
    },
  },

  destructive: {
    backgroundColor: tokens.colorPaletteRedBackground3,
    color: tokens.colorPaletteRedForegroundInverted,
    ":hover": {
      backgroundColor: tokens.colorPaletteRedBackground2,
    },
    ":focus-visible": {
      outlineColor: tokens.colorPaletteRedBorderActive,
    },
  },

  outline: {
    backgroundColor: "transparent",
    color: tokens.colorNeutralForeground1,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
});

function Badge({
  className,
  variant = "default",
  as: Component = "span",
  ...props
}: BadgeProps) {
  const styles = useBadgeStyles();

  return (
    <Component
      data-slot="badge"
      className={mergeClasses(
        styles.base,
        variant === "default" && styles.default,
        variant === "secondary" && styles.secondary,
        variant === "destructive" && styles.destructive,
        variant === "outline" && styles.outline,
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
