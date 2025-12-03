"use client";

import * as React from "react";
import { makeStyles, shorthands, tokens } from "@fluentui/react-components";
import { Subtract16Regular } from "@fluentui/react-icons";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useOtpStyles = makeStyles({
  container: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalS,
  },
  disabled: {
    opacity: 0.5,
  },
  group: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalXS,
  },
  slotWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  slotInput: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,

    ":disabled": {
      cursor: "not-allowed",
    },

    ":focus-visible": {
      outline: "none",
      boxShadow: `0 0 0 2px ${tokens.colorStrokeFocus2}`,
      ...shorthands.borderColor(tokens.colorBrandStroke1),
    },
  },
  separator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

type InputOTPContextValue = {
  value: string;
  length: number;
  disabled?: boolean;
  setCharAt: (index: number, char: string) => void;
  clearCharAt: (index: number) => void;
};

const InputOTPContext = React.createContext<InputOTPContextValue | null>(null);

function useInputOTPContext(): InputOTPContextValue {
  const ctx = React.useContext(InputOTPContext);
  if (!ctx) {
    throw new Error(
      "InputOTPSlot and InputOTPGroup must be used within <InputOTP>."
    );
  }
  return ctx;
}

function normalizeValue(raw: string, length: number): string {
  const digitsOnly = raw.replace(/\D/g, "");
  return digitsOnly.slice(0, length).padEnd(length, " ");
}

export interface InputOTPProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  length: number;
  disabled?: boolean;
  containerClassName?: string;
  children?: React.ReactNode;
}

function InputOTP({
  value,
  defaultValue,
  onChange,
  length,
  disabled,
  className,
  containerClassName,
  children,
  ...rest
}: InputOTPProps) {
  const styles = useOtpStyles();

  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(
    normalizeValue(defaultValue ?? "", length)
  );

  const currentValue = isControlled
    ? normalizeValue(value ?? "", length)
    : internal;

  const setFullValue = React.useCallback(
    (next: string) => {
      const normalized = normalizeValue(next, length);
      if (!isControlled) {
        setInternal(normalized);
      }
      onChange?.(normalized.trim());
    },
    [isControlled, length, onChange]
  );

  const setCharAt = React.useCallback(
    (index: number, char: string) => {
      if (index < 0 || index >= length) return;
      const chars = currentValue.split("");
      chars[index] = char;
      setFullValue(chars.join(""));
    },
    [currentValue, length, setFullValue]
  );

  const clearCharAt = React.useCallback(
    (index: number) => {
      if (index < 0 || index >= length) return;
      const chars = currentValue.split("");
      chars[index] = " ";
      setFullValue(chars.join(""));
    },
    [currentValue, length, setFullValue]
  );

  const contextValue: InputOTPContextValue = {
    value: currentValue,
    length,
    disabled,
    setCharAt,
    clearCharAt,
  };

  return (
    <InputOTPContext.Provider value={contextValue}>
      <div
        data-slot="input-otp"
        className={mergeClassNames(
          styles.container,
          disabled && styles.disabled,
          containerClassName
        )}
        {...rest}
      >
        <div className={className}>{children}</div>
      </div>
    </InputOTPContext.Provider>
  );
}

export type InputOTPGroupProps = React.HTMLAttributes<HTMLDivElement>;

function InputOTPGroup({ className, ...props }: InputOTPGroupProps) {
  const styles = useOtpStyles();

  return (
    <div
      data-slot="input-otp-group"
      className={mergeClassNames(styles.group, className)}
      {...props}
    />
  );
}

export interface InputOTPSlotProps
  extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
}

function InputOTPSlot({ index, className, ...rest }: InputOTPSlotProps) {
  const styles = useOtpStyles();
  const { value, disabled, setCharAt, clearCharAt } = useInputOTPContext();

  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const char = value[index] && value[index] !== " " ? value[index] : "";

  const focusAdjacentInput = (direction: 1 | -1) => {
    const current = inputRef.current;
    if (!current) return;

    const group =
      current.closest("[data-slot='input-otp-group']") ||
      wrapperRef.current?.parentElement;

    if (!group) return;

    const inputs = Array.from(
      group.querySelectorAll("input")
    ) as HTMLInputElement[];
    const currentIndex = inputs.indexOf(current);
    if (currentIndex === -1) return;

    const next = inputs[currentIndex + direction];
    if (next) {
      next.focus();
    }
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const raw = event.target.value || "";
    const nextChar = raw.slice(-1);

    if (!nextChar) {
      clearCharAt(index);
      return;
    }

    if (!/^[0-9]$/.test(nextChar)) {
      return;
    }

    setCharAt(index, nextChar);
    focusAdjacentInput(1);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (char) {
        clearCharAt(index);
      } else {
        focusAdjacentInput(-1);
        clearCharAt(index - 1);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAdjacentInput(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAdjacentInput(1);
    }
  };

  return (
    <div
      ref={wrapperRef}
      data-slot="input-otp-slot"
      className={mergeClassNames(styles.slotWrapper, className)}
      {...rest}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={1}
        disabled={disabled}
        value={char}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={styles.slotInput}
        aria-label={`OTP digit ${index + 1}`}
      />
    </div>
  );
}

type InputOTPSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

function InputOTPSeparator(props: InputOTPSeparatorProps) {
  const styles = useOtpStyles();

  return (
    <div
      data-slot="input-otp-separator"
      role="separator"
      className={styles.separator}
      {...props}
    >
      <Subtract16Regular />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
