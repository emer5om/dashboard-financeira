import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
    return (
        <textarea
            className={cn(
                "flex min-h-[80px] w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100",
                "placeholder:text-neutral-500",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
                "disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
}
