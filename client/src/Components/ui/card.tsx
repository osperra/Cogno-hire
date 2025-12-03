import * as React from "react";
import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from "@fluentui/react-components";

const useCardStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    rowGap: "24px", 
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    borderRadius: tokens.borderRadiusLarge,
  },
});

const useCardHeaderStyles = makeStyles({
  root: {
    display: "grid",
    gridAutoRows: "min-content",
    gridTemplateRows: "auto auto",
    alignItems: "flex-start",
    rowGap: "6px",
    paddingTop: "24px", 
    paddingLeft: "24px",
    paddingRight: "24px",
  },
  withAction: {
    gridTemplateColumns: "1fr auto",
  },
});

const useCardTitleStyles = makeStyles({
  root: {
    margin: 0,
    lineHeight: 1, 
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
});

const useCardDescriptionStyles = makeStyles({
  root: {
    margin: 0,
    color: tokens.colorNeutralForeground3, 
    fontSize: tokens.fontSizeBase200,
  },
});

const useCardActionStyles = makeStyles({
  root: {
    gridColumnStart: 2,
    gridRowStart: 1,
    gridRowEnd: 3,
    alignSelf: "flex-start",
    justifySelf: "flex-end",
  },
});

const useCardContentStyles = makeStyles({
  root: {
    paddingLeft: "24px", 
    paddingRight: "24px",
    paddingBottom: "0",
  },
  lastChild: {
    paddingBottom: "24px", 
  },
});

const useCardFooterStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    paddingLeft: "24px",
    paddingRight: "24px",
    paddingBottom: "24px",
  },
});

type DivProps = React.HTMLAttributes<HTMLDivElement>;

function Card({ className, ...props }: DivProps) {
  const styles = useCardStyles();
  return (
    <div
      data-slot="card"
      className={mergeClasses(styles.root, className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: DivProps) {
  const styles = useCardHeaderStyles();
  return (
    <div
      data-slot="card-header"
      className={mergeClasses(styles.root, className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: DivProps) {
  const styles = useCardTitleStyles();
  return (
    <h4
      data-slot="card-title"
      className={mergeClasses(styles.root, className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: DivProps) {
  const styles = useCardDescriptionStyles();
  return (
    <p
      data-slot="card-description"
      className={mergeClasses(styles.root, className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: DivProps) {
  const styles = useCardActionStyles();
  return (
    <div
      data-slot="card-action"
      className={mergeClasses(styles.root, className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: DivProps) {
  const styles = useCardContentStyles();
  return (
    <div
      data-slot="card-content"
      className={mergeClasses(styles.root, className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: DivProps) {
  const styles = useCardFooterStyles();
  return (
    <div
      data-slot="card-footer"
      className={mergeClasses(styles.root, className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
