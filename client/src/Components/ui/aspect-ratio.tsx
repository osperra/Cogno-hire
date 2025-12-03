"use client";

import * as React from "react";
import { makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },
  content: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  },
});


export function AspectRatio({
  ratio = 1,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ratio?: number }) {
  const styles = useStyles();

  return (
    <div
      {...props}
      className={styles.root}
      style={{
        ...props.style,
        paddingBottom: `${100 / ratio}%`,
      }}
      data-slot="aspect-ratio"
    >
      <div className={styles.content}>{children}</div>
    </div>
  );
}
