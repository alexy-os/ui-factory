import * as React from "react";
import {
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
  type AvatarRootProps,
  type AvatarImageProps,
  type AvatarFallbackProps,
} from "@ui-factory/ui-headless/avatar";
import { tv } from "tailwind-variants";
import { twMerge } from "tailwind-merge";

// Styles for components
const avatarStyles = {
  root: tv({
    base: "relative flex shrink-0 overflow-hidden rounded-full",
    variants: {
      size: {
        sm: "size-6",
        md: "size-8",
        lg: "size-12",
        xl: "size-16",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }),
  
  image: tv({
    base: "aspect-square size-full object-cover",
  }),
  
  fallback: tv({
    base: "flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground",
  }),
};

// Extended interfaces
interface AvatarProps extends AvatarRootProps {
  size?: "sm" | "md" | "lg" | "xl";
}

// Components
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ size, className, ...props }, ref) => {
    const rootClass = avatarStyles.root({ size });
    return (
      <AvatarRoot
        ref={ref}
        className={twMerge(rootClass, className)}
        {...props}
      />
    );
  }
);

const AvatarImg = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => {
    return (
      <AvatarImage
        ref={ref}
        className={twMerge(avatarStyles.image(), className)}
        {...props}
      />
    );
  }
);

const AvatarPlaceholder = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => {
    return (
      <AvatarFallback
        ref={ref}
        className={twMerge(avatarStyles.fallback(), className)}
        {...props}
      />
    );
  }
);

// Setting display names
Avatar.displayName = "Avatar";
AvatarImg.displayName = "AvatarImg";
AvatarPlaceholder.displayName = "AvatarPlaceholder";

export { Avatar, AvatarImg, AvatarPlaceholder }; 