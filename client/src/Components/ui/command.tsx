"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import {
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { Search16Regular } from "@fluentui/react-icons";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useCommandStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },

  dialogHeaderSrOnly: {
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

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalS,
    height: "48px",
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    borderBottomColor: tokens.colorNeutralStroke1,
    paddingInline: tokens.spacingHorizontalS,
  },
  inputIcon: {
    width: "16px",
    height: "16px",
    flexShrink: 0,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    height: "36px",
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground1,
    "::placeholder": {
      color: tokens.colorNeutralForeground3,
    },
    ":disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },

  list: {
    maxHeight: "300px",
    overflowX: "hidden",
    overflowY: "auto",
    scrollPaddingBlock: tokens.spacingVerticalXXS,
  },

  empty: {
    paddingBlock: tokens.spacingVerticalL,
    textAlign: "center",
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },

  group: {
    color: tokens.colorNeutralForeground1,
    padding: tokens.spacingVerticalXXS,
    overflow: "hidden",

    "& [cmdk-group-heading]": {
      color: tokens.colorNeutralForeground3,
      paddingInline: tokens.spacingHorizontalS,
      paddingBlock: tokens.spacingVerticalXXS,
      fontSize: tokens.fontSizeBase100,
      fontWeight: tokens.fontWeightSemibold,
    },
  },

  separator: {
    height: "1px",
    marginInline: `-${tokens.spacingHorizontalXXS}`,
    backgroundColor: tokens.colorNeutralStroke2,
  },

  item: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalS,
    paddingInline: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalXS,
    fontSize: tokens.fontSizeBase200,
    cursor: "default",
    userSelect: "none",
    borderRadius: tokens.borderRadiusSmall,
    outlineStyle: "none",

    "& svg": {
      pointerEvents: "none",
      flexShrink: 0,
      width: "16px",
      height: "16px",
      color: tokens.colorNeutralForeground3,
    },

    "&[data-disabled='true']": {
      pointerEvents: "none",
      opacity: 0.5,
    },

    "&[data-selected='true']": {
      backgroundColor: tokens.colorSubtleBackgroundHover,
      color: tokens.colorNeutralForeground1,
    },
  },

  shortcut: {
    marginLeft: "auto",
    fontSize: tokens.fontSizeBase100,
    letterSpacing: "0.12em",
    color: tokens.colorNeutralForeground3,
  },
});


function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  const styles = useCommandStyles();

  return (
    <CommandPrimitive
      data-slot="command"
      className={mergeClassNames(styles.root, className)}
      {...props}
    />
  );
}


function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  const styles = useCommandStyles();

  return (
    <Dialog {...props}>
      <DialogHeader className={styles.dialogHeaderSrOnly}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent>
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}


function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  const styles = useCommandStyles();

  return (
    <div
      data-slot="command-input-wrapper"
      className={styles.inputWrapper}
    >
      <Search16Regular className={styles.inputIcon} />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={mergeClassNames(styles.input, className)}
        {...props}
      />
    </div>
  );
}


function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  const styles = useCommandStyles();

  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={mergeClassNames(styles.list, className)}
      {...props}
    />
  );
}


function CommandEmpty(
  props: React.ComponentProps<typeof CommandPrimitive.Empty>,
) {
  const styles = useCommandStyles();

  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={styles.empty}
      {...props}
    />
  );
}


function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  const styles = useCommandStyles();

  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={mergeClassNames(styles.group, className)}
      {...props}
    />
  );
}


function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  const styles = useCommandStyles();

  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={mergeClassNames(styles.separator, className)}
      {...props}
    />
  );
}


function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  const styles = useCommandStyles();

  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={mergeClassNames(styles.item, className)}
      {...props}
    />
  );
}


function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const styles = useCommandStyles();

  return (
    <span
      data-slot="command-shortcut"
      className={mergeClassNames(styles.shortcut, className)}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
