"use client";

import * as React from "react";
import {
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  ChevronLeft16Regular,
  ChevronRight16Regular,
} from "@fluentui/react-icons";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "./button";

function mergeClassNames(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const useCalendarStyles = makeStyles({
  root: {
    padding: tokens.spacingHorizontalM,
  },
  months: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingHorizontalS,
    columnGap: tokens.spacingHorizontalS,
    "@media (min-width: 640px)": {
      flexDirection: "row",
    },
  },
  month: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingHorizontalS,
  },
  caption: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingTop: tokens.spacingVerticalXS,
    width: "100%",
  },
  caption_label: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalXXS,
  },
  nav_button: {
    minWidth: "28px",
    height: "28px",
    padding: 0,
    opacity: 0.7,
    backgroundColor: "transparent",
    ":hover": {
      opacity: 1,
    },
  },
  nav_button_previous: {
    position: "absolute",
    left: tokens.spacingHorizontalXS,
  },
  nav_button_next: {
    position: "absolute",
    right: tokens.spacingHorizontalXS,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  head_row: {
    display: "flex",
  },
  head_cell: {
    width: "32px",
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightRegular,
    color: tokens.colorNeutralForeground3,
    textAlign: "center",
  },
  row: {
    display: "flex",
    width: "100%",
    marginTop: tokens.spacingVerticalXXS,
  },
  cell: {
    position: "relative",
    padding: 0,
    textAlign: "center",
    fontSize: tokens.fontSizeBase200,
  },
  day: {
    width: "32px",
    height: "32px",
    padding: 0,
    fontWeight: tokens.fontWeightRegular,
  },
  day_selected: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralBackground1,
  },
  day_today: {
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
  },
  day_outside: {
    color: tokens.colorNeutralForegroundDisabled,
  },
  day_disabled: {
    color: tokens.colorNeutralForegroundDisabled,
    opacity: 0.5,
  },
  day_range_start: {
    borderTopLeftRadius: tokens.borderRadiusMedium,
    borderBottomLeftRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralBackground1,
  },
  day_range_end: {
    borderTopRightRadius: tokens.borderRadiusMedium,
    borderBottomRightRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralBackground1,
  },
  day_range_middle: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground1,
  },
  day_hidden: {
    visibility: "hidden",
  },
  navIcon: {
    width: "16px",
    height: "16px",
  },
});

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const styles = useCalendarStyles();

  const navButtonClassName = mergeClassNames(
    buttonVariants({ variant: "outline", size: "icon" }),
    styles.nav_button,
    classNames?.nav_button,
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={mergeClassNames(styles.root, className)}
      classNames={{
        months: mergeClassNames(styles.months, classNames?.months),
        month: mergeClassNames(styles.month, classNames?.month),
        caption: mergeClassNames(styles.caption, classNames?.caption),
        caption_label: mergeClassNames(
          styles.caption_label,
          classNames?.caption_label,
        ),
        nav: mergeClassNames(styles.nav, classNames?.nav),
        nav_button: navButtonClassName,
        nav_button_previous: mergeClassNames(
          styles.nav_button_previous,
          classNames?.nav_button_previous,
        ),
        nav_button_next: mergeClassNames(
          styles.nav_button_next,
          classNames?.nav_button_next,
        ),
        table: mergeClassNames(styles.table, classNames?.table),
        head_row: mergeClassNames(styles.head_row, classNames?.head_row),
        head_cell: mergeClassNames(styles.head_cell, classNames?.head_cell),
        row: mergeClassNames(styles.row, classNames?.row),
        cell: mergeClassNames(styles.cell, classNames?.cell),
        day: mergeClassNames(
          buttonVariants({ variant: "ghost", size: "icon" }),
          styles.day,
          classNames?.day,
        ),
        day_selected: mergeClassNames(
          styles.day_selected,
          classNames?.day_selected,
        ),
        day_today: mergeClassNames(
          styles.day_today,
          classNames?.day_today,
        ),
        day_outside: mergeClassNames(
          styles.day_outside,
          classNames?.day_outside,
        ),
        day_disabled: mergeClassNames(
          styles.day_disabled,
          classNames?.day_disabled,
        ),
        day_range_start: mergeClassNames(
          styles.day_range_start,
          classNames?.day_range_start,
        ),
        day_range_end: mergeClassNames(
          styles.day_range_end,
          classNames?.day_range_end,
        ),
        day_range_middle: mergeClassNames(
          styles.day_range_middle,
          classNames?.day_range_middle,
        ),
        day_hidden: mergeClassNames(
          styles.day_hidden,
          classNames?.day_hidden,
        ),
      }}
      components={{
        IconLeft: (iconProps: React.SVGAttributes<SVGSVGElement>) => (
          <ChevronLeft16Regular
            {...iconProps}
            className={mergeClassNames(
              styles.navIcon,
              iconProps.className,
            )}
          />
        ),
        IconRight: (iconProps: React.SVGAttributes<SVGSVGElement>) => (
          <ChevronRight16Regular
            {...iconProps}
            className={mergeClassNames(
              styles.navIcon,
              iconProps.className,
            )}
          />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
