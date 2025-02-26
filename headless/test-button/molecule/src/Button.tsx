import * as React from "react";
import { Button as HeadlessButton, ButtonProps as HeadlessButtonProps } from "@test-button/atom";
import { buttonStyles } from "./button.styles";

// Extended Button props
export interface ButtonProps extends HeadlessButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
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
    const classNames = buttonStyles({ variant, size, className });
    
    return (
      <HeadlessButton
        ref={ref}
        className={classNames}
        asChild={asChild}
        {...buttonProps}
      >
        {children}
      </HeadlessButton>
    );
  }
);

Button.displayName = "Button"; 