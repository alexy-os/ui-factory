import * as React from "react";
import {
  RadioGroup,
  Radio as HeadlessRadio,
  type RadioGroupProps,
  type RadioProps,
} from "@ui-factory/ui-headless/radio";
import { tv } from "tailwind-variants";
import { twMerge } from "tailwind-merge";

const radioStyles = {
  group: tv({
    base: "flex gap-2"
  }),
  
  radio: tv({
    base: [
      "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow",
      "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
    ]
  }),
  
  wrapper: tv({
    base: [
      "flex items-center space-x-2",
      "cursor-pointer",
      "disabled:cursor-not-allowed disabled:opacity-50",
    ]
  }),
  
  label: tv({
    base: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  })
};

interface RadioItemProps extends RadioProps {
  label?: string;
}

const Radio = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, ...props }, ref) => (
    <RadioGroup ref={ref} className={twMerge(radioStyles.group(), className)} {...props} />
  )
);

const RadioItem = React.forwardRef<HTMLInputElement, RadioItemProps>(
  ({ className, label, ...props }, ref) => (
    <div className={radioStyles.wrapper()}>
      <HeadlessRadio
        ref={ref}
        className={twMerge(radioStyles.radio(), className)}
        {...props}
      />
      {label && (
        <label className={radioStyles.label()}>
          {label}
        </label>
      )}
    </div>
  )
);

export { Radio, RadioItem }; 