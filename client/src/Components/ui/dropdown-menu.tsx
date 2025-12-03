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

const useDropdownMenuStyles = makeStyles({
  content: {
    zIndex: 50,
    minWidth: "8rem",
    maxHeight: "320px",
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    boxShadow: tokens.shadow64,
    overflowY: "auto",
    overflowX: "hidden",
    padding: tokens.spacingHorizontalXXS,
  },
  list: {
    padding: 0,
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
    marginInline: `-${tokens.spacingHorizontalXXS}`,
    backgroundColor: tokens.colorNeutralStroke2,
  },
  shortcut: {
    marginLeft: "auto",
    fontSize: tokens.fontSizeBase100,
    letterSpacing: "0.12em",
    color: tokens.colorNeutralForeground3,
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
  subTriggerChevron: {
    marginLeft: "auto",
  },
});


function DropdownMenu(props: React.ComponentProps<typeof Menu>) {
  return <Menu data-slot="dropdown-menu" {...props} />;
}


function DropdownMenuPortal(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="dropdown-menu-portal" {...props} />;
}


function DropdownMenuTrigger(
  props: React.ComponentProps<typeof FluentMenuTrigger>,
) {
  return (
    <FluentMenuTrigger data-slot="dropdown-menu-trigger" {...props}>
      {props.children}
    </FluentMenuTrigger>
  );
}


type DropdownMenuContentProps = React.ComponentProps<typeof MenuPopover> & {
  sideOffset?: number; 
};

function DropdownMenuContent({
  className,
  children,
  sideOffset, // eslint-disable-line @typescript-eslint/no-unused-vars
  ...props
}: DropdownMenuContentProps) {
  const styles = useDropdownMenuStyles();

  return (
    <MenuPopover
      data-slot="dropdown-menu-content"
      className={mergeClassNames(styles.content, className)}
      {...props}
    >
      <MenuList className={styles.list}>{children}</MenuList>
    </MenuPopover>
  );
}


function DropdownMenuGroup(props: React.ComponentProps<typeof MenuGroup>) {
  return <MenuGroup data-slot="dropdown-menu-group" {...props} />;
}


type DropdownMenuItemProps = React.ComponentProps<typeof MenuItem> & {
  inset?: boolean;
  variant?: "default" | "destructive";
};

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: DropdownMenuItemProps) {
  const styles = useDropdownMenuStyles();

  return (
    <MenuItem
      data-slot="dropdown-menu-item"
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


type DropdownMenuCheckboxItemProps =
  React.ComponentProps<typeof MenuItemCheckbox> & {
    checked?: boolean;
  };

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const styles = useDropdownMenuStyles();

  return (
    <MenuItemCheckbox
      data-slot="dropdown-menu-checkbox-item"
    
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


function DropdownMenuRadioGroup(
  props: React.ComponentProps<typeof MenuGroup>,
) {
  return (
    <MenuGroup
      data-slot="dropdown-menu-radio-group"
      role="radiogroup"
      {...props}
    />
  );
}


type DropdownMenuRadioItemProps =
  React.ComponentProps<typeof MenuItemRadio> & {
    checked?: boolean;
  };

function DropdownMenuRadioItem({
  className,
  children,
  checked,
  ...props
}: DropdownMenuRadioItemProps) {
  const styles = useDropdownMenuStyles();

  return (
    <MenuItemRadio
      data-slot="dropdown-menu-radio-item"
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


type DropdownMenuLabelProps = React.ComponentProps<typeof MenuGroupHeader> & {
  inset?: boolean;
};

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: DropdownMenuLabelProps) {
  const styles = useDropdownMenuStyles();

  return (
    <MenuGroupHeader
      data-slot="dropdown-menu-label"
      className={mergeClassNames(
        styles.label,
        inset && styles.labelInset,
        className,
      )}
      {...props}
    />
  );
}


function DropdownMenuSeparator(
  props: React.ComponentProps<typeof MenuDivider>,
) {
  const styles = useDropdownMenuStyles();

  return (
    <MenuDivider
      data-slot="dropdown-menu-separator"
      className={styles.separator}
      {...props}
    />
  );
}



function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const styles = useDropdownMenuStyles();

  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={mergeClassNames(styles.shortcut, className)}
      {...props}
    />
  );
}



type DropdownMenuSubProps = React.HTMLAttributes<HTMLDivElement>;

function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <div data-slot="dropdown-menu-sub" {...props} />;
}

type DropdownMenuSubTriggerProps = DropdownMenuItemProps;

function DropdownMenuSubTrigger({
  className,
  children,
  inset,
  ...props
}: DropdownMenuSubTriggerProps) {
  const styles = useDropdownMenuStyles();

  return (
    <MenuItem
      data-slot="dropdown-menu-sub-trigger"
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

type DropdownMenuSubContentProps = DropdownMenuContentProps;

function DropdownMenuSubContent({
  className,
  children,
  sideOffset, // eslint-disable-line @typescript-eslint/no-unused-vars
  ...props
}: DropdownMenuSubContentProps) {
  const styles = useDropdownMenuStyles();

  return (
    <MenuPopover
      data-slot="dropdown-menu-sub-content"
      className={mergeClassNames(styles.content, className)}
      {...props}
    >
      <MenuList className={styles.list}>{children}</MenuList>
    </MenuPopover>
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
