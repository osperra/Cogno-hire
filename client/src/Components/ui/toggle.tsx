"use client";

import * as React from "react";
import {
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}


type ToggleVariant = "default" | "outline";
type ToggleSize = "default" | "sm" | "lg";

export interface ToggleProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "aria-pressed"
  > {
  variant?: ToggleVariant;
  size?: ToggleSize;

  pressed?: boolean;

  defaultPressed?: boolean;

  onPressedChange?: (pressed: boolean) => void;
}

const useToggleStyles = makeStyles({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: tokens.spacingHorizontalXS,
    cursor: "pointer",
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    whiteSpace: "nowrap",
    transitionProperty: "background-color, color, box-shadow, border-color",
    transitionDuration: tokens.durationFast,
    backgroundColor: "transparent",
    color: tokens.colorNeutralForeground1,

    ":disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },

  variantDefault: {
    backgroundColor: "transparent",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },

  variantOutline: {
    backgroundColor: "transparent",
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },

  sizeDefault: {
    minWidth: "2.25rem",
    height: "2.25rem",
    paddingInline: tokens.spacingHorizontalS,
  },
  sizeSm: {
    minWidth: "2rem",
    height: "2rem",
    paddingInline: tokens.spacingHorizontalXS,
  },
  sizeLg: {
    minWidth: "2.5rem",
    height: "2.5rem",
    paddingInline: tokens.spacingHorizontalM,
  },

  pressed: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
});

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      pressed,
      defaultPressed,
      onPressedChange,
      onClick,
      type = "button",
      ...rest
    },
    ref,
  ) => {
    const styles = useToggleStyles();

    const isControlled = pressed !== undefined;
    const [internalPressed, setInternalPressed] = React.useState<boolean>(
      defaultPressed ?? false,
    );

    const isPressed = isControlled ? Boolean(pressed) : internalPressed;

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      if (onClick) {
        onClick(event);
      }
      if (event.defaultPrevented) return;

      const next = !isPressed;

      if (!isControlled) {
        setInternalPressed(next);
      }
      if (onPressedChange) {
        onPressedChange(next);
      }
    };

    return (
      <button
        data-slot="toggle"
        ref={ref}
        type={type}
        aria-pressed={isPressed}
        className={mergeClassNames(
          styles.base,
          variant === "outline" ? styles.variantOutline : styles.variantDefault,
          size === "sm"
            ? styles.sizeSm
            : size === "lg"
            ? styles.sizeLg
            : styles.sizeDefault,
          isPressed && styles.pressed,
          className,
        )}
        onClick={handleClick}
        {...rest}
      />
    );
  },
);

Toggle.displayName = "Toggle";

export { Toggle };
