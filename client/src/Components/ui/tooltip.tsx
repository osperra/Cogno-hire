"use client";

import * as React from "react";
import {
  Tooltip as FluentTooltip,
  type TooltipProps as FluentTooltipProps,
} from "@fluentui/react-components";

type TooltipSettings = {
  delay: number;
};

const TooltipSettingsContext = React.createContext<TooltipSettings>({
  delay: 0,
});

type TooltipProviderProps = {
  delayDuration?: number;
  children: React.ReactNode;
};

function TooltipProvider({
  delayDuration = 0,
  children,
}: TooltipProviderProps) {
  return (
    <TooltipSettingsContext.Provider value={{ delay: delayDuration }}>
      {children}
    </TooltipSettingsContext.Provider>
  );
}

function useTooltipSettings() {
  return React.useContext(TooltipSettingsContext);
}

type TooltipContentType = NonNullable<FluentTooltipProps["content"]>;

type TooltipInnerContextValue = {
  content: TooltipContentType;
  setContent: (node: TooltipContentType) => void;
};

const TooltipInnerContext =
  React.createContext<TooltipInnerContextValue | null>(null);

function useTooltipInnerContext(): TooltipInnerContextValue {
  const ctx = React.useContext(TooltipInnerContext);
  if (!ctx) {
    throw new Error(
      "TooltipTrigger and TooltipContent must be used within <Tooltip>."
    );
  }
  return ctx;
}

type TooltipProps = {
  children: React.ReactNode;
};

function Tooltip({ children }: TooltipProps) {
  const [content, setContent] = React.useState<TooltipContentType>("");

  const value = React.useMemo(() => ({ content, setContent }), [content]);

  return (
    <TooltipInnerContext.Provider value={value}>
      {children}
    </TooltipInnerContext.Provider>
  );
}

type TooltipTriggerProps = {
  children: React.ReactElement;
} & Omit<FluentTooltipProps, "content" | "children">;

function TooltipTrigger({
  children,
  showDelay,
  relationship = "description",
  ...rest
}: TooltipTriggerProps) {
  const { content } = useTooltipInnerContext();
  const { delay } = useTooltipSettings();

  const effectiveDelay = showDelay ?? delay;

  return (
    <FluentTooltip
      content={content}
      relationship={relationship}
      showDelay={effectiveDelay}
      {...rest}
    >
      {children}
    </FluentTooltip>
  );
}

type TooltipContentProps = {
  children: TooltipContentType;
};

function TooltipContent({ children }: TooltipContentProps) {
  const { setContent } = useTooltipInnerContext();

  React.useEffect(() => {
    setContent(children);
  }, [children, setContent]);

  return null;
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
