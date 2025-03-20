import * as React from "react";
import { 
  AvatarRoot, 
  AvatarImage, 
  AvatarFallback,
  type AvatarRootProps 
} from "@ui-factory/ui-headless/avatar";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

// Unified style object for Avatar
const avatarStyles = tv({
  base: "relative flex shrink-0 overflow-hidden rounded-full [&_img]:aspect-square [&_img]:size-full [&_img]:object-cover [&_[data-fallback]]:flex [&_[data-fallback]]:size-full [&_[data-fallback]]:items-center [&_[data-fallback]]:justify-center [&_[data-fallback]]:rounded-full [&_[data-fallback]]:bg-muted [&_[data-fallback]]:text-muted-foreground",
  variants: {
    size: {
      sm: "size-6 [&_[data-fallback]]:text-xs",
      md: "size-8 [&_[data-fallback]]:text-sm",
      lg: "size-12 [&_[data-fallback]]:text-base",
      xl: "size-16 [&_[data-fallback]]:text-lg",
    },
    variant: {
      circle: "rounded-full",
      square: "rounded-md",
    }
  },
  defaultVariants: {
    size: "md",
    variant: "circle"
  }
});

// Extended Avatar props
interface AvatarProps extends AvatarRootProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "circle" | "square";
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  className?: string;
}

// Unified Avatar component
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (props, ref) => {
    const {
      size = "md",
      variant = "circle",
      src,
      alt,
      fallback,
      className,
      asChild = false,
      ...rootProps
    } = props;

    // Generate classes using tv
    const variantClasses = avatarStyles({ size, variant });
    
    // Combine with additional classes
    const combinedClassNames = className ? twMerge(variantClasses, className) : variantClasses;

    return (
      <AvatarRoot
        ref={ref}
        asChild={asChild}
        className={combinedClassNames}
        {...rootProps}
      >
        {src && (
          <AvatarImage
            src={src}
            alt={alt || ""}
          />
        )}
        {fallback && (
          <AvatarFallback data-fallback>
            {fallback}
          </AvatarFallback>
        )}
      </AvatarRoot>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar, type AvatarProps };