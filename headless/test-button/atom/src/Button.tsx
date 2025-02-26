import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "./Slot";
import { buttonBaseStyle } from "./Button.css";

// Button component props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

// Headless Button component
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { asChild = false, className, children, ...buttonProps } = props;
    
    // Combine classes
    const buttonClassName = twMerge(buttonBaseStyle, className);
    
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