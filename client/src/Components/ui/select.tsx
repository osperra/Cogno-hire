"use client";

import * as React from "react";
import { makeStyles, shorthands, tokens } from "@fluentui/react-components";
import {
  Checkmark16Regular,
  ChevronDown16Regular,
  ChevronUp16Regular,
} from "@fluentui/react-icons";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useSelectStyles = makeStyles({
  root: {
    position: "relative",
    display: "inline-block",
    minWidth: "160px",
  },
  triggerBase: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: tokens.spacingHorizontalS,
    width: "100%",
    cursor: "pointer",

    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.padding("4px", tokens.spacingHorizontalM),

    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase200,

    transitionProperty: "background-color, box-shadow, border-color",
    transitionDuration: tokens.durationFast,

    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2,
    },

    ":focus-visible": {
      outlineStyle: "none",
      boxShadow: `0 0 0 3px ${tokens.colorStrokeFocus2}`,
      ...shorthands.borderColor(tokens.colorBrandStroke1),
    },

    ":disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },
  triggerSm: {
    height: "32px",
  },
  triggerDefault: {
    height: "36px",
  },
  triggerValue: {
    display: "inline-flex",
    alignItems: "center",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: tokens.fontSizeBase200,
  },
  triggerPlaceholder: {
    color: tokens.colorNeutralForeground3,
  },
  icon: {
    width: "16px",
    height: "16px",
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
  },

  content: {
    position: "absolute",
    top: "100%",
    left: 0,
    zIndex: 1000,

    marginTop: tokens.spacingVerticalXXS,
    minWidth: "100%",
    maxHeight: "260px",

    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    boxShadow: tokens.shadow16,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    overflowY: "auto",
  },

  group: {
    paddingBlock: tokens.spacingVerticalXXS,
  },

  label: {
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalXXS,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
  },

  separator: {
    height: "1px",
    backgroundColor: tokens.colorNeutralStroke2,
    marginBlock: tokens.spacingVerticalXXS,
    marginInline: tokens.spacingHorizontalXXS,
  },

  itemBase: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalS,
    width: "100%",
    cursor: "pointer",

    ...shorthands.borderRadius(tokens.borderRadiusSmall),
    ...shorthands.padding("4px", tokens.spacingHorizontalM),

    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground1,
    backgroundColor: "transparent",
    border: "none",
    textAlign: "left",
    outlineStyle: "none",

    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2,
    },

    ":focus-visible": {
      boxShadow: `0 0 0 2px ${tokens.colorStrokeFocus2}`,
    },

    ":disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },
  itemSelected: {
    backgroundColor: tokens.colorNeutralBackground2,
    fontWeight: tokens.fontWeightSemibold,
  },
  itemIndicatorWrapper: {
    position: "absolute",
    right: tokens.spacingHorizontalM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  itemIndicatorIcon: {
    width: "16px",
    height: "16px",
    color: tokens.colorBrandForeground1,
  },

  scrollButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingBlock: tokens.spacingVerticalXXS,
  },
  scrollIcon: {
    width: "16px",
    height: "16px",
    color: tokens.colorNeutralForeground3,
  },
});

type SelectContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string | undefined;
  setValue: (value: string) => void;
  disabled?: boolean;
  size: "sm" | "default";
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext(): SelectContextValue {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error("Select subcomponents must be used inside <Select>.");
  }
  return ctx;
}

type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  size?: "sm" | "default";
  className?: string;
  children?: React.ReactNode;
};

function Select({
  value,
  defaultValue,
  onValueChange,
  disabled,
  size = "default",
  className,
  children,
  ...rest
}: SelectProps & React.HTMLAttributes<HTMLDivElement>) {
  const styles = useSelectStyles();
  const [open, setOpen] = React.useState(false);
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

  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!rootRef.current || !target) return;
      if (!rootRef.current.contains(target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const contextValue: SelectContextValue = {
    open,
    setOpen,
    value: currentValue,
    setValue,
    disabled,
    size,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div
        ref={rootRef}
        data-slot="select"
        className={mergeClassNames(styles.root, className)}
        {...rest}
      >
        {children}
      </div>
    </SelectContext.Provider>
  );
}

type SelectTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "default";
};

