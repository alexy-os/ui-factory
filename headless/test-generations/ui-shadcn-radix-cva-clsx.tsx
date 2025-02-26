// bun headless/test-generations/ui-shadcn-radix-cva-clsx.tsx
import * as React from "react";
import { cva } from "class-variance-authority";
import clsx from "clsx";

// Define the variant configurations once to avoid duplication
const variantConfigs = {
  button: {
    base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
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
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  },
  badge: {
    base: "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  },
  card: {
    base: "rounded-md p-4 shadow",
    variants: {
      variant: {
        default: "bg-white border border-gray-200",
        secondary: "bg-gray-100 border border-gray-300",
      },
      size: {
        sm: "max-w-sm",
        lg: "max-w-lg",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "sm"
    }
  }
};

// Universal cva map for various components
const universalVariants = {
  button: cva(
    variantConfigs.button.base,
    {
      variants: variantConfigs.button.variants,
      defaultVariants: variantConfigs.button.defaultVariants as any,
    }
  ),
  badge: cva(
    variantConfigs.badge.base,
    {
      variants: variantConfigs.badge.variants,
      defaultVariants: variantConfigs.badge.defaultVariants as any,
    }
  ),
  card: cva(
    variantConfigs.card.base,
    {
      variants: variantConfigs.card.variants,
      defaultVariants: variantConfigs.card.defaultVariants as any,
    }
  ),
};

// Define types for the variants based on the actual cva configurations
type VariantType = {
  button: {
    variant: NonNullable<Parameters<typeof universalVariants.button>[0]>["variant"];
    size: NonNullable<Parameters<typeof universalVariants.button>[0]>["size"];
  };
  badge: {
    variant: NonNullable<Parameters<typeof universalVariants.badge>[0]>["variant"];
  };
  card: {
    variant: NonNullable<Parameters<typeof universalVariants.card>[0]>["variant"];
    size: NonNullable<Parameters<typeof universalVariants.card>[0]>["size"];
  };
};

// Helper type to get variant options based on component type
type VariantOptions<T extends keyof VariantType> = VariantType[T]["variant"];

// Helper type to get size options based on component type
type SizeOptions<T extends keyof VariantType> = T extends keyof VariantType 
  ? "size" extends keyof VariantType[T] 
    ? VariantType[T]["size"] 
    : never 
  : never;

// Universal component that can render different UI components
export interface UIComponentProps<T extends keyof VariantType> extends React.HTMLAttributes<HTMLElement> {
  componentType: T;
  variant?: VariantType[T]["variant"];
  size?: T extends "button" ? VariantType["button"]["size"] : 
         T extends "card" ? VariantType["card"]["size"] : 
         undefined;
  as?: React.ElementType;
  className?: string;
}

// Map of default HTML elements for each component type
const getDefaultElementForComponent = (componentType: keyof VariantType): React.ElementType => {
  const elementMap: Record<keyof VariantType, React.ElementType> = {
    button: 'button',
    badge: 'span',
    card: 'div'
  };
  
  return elementMap[componentType] || 'div';
};

export const UIComponent = React.forwardRef<HTMLElement, UIComponentProps<keyof VariantType>>(
  <T extends keyof VariantType>({ 
    componentType, 
    variant, 
    size, 
    as, // Allow overriding the default element
    className, 
    ...props 
  }: UIComponentProps<T>, ref) => {
    // Get default element based on component type
    const defaultElement = getDefaultElementForComponent(componentType);
    // Use provided 'as' prop or fall back to default element
    const Component = as || defaultElement;
    
    const componentVariants = universalVariants[componentType];
    const classes = clsx(componentVariants({ 
      variant: variant as any, 
      size: size as any 
    }), className);
    
    // Add type="button" attribute if it's a button element
    const additionalProps = Component === 'button' ? { type: 'button', ...props } : props;
    
    return <Component ref={ref as any} className={classes} {...additionalProps} />;
  }
);

UIComponent.displayName = "UIComponent";

// Function for generating CSS with @apply for the entire variants map
const generateCSS = (variantsMap: typeof universalVariants) => {
  let css = "";
  
  // Iterate through each component type (button, badge, card)
  Object.entries(variantConfigs).forEach(([component, config]) => {
    css += `.${component} { @apply ${config.base} transition duration-200; }\n`;
    
    // Generate CSS for each variant type (variant, size, etc.)
    Object.entries(config.variants).forEach(([variantType, options]) => {
      // Generate CSS for each option in this variant type
      Object.entries(options).forEach(([optionName, classes]) => {
        css += `.${component}-${optionName} { @apply ${classes}; }\n`;
      });
    });
  });
  
  return css;
};

// Example of generating HTML for a component
const generateHTML = <T extends keyof VariantType>(
  component: T,
  variant: VariantOptions<T>,
  size: T extends "button" | "card" ? VariantType[T]["size"] : undefined,
  text: string
) => {
  const className = clsx(
    component,
    variant ? `${component}-${variant}` : "",
    size ? `${component}-${size}` : ""
  );
  
  // Use the appropriate HTML element based on component type
  const element = getDefaultElementForComponent(component);
  
  // Add type="button" for button elements
  const typeAttr = element === 'button' ? ' type="button"' : '';
  
  return `<${element}${typeAttr} class="${className}">${text}</${element}>`;
};

// Example of using CSS and HTML generation
console.log("🔥 Generated CSS:");
console.log(generateCSS(universalVariants));

console.log("🔥 Generated HTML for components:");
console.log(generateHTML("button", "default", "default", "Default Button"));
console.log(generateHTML("badge", "secondary", undefined, "Secondary Badge"));
console.log(generateHTML("card", "default", "lg", "Large Card"));

// Example of rendering in React
export default function App() {
  return (
    <div className="p-4 space-y-4">
      <UIComponent 
        componentType="button" 
        variant="default" 
        size="default"
        // as prop is now optional, will default to 'button'
      >
        Default Button
      </UIComponent>
      
      <UIComponent 
        componentType="badge" 
        variant="secondary"
        // as prop is now optional, will default to 'span'
      >
        Secondary Badge
      </UIComponent>
      
      <UIComponent 
        componentType="card" 
        variant="default" 
        size="lg"
        // as prop is now optional, will default to 'div'
      >
        Large Card
      </UIComponent>
    </div>
  );
}