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
  indicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export type CheckboxProps = FluentCheckboxProps;

function Checkbox({ className, ...props }: CheckboxProps) {
  const styles = useCheckboxStyles();

  return (
    <FluentCheckbox
      data-slot="checkbox"
      className={mergeClassNames(styles.root, className)}
      indicator={{
        children: <Checkmark16Regular />,
        className: styles.indicator,
      }}
      {...props}
    />
  );
}

export { Checkbox };
