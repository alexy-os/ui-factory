import * as React from "react";
import { Button as HeadlessButton, type ButtonProps as HeadlessButtonProps } from "@ui-factory/ui-headless/button";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

// Define button variants using tailwind-variants
export const buttonStyles = tv({
  base: "q-o5penonr1rrfmg2ificjcrmtstc",
  variants: {
    variant: {
      primary: "q-bpbptw",
      secondary: "q-bsbstsf",
      outline: "q-bbbbibataf",
      ghost: "q-bataf",
      link: "q-utpuo4",
      default: "q-bpbptw",
    },
    size: {
      sm: "q-h8p3tx",
      md: "q-h1p4",
      lg: "q-h1p6tb",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
}); 

// Extended Button props
export interface ButtonProps extends HeadlessButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "default";
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Molecule Button component using tailwind styles
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { 
      variant = "primary", 
      size = "md", 
      className,
      children,
      asChild = false,
      ...buttonProps 
    } = props;
    
    // Generate the class name using tailwind-variants
    const variantClasses = buttonStyles({ variant, size });
    
    // Merge with any additional classNames
    const combinedClassNames = className ? twMerge(variantClasses, className) : variantClasses;
    
    return (
      <HeadlessButton
        ref={ref}
        className={combinedClassNames}
        asChild={asChild}
        ignoreBaseStyle={true}
        {...buttonProps}
      >
        {children}
      </HeadlessButton>
    );
  }
);

Button.displayName = "Button"; 