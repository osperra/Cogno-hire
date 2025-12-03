"use client";

import * as React from "react";
import {
  RadioGroup as FluentRadioGroup,
  Radio,
  makeStyles,
  tokens,
} from "@fluentui/react-components";

function mergeClassNames(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

const useRadioStyles = makeStyles({
  group: {
    display: "grid",
    rowGap: tokens.spacingVerticalS,
  },
  radio: {
    display: "flex",
    alignItems: "center",
  },
});

type FluentRadioGroupProps = React.ComponentProps<typeof FluentRadioGroup>;
type FluentRadioProps = React.ComponentProps<typeof Radio>;

export interface RadioGroupProps extends FluentRadioGroupProps {
  className?: string;
}

function RadioGroup({ className, ...props }: RadioGroupProps) {
  const styles = useRadioStyles();

  return (
    <FluentRadioGroup
      data-slot="radio-group"
      className={mergeClassNames(styles.group, className)}
      {...props}
    />
  );
}

export interface RadioGroupItemProps extends Omit<FluentRadioProps, "label"> {
  className?: string;
  label?: FluentRadioProps["label"];
}

function RadioGroupItem({ className, label, ...props }: RadioGroupItemProps) {
  const styles = useRadioStyles();

  return (
    <Radio
      data-slot="radio-group-item"
      className={mergeClassNames(styles.radio, className)}
      label={label}
      {...props}
    />
  );
}

export { RadioGroup, RadioGroupItem };
