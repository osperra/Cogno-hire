"use client";

import * as React from "react";
function useTheme(): { theme?: "light" | "dark" | "system" } {
  if (typeof window === "undefined") {
    return { theme: "system" };
  }
  try {
    const isDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return { theme: isDark ? "dark" : "light" };
  } catch {
    return { theme: "system" };
  }
}

import { makeStyles, tokens } from "@fluentui/react-components";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

const useToasterStyles = makeStyles({
  root: {
    boxShadow: tokens.shadow16,
  },
});

type FluentToasterProps = ToasterProps;

const Toaster: React.FC<FluentToasterProps> = (props) => {
  const { theme = "system" } = useTheme();
  const styles = useToasterStyles();
  const { style, className, ...rest } = props;

  const mappedTheme: ToasterProps["theme"] =
    theme === "light" || theme === "dark" ? theme : "system";

  return (
    <SonnerToaster
      theme={mappedTheme}
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={
        {
          "--normal-bg": tokens.colorNeutralBackground1,
          "--normal-text": tokens.colorNeutralForeground1,
          "--normal-border": tokens.colorNeutralStroke1,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    />
  );
};

export { Toaster };
