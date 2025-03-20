import * as React from "react";
import { Input as HeadlessInput, type InputProps as HeadlessInputProps } from "@ui-factory/ui-headless/input";
import { tv } from "tailwind-variants";
import { twMerge } from "tailwind-merge";

const inputStyles = tv({
  base: [
    // Base styles
    "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
    // Placeholder
    "placeholder:text-muted-foreground",
    // Selection
    "selection:bg-primary selection:text-primary-foreground",
    // Focus
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    // Invalid
    "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
    // Disabled
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  variants: {
    size: {
      sm: "h-8 text-sm",
      md: "h-9 text-base",
      lg: "h-10 text-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface InputProps extends HeadlessInputProps {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ size, className, ...props }, ref) => {
    return (
      <HeadlessInput
        ref={ref}
        className={twMerge(inputStyles({ size }), className)}
        {...props}
      />
    );
  }
);

export { Input, type InputProps }; 