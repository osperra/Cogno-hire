"use client";
import * as React from "react";
import type { ButtonVariant, ButtonSize } from "./button-variants";
import { useButtonVariants } from "./button-variants";
import { Slot } from "./slot";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    const composedClassName = useButtonVariants({ variant, size, className });

    return (
      <Component
        ref={ref}
        data-slot="button"
        className={composedClassName}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
