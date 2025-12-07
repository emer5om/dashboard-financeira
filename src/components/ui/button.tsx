import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "default" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
};

export function Button({ variant = "default", size = "md", className, ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    default: "bg-neutral-800 text-white hover:bg-neutral-700",
    secondary: "bg-neutral-700 text-white hover:bg-neutral-600",
    destructive: "bg-rose-600 text-white hover:bg-rose-700",
    outline: "border border-neutral-700 text-neutral-100 hover:bg-neutral-800",
    ghost: "text-neutral-300 hover:bg-neutral-800",
  } as const;
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-11 px-6 text-lg",
  } as const;
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
