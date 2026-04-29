import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium",
    "transition-all duration-200 cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.97]",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30",
        secondary:
          "bg-card text-foreground border border-border hover:bg-muted hover:border-primary/40",
        destructive:
          "bg-urgent/10 text-urgent border border-urgent/30 hover:bg-urgent/20 hover:border-urgent/50",
        success:
          "bg-success/10 text-success border border-success/30 hover:bg-success/20 hover:border-success/50",
        warning:
          "bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20 hover:border-warning/50",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted hover:border-primary/40 hover:text-foreground",
        ghost:
          "bg-transparent text-foreground hover:bg-muted",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm:      "h-8 rounded-md px-3 text-xs",
        lg:      "h-12 rounded-xl px-6 text-base",
        xl:      "h-14 rounded-xl px-8 text-lg",
        icon:    "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
