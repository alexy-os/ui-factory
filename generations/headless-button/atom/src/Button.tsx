import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "./Slot";
import { buttonBaseStyle } from "./Button.css";

// Button component props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  // Special props to control style inheritance
  ignoreBaseStyle?: boolean;
}

// Headless Button component
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { 
      asChild = false, 
      className, 
      children, 
      ignoreBaseStyle = false,
      ...buttonProps 
    } = props;
    
    // Combine classes - allow option to ignore base styles
    const buttonClassName = ignoreBaseStyle 
      ? className 
      : twMerge(buttonBaseStyle, className);
    
    if (asChild) {
      return (
        <Slot 
          {...buttonProps}
          className={buttonClassName}
          ref={ref as any}
          asChild={true}
        >
          {children}
        </Slot>
      );
    }
    
    return (
      <button 
        {...buttonProps}
        className={buttonClassName}
        ref={ref}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button"; 