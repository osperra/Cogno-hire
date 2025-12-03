"use client";

import * as React from "react";
import {
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";

function mergeClassNames(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type ButtonSize = "default" | "sm" | "lg" | "icon";

const useButtonStyles = makeStyles({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: "8px",
    whiteSpace: "nowrap",
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    ...shorthands.border("1px", "solid", "transparent"),
    transitionProperty:
      "background-color, color, border-color, box-shadow, transform",
    transitionDuration: "150ms",
    cursor: "pointer",
    outlineStyle: "none",
    flexShrink: 0,

    ":disabled": {
      cursor: "default",
      opacity: 0.5,
      pointerEvents: "none",
    },

    "& svg": {
      pointerEvents: "none",
      flexShrink: 0,
      width: "16px",
      height: "16px",
    },

    ":focus-visible": {
      boxShadow: `0 0 0 3px ${tokens.colorBrandStroke1}`,
    },

    "[aria-invalid='true']&": {
      ...shorthands.border("1px", "solid", "#d13438"),
      boxShadow: "0 0 0 3px rgba(209, 52, 56, 0.3)",
    },
  },

  variant_default: {
    backgroundColor: tokens.colorBrandBackground,
    color: "#ffffff",
    ":hover": {
      backgroundColor: tokens.colorBrandBackgroundHover,
    },
    ":active": {
      backgroundColor: tokens.colorBrandBackgroundPressed,
    },
  },
  variant_destructive: {
    backgroundColor: "#d13438",
    color: "#ffffff",
    ":hover": {
      backgroundColor: "#b7252c",
    },
    ":active": {
      backgroundColor: "#9f1f25",
    },
  },
  variant_outline: {
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  variant_secondary: {
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  variant_ghost: {
    backgroundColor: "transparent",
    color: tokens.colorNeutralForeground2,
    ":hover": {
      backgroundColor: tokens.colorSubtleBackgroundHover,
      color: tokens.colorNeutralForeground1,
    },
  },
  variant_link: {
    backgroundColor: "transparent",
    color: tokens.colorBrandForegroundLink,
    textDecoration: "none",
    ":hover": {
      textDecoration: "underline",
    },
  },

  size_default: {
    height: "36px",
    paddingInline: "16px",
  },
  size_sm: {
    height: "32px",
    paddingInline: "12px",
    columnGap: "6px",
    borderRadius: tokens.borderRadiusSmall,
  },
  size_lg: {
    height: "40px",
    paddingInline: "20px",
  },
  size_icon: {
    width: "36px",
    height: "36px",
    paddingInline: "0",
    justifyContent: "center",
  },
});

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

function useButtonVariants(options: ButtonStyleOptions = {}) {
  const { variant = "default", size = "default", className } = options;
  const styles = useButtonStyles();

  const variantClass =
    {
      default: styles.variant_default,
      destructive: styles.variant_destructive,
      outline: styles.variant_outline,
      secondary: styles.variant_secondary,
      ghost: styles.variant_ghost,
      link: styles.variant_link,
    }[variant] ?? styles.variant_default;

  const sizeClass =
    {
      default: styles.size_default,
      sm: styles.size_sm,
      lg: styles.size_lg,
      icon: styles.size_icon,
    }[size] ?? styles.size_default;

  return mergeClassNames(styles.base, variantClass, sizeClass, className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

type ButtonChildProps = React.HTMLAttributes<HTMLElement> & {
  "data-slot"?: string;
};

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const composedClassName = useButtonVariants({ variant, size, className });

  if (asChild && React.isValidElement<ButtonChildProps>(children)) {
    const child = children as React.ReactElement<ButtonChildProps>;

    return React.cloneElement<ButtonChildProps>(child, {
      ...child.props,
      ...(props as React.HTMLAttributes<HTMLElement>),
      "data-slot": "button",
      className: mergeClassNames(
        composedClassName,
        child.props.className,
      ),
    });
  }

  return (
    <button data-slot="button" className={composedClassName} {...props}>
      {children}
    </button>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, useButtonVariants as buttonVariants };
