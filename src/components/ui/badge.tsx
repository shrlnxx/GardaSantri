import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wide transition-colors focus:outline-none select-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 text-white shadow",
        secondary: "border-transparent bg-slate-100 text-slate-800",
        destructive: "border-rose-200 bg-rose-50 text-rose-700",
        outline: "text-slate-950 border-slate-300",
        emerald: "border-emerald-300 bg-emerald-50 text-emerald-800",
        amber: "border-amber-300 bg-amber-50 text-amber-800",
        cyan: "border-cyan-300 bg-cyan-50 text-cyan-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
