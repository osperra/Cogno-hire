"use client";

import * as React from "react";
import {
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Label } from "../ui/label";


function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const useFormStyles = makeStyles({
  item: {
    display: "grid",
    rowGap: tokens.spacingVerticalXXS,
  },
  label: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  labelError: {
    color: tokens.colorPaletteRedForeground1,
  },
  description: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  message: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorPaletteRedForeground1,
  },
});


const Form = FormProvider;

type FormFieldContextValue = {
  name: string;
};

const FormFieldContext =
  React.createContext<FormFieldContextValue | null>(null);

type FormItemContextValue = {
  id: string;
};

const FormItemContext =
  React.createContext<FormItemContextValue | null>(null);

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>.");
  }
  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>.");
  }

  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}


const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: ControllerProps<TFieldValues, TName>,
) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name as string }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};


function FormItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const styles = useFormStyles();
  const id = React.useId().replace(/:/g, "");

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={mergeClassNames(styles.item, className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}


function FormLabel(
  { className, ...props }: React.ComponentProps<typeof Label>,
) {
  const styles = useFormStyles();
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={Boolean(error)}
      htmlFor={formItemId}
      className={mergeClassNames(
        styles.label,
        error && styles.labelError,
        className,
      )}
      {...props}
    />
  );
}


type FormControlProps = {
  className?: string;
  children: React.ReactElement;
};

function FormControl({ className, children }: FormControlProps) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  const describedBy = error
    ? `${formDescriptionId} ${formMessageId}`
    : formDescriptionId;

  if (!React.isValidElement(children)) {
    return null;
  }

  const child = children as React.ReactElement<
    React.HTMLAttributes<HTMLElement> & {
      id?: string;
      "aria-describedby"?: string;
      "aria-invalid"?: boolean;
      className?: string;
    }
  >;

  return React.cloneElement<
    React.HTMLAttributes<HTMLElement> & {
      id?: string;
      "aria-describedby"?: string;
      "aria-invalid"?: boolean;
      className?: string;
    }
  >(child, {
    ...child.props,
    id: formItemId,
    "aria-describedby": describedBy,
    "aria-invalid": Boolean(error),
    className: mergeClassNames(child.props.className, className),
  });
}


function FormDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const styles = useFormStyles();
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={mergeClassNames(styles.description, className)}
      {...props}
    />
  );
}


function FormMessage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const styles = useFormStyles();
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={mergeClassNames(styles.message, className)}
      {...props}
    >
      {body}
    </p>
  );
}
export {
  // eslint-disable-next-line react-refresh/only-export-components
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
