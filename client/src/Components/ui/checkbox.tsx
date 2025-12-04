"use client";

import {
  Checkbox as FluentCheckbox,
  type CheckboxProps as FluentCheckboxProps,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Checkmark16Regular } from "@fluentui/react-icons";

function mergeClassNames(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const useCheckboxStyles = makeStyles({
  root: {
    display: "inline-flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase200,
  },

  indicatorBase: {
    width: "18px",
    height: "18px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    transition:
      "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
    fontSize: "12px"
  },

  indicatorUnchecked: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E7EB",
  },

  indicatorChecked: {
    backgroundColor: "#0118D8",
    border: "1px solid #0118D8",
    color: "#FFFFFF",
  },
});

export type CheckboxProps = FluentCheckboxProps;

function Checkbox({ className, checked, defaultChecked, ...props }: CheckboxProps) {
  const styles = useCheckboxStyles();

  const isChecked =
    typeof checked === "boolean"
      ? checked
      : typeof defaultChecked === "boolean"
      ? defaultChecked
      : false;

  return (
    <FluentCheckbox
      {...props}
      checked={checked}
      defaultChecked={defaultChecked}
      data-slot="checkbox"
      className={mergeClassNames(styles.root, className)}
      indicator={{
        children: isChecked ? <Checkmark16Regular /> : null,
        className: mergeClassNames(
          styles.indicatorBase,
          isChecked ? styles.indicatorChecked : styles.indicatorUnchecked
        ),
      }}
    />
  );
}

export { Checkbox };
