"use client";

import * as React from "react";
import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

type TabsContextValue = {
  value: string | undefined;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = React.useContext(TabsContext);
  if (!ctx) {
    throw new Error("TabsTrigger and TabsContent must be used within <Tabs>.");
  }
  return ctx;
}

const useTabsStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalS,
  },
  list: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-start",
    columnGap: tokens.spacingHorizontalXXS,
    padding: tokens.spacingHorizontalXXS,
    height: "36px",
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
  },
  triggerBase: {
    flex: 1,
    minWidth: "0",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: tokens.spacingHorizontalXS,
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalXS,
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    backgroundColor: "transparent",
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    whiteSpace: "nowrap",
    cursor: "pointer",
    outlineStyle: "none",
    transitionProperty: "background-color, box-shadow, color, border-color",
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,

    ":disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },

    ":focus-visible": {
      boxShadow: `0 0 0 3px ${tokens.colorStrokeFocus2}`,
    },
  },
  triggerActive: {
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
  },
  content: {
    flex: 1,
    outline: "none",
  },
});

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function Tabs({
  className,
  value,
  defaultValue,
  onValueChange,
  children,
  ...rest
}: TabsProps) {
  const styles = useTabsStyles();

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    defaultValue
  );

  const currentValue = isControlled ? value : internalValue;

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const contextValue = React.useMemo(
    () => ({
      value: currentValue,
      setValue,
    }),
    [currentValue, setValue]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        data-slot="tabs"
        className={mergeClassNames(styles.root, className)}
        {...rest}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

function TabsList({ className, ...rest }: TabsListProps) {
  const styles = useTabsStyles();

  return (
    <div
      data-slot="tabs-list"
      role="tablist"
      className={mergeClassNames(styles.list, className)}
      {...rest}
    />
  );
}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function TabsTrigger({
  className,
  value,
  disabled,
  ...rest
}: TabsTriggerProps) {
  const styles = useTabsStyles();
  const { value: selectedValue, setValue } = useTabsContext();

  const isActive = selectedValue === value;

  const tabId = `tab-${value}`;
  const panelId = `tabpanel-${value}`;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    rest.onClick?.(event);
    if (!event.defaultPrevented && !disabled) {
      setValue(value);
    }
  };

  return (
    <button
      type="button"
      id={tabId}
      role="tab"
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      data-slot="tabs-trigger"
      data-state={isActive ? "active" : "inactive"}
      className={mergeClassNames(
        styles.triggerBase,
        isActive && styles.triggerActive,
        className
      )}
      onClick={handleClick}
      {...rest}
    />
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({ className, value, ...rest }: TabsContentProps) {
  const styles = useTabsStyles();
  const { value: selectedValue } = useTabsContext();

  const tabId = `tab-${value}`;
  const panelId = `tabpanel-${value}`;
  const isActive = selectedValue === value;

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      hidden={!isActive}
      data-slot="tabs-content"
      className={mergeClassNames(styles.content, className)}
      {...rest}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
