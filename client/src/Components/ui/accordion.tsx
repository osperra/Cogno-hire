import * as React from "react";
import {
  Accordion as FluentAccordion,
  AccordionItem as FluentAccordionItem,
  AccordionHeader,
  AccordionPanel,
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { ChevronDown20Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  accordionRoot: {
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  item: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    ":last-child": {
      borderBottom: "none",
    },
  },
  trigger: {
    // AccordionHeader already has good defaults; tweak spacing/weight
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    textAlign: "left",
    ...shorthands.padding("12px", "0"),
  },
  contentOuter: {
    overflow: "hidden",
  },
  contentInner: {
    ...shorthands.padding("0", "0", "12px"),
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
});

/**
 * Root Accordion
 */
export function Accordion(
  props: React.ComponentProps<typeof FluentAccordion>,
) {
  const styles = useStyles();
  const { className, ...rest } = props;

  return (
    <FluentAccordion
      className={mergeClasses(styles.accordionRoot, className)}
      {...rest}
    />
  );
}

/**
 * Accordion Item
 */
export function AccordionItem(
  props: React.ComponentProps<typeof FluentAccordionItem>,
) {
  const styles = useStyles();
  const { className, ...rest } = props;

  return (
    <FluentAccordionItem
      className={mergeClasses(styles.item, className)}
      {...rest}
    />
  );
}

/**
 * Accordion Trigger (header)
 */
export function AccordionTrigger(
  props: React.ComponentProps<typeof AccordionHeader>,
) {
  const styles = useStyles();
  const { className, children, ...rest } = props;

  return (
    <AccordionHeader
      expandIcon={<ChevronDown20Regular />}
      className={mergeClasses(styles.trigger, className)}
      {...rest}
    >
      {children}
    </AccordionHeader>
  );
}

/**
 * Accordion Content (panel)
 */
export function AccordionContent(
  props: React.ComponentProps<typeof AccordionPanel>,
) {
  const styles = useStyles();
  const { className, children, ...rest } = props;

  return (
    <div className={styles.contentOuter}>
      <AccordionPanel
        className={mergeClasses(styles.contentInner, className)}
        {...rest}
      >
        {children}
      </AccordionPanel>
    </div>
  );
}