function SelectTrigger({
  className,
  children,
  size: sizeProp,
  ...rest
}: SelectTriggerProps) {
  const styles = useSelectStyles();
  const { open, setOpen, disabled, size: ctxSize } = useSelectContext();
  const size = sizeProp ?? ctxSize;

  const handleClick = () => {
    if (disabled) return;
    setOpen(!open);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (
    event
  ) => {
    if (disabled) return;
    if (
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "ArrowDown"
    ) {
      event.preventDefault();
      setOpen(true);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <button
      type="button"
      data-slot="select-trigger"
      aria-haspopup="listbox"
      aria-expanded={open}
      disabled={disabled}
      className={mergeClassNames(
        styles.triggerBase,
        size === "sm" ? styles.triggerSm : styles.triggerDefault,
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <span className={styles.triggerValue}>{children}</span>
      <ChevronDown16Regular className={styles.icon} />
    </button>
  );
}

type SelectValueProps = {
  placeholder?: string;
  className?: string;
};

function SelectValue({ placeholder, className }: SelectValueProps) {
  const styles = useSelectStyles();
  const { value } = useSelectContext();

  const isPlaceholder = !value;

  return (
    <span
      data-slot="select-value"
      className={mergeClassNames(
        styles.triggerValue,
        isPlaceholder && styles.triggerPlaceholder,
        className
      )}
    >
      {value ?? placeholder ?? ""}
    </span>
  );
}

type SelectContentProps = React.HTMLAttributes<HTMLDivElement>;

function SelectContent({ className, children, ...rest }: SelectContentProps) {
  const styles = useSelectStyles();
  const { open } = useSelectContext();

  if (!open) return null;

  return (
    <div
      data-slot="select-content"
      role="listbox"
      className={mergeClassNames(styles.content, className)}
      {...rest}
    >
      {children}
    </div>
  );
}

type SelectGroupProps = React.HTMLAttributes<HTMLDivElement>;

function SelectGroup({ className, ...rest }: SelectGroupProps) {
  const styles = useSelectStyles();

  return (
    <div
      data-slot="select-group"
      className={mergeClassNames(styles.group, className)}
      {...rest}
    />
  );
}

type SelectLabelProps = React.HTMLAttributes<HTMLDivElement>;

function SelectLabel({ className, ...rest }: SelectLabelProps) {
  const styles = useSelectStyles();

  return (
    <div
      data-slot="select-label"
      className={mergeClassNames(styles.label, className)}
      {...rest}
    />
  );
}

type SelectSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

function SelectSeparator({ className, ...rest }: SelectSeparatorProps) {
  const styles = useSelectStyles();

  return (
    <div
      data-slot="select-separator"
      className={mergeClassNames(styles.separator, className)}
      {...rest}
    />
  );
}

type SelectItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

function SelectItem({ className, value, children, ...rest }: SelectItemProps) {
  const styles = useSelectStyles();
  const {
    value: currentValue,
    setValue,
    setOpen,
    disabled,
  } = useSelectContext();

  const selected = currentValue === value;
  const itemDisabled = disabled || rest.disabled;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (itemDisabled) return;
    rest.onClick?.(event);
    if (!event.defaultPrevented) {
      setValue(value);
      setOpen(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (
    event
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!itemDisabled) {
        setValue(value);
        setOpen(false);
      }
    }
  };

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      data-slot="select-item"
      className={mergeClassNames(
        styles.itemBase,
        selected && styles.itemSelected,
        className
      )}
      disabled={itemDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <span>{children}</span>
      {selected && (
        <span className={styles.itemIndicatorWrapper}>
          <Checkmark16Regular className={styles.itemIndicatorIcon} />
        </span>
      )}
    </button>
  );
}

type ScrollButtonProps = React.HTMLAttributes<HTMLDivElement>;

function SelectScrollUpButton({ className, ...rest }: ScrollButtonProps) {
  const styles = useSelectStyles();

  return (
    <div
      data-slot="select-scroll-up-button"
      className={mergeClassNames(styles.scrollButton, className)}
      {...rest}
    >
      <ChevronUp16Regular className={styles.scrollIcon} />
    </div>
  );
}

function SelectScrollDownButton({ className, ...rest }: ScrollButtonProps) {
  const styles = useSelectStyles();

  return (
    <div
      data-slot="select-scroll-down-button"
      className={mergeClassNames(styles.scrollButton, className)}
      {...rest}
    >
      <ChevronDown16Regular className={styles.scrollIcon} />
    </div>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
