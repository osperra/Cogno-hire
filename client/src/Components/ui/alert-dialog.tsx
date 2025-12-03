import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle as FluentDialogTitle,
  DialogActions,
  Button,
  Text,
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { Dismiss20Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  surface: {
    maxWidth: "480px",
    width: "100%",
    ...shorthands.borderRadius("12px"),
    ...shorthands.padding("20px"),
    boxShadow: tokens.shadow64,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
    marginBottom: "12px",
    textAlign: "left",
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    columnGap: "8px",
    marginTop: "16px",
  },
  description: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    marginTop: "4px",
  },
});

function AlertDialog(
  props: React.ComponentProps<typeof Dialog>,
) {
  return <Dialog modalType="alert" {...props} />;
}


function AlertDialogTrigger(
  props: React.ComponentProps<typeof DialogTrigger>,
) {
  return <DialogTrigger {...props} />;
}


function AlertDialogPortal(
  props: React.PropsWithChildren<object>,
) {
  return <>{props.children}</>;
}


function AlertDialogOverlay(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props: React.HTMLAttributes<HTMLDivElement>,
) {
  return null;
}


function AlertDialogContent(
  props: React.ComponentProps<typeof DialogSurface>,
) {
  const styles = useStyles();
  const { className, children, ...rest } = props;

  return (
    <DialogSurface
      className={mergeClasses(styles.surface, className)}
      {...rest}
    >
      <DialogBody>{children}</DialogBody>
    </DialogSurface>
  );
}


function AlertDialogHeader(
  props: React.ComponentProps<"div">,
) {
  const styles = useStyles();
  const { className, ...rest } = props;

  return (
    <div
      data-slot="alert-dialog-header"
      className={mergeClasses(styles.header, className)}
      {...rest}
    />
  );
}


function AlertDialogFooter(
  props: React.ComponentProps<"div">,
) {
  const styles = useStyles();
  const { className, children, ...rest } = props;

  return (
    <div
      data-slot="alert-dialog-footer"
      className={mergeClasses(styles.footer, className)}
      {...rest}
    >
      <DialogActions>{children}</DialogActions>
    </div>
  );
}


function AlertDialogTitle(
  props: React.ComponentProps<typeof FluentDialogTitle>,
) {
  const { className, ...rest } = props;

  return (
    <FluentDialogTitle
      data-slot="alert-dialog-title"
      className={className}
      {...rest}
    />
  );
}


function AlertDialogDescription(
  props: React.ComponentProps<typeof Text>,
) {
  const styles = useStyles();
  const { className, children, ...rest } = props;

  return (
    <Text
      as="p"
      data-slot="alert-dialog-description"
      className={mergeClasses(styles.description, className)}
      {...rest}
    >
      {children}
    </Text>
  );
}


function AlertDialogAction(
  props: React.ComponentProps<typeof Button>,
) {
  const { className, children, ...rest } = props;

  return (
    <Button
      appearance="primary"
      data-slot="alert-dialog-action"
      className={className}
      {...rest}
    >
      {children}
    </Button>
  );
}


function AlertDialogCancel(
  props: React.ComponentProps<typeof Button>,
) {
  const { className, children, ...rest } = props;

  return (
    <Button
      appearance="secondary"
      icon={<Dismiss20Regular />}
      data-slot="alert-dialog-cancel"
      className={className}
      {...rest}
    >
      {children}
    </Button>
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
