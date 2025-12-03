"use client";

import * as React from "react";
import { makeStyles, shorthands, tokens } from "@fluentui/react-components";
import { ReOrderDotsVerticalRegular } from "@fluentui/react-icons";
import {
  PanelGroup as ResizablePanelGroupPrimitive,
  Panel as ResizablePanelPrimitive,
  PanelResizeHandle as ResizablePanelResizeHandlePrimitive,
} from "react-resizable-panels";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useResizableStyles = makeStyles({
  group: {
    display: "flex",
    width: "100%",
    height: "100%",
    "&[data-panel-group-direction='vertical']": {
      flexDirection: "column",
    },
  },

  handle: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colorNeutralStroke2,
    cursor: "col-resize",
    width: "1px",
    outlineStyle: "none",
    ":focus-visible": {
      boxShadow: `0 0 0 1px ${tokens.colorStrokeFocus2}`,
    },

    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      left: "50%",
      width: "4px",
      transform: "translateX(-50%)",
      backgroundColor: "transparent",
    },

    "&[data-panel-group-direction='vertical']": {
      cursor: "row-resize",
      width: "100%",
      height: "1px",
    },
    "&[data-panel-group-direction='vertical']::after": {
      top: "50%",
      left: 0,
      right: 0,
      height: "4px",
      width: "100%",
      transform: "translateY(-50%)",
    },
  },

  handleInner: {
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "16px",
    width: "20px",
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
  },

  handleIcon: {
    fontSize: tokens.fontSizeBase200,
  },
});

type ResizablePanelGroupProps = React.ComponentProps<
  typeof ResizablePanelGroupPrimitive
>;
type ResizablePanelProps = React.ComponentProps<typeof ResizablePanelPrimitive>;
type ResizableHandleProps = React.ComponentProps<
  typeof ResizablePanelResizeHandlePrimitive
> & {
  withHandle?: boolean;
};

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePanelGroupProps) {
  const styles = useResizableStyles();

  return (
    <ResizablePanelGroupPrimitive
      data-slot="resizable-panel-group"
      className={mergeClassNames(styles.group, className)}
      {...props}
    />
  );
}

function ResizablePanel(props: ResizablePanelProps) {
  return <ResizablePanelPrimitive data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizableHandleProps) {
  const styles = useResizableStyles();

  return (
    <ResizablePanelResizeHandlePrimitive
      data-slot="resizable-handle"
      className={mergeClassNames(styles.handle, className)}
      {...props}
    >
      {withHandle && (
        <div className={styles.handleInner}>
          <ReOrderDotsVerticalRegular className={styles.handleIcon} />
        </div>
      )}
    </ResizablePanelResizeHandlePrimitive>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
