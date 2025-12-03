"use client";

import * as React from "react";
import {
  Dialog as FluentDialog,
  DialogSurface,
  DialogBody,
  DialogTrigger as FluentDialogTrigger,
  type DialogProps as FluentDialogProps,
  Button,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { Dismiss16Regular } from "@fluentui/react-icons";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useDialogStyles = makeStyles({
  surface: {
    maxWidth: "640px",
    width: "calc(100% - 2rem)",
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    boxShadow: tokens.shadow64,
    display: "grid",
    rowGap: tokens.spacingVerticalM,
  },
  closeButton: {
    position: "absolute",
    top: tokens.spacingVerticalS,
    right: tokens.spacingHorizontalS,
    minWidth: "auto",
    padding: tokens.spacingHorizontalXS,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalXS,
    textAlign: "left",
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    columnGap: tokens.spacingHorizontalS,
    justifyContent: "flex-end",
    marginTop: tokens.spacingVerticalM,
  },
  title: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: "1.2",
    margin: 0,
  },
  description: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    margin: 0,
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  },
});


function Dialog(props: FluentDialogProps) {
  return <FluentDialog data-slot="dialog" {...props} />;
}


function DialogTrigger(
  props: React.ComponentProps<typeof FluentDialogTrigger>,
) {
  return (
    <FluentDialogTrigger data-slot="dialog-trigger" {...props} />
  );
}


function DialogPortal(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="dialog-portal" {...props} />
  );
}


type DialogCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function DialogClose({ className, children, ...props }: DialogCloseProps) {
  const styles = useDialogStyles();

  return (
    <FluentDialogTrigger action="close">
      <Button
        data-slot="dialog-close"
        appearance="subtle"
        size="small"
        className={mergeClassNames(styles.closeButton, className)}
        {...props}
      >
        {children ?? <Dismiss16Regular />}
      </Button>
    </FluentDialogTrigger>
  );
}


function DialogOverlay(
  props: React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div
      data-slot="dialog-overlay"
      {...props}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        ...(props.style || {}),
      }}
    />
  );
}


type DialogContentProps = React.ComponentProps<typeof DialogSurface>;

function DialogContent({
  className,
  children,
  ...props
}: DialogContentProps) {
  const styles = useDialogStyles();

  return (
    <DialogPortal>
      <DialogSurface
        data-slot="dialog-content"
        className={mergeClassNames(styles.surface, className)}
        {...props}
      >
        <DialogBody>{children}</DialogBody>
      </DialogSurface>
    </DialogPortal>
  );
}


function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const styles = useDialogStyles();

  return (
    <div
      data-slot="dialog-header"
      className={mergeClassNames(styles.header, className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const styles = useDialogStyles();

  return (
    <div
      data-slot="dialog-footer"
      className={mergeClassNames(styles.footer, className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const styles = useDialogStyles();

  return (
    <h2
      data-slot="dialog-title"
      className={mergeClassNames(styles.title, className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const styles = useDialogStyles();

  return (
    <p
      data-slot="dialog-description"
      className={mergeClassNames(styles.description, className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
