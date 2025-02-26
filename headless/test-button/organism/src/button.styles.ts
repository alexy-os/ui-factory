import { tv } from "tailwind-variants";

// Define semantic button styles
export const semanticButtonStyles = tv({
  base: "button inline-flex items-center justify-center font-medium rounded-md transition-all",
  variants: {
    variant: {
      primary: "button-primary",
      secondary: "button-secondary",
      outline: "button-outline",
      ghost: "button-ghost",
      link: "button-link",
    },
    size: {
      sm: "button-sm",
      md: "button-md",
      lg: "button-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
}); 