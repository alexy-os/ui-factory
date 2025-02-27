import * as React from "react";
import { Button as MoleculeButton, ButtonProps as MoleculeButtonProps } from "@test-button/molecule";
import { semanticButtonStyles } from "./button.styles";

// Extend the molecule button props
export interface ButtonProps extends MoleculeButtonProps {}

// Semantic Button component
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
    
    // Generate semantic class names
    const semanticClassNames = semanticButtonStyles({ variant, size });
    
    return (
      <MoleculeButton
        ref={ref}
        variant={variant}
        size={size}
        className={semanticClassNames}
        asChild={asChild}
        {...buttonProps}
      >
        {children}
      </MoleculeButton>
    );
  }
);

Button.displayName = "Button"; 