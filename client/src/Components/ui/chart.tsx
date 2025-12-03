"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import {
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function mergeClassNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}


const useChartStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    width: "100%",
    aspectRatio: "16 / 9", 
    fontSize: tokens.fontSizeBase100,
  },

  tooltipRoot: {
    display: "grid",
    alignItems: "flex-start",
    rowGap: tokens.spacingVerticalXXS,
    minWidth: "8rem",
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    paddingInline: tokens.spacingHorizontalS,
    paddingBlock: tokens.spacingVerticalXS,
    boxShadow: tokens.shadow16,
    fontSize: tokens.fontSizeBase100,
  },
  tooltipLabel: {
    fontWeight: tokens.fontWeightSemibold,
  },
  tooltipItems: {
    display: "grid",
    rowGap: tokens.spacingVerticalXXS,
  },
  tooltipRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "stretch",
    columnGap: tokens.spacingHorizontalS,
  },
  tooltipRowIndicatorAlignCenter: {
    alignItems: "center",
  },
  tooltipRowIndicatorAlignEnd: {
    alignItems: "flex-end",
  },
  tooltipIndicatorContainer: {
    flexShrink: 0,
    borderRadius: "2px",
  },
  tooltipIndicatorDot: {
    width: "10px",
    height: "10px",
  },
  tooltipIndicatorLine: {
    width: "4px",
    height: "16px",
  },
  tooltipIndicatorDashed: {
    width: 0,
    backgroundColor: "transparent",
    ...shorthands.border("1.5px", "dashed", "transparent"),
  },
  tooltipTextBlock: {
    display: "flex",
    flex: 1,
    justifyContent: "space-between",
    columnGap: tokens.spacingHorizontalS,
  },
  tooltipTextInner: {
    display: "grid",
    rowGap: tokens.spacingVerticalXXS,
  },
  tooltipSubLabel: {
    color: tokens.colorNeutralForeground3,
  },
  tooltipValue: {
    fontFamily: tokens.fontFamilyMonospace,
    fontWeight: tokens.fontWeightSemibold,
  },

  legendRoot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: tokens.spacingHorizontalM,
  },
  legendRootTop: {
    paddingBottom: tokens.spacingVerticalS,
  },
  legendRootBottom: {
    paddingTop: tokens.spacingVerticalS,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalXS,
  },
  legendIconWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: tokens.colorNeutralForeground3,
  },
  legendColorSwatch: {
    width: "8px",
    height: "8px",
    borderRadius: "2px",
    flexShrink: 0,
  },
});


function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const styles = useChartStyles();
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={mergeClassNames(styles.root, className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.theme || itemConfig.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;
const ChartLegend = RechartsPrimitive.Legend;


type TooltipItem = {
  dataKey?: string | number;
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
};

type ChartTooltipContentProps = React.HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
  payload?: TooltipItem[];
  label?: React.ReactNode;
  labelFormatter?: (
    label: React.ReactNode,
    payload: TooltipItem[],
  ) => React.ReactNode;
  formatter?: (
    value: number | string,
    name: string,
    item: TooltipItem,
    index: number,
    payload: TooltipItem["payload"],
  ) => React.ReactNode;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  color?: string;
  nameKey?: string;
  labelKey?: string;
};

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
  ...rest
}: ChartTooltipContentProps & {
  labelClassName?: string;
}) {
  const styles = useChartStyles();
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload || payload.length === 0) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label;

    if (labelFormatter && payload) {
      return (
        <div
          className={mergeClassNames(
            styles.tooltipLabel,
            labelClassName,
          )}
        >
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }

    return (
      <div
        className={mergeClassNames(
          styles.tooltipLabel,
          labelClassName,
        )}
      >
        {value}
      </div>
    );
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
    styles.tooltipLabel,
  ]);

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={mergeClassNames(styles.tooltipRoot, className)}
      {...rest}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className={styles.tooltipItems}>
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor =
            color || (typeof item.color === "string" ? item.color : undefined);

          const rowAlignClass =
            indicator === "dot"
              ? styles.tooltipRowIndicatorAlignCenter
              : styles.tooltipRowIndicatorAlignEnd;

          return (
            <div
              key={String(item.dataKey ?? index)}
              className={mergeClassNames(
                styles.tooltipRow,
                rowAlignClass,
              )}
            >
              {formatter && item.value !== undefined && item.name ? (
                formatter(
                  item.value,
                  item.name,
                  item,
                  index,
                  item.payload,
                )
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <span className={styles.legendIconWrapper}>
                      <itemConfig.icon />
                    </span>
                  ) : (
                    !hideIndicator && (
                      <div
                        className={mergeClassNames(
                          styles.tooltipIndicatorContainer,
                          indicator === "dot" &&
                            styles.tooltipIndicatorDot,
                          indicator === "line" &&
                            styles.tooltipIndicatorLine,
                          indicator === "dashed" &&
                            styles.tooltipIndicatorDashed,
                        )}
                        style={{
                          borderColor: indicatorColor,
                          backgroundColor:
                            indicator === "dot" || indicator === "line"
                              ? indicatorColor
                              : "transparent",
                        }}
                      />
                    )
                  )}
                  <div className={styles.tooltipTextBlock}>
                    <div className={styles.tooltipTextInner}>
                      {nestLabel ? tooltipLabel : null}
                      <span className={styles.tooltipSubLabel}>
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value !== undefined && (
                      <span className={styles.tooltipValue}>
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


type LegendItem = {
  dataKey?: string | number;
  value?: string;
  color?: string;
};

type ChartLegendContentProps = React.HTMLAttributes<HTMLDivElement> & {
  payload?: LegendItem[];
  verticalAlign?: "top" | "middle" | "bottom";
  hideIcon?: boolean;
  nameKey?: string;
};

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
  ...rest
}: ChartLegendContentProps) {
  const styles = useChartStyles();
  const { config } = useChart();

  if (!payload || payload.length === 0) {
    return null;
  }

  const rootAlignClass =
    verticalAlign === "top"
      ? styles.legendRootTop
      : styles.legendRootBottom;

  return (
    <div
      className={mergeClassNames(
        styles.legendRoot,
        rootAlignClass,
        className,
      )}
      {...rest}
    >
      {payload.map((item, index) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value ?? String(index)}
            className={styles.legendItem}
          >
            {itemConfig?.icon && !hideIcon ? (
              <span className={styles.legendIconWrapper}>
                <itemConfig.icon />
              </span>
            ) : (
              <div
                className={styles.legendColorSwatch}
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            <span>{itemConfig?.label}</span>
          </div>
        );
      })}
    </div>
  );
}


function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadObj = payload as { [k: string]: unknown; payload?: unknown };

  const payloadPayload =
    typeof payloadObj.payload === "object" && payloadObj.payload !== null
      ? (payloadObj.payload as { [k: string]: unknown })
      : undefined;

  let configLabelKey: string = key;

  if (key in payloadObj && typeof payloadObj[key] === "string") {
    configLabelKey = payloadObj[key] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === "string"
  ) {
    configLabelKey = payloadPayload[key] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  THEMES,
};
