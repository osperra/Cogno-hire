"use client";

import {
  Textarea as FluentTextarea,
  type TextareaProps as FluentTextareaProps,
  makeStyles,
} from "@fluentui/react-components";

function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useTextareaStyles = makeStyles({
  root: {
    width: "100%",
  },
  textarea: {
    resize: "none",
    minHeight: "4rem",
  },
});

type TextareaProps = Omit<FluentTextareaProps, "textarea"> & {
  textareaClassName?: string;
};

function Textarea({ className, textareaClassName, ...rest }: TextareaProps) {
  const styles = useTextareaStyles();

  return (
    <FluentTextarea
      data-slot="textarea"
      className={mergeClassNames(styles.root, className)}
      textarea={{
        className: mergeClassNames(styles.textarea, textareaClassName),
      }}
      {...rest}
    />
  );
}

export { Textarea };
