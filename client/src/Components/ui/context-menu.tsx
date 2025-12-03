"use client";

import * as React from "react";
import {
  Menu,
  MenuList,
  MenuItem,
  MenuItemCheckbox,
  MenuItemRadio,
  MenuPopover,
  MenuTrigger as FluentMenuTrigger,
  MenuDivider,
  MenuGroup,
  MenuGroupHeader,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import {
  Checkmark16Regular,
  ChevronRight16Regular,
  Circle12Filled,
} from "@fluentui/react-icons";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useContextMenuStyles = makeStyles({
  popover: {
    zIndex: 50,
    minWidth: "8rem",
    maxHeight: "320px",
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow64,
    overflowY: "auto",
    overflowX: "hidden",
  },
  list: {
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalXS),
  },
  itemBase: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalS,
    fontSize: tokens.fontSizeBase200,
    cursor: "default",
    userSelect: "none",
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalS),
    outlineStyle: "none",

    "& svg": {
      pointerEvents: "none",
      flexShrink: 0,
      width: "16px",
      height: "16px",
      color: tokens.colorNeutralForeground3,
    },
  },
  item: {
    "&:hover": {
      backgroundColor: tokens.colorSubtleBackgroundHover,
      color: tokens.colorNeutralForeground1,
    },
    "&[aria-disabled='true']": {
      opacity: 0.5,
      pointerEvents: "none",
    },
  },
  itemDestructive: {
    color: tokens.colorPaletteRedForeground1,
    "& svg": {
      color: tokens.colorPaletteRedForeground1,
    },
    "&:hover": {
      backgroundColor: tokens.colorPaletteRedBackground1,
      color: tokens.colorPaletteRedForeground1,
    },
  },
  inset: {
    paddingLeft: `calc(${tokens.spacingHorizontalXXL} + ${tokens.spacingHorizontalXS})`,
  },
  checkboxIndicatorWrapper: {
    position: "absolute",
    left: tokens.spacingHorizontalS,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "14px",
    height: "14px",
    pointerEvents: "none",
  },
  radioIndicatorWrapper: {
    position: "absolute",
    left: tokens.spacingHorizontalS,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "14px",
    height: "14px",
    pointerEvents: "none",
  },
  label: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalS),
  },
  labelInset: {
    paddingLeft: `calc(${tokens.spacingHorizontalXXL} + ${tokens.spacingHorizontalXS})`,
  },
  separator: {
    height: "1px",
    marginBlock: tokens.spacingVerticalXXS,
    backgroundColor: tokens.colorNeutralStroke2,
  },
  shortcut: {
    marginLeft: "auto",
    fontSize: tokens.fontSizeBase100,
    letterSpacing: "0.12em",
    color: tokens.colorNeutralForeground3,
  },
  subTriggerChevron: {
    marginLeft: "auto",
  },
});


function ContextMenu(props: React.ComponentProps<typeof Menu>) {
  return <Menu data-slot="context-menu" {...props} />;
}


function ContextMenuTrigger({
  children,
  ...props
}: React.ComponentProps<typeof FluentMenuTrigger>) {
  return (
    <FluentMenuTrigger data-slot="context-menu-trigger" {...props}>
      {children}
    </FluentMenuTrigger>
  );
}


function ContextMenuGroup(props: React.ComponentProps<typeof MenuGroup>) {
  return <MenuGroup data-slot="context-menu-group" {...props} />;
}

function ContextMenuRadioGroup(props: React.ComponentProps<typeof MenuGroup>) {
  return (
    <MenuGroup
      data-slot="context-menu-radio-group"
      role="radiogroup"
      {...props}
    />
  );
}


function ContextMenuPortal(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="context-menu-portal" {...props} />;
}


type ContextMenuSubProps = React.ComponentProps<typeof Menu>;

function ContextMenuSub(props: ContextMenuSubProps) {
  return <Menu data-slot="context-menu-sub" {...props} />;
}

type ContextMenuSubTriggerProps = React.ComponentProps<typeof MenuItem> & {
  inset?: boolean;
};

