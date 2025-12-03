"use client";

import * as React from "react";
import { makeStyles, tokens } from "@fluentui/react-components";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useTableStyles = makeStyles({
  container: {
    position: "relative",
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: tokens.fontSizeBase200,
    captionSide: "bottom",
  },
  header: {
    "& tr": {
      borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    },
  },
  body: {
    "& tr:last-child": {
      borderBottomStyle: "none",
    },
  },
  footer: {
    backgroundColor: tokens.colorNeutralBackground3,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    fontWeight: tokens.fontWeightSemibold,
    "& > tr:last-child": {
      borderBottom: "none",
    },
  },
  row: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    transitionProperty: "background-color",
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2,
    },
    "&[data-state='selected']": {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  headCell: {
    color: tokens.colorNeutralForeground1,
    height: "40px",
    paddingInline: tokens.spacingHorizontalS,
    textAlign: "left" as const,
    verticalAlign: "middle",
    fontWeight: tokens.fontWeightSemibold,
    whiteSpace: "nowrap",
  },
  cell: {
    paddingInline: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalXS,
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  caption: {
    marginTop: tokens.spacingVerticalM,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    textAlign: "left" as const,
  },
});

function Table({ className, ...props }: React.ComponentProps<"table">) {
  const styles = useTableStyles();

  return (
    <div data-slot="table-container" className={styles.container}>
      <table
        data-slot="table"
        className={mergeClassNames(styles.table, className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  const styles = useTableStyles();

  return (
    <thead
      data-slot="table-header"
      className={mergeClassNames(styles.header, className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  const styles = useTableStyles();

  return (
    <tbody
      data-slot="table-body"
      className={mergeClassNames(styles.body, className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  const styles = useTableStyles();

  return (
    <tfoot
      data-slot="table-footer"
      className={mergeClassNames(styles.footer, className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  const styles = useTableStyles();

  return (
    <tr
      data-slot="table-row"
      className={mergeClassNames(styles.row, className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  const styles = useTableStyles();

  return (
    <th
      data-slot="table-head"
      className={mergeClassNames(styles.headCell, className)}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  const styles = useTableStyles();

  return (
    <td
      data-slot="table-cell"
      className={mergeClassNames(styles.cell, className)}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  const styles = useTableStyles();

  return (
    <caption
      data-slot="table-caption"
      className={mergeClassNames(styles.caption, className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
