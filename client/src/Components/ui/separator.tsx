import * as React from "react";
import {
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";

type SeparatorOrientation = "horizontal" | "vertical";

interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: SeparatorOrientation;
  decorative?: boolean;
}

const useStyles = makeStyles({
  root: {
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralStroke2,
  },
  horizontal: {
    height: "1px",
    width: "100%",
  },
  vertical: {
    width: "1px",
    height: "100%",
  },
});

export const Separator: React.FC<SeparatorProps> = ({
  orientation = "horizontal",
  decorative = true,
  className,
  ...props
}) => {
  const styles = useStyles();

  const isHorizontal = orientation === "horizontal";

  return (
    <div
      data-slot="separator-root"
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={mergeClasses(
        styles.root,
        isHorizontal ? styles.horizontal : styles.vertical,
        className,
      )}
      {...props}
    />
  );
};
