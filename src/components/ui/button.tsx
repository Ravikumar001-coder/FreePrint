import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", asChild = false, ...props }, ref) => {
    // If asChild is used (like in the user's component), we just render its children and inject classes.
    // For a real implementation, you'd use Radix Slot, but we'll implement a simple version here.
    const Comp = asChild ? (props.children as React.ReactElement).type : "button";
    
    // Simple mock class for different variants
    let variantClass = "bg-primary text-primary-foreground hover:bg-primary/90";
    if (variant === "outline") variantClass = "border border-input hover:bg-accent hover:text-accent-foreground";
    if (variant === "secondary") variantClass = "bg-secondary text-secondary-foreground hover:bg-secondary/80";

    const baseClass = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 " + variantClass;

    if (asChild) {
      return React.cloneElement(props.children as React.ReactElement, {
        className: `${baseClass} ${className} ${(props.children as React.ReactElement).props.className || ""}`,
        ref
      });
    }

    return (
      <Comp
        className={`${baseClass} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
