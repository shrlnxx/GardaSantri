import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-xs font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 select-none",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800 shadow-md",
        destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/30",
        outline: "border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-800",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost: "hover:bg-slate-100 text-slate-700",
        link: "text-primary underline-offset-4 hover:underline",
        emerald: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/30",
        glass: "bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 shadow-sm",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-12 px-8 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
