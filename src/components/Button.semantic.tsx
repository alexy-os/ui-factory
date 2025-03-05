import * as React from "react";
import { Button as HeadlessButton, type ButtonProps as HeadlessButtonProps } from "@ui-factory/ui-headless/button";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

// Define button variants using tailwind-variants
const buttonStyles = tv({
  base: "s-button-div-opacity-50-pointer-events-none-outline-none-ring-1-ring-ring-font-medium-gap-2-inline-flex-items-center-justify-center-rounded-md-text-sm-transition-colors",
  variants: {
    variant: {
      primary: "s-button-div-bg-primary-bg-primary-80-text-white",
      secondary: "s-button-div-bg-secondary-bg-secondary-80-text-secondary-foreground",
      outline: "s-button-div-bg-background-border-border-input-bg-accent-text-accent-foreground",
      ghost: "s-button-div-bg-accent-text-accent-foreground",
      link: "s-button-div-underline-text-primary-underline-offset-4",
      default: "s-button-div-bg-primary-bg-primary-80-text-white",
    },
    size: {
      sm: "s-button-div-h-8-px-3-text-xs",
      md: "s-button-div-h-10-px-4",
      lg: "s-button-div-h-12-px-6-text-base",
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

// Export with variant name
export { Button as ButtonSemantic };
export default Button;
