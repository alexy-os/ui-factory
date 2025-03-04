import * as React from "react";
import { twMerge } from "tailwind-merge";
import { composeRefs } from "./composeRefs";
import { slotStyle } from "./Slot.css";

// Slot component props
interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  asChild?: boolean;
}

// Main Slot component
export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  (props, forwardedRef) => {
    const { children, className, asChild = false, ...slotProps } = props;
    
    if (asChild && React.isValidElement(children)) {
      // Pass props to the child element
      return (
        <SlotClone {...slotProps} ref={forwardedRef} className={twMerge(slotStyle, className)}>
          {children}
        </SlotClone>
      );
    }

    // Fallback to a span if we're not asChild or children isn't a valid element
    return (
      <span {...slotProps} ref={forwardedRef as React.Ref<HTMLSpanElement>} className={twMerge(slotStyle, className)}>
        {children}
      </span>
    );
  }
);

Slot.displayName = "Slot";

// SlotClone component props
interface SlotCloneProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactElement;
}

// SlotClone component
const SlotClone = React.forwardRef<any, SlotCloneProps>(
  (props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childRef = getElementRef(children);
    
    // Merge props of slot and child
    const mergedProps = mergeProps(slotProps, children.props);
    
    // Compose refs
    mergedProps.ref = forwardedRef 
      ? composeRefs(forwardedRef, childRef) 
      : childRef;

    // Clone the element with merged props
    return React.cloneElement(children, mergedProps);
  }
);

SlotClone.displayName = "SlotClone";

// Helper to get ref from an element
function getElementRef(element: React.ReactElement) {
  return (element.props as { ref?: React.Ref<unknown> }).ref || (element as any).ref;
}

// Helper to merge props correctly
function mergeProps(slotProps: any, childProps: any) {
  const merged = { ...childProps };

  for (const propName in slotProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];

    // Special handling for event handlers (onXxx)
    if (propName.match(/^on[A-Z]/) && typeof slotPropValue === "function") {
      merged[propName] = childPropValue
        ? (...args: unknown[]) => {
            childPropValue(...args);
            slotPropValue(...args);
          }
        : slotPropValue;
    }
    // Special handling for style
    else if (propName === "style") {
      merged[propName] = { ...slotPropValue, ...childPropValue };
    }
    // Special handling for className
    else if (propName === "className") {
      merged[propName] = twMerge(slotPropValue, childPropValue);
    }
    // Default handling for other props
    else {
      merged[propName] = slotPropValue !== undefined ? slotPropValue : childPropValue;
    }
  }

  return merged;
} 