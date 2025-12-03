"use client";

import {
  Switch as FluentSwitch,
  type SwitchProps as FluentSwitchProps,
  makeStyles,
} from "@fluentui/react-components";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useSwitchStyles = makeStyles({
  root: {
    display: "inline-flex",
    alignItems: "center",
  },
});

export type SwitchProps = FluentSwitchProps;

function Switch({ className, ...props }: SwitchProps) {
  const styles = useSwitchStyles();

  return (
    <FluentSwitch
      data-slot="switch"
      className={mergeClassNames(styles.root, className)}
      {...props}
    />
  );
}

export { Switch };
