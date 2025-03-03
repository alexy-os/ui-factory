// bun generations/semantic-generations/button-shadcn-radix-cva-clsx.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

// 🚀 Analog of cn() from shadcn/ui for merging classes
const cn = (...classes) => classes.filter(Boolean).join(" ");

// Define the variants configuration separately
const buttonConfig = {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    },
    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    },
  },
  defaultVariants: {
    variant: "default" as const,
    size: "default" as const,
  },
};

// Create buttonVariants using the config
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  buttonConfig
);

// 🏗 Universal component based on shadcn/ui
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// 🛠 Generating CSS with `@apply`
const generateCSS = (variants) => {
  let css = ".button { @apply transition duration-200; }\n";

  Object.keys(variants).forEach((key) => {
    Object.keys(variants[key]).forEach((option) => {
      css += `.button-${option} { @apply ${variants[key][option]}; }\n`;
    });
  });

  return css;
};

// 🏗 Generating HTML from components
const generateHTML = (variant, size, text) => {
  const className = clsx("button", variant && `button-${variant}`, size && `button-${size}`);
  return `<button class="${className}">${text}</button>`;
};

// 📌 Displaying automatically generated CSS
console.log("🔥 Generated CSS:");
console.log(generateCSS(buttonConfig.variants));

// 📌 Displaying HTML code for buttons
console.log("🔥 Generated HTML:");
console.log(generateHTML("default", "default", "Default Button"));
console.log(generateHTML("secondary", "lg", "Large Secondary Button"));
console.log(generateHTML("outline", "sm", "Small Outline Button"));

export { Button, buttonVariants };