"use client";

import * as React from "react";
import {
  ToggleButton,
  type ToggleButtonProps,
  makeStyles,
  tokens,
} from "@fluentui/react-components";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

type ToggleVariant = "default" | "outline";
type ToggleSize = "small" | "medium";
type ToggleGroupType = "single" | "multiple";

interface ToggleGroupContextValue {
  type: ToggleGroupType;
  variant?: ToggleVariant;
  size?: ToggleSize;
  selectedSingle?: string;
  selectedMultiple?: string[];
  onItemToggle: (itemValue: string) => void;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(
  null
);

function useToggleGroupContext(): ToggleGroupContextValue {
  const ctx = React.useContext(ToggleGroupContext);
  if (!ctx) {
    throw new Error("ToggleGroupItem must be used within <ToggleGroup>.");
  }
  return ctx;
}

export interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: ToggleGroupType;
  variant?: ToggleVariant;
  size?: ToggleSize;

  value?: string;
  defaultValue?: string;

  values?: string[];
  defaultValues?: string[];

  onValueChange?: (value: string | string[] | undefined) => void;
}

export interface ToggleGroupItemProps
  extends Omit<ToggleButtonProps, "checked" | "onClick" | "as" | "href"> {
  value: string;
  variant?: ToggleVariant;
  size?: ToggleSize;
}

const useToggleGroupStyles = makeStyles({
  root: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: tokens.borderRadiusMedium,
    overflow: "hidden",
  },
  outline: {
    boxShadow: tokens.shadow4,
    borderRadius: tokens.borderRadiusMedium,
  },
});

const useToggleItemStyles = makeStyles({
  base: {
    minWidth: 0,
    flex: 1,
  },
});

function mapVariantToAppearance(
  variant?: ToggleVariant
): ToggleButtonProps["appearance"] {
  if (variant === "outline") return "outline";
  return "subtle";
}

function mapSize(size?: ToggleSize): ToggleButtonProps["size"] {
  if (size === "small") return "small";
  return "medium";
}

function ToggleGroup({
  className,
  children,
  type = "single",
  variant = "default",
  size = "medium",
  value,
  defaultValue,
  values,
  defaultValues,
  onValueChange,
  ...rest
}: ToggleGroupProps) {
  const styles = useToggleGroupStyles();

  const isSingle = type === "single";

  const [internalSingle, setInternalSingle] = React.useState<
    string | undefined
  >(defaultValue);
  const [internalMultiple, setInternalMultiple] = React.useState<string[]>(
    defaultValues ?? []
  );

  const selectedSingle = value !== undefined ? value : internalSingle;
  const selectedMultiple = values ?? internalMultiple;

  const handleItemToggle = React.useCallback(
    (itemValue: string) => {
      if (isSingle) {
        const next = selectedSingle === itemValue ? undefined : itemValue;

        if (value === undefined) {
          setInternalSingle(next);
        }
        onValueChange?.(next);
      } else {
        const exists = selectedMultiple.includes(itemValue);
        const nextArray = exists
          ? selectedMultiple.filter((v) => v !== itemValue)
          : [...selectedMultiple, itemValue];

        if (!values) {
          setInternalMultiple(nextArray);
        }
        onValueChange?.(nextArray);
      }
    },
    [isSingle, selectedSingle, selectedMultiple, value, values, onValueChange]
  );

  const contextValue: ToggleGroupContextValue = {
    type,
    variant,
    size,
    selectedSingle,
    selectedMultiple,
    onItemToggle: handleItemToggle,
  };

  const rootClasses = mergeClassNames(
    styles.root,
    variant === "outline" && styles.outline,
    className
  );

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <div
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        className={rootClasses}
        {...rest}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

function ToggleGroupItem({
  className,
  value,
  variant,
  size,
  children,
  ...rest
}: ToggleGroupItemProps) {
  const ctx = useToggleGroupContext();
  const itemStyles = useToggleItemStyles();

  const effectiveVariant = ctx.variant ?? variant ?? "default";
  const effectiveSize = ctx.size ?? size ?? "medium";

  const checked =
    ctx.type === "single"
      ? ctx.selectedSingle === value
      : ctx.selectedMultiple?.includes(value);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!event.defaultPrevented) {
      ctx.onItemToggle(value);
    }
  };

  const appearance = mapVariantToAppearance(effectiveVariant);
  const fluentSize = mapSize(effectiveSize);

  const toggleButtonProps = {
    "data-slot": "toggle-group-item",
    appearance,
    size: fluentSize,
    checked,
    onClick: handleClick,
    className: mergeClassNames(itemStyles.base, className),
    ...rest,
  };
  return (
    <ToggleButton as="button" {...(toggleButtonProps as ToggleButtonProps)}>
      {children}
    </ToggleButton>
  );
}

export { ToggleGroup, ToggleGroupItem };
