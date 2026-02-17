"use client";

import * as React from "react";
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuItemCheckbox,
  MenuItemRadio,
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
  Circle16Filled,
} from "@fluentui/react-icons";
function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useMenubarStyles = makeStyles({
  menubar: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalXXS,
    height: "36px",
    padding: tokens.spacingHorizontalXXS,
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    boxShadow: tokens.shadow4,
  },

  triggerButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: tokens.spacingHorizontalXS,
    paddingInline: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalXXS,
    backgroundColor: "transparent",
    color: tokens.colorNeutralForeground1,
    border: "none",
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    cursor: "pointer",
    outlineStyle: "none",
    userSelect: "none",

    ":hover": {
      backgroundColor: tokens.colorSubtleBackgroundHover,
      color: tokens.colorNeutralForeground1,
    },

    ":focus-visible": {
      boxShadow: `0 0 0 2px ${tokens.colorBrandStroke1}`,
    },
  },

  content: {
    minWidth: "192px", 
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    padding: tokens.spacingVerticalXXS,
    boxShadow: tokens.shadow8,
    maxHeight: "320px",
    overflowY: "auto",
  },

  item: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalS,
    paddingInline: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalXS,
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase200,
    cursor: "default",
    userSelect: "none",
    outlineStyle: "none",

    "& svg": {
      width: "16px",
      height: "16px",
      flexShrink: 0,
      color: tokens.colorNeutralForeground3,
    },

    "&:hover": {
      backgroundColor: tokens.colorSubtleBackgroundHover,
      color: tokens.colorNeutralForeground1,
    },

    "&[aria-disabled='true']": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },

  itemInset: {
    paddingInlineStart: `calc(${tokens.spacingHorizontalL} + ${tokens.spacingHorizontalXS})`,
  },

  itemDestructive: {
    color: tokens.colorPaletteRedForeground1,
    ":hover": {
      backgroundColor: tokens.colorPaletteRedBackground2,
      color: tokens.colorPaletteRedForeground1,
    },
  },

  checkboxItem: {
    position: "relative",
    paddingInlineStart: `calc(${tokens.spacingHorizontalL} + ${tokens.spacingHorizontalXS})`,
  },

  radioItem: {
    position: "relative",
    paddingInlineStart: `calc(${tokens.spacingHorizontalL} + ${tokens.spacingHorizontalXS})`,
  },

  shortcut: {
    marginLeft: "auto",
    fontSize: tokens.fontSizeBase100,
    letterSpacing: "0.12em",
    color: tokens.colorNeutralForeground3,
  },

  label: {
    paddingInline: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalXS,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
  },

  separator: {
    marginBlock: tokens.spacingVerticalXXS,
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke2),
  },

  subTrigger: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalS,
    paddingInline: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalXS,
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase200,
    cursor: "default",
    userSelect: "none",
    outlineStyle: "none",

    "&:hover": {
      backgroundColor: tokens.colorSubtleBackgroundHover,
      color: tokens.colorNeutralForeground1,
    },
  },

  subChevron: {
    marginLeft: "auto",
    width: "16px",
    height: "16px",
  },
});

type MenubarProps = React.ComponentProps<"div">;

function Menubar({ className, ...props }: MenubarProps) {
  const styles = useMenubarStyles();

  return (
    <div
      data-slot="menubar"
      className={mergeClassNames(styles.menubar, className)}
      {...props}
    />
  );
}


type MenubarMenuProps = React.ComponentProps<typeof Menu>;

function MenubarMenu(props: MenubarMenuProps) {
  return <Menu data-slot="menubar-menu" {...props} />;
}

type MenubarGroupProps = React.ComponentProps<typeof MenuGroup>;
function MenubarGroup(props: MenubarGroupProps) {
  return <MenuGroup data-slot="menubar-group" {...props} />;
}

type MenubarRadioGroupProps = React.ComponentProps<typeof MenuGroup>;
function MenubarRadioGroup(props: MenubarRadioGroupProps) {
  return <MenuGroup data-slot="menubar-radio-group" {...props} />;
}

type MenubarPortalProps = React.PropsWithChildren;
function MenubarPortal({ children }: MenubarPortalProps) {
  return <>{children}</>;
}

type MenubarTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

function MenubarTrigger({ className, children, ...props }: MenubarTriggerProps) {
  const styles = useMenubarStyles();

  return (
    <MenuTrigger disableButtonEnhancement>
      <button
        type="button"
        data-slot="menubar-trigger"
        className={mergeClassNames(styles.triggerButton, className)}
        {...props}
      >
        {children}
      </button>
    </MenuTrigger>
  );
}

