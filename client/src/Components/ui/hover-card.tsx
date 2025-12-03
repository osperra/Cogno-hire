"use client";

import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverSurface,
  makeStyles,
  shorthands,
  tokens,
  type PopoverProps,
} from "@fluentui/react-components";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useHoverCardStyles = makeStyles({
  content: {
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.padding(
      tokens.spacingVerticalM,
      tokens.spacingHorizontalM,
    ),
    boxShadow: tokens.shadow16,
    maxWidth: "16rem", 
    outlineStyle: "none",
  },
});


type HoverCardProps = Omit<PopoverProps, "openOnHover"> & {
  hoverDelay?: number;
};

function HoverCard({ children, hoverDelay, ...props }: HoverCardProps) {
  return (
    <Popover
      data-slot="hover-card"
      openOnHover
      // @ts-expect-error - hoverDelay may not exist on older typings
      hoverDelay={hoverDelay}
      {...props}
    >
      {children}
    </Popover>
  );
}


function HoverCardTrigger(
  props: React.ComponentProps<typeof PopoverTrigger>,
) {
  return (
    <PopoverTrigger
      disableButtonEnhancement
      data-slot="hover-card-trigger"
      {...props}
    />
  );
}


type HoverCardContentProps = React.ComponentProps<typeof PopoverSurface>;

function HoverCardContent({
  className,
  ...props
}: HoverCardContentProps) {
  const styles = useHoverCardStyles();

  return (
    <PopoverSurface
      data-slot="hover-card-content"
      className={mergeClassNames(styles.content, className)}
      {...props}
    />
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
