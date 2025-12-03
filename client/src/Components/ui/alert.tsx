import * as React from "react";
import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from "@fluentui/react-components";

type AlertVariant = "default" | "destructive";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
 
  icon?: React.ReactNode;
}

const useAlertStyles = makeStyles({
  root: {
    position: "relative",
    width: "100%",
    borderRadius: tokens.borderRadiusMedium,
    ...shorthands.padding("8px", "12px"),
    display: "grid",
    gridTemplateColumns: "0 1fr",
    alignItems: "flex-start",
    rowGap: "4px",
    columnGap: "12px",
    fontSize: tokens.fontSizeBase200,
    boxSizing: "border-box",
  },
  rootWithIcon: {
    gridTemplateColumns: "auto 1fr",
  },
  defaultVariant: {
    backgroundColor: tokens.colorNeutralBackground1,
 
    color: tokens.colorNeutralForeground1,
  },
  destructiveVariant: {
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorPaletteRedForeground2,
  },

  iconSlot: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: "2px",
    "& svg": {
      width: "16px",
      height: "16px",
    },
  },

  title: {
    gridColumnStart: 2,
    minHeight: "16px",
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: "-0.01em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  description: {
    gridColumnStart: 2,
    display: "grid",
    rowGap: "4px",
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    lineHeight: "1.4",
  },

  destructiveDescription: {
    color: tokens.colorPaletteRedForeground2,
  },
});

export function Alert({
  className,
  variant = "default",
  icon,
  children,
  ...props
}: AlertProps) {
  const styles = useAlertStyles();

  const hasIcon = !!icon;

  return (
    <div
      role="alert"
      data-slot="alert"
      className={mergeClasses(
        styles.root,
        hasIcon && styles.rootWithIcon,
        variant === "default" && styles.defaultVariant,
        variant === "destructive" && styles.destructiveVariant,
        className,
      )}
      {...props}
    >
      {hasIcon && <div className={styles.iconSlot}>{icon}</div>}
      {children}
    </div>
  );
}

export function AlertTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const styles = useAlertStyles();
  return (
    <div
      data-slot="alert-title"
      className={mergeClasses(styles.title, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const styles = useAlertStyles();
  return (
    <div
      data-slot="alert-description"
      className={mergeClasses(styles.description, className)}
      {...props}
    >
      {children}
    </div>
  );
}
