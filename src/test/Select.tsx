import * as React from "react";
import {
  SelectRoot,
  SelectRootTrigger,
  SelectRootContent,
  SelectRootItem,
  type SelectRootProps,
  type SelectTriggerProps,
  type SelectContentProps,
  type SelectItemProps,
} from "@ui-factory/ui-headless/select";
import { tv } from "tailwind-variants";
import { twMerge } from "tailwind-merge";

const selectStyles = {
  root: tv({
    base: "relative"
  }),
  
  trigger: tv({
    base: [
      "flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2",
      "text-sm shadow-sm ring-offset-background",
      "focus:outline-none focus:ring-1 focus:ring-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
    ]
  }),
  
  content: tv({
    base: [
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
      "animate-in fade-in-80",
      "data-[side=bottom]:slide-in-from-top-2",
      "data-[side=top]:slide-in-from-bottom-2",
    ]
  }),
  
  item: tv({
    base: [
      "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "focus:bg-accent focus:text-accent-foreground",
    ]
  })
};

// Styled components
const Select = React.forwardRef<HTMLDivElement, SelectRootProps>(
  ({ className, ...props }, ref) => (
    <SelectRoot ref={ref} className={twMerge(selectStyles.root(), className)} {...props} />
  )
);

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, ...props }, ref) => (
    <SelectRootTrigger ref={ref} className={twMerge(selectStyles.trigger(), className)} {...props} />
  )
);

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, ...props }, ref) => (
    <SelectRootContent ref={ref} className={twMerge(selectStyles.content(), className)} {...props} />
  )
);

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, ...props }, ref) => (
    <SelectRootItem ref={ref} className={twMerge(selectStyles.item(), className)} {...props} />
  )
);

export { Select, SelectTrigger, SelectContent, SelectItem }; 