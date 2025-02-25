import { forwardRef } from "react"
import { type ButtonProps as OriginalButtonProps } from "@/components/ui/button"

// Семантические классы для кнопок
const buttonClasses = {
  "button": "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  "button-default": "bg-primary text-primary-foreground shadow hover:bg-primary/90",
  "button-destructive": "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  "button-outline": "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
  "button-secondary": "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
  "button-ghost": "hover:bg-accent hover:text-accent-foreground",
  "button-link": "text-primary underline-offset-4 hover:underline",
  "button-md": "h-9 px-4 py-2",
  "button-sm": "h-8 rounded-md px-3 text-xs",
  "button-lg": "h-10 rounded-md px-8",
  "button-icon": "h-9 w-9"
}

export interface ButtonProps extends Omit<OriginalButtonProps, "className"> {
  semantic?: boolean
  customClass?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "md", semantic = true, customClass, ...props }, ref) => {
    // Если semantic=true, используем семантические классы
    if (semantic) {
      const classes = [
        "button",
        variant ? `button-${variant}` : "",
        size ? `button-${size}` : "",
        customClass || ""
      ].filter(Boolean).join(" ")
      
      return (
        <button
          className={classes}
          ref={ref}
          {...props}
        />
      )
    }
    
    // Иначе используем оригинальный компонент
    const { default: OriginalButton } = require("@/components/ui/button")
    return <OriginalButton ref={ref} variant={variant} size={size} className={customClass} {...props} />
  }
)
Button.displayName = "Button" 