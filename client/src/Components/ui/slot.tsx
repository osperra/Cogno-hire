import * as React from "react";

export const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }>(
  ({ children, ...props }, forwardedRef) => {
    if (!React.isValidElement(children)) {
      return null;
    }

    const child = children as React.ReactElement<{
      ref?: React.Ref<HTMLElement>;
      className?: string;
      style?: React.CSSProperties;
    }>;

    return React.cloneElement(child, {
      ...mergeProps(props, child.props),
      ref: forwardedRef ? composeRefs(forwardedRef, (child as any).ref) : (child as any).ref,
    });
  }
);

Slot.displayName = "Slot";

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
}


function mergeProps(slotProps: any, childProps: any) {
  const overrides = { ...childProps };

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];

    if (/^on[A-Z]/.test(propName)) {
      if (slotPropValue && childPropValue) {
        overrides[propName] = (...args: any[]) => {
          childPropValue(...args);
          slotPropValue(...args);
        };
      } else if (slotPropValue) {
        overrides[propName] = slotPropValue;
      }
    }
    else if (propName === "className") {
      overrides[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
    else if (propName === "style") {
      overrides[propName] = { ...slotPropValue, ...childPropValue };
    }
  }

  return { ...slotProps, ...overrides };
}
