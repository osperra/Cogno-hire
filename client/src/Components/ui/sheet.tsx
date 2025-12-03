"use client";

import * as React from "react";
import {
  Button,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { Dismiss16Regular } from "@fluentui/react-icons";

// ---------------------------------------------------------------------
// tiny helper instead of `cn`
// ---------------------------------------------------------------------
function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------
// Types & context
// ---------------------------------------------------------------------

type SheetSide = "top" | "right" | "bottom" | "left";

type SheetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext(): SheetContextValue {
  const ctx = React.useContext(SheetContext);
  if (!ctx) {
    throw new Error("Sheet components must be used within <Sheet>.");
  }
  return ctx;
}

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Sheet(props: SheetProps) {
  const { open, defaultOpen, onOpenChange, children } = props;

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState<boolean>(
    defaultOpen ?? false,
  );

  const currentOpen = isControlled ? Boolean(open) : internalOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      if (onOpenChange) {
        onOpenChange(next);
      }
    },
    [isControlled, onOpenChange],
  );

  const contextValue: SheetContextValue = React.useMemo(
    () => ({
      open: currentOpen,
      setOpen,
    }),
    [currentOpen, setOpen],
  );

  return (
    <SheetContext.Provider value={contextValue}>
      {children}
    </SheetContext.Provider>
  );
}

// ---------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------

const useSheetStyles = makeStyles({
  overlay: {
    position: "fixed",
    inset: "0",
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 1000,
  },
  contentBase: {
    position: "fixed",
    zIndex: 1001,
    display: "flex",
    flexDirection: "column",
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow64,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    maxHeight: "100vh",
  },
  right: {
    top: 0,
    bottom: 0,
    right: 0,
    width: "75%",
    maxWidth: "24rem",
    ...shorthands.borderRadius("0"),
    borderLeft: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  left: {
    top: 0,
    bottom: 0,
    left: 0,
    width: "75%",
    maxWidth: "24rem",
    ...shorthands.borderRadius("0"),
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  top: {
    top: 0,
    left: 0,
    right: 0,
    height: "auto",
    maxHeight: "80vh",
    ...shorthands.borderRadius("0"),
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  bottom: {
    bottom: 0,
    left: 0,
    right: 0,
    height: "auto",
    maxHeight: "80vh",
    ...shorthands.borderRadius("0"),
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  header: {
    padding: tokens.spacingHorizontalM,
    paddingBottom: tokens.spacingHorizontalS,
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalXS,
  },
  footer: {
    marginTop: "auto",
    padding: tokens.spacingHorizontalM,
    paddingTop: tokens.spacingHorizontalS,
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalXS,
  },
  title: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  description: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  closeButtonWrapper: {
    position: "absolute",
    top: tokens.spacingVerticalS,
    right: tokens.spacingHorizontalS,
  },
});

// ---------------------------------------------------------------------
// Trigger / Close
// ---------------------------------------------------------------------

type ClickableChildProps = {
  onClick?: React.MouseEventHandler<HTMLElement>;
};

export interface SheetTriggerProps {
  children: React.ReactElement<ClickableChildProps>;
}

function SheetTrigger({ children }: SheetTriggerProps) {
  const { setOpen } = useSheetContext();

  const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
    if (children.props.onClick) {
      children.props.onClick(event);
    }
    if (!event.defaultPrevented) {
      setOpen(true);
    }
  };

  return React.cloneElement(children, {
    onClick: handleClick,
  });
}

export interface SheetCloseProps {
  children: React.ReactElement<ClickableChildProps>;
}

function SheetClose({ children }: SheetCloseProps) {
  const { setOpen } = useSheetContext();

  const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
    if (children.props.onClick) {
      children.props.onClick(event);
    }
    if (!event.defaultPrevented) {
      setOpen(false);
    }
  };

  return React.cloneElement(children, {
    onClick: handleClick,
  });
}

// ---------------------------------------------------------------------
// Content (the actual “sheet”)
// ---------------------------------------------------------------------

export interface SheetContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: SheetSide;
}

function SheetContent(props: SheetContentProps) {
  const { side = "right", className, children, ...rest } = props;
  const { open, setOpen } = useSheetContext();
  const styles = useSheetStyles();

  if (!open) {
    return null;
  }

  const sideClass =
    side === "right"
      ? styles.right
      : side === "left"
      ? styles.left
      : side === "top"
      ? styles.top
      : styles.bottom;

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (
    event,
  ) => {
    // clicking on the background closes the sheet
    if (event.target === event.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <>
      <div
        data-slot="sheet-overlay"
        className={styles.overlay}
        onClick={handleOverlayClick}
      />
      <div
        data-slot="sheet-content"
        className={mergeClassNames(styles.contentBase, sideClass, className)}
        {...rest}
      >
        {/* built-in close button in the top-right corner */}
        <div className={styles.closeButtonWrapper}>
          <Button
            appearance="subtle"
            size="small"
            icon={<Dismiss16Regular />}
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
        </div>
        {children}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------
// Header / Footer / Title / Description
// ---------------------------------------------------------------------

export type SheetHeaderProps = React.HTMLAttributes<HTMLDivElement>;

function SheetHeader({ className, ...rest }: SheetHeaderProps) {
  const styles = useSheetStyles();

  return (
    <div
      data-slot="sheet-header"
      className={mergeClassNames(styles.header, className)}
      {...rest}
    />
  );
}

export type SheetFooterProps = React.HTMLAttributes<HTMLDivElement>;

function SheetFooter({ className, ...rest }: SheetFooterProps) {
  const styles = useSheetStyles();

  return (
    <div
      data-slot="sheet-footer"
      className={mergeClassNames(styles.footer, className)}
      {...rest}
    />
  );
}

export type SheetTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

function SheetTitle({ className, ...rest }: SheetTitleProps) {
  const styles = useSheetStyles();

  return (
    <h2
      data-slot="sheet-title"
      className={mergeClassNames(styles.title, className)}
      {...rest}
    />
  );
}

export type SheetDescriptionProps =
  React.HTMLAttributes<HTMLParagraphElement>;

function SheetDescription({ className, ...rest }: SheetDescriptionProps) {
  const styles = useSheetStyles();

  return (
    <p
      data-slot="sheet-description"
      className={mergeClassNames(styles.description, className)}
      {...rest}
    />
  );
}

// ---------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
