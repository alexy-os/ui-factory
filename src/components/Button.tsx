import * as React from "react";
import { Button as HeadlessButton, type ButtonProps as HeadlessButtonProps } from "@ui-factory/ui-headless/button";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

// Define button variants using tailwind-variants
const buttonStyles = tv({
  base: "ivir3",
  variants: {
    variant: {
      primary: "q2idm",
      secondary: "q3kuh",
      outline: "gbf2l",
      ghost: "u4m3q",
      link: "ryfbq",
      default: "q2idm",
    },
    size: {
      sm: "h3i4t",
      md: "rcdad",
      lg: "nipd0",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
}); 

// Extended Button props
interface ButtonProps extends HeadlessButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "default";
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Molecule Button component using tailwind styles
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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

export { Button, type ButtonProps };
//Button.displayName = "Button"; 