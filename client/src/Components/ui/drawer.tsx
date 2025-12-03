"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

type DrawerDirection = "top" | "bottom" | "left" | "right";

type DrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  direction: DrawerDirection;
};

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawerContext() {
  const ctx = React.useContext(DrawerContext);
  if (!ctx) {
    throw new Error(
      "DrawerTrigger, DrawerContent, DrawerOverlay, DrawerClose, etc. must be used inside <Drawer />"
    );
  }
  return ctx;
}

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useDrawerStyles = makeStyles({
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  contentBase: {
    position: "fixed",
    zIndex: 51,
    display: "flex",
    flexDirection: "column",
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    boxShadow: tokens.shadow64,
  },
  contentTop: {
    insetInline: 0,
    top: 0,
    maxHeight: "80vh",
    marginBottom: "24px",
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(
      0,
      0,
      tokens.borderRadiusLarge,
      tokens.borderRadiusLarge
    ),
  },
  contentBottom: {
    insetInline: 0,
    bottom: 0,
    maxHeight: "80vh",
    marginTop: "24px",
    ...shorthands.borderTop("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(
      tokens.borderRadiusLarge,
      tokens.borderRadiusLarge,
      0,
      0
    ),
  },
  contentLeft: {
    insetBlock: 0,
    left: 0,
    width: "75%",
    maxWidth: "400px",
    ...shorthands.borderRight("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(
      0,
      tokens.borderRadiusLarge,
      tokens.borderRadiusLarge,
      0
    ),
  },
  contentRight: {
    insetBlock: 0,
    right: 0,
    width: "75%",
    maxWidth: "400px",
    ...shorthands.borderLeft("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(
      tokens.borderRadiusLarge,
      0,
      0,
      tokens.borderRadiusLarge
    ),
  },
  handleBarWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: tokens.spacingVerticalS,
  },
  handleBar: {
    height: "8px",
    width: "100px",
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalXXS,
    padding: tokens.spacingVerticalM,
  },
  footer: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalM,
  },
  title: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    margin: 0,
  },
  description: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    margin: 0,
  },
});

type DrawerProps = React.HTMLAttributes<HTMLDivElement> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  direction?: DrawerDirection;
};

function Drawer({
  open,
  defaultOpen,
  onOpenChange,
  direction = "bottom",
  children,
  ...props
}: DrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false
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
    [isControlled, onOpenChange]
  );

  const contextValue = React.useMemo(
    () => ({ open: isOpen, setOpen, direction }),
    [isOpen, setOpen, direction]
  );

  return (
    <DrawerContext.Provider value={contextValue}>
      <div data-slot="drawer" {...props}>
        {children}
      </div>
    </DrawerContext.Provider>
  );
}

type DrawerTriggerProps = {
  asChild?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function DrawerTrigger({ asChild, children, ...props }: DrawerTriggerProps) {
  const { setOpen } = useDrawerContext();

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<
      React.HTMLAttributes<HTMLElement> & {
        onClick?: React.MouseEventHandler<HTMLElement>;
      }
    >;

    const mergedOnClick: React.MouseEventHandler<HTMLElement> = (event) => {
      child.props.onClick?.(event);
      setOpen(true);
    };

    return React.cloneElement(child, {
      ...props,
      onClick: mergedOnClick,
    });
  }

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    props.onClick?.(event);
    if (!event.defaultPrevented) {
      setOpen(true);
    }
  };

  return (
    <button
      type="button"
      data-slot="drawer-trigger"
      {...props}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

type DrawerPortalProps = {
  children?: React.ReactNode;
};

function DrawerPortal({ children }: DrawerPortalProps) {
  if (typeof document === "undefined") {
    return null;
  }
  return createPortal(
    <div data-slot="drawer-portal">{children}</div>,
    document.body
  );
}

type DrawerOverlayProps = React.HTMLAttributes<HTMLDivElement>;

function DrawerOverlay({ className, ...props }: DrawerOverlayProps) {
  const { open, setOpen } = useDrawerContext();
  const styles = useDrawerStyles();

  if (!open) return null;

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    props.onClick?.(event);
    if (!event.defaultPrevented) {
      setOpen(false);
    }
  };

  return (
    <div
      data-slot="drawer-overlay"
      className={mergeClassNames(styles.overlay, className)}
      {...props}
      onClick={handleClick}
    />
  );
}

type DrawerContentProps = React.HTMLAttributes<HTMLDivElement>;

function DrawerContent({ className, children, ...props }: DrawerContentProps) {
  const { open, direction } = useDrawerContext();
  const styles = useDrawerStyles();

  if (!open) return null;

  const directionClass =
    direction === "top"
      ? styles.contentTop
      : direction === "bottom"
      ? styles.contentBottom
      : direction === "left"
      ? styles.contentLeft
      : styles.contentRight;

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <div
        data-slot="drawer-content"
        className={mergeClassNames(
          styles.contentBase,
          directionClass,
          className
        )}
        {...props}
      >
        {direction === "bottom" && (
          <div className={styles.handleBarWrapper}>
            <div className={styles.handleBar} />
          </div>
        )}
        {children}
      </div>
    </DrawerPortal>
  );
}

type DrawerCloseProps = {
  asChild?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function DrawerClose({ asChild, children, ...props }: DrawerCloseProps) {
  const { setOpen } = useDrawerContext();

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<
      React.HTMLAttributes<HTMLElement> & {
        onClick?: React.MouseEventHandler<HTMLElement>;
      }
    >;

    const mergedOnClick: React.MouseEventHandler<HTMLElement> = (event) => {
      child.props.onClick?.(event);
      setOpen(false);
    };

    return React.cloneElement(child, {
      ...props,
      onClick: mergedOnClick,
    });
  }

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    props.onClick?.(event);
    if (!event.defaultPrevented) {
      setOpen(false);
    }
  };

  return (
    <button
      type="button"
      data-slot="drawer-close"
      {...props}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const styles = useDrawerStyles();
  return (
    <div
      data-slot="drawer-header"
      className={mergeClassNames(styles.header, className)}
      {...props}
    />
  );
}

function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const styles = useDrawerStyles();
  return (
    <div
      data-slot="drawer-footer"
      className={mergeClassNames(styles.footer, className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const styles = useDrawerStyles();
  return (
    <h2
      data-slot="drawer-title"
      className={mergeClassNames(styles.title, className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const styles = useDrawerStyles();
  return (
    <p
      data-slot="drawer-description"
      className={mergeClassNames(styles.description, className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