function ContextMenuSubTrigger({
  inset,
  className,
  children,
  ...props
}: ContextMenuSubTriggerProps) {
  const styles = useContextMenuStyles();

  return (
    <MenuItem
      data-slot="context-menu-sub-trigger"
      aria-haspopup="menu"
      className={mergeClassNames(
        styles.itemBase,
        styles.item,
        inset && styles.inset,
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight16Regular className={styles.subTriggerChevron} />
    </MenuItem>
  );
}

type ContextMenuSubContentProps = React.ComponentProps<typeof MenuPopover>;

function ContextMenuSubContent({
  className,
  children,
  ...props
}: ContextMenuSubContentProps) {
  const styles = useContextMenuStyles();

  return (
    <MenuPopover
      data-slot="context-menu-sub-content"
      className={mergeClassNames(styles.popover, className)}
      {...props}
    >
      <MenuList className={styles.list}>{children}</MenuList>
    </MenuPopover>
  );
}


type ContextMenuContentProps = React.ComponentProps<typeof MenuPopover>;

function ContextMenuContent({
  className,
  children,
  ...props
}: ContextMenuContentProps) {
  const styles = useContextMenuStyles();

  return (
    <MenuPopover
      data-slot="context-menu-content"
      className={mergeClassNames(styles.popover, className)}
      {...props}
    >
      <MenuList className={styles.list}>{children}</MenuList>
    </MenuPopover>
  );
}


type ContextMenuItemProps = React.ComponentProps<typeof MenuItem> & {
  inset?: boolean;
  variant?: "default" | "destructive";
};

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: ContextMenuItemProps) {
  const styles = useContextMenuStyles();

  return (
    <MenuItem
      data-slot="context-menu-item"
      data-variant={variant}
      className={mergeClassNames(
        styles.itemBase,
        styles.item,
        inset && styles.inset,
        variant === "destructive" && styles.itemDestructive,
        className,
      )}
      {...props}
    />
  );
}


type ContextMenuCheckboxItemProps = Omit<
  React.ComponentProps<typeof MenuItemCheckbox>,
  "checked"
> & {
  checked?: boolean;
};

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: ContextMenuCheckboxItemProps) {
  const styles = useContextMenuStyles();

  return (
    <MenuItemCheckbox
      data-slot="context-menu-checkbox-item"
      className={mergeClassNames(styles.itemBase, styles.item, className)}
      {...props}
    >
      <span className={styles.checkboxIndicatorWrapper}>
        {checked && <Checkmark16Regular />}
      </span>
      {children}
    </MenuItemCheckbox>
  );
}


type ContextMenuRadioItemProps = Omit<
  React.ComponentProps<typeof MenuItemRadio>,
  "checked"
> & {
  checked?: boolean;
};

function ContextMenuRadioItem({
  className,
  children,
  checked,
  ...props
}: ContextMenuRadioItemProps) {
  const styles = useContextMenuStyles();

  return (
    <MenuItemRadio
      data-slot="context-menu-radio-item"
      className={mergeClassNames(styles.itemBase, styles.item, className)}
      {...props}
    >
      <span className={styles.radioIndicatorWrapper}>
        {checked && <Circle12Filled />}
      </span>
      {children}
    </MenuItemRadio>
  );
}


type ContextMenuLabelProps = React.ComponentProps<typeof MenuGroupHeader> & {
  inset?: boolean;
};

function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuLabelProps) {
  const styles = useContextMenuStyles();

  return (
    <MenuGroupHeader
      data-slot="context-menu-label"
      className={mergeClassNames(
        styles.label,
        inset && styles.labelInset,
        className,
      )}
      {...props}
    />
  );
}


type ContextMenuSeparatorProps = React.ComponentProps<typeof MenuDivider>;

function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuSeparatorProps) {
  const styles = useContextMenuStyles();

  return (
    <MenuDivider
      data-slot="context-menu-separator"
      className={mergeClassNames(styles.separator, className)}
      {...props}
    />
  );
}


function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const styles = useContextMenuStyles();

  return (
    <span
      data-slot="context-menu-shortcut"
      className={mergeClassNames(styles.shortcut, className)}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
