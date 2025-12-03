"use client";

import * as React from "react";
import {
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { Person24Regular } from "@fluentui/react-icons";

const useAvatarStyles = makeStyles({
  root: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.overflow("hidden"),
    ...shorthands.borderRadius("9999px"),
    width: "40px", 
    height: "40px",
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  fallback: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    ...shorthands.borderRadius("9999px"),
    backgroundColor: tokens.colorNeutralBackground4,
    color: tokens.colorNeutralForeground3,
    fontFamily: tokens.fontFamilyBase,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
  },
});

function mergeClassNames(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

type AvatarRootProps = React.HTMLAttributes<HTMLDivElement>;

function Avatar({ className, ...props }: AvatarRootProps) {
  const styles = useAvatarStyles();

  return (
    <div
      data-slot="avatar"
      className={mergeClassNames(styles.root, className)}
      {...props}
    />
  );
}

type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

function AvatarImage({ className, ...props }: AvatarImageProps) {
  const styles = useAvatarStyles();

  return (
    <img
      data-slot="avatar-image"
      className={mergeClassNames(styles.image, className)}
      {...props}
    />
  );
}

type AvatarFallbackProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
};

function AvatarFallback({
  className,
  children,
  ...props
}: AvatarFallbackProps) {
  const styles = useAvatarStyles();

  return (
    <div
      data-slot="avatar-fallback"
      className={mergeClassNames(styles.fallback, className)}
      {...props}
    >
      {children ?? <Person24Regular />}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
