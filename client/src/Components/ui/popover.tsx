"use client";

import * as React from "react";
import {
  Popover as FluentPopover,
  PopoverTrigger as FluentPopoverTrigger,
  PopoverSurface as FluentPopoverSurface,
  type PopoverProps as FluentPopoverProps,
  type PopoverSurfaceProps as FluentPopoverSurfaceProps,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const usePopoverStyles = makeStyles({
  surface: {
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    boxShadow: tokens.shadow16,
    width: "18rem",
    maxWidth: "100%",

    outlineStyle: "none",
  },
});

type PopoverProps = FluentPopoverProps;

function Popover(props: PopoverProps) {
  return <FluentPopover {...props} />;
}

type PopoverTriggerProps = React.ComponentProps<typeof FluentPopoverTrigger>;

function PopoverTrigger(props: PopoverTriggerProps) {
  return <FluentPopoverTrigger {...props} />;
}

interface PopoverContentProps extends FluentPopoverSurfaceProps {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

function PopoverContent({ className, ...props }: PopoverContentProps) {
  const styles = usePopoverStyles();

  return (
    <FluentPopoverSurface
      {...props}
      className={mergeClassNames(styles.surface, className)}
    />
  );
}

type PopoverAnchorProps = React.HTMLAttributes<HTMLSpanElement>;

function PopoverAnchor({ children, ...props }: PopoverAnchorProps) {
  return <span {...props}>{children}</span>;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
