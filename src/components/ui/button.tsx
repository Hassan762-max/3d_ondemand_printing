import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium tracking-tight transition duration-200 disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]",
        variant === "primary" &&
          "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink-soft)]",
        variant === "secondary" &&
          "bg-[var(--accent)] text-white hover:bg-[var(--accent-bright)]",
        variant === "outline" &&
          "border border-[var(--ink)]/15 bg-transparent text-[var(--ink)] hover:border-[var(--ink)]/40 hover:bg-[var(--ink)]/[0.03]",
        variant === "ghost" &&
          "bg-transparent text-[var(--ink)] hover:bg-[var(--ink)]/[0.04]",
        size === "sm" && "h-9 px-3.5 text-sm rounded-md",
        size === "md" && "h-11 px-5 text-sm rounded-md",
        size === "lg" && "h-12 px-7 text-base rounded-lg",
        className,
      )}
      {...props}
    />
  );
}
