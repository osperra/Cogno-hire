"use client";

import * as React from "react";
import {
  makeStyles,
  tokens,
  shorthands,
} from "@fluentui/react-components";
import { ChevronDown16Regular } from "@fluentui/react-icons";

type CollapsibleProps = React.HTMLAttributes<HTMLDivElement> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type CollapsibleContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
};

const CollapsibleContext =
  React.createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext() {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error(
      "CollapsibleTrigger and CollapsibleContent must be used within <Collapsible />",
    );
  }
  return ctx;
}

const useCollapsibleStyles = makeStyles({
  root: {
    display: "block",
  },
  content: {
    overflow: "hidden",
  },
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    ...shorthands.padding(
      tokens.spacingVerticalXS,
      tokens.spacingHorizontalS,
    ),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    transition: "background-color 120ms ease, border-color 120ms ease",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2,
    },
    ":focus-visible": {
      outlineStyle: "none",
      boxShadow: `0 0 0 2px ${tokens.colorStrokeFocus2}`,
    },
  },
  iconWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 150ms ease",
    color: tokens.colorNeutralForeground3,
  },
  iconOpen: {
    transform: "rotate(180deg)",
  },
  iconClosed: {
    transform: "rotate(0deg)",
  },
});


function Collapsible({
  open,
  defaultOpen,
  onOpenChange,
  children,
  className,
  ...props
}: CollapsibleProps) {
  const styles = useCollapsibleStyles();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false,
  );

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const contentId = React.useId().replace(/:/g, "");

  return (
    <CollapsibleContext.Provider
      value={{ open: isOpen, setOpen, contentId }}
    >
      <div
        data-slot="collapsible"
        className={`${styles.root} ${className ?? ""}`}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}


type CollapsibleTriggerProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>;

function CollapsibleTrigger({
  className,
  children,
  ...props
}: CollapsibleTriggerProps) {
  const styles = useCollapsibleStyles();
  const { open, setOpen, contentId } = useCollapsibleContext();

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    props.onClick?.(event);
    if (!event.defaultPrevented) {
      setOpen(!open);
    }
  };

  const iconClassName = `${styles.iconWrapper} ${
    open ? styles.iconOpen : styles.iconClosed
  }`;

  return (
    <button
      type="button"
      data-slot="collapsible-trigger"
      aria-expanded={open}
      aria-controls={contentId}
      className={`${styles.trigger} ${className ?? ""}`}
      onClick={handleClick}
      {...props}
    >
      <span>{children}</span>
      <span className={iconClassName}>
        <ChevronDown16Regular />
      </span>
    </button>
  );
}


type CollapsibleContentProps = React.HTMLAttributes<HTMLDivElement>;

function CollapsibleContent({
  className,
  children,
  ...props
}: CollapsibleContentProps) {
  const styles = useCollapsibleStyles();
  const { open, contentId } = useCollapsibleContext();

  return (
    <div
      id={contentId}
      data-slot="collapsible-content"
      className={`${styles.content} ${className ?? ""}`}
      hidden={!open}
      aria-hidden={!open}
      {...props}
    >
      {children}
    </div>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