type MenubarContentProps = React.ComponentProps<typeof MenuList>;

function MenubarContent({ className, children, ...props }: MenubarContentProps) {
  const styles = useMenubarStyles();

  return (
    <MenuPopover>
      <MenuList
        data-slot="menubar-content"
        className={mergeClassNames(styles.content, className)}
        {...props}
      >
        {children}
      </MenuList>
    </MenuPopover>
  );
}

type MenubarItemProps = React.ComponentProps<typeof MenuItem> & {
  inset?: boolean;
  variant?: "default" | "destructive";
};

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenubarItemProps) {
  const styles = useMenubarStyles();

  return (
    <MenuItem
      data-slot="menubar-item"
      className={mergeClassNames(
        styles.item,
        inset && styles.itemInset,
        variant === "destructive" && styles.itemDestructive,
        className,
      )}
      {...props}
    />
  );
}

type MenubarCheckboxItemProps = React.ComponentProps<typeof MenuItemCheckbox>;

function MenubarCheckboxItem({
  className,
  children,
  ...props
}: MenubarCheckboxItemProps) {
  const styles = useMenubarStyles();

  return (
    <MenuItemCheckbox
      data-slot="menubar-checkbox-item"
      className={mergeClassNames(styles.item, styles.checkboxItem, className)}
      icon={<Checkmark16Regular />}
      {...props}
    >
      {children}
    </MenuItemCheckbox>
  );
}

type MenubarRadioItemProps = React.ComponentProps<typeof MenuItemRadio>;

function MenubarRadioItem({
  className,
  children,
  ...props
}: MenubarRadioItemProps) {
  const styles = useMenubarStyles();

  return (
    <MenuItemRadio
      data-slot="menubar-radio-item"
      className={mergeClassNames(styles.item, styles.radioItem, className)}
      icon={<Circle16Filled />}
      {...props}
    >
      {children}
    </MenuItemRadio>
  );
}

type MenubarLabelProps = React.ComponentProps<typeof MenuGroupHeader> & {
  inset?: boolean;
};

function MenubarLabel({ className, inset, ...props }: MenubarLabelProps) {
  const styles = useMenubarStyles();

  return (
    <MenuGroupHeader
      data-slot="menubar-label"
      className={mergeClassNames(
        styles.label,
        inset && styles.itemInset,
        className,
      )}
      {...props}
    />
  );
}

type MenubarSeparatorProps = React.ComponentProps<typeof MenuDivider>;

function MenubarSeparator({ className, ...props }: MenubarSeparatorProps) {
  const styles = useMenubarStyles();

  return (
    <MenuDivider
      data-slot="menubar-separator"
      className={mergeClassNames(styles.separator, className)}
      {...props}
    />
  );
}

type MenubarShortcutProps = React.ComponentProps<"span">;

function MenubarShortcut({ className, ...props }: MenubarShortcutProps) {
  const styles = useMenubarStyles();

  return (
    <span
      data-slot="menubar-shortcut"
      className={mergeClassNames(styles.shortcut, className)}
      {...props}
    />
  );
}

type MenubarSubProps = React.ComponentProps<typeof Menu>;

function MenubarSub(props: MenubarSubProps) {
  return <Menu data-slot="menubar-sub" {...props} />;
}

type MenubarSubTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  inset?: boolean;
  children: React.ReactNode;
};

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenubarSubTriggerProps) {
  const styles = useMenubarStyles();

  return (
    <MenuTrigger disableButtonEnhancement>
      <button
        type="button"
        data-slot="menubar-sub-trigger"
        className={mergeClassNames(
          styles.subTrigger,
          inset && styles.itemInset,
          className,
        )}
        {...props}
      >
        {children}
        <ChevronRight16Regular className={styles.subChevron} />
      </button>
    </MenuTrigger>
  );
}

type MenubarSubContentProps = React.ComponentProps<typeof MenuList>;

function MenubarSubContent({
  className,
  children,
  ...props
}: MenubarSubContentProps) {
  const styles = useMenubarStyles();

  return (
    <MenuPopover>
      <MenuList
        data-slot="menubar-sub-content"
        className={mergeClassNames(styles.content, className)}
        {...props}
      >
        {children}
      </MenuList>
    </MenuPopover>
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
