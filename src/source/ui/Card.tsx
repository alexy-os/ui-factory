import * as React from "react";
import {
  CardRoot,
  CardHeader,
  CardFooter,
  CardContent,
  CardTitle,
  CardDescription,
  CardAction,
  type CardRootProps,
} from "@ui-factory/ui-headless/card";
import { tv } from "tailwind-variants";
import { twMerge } from "tailwind-merge";

const cardStyles = {
  root: tv({
    base: "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
    variants: {
      variant: {
        default: "",
        outline: "border-2",
        ghost: "border-none shadow-none",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }),
  
  header: tv({
    base: "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6"
  }),
  
  title: tv({
    base: "leading-none font-semibold"
  }),
  
  description: tv({
    base: "text-muted-foreground text-sm"
  }),
  
  action: tv({
    base: "col-start-2 row-span-2 row-start-1 self-start justify-self-end"
  }),
  
  content: tv({
    base: "px-6"
  }),
  
  footer: tv({
    base: "flex items-center px-6 [.border-t]:pt-6"
  })
};

// Extended interface for styled card
interface StyledCardProps extends CardRootProps {
  variant?: "default" | "outline" | "ghost";
}

// Styled components
const Card = React.forwardRef<HTMLDivElement, StyledCardProps>(
  ({ variant, className, ...props }, ref) => (
    <CardRoot
      ref={ref}
      className={twMerge(cardStyles.root({ variant }), className)}
      {...props}
    />
  )
);

// Other components are similar...

export {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
  CardTitle,
  CardDescription,
  CardAction,
}; 